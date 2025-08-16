# TINI NGINX PROXY - QUICK START
Write-Host "🚀 STARTING NGINX REVERSE PROXY..." -ForegroundColor Cyan

# Check if nginx is running
$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if ($nginxProcess) {
    Write-Host "✅ Nginx is already running!" -ForegroundColor Green
    Write-Host "🌐 Processes: $($nginxProcess.Count) nginx workers" -ForegroundColor Yellow
} else {
    Write-Host "⚡ Starting nginx..." -ForegroundColor Yellow
    try {
        Set-Location "C:\tools\nginx"
        Start-Process -FilePath "nginx.exe" -WindowStyle Hidden
        Start-Sleep 2
        
        $newProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if ($newProcess) {
            Write-Host "✅ Nginx started successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to start nginx" -ForegroundColor Red
        }
        Set-Location "C:\Users\Administrator\đcm"
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n🌐 ACCESS POINTS (via port 80):" -ForegroundColor Cyan
Write-Host "http://localhost/           → Integration Server" -ForegroundColor White
Write-Host "http://localhost/admin/     → Admin Panel" -ForegroundColor White  
Write-Host "http://localhost/api/       → API Server" -ForegroundColor White
Write-Host "http://localhost/gateway/   → Gateway" -ForegroundColor White
Write-Host "http://localhost/auth/      → Auth Server" -ForegroundColor White
Write-Host "http://localhost/dashboard/ → Dashboard" -ForegroundColor White

Write-Host "`n🎯 NGINX COMMANDS:" -ForegroundColor Yellow
Write-Host "Start:   C:\tools\nginx\nginx.exe" -ForegroundColor Gray
Write-Host "Stop:    C:\tools\nginx\nginx.exe -s stop" -ForegroundColor Gray  
Write-Host "Reload:  C:\tools\nginx\nginx.exe -s reload" -ForegroundColor Gray
Write-Host "Test:    C:\tools\nginx\nginx.exe -t" -ForegroundColor Gray
