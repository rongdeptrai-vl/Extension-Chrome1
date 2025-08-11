// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Keys bị thiếu và translations
const missingKeys = {
    "security_no_threats": {
        "en": "No security threats detected",
        "vi": "Không phát hiện mối đe dọa bảo mật",
        "hi": "कोई सुरक्षा खतरा नहीं मिला",
        "ko": "보안 위협이 감지되지 않음",
        "zh": "未检测到安全威胁"
    },
    "security_controls_matrix": {
        "en": "Security Controls Matrix",
        "vi": "Ma Trận Kiểm Soát Bảo Mật",
        "hi": "सुरक्षा नियंत्रण मैट्रिक्स",
        "ko": "보안 제어 매트릭스",
        "zh": "安全控制矩阵"
    },
    "btn_refresh": {
        "en": "Refresh",
        "vi": "Làm Mới",
        "hi": "रीफ्रेश",
        "ko": "새로고침",
        "zh": "刷新"
    }
};

// Danh sách ngôn ngữ
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];
const localesPath = path.join(__dirname, '_locales');

console.log('🔧 Adding missing security keys to all languages...\n');

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    
    if (fs.existsSync(filePath)) {
        // Đọc tệp hiện tại
        const currentMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let addedCount = 0;
        
        // Thêm các keys thiếu
        Object.keys(missingKeys).forEach(key => {
            if (!currentMessages[key]) {
                currentMessages[key] = {
                    "message": missingKeys[key][lang]
                };
                addedCount++;
                console.log(`✅ ${lang.toUpperCase()}: Added "${key}" = "${missingKeys[key][lang]}"`);
            }
        });
        
        if (addedCount > 0) {
            // Sắp xếp keys theo thứ tự abc
            const sortedMessages = {};
            Object.keys(currentMessages).sort().forEach(key => {
                sortedMessages[key] = currentMessages[key];
            });
            
            // Ghi lại tệp
            const jsonString = JSON.stringify(sortedMessages, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf8');
            
            console.log(`📊 ${lang.toUpperCase()}: Added ${addedCount} keys, total: ${Object.keys(sortedMessages).length}`);
        } else {
            console.log(`ℹ️  ${lang.toUpperCase()}: All keys already exist`);
        }
    } else {
        console.log(`❌ ${lang.toUpperCase()}: File not found`);
    }
});

console.log('\n✅ Completed adding missing security keys!');
