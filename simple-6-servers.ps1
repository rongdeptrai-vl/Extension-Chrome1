# TINI Ultimate Security - KIỂM TRA TẤT CẢ 6 SERVER
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "TINI ULTIMATE SECURITY - 6 SERVER REPORT - $timestamp" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Định nghĩa TẤT CẢ 6 SERVER trong hệ thống
$allServers = @(
    @{Name="Panel Server"; Port=55055; Type="Web UI"},
    @{Name="Gateway Server"; Port=8099; Type="Gateway"},  
    @{Name="API Server"; Port=5001; Type="REST API"},
    @{Name="Dashboard Server"; Port=3004; Type="Dashboard"},
    @{Name="Security Server"; Port=6906; Type="Security"},
    @{Name="MySQL Database"; Port=3306; Type="Database"}
)

Write-Host "`nKiểm tra tiến trình Node.js..." -ForegroundColor Yellow
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "Tìm thấy $($nodeProcs.Count) tiến trình Node.js" -ForegroundColor Green
} else {
    Write-Host "Không tìm thấy tiến trình Node.js nào" -ForegroundColor Red
}

Write-Host "`nKiểm tra MySQL..." -ForegroundColor Yellow
$mysqlProc = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($mysqlProc) {
    Write-Host "MySQL Server đang chạy" -ForegroundColor Green
} else {
    Write-Host "MySQL Server không chạy" -ForegroundColor Red
}

Write-Host "`nTrạng thái các cổng:" -ForegroundColor Yellow
$runningServers = 0
foreach ($server in $allServers) {
    $result = netstat -ano | findstr ":$($server.Port)"
    if ($result) {
        Write-Host "[OK] $($server.Name) - Port $($server.Port) ($($server.Type))" -ForegroundColor Green
        $runningServers++
    } else {
        Write-Host "[FAIL] $($server.Name) - Port $($server.Port) ($($server.Type))" -ForegroundColor Red
    }
}

Write-Host "`nTổng kết:" -ForegroundColor Magenta
Write-Host "Server đang chạy: $runningServers/6" -ForegroundColor $(if($runningServers -eq 6){"Green"}elseif($runningServers -gt 3){"Yellow"}else{"Red"})

if ($runningServers -eq 6) {
    Write-Host "TẤT CẢ 6 SERVER ĐANG HOẠT ĐỘNG!" -ForegroundColor Green
} elseif ($runningServers -ge 4) {
    Write-Host "HỆ THỐNG CƠ BẢN HOẠT ĐỘNG" -ForegroundColor Yellow
} else {
    Write-Host "HỆ THỐNG CHƯA HOẠT ĐỘNG ĐẦY ĐỦ" -ForegroundColor Red
}

Write-Host "`nDanh sách truy cập:" -ForegroundColor Cyan
Write-Host "1. Admin Panel: http://localhost:55055/admin-panel.html" -ForegroundColor White
Write-Host "2. Gateway: http://localhost:8099" -ForegroundColor White  
Write-Host "3. API: http://localhost:5001" -ForegroundColor White
Write-Host "4. Dashboard: http://localhost:3004" -ForegroundColor White
Write-Host "5. Security: http://localhost:6906" -ForegroundColor White
Write-Host "6. MySQL: mysql://localhost:3306" -ForegroundColor White

Write-Host "`nLệnh quản lý:" -ForegroundColor Cyan
Write-Host "Khởi động 4 server chính: npm run start:all" -ForegroundColor White
Write-Host "Khởi động Security Server: node SECURITY/SECURITY.js" -ForegroundColor White
Write-Host "Khởi động MySQL: net start mysql80" -ForegroundColor White
