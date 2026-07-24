# MindWave RF dongle probe sandbox (self-contained)
# Usage: powershell -ExecutionPolicy Bypass -File sandbox/rf-probe.ps1 [COMx]

param([string]$PortName = '')

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Ports
$log = Join-Path $PSScriptRoot 'last-probe.log'
function Out-Log([string]$s) {
  Write-Host $s
  Add-Content -Path $log -Value $s
}

'' | Set-Content $log -Encoding utf8
Out-Log "=== MindWave RF probe $(Get-Date -Format o) ==="

# Prefer live 1A86:7523
$ports = [System.IO.Ports.SerialPort]::GetPortNames()
Out-Log ("PORTS: " + ($ports -join ', '))
$pnps = Get-PnpDevice -Class Ports -ErrorAction SilentlyContinue |
  Where-Object { $_.FriendlyName -match 'CH340|MindWave' -or $_.InstanceId -match 'VID_1A86&PID_7523' }
foreach ($d in $pnps) {
  Out-Log ("PNP: $($d.Status) $($d.FriendlyName) $($d.Problem)")
}

if (-not $PortName) {
  $live = $pnps | Where-Object { $_.Status -eq 'OK' -and $_.FriendlyName -match 'COM(\d+)' } | Select-Object -First 1
  if ($live -and $live.FriendlyName -match 'COM(\d+)') { $PortName = "COM$($Matches[1])" }
}
if (-not $PortName) {
  Out-Log 'NO LIVE DONGLE PORT'
  exit 2
}
Out-Log "TARGET $PortName"

function Invoke-Case {
  param(
    [string]$Label,
    [int]$Baud,
    [scriptblock]$Sequence,
    [int]$ListenMs = 12000
  )
  Out-Log ""
  Out-Log "=== $Label @ $PortName $Baud ==="
  $sp = [System.IO.Ports.SerialPort]::new($PortName, $Baud)
  $sp.ReadTimeout = 200
  $sp.WriteTimeout = 2000
  $sp.DtrEnable = $false
  $sp.RtsEnable = $false
  try {
    $sp.Open()
  } catch {
    Out-Log ("OPEN FAIL: " + $_.Exception.Message)
    return [pscustomobject]@{ Label = $Label; Ok = $false; Bytes = 0; Aa = 0; Sync = $false; Err = $_.Exception.Message }
  }

  $buf = New-Object System.Collections.Generic.List[byte]
  try {
    & $Sequence $sp
    $deadline = [DateTime]::UtcNow.AddMilliseconds($ListenMs)
    while ([DateTime]::UtcNow -lt $deadline) {
      try {
        $n = $sp.BytesToRead
        if ($n -gt 0) {
          $tmp = New-Object byte[] $n
          [void]$sp.Read($tmp, 0, $n)
          foreach ($b in $tmp) { $buf.Add($b) }
        } else {
          Start-Sleep -Milliseconds 50
        }
      } catch {
        Start-Sleep -Milliseconds 50
      }
    }
  } finally {
    $sp.Close()
    $sp.Dispose()
  }

  $arr = $buf.ToArray()
  $aa = @($arr | Where-Object { $_ -eq 0xAA }).Count
  $sync = $false
  for ($i = 0; $i -lt $arr.Length - 1; $i++) {
    if ($arr[$i] -eq 0xAA -and $arr[$i + 1] -eq 0xAA) { $sync = $true; break }
  }
  $head = ($arr[0..([Math]::Min(47, $arr.Length - 1))] | ForEach-Object { $_.ToString('x2') }) -join ''
  Out-Log ("bytes=$($arr.Length) aa=$aa sync=$sync head=$head")
  return [pscustomobject]@{ Label = $Label; Ok = $true; Bytes = $arr.Length; Aa = $aa; Sync = $sync; Err = $null }
}

$results = @()

$results += Invoke-Case 'A: pulse + C1 + C2' 57600 {
  param($sp)
  $sp.DtrEnable = $false; $sp.RtsEnable = $false; Start-Sleep -Milliseconds 200
  $sp.DtrEnable = $true; $sp.RtsEnable = $true; Start-Sleep -Milliseconds 300
  $sp.Write([byte[]]@(0xC1), 0, 1); Start-Sleep -Milliseconds 400
  $sp.Write([byte[]]@(0xC2), 0, 1)
}

$results += Invoke-Case 'B: DTR/RTS on + C2' 57600 {
  param($sp)
  $sp.DtrEnable = $true; $sp.RtsEnable = $true; Start-Sleep -Milliseconds 200
  $sp.Write([byte[]]@(0xC2), 0, 1)
}

$results += Invoke-Case 'C: C0 FFFF + C2' 57600 {
  param($sp)
  $sp.DtrEnable = $false; $sp.RtsEnable = $false; Start-Sleep -Milliseconds 200
  $sp.DtrEnable = $true; $sp.RtsEnable = $true; Start-Sleep -Milliseconds 300
  $sp.Write([byte[]]@(0xC1), 0, 1); Start-Sleep -Milliseconds 300
  $sp.Write([byte[]]@(0xC0, 0xFF, 0xFF), 0, 3); Start-Sleep -Milliseconds 300
  $sp.Write([byte[]]@(0xC2), 0, 1)
}

$results += Invoke-Case 'D: 115200 pulse + C2' 115200 {
  param($sp)
  $sp.DtrEnable = $false; $sp.RtsEnable = $false; Start-Sleep -Milliseconds 200
  $sp.DtrEnable = $true; $sp.RtsEnable = $true; Start-Sleep -Milliseconds 300
  $sp.Write([byte[]]@(0xC1), 0, 1); Start-Sleep -Milliseconds 400
  $sp.Write([byte[]]@(0xC2), 0, 1)
}

$results += Invoke-Case 'E: C2 x5' 57600 {
  param($sp)
  $sp.DtrEnable = $false; $sp.RtsEnable = $false; Start-Sleep -Milliseconds 200
  $sp.DtrEnable = $true; $sp.RtsEnable = $true; Start-Sleep -Milliseconds 300
  for ($i = 0; $i -lt 5; $i++) {
    $sp.Write([byte[]]@(0xC1), 0, 1); Start-Sleep -Milliseconds 200
    $sp.Write([byte[]]@(0xC2), 0, 1); Start-Sleep -Milliseconds 1500
  }
} -ListenMs 3000

Out-Log ''
Out-Log '=== SUMMARY ==='
$any = $false
foreach ($r in $results) {
  if (-not $r.Ok) { Out-Log "$($r.Label): FAIL $($r.Err)"; continue }
  Out-Log "$($r.Label): bytes=$($r.Bytes) aa=$($r.Aa) sync=$($r.Sync)"
  if ($r.Sync) { $any = $true }
}
if ($any) { Out-Log 'RESULT: ThinkGear sync YES'; exit 0 }
Out-Log 'RESULT: ThinkGear sync NO'
exit 1
