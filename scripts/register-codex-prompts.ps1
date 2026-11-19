$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$codexRoot = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$destination = Join-Path $codexRoot 'prompts'
$encoding = [Text.UTF8Encoding]::new($false)
$marker = '<!-- faakt.io prompt launcher -->'

$launchers = foreach ($prompt in Get-ChildItem -File (Join-Path $repoRoot 'prompts') -Filter '*.md') {
    $metadata = [regex]::Match((Get-Content -Raw -Encoding UTF8 $prompt.FullName), '\A---\r?\n(description: [^\r\n]+(?:\r?\nargument-hint: [^\r\n]+)?)\r?\n---')
    if (-not $metadata.Success) {
        throw "Missing custom prompt metadata in $($prompt.Name)"
    }

    $target = Join-Path $destination $prompt.Name
    if ((Test-Path -LiteralPath $target) -and -not (Select-String -LiteralPath $target -SimpleMatch $marker -Quiet)) {
        throw "A personal prompt already exists at $target"
    }

    $body = @"
---
$($metadata.Groups[1].Value)
---

$marker
Use the current workspace. Verify that its Git root is a faakt.io checkout by checking the name in its package.json and that prompts/$($prompt.Name) exists. If either check fails, tell the user to open the faakt.io checkout and stop. Otherwise read prompts/$($prompt.Name) from that checkout and follow its instructions.
"@
    if ($metadata.Groups[1].Value -match '(?m)^argument-hint:') {
        $body += "`n" + 'Use the following text as the user-supplied arguments: $ARGUMENTS'
    }
    [pscustomobject]@{ Path = $target; Body = $body }
}

New-Item -ItemType Directory -Force -Path $destination | Out-Null
foreach ($launcher in $launchers) {
    [IO.File]::WriteAllText($launcher.Path, $launcher.Body + "`n", $encoding)
    Write-Output "/prompts:$([IO.Path]::GetFileNameWithoutExtension($launcher.Path))"
}
