# TINI Port 8080 Force Test
# Disable AUTO HIGH PORTS và test port 8080 thực sự

Write-Host "=== TINI PORT 8080 FORCE TEST ===" -ForegroundColor Yellow

# Test 1: Với FORCE_HIGH_PORTS=false
Write-Host "`n[Test 1] Starting server with FORCE_HIGH_PORTS=false và PORT=8080..." -ForegroundColor Cyan
$env:FORCE_HIGH_PORTS="false"
$env:PORT="8080"

$process1 = Start-Process -FilePath "node" -ArgumentList "admin-panel/server.js" -NoNewWindow -PassThru
Start-Sleep 3

# Check if port 8080 is listening
$port8080 = netstat -an | Select-String ":8080"
if ($port8080) {
    Write-Host "✅ SUCCESS: Server đang chạy trên port 8080!" -ForegroundColor Green
    Write-Host "Port details: $port8080" -ForegroundColor White
    
    # Test HTTP request
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5
        Write-Host "✅ HTTP Response: $($response.StatusCode) - $($response.StatusDescription)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  HTTP test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ FAILED: Server không chạy trên port 8080" -ForegroundColor Red
}

# Clean up
try { Stop-Process -Id $process1.Id -Force } catch {}

Write-Host "`n=== KẾT LUẬN PORT 8080 ===" -ForegroundColor Yellow
Write-Host "Port 8080 trong config/ports.json là:" -ForegroundColor White
Write-Host "- FALLBACK port cho admin panel khi HIGH_PORTS bị tắt" -ForegroundColor Cyan
Write-Host "- KHÔNG phải là server riêng biệt thứ 7" -ForegroundColor Cyan
Write-Host "- System mặc định dùng HIGH PORTS (55055+) để tránh conflicts" -ForegroundColor Cyan

Write-Host "`n=== KIẾN TRÚC TINI HOÀN CHỈNH (6 SERVERS) ===" -ForegroundColor Green
Write-Host "1. Admin Panel Server  : Port 55055 (SQLite integrated)" -ForegroundColor White
Write-Host "2. Gateway Server      : Port 3000" -ForegroundColor White
Write-Host "3. API Server          : Port 3001" -ForegroundColor White
Write-Host "4. Dashboard Server    : Port 3002" -ForegroundColor White
Write-Host "5. Security Server     : Port 6906 (FIXED)" -ForegroundColor White
Write-Host "6. MySQL Server        : Port 3306 (NOT INSTALLED)" -ForegroundColor White
Write-Host "`nAlternative ports (8080, etc.) = FALLBACK configs, not separate servers" -ForegroundColor Yellow
