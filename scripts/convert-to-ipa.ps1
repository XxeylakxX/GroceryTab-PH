<#
.SYNOPSIS
  Converts an EAS Build unsigned iOS .tar.gz archive into an installable .ipa for Sideloadly or TrollStore.
.EXAMPLE
  .\scripts\convert-to-ipa.ps1 -ArchiveFile ".\build-12345.tar.gz" -OutputIpaName "GroceryTabPH.ipa"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false, Position = 0)]
  [string]$ArchiveFile,

  [Parameter(Mandatory = $false, Position = 1)]
  [string]$OutputIpaName = "GroceryTabPH.ipa"
)

$ErrorActionPreference = "Stop"

# Auto-detect .tar.gz if not provided
if (-not $ArchiveFile) {
  $candidate = Get-ChildItem -Filter "*.tar.gz" | Select-Object -First 1
  if ($candidate) {
    $ArchiveFile = $candidate.FullName
    Write-Host "Auto-detected archive: $ArchiveFile" -ForegroundColor Cyan
  } else {
    Write-Error "No .tar.gz archive found. Please pass -ArchiveFile path\to\archive.tar.gz"
    exit 1
  }
}

$workDir = Join-Path $PSScriptRoot "temp_ipa_build"
if (Test-Path $workDir) {
  Remove-Item -Recurse -Force $workDir
}
New-Item -ItemType Directory -Path $workDir | Out-Null

Write-Host "==> Step 1: Extracting archive ($ArchiveFile)..." -ForegroundColor Yellow
tar -xzf $ArchiveFile -C $workDir

# Locate the .app bundle
$appBundle = Get-ChildItem -Path $workDir -Recurse -Directory -Filter "*.app" | Select-Object -First 1
if (-not $appBundle) {
  Write-Error "Failed to locate .app bundle inside extracted archive."
  exit 1
}

Write-Host "Found native app bundle: $($appBundle.Name)" -ForegroundColor Green

# Create Payload structure
$payloadDir = Join-Path $workDir "Payload"
New-Item -ItemType Directory -Path $payloadDir | Out-Null

Write-Host "==> Step 2: Packaging into Payload directory..." -ForegroundColor Yellow
Copy-Item -Path $appBundle.FullName -Destination $payloadDir -Recurse -Force

# Create ZIP archive
$tempZip = Join-Path (Get-Location) "temp_payload.zip"
if (Test-Path $tempZip) { Remove-Item -Force $tempZip }

Write-Host "==> Step 3: Compressing Payload into ZIP..." -ForegroundColor Yellow
Set-Location $workDir
Compress-Archive -Path "Payload" -DestinationPath $tempZip -Force
Set-Location $PSScriptRoot\..

# Rename to .ipa
$finalIpa = Join-Path (Get-Location) $OutputIpaName
if (Test-Path $finalIpa) { Remove-Item -Force $finalIpa }
Move-Item -Path $tempZip -Destination $finalIpa -Force

# Clean up temporary build artifacts
Remove-Item -Recurse -Force $workDir

Write-Host "==> Step 4: Sanity checking generated .ipa structure..." -ForegroundColor Yellow
$zipContent = tar -tf $finalIpa
$hasPayloadApp = $zipContent | Where-Object { $_ -match "^Payload/[^/]+\.app/$" }
$hasInfoPlist = $zipContent | Where-Object { $_ -match "Payload/[^/]+\.app/Info\.plist" }

if ($hasPayloadApp -and $hasInfoPlist) {
  Write-Host "[SUCCESS] .ipa created successfully: $finalIpa" -ForegroundColor Green
  Write-Host "          Internal structure verified: Payload/ -> $($appBundle.Name) -> Info.plist" -ForegroundColor Cyan
  Write-Host "          Ready to drop directly into Sideloadly or TrollStore!" -ForegroundColor Green
} else {
  Write-Warning ".ipa was generated, but failed verification check. Please check contents."
}
