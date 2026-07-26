# Install Bloom CLI from the latest GitHub Release (Windows PowerShell).
# Usage:
#   irm https://bloom-web-amber.vercel.app/install.ps1 | iex
$ErrorActionPreference = "Stop"

$Repo = "Prince-695/bloom"
$InstallDir = if ($env:BLOOM_INSTALL_DIR) { $env:BLOOM_INSTALL_DIR } else {
  Join-Path $env:USERPROFILE ".local\bin"
}

function Get-AssetName {
  $arch = $env:PROCESSOR_ARCHITECTURE
  switch -Regex ($arch) {
    "AMD64|x86_64" { return "bloom-windows-x64.exe" }
    "ARM64" {
      throw "Windows ARM64 builds are not published yet. Use an x64 machine, or WSL."
    }
    default {
      throw "Unsupported architecture: $arch"
    }
  }
}

$Asset = Get-AssetName
$BinName = "bloom.exe"
$ReleaseApi = "https://api.github.com/repos/$Repo/releases/latest"

Write-Host "Fetching latest Bloom CLI release…"
$Release = Invoke-RestMethod -Uri $ReleaseApi -Headers @{ "User-Agent" = "bloom-install" }
$AssetObj = $Release.assets | Where-Object { $_.name -eq $Asset } | Select-Object -First 1

if (-not $AssetObj) {
  throw "Could not find asset '$Asset' in release $($Release.tag_name)."
}

$Tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("bloom-install-" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $Tmp | Out-Null
try {
  $DownloadPath = Join-Path $Tmp $BinName
  Write-Host "Downloading $Asset…"
  Invoke-WebRequest -Uri $AssetObj.browser_download_url -OutFile $DownloadPath

  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  $Dest = Join-Path $InstallDir $BinName
  Copy-Item -Force $DownloadPath $Dest

  Write-Host "Installed Bloom CLI → $Dest" -ForegroundColor Green

  $pathEntries = $env:PATH -split ";"
  if ($pathEntries -notcontains $InstallDir) {
    Write-Host ""
    Write-Host "Add $InstallDir to your PATH, then reopen the terminal:" -ForegroundColor DarkGray
    Write-Host "  setx PATH `"$env:PATH;$InstallDir`""
  }

  Write-Host ""
  Write-Host "Next steps:"
  Write-Host "  bloom"
  Write-Host "  /login"
  Write-Host ""
  Write-Host "Override API endpoints if needed:" -ForegroundColor DarkGray
  Write-Host "  `$env:API_URL='https://…'; `$env:APP_URL='https://…'; bloom" -ForegroundColor DarkGray
}
finally {
  Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
