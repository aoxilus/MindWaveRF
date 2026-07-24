# Free MindWave COM + restart ThinkGear Connector
# Usage: powershell -ExecutionPolicy Bypass -File sandbox/reset-tgc.ps1

$ErrorActionPreference = 'SilentlyContinue'

Write-Host 'Closing serial/tgc bridges...'
Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'serial-bridge|tgc-bridge|rf-probe' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

Write-Host 'Closing ThinkGear Connector...'
Get-Process | Where-Object { $_.ProcessName -match 'ThinkGear' } | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host 'Dongle ports:'
Get-PnpDevice -Class Ports -ErrorAction SilentlyContinue |
  Where-Object { $_.FriendlyName -match 'CH340|MindWave' } |
  Format-Table Status, FriendlyName, Problem -AutoSize

$exe = Join-Path $PSScriptRoot '..\tools\Windows-Developer-Tools-3.2\Windows Developer Tools 3.2\ThinkGear_Connector\ThinkGear_Connector\ThinkGear Connector.exe'
if (-not (Test-Path $exe)) {
  Write-Host "MISSING: $exe"
  exit 1
}

Start-Process $exe
Write-Host 'TGC launched. Pick the OK CH340 COM, then Retry.'
