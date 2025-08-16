# TINI NGINX PROXY - STOP
Write-Host "🛑 STOPPING NGINX REVERSE PROXY..." -ForegroundColor Red

$nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
if ($nginxProcess) {
    Write-Host "⚡ Stopping nginx processes..." -ForegroundColor Yellow
    try {
        Set-Location "C:\tools\nginx"
        .\nginx.exe -s stop
        Start-Sleep 2
        
        $checkProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if (-not $checkProcess) {
            Write-Host "✅ Nginx stopped successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Some nginx processes may still be running" -ForegroundColor Yellow
        }
        Set-Location "C:\Users\Administrator\đcm"
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️ Nginx is not running" -ForegroundColor Yellow
}
