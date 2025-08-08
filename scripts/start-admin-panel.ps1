# TINI Admin Panel PowerShell Launcher
# Khởi động admin dashboard server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    TINI Admin Panel Launcher" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting admin dashboard server..." -ForegroundColor Yellow
Write-Host ""

# Chuyển đến thư mục script
Set-Location $PSScriptRoot

# Khởi động server
try {
    node admin-dashboard-server.js
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure Node.js is installed and accessible." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
