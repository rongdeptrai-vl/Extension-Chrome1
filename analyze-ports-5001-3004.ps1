# PHÂN TÍCH CHI TIẾT: PORT 5001 & 3004
# Chức năng và vai trò trong hệ thống TINI

Write-Host "=== PHÂN TÍCH PORT 5001 & 3004 ===" -ForegroundColor Yellow

Write-Host "`n🎯 PORT 5001 - API SERVER" -ForegroundColor Cyan
Write-Host "File       : core\api-server.js (500 lines)" -ForegroundColor White
Write-Host "Framework  : Express.js + Advanced Security" -ForegroundColor White
Write-Host "Chức năng  : SECURE API BRIDGE cho Admin Panel" -ForegroundColor White
Write-Host "Database   : SQLite (tini_admin.db) - SHARED" -ForegroundColor White
Write-Host "Tính năng chính:" -ForegroundColor White
Write-Host "  ✅ Passwordless Login với Device Approval" -ForegroundColor Green
Write-Host "  ✅ Employee Registration System" -ForegroundColor Green
Write-Host "  ✅ Advanced Honeypot Protection" -ForegroundColor Green
Write-Host "  ✅ Security Events Logging" -ForegroundColor Green
Write-Host "  ✅ Device ID Binding & Validation" -ForegroundColor Green
Write-Host "  ✅ Role-based Access Control" -ForegroundColor Green
Write-Host "  ✅ Admin Device Sync" -ForegroundColor Green
Write-Host "  ✅ Static File Serving (/admin panel)" -ForegroundColor Green

Write-Host "`n🎯 PORT 3004 - ADMIN DASHBOARD SERVER" -ForegroundColor Cyan
Write-Host "File       : core\admin-dashboard-server.js (209 lines)" -ForegroundColor White
Write-Host "Framework  : Express.js + Socket.IO + Real-time" -ForegroundColor White
Write-Host "Chức năng  : REAL-TIME MONITORING DASHBOARD" -ForegroundColor White
Write-Host "Database   : SQLite (tini_admin.db) - SHARED" -ForegroundColor White
Write-Host "Tính năng chính:" -ForegroundColor White
Write-Host "  ✅ Real-time Monitoring với Socket.IO" -ForegroundColor Green
Write-Host "  ✅ Live System Status Dashboard" -ForegroundColor Green
Write-Host "  ✅ JWT Authentication + bcrypt" -ForegroundColor Green
Write-Host "  ✅ CORS Configuration" -ForegroundColor Green
Write-Host "  ✅ Enhanced Security Controls" -ForegroundColor Green
Write-Host "  ✅ Unified System Activator Integration" -ForegroundColor Green
Write-Host "  ✅ Permission-based Access Control" -ForegroundColor Green

Write-Host "`n🔗 MỐI LIÊN HỆ VÀ PHÂN CÔNG" -ForegroundColor Yellow

Write-Host "`n[ARCHITECTURE ROLES]" -ForegroundColor White
Write-Host "Port 5001: API LAYER" -ForegroundColor Cyan
Write-Host "  - Secure bridge giữa UI và Database" -ForegroundColor Gray
Write-Host "  - Employee management và authentication" -ForegroundColor Gray
Write-Host "  - Security honeypot và threat detection" -ForegroundColor Gray

Write-Host "`nPort 3004: MONITORING LAYER" -ForegroundColor Cyan
Write-Host "  - Real-time dashboard cho admin" -ForegroundColor Gray
Write-Host "  - Live system status và monitoring" -ForegroundColor Gray
Write-Host "  - WebSocket connections cho real-time updates" -ForegroundColor Gray

Write-Host "`n[SHARED COMPONENTS]" -ForegroundColor White
Write-Host "Database   : Cả 2 dùng chung tini_admin.db" -ForegroundColor Cyan
Write-Host "Security   : Cả 2 integrate với SecurityCore" -ForegroundColor Cyan
Write-Host "SQLite     : Cả 2 dùng TINISQLiteAdapter" -ForegroundColor Cyan

Write-Host "`n📊 KIỂM TRA TRẠNG THÁI" -ForegroundColor Yellow

# Check API Server (5001)
$api = netstat -ano | findstr ":5001"
if ($api) {
    Write-Host "✅ API Server (5001): RUNNING" -ForegroundColor Green
    Write-Host "   Details: $api" -ForegroundColor Gray
} else {
    Write-Host "❌ API Server (5001): NOT RUNNING" -ForegroundColor Red
}

# Check Dashboard Server (3004)
$dashboard = netstat -ano | findstr ":3004"
if ($dashboard) {
    Write-Host "✅ Dashboard Server (3004): RUNNING" -ForegroundColor Green
    Write-Host "   Details: $dashboard" -ForegroundColor Gray
} else {
    Write-Host "❌ Dashboard Server (3004): NOT RUNNING" -ForegroundColor Red
}

Write-Host "`n🎭 SO SÁNH CHI TIẾT" -ForegroundColor Yellow

Write-Host "`n[TECHNICAL COMPARISON]" -ForegroundColor White
Write-Host "Lines      : 5001=500 lines | 3004=209 lines" -ForegroundColor Cyan
Write-Host "Real-time  : 5001=Standard HTTP | 3004=Socket.IO" -ForegroundColor Cyan
Write-Host "Security   : 5001=Honeypot+Device | 3004=JWT+Permission" -ForegroundColor Cyan
Write-Host "Purpose    : 5001=Employee API | 3004=Admin Dashboard" -ForegroundColor Cyan
Write-Host "Auth       : 5001=Passwordless | 3004=JWT+bcrypt" -ForegroundColor Cyan

Write-Host "`n[FUNCTIONAL COMPARISON]" -ForegroundColor White
Write-Host "Target     : 5001=Employees | 3004=Administrators" -ForegroundColor Cyan
Write-Host "Access     : 5001=Public API | 3004=Admin-only" -ForegroundColor Cyan
Write-Host "Features   : 5001=Registration+Login | 3004=Monitoring+Control" -ForegroundColor Cyan
Write-Host "Updates    : 5001=Event-driven | 3004=Real-time streams" -ForegroundColor Cyan

Write-Host "`n🚀 WORKFLOW TÍCH HỢP" -ForegroundColor Green

Write-Host "`n[EMPLOYEE WORKFLOW]" -ForegroundColor White
Write-Host "1. Employee → API Server (5001) → Registration/Login" -ForegroundColor Cyan
Write-Host "2. API Server → Validate Device → Grant Access" -ForegroundColor Cyan
Write-Host "3. Activities logged → Shared Database" -ForegroundColor Cyan

Write-Host "`n[ADMIN WORKFLOW]" -ForegroundColor White
Write-Host "1. Admin → Dashboard Server (3004) → Real-time monitoring" -ForegroundColor Cyan
Write-Host "2. Dashboard → Socket.IO → Live updates" -ForegroundColor Cyan
Write-Host "3. Admin controls → System activator → Execute commands" -ForegroundColor Cyan

Write-Host "`n🔧 CÁCH SỬ DỤNG" -ForegroundColor Yellow
Write-Host "API Server (5001):" -ForegroundColor White
Write-Host "  - POST /api/register (Employee registration)" -ForegroundColor Cyan
Write-Host "  - POST /api/login (Passwordless login)" -ForegroundColor Cyan
Write-Host "  - GET /api/health (Health check)" -ForegroundColor Cyan
Write-Host "  - Serves /admin panel static files" -ForegroundColor Cyan

Write-Host "`nDashboard (3004):" -ForegroundColor White
Write-Host "  - Real-time admin dashboard" -ForegroundColor Cyan
Write-Host "  - WebSocket connections for live updates" -ForegroundColor Cyan
Write-Host "  - System monitoring và controls" -ForegroundColor Cyan

Write-Host "`n💡 KẾT LUẬN" -ForegroundColor Green
Write-Host "Port 5001 và 3004 là 2 SERVERS CHUYÊN BIỆT:" -ForegroundColor White
Write-Host "• 5001: EMPLOYEE API - passwordless login, device binding, security" -ForegroundColor Cyan
Write-Host "• 3004: ADMIN DASHBOARD - real-time monitoring, system control" -ForegroundColor Cyan
Write-Host "• Cả 2 share database và security framework" -ForegroundColor Cyan
Write-Host "• 5001 cho employees, 3004 cho administrators" -ForegroundColor Cyan
Write-Host "• Thiết kế microservices với separation of concerns" -ForegroundColor Cyan
