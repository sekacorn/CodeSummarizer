param(
    [switch]$SkipChecks,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repo

$package = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $package.version
$artifacts = Join-Path $repo "artifacts"
$staging = Join-Path $repo "release-staging"

if (-not $SkipChecks) {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }
    npm run verify
    if ($LASTEXITCODE -ne 0) { throw "verification failed with exit code $LASTEXITCODE" }
}

if (-not $SkipBuild) {
    npm run tauri -- build --bundles nsis,msi
    if ($LASTEXITCODE -ne 0) { throw "Tauri build failed with exit code $LASTEXITCODE" }
}

if (Test-Path -LiteralPath $artifacts) { Remove-Item -LiteralPath $artifacts -Recurse -Force }
if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force }
New-Item -ItemType Directory -Path $artifacts, $staging | Out-Null

$releaseDir = Join-Path $repo "src-tauri\target\release"
$appExe = @(
    (Join-Path $releaseDir "Code Summarizer.exe"),
    (Join-Path $releaseDir "code-summarizer.exe")
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $appExe) { throw "Release executable not found in $releaseDir" }

$portableDir = Join-Path $staging "CodeSummarizer-$version-windows-x64-portable"
New-Item -ItemType Directory -Path $portableDir | Out-Null
Copy-Item -LiteralPath $appExe -Destination (Join-Path $portableDir "Code Summarizer.exe")
Copy-Item -LiteralPath "LICENSE", "PORTABLE.md" -Destination $portableDir
Compress-Archive -Path (Join-Path $portableDir "*") -DestinationPath (Join-Path $artifacts "CodeSummarizer-$version-windows-x64-portable.zip") -CompressionLevel Optimal

Get-ChildItem -Path (Join-Path $releaseDir "bundle") -Recurse -File |
    Where-Object { $_.Extension -in ".msi", ".exe" } |
    ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $artifacts }

$releaseFiles = Get-ChildItem -LiteralPath $artifacts -File | Sort-Object Name
$checksumLines = foreach ($file in $releaseFiles) {
    $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $($file.Name)"
}
$checksumPath = Join-Path $artifacts "SHA256SUMS.txt"
[System.IO.File]::WriteAllLines($checksumPath, $checksumLines, (New-Object System.Text.UTF8Encoding($false)))

Remove-Item -LiteralPath $staging -Recurse -Force
Write-Host "Windows release artifacts created in $artifacts"
Get-ChildItem -LiteralPath $artifacts -File | Select-Object Name, Length
