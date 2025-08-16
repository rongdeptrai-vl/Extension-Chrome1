# PM2 TINI System Manager
# Khởi động toàn bộ hệ thống 6 server với PM2

Write-Host "🚀 TINI ULTIMATE SECURITY - PM2 DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor White
Write-Host "📊 Khởi động 6 server chính của hệ thống" -ForegroundColor Gray

# Kiểm tra PM2
if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "❌ PM2 chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Cài đặt: npm install -g pm2" -ForegroundColor Yellow
    exit 1
}

# Dừng tất cả processes cũ
Write-Host "`n📋 Dọn dẹp processes cũ..." -ForegroundColor Yellow
pm2 kill
taskkill /f /im node.exe 2>$null

# Khởi động MySQL Database (Server #6)
Write-Host "`n🗄️ Khởi động MySQL Database (Server #6)..." -ForegroundColor Magenta
try {
    net start mysql80 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL Database started successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MySQL already running or service name different" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ MySQL service not found - check installation" -ForegroundColor Yellow
}

# Khởi động với ecosystem file (5 Node.js servers)
Write-Host "`n🔧 Khởi động 5 Node.js servers với PM2..." -ForegroundColor Green
pm2 start ecosystem.config.js --env production

# Đợi một chút để servers khởi động
Start-Sleep -Seconds 3

# Hiển thị trạng thái
Write-Host "`n📊 Trạng thái hệ thống:" -ForegroundColor Cyan
pm2 status

Write-Host "`n🌐 Kiểm tra kết nối servers..." -ForegroundColor Yellow

# Test các endpoints
$servers = @(
    @{Name="Panel Server"; URL="http://localhost:55055"; Port=55055},
    @{Name="Gateway Server"; URL="http://localhost:8099"; Port=8099},
    @{Name="API Server"; URL="http://localhost:5001"; Port=5001},
    @{Name="Dashboard Server"; URL="http://localhost:3004"; Port=3004},
    @{Name="Security Server"; URL="http://localhost:6906"; Port=6906},
    @{Name="Master Security"; URL="http://localhost:9999/api/security/health"; Port=9999}
)

$runningCount = 0
foreach ($server in $servers) {
    try {
        $response = Invoke-WebRequest -Uri $server.URL -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($server.Name) - HTTP $($response.StatusCode)" -ForegroundColor Green
        $runningCount++
    } catch {
        Write-Host "❌ $($server.Name) - Not responding" -ForegroundColor Red
    }
}

# MySQL test
try {
    $mysqlTest = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet
    if ($mysqlTest) {
        Write-Host "✅ MySQL Database - Connection OK" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "❌ MySQL Database - Not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ MySQL Database - Connection failed" -ForegroundColor Red
}

Write-Host "`n📈 TỔNG KẾT DEPLOYMENT:" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor White
Write-Host "Servers đang chạy: $runningCount/6" -ForegroundColor $(if($runningCount -eq 6){"Green"}elseif($runningCount -ge 4){"Yellow"}else{"Red"})

if ($runningCount -eq 6) {
    Write-Host "🎉 TẤT CẢ 6 SERVER KHỞI ĐỘNG THÀNH CÔNG!" -ForegroundColor Green
} elseif ($runningCount -ge 4) {
    Write-Host "⚠️ HỆ THỐNG CƠ BẢN HOẠT ĐỘNG" -ForegroundColor Yellow
} else {
    Write-Host "🚨 SYSTEM PARTIALLY FAILED" -ForegroundColor Red
}

Write-Host "`n💻 TRUY CẬP HỆ THỐNG:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor White
Write-Host "1. 📱 Admin Panel: http://localhost:55055/admin-panel.html" -ForegroundColor White
Write-Host "2. 🌐 Gateway: http://localhost:8099" -ForegroundColor White  
Write-Host "3. ⚡ API: http://localhost:5001" -ForegroundColor White
Write-Host "4. 📊 Dashboard: http://localhost:3004" -ForegroundColor White
Write-Host "5. 🛡️ Security: http://localhost:6906" -ForegroundColor White
Write-Host "6. 🔐 Master Security API: http://localhost:9999/api/security/status" -ForegroundColor White
Write-Host "7. 🗄️ MySQL: mysql://localhost:3306" -ForegroundColor White

Write-Host "`n⚡ LỆNH QUẢN LÝ PM2:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor White
Write-Host "Monitor: pm2 monit" -ForegroundColor Yellow
Write-Host "Logs: pm2 logs" -ForegroundColor Yellow
Write-Host "Restart: pm2 restart all" -ForegroundColor Yellow
Write-Host "Stop: pm2 stop all" -ForegroundColor Yellow
Write-Host "Delete: pm2 delete all" -ForegroundColor Yellow

Write-Host "`n✅ HOÀN TẤT DEPLOYMENT" -ForegroundColor Green
