# Both local modes use the working tree and the dependency lockfile.
[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('dev', 'prod')][string]$Mode)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)

$nodeExe = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
$nodeVersion = if ($nodeExe) { & $nodeExe --version }
if (!$nodeVersion -or [version]$nodeVersion.TrimStart('v') -lt [version]'22.0.0') {
    $nodeExe = Join-Path $env:LOCALAPPDATA 'faakt-tools/node-v22.22.0-win-x64/node.exe'
    $nodeVersion = if (Test-Path -LiteralPath $nodeExe) { & $nodeExe --version }
}
if (!$nodeVersion -or [version]$nodeVersion.TrimStart('v') -lt [version]'22.0.0') {
    throw 'Node.js 22+ is required. Add a current Node.js installation to PATH.'
}
$nodeDir = Split-Path -Parent $nodeExe
$env:Path = "$nodeDir;$env:Path"

$port = 5173
$viteCommand = 'dev'
$env:FAAKT_KIT_OUT_DIR = '.svelte-kit'
$env:BUILD_DIR = 'build'
if ($Mode -eq 'prod') {
    $port = 4173
    $viteCommand = 'preview'
    $env:FAAKT_KIT_OUT_DIR = '.local-preview/prod-kit'
    $env:BUILD_DIR = '.local-preview/prod-build'
}

$logDir = New-Item -ItemType Directory -Force '.local-preview'
$stdout = Join-Path $logDir.FullName "$Mode.stdout.log"
$stderr = Join-Path $logDir.FullName "$Mode.stderr.log"
$vite = 'node_modules/vite/bin/vite.js'
$localhostUrl = "http://localhost:${port}/faakt.io/"

function Get-PortOwners {
    # Include listeners on either address family, but never client connections.
    netstat.exe -ano | ForEach-Object {
        if ($_ -match "^\s*TCP\s+\S+:${port}\s+\S+:0\s+\S+\s+(\d+)\s*$") {
            [int]$Matches[1]
        }
    } | Sort-Object -Unique
}

# Serialize restarts and lockfile installation in this checkout.
$checkoutHash = [Convert]::ToBase64String(
    [Text.Encoding]::UTF8.GetBytes((Get-Location).Path.ToUpperInvariant()))
$mutex = New-Object System.Threading.Mutex($false, "faakt-build-$checkoutHash")
$locked = $false
try {
    try { $locked = $mutex.WaitOne([TimeSpan]::FromMinutes(10)) }
    catch [System.Threading.AbandonedMutexException] { $locked = $true }
    if (!$locked) { throw 'Another local build is still running.' }

    foreach ($owner in Get-PortOwners) {
        Write-Host "Stopping PID $owner on port $port"
        Stop-Process -Id $owner -Force
    }
    $deadline = [DateTime]::UtcNow.AddSeconds(10)
    while (Get-PortOwners) {
        if ([DateTime]::UtcNow -ge $deadline) { throw "Port $port is still occupied." }
        Start-Sleep -Milliseconds 250
    }

    $marker = 'node_modules/.faakt-local-build-lock'
    $fingerprint = "$nodeVersion $((Get-FileHash package-lock.json).Hash)"
    if (!(Test-Path -LiteralPath $marker) -or (Get-Content -LiteralPath $marker) -ne $fingerprint -or
        !(Test-Path -LiteralPath $vite)) {
        & npm.cmd ci --include=dev --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
        Set-Content -LiteralPath $marker -Value $fingerprint
    }

    if ($Mode -eq 'prod') {
        & $nodeExe $vite build
        if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
    }

    $server = Start-Process -FilePath $nodeExe -ArgumentList @(
        $vite, $viteCommand, '--host', '0.0.0.0', '--port', $port, '--strictPort'
    ) -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput $stdout -RedirectStandardError $stderr

    try {
        $deadline = [DateTime]::UtcNow.AddMinutes(5)
        do {
            if ($server.HasExited) { throw "Vite exited with code $($server.ExitCode)." }
            if ($server.Id -in @(Get-PortOwners)) {
                try {
                    $response = Invoke-WebRequest -Uri $localhostUrl -UseBasicParsing -TimeoutSec 20
                    if ($response.StatusCode -eq 200) { break }
                } catch {
                    $response = $null
                }
            }
            Start-Sleep -Milliseconds 500
        } while ([DateTime]::UtcNow -lt $deadline)
        if ($response.StatusCode -ne 200) { throw 'The app did not return HTTP 200.' }
    } catch {
        if (!$server.HasExited) { Stop-Process -InputObject $server -Force }
        throw "$($_.Exception.Message) See $stdout and $stderr"
    }

    $branch = git branch --show-current
    if (!$branch) { $branch = git rev-parse --short HEAD }
    Write-Output "Branch: $branch"
    Write-Output "Local: $localhostUrl"
    $addresses = [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
        Where-Object { $_.OperationalStatus -eq 'Up' -and $_.NetworkInterfaceType -ne 'Loopback' } |
        ForEach-Object { $_.GetIPProperties().UnicastAddresses } |
        Where-Object { $_.Address.AddressFamily -eq 'InterNetwork' -and $_.Address.ToString() -notlike '169.254.*' } |
        ForEach-Object { $_.Address.ToString() } | Sort-Object -Unique
    foreach ($address in $addresses) { Write-Output "LAN: http://${address}:${port}/faakt.io/" }
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
