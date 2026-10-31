# Local release AAB on Windows (Gradle). Use a short path — Ninja hits MAX_PATH under long project dirs.
# One-time: cmd /c mklink /J C:\tc "<full path to this coustmer folder>"
$ErrorActionPreference = "Stop"
$ProjectRoot = if (Test-Path "C:\tc\package.json") { "C:\tc" } else { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }
if ($ProjectRoot -ne "C:\tc") {
  Write-Warning "Build from C:\tc junction recommended. Example: mklink /J C:\tc `"$((Get-Item (Join-Path $PSScriptRoot '..')).FullName)`""
  $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}
$env:ANDROID_HOME = $env:ANDROID_HOME ?? "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = $env:JAVA_HOME ?? "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:GRADLE_USER_HOME = "C:\gcache"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
if (-not $env:EXPO_PUBLIC_API_URL) { $env:EXPO_PUBLIC_API_URL = "https://api.tokajofoods.com" }
$android = Join-Path $ProjectRoot "android"
Push-Location $android
try {
  .\gradlew.bat bundleRelease --no-daemon -g C:\gcache
  $aab = Join-Path $android "app\build\outputs\bundle\release\app-release.aab"
  $dist = Join-Path $ProjectRoot "dist"
  New-Item -ItemType Directory -Force -Path $dist | Out-Null
  Copy-Item -Force $aab (Join-Path $dist "tokajo-customer-release.aab")
  Write-Host "AAB:" (Join-Path $dist "tokajo-customer-release.aab")
} finally {
  Pop-Location
}
