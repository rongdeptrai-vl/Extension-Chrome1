# Internationalization Project

## Mô tả
Dự án này chứa các file ngôn ngữ (localization) cho một browser extension/web application.

> Lưu ý: Repo cũng bao gồm hệ thống dịch vụ (Unified Gateway, API, Admin Panel, Dashboard). Xem phần Hướng dẫn chạy hệ thống bên dưới.

## Cấu trúc thư mục
```
_locales/
├── en/
│   └── messages.json    # Tiếng Anh
├── hi/
│   └── messages.json    # Tiếng Hindi
├── ko/
│   └── messages.json    # Tiếng Hàn
└── zh/
    └── messages.json    # Tiếng Trung
```

## Lịch sử khôi phục
- **Ngày**: 03/08/2025
- **Vấn đề**: Dự án đã bị xóa vĩnh viễn do sự cố
- **Giải pháp**: Khôi phục từ VS Code state database và tạo lại file locales
- **Backup**: Đã thiết lập Git repository để bảo vệ dữ liệu

## Các bước bảo vệ dữ liệu trong tương lai

### 1. Sử dụng Git thường xuyên
```bash
# Ví dụ
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```

### 2. Thiết lập auto-backup
- Kích hoạt Windows Backup
- Sử dụng cloud storage (Google Drive, OneDrive)
- Thiết lập GitHub/GitLab repository

### 3. Best practices
- Commit code thường xuyên (ít nhất 1 lần/ngày)
- Tạo branch cho các tính năng mới
- Không xóa file trực tiếp, sử dụng git để quản lý
- Backup workspace settings của VS Code

## Hướng dẫn thêm ngôn ngữ mới

1. Tạo thư mục mới trong `_locales/` với mã ngôn ngữ (VD: `vi` cho tiếng Việt)
2. Copy file `en/messages.json` vào thư mục mới
3. Dịch các message values sang ngôn ngữ mới
4. Commit và push changes

---

# Hướng dẫn chạy hệ thống dịch vụ

## 1) Tạo file môi trường
Sao chép file `.env.example` thành `.env` và chỉnh sửa giá trị phù hợp:

Các biến quan trọng:
- PORT, NODE_ENV, JWT_SECRET, ALLOWED_ORIGINS, ADMIN_PANEL_URL
- HONEYPOT_* (chỉ dùng cho dữ liệu giả lập honeypot, không chứa bí mật thật)
- BYPASS_TOKEN_PREFIX
- PORT cho Panel/Dashboard/API (nếu cần)

## 2) Cài đặt dependencies
```powershell
npm install
```

## 3) Chạy nhanh toàn bộ stack
```powershell
npm run start:all
```
Stack mặc định:
- Unified Gateway: http://localhost:8099
- API Server: http://localhost:5001
- Admin Panel: http://localhost:55055
- Admin Dashboard: http://localhost:3004

Nếu bị trùng port, các dịch vụ có fallback nội bộ.

## 4) Biến môi trường Honeypot (tùy chọn)
Các giá trị mồi nhử có thể override qua `.env` bằng tiền tố `HONEYPOT_`.
Ví dụ:
```env
HONEYPOT_API_KEY_PREFIX=trap_
HONEYPOT_CONFIG_SECRET=honeypot_secret_not_real
```

## 5) Thay đổi prefix token cho Bypass Integration (client-side demo)
```env
BYPASS_TOKEN_PREFIX=bypass_
```

## 6) Health check
```powershell
# Unified Gateway
Invoke-WebRequest http://localhost:8099/healthz | Select-Object -ExpandProperty Content
```

## Ghi chú bảo mật
- Không commit `.env` thật vào repo.
- Các biến `HONEYPOT_*` chỉ phục vụ giả lập mồi nhử, không phải bí mật hệ thống.

## Liên hệ
- Tác giả: Administrator
- Email: admin@localhost.com
- Ngày tạo: 03/08/2025
