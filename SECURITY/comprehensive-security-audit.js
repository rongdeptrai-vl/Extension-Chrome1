// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// ⚠️ XSS WARNING: innerHTML usage detected - potential XSS vulnerability
// Use window.secureSetHTML(element, content) instead of element.innerHTML = content
// Or use element.textContent for plain text

// ⚠️ SECURITY WARNING: localStorage usage detected
// Consider using secure storage methods to prevent XSS attacks
// Use window.secureSetStorage(), window.secureGetStorage(), window.secureRemoveStorage()
/**
 * KIỂM TRA BẢO MẬT TOÀN DIỆN
 * Phân tích nguy cơ và đánh giá hoạt động thực sự của hệ thống
 * Author: rongdeptrai-dev & GitHub Copilot
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ComprehensiveSecurityAudit {
    constructor() {
        this.auditResults = {
            timestamp: new Date().toISOString(),
            totalFiles: 0,
            securityFiles: 0,
            vulnerabilities: [],
            risks: [],
            recommendations: [],
            fileAnalysis: {},
            systemStatus: {}
        };
        
        this.criticalPaths = [
            'SECURITY',
            'Script', 
            'src',
            'SYSTEM',
            'Ghost',
            'Popup'
        ];
        
        this.dangerousPatterns = [
            /eval\s*\(/gi,
            /new\s+Function\s*\(/gi,
            /document\.write\s*\(/gi,
            /innerHTML\s*=/gi,
            /outerHTML\s*=/gi,
            /exec\s*\(/gi,
            /spawn\s*\(/gi,
            /require\s*\(\s*['"]\s*child_process\s*['"]\s*\)/gi,
            /process\.env/gi,
            /localStorage\./gi,
            /sessionStorage\./gi,
            /\.cookie/gi,
            /atob\s*\(/gi,
            /btoa\s*\(/gi,
            /XMLHttpRequest/gi,
            /fetch\s*\(/gi,
            /WebSocket/gi,
            /postMessage/gi,
            /addEventListener/gi,
            /setTimeout/gi,
            /setInterval/gi
        ];
        
        this.securityKeywords = [
            'password', 'token', 'secret', 'key', 'auth', 'login',
            'admin', 'boss', 'user', 'session', 'cookie', 'hash',
            'encrypt', 'decrypt', 'crypto', 'security', 'block',
            'honeypot', 'attack', 'malicious', 'suspicious', 'threat'
        ];
    }

    async runCompleteAudit() {
        console.log('\n🔍 === KIỂM TRA BẢO MẬT TOÀN DIỆN ===');
        console.log('📅 Thời gian:', this.auditResults.timestamp);
        console.log('🎯 Mục tiêu: Phát hiện nguy cơ cho Admin và Users\n');

        try {
            // 1. Quét tất cả file JavaScript
            await this.scanAllJavaScriptFiles();
            
            // 2. Phân tích file bảo mật chính
            await this.analyzeSecurityFiles();
            
            // 3. Kiểm tra cấu hình và quyền truy cập
            await this.checkAccessControls();
            
            // 4. Phân tích mã độc và lỗ hổng
            await this.detectVulnerabilities();
            
            // 5. Kiểm tra hoạt động thực sự vs giả lập
            await this.validateRealFunctionality();
            
            // 6. Đánh giá nguy cơ cho Admin và Users
            await this.assessUserRisks();
            
            // 7. Tạo báo cáo tổng hợp
            this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ Lỗi trong quá trình kiểm tra:', error);
            this.auditResults.vulnerabilities.push({
                type: 'AUDIT_ERROR',
                severity: 'HIGH',
                description: `Lỗi hệ thống kiểm tra: ${error.message}`,
                file: 'audit-system',
                impact: 'Không thể hoàn thành kiểm tra bảo mật'
            });
        }
    }

    async scanAllJavaScriptFiles() {
        console.log('📂 1. QUÉT TẤT CẢ FILE JAVASCRIPT...');
        
        const scanDirectory = async (dirPath) => {
            try {
                const items = fs.readdirSync(dirPath);
                
                for (const item of items) {
                    const fullPath = path.join(dirPath, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && !item.includes('node_modules')) {
                        await scanDirectory(fullPath);
                    } else if (item.endsWith('.js')) {
                        this.auditResults.totalFiles++;
                        await this.analyzeJavaScriptFile(fullPath);
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Không thể quét thư mục ${dirPath}: ${error.message}`);
            }
        };

        await scanDirectory(process.cwd());
        console.log(`✅ Đã quét ${this.auditResults.totalFiles} file JavaScript`);
    }

    async analyzeJavaScriptFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(process.cwd(), filePath);
            
            const analysis = {
                path: relativePath,
                size: content.length,
                lines: content.split('\n').length,
                dangerousPatterns: [],
                securityFeatures: [],
                riskLevel: 'LOW',
                isSecurityFile: false
            };

            // Kiểm tra pattern nguy hiểm
            for (const pattern of this.dangerousPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    analysis.dangerousPatterns.push({
                        pattern: pattern.toString(),
                        count: matches.length,
                        examples: matches.slice(0, 3)
                    });
                }
            }

            // Kiểm tra keywords bảo mật
            for (const keyword of this.securityKeywords) {
                const regex = new RegExp(keyword, 'gi');
                const matches = content.match(regex);
                if (matches) {
                    analysis.securityFeatures.push({
                        keyword: keyword,
                        count: matches.length
                    });
                }
            }

            // Xác định mức độ rủi ro
            if (analysis.dangerousPatterns.length > 5) {
                analysis.riskLevel = 'HIGH';
            } else if (analysis.dangerousPatterns.length > 2) {
                analysis.riskLevel = 'MEDIUM';
            }

            // File bảo mật?
            if (relativePath.includes('SECURITY') || relativePath.includes('security')) {
                analysis.isSecurityFile = true;
                this.auditResults.securityFiles++;
            }

            this.auditResults.fileAnalysis[relativePath] = analysis;

            // Báo cáo file nguy hiểm
            if (analysis.riskLevel === 'HIGH') {
                console.log(`🚨 File nguy hiểm: ${relativePath} (${analysis.dangerousPatterns.length} patterns)`);
            }

        } catch (error) {
            console.warn(`⚠️  Không thể phân tích file ${filePath}: ${error.message}`);
        }
    }

    async analyzeSecurityFiles() {
        console.log('\n🛡️  2. PHÂN TÍCH FILE BẢO MẬT CHÍNH...');
        
        const securityFiles = [
            'SECURITY/ultimate-security.js',
            'SECURITY/real-working-security.js', 
            'SECURITY/REAL-ULTIMATE-SECURITY.js',
            'SECURITY/network-interruption-shield.js',
            'SECURITY/system-integration-test.js'
        ];

        for (const file of securityFiles) {
            await this.analyzeSecurityFileFunction(file);
        }
    }

    async analyzeSecurityFileFunction(filePath) {
        try {
            const fullPath = path.join(process.cwd(), filePath);
            if (!fs.existsSync(fullPath)) {
                this.auditResults.vulnerabilities.push({
                    type: 'MISSING_SECURITY_FILE',
                    severity: 'HIGH',
                    description: `File bảo mật quan trọng bị thiếu: ${filePath}`,
                    file: filePath,
                    impact: 'Hệ thống bảo mật không hoàn chỉnh'
                });
                console.log(`❌ File bảo mật thiếu: ${filePath}`);
                return;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`✅ Phân tích: ${filePath} (${content.length} ký tự)`);

            // Kiểm tra hoạt động thực sự
            const hasRealImplementation = this.checkRealImplementation(content);
            const hasSimulation = this.checkSimulationCode(content);

            if (hasSimulation && !hasRealImplementation) {
                this.auditResults.vulnerabilities.push({
                    type: 'FAKE_SECURITY',
                    severity: 'CRITICAL',
                    description: `File ${filePath} chỉ có mã giả lập, không có bảo vệ thực sự`,
                    file: filePath,
                    impact: 'Bảo mật giả, không bảo vệ được hệ thống'
                });
                console.log(`🚨 CẢNH BÁO: ${filePath} chỉ là giả lập!`);
            }

            // Kiểm tra lỗ hổng bảo mật
            this.checkSecurityVulnerabilities(content, filePath);

        } catch (error) {
            console.error(`❌ Lỗi phân tích ${filePath}:`, error.message);
        }
    }

    checkRealImplementation(content) {
        const realPatterns = [
            /fs\.writeFileSync|fs\.readFileSync/gi,
            /crypto\.createHash|crypto\.randomBytes/gi,
            /new\s+Set\(\)|new\s+Map\(\)/gi,
            /JSON\.stringify.*fs\.writeFileSync/gi,
            /blockedIPs\.add\(|blockedIPs\.has\(/gi,
            /sessions\.set\(|sessions\.get\(/gi,
            /throw\s+new\s+Error/gi,
            /return\s+false|return\s+\{.*valid:\s*false/gi
        ];

        return realPatterns.some(pattern => pattern.test(content));
    }

    checkSimulationCode(content) {
        const simPatterns = [
            /console\.log.*fake|console\.log.*mock|console\.log.*simulation/gi,
            /return\s+true.*\/\/.*fake|return\s+true.*\/\/.*mock/gi,
            /\/\/.*TODO.*implement|\/\/.*FIXME|\/\/.*MOCK/gi,
            /Math\.random\(\)\s*>\s*0\.[5-9]/gi,
            /setTimeout.*return/gi
        ];

        return simPatterns.some(pattern => pattern.test(content));
    }

    checkSecurityVulnerabilities(content, filePath) {
        // Kiểm tra hardcoded passwords
        const passwordPatterns = [
            /password\s*=\s*['"`][^'"`]+['"`]/gi,
            /admin.*password.*['"`][^'"`]+['"`]/gi,
            /secret\s*=\s*['"`][^'"`]+['"`]/gi
        ];

        for (const pattern of passwordPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                this.auditResults.vulnerabilities.push({
                    type: 'HARDCODED_CREDENTIALS',
                    severity: 'HIGH',
                    description: `Mật khẩu hardcode trong file ${filePath}`,
                    file: filePath,
                    evidence: matches.slice(0, 2),
                    impact: 'Thông tin đăng nhập có thể bị lộ'
                });
            }
        }

        // Kiểm tra SQL injection risks
        if (/sql|query|database/gi.test(content) && /\$\{.*\}|\+.*req\.|concat/gi.test(content)) {
            this.auditResults.vulnerabilities.push({
                type: 'SQL_INJECTION_RISK',
                severity: 'HIGH',
                description: `Nguy cơ SQL injection trong ${filePath}`,
                file: filePath,
                impact: 'Cơ sở dữ liệu có thể bị tấn công'
            });
        }

        // Kiểm tra XSS risks
        if (/innerHTML|outerHTML|document\.write/gi.test(content)) {
            this.auditResults.vulnerabilities.push({
                type: 'XSS_RISK',
                severity: 'MEDIUM',
                description: `Nguy cơ XSS trong ${filePath}`,
                file: filePath,
                impact: 'Người dùng có thể bị tấn công XSS'
            });
        }
    }

    async checkAccessControls() {
        console.log('\n🔐 3. KIỂM TRA KIỂM SOÁT TRUY CẬP...');
        
        // Kiểm tra file manifest.json
        try {
            const manifestPath = path.join(process.cwd(), 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                console.log('📋 Chrome Extension Manifest phiên bản:', manifest.manifest_version);
                
                if (manifest.permissions) {
                    console.log('🔓 Quyền Chrome Extension:', manifest.permissions.join(', '));
                    
                    // Kiểm tra quyền nguy hiểm
                    const dangerousPermissions = ['tabs', 'activeTab', 'storage', 'cookies', 'history', 'webRequest'];
                    const hasDangerous = manifest.permissions.filter(p => dangerousPermissions.includes(p));
                    
                    if (hasDangerous.length > 0) {
                        this.auditResults.risks.push({
                            type: 'EXCESSIVE_PERMISSIONS',
                            severity: 'MEDIUM',
                            description: `Extension có quyền nguy hiểm: ${hasDangerous.join(', ')}`,
                            impact: 'Có thể truy cập dữ liệu nhạy cảm của người dùng'
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️  Không thể đọc manifest.json:', error.message);
        }
    }

    async detectVulnerabilities() {
        console.log('\n🔍 4. PHÁT HIỆN LỖ HỔNG BẢO MẬT...');
        
        let highRiskFiles = 0;
        let mediumRiskFiles = 0;
        
        for (const [filePath, analysis] of Object.entries(this.auditResults.fileAnalysis)) {
            if (analysis.riskLevel === 'HIGH') {
                highRiskFiles++;
                console.log(`🚨 File nguy hiểm: ${filePath}`);
                
                this.auditResults.vulnerabilities.push({
                    type: 'HIGH_RISK_CODE',
                    severity: 'HIGH',
                    description: `File có nhiều pattern nguy hiểm: ${filePath}`,
                    file: filePath,
                    details: analysis.dangerousPatterns,
                    impact: 'Có thể bị khai thác để tấn công hệ thống'
                });
            } else if (analysis.riskLevel === 'MEDIUM') {
                mediumRiskFiles++;
            }
        }
        
        console.log(`📊 Tổng kết: ${highRiskFiles} file nguy hiểm, ${mediumRiskFiles} file rủi ro trung bình`);
    }

    async validateRealFunctionality() {
        console.log('\n✅ 5. KIỂM TRA HOẠT ĐỘNG THỰC SỰ...');
        
        // Test thực tế các function bảo mật
        try {
            // Test Ultimate Security System
            const UltimateSecuritySystem = require('./ultimate-security.js');
            const security = new UltimateSecuritySystem();
            
            console.log('🧪 Test Ultimate Security System...');
            
            // Test validate request
            const mockReq = {
                headers: {'user-agent': 'test-browser'},
                url: '/test',
                method: 'GET'
            };
            
            const validationResult = security.validateRequest(mockReq);
            if (validationResult && typeof validationResult === 'object') {
                console.log('✅ validateRequest hoạt động thực sự');
            } else {
                console.log('❌ validateRequest có vấn đề');
                this.auditResults.vulnerabilities.push({
                    type: 'FUNCTION_NOT_WORKING',
                    severity: 'HIGH',
                    description: 'validateRequest không hoạt động đúng',
                    file: 'ultimate-security.js',
                    impact: 'Không thể kiểm tra request'
                });
            }
            
            // Test authentication
            const authResult = security.authenticate('testuser', 'wrongpassword', mockReq);
            if (authResult && authResult.success === false) {
                console.log('✅ Authentication hoạt động thực sự (từ chối đúng)');
            } else {
                console.log('❌ Authentication có vấn đề');
            }
            
        } catch (error) {
            console.error('❌ Lỗi test security system:', error.message);
            this.auditResults.vulnerabilities.push({
                type: 'SECURITY_SYSTEM_ERROR',
                severity: 'CRITICAL',
                description: `Hệ thống bảo mật không load được: ${error.message}`,
                file: 'ultimate-security.js',
                impact: 'Hệ thống bảo mật không hoạt động'
            });
        }
    }

    async assessUserRisks() {
        console.log('\n👥 6. ĐÁNH GIÁ NGUY CƠ CHO ADMIN VÀ USERS...');
        
        // Nguy cơ cho Admin
        const adminRisks = [];
        
        // Kiểm tra mật khẩu mặc định
        if (this.auditResults.vulnerabilities.some(v => v.type === 'HARDCODED_CREDENTIALS')) {
            adminRisks.push({
                risk: 'Mật khẩu hardcode',
                description: 'Mật khẩu admin có thể bị lộ từ source code',
                severity: 'CRITICAL',
                mitigation: 'Sử dụng biến môi trường cho mật khẩu'
            });
        }
        
        // Kiểm tra quyền truy cập
        if (this.auditResults.risks.some(r => r.type === 'EXCESSIVE_PERMISSIONS')) {
            adminRisks.push({
                risk: 'Quyền truy cập quá mức',
                description: 'Extension có thể truy cập dữ liệu nhạy cảm',
                severity: 'HIGH',
                mitigation: 'Giới hạn quyền chỉ những gì cần thiết'
            });
        }
        
        // Nguy cơ cho Users
        const userRisks = [];
        
        // XSS risks
        if (this.auditResults.vulnerabilities.some(v => v.type === 'XSS_RISK')) {
            userRisks.push({
                risk: 'Tấn công XSS',
                description: 'Người dùng có thể bị tấn công qua script độc hại',
                severity: 'HIGH',
                mitigation: 'Sanitize tất cả input từ người dùng'
            });
        }
        
        // SQL Injection risks
        if (this.auditResults.vulnerabilities.some(v => v.type === 'SQL_INJECTION_RISK')) {
            userRisks.push({
                risk: 'SQL Injection',
                description: 'Cơ sở dữ liệu có thể bị tấn công, dữ liệu user bị lộ',
                severity: 'CRITICAL',
                mitigation: 'Sử dụng prepared statements'
            });
        }
        
        // Fake security
        if (this.auditResults.vulnerabilities.some(v => v.type === 'FAKE_SECURITY')) {
            adminRisks.push({
                risk: 'Bảo mật giả lập',
                description: 'Hệ thống không có bảo vệ thực sự',
                severity: 'CRITICAL',
                mitigation: 'Thay thế tất cả code giả lập bằng implementation thật'
            });
            
            userRisks.push({
                risk: 'Không được bảo vệ',
                description: 'Dữ liệu và quyền riêng tư không được bảo vệ thực sự',
                severity: 'CRITICAL',
                mitigation: 'Triển khai bảo mật thực sự'
            });
        }
        
        this.auditResults.systemStatus.adminRisks = adminRisks;
        this.auditResults.systemStatus.userRisks = userRisks;
        
        console.log(`🔴 Admin có ${adminRisks.length} nguy cơ`);
        console.log(`🔴 Users có ${userRisks.length} nguy cơ`);
    }

    generateComprehensiveReport() {
        console.log('\n📊 7. TẠO BÁO CÁO TỔNG HỢP...');
        
        const report = {
            ...this.auditResults,
            summary: {
                totalVulnerabilities: this.auditResults.vulnerabilities.length,
                criticalVulnerabilities: this.auditResults.vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
                highVulnerabilities: this.auditResults.vulnerabilities.filter(v => v.severity === 'HIGH').length,
                mediumVulnerabilities: this.auditResults.vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
                totalRisks: this.auditResults.risks.length,
                securityScore: this.calculateSecurityScore()
            }
        };
        
        // Lưu báo cáo
        const reportPath = path.join(process.cwd(), 'SECURITY', 'security-audit-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Hiển thị tóm tắt
        console.log('\n🎯 === KẾT QUẢ KIỂM TRA BẢO MẬT ===');
        console.log(`📁 Tổng file quét: ${report.totalFiles}`);
        console.log(`🛡️  File bảo mật: ${report.securityFiles}`);
        console.log(`🚨 Lỗ hổng nghiêm trọng: ${report.summary.criticalVulnerabilities}`);
        console.log(`⚠️  Lỗ hổng cao: ${report.summary.highVulnerabilities}`);
        console.log(`📊 Điểm bảo mật: ${report.summary.securityScore}/100`);
        
        console.log('\n🔴 === NGUY CƠ CHO ADMIN ===');
        report.systemStatus.adminRisks.forEach((risk, i) => {
            console.log(`${i+1}. [${risk.severity}] ${risk.risk}: ${risk.description}`);
        });
        
        console.log('\n🔴 === NGUY CƠ CHO USERS ===');
        report.systemStatus.userRisks.forEach((risk, i) => {
            console.log(`${i+1}. [${risk.severity}] ${risk.risk}: ${risk.description}`);
        });
        
        console.log(`\n📄 Báo cáo chi tiết: ${reportPath}`);
        
        // Khuyến nghị
        this.generateRecommendations(report);
        
        return report;
    }

    calculateSecurityScore() {
        let score = 100;
        
        // Trừ điểm cho các lỗ hổng
        this.auditResults.vulnerabilities.forEach(vuln => {
            switch(vuln.severity) {
                case 'CRITICAL': score -= 25; break;
                case 'HIGH': score -= 15; break;
                case 'MEDIUM': score -= 5; break;
                default: score -= 2; break;
            }
        });
        
        // Trừ điểm cho rủi ro
        this.auditResults.risks.forEach(risk => {
            switch(risk.severity) {
                case 'HIGH': score -= 10; break;
                case 'MEDIUM': score -= 5; break;
                default: score -= 2; break;
            }
        });
        
        return Math.max(0, score);
    }

    generateRecommendations(report) {
        console.log('\n💡 === KHUYẾN NGHỊ KHẨN CẤP ===');
        
        const recommendations = [];
        
        if (report.summary.criticalVulnerabilities > 0) {
            recommendations.push('🚨 ƯU TIÊN 1: Sửa ngay tất cả lỗ hổng CRITICAL');
        }
        
        if (this.auditResults.vulnerabilities.some(v => v.type === 'FAKE_SECURITY')) {
            recommendations.push('🛡️  ƯU TIÊN 2: Thay thế tất cả mã giả lập bằng bảo mật thật');
        }
        
        if (this.auditResults.vulnerabilities.some(v => v.type === 'HARDCODED_CREDENTIALS')) {
            recommendations.push('🔐 ƯU TIÊN 3: Di chuyển mật khẩu ra biến môi trường');
        }
        
        recommendations.push('🔍 Thiết lập kiểm tra bảo mật định kỳ');
        recommendations.push('📚 Đào tạo team về secure coding practices');
        recommendations.push('🧪 Triển khai automated security testing');
        
        recommendations.forEach((rec, i) => {
            console.log(`${i+1}. ${rec}`);
        });
        
        this.auditResults.recommendations = recommendations;
    }
}

// Chạy kiểm tra
const audit = new ComprehensiveSecurityAudit();
audit.runCompleteAudit().then(() => {
    console.log('\n✅ Hoàn thành kiểm tra bảo mật toàn diện!');
}).catch(error => {
    console.error('❌ Lỗi kiểm tra bảo mật:', error);
});

module.exports = ComprehensiveSecurityAudit;
