# TINI Ultimate Security - KIỂM TRA TẤT CẢ 6 SERVER
# © 2024 TINI COMPANY - Complete Server Analysis

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              TINI ULTIMATE SECURITY - 6 SERVER REPORT           ║" -ForegroundColor Cyan  
Write-Host "║                         $timestamp                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Định nghĩa TẤT CẢ 6 SERVER trong hệ thống
$allServers = @(
    @{Name="Panel Server"; Port=55055; Script="admin-panel/server.js"; URL="http://localhost:55055"; Type="Web UI"},
    @{Name="Gateway Server"; Port=8099; Script="scripts/start-gateway.js"; URL="http://localhost:8099"; Type="Gateway"},  
    @{Name="API Server"; Port=5001; Script="core/api-server.js"; URL="http://localhost:5001"; Type="REST API"},
    @{Name="Dashboard Server"; Port=3004; Script="core/admin-dashboard-server.js"; URL="http://localhost:3004"; Type="Dashboard"},
    @{Name="Security Server"; Port=6906; Script="SECURITY/SECURITY.js"; URL="http://localhost:6906"; Type="Security"},
    @{Name="MySQL Database"; Port=3306; Script="MySQL Service"; URL="mysql://localhost:3306"; Type="Database"}
)

Write-Host "`n🔍 PHÂN TÍCH TIẾN TRÌNH:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Kiểm tra Node.js processes
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "✅ Tìm thấy $($nodeProcs.Count) tiến trình Node.js" -ForegroundColor Green
    foreach ($proc in $nodeProcs) {
        $memoryMB = [math]::Round($proc.PM/1MB, 2)
        Write-Host "   PID: $($proc.Id) | Memory: ${memoryMB}MB" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Không tìm thấy tiến trình Node.js nào" -ForegroundColor Red
}

# Kiểm tra MySQL
$mysqlProc = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($mysqlProc) {
    Write-Host "✅ MySQL Server đang chạy (PID: $($mysqlProc.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL Server không chạy" -ForegroundColor Red
}

Write-Host "`n🌐 TRẠNG THÁI CỔNG:" -ForegroundColor Yellow  
Write-Host "====================" -ForegroundColor Yellow

$runningServers = 0
foreach ($server in $allServers) {
    $result = netstat -ano | findstr ":$($server.Port)"
    if ($result) {
        Write-Host "✅ $($server.Name) - Port $($server.Port) ĐANG LẮNG NGHE" -ForegroundColor Green
        Write-Host "   Loại: $($server.Type) | Script: $($server.Script)" -ForegroundColor Gray
        $runningServers++
    } else {
        Write-Host "❌ $($server.Name) - Port $($server.Port) KHÔNG LẮNG NGHE" -ForegroundColor Red
        Write-Host "   Loại: $($server.Type) | Script: $($server.Script)" -ForegroundColor Gray
    }
}

Write-Host "`n🔗 KIỂM TRA KẾT NỐI HTTP:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

foreach ($server in $allServers) {
    if ($server.Type -eq "Database") {
        # Kiểm tra MySQL connection
        try {
            $mysqlTest = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet
            if ($mysqlTest) {
                Write-Host "✅ $($server.Name) - DATABASE CONNECTION OK" -ForegroundColor Green
            } else {
                Write-Host "❌ $($server.Name) - DATABASE CONNECTION FAILED" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ $($server.Name) - DATABASE ERROR" -ForegroundColor Red
        }
    } else {
        # Kiểm tra HTTP connection
        try {
            $response = Invoke-WebRequest -Uri $server.URL -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ $($server.Name) - HTTP $($response.StatusCode)" -ForegroundColor Green
            Write-Host "   Response Size: $($response.Content.Length) bytes" -ForegroundColor Gray
        } catch {
            $errorMsg = $_.Exception.Message
            if ($errorMsg -match "Unable to connect") {
                Write-Host "❌ $($server.Name) - CONNECTION REFUSED" -ForegroundColor Red
            } elseif ($errorMsg -match "timeout") {
                Write-Host "❌ $($server.Name) - TIMEOUT" -ForegroundColor Red  
            } else {
                Write-Host "❌ $($server.Name) - ERROR: $errorMsg" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n📊 TỔNG KẾT HỆ THỐNG:" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

Write-Host "Server đang chạy: $runningServers/6" -ForegroundColor $(if($runningServers -eq 6){"Green"}elseif($runningServers -gt 3){"Yellow"}else{"Red"})

foreach ($server in $allServers) {
    $result = netstat -ano | findstr ":$($server.Port)"
    if ($result) {
        Write-Host "🟢 $($server.Name) ($($server.Type))" -ForegroundColor Green
    } else {
        Write-Host "🔴 $($server.Name) ($($server.Type))" -ForegroundColor Red
    }
}

if ($runningServers -eq 6) {
    Write-Host "`n🎉 TẤT CẢ 6 SERVER ĐANG HOẠT ĐỘNG HOÀN HẢO!" -ForegroundColor Green
} elseif ($runningServers -ge 4) {
    Write-Host "`n⚠️  HỆ THỐNG CƠ BẢN HOẠT ĐỘNG (4-5/6 server)" -ForegroundColor Yellow
} elseif ($runningServers -ge 2) {
    Write-Host "`n🚨 HỆ THỐNG HOẠT ĐỘNG GIỚI HẠN (2-3/6 server)" -ForegroundColor Yellow
} else {
    Write-Host "`n🚨 HỆ THỐNG KHÔNG HOẠT ĐỘNG BÌNH THƯỜNG" -ForegroundColor Red
}

Write-Host "`n💻 DANH SÁCH TRUY CẬP:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "1. 📱 Admin Panel: http://localhost:55055/admin-panel.html" -ForegroundColor White
Write-Host "2. 🌐 Gateway: http://localhost:8099" -ForegroundColor White  
Write-Host "3. ⚡ API: http://localhost:5001" -ForegroundColor White
Write-Host "4. 📊 Dashboard: http://localhost:3004" -ForegroundColor White
Write-Host "5. 🛡️  Security: http://localhost:6906" -ForegroundColor White
Write-Host "6. 🗄️  MySQL: mysql://localhost:3306" -ForegroundColor White

Write-Host "`n⚡ LỆNH QUẢN LÝ 6 SERVER:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Khởi động 4 server chính: npm run start:all" -ForegroundColor White
Write-Host "Khởi động Security Server: node SECURITY/SECURITY.js" -ForegroundColor White
Write-Host "Khởi động MySQL: net start mysql80" -ForegroundColor White
Write-Host "Dừng tất cả Node.js: taskkill /f /im node.exe" -ForegroundColor White
Write-Host "Dừng MySQL: net stop mysql80" -ForegroundColor White

Write-Host "`n📝 GHI CHÚ QUAN TRỌNG:" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host "- 4 server chính (Panel, Gateway, API, Dashboard) được khởi động cùng lúc" -ForegroundColor White
Write-Host "- Security Server (Port 6906) cần khởi động riêng" -ForegroundColor White
Write-Host "- MySQL Database cần cài đặt và khởi động riêng" -ForegroundColor White
Write-Host "- Tổng cộng 6 server tạo thành hệ thống TINI Ultimate Security hoàn chỉnh" -ForegroundColor White
