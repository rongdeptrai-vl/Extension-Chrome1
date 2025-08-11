// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Cấu hình bản dịch cho các keys thiếu
const missingTranslations = {
    "btn_export_data": {
        "vi": "Xuất Dữ Liệu",
        "hi": "डेटा निर्यात करें",
        "ko": "데이터 내보내기"
    },
    "analytics_avg_session": {
        "vi": "Phiên Trung Bình",
        "hi": "औसत सत्र",
        "ko": "평균 세션"
    },
    "analytics_bounce_rate": {
        "vi": "Tỷ Lệ Thoát",
        "hi": "बाउंस दर",
        "ko": "이탈률"
    },
    "analytics_conversion_rate": {
        "vi": "Tỷ Lệ Chuyển Đổi",
        "hi": "रूपांतरण दर",
        "ko": "전환율"
    },
    "analytics_user_retention": {
        "vi": "Giữ Chân Người Dùng",
        "hi": "उपयोगकर्ता प्रतिधारण",
        "ko": "사용자 유지"
    },
    "analytics_traffic_title": {
        "vi": "Phân Tích Lưu Lượng",
        "hi": "ट्रैफिक एनालिटिक्स",
        "ko": "트래픽 분석"
    },
    "analytics_performance_title": {
        "vi": "Số Liệu Hiệu Suất",
        "hi": "प्रदर्शन मेट्रिक्स",
        "ko": "성능 지표"
    },
    "analytics_retention_title": {
        "vi": "Phân Tích Giữ Chân Người Dùng",
        "hi": "उपयोगकर्ता प्रतिधारण विश्लेषण",
        "ko": "사용자 유지 분석"
    },
    "analytics_security_title": {
        "vi": "Phân Tích Bảo Mật",
        "hi": "सुरक्षा एनालिटिक्स",
        "ko": "보안 분석"
    },
    "metric_active_users": {
        "vi": "NGƯỜI DÙNG HOẠT ĐỘNG",
        "hi": "सक्रिय उपयोगकर्ता",
        "ko": "활성 사용자"
    },
    "metric_response_time": {
        "vi": "THỜI GIAN PHẢN HỒI",
        "hi": "प्रतिक्रिया समय",
        "ko": "응답 시간"
    },
    "metric_retention_rate": {
        "vi": "TỶ LỆ GIỮ CHÂN",
        "hi": "प्रतिधारण दर",
        "ko": "유지율"
    },
    "metric_threat_level": {
        "vi": "MỨC ĐỘ Đ威 HẠI",
        "hi": "खतरे का स्तर",
        "ko": "위험 수준"
    }
};

// Danh sách ngôn ngữ cần đồng bộ
const languagesToSync = ['vi', 'hi', 'ko'];
const localesPath = path.join(__dirname, '_locales');

console.log('🔄 Bắt đầu đồng bộ hóa ngôn ngữ...\n');

languagesToSync.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    
    if (fs.existsSync(filePath)) {
        // Đọc tệp hiện tại
        const currentMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📝 Xử lý ${lang.toUpperCase()}...`);
        
        // Thêm các keys thiếu
        let addedCount = 0;
        Object.keys(missingTranslations).forEach(key => {
            if (!currentMessages[key] && missingTranslations[key][lang]) {
                currentMessages[key] = {
                    "message": missingTranslations[key][lang]
                };
                addedCount++;
                console.log(`   ✅ Thêm: ${key} = "${missingTranslations[key][lang]}"`);
            }
        });
        
        // Sắp xếp keys theo thứ tự abc
        const sortedMessages = {};
        Object.keys(currentMessages).sort().forEach(key => {
            sortedMessages[key] = currentMessages[key];
        });
        
        // Ghi lại tệp với format đẹp
        const jsonString = JSON.stringify(sortedMessages, null, 2);
        fs.writeFileSync(filePath, jsonString, 'utf8');
        
        console.log(`   📊 Đã thêm ${addedCount} keys mới`);
        console.log(`   📄 Tổng cộng: ${Object.keys(sortedMessages).length} keys\n`);
    } else {
        console.log(`❌ Không tìm thấy tệp: ${filePath}\n`);
    }
});

console.log('✅ Hoàn thành đồng bộ hóa tất cả ngôn ngữ!');
console.log('\n🔍 Chạy lại kiểm tra để xác nhận...');

// Chạy lại kiểm tra
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];

const loadMessages = (lang) => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {};
};

const allMessages = {};
languages.forEach(lang => {
    allMessages[lang] = loadMessages(lang);
});

const referenceKeys = Object.keys(allMessages.en);
console.log(`\n📊 Kết quả sau đồng bộ:`);
console.log('='.repeat(40));

languages.forEach(lang => {
    const currentKeys = Object.keys(allMessages[lang]);
    const missingKeys = referenceKeys.filter(key => !allMessages[lang][key]);
    
    if (missingKeys.length === 0) {
        console.log(`✅ ${lang.toUpperCase()}: ${currentKeys.length}/${referenceKeys.length} keys - HOÀN CHỈNH`);
    } else {
        console.log(`❌ ${lang.toUpperCase()}: ${currentKeys.length}/${referenceKeys.length} keys - Thiếu ${missingKeys.length} keys`);
    }
});
