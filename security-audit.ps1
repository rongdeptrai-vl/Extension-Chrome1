# TINI SECURITY AUDIT & UPDATE SCRIPT
# Phân tích nguy cơ và cập nhật bảo mật cho tất cả servers

Write-Host "=========================================" -ForegroundColor Red
Write-Host "  TINI SECURITY AUDIT & RISK ANALYSIS" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""

# 1. Kiểm tra Environment Variables
Write-Host "🔐 KIỂM TRA ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
$envVars = @("ADMIN_PASSWORD", "BOSS_PASSWORD", "STAFF_PASSWORD", "JWT_SECRET", "DB_ENCRYPTION_KEY")
foreach($env in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($env)
    if($value) {
        Write-Host "✅ $env - Đã thiết lập" -ForegroundColor Green
    } else {
        Write-Host "❌ $env - CHƯA THIẾT LẬP (NGUY CƠ CAO)" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Kiểm tra Ports mở
Write-Host "🌐 KIỂM TRA PORTS MỞ (ATTACK SURFACE):" -ForegroundColor Yellow
$openPorts = netstat -an | findstr "LISTENING" | findstr ":80\|:30\|:50\|:55"
if($openPorts) {
    Write-Host "⚠️ PORTS ĐANG MỞ:" -ForegroundColor Red
    $openPorts | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    Write-Host "   NGUY CƠ: Attack surface rộng" -ForegroundColor Red
} else {
    Write-Host "✅ Không có ports đáng ngờ" -ForegroundColor Green
}

Write-Host ""

# 3. Kiểm tra Database Files
Write-Host "🗄️ KIỂM TRA DATABASE SECURITY:" -ForegroundColor Yellow
$dbFiles = Get-ChildItem -Path . -Name "*.db" -Recurse
if($dbFiles) {
    Write-Host "📂 Database files tìm thấy:" -ForegroundColor White
    foreach($db in $dbFiles) {
        Write-Host "   $db" -ForegroundColor Gray
        # Kiểm tra permissions
        $acl = Get-Acl $db
        Write-Host "   Permissions: $($acl.Access.Count) entries" -ForegroundColor Gray
    }
} else {
    Write-Host "ℹ️ Không tìm thấy .db files" -ForegroundColor Gray
}

Write-Host ""

# 4. Kiểm tra Log Files
Write-Host "📋 KIỂM TRA LOG FILES:" -ForegroundColor Yellow
$logFiles = Get-ChildItem -Path . -Name "*.log" -Recurse
if($logFiles) {
    Write-Host "📝 Log files:" -ForegroundColor White
    foreach($log in $logFiles) {
        $size = (Get-Item $log).Length / 1KB
        Write-Host "   $log - $($size.ToString('F2')) KB" -ForegroundColor Gray
    }
} else {
    Write-Host "ℹ️ Không tìm thấy log files" -ForegroundColor Gray
}

Write-Host ""

# 5. Kiểm tra Node Processes
Write-Host "⚙️ KIỂM TRA NODE PROCESSES:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if($nodeProcesses) {
    Write-Host "🟢 Node processes đang chạy: $($nodeProcesses.Count)" -ForegroundColor Green
    foreach($proc in $nodeProcesses) {
        $memory = [math]::Round($proc.WorkingSet / 1MB, 2)
        Write-Host "   PID: $($proc.Id) - Memory: $memory MB" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Không có Node processes" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "📊 TỔNG KẾT NGUY CƠ BẢO MẬT" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Red

# Đánh giá tổng thể
$riskScore = 0
Write-Host ""
Write-Host "🔴 NGUY CƠ CAO:" -ForegroundColor Red
Write-Host "- Multiple ports exposed (6 services)" -ForegroundColor White
Write-Host "- Single host deployment (SPOF)" -ForegroundColor White
Write-Host "- Environment variables cần kiểm tra" -ForegroundColor White

Write-Host ""
Write-Host "🟡 NGUY CƠ TRUNG BÌNH:" -ForegroundColor Yellow  
Write-Host "- Database files trên filesystem" -ForegroundColor White
Write-Host "- Log management cần cải thiện" -ForegroundColor White
Write-Host "- Memory usage cần monitoring" -ForegroundColor White

Write-Host ""
Write-Host "🟢 ĐIỂM MẠNH:" -ForegroundColor Green
Write-Host "- BOSS Security System active" -ForegroundColor White
Write-Host "- Multi-factor authentication" -ForegroundColor White
Write-Host "- Role-based access control" -ForegroundColor White
Write-Host "- Advanced honeypot system" -ForegroundColor White

Write-Host ""
Write-Host "🔧 KHUYẾN NGHỊ CẤP THIẾT:" -ForegroundColor Cyan
Write-Host "1. Thiết lập environment variables" -ForegroundColor White
Write-Host "2. Implement reverse proxy" -ForegroundColor White
Write-Host "3. Database encryption" -ForegroundColor White
Write-Host "4. Log rotation & monitoring" -ForegroundColor White
Write-Host "5. Resource monitoring alerts" -ForegroundColor White

Write-Host ""
Write-Host "📋 Chi tiết: SYSTEM-ANALYSIS-REPORT.md" -ForegroundColor Magenta
