# Replaces the broad "python.exe" firewall rules Windows creates on first run
# (any port, any address, Public profile) with ONE narrow rule for the CocoScan API:
# TCP 8000, local subnet only, Private networks only.
#
# Run from any PowerShell (it re-launches itself as Administrator):
#   powershell -ExecutionPolicy Bypass -File backend\scripts\firewall-cocoscan-api.ps1

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
           ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Requesting administrator rights (UAC prompt)..."
    Start-Process powershell -Verb RunAs -ArgumentList @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`""
    )
    exit
}

$python = Join-Path $env:LOCALAPPDATA 'Programs\Python\Python312\python.exe'
if (-not (Test-Path $python)) {
    Write-Host "Python not found at $python" -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

Write-Host "Removing broad python.exe rules..."
$broad = Get-NetFirewallRule -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -eq 'python.exe' }
if ($broad) { $broad | Remove-NetFirewallRule; Write-Host "  removed $($broad.Count) rule(s)" } else { Write-Host "  none found" }

Write-Host "Creating narrow CocoScan API rule..."
Get-NetFirewallRule -DisplayName 'CocoScan API (port 8000, LAN only)' -ErrorAction SilentlyContinue | Remove-NetFirewallRule
New-NetFirewallRule -DisplayName 'CocoScan API (port 8000, LAN only)' `
    -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 `
    -RemoteAddress LocalSubnet -Profile Private -Program $python | Out-Null

Write-Host ""
Write-Host "Current rules for python:" -ForegroundColor Green
Get-NetFirewallRule | Where-Object { $_.DisplayName -like '*python*' -or $_.DisplayName -like '*CocoScan*' } |
    ForEach-Object {
        $p = $_ | Get-NetFirewallPortFilter
        $a = $_ | Get-NetFirewallAddressFilter
        '  {0} | {1} | {2} | port {3} | from {4}' -f $_.DisplayName, $_.Profile, $_.Action, $p.LocalPort, $a.RemoteAddress
    }
Write-Host ""
Write-Host "Wi-Fi profile (must be Private for the phone to reach this PC):"
Get-NetConnectionProfile | ForEach-Object { '  {0} -> {1}' -f $_.Name, $_.NetworkCategory }
Write-Host ""
Read-Host "Done. Press Enter to close"
