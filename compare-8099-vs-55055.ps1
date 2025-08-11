# SO SÁNH CHI TIẾT: PORT 8099 vs 55055
# Phân tích mối liên hệ và sự khác biệt

Write-Host "=== SO SÁNH PORT 8099 vs 55055 ===" -ForegroundColor Yellow

Write-Host "`n🎯 PORT 8099 - UNIFIED GATEWAY SERVER" -ForegroundColor Cyan
Write-Host "File       : Docker\server 8099.js" -ForegroundColor White
Write-Host "Chức năng  : Gateway và Authentication Hub" -ForegroundColor White
Write-Host "Framework  : Express.js + JWT + SQLite" -ForegroundColor White
Write-Host "Database   : Sử dụng CHUNG SQLite database (tini_admin.db)" -ForegroundColor White
Write-Host "Vai trò    : ENTRY POINT - điểm vào chính của hệ thống" -ForegroundColor White
Write-Host "Tính năng  :" -ForegroundColor White
Write-Host "  ✅ JWT Authentication & Authorization" -ForegroundColor Green
Write-Host "  ✅ User Management (CRUD)" -ForegroundColor Green
Write-Host "  ✅ Session Management" -ForegroundColor Green
Write-Host "  ✅ Rate Limiting & Security Headers" -ForegroundColor Green
Write-Host "  ✅ CORS Configuration" -ForegroundColor Green
Write-Host "  ✅ Auto redirect to Admin Panel (55055)" -ForegroundColor Green
Write-Host "  ✅ Admin Statistics & Monitoring" -ForegroundColor Green
Write-Host "  ✅ Legacy Data Migration" -ForegroundColor Green

Write-Host "`n🎯 PORT 55055 - ADMIN PANEL SERVER" -ForegroundColor Cyan
Write-Host "File       : admin-panel\server.js" -ForegroundColor White
Write-Host "Chức năng  : Admin Interface & File Server" -ForegroundColor White
Write-Host "Framework  : Native Node.js HTTP Server" -ForegroundColor White
Write-Host "Database   : Sử dụng CHUNG SQLite database (tini_admin.db)" -ForegroundColor White
Write-Host "Vai trò    : ADMIN INTERFACE - giao diện quản trị" -ForegroundColor White
Write-Host "Tính năng  :" -ForegroundColor White
Write-Host "  ✅ Static File Serving (HTML, CSS, JS)" -ForegroundColor Green
Write-Host "  ✅ Admin Dashboard Interface" -ForegroundColor Green
Write-Host "  ✅ SQLite Database Operations" -ForegroundColor Green
Write-Host "  ✅ User Activity Tracking" -ForegroundColor Green
Write-Host "  ✅ System Activity Logs" -ForegroundColor Green
Write-Host "  ✅ Auto High Port Management (55055+)" -ForegroundColor Green
Write-Host "  ✅ Port Fallback System" -ForegroundColor Green

Write-Host "`n🔗 MỐI LIÊN HỆ GIỮA 2 SERVERS" -ForegroundColor Yellow
Write-Host "1. SHARED DATABASE:" -ForegroundColor White
Write-Host "   - Cả 2 servers đều sử dụng CHUNG file tini_admin.db" -ForegroundColor Cyan
Write-Host "   - Port 8099: Quản lý users/sessions qua API" -ForegroundColor Cyan
Write-Host "   - Port 55055: Hiển thị data qua web interface" -ForegroundColor Cyan

Write-Host "`n2. WORKFLOW INTEGRATION:" -ForegroundColor White
Write-Host "   - Gateway (8099) → Authentication → Redirect → Panel (55055)" -ForegroundColor Cyan
Write-Host "   - Users login qua Gateway API, được redirect đến Panel UI" -ForegroundColor Cyan

Write-Host "`n3. ARCHITECTURE PATTERN:" -ForegroundColor White
Write-Host "   - Port 8099: API LAYER (Backend Logic)" -ForegroundColor Cyan
Write-Host "   - Port 55055: UI LAYER (Frontend Interface)" -ForegroundColor Cyan

Write-Host "`n📊 KIỂM TRA TRẠNG THÁI HIỆN TẠI" -ForegroundColor Yellow

# Check Gateway Server
$gateway = netstat -ano | findstr ":8099"
if ($gateway) {
    Write-Host "✅ Gateway Server (8099): RUNNING" -ForegroundColor Green
    Write-Host "   Details: $gateway" -ForegroundColor Gray
} else {
    Write-Host "❌ Gateway Server (8099): NOT RUNNING" -ForegroundColor Red
}

# Check Admin Panel
$panel = netstat -ano | findstr ":55055"
if ($panel) {
    Write-Host "✅ Admin Panel (55055): RUNNING" -ForegroundColor Green
    Write-Host "   Details: $panel" -ForegroundColor Gray
} else {
    Write-Host "❌ Admin Panel (55055): NOT RUNNING" -ForegroundColor Red
}

Write-Host "`n🎭 SỰ KHÁC BIỆT CHI TIẾT" -ForegroundColor Yellow

Write-Host "`n[TECHNICAL DIFFERENCES]" -ForegroundColor White
Write-Host "Framework  : 8099=Express.js | 55055=Native HTTP" -ForegroundColor Cyan
Write-Host "Auth       : 8099=JWT+bcrypt | 55055=None" -ForegroundColor Cyan
Write-Host "CORS       : 8099=Full CORS | 55055=Basic" -ForegroundColor Cyan
Write-Host "Security   : 8099=Helmet+Rate-limiting | 55055=Basic" -ForegroundColor Cyan
Write-Host "Logging    : 8099=Winston+File | 55055=Console" -ForegroundColor Cyan
Write-Host "API        : 8099=REST API | 55055=File Server" -ForegroundColor Cyan

Write-Host "`n[FUNCTIONAL DIFFERENCES]" -ForegroundColor White
Write-Host "Purpose    : 8099=Gateway/Auth Hub | 55055=Admin Interface" -ForegroundColor Cyan
Write-Host "Users      : 8099=API endpoints | 55055=Web interface" -ForegroundColor Cyan
Write-Host "Sessions   : 8099=JWT tokens | 55055=Simple" -ForegroundColor Cyan
Write-Host "Access     : 8099=External API | 55055=Internal admin" -ForegroundColor Cyan

Write-Host "`n🚀 KẾT LUẬN" -ForegroundColor Green
Write-Host "Port 8099 và 55055 là 2 SERVERS KHÁC NHAU nhưng BỔ SUNG cho nhau:" -ForegroundColor White
Write-Host "• 8099: Gateway/API server cho authentication và user management" -ForegroundColor Cyan
Write-Host "• 55055: Admin panel server cho web interface và file serving" -ForegroundColor Cyan
Write-Host "• Chúng SHARE CHUNG database và tạo thành complete admin system" -ForegroundColor Cyan
Write-Host "• 8099 là ENTRY POINT, 55055 là ADMIN INTERFACE" -ForegroundColor Cyan

Write-Host "`n📱 CÁCH SỬ DỤNG" -ForegroundColor Yellow
Write-Host "1. Truy cập http://localhost:8099 → Auto redirect → Admin Panel" -ForegroundColor White
Write-Host "2. Hoặc trực tiếp http://localhost:55055/admin-panel.html" -ForegroundColor White
Write-Host "3. API calls: http://localhost:8099/api/* (login, users, stats)" -ForegroundColor White
