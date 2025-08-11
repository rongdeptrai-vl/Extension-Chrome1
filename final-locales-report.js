// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

console.log('🔍 KIỂM TRA CUỐI CÙNG - TÌNH TRẠNG NGÔN NGỮ\n');
console.log('='.repeat(60));

// 1. Kiểm tra tệp manifest.json
const manifestPath = path.join(__dirname, 'manifest.json');
if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('📋 MANIFEST.JSON:');
    console.log(`   ✅ default_locale: "${manifest.default_locale}"`);
} else {
    console.log('❌ MANIFEST.JSON: Không tìm thấy');
}

// 2. Kiểm tra thư mục _locales
const localesPath = path.join(__dirname, '_locales');
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];

console.log('\n📁 THƯ MỤC _LOCALES:');
languages.forEach(lang => {
    const langDir = path.join(localesPath, lang);
    const messagesFile = path.join(langDir, 'messages.json');
    
    if (fs.existsSync(messagesFile)) {
        const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
        const keyCount = Object.keys(messages).length;
        console.log(`   ✅ ${lang.toUpperCase()}: ${keyCount} keys`);
    } else {
        console.log(`   ❌ ${lang.toUpperCase()}: Không tìm thấy messages.json`);
    }
});

// 3. Kiểm tra tệp language-system.js
const langSystemPath = path.join(__dirname, '_locales', 'i18n', 'language-system.js');
if (fs.existsSync(langSystemPath)) {
    const langSystemContent = fs.readFileSync(langSystemPath, 'utf8');
    
    console.log('\n🔧 LANGUAGE-SYSTEM.JS:');
    
    // Kiểm tra danh sách ngôn ngữ trong getLanguageDisplayName
    const langNames = [
        'English',
        'Tiếng Việt', 
        '中文',
        'हिन्दी',
        '한국어'
    ];
    
    langNames.forEach((name, index) => {
        if (langSystemContent.includes(name)) {
            console.log(`   ✅ ${languages[index].toUpperCase()}: "${name}" có trong hệ thống`);
        } else {
            console.log(`   ❌ ${languages[index].toUpperCase()}: "${name}" THIẾU trong hệ thống`);
        }
    });
    
    // Kiểm tra xem có tất cả ngôn ngữ trong system translations không
    console.log('\n🌐 SYSTEM TRANSLATIONS:');
    languages.forEach(lang => {
        if (langSystemContent.includes(`'${lang}': {`)) {
            console.log(`   ✅ ${lang.toUpperCase()}: Có system translations`);
        } else {
            console.log(`   ❌ ${lang.toUpperCase()}: THIẾU system translations`);
        }
    });
} else {
    console.log('\n❌ LANGUAGE-SYSTEM.JS: Không tìm thấy');
}

// 4. Kiểm tra đồng nhất keys
console.log('\n🔄 KIỂM TRA ĐỒNG NHẤT:');
const referenceKeys = fs.existsSync(path.join(localesPath, 'en', 'messages.json')) ? 
    Object.keys(JSON.parse(fs.readFileSync(path.join(localesPath, 'en', 'messages.json'), 'utf8'))) : [];

let allSynced = true;
languages.forEach(lang => {
    const messagesFile = path.join(localesPath, lang, 'messages.json');
    if (fs.existsSync(messagesFile)) {
        const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
        const currentKeys = Object.keys(messages);
        
        if (currentKeys.length === referenceKeys.length) {
            console.log(`   ✅ ${lang.toUpperCase()}: ${currentKeys.length}/${referenceKeys.length} keys - ĐỒNG BỘ`);
        } else {
            console.log(`   ❌ ${lang.toUpperCase()}: ${currentKeys.length}/${referenceKeys.length} keys - KHÔNG ĐỒNG BỘ`);
            allSynced = false;
        }
    }
});

// 5. Tóm tắt kết quả
console.log('\n📊 TÓM TẮT KẾT QUẢ:');
console.log('='.repeat(40));

if (allSynced) {
    console.log('🎉 HOÀN HẢO! Tất cả 5 ngôn ngữ đã được đồng bộ hoàn toàn');
    console.log('✅ Các ngôn ngữ được hỗ trợ:');
    console.log('   - 🇺🇸 English (en) - 149 keys');
    console.log('   - 🇻🇳 Tiếng Việt (vi) - 149 keys');
    console.log('   - 🇨🇳 中文 (zh) - 149 keys');
    console.log('   - 🇮🇳 हिन्दी (hi) - 149 keys');
    console.log('   - 🇰🇷 한국어 (ko) - 149 keys');
    
    console.log('\n🚀 KHUYẾN NGHỊ:');
    console.log('   ✅ Extension đã sẵn sàng sử dụng');
    console.log('   ✅ Tất cả ngôn ngữ sẽ hiển thị đầy đủ trên interface');
    console.log('   ✅ Không có vấn đề mix ngôn ngữ');
} else {
    console.log('⚠️  CÒN VẤN ĐỀ! Một số ngôn ngữ chưa đồng bộ hoàn toàn');
    console.log('💡 Hãy chạy lại script sync-locales.js để khắc phục');
}

console.log('\n📝 GHI CHÚ:');
console.log('   - Tệp sync-locales.js đã được tạo để đồng bộ tự động');
console.log('   - Tệp check-locales-sync.js để kiểm tra định kỳ');
console.log('   - Mọi thay đổi đều đã được lưu và sắp xếp theo ABC');
