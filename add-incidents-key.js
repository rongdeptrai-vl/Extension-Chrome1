// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Translations cho key "incidents"
const incidentsTranslations = {
    "en": "incidents",
    "vi": "sự cố",
    "hi": "घटनाएं",
    "ko": "인시던트",
    "zh": "事件"
};

// Danh sách ngôn ngữ
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];
const localesPath = path.join(__dirname, '_locales');

console.log('🔧 Adding "incidents" key to all languages...\n');

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    
    if (fs.existsSync(filePath)) {
        // Đọc tệp hiện tại
        const currentMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Thêm key incidents nếu chưa có
        if (!currentMessages.incidents) {
            currentMessages.incidents = {
                "message": incidentsTranslations[lang]
            };
            
            // Sắp xếp keys theo thứ tự abc
            const sortedMessages = {};
            Object.keys(currentMessages).sort().forEach(key => {
                sortedMessages[key] = currentMessages[key];
            });
            
            // Ghi lại tệp
            const jsonString = JSON.stringify(sortedMessages, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf8');
            
            console.log(`✅ ${lang.toUpperCase()}: Added "incidents" = "${incidentsTranslations[lang]}"`);
        } else {
            console.log(`ℹ️  ${lang.toUpperCase()}: "incidents" already exists`);
        }
    } else {
        console.log(`❌ ${lang.toUpperCase()}: File not found`);
    }
});

console.log('\n✅ Completed adding "incidents" key to all languages!');
