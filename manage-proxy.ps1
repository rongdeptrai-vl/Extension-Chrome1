# TINI Reverse Proxy Management Script
# Quản lý và monitor reverse proxy system

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "test", "logs", "help")]
    [string]$Action = "help"
)

$nginxPath = "C:\tools\nginx"
$nginxExe = "$nginxPath\nginx.exe"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "    TINI REVERSE PROXY MANAGEMENT CONSOLE" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Help {
    Write-Host "🔧 AVAILABLE COMMANDS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  start     - Start reverse proxy" -ForegroundColor White
    Write-Host "  stop      - Stop reverse proxy" -ForegroundColor White
    Write-Host "  restart   - Restart reverse proxy" -ForegroundColor White
    Write-Host "  status    - Check proxy and services status" -ForegroundColor White
    Write-Host "  test      - Test nginx configuration" -ForegroundColor White
    Write-Host "  logs      - Show nginx logs" -ForegroundColor White
    Write-Host "  help      - Show this help" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 EXAMPLES:" -ForegroundColor Cyan
    Write-Host "  .\manage-proxy.ps1 start" -ForegroundColor Gray
    Write-Host "  .\manage-proxy.ps1 status" -ForegroundColor Gray
}

function Test-NginxInstalled {
    if (-not (Test-Path $nginxExe)) {
        Write-Host "❌ Nginx not found at $nginxExe" -ForegroundColor Red
        Write-Host "Run setup-reverse-proxy.ps1 first" -ForegroundColor Yellow
        return $false
    }
    return $true
}

function Start-ReverseProxy {
    Write-Host "🚀 STARTING REVERSE PROXY..." -ForegroundColor Yellow
    
    if (-not (Test-NginxInstalled)) { return }
    
    # Kiểm tra nginx đã chạy chưa
    $nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
    if ($nginxProcess) {
        Write-Host "ℹ️ Nginx is already running (PID: $($nginxProcess.Id))" -ForegroundColor Yellow
        return
    }
    
    try {
        Set-Location $nginxPath
        Start-Process -FilePath $nginxExe -WindowStyle Hidden
        Start-Sleep 2
        
        $newProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if ($newProcess) {
            Write-Host "✅ Reverse proxy started successfully" -ForegroundColor Green
            Write-Host "🌐 Access: https://tini-security.local/" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Failed to start nginx" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error starting nginx: $_" -ForegroundColor Red
    }
}

function Stop-ReverseProxy {
    Write-Host "🛑 STOPPING REVERSE PROXY..." -ForegroundColor Yellow
    
    if (-not (Test-NginxInstalled)) { return }
    
    try {
        Set-Location $nginxPath
        & $nginxExe -s stop
        Start-Sleep 2
        
        $process = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        if (-not $process) {
            Write-Host "✅ Reverse proxy stopped successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Some nginx processes may still be running" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error stopping nginx: $_" -ForegroundColor Red
    }
}

function Restart-ReverseProxy {
    Write-Host "🔄 RESTARTING REVERSE PROXY..." -ForegroundColor Yellow
    Stop-ReverseProxy
    Start-Sleep 3
    Start-ReverseProxy
}

function Show-Status {
    Write-Host "📊 SYSTEM STATUS REPORT" -ForegroundColor Cyan
    Write-Host ""
    
    # 1. Nginx Status
    Write-Host "🌐 REVERSE PROXY STATUS:" -ForegroundColor Yellow
    $nginxProcess = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
    if ($nginxProcess) {
        Write-Host "✅ Nginx Running (PID: $($nginxProcess.Id))" -ForegroundColor Green
        $memory = [math]::Round($nginxProcess.WorkingSet / 1MB, 2)
        Write-Host "   Memory: $memory MB" -ForegroundColor Gray
    } else {
        Write-Host "❌ Nginx Not Running" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # 2. Backend Services Status
    Write-Host "🔧 BACKEND SERVICES STATUS:" -ForegroundColor Yellow
    $services = @(
        @{Name="Integration"; Port=8080},
        @{Name="Auth"; Port=3002},
        @{Name="Panel"; Port=55057},
        @{Name="Gateway"; Port=8099},
        @{Name="API"; Port=5001},
        @{Name="Dashboard"; Port=3004}
    )
    
    $runningServices = 0
    foreach($service in $services) {
        $result = netstat -an | findstr "LISTENING" | findstr ":$($service.Port) "
        if($result) {
            Write-Host "✅ $($service.Name) ($($service.Port))" -ForegroundColor Green
            $runningServices++
        } else {
            Write-Host "❌ $($service.Name) ($($service.Port))" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "📈 SUMMARY: $runningServices/6 backend services running" -ForegroundColor $(if($runningServices -eq 6){"Green"}else{"Yellow"})
    
    # 3. Port 443 Status
    Write-Host ""
    Write-Host "🔒 SSL PORT STATUS:" -ForegroundColor Yellow
    $sslPort = netstat -an | findstr "LISTENING" | findstr ":443 "
    if($sslPort) {
        Write-Host "✅ Port 443 (HTTPS) - Active" -ForegroundColor Green
    } else {
        Write-Host "❌ Port 443 (HTTPS) - Not Active" -ForegroundColor Red
    }
}

function Test-Configuration {
    Write-Host "🧪 TESTING NGINX CONFIGURATION..." -ForegroundColor Yellow
    
    if (-not (Test-NginxInstalled)) { return }
    
    try {
        Set-Location $nginxPath
        $output = & $nginxExe -t 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Configuration test successful" -ForegroundColor Green
            Write-Host $output -ForegroundColor Gray
        } else {
            Write-Host "❌ Configuration test failed" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error testing configuration: $_" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "📋 NGINX LOGS (LAST 20 LINES):" -ForegroundColor Yellow
    Write-Host ""
    
    $logPath = "$nginxPath\logs"
    
    # Error log
    $errorLog = "$logPath\error.log"
    if (Test-Path $errorLog) {
        Write-Host "🔴 ERROR LOG:" -ForegroundColor Red
        Get-Content $errorLog | Select-Object -Last 10 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    
    # Access log
    $accessLog = "$logPath\access.log"
    if (Test-Path $accessLog) {
        Write-Host "🟢 ACCESS LOG:" -ForegroundColor Green
        Get-Content $accessLog | Select-Object -Last 10 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
}

# Main execution
switch ($Action) {
    "start" { Start-ReverseProxy }
    "stop" { Stop-ReverseProxy }
    "restart" { Restart-ReverseProxy }
    "status" { Show-Status }
    "test" { Test-Configuration }
    "logs" { Show-Logs }
    "help" { Show-Help }
    default { Show-Help }
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
