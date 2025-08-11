# TINI SQLite Database - Tất cả lệnh quản lý
# Hướng dẫn đầy đủ để chạy và quản lý SQLite database

Write-Host "TINI SQLITE DATABASE - LỆNH QUẢN LÝ" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n🚀 1. KHỞI ĐỘNG SQLITE DATABASE SERVER:" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

Write-Host "Lệnh chính (khởi động Panel Server + SQLite):" -ForegroundColor Yellow
Write-Host "npm run start:panel" -ForegroundColor White
Write-Host "HOẶC" -ForegroundColor Gray
Write-Host "node admin-panel/server.js" -ForegroundColor White

Write-Host "`nLệnh với cổng tùy chỉnh:" -ForegroundColor Yellow
Write-Host "cross-env PORT=55055 node admin-panel/server.js" -ForegroundColor White
Write-Host "cross-env PORT=55056 node admin-panel/server.js" -ForegroundColor White

Write-Host "`n🗄️ 2. TẠO VÀ THIẾT LẬP DATABASE:" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "Tạo database mới:" -ForegroundColor Yellow
Write-Host "python admin-panel/create_db.py" -ForegroundColor White

Write-Host "`nThêm dữ liệu mẫu:" -ForegroundColor Yellow
Write-Host "python admin-panel/add_sample_activities.py" -ForegroundColor White

Write-Host "`nKiểm tra database có tồn tại:" -ForegroundColor Yellow
Write-Host "dir admin-panel\tini_admin.db" -ForegroundColor White

Write-Host "`n🔍 3. KIỂM TRA VÀ TEST DATABASE:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "Test kết nối SQLite:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File simple-sqlite-test.ps1" -ForegroundColor White

Write-Host "`nKiểm tra chi tiết database:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File complete-sqlite-test.ps1" -ForegroundColor White

Write-Host "`nKiểm tra server đang chạy:" -ForegroundColor Yellow
Write-Host "netstat -ano | findstr :55055" -ForegroundColor White

Write-Host "`n💻 4. TRUY CẬP DATABASE QUA WEB:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host "Admin Panel (giao diện web):" -ForegroundColor Yellow
Write-Host "http://localhost:55055/admin-panel.html" -ForegroundColor White

Write-Host "`nAPI endpoint chính:" -ForegroundColor Yellow
Write-Host "http://localhost:55055" -ForegroundColor White

Write-Host "`nTest HTTP response:" -ForegroundColor Yellow
Write-Host "Invoke-WebRequest -Uri 'http://localhost:55055' -Method GET" -ForegroundColor White

Write-Host "`n🛠️ 5. LỆNH QUẢN LÝ TRỰC TIẾP SQLITE:" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "Mở SQLite command line (nếu cài đặt):" -ForegroundColor Yellow
Write-Host "sqlite3 admin-panel/tini_admin.db" -ForegroundColor White

Write-Host "`nXem cấu trúc database với Python:" -ForegroundColor Yellow
$sqliteCmd = @'
python -c "
import sqlite3
conn = sqlite3.connect('admin-panel/tini_admin.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\";')
tables = cursor.fetchall()
print('Tables:', [t[0] for t in tables])
cursor.execute('SELECT COUNT(*) FROM users;')
print('Users:', cursor.fetchone()[0])
cursor.execute('SELECT COUNT(*) FROM activities;')  
print('Activities:', cursor.fetchone()[0])
conn.close()
"
'@
Write-Host $sqliteCmd -ForegroundColor White

Write-Host "`n🔄 6. BACKUP VÀ RESTORE DATABASE:" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "Backup database:" -ForegroundColor Yellow
Write-Host "copy admin-panel\tini_admin.db admin-panel\tini_admin_backup.db" -ForegroundColor White

Write-Host "`nRestore database:" -ForegroundColor Yellow
Write-Host "copy admin-panel\tini_admin_backup.db admin-panel\tini_admin.db" -ForegroundColor White

Write-Host "`nXóa database để tạo mới:" -ForegroundColor Yellow
Write-Host "del admin-panel\tini_admin.db" -ForegroundColor White
Write-Host "python admin-panel/create_db.py" -ForegroundColor White

Write-Host "`n⚡ 7. LỆNH NHANH - KHỞI ĐỘNG ĐẦY ĐỦ:" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "Khởi động tất cả server (bao gồm SQLite):" -ForegroundColor Yellow
Write-Host "npm run start:all" -ForegroundColor White

Write-Host "`nKhởi động chỉ Panel + SQLite:" -ForegroundColor Yellow
Write-Host "npm run start:panel" -ForegroundColor White

Write-Host "`nDừng tất cả server:" -ForegroundColor Yellow
Write-Host "taskkill /f /im node.exe" -ForegroundColor White

Write-Host "`n🏃‍♂️ 8. DEMO - CHẠY SQLITE NGAY BÂY GIỜ:" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "Bước 1: Kiểm tra database" -ForegroundColor Yellow
if (Test-Path "admin-panel\tini_admin.db") {
    $dbSize = [math]::Round((Get-Item "admin-panel\tini_admin.db").Length / 1KB, 1)
    Write-Host "✅ Database đã tồn tại ($dbSize KB)" -ForegroundColor Green
} else {
    Write-Host "❌ Database chưa tồn tại - cần tạo" -ForegroundColor Red
    Write-Host "Chạy: python admin-panel/create_db.py" -ForegroundColor White
}

Write-Host "`nBước 2: Kiểm tra server" -ForegroundColor Yellow
$serverRunning = netstat -ano | findstr ":55055"
if ($serverRunning) {
    Write-Host "✅ SQLite Database Server đang chạy!" -ForegroundColor Green
    Write-Host "👉 Truy cập: http://localhost:55055/admin-panel.html" -ForegroundColor Cyan
} else {
    Write-Host "❌ Server chưa chạy" -ForegroundColor Red
    Write-Host "👉 Chạy ngay: npm run start:panel" -ForegroundColor Cyan
}

Write-Host "`n📚 9. TÀI LIỆU THAM KHẢO:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "- File chính: admin-panel/server.js" -ForegroundColor White
Write-Host "- Database: admin-panel/tini_admin.db" -ForegroundColor White  
Write-Host "- Adapter: admin-panel/sqlite-init/sqlite-adapter.js" -ForegroundColor White
Write-Host "- Config: admin-panel/sqlite-init/" -ForegroundColor White
Write-Host "- Scripts: admin-panel/create_db.py, add_sample_activities.py" -ForegroundColor White

Write-Host "`n💡 LƯU Ý QUAN TRỌNG:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "- SQLite database tích hợp với Panel Server" -ForegroundColor White
Write-Host "- Không cần cài đặt SQLite riêng" -ForegroundColor White
Write-Host "- Database tự động tạo khi chạy lần đầu" -ForegroundColor White
Write-Host "- Có thể truy cập qua web interface" -ForegroundColor White
Write-Host "- Hỗ trợ cả API và giao diện admin" -ForegroundColor White
