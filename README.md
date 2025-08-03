# Internationalization Project

## Mô tả
Dự án này chứa các file ngôn ngữ (localization) cho một browser extension/web application.

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

## Liên hệ
- Tác giả: Administrator
- Email: admin@localhost.com
- Ngày tạo: 03/08/2025
