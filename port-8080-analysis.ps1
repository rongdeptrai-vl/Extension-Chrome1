# TINI Port 8080 Analysis - Tìm hiểu mục đích sử dụng
Write-Host "PHÂN TÍCH PORT 8080 TRONG DỰ ÁN TINI" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n🔍 1. ĐỊNH NGHĨA TRONG CONFIG:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

Write-Host "Trong config/ports.json:" -ForegroundColor Cyan
Write-Host 'admin_panel: {' -ForegroundColor White
Write-Host '  file: "admin-panel\\server.js",' -ForegroundColor White  
Write-Host '  port: 8080,' -ForegroundColor Green
Write-Host '  category: "admin",' -ForegroundColor White
Write-Host '  description: "Static admin panel"' -ForegroundColor White
Write-Host '}' -ForegroundColor White

Write-Host "`n🎯 2. MỤC ĐÍCH SỬ DỤNG:" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

Write-Host "✅ Port 8080 được thiết kế làm:" -ForegroundColor Green
Write-Host "   - Port mặc định cho Admin Panel Server" -ForegroundColor White
Write-Host "   - Port fallback khi port chính (55055) bị chiếm" -ForegroundColor White
Write-Host "   - Port backup trong Docker deployment" -ForegroundColor White
Write-Host "   - Port alternative trong script start:all:alt" -ForegroundColor White

Write-Host "`n📝 3. CÁCH HOẠT ĐỘNG:" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow

Write-Host "Trong admin-panel/server.js:" -ForegroundColor Cyan
Write-Host 'const PORT = process.env.PORT || envConfig.get("PORT") || 8080;' -ForegroundColor White

Write-Host "`nLogic ưu tiên:" -ForegroundColor Cyan
Write-Host "1. Biến môi trường PORT (ví dụ: 55055)" -ForegroundColor White
Write-Host "2. Config file PORT setting" -ForegroundColor White  
Write-Host "3. Port mặc định: 8080" -ForegroundColor Green

Write-Host "`n🚀 4. CÁCH CHẠY SERVER TRÊN PORT 8080:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

Write-Host "Lệnh trực tiếp:" -ForegroundColor Cyan
Write-Host "cross-env PORT=8080 node admin-panel/server.js" -ForegroundColor Green

Write-Host "`nScript alternative:" -ForegroundColor Cyan  
Write-Host "npm run start:all:alt" -ForegroundColor Green
Write-Host "(Chạy panel server trên port 8081, gần tương tự 8080)" -ForegroundColor Gray

Write-Host "`nDocker deployment:" -ForegroundColor Cyan
Write-Host "docker-compose up admin-panel" -ForegroundColor Green
Write-Host "(Map port 8080:8080)" -ForegroundColor Gray

Write-Host "`n🔧 5. KIỂM TRA PORT 8080:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

# Kiểm tra port 8080
$port8080 = netstat -ano | findstr ":8080"
if ($port8080) {
    Write-Host "✅ Port 8080 đang được sử dụng:" -ForegroundColor Green
    Write-Host $port8080 -ForegroundColor Gray
} else {
    Write-Host "❌ Port 8080 hiện tại không được sử dụng" -ForegroundColor Red
}

# Kiểm tra port hiện tại của panel
$currentPanel = netstat -ano | findstr ":55055"
if ($currentPanel) {
    Write-Host "✅ Panel Server đang chạy trên port 55055 (port chính)" -ForegroundColor Green
} else {
    Write-Host "❌ Panel Server không chạy" -ForegroundColor Red
}

Write-Host "`n🎮 6. DEMO - CHẠY SERVER TRÊN PORT 8080:" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

Write-Host "Để test port 8080, chạy lệnh:" -ForegroundColor Cyan
Write-Host "cross-env PORT=8080 node admin-panel/server.js" -ForegroundColor Green

Write-Host "`nSau đó truy cập:" -ForegroundColor Cyan
Write-Host "http://localhost:8080/admin-panel.html" -ForegroundColor Green

Write-Host "`n📊 7. SO SÁNH CÁC PORT ADMIN:" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

Write-Host "Port 55055 (chính)  : Panel Server production" -ForegroundColor White
Write-Host "Port 8080 (dự phòng): Panel Server alternative/Docker" -ForegroundColor White
Write-Host "Port 8081 (script)  : Panel trong start:all:alt" -ForegroundColor White
Write-Host "Port 3004 (khác)    : Dashboard Server" -ForegroundColor White

Write-Host "`n🏗️ 8. KIẾN TRÚC FALLBACK:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

Write-Host "Hệ thống fallback của Admin Panel:" -ForegroundColor Cyan
Write-Host "Primary  : 55055 (hiện tại)" -ForegroundColor Green
Write-Host "Fallback1: 55056" -ForegroundColor Yellow  
Write-Host "Fallback2: 55057" -ForegroundColor Yellow
Write-Host "Default  : 8080 (nếu không có config)" -ForegroundColor White
Write-Host "Alt mode : 8081 (trong start:all:alt)" -ForegroundColor White

Write-Host "`n🎯 TÓM TẮT:" -ForegroundColor Magenta
Write-Host "===========" -ForegroundColor Magenta

Write-Host "Port 8080 là:" -ForegroundColor White
Write-Host "✓ Port mặc định dự phòng của Admin Panel Server" -ForegroundColor Green
Write-Host "✓ Được sử dụng khi không có cấu hình port khác" -ForegroundColor Green
Write-Host "✓ Port cho Docker deployment" -ForegroundColor Green
Write-Host "✓ Port backup cho Static Admin Panel" -ForegroundColor Green

Write-Host "`nHiện tại Admin Panel chạy trên port 55055," -ForegroundColor White
Write-Host "nhưng có thể chuyển sang 8080 nếu cần!" -ForegroundColor White

Write-Host "`n💡 LỆNH NHANH:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Chạy trên 8080: cross-env PORT=8080 node admin-panel/server.js" -ForegroundColor White
Write-Host "Truy cập: http://localhost:8080/admin-panel.html" -ForegroundColor White
