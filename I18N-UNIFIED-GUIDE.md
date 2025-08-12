# TINI UNIFIED I18N SYSTEM - HƯỚNG DẪN SỬ DỤNG

## 📋 Tổng quan

Hệ thống **TINI Unified I18n** đã được tối ưu hóa để thay thế tất cả các hệ thống i18n cũ, loại bỏ xung đột và cung cấp một giải pháp thống nhất cho việc quản lý ngôn ngữ.

## 🎯 Tính năng chính

### ✅ Đã hoàn thành
- ✅ **Gộp tất cả file ngôn ngữ** từ các thư mục trùng lặp về 1 nơi
- ✅ **Loại bỏ xung đột** giữa các hệ thống i18n khác nhau
- ✅ **Hệ thống thống nhất** với 1 file master duy nhất
- ✅ **Tự động phát hiện ngôn ngữ** từ browser/settings
- ✅ **Cache tối ưu** để tăng hiệu năng
- ✅ **Backward compatibility** với các hệ thống cũ
- ✅ **Auto-translate** trang web khi thay đổi ngôn ngữ
- ✅ **Format helpers** cho date, time, number, currency
- ✅ **Event system** để lắng nghe thay đổi ngôn ngữ

## 📁 Cấu trúc file mới

```
📁 Project Root/
├── 📄 i18n-master.js              # File chính chứa TINIUnifiedI18n class
├── 📄 init-i18n-master.js         # Script khởi tạo tự động
├── 📄 consolidate-i18n.js         # Script gộp file ngôn ngữ
├── 📄 cleanup-old-i18n.js         # Script dọn dẹp file cũ
├── 📁 _locales/                   # Thư mục ngôn ngữ chính
│   ├── 📁 en/messages.json        # 960+ keys (English)
│   ├── 📁 vi/messages.json        # 244 keys (Vietnamese)
│   ├── 📁 zh/messages.json        # 960+ keys (Chinese) 
│   ├── 📁 hi/messages.json        # 244 keys (Hindi)
│   └── 📁 ko/messages.json        # 244 keys (Korean)
├── 📁 _locales_backup_*/          # Backup các file trùng lặp đã xóa
└── 📁 _old_i18n_backup_*/         # Backup các file i18n cũ đã xóa
```

## 🚀 Cách sử dụng

### 1. Trong HTML

```html
<!-- Load hệ thống i18n mới -->
<script src="../i18n-master.js"></script>
<script src="../init-i18n-master.js"></script>

<!-- Sử dụng data-i18n trong HTML -->
<h1 data-i18n="welcome_message">Welcome</h1>
<button data-i18n="save_button">Save</button>
<input type="text" data-i18n-placeholder="enter_name">
```

### 2. Trong JavaScript

```javascript
// Sử dụng hàm translate toàn cục
const message = t('welcome_message');
const messageWithParams = t('welcome_user', { name: 'John' });

// Thay đổi ngôn ngữ
await setLanguage('vi');
await setLanguage('zh');

// Lấy thông tin ngôn ngữ hiện tại
const currentLang = getCurrentLanguage();
const supportedLangs = getSupportedLanguages();

// Format dữ liệu theo ngôn ngữ
const formattedDate = formatDate(new Date());
const formattedNumber = formatNumber(1234.56);
const formattedCurrency = formatCurrency(1000, 'USD');
```

### 3. Event Listeners

```javascript
// Lắng nghe sự kiện thay đổi ngôn ngữ
window.addEventListener('tini-i18n-languageChanged', (e) => {
    console.log('Language changed to:', e.detail.language);
});

// Lắng nghe khi hệ thống sẵn sàng
window.addEventListener('tini-i18n-ready', (e) => {
    console.log('I18n system ready:', e.detail);
});
```

## 🔧 API Reference

### Global Functions

| Function | Description | Example |
|----------|-------------|---------|
| `t(key, params)` | Translate a key | `t('welcome', {name: 'John'})` |
| `setLanguage(lang)` | Change language | `setLanguage('vi')` |
| `getCurrentLanguage()` | Get current language | `getCurrentLanguage()` |
| `getSupportedLanguages()` | Get all supported languages | `getSupportedLanguages()` |
| `updatePageTranslations()` | Manually update page | `updatePageTranslations()` |

### Format Functions

| Function | Description | Example |
|----------|-------------|---------|
| `formatDate(date, lang)` | Format date | `formatDate(new Date(), 'vi')` |
| `formatTime(time, lang)` | Format time | `formatTime(new Date())` |
| `formatNumber(num, lang)` | Format number | `formatNumber(1234.56)` |
| `formatCurrency(amount, currency, lang)` | Format currency | `formatCurrency(1000, 'USD')` |
| `formatPercentage(value, lang)` | Format percentage | `formatPercentage(85.5)` |
| `formatFileSize(bytes, lang)` | Format file size | `formatFileSize(1048576)` |

### Instance Methods

```javascript
// Truy cập instance chính
const i18n = window.tiniUnifiedI18n;

// Các methods có sẵn
i18n.getMessage(key, substitutions)
i18n.setLanguage(language)
i18n.updatePageContent()
i18n.loadLanguageTranslations(language)
i18n.subscribe(callback)
i18n.getStats()
i18n.clearCache()
```

## 🌐 Ngôn ngữ hỗ trợ

| Code | Language | Flag | Locale |
|------|----------|------|--------|
| `en` | English | 🇺🇸 | en-US |
| `vi` | Tiếng Việt | 🇻🇳 | vi-VN |
| `zh` | 中文 | 🇨🇳 | zh-CN |
| `hi` | हिंदी | 🇮🇳 | hi-IN |
| `ko` | 한국어 | 🇰🇷 | ko-KR |

## 🔄 Backward Compatibility

Hệ thống mới tương thích ngược với:

```javascript
// Chrome Extension i18n API
chrome.i18n.getMessage(key)

// Legacy TINILanguageSystem
TINILanguageSystem.getMessage(key)

// Legacy I18nSystem
window.I18nSystem
window.i18nSystem
window.i18n
window.tiniI18n
```

## ⚡ Hiệu năng

- ✅ **Cache tối ưu**: Tất cả translations được cache trong memory
- ✅ **Lazy loading**: Load ngôn ngữ khi cần thiết
- ✅ **Performance test**: 100 translations trong ~2ms
- ✅ **Memory efficient**: Singleton pattern, không tạo instance trùng lặp

## 🛠️ Quản lý và bảo trì

### Thêm key translation mới

1. Thêm vào file `_locales/en/messages.json`:
```json
{
  "new_feature_title": {
    "message": "New Feature Title"
  }
}
```

2. Chạy script đồng bộ:
```bash
npm run i18n:master
```

### Update tất cả ngôn ngữ

```bash
# Gộp lại các file từ nhiều nguồn
node consolidate-i18n.js

# Dọn dẹp file cũ nếu cần
node cleanup-old-i18n.js
```

### Debug và troubleshooting

```javascript
// Kiểm tra trạng thái hệ thống
console.log('I18n Stats:', window.tiniUnifiedI18n.getStats());

// Kiểm tra translations đã load
console.log('Loaded translations:', window.tiniUnifiedI18n.getAllTranslations());

// Clear cache nếu cần
window.tiniUnifiedI18n.clearCache();

// Test performance
const start = performance.now();
for(let i = 0; i < 100; i++) {
    t('welcome_message');
}
console.log('100 translations took:', performance.now() - start, 'ms');
```

## 🎨 Best Practices

### 1. Naming Convention
```javascript
// ✅ Good
t('user_profile_title')
t('btn_save_changes')
t('error_invalid_email')

// ❌ Avoid
t('title')
t('button')
t('error')
```

### 2. Parameterized Messages
```javascript
// ✅ Good
t('welcome_user', { name: 'John', count: 5 })

// ❌ Avoid
t('welcome') + ' ' + userName
```

### 3. HTML Content
```html
<!-- ✅ For simple text -->
<span data-i18n="simple_text">Default Text</span>

<!-- ✅ For HTML content -->
<div data-i18n-html="rich_content">Default <strong>HTML</strong></div>
```

## 🚨 Migration Notes

### Từ hệ thống cũ sang mới

1. **Không cần thay đổi code hiện tại** - Hệ thống mới tương thích ngược
2. **Remove old script imports** - Đã được tự động cập nhật
3. **Backup data** - Tất cả file cũ đã được backup

### Files đã được di chuyển/xóa

- ✅ `admin-panel/init-i18n.js` → `init-i18n-master.js`
- ✅ `_locales/i18n/*.js` → `i18n-master.js` 
- ✅ `admin-panel/_locales/*` → `_locales/*` (merged)
- ✅ All debug scripts → `_old_i18n_backup_*/`

## 📞 Support

Nếu gặp vấn đề:

1. **Check console** cho error messages
2. **Verify** `window.tiniUnifiedI18n` exists
3. **Test** basic function: `t('loading')`
4. **Check** `window.TINI_I18N_INITIALIZED === true`

## 🔮 Future Enhancements

- [ ] Auto-translate missing keys using AI
- [ ] Real-time language switching without page reload
- [ ] Advanced pluralization rules
- [ ] RTL (Right-to-Left) language support
- [ ] Translation management dashboard
- [ ] Export/Import functionality

---

**© 2024 TINI COMPANY - CONFIDENTIAL**  
*Developed by: rongdeptrai-vl <rongdz2307@gmail.com>*
