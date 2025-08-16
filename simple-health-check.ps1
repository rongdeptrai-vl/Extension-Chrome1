Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host "     TINI ULTIMATE SECURITY - SERVERS HEALTH CHECK" -ForegroundColor Yellow  
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 KIỂM TRA TRẠNG THÁI CÁC SERVERS..." -ForegroundColor Cyan
Write-Host ""

$ports = @(8080, 3002, 55057, 8099, 5001, 3004)
$names = @("TINI Integration", "Authentication", "Panel Server", "Gateway Server", "API Server", "Dashboard Server")
$runningCount = 0

for($i = 0; $i -lt $ports.Length; $i++) {
    $port = $ports[$i]
    $name = $names[$i]
    
    $result = netstat -an | findstr "LISTENING" | findstr ":$port "
    
    if($result) {
        Write-Host "✅ $name (Port $port) - ĐANG CHẠY" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "❌ $name (Port $port) - KHÔNG CHẠY" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host "📊 TỔNG KẾT: $runningCount/6 servers đang chạy" -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Yellow

if($runningCount -eq 6) {
    Write-Host "🎉 TẤT CẢ SERVERS ĐANG HOẠT ĐỘNG!" -ForegroundColor Green
} else {
    Write-Host "⚠️  CÓ SERVERS CHƯA CHẠY!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 LỆNH KHỞI ĐỘNG:" -ForegroundColor Cyan
Write-Host "npm run start:integration" -ForegroundColor White
Write-Host "npm run start:auth" -ForegroundColor White  
Write-Host "npm run start:panel" -ForegroundColor White
Write-Host "npm run start:gateway" -ForegroundColor White
Write-Host "npm run start:api" -ForegroundColor White
Write-Host "npm run start:dashboard" -ForegroundColor White
