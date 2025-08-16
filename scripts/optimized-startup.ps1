# TINI Optimized Server Startup
# Starts only essential 6 servers instead of 26 processes

Write-Host "🚀 TINI Optimized Server Startup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Wait a moment for cleanup
Start-Sleep -Seconds 2

Write-Host "`n1. Starting Admin Panel Server (Port 55057)..." -ForegroundColor Green
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "admin-panel/server.js"

Write-Host "2. Starting API Server (Port 5001)..." -ForegroundColor Green  
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "core/api-server.js"

Write-Host "3. Starting Gateway Server (Port 8099)..." -ForegroundColor Green
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "scripts/start-gateway.js"

Write-Host "4. Starting Dashboard Server (Port 3004)..." -ForegroundColor Green
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "core/admin-dashboard-server.js"

Write-Host "5. Starting Security Server (Port 6906)..." -ForegroundColor Green
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "SECURITY/SECURITY.js"

Write-Host "6. Starting Performance Monitor..." -ForegroundColor Green
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "scripts/lightweight-monitor.js"

# Wait for servers to start
Write-Host "`nWaiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check results
$ProcessCount = (Get-Process -Name "node" -ErrorAction SilentlyContinue).Count
$TotalMemory = if ($ProcessCount -gt 0) { 
    [math]::Round(((Get-Process -Name "node" | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB), 2) 
} else { 0 }

Write-Host "`n✅ OPTIMIZATION RESULTS:" -ForegroundColor Green
Write-Host "• Node.js Processes: $ProcessCount (was 26)" -ForegroundColor White
Write-Host "• Total Memory Usage: $TotalMemory MB (was 1,210 MB)" -ForegroundColor White

if ($ProcessCount -le 6) {
    $Savings = [math]::Round(((1210 - $TotalMemory) / 1210) * 100, 1)
    Write-Host "• Memory Savings: $Savings%" -ForegroundColor Green
    Write-Host "`n🎉 SUCCESS! System optimized!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ More processes than expected. Check for issues." -ForegroundColor Yellow
}

Write-Host "`nChecking server status..." -ForegroundColor Cyan
$Ports = @(55057, 8099, 5001, 3004, 6906)
foreach ($Port in $Ports) {
    $Connection = netstat -an | findstr ":$Port "
    if ($Connection) {
        Write-Host "Port $Port : ✅ Running" -ForegroundColor Green
    } else {
        Write-Host "Port $Port : ❌ Not Active" -ForegroundColor Red
    }
}
