// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Danh sách các ngôn ngữ
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];
const localesPath = path.join(__dirname, '_locales');

// Đọc tất cả các tệp messages.json
const loadMessages = (lang) => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {};
};

// Load tất cả messages
const allMessages = {};
languages.forEach(lang => {
    allMessages[lang] = loadMessages(lang);
});

// Lấy tất cả keys từ tiếng Anh (reference)
const referenceKeys = Object.keys(allMessages.en);
console.log(`📊 Reference (EN) has ${referenceKeys.length} keys`);

// Kiểm tra keys thiếu cho từng ngôn ngữ
languages.forEach(lang => {
    const currentKeys = Object.keys(allMessages[lang]);
    console.log(`\n🌐 ${lang.toUpperCase()}: ${currentKeys.length} keys`);
    
    // Keys thiếu
    const missingKeys = referenceKeys.filter(key => !allMessages[lang][key]);
    if (missingKeys.length > 0) {
        console.log(`❌ Missing ${missingKeys.length} keys:`);
        missingKeys.forEach(key => console.log(`   - ${key}`));
    } else {
        console.log(`✅ All keys present`);
    }
    
    // Keys thừa
    const extraKeys = currentKeys.filter(key => !allMessages.en[key]);
    if (extraKeys.length > 0) {
        console.log(`⚠️  Extra ${extraKeys.length} keys:`);
        extraKeys.forEach(key => console.log(`   + ${key}`));
    }
});

// Kiểm tra tính nhất quán cấu trúc
console.log('\n📋 Structure Analysis:');
console.log('='.repeat(50));

const structureIssues = [];
languages.forEach(lang => {
    referenceKeys.forEach(key => {
        if (allMessages[lang][key]) {
            if (!allMessages[lang][key].message) {
                structureIssues.push(`${lang}: "${key}" missing "message" property`);
            }
        }
    });
});

if (structureIssues.length > 0) {
    console.log('❌ Structure issues found:');
    structureIssues.forEach(issue => console.log(`   - ${issue}`));
} else {
    console.log('✅ All structures are consistent');
}
