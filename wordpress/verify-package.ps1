$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$pluginRoot = Join-Path $PSScriptRoot 'hpz-apl-admin-preview'
$versionText = Get-Content -LiteralPath (Join-Path $pluginRoot 'hpz-apl-admin-preview.php') -Raw
$version = [regex]::Match($versionText, 'Version: ([0-9.]+)').Groups[1].Value
if (-not $version) { throw 'Plugin-Version fehlt.' }
$zipPath = Join-Path $projectRoot "dist/hpz-apl-admin-preview-$version.zip"
$files = @(Get-ChildItem -LiteralPath $pluginRoot -File -Recurse)
Add-Type -AssemblyName System.IO.Compression
$stream = [System.IO.File]::OpenRead($zipPath)
$archive = [System.IO.Compression.ZipArchive]::new($stream,[System.IO.Compression.ZipArchiveMode]::Read)
$hash = [System.Security.Cryptography.SHA256]::Create()
try {
    $entries = @($archive.Entries | Where-Object { $_.Name })
    if ($entries.Count -ne $files.Count) { throw "Einträge: ZIP $($entries.Count), Quelle $($files.Count)." }
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($pluginRoot.Length).TrimStart('\','/')
        $entryName = 'hpz-apl-admin-preview/' + $relative.Replace('\','/')
        $entry = $archive.GetEntry($entryName)
        if (-not $entry) { throw "Fehlende Datei: $entryName" }
        $entryStream = $entry.Open()
        try { $inside = -join ($hash.ComputeHash($entryStream) | ForEach-Object { $_.ToString('X2') }) } finally { $entryStream.Dispose() }
        $source = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        if ($inside -ne $source) { throw "Abweichende Datei: $entryName" }
    }
    foreach ($required in @('assets/kuechenstudio-060.css','assets/core/customer-measures.js','KUECHENSTUDIO-0.6.0.md')) {
        if (-not $archive.GetEntry('hpz-apl-admin-preview/'+$required)) { throw "Pflichtdatei fehlt: $required" }
    }
    Write-Output "PASS ZIP $version`: $($entries.Count) Dateien bytegleich; neue CSS-/cm-Assets und Dokumentation enthalten."
    Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
} finally { $hash.Dispose(); $archive.Dispose(); $stream.Dispose() }
