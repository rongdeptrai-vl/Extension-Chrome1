# 🔧 TINI Admin Panel - Hướng Dẫn Sử Dụng

## 🚀 Khởi Động Admin Panel

### Cách 1: Sử dụng Script (Khuyên dùng)
```bash
# Windows Batch
start-admin-panel.bat

# PowerShell  
.\start-admin-panel.ps1

# Command Line trực tiếp
node admin-dashboard-server.js
```

### Cách 2: Khởi động thủ công
1. Mở Terminal/Command Prompt
2. Chuyển đến thư mục dự án: `cd "c:\Users\Administrator\đcm"`
3. Chạy lệnh: `node admin-dashboard-server.js`

## 🌐 Truy Cập Admin Panel

Sau khi server khởi động thành công, bạn có thể truy cập:

### URL Chính:
- **Primary**: http://localhost:8099
- **Direct**: http://localhost:8099/admin-panel.html
- **Admin Route**: http://localhost:8099/admin

### URL Dự phòng:
- http://127.0.0.1:8099
- http://localhost:3000/admin (nếu có server khác)

## 🔐 Đăng Nhập

### Admin Credentials (Development):
```
Username: admin, boss, ghost_boss, tini_admin
Password: admin123, boss123, ghost123, tini123
hoặc: admin (universal fallback)
```

### Thông qua Extension:
1. Click vào icon TINI Extension
2. Chọn tab "Admin" 
3. Nhập thông tin đăng nhập
4. Click "Admin Login"

## 🛠️ Tính Năng

### ✅ Đã Hoạt Động:
- ✅ SQLite Database Integration
- ✅ Multi-language Support (EN/VI/ZH/HI/KO)
- ✅ Real-time Statistics  
- ✅ Security Monitoring
- ✅ User Management
- ✅ CSP Compliance
- ✅ Production Monitoring

### 🔧 Dashboard Features:
- 📊 Real-time system stats
- 👥 User management
- 🔒 Security monitoring  
- 🌐 Multi-language interface
- 🎛️ Advanced settings
- 📈 Performance metrics

## 🚨 Xử Lý Sự Cố

### Lỗi "ERR_CONNECTION_REFUSED":
1. Kiểm tra server có đang chạy: `netstat -ano | findstr :8099`
2. Khởi động lại server: `node admin-dashboard-server.js`
3. Kiểm tra port conflict: đổi PORT trong file server nếu cần

### Lỗi Content Security Policy:
- ✅ Đã khắc phục trong phiên bản này
- File `popup-csp-handlers.js` xử lý event handlers compliant

### Server không start:
```bash
# Kiểm tra Node.js
node --version

# Kiểm tra port đang sử dụng
netstat -ano | findstr :8099

# Kill process nếu cần
taskkill /PID <PID_NUMBER> /F
```

## 📁 Cấu Trúc File

```
admin panel/
├── admin-panel.html          # Main dashboard
├── sqlite-adapter.js         # Database adapter
├── scripts/                  # JavaScript modules
│   ├── admin-panel-main.js
│   ├── language-system.js
│   └── ...
├── styles/                   # CSS styles
└── api/                      # API endpoints

Popup/
├── popup.html               # Extension popup
├── popup.js                 # Main popup logic
├── popup-csp-handlers.js    # CSP compliant handlers
└── popup.css                # Popup styles
```

## 🔄 Cập Nhật & Backup

### Backup Database:
```bash
copy "admin panel\tini_admin.db" "backup\tini_admin_backup.db"
```

### Update System:
1. Backup current data
2. Pull latest changes
3. Restart server
4. Verify functionality

## 📞 Hỗ Trợ

### Logs & Debug:
- Server logs hiển thị trong console
- Browser DevTools để debug frontend
- Check Network tab cho API calls

### Contact:
- Developer: rongdeptrai-dev
- Project: TINI Security System
- Version: 4.1.0

---

**🎯 Admin Panel đã sẵn sàng sử dụng tại: http://localhost:8099**
