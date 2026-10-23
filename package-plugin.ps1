$ErrorActionPreference = 'Stop'
$aplRoot = $PSScriptRoot
$pluginRoot = Join-Path $aplRoot 'wordpress/hpz-apl-admin-preview'
$distRoot = Join-Path $aplRoot 'dist'
New-Item -ItemType Directory -Path $distRoot -Force | Out-Null
$pluginHeader = Get-Content -LiteralPath (Join-Path $pluginRoot 'hpz-apl-admin-preview.php') -Raw
$pluginVersion = [regex]::Match($pluginHeader, 'Version: ([0-9.]+)').Groups[1].Value
if (-not $pluginVersion) { throw 'Plugin version missing.' }
$zipPath = Join-Path $distRoot "hpz-apl-admin-preview-$pluginVersion.zip"
Add-Type -AssemblyName System.IO.Compression
$zipStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $pluginRoot -File -Recurse | Sort-Object FullName | ForEach-Object {
        $entryName = 'hpz-apl-admin-preview/' + [System.IO.Path]::GetRelativePath($pluginRoot, $_.FullName).Replace('\', '/')
        $entry = $archive.CreateEntry($entryName)
        $entryStream = $entry.Open()
        $sourceStream = [System.IO.File]::OpenRead($_.FullName)
        try { $sourceStream.CopyTo($entryStream) } finally { $sourceStream.Dispose(); $entryStream.Dispose() }
    }
} finally { $archive.Dispose(); $zipStream.Dispose() }
Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
