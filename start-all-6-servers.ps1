# TINI Ultimate Security - KHỞI ĐỘNG TẤT CẢ 6 SERVER
Write-Host "Đang khởi động hệ thống TINI Ultimate Security (6 server)..." -ForegroundColor Cyan

# Bước 1: Dừng tất cả Node.js process cũ
Write-Host "`n1. Dừng các tiến trình cũ..." -ForegroundColor Yellow
try {
    taskkill /f /im node.exe 2>$null
    Start-Sleep -Seconds 2
} catch {
    # Không có process để dừng
}

# Bước 2: Khởi động 4 server chính
Write-Host "2. Khởi động 4 server chính..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c", "npm run start:all"
Start-Sleep -Seconds 8

# Bước 3: Khởi động Security Server
Write-Host "3. Khởi động Security Server..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c", "node SECURITY/SECURITY.js"
Start-Sleep -Seconds 3

# Bước 4: Kiểm tra MySQL
Write-Host "4. Kiểm tra MySQL..." -ForegroundColor Green
$mysqlRunning = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if (-not $mysqlRunning) {
    Write-Host "   Đang khởi động MySQL..." -ForegroundColor Yellow
    try {
        Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c", "net start mysql80"
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "   Không thể khởi động MySQL tự động" -ForegroundColor Red
    }
}

# Bước 5: Kiểm tra kết quả
Write-Host "`n5. Kiểm tra trạng thái tất cả server..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

$allServers = @(
    @{Name="Panel Server"; Port=55055},
    @{Name="Gateway Server"; Port=8099},  
    @{Name="API Server"; Port=5001},
    @{Name="Dashboard Server"; Port=3004},
    @{Name="Security Server"; Port=6906},
    @{Name="MySQL Database"; Port=3306}
)

$runningCount = 0
foreach ($server in $allServers) {
    $result = netstat -ano | findstr ":$($server.Port)"
    if ($result) {
        Write-Host "[OK] $($server.Name) - Port $($server.Port)" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "[FAIL] $($server.Name) - Port $($server.Port)" -ForegroundColor Red
    }
}

Write-Host "`nKết quả: $runningCount/6 server đang chạy" -ForegroundColor $(if($runningCount -eq 6){"Green"}elseif($runningCount -ge 4){"Yellow"}else{"Red"})

if ($runningCount -eq 6) {
    Write-Host "`n🎉 TẤT CẢ 6 SERVER ĐÃ KHỞI ĐỘNG THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "`nTruy cập các server:" -ForegroundColor Cyan
    Write-Host "1. Admin Panel: http://localhost:55055/admin-panel.html" -ForegroundColor White
    Write-Host "2. Gateway: http://localhost:8099" -ForegroundColor White  
    Write-Host "3. API: http://localhost:5001" -ForegroundColor White
    Write-Host "4. Dashboard: http://localhost:3004" -ForegroundColor White
    Write-Host "5. Security: http://localhost:6906" -ForegroundColor White
    Write-Host "6. MySQL: mysql://localhost:3306" -ForegroundColor White
} elseif ($runningCount -ge 4) {
    Write-Host "`n⚠️ 4-5 server đã khởi động. Kiểm tra lại Security Server và MySQL" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Chưa đủ server khởi động. Vui lòng kiểm tra lại" -ForegroundColor Red
}
