// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Tất cả keys bị thiếu từ log với translations
const missingKeys = {
    "data_processing": {
        "en": "Data Processing",
        "vi": "Xử Lý Dữ Liệu",
        "hi": "डेटा प्रसंस्करण",
        "ko": "데이터 처리",
        "zh": "数据处理"
    },
    "real_time_monitoring": {
        "en": "Real-time Monitoring",
        "vi": "Giám Sát Thời Gian Thực",
        "hi": "वास्तविक समय निगरानी",
        "ko": "실시간 모니터링",
        "zh": "实时监控"
    },
    "automated_responses": {
        "en": "Automated Responses",
        "vi": "Phản Hồi Tự Động",
        "hi": "स्वचालित प्रतिक्रियाएं",
        "ko": "자동 응답",
        "zh": "自动响应"
    },
    "data_backup": {
        "en": "Data Backup",
        "vi": "Sao Lưu Dữ Liệu",
        "hi": "डेटा बैकअप",
        "ko": "데이터 백업",
        "zh": "数据备份"
    },
    "system_optimization": {
        "en": "System Optimization",
        "vi": "Tối Ưu Hóa Hệ Thống",
        "hi": "सिस्टम अनुकूलन",
        "ko": "시스템 최적화",
        "zh": "系统优化"
    },
    "security_scanning": {
        "en": "Security Scanning",
        "vi": "Quét Bảo Mật",
        "hi": "सुरक्षा स्कैनिंग",
        "ko": "보안 스캔",
        "zh": "安全扫描"
    },
    "user_authentication": {
        "en": "User Authentication",
        "vi": "Xác Thực Người Dùng",
        "hi": "उपयोगकर्ता प्रमाणीकरण",
        "ko": "사용자 인증",
        "zh": "用户认证"
    },
    "network_analysis": {
        "en": "Network Analysis",
        "vi": "Phân Tích Mạng",
        "hi": "नेटवर्क विश्लेषण",
        "ko": "네트워크 분석",
        "zh": "网络分析"
    },
    "performance_tuning": {
        "en": "Performance Tuning",
        "vi": "Điều Chỉnh Hiệu Suất",
        "hi": "प्रदर्शन ट्यूनिंग",
        "ko": "성능 튜닝",
        "zh": "性能调优"
    },
    "error_handling": {
        "en": "Error Handling",
        "vi": "Xử Lý Lỗi",
        "hi": "त्रुटि संचालन",
        "ko": "오류 처리",
        "zh": "错误处理"
    },
    "api_integration": {
        "en": "API Integration",
        "vi": "Tích Hợp API",
        "hi": "एपीआई एकीकरण",
        "ko": "API 통합",
        "zh": "API集成"
    },
    "user_management": {
        "en": "User Management",
        "vi": "Quản Lý Người Dùng",
        "hi": "उपयोगकर्ता प्रबंधन",
        "ko": "사용자 관리",
        "zh": "用户管理"
    },
    "access_control": {
        "en": "Access Control",
        "vi": "Kiểm Soát Truy Cập",
        "hi": "पहुंच नियंत्रण",
        "ko": "접근 제어",
        "zh": "访问控制"
    },
    "audit_logging": {
        "en": "Audit Logging",
        "vi": "Ghi Log Kiểm Toán",
        "hi": "ऑडिट लॉगिंग",
        "ko": "감사 로깅",
        "zh": "审计日志"
    },
    "threat_detection": {
        "en": "Threat Detection",
        "vi": "Phát Hiện Mối Đe Dọa",
        "hi": "खतरा का पता लगाना",
        "ko": "위협 탐지",
        "zh": "威胁检测"
    },
    "compliance_monitoring": {
        "en": "Compliance Monitoring",
        "vi": "Giám Sát Tuân Thủ",
        "hi": "अनुपालन निगरानी",
        "ko": "규정 준수 모니터링",
        "zh": "合规监控"
    },
    "incident_response": {
        "en": "Incident Response",
        "vi": "Phản Ứng Sự Cố",
        "hi": "घटना प्रतिक्रिया",
        "ko": "인시던트 대응",
        "zh": "事件响应"
    },
    "vulnerability_assessment": {
        "en": "Vulnerability Assessment",
        "vi": "Đánh Giá Lỗ Hổng",
        "hi": "भेद्यता मूल्यांकन",
        "ko": "취약성 평가",
        "zh": "漏洞评估"
    },
    "encryption_management": {
        "en": "Encryption Management",
        "vi": "Quản Lý Mã Hóa",
        "hi": "एन्क्रिप्शन प्रबंधन",
        "ko": "암호화 관리",
        "zh": "加密管理"
    },
    "backup_recovery": {
        "en": "Backup & Recovery",
        "vi": "Sao Lưu & Khôi Phục",
        "hi": "बैकअप और रिकवरी",
        "ko": "백업 및 복구",
        "zh": "备份与恢复"
    },
    "system_health": {
        "en": "System Health",
        "vi": "Sức Khỏe Hệ Thống",
        "hi": "सिस्टम स्वास्थ्य",
        "ko": "시스템 상태",
        "zh": "系统健康"
    },
    "resource_utilization": {
        "en": "Resource Utilization",
        "vi": "Sử Dụng Tài Nguyên",
        "hi": "संसाधन उपयोग",
        "ko": "리소스 활용",
        "zh": "资源利用"
    },
    "load_balancing": {
        "en": "Load Balancing",
        "vi": "Cân Bằng Tải",
        "hi": "लोड बैलेंसिंग",
        "ko": "로드 밸런싱",
        "zh": "负载均衡"
    },
    "cache_management": {
        "en": "Cache Management",
        "vi": "Quản Lý Cache",
        "hi": "कैश प्रबंधन",
        "ko": "캐시 관리",
        "zh": "缓存管理"
    },
    "database_optimization": {
        "en": "Database Optimization",
        "vi": "Tối Ưu Cơ Sở Dữ Liệu",
        "hi": "डेटाबेस अनुकूलन",
        "ko": "데이터베이스 최적화",
        "zh": "数据库优化"
    },
    "session_management": {
        "en": "Session Management",
        "vi": "Quản Lý Phiên",
        "hi": "सत्र प्रबंधन",
        "ko": "세션 관리",
        "zh": "会话管理"
    },
    "configuration_management": {
        "en": "Configuration Management",
        "vi": "Quản Lý Cấu Hình",
        "hi": "कॉन्फ़िगरेशन प्रबंधन",
        "ko": "구성 관리",
        "zh": "配置管理"
    },
    "deployment_automation": {
        "en": "Deployment Automation",
        "vi": "Tự Động Triển Khai",
        "hi": "परिनियोजन स्वचालन",
        "ko": "배포 자동화",
        "zh": "部署自动化"
    },
    "version_control": {
        "en": "Version Control",
        "vi": "Kiểm Soát Phiên Bản",
        "hi": "संस्करण नियंत्रण",
        "ko": "버전 관리",
        "zh": "版本控制"
    },
    "quality_assurance": {
        "en": "Quality Assurance",
        "vi": "Đảm Bảo Chất Lượng",
        "hi": "गुणवत्ता आश्वासन",
        "ko": "품질 보증",
        "zh": "质量保证"
    },
    "continuous_integration": {
        "en": "Continuous Integration",
        "vi": "Tích Hợp Liên Tục",
        "hi": "निरंतर एकीकरण",
        "ko": "지속적 통합",
        "zh": "持续集成"
    },
    "monitoring_alerts": {
        "en": "Monitoring & Alerts",
        "vi": "Giám Sát & Cảnh Báo",
        "hi": "निगरानी और अलर्ट",
        "ko": "모니터링 및 알림",
        "zh": "监控与警报"
    },
    "log_analysis": {
        "en": "Log Analysis",
        "vi": "Phân Tích Log",
        "hi": "लॉग विश्लेषण",
        "ko": "로그 분석",
        "zh": "日志分析"
    },
    "metrics_collection": {
        "en": "Metrics Collection",
        "vi": "Thu Thập Số Liệu",
        "hi": "मेट्रिक्स संग्रह",
        "ko": "메트릭 수집",
        "zh": "指标收集"
    },
    "dashboard_customization": {
        "en": "Dashboard Customization",
        "vi": "Tùy Chỉnh Bảng Điều Khiển",
        "hi": "डैशबोर्ड अनुकूलन",
        "ko": "대시보드 커스터마이징",
        "zh": "仪表板定制"
    },
    "report_generation": {
        "en": "Report Generation",
        "vi": "Tạo Báo Cáo",
        "hi": "रिपोर्ट जेनरेशन",
        "ko": "보고서 생성",
        "zh": "报告生成"
    },
    "data_visualization": {
        "en": "Data Visualization",
        "vi": "Trực Quan Hóa Dữ Liệu",
        "hi": "डेटा विज़ुअलाइज़ेशन",
        "ko": "데이터 시각화",
        "zh": "数据可视化"
    },
    "trend_analysis": {
        "en": "Trend Analysis",
        "vi": "Phân Tích Xu Hướng",
        "hi": "ट्रेंड विश्लेषण",
        "ko": "트렌드 분석",
        "zh": "趋势分析"
    },
    "predictive_analytics": {
        "en": "Predictive Analytics",
        "vi": "Phân Tích Dự Đoán",
        "hi": "भविष्यसूचक विश्लेषण",
        "ko": "예측 분석",
        "zh": "预测分析"
    },
    "machine_learning": {
        "en": "Machine Learning",
        "vi": "Học Máy",
        "hi": "मशीन लर्निंग",
        "ko": "머신 러닝",
        "zh": "机器学习"
    },
    "artificial_intelligence": {
        "en": "Artificial Intelligence",
        "vi": "Trí Tuệ Nhân Tạo",
        "hi": "कृत्रिम बुद्धिमत्ता",
        "ko": "인공지능",
        "zh": "人工智能"
    }
};

// Danh sách ngôn ngữ
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];
const localesPath = path.join(__dirname, '_locales');

console.log('🔧 Adding missing keys from log to all languages...\n');

let totalAdded = 0;

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    
    if (fs.existsSync(filePath)) {
        // Đọc tệp hiện tại
        const currentMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let addedCount = 0;
        
        console.log(`📝 Processing ${lang.toUpperCase()}...`);
        
        // Thêm từng key thiếu
        Object.keys(missingKeys).forEach(key => {
            if (!currentMessages[key] && missingKeys[key][lang]) {
                currentMessages[key] = {
                    "message": missingKeys[key][lang]
                };
                addedCount++;
                console.log(`   ✅ Added: ${key} = "${missingKeys[key][lang]}"`);
            }
        });
        
        if (addedCount > 0) {
            // Sắp xếp keys theo thứ tự abc
            const sortedMessages = {};
            Object.keys(currentMessages).sort().forEach(key => {
                sortedMessages[key] = currentMessages[key];
            });
            
            // Ghi lại tệp với format đẹp
            const jsonString = JSON.stringify(sortedMessages, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf8');
            
            console.log(`   📊 Added ${addedCount} new keys`);
            totalAdded += addedCount;
        } else {
            console.log(`   ℹ️  No new keys needed`);
        }
        
        console.log(`   📄 Total keys: ${Object.keys(currentMessages).length}\n`);
    } else {
        console.log(`❌ ${lang.toUpperCase()}: File not found\n`);
    }
});

console.log(`✅ Completed! Added ${totalAdded} total keys across all languages.`);
console.log(`\n🔄 Next steps:`);
console.log(`1. Copy updated _locales to admin-panel: Copy-Item -Path "_locales" -Destination "admin-panel\\_locales" -Recurse -Force`);
console.log(`2. Refresh the browser to see changes`);
console.log(`3. All missing translation keys should now be resolved!`);
