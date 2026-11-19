---
description: Spustí místní produkční náhled faakt.io na portu 4173.
---

V kořeni aktuálního checkoutu faakt.io spusť:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-local.ps1 prod

Použij aktuální větev včetně rozpracovaných souborů. Skript uvolní cílový port, spustí server na pozadí a ověří HTTP odpověď. Po úspěchu předej vypsané Local a LAN URL a server ponech běžet. Při chybě zkontroluj výstup skriptu a logy v .local-preview.
