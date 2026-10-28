@echo off
rem Double-click me. Opens the Windows firewall for the CocoScan API (TCP 8000, home Wi-Fi only).
rem Windows will show a blue "User Account Control" prompt - click Yes.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0firewall-cocoscan-api.ps1"
