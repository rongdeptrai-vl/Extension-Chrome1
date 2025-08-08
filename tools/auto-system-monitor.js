// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
#!/usr/bin/env node
// ================================================================
// AUTO SYSTEM MONITOR & PORT SYNCHRONIZATION CHECKER
// Tự động kiểm tra trùng lặp, port conflicts và đồng bộ hệ thống
// Xuất báo cáo chi tiết cho admin
// ================================================================

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class AutoSystemMonitor {
    constructor() {
        this.version = '2.0.0';
        this.reportPath = path.join(__dirname, '..', 'logs', 'auto-monitor-report.md');
        this.configPath = path.join(__dirname, '..', 'config', 'monitor-config.json');
        
        // Các port đã định nghĩa trong hệ thống
        this.definedPorts = {
            3001: 'Admin Dashboard Server',
            3000: 'Main Application Server', 
            8080: 'Alternative Web Server',
            5000: 'Ghost System API',
            4000: 'Security System API',
            9999: 'Script System API'
        };
        
        // Các file patterns cần kiểm tra
        this.filePatterns = {
            scripts: ['Script/*.js'],
            security: ['SECURITY/*.js'],
            ghost: ['Ghost/*.js'],
            system: ['system/*.js'],
            admin: ['src/*.js'],
            configs: ['config/*.json', '*.json']
        };
        
        this.issues = [];
        this.duplicates = [];
        this.portConflicts = [];
        this.unsyncedFiles = [];
        
        console.log(`🤖 Auto System Monitor v${this.version} initialized`);
    }
    
    async runFullScan() {
        console.log('\n🔍 Starting comprehensive system scan...\n');
        
        try {
            // 1. Kiểm tra port conflicts
            await this.checkPortConflicts();
            
            // 2. Kiểm tra file duplicates
            await this.checkDuplicateFiles();
            
            // 3. Kiểm tra đồng bộ hệ thống
            await this.checkSystemSync();
            
            // 4. Kiểm tra cấu trúc project
            await this.checkProjectStructure();
            
            // 5. Kiểm tra dependencies
            await this.checkDependencies();
            
            // 6. Tạo báo cáo
            await this.generateReport();
            
            // 7. Đưa ra recommendations
            this.showRecommendations();
            
            console.log('\n✅ System scan completed successfully!');
            console.log(`📋 Full report saved to: ${this.reportPath}`);
            
        } catch (error) {
            console.error('\n❌ System scan failed:', error.message);
            this.issues.push({
                type: 'critical',
                category: 'system',
                message: `Scan failed: ${error.message}`,
                file: 'auto-monitor'
            });
        }
    }
    
    async checkPortConflicts() {
        console.log('🔌 Checking port conflicts...');
        
        try {
            // Kiểm tra ports đang được sử dụng
            const { stdout } = await execAsync('netstat -ano');
            const lines = stdout.split('\n');
            const usedPorts = new Map();
            
            lines.forEach(line => {
                const match = line.match(/TCP\s+[:\d\.]+:(\d+)\s+.*LISTENING\s+(\d+)/);
                if (match) {
                    const port = parseInt(match[1]);
                    const pid = parseInt(match[2]);
                    
                    if (usedPorts.has(port)) {
                        usedPorts.get(port).push(pid);
                    } else {
                        usedPorts.set(port, [pid]);
                    }
                }
            });
            
            // Kiểm tra conflicts
            for (const [port, pids] of usedPorts) {
                if (pids.length > 1) {
                    this.portConflicts.push({
                        port: port,
                        processes: pids,
                        severity: 'high',
                        description: `Port ${port} is used by multiple processes: ${pids.join(', ')}`
                    });
                }
                
                // Kiểm tra với defined ports
                if (this.definedPorts[port]) {
                    console.log(`   ✅ Port ${port}: ${this.definedPorts[port]} (PID: ${pids[0]})`);
                } else if (port >= 3000 && port <= 9999) {
                    this.portConflicts.push({
                        port: port,
                        processes: pids,
                        severity: 'medium',
                        description: `Undefined port ${port} in use (should be documented)`
                    });
                }
            }
            
            // Kiểm tra missing defined ports
            for (const [port, service] of Object.entries(this.definedPorts)) {
                if (!usedPorts.has(parseInt(port))) {
                    this.issues.push({
                        type: 'warning',
                        category: 'port',
                        message: `${service} (port ${port}) is not running`,
                        file: 'system-config'
                    });
                }
            }
            
            console.log(`   📊 Found ${this.portConflicts.length} port conflicts`);
            
        } catch (error) {
            this.issues.push({
                type: 'error',
                category: 'port',
                message: `Failed to check ports: ${error.message}`,
                file: 'netstat'
            });
        }
    }
    
    async checkDuplicateFiles() {
        console.log('📁 Checking for duplicate files...');
        
        const fileHashes = new Map();
        const crypto = require('crypto');
        
        for (const [category, patterns] of Object.entries(this.filePatterns)) {
            for (const pattern of patterns) {
                try {
                    const files = await this.globFiles(pattern);
                    
                    for (const file of files) {
                        if (fs.existsSync(file)) {
                            const content = fs.readFileSync(file, 'utf8');
                            const hash = crypto.createHash('md5').update(content).digest('hex');
                            const size = content.length;
                            
                            const key = `${hash}_${size}`;
                            if (fileHashes.has(key)) {
                                fileHashes.get(key).push(file);
                            } else {
                                fileHashes.set(key, [file]);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`   ⚠️ Error checking pattern ${pattern}: ${error.message}`);
                }
            }
        }
        
        // Tìm duplicates
        for (const [hash, files] of fileHashes) {
            if (files.length > 1) {
                this.duplicates.push({
                    files: files,
                    hash: hash.split('_')[0],
                    size: parseInt(hash.split('_')[1]),
                    severity: files.length > 2 ? 'high' : 'medium'
                });
            }
        }
        
        console.log(`   📊 Found ${this.duplicates.length} duplicate file groups`);
    }
    
    async checkSystemSync() {
        console.log('🔄 Checking system synchronization...');
        
        const integrationFiles = [
            'system/MASTER-SYSTEM-INTEGRATION.js',
            'system/unified-system-activator.js',
            'src/admin-dashboard-server.js'
        ];
        
        const criticalConfigs = [
            'package.json',
            'config/monitor-config.json'
        ];
        
        // Kiểm tra integration files
        for (const file of integrationFiles) {
            if (!fs.existsSync(file)) {
                this.unsyncedFiles.push({
                    file: file,
                    status: 'missing',
                    severity: 'critical',
                    description: 'Critical integration file missing'
                });
            } else {
                // Kiểm tra last modified time
                const stats = fs.statSync(file);
                const age = Date.now() - stats.mtime.getTime();
                const hoursOld = age / (1000 * 60 * 60);
                
                if (hoursOld > 24) {
                    this.unsyncedFiles.push({
                        file: file,
                        status: 'outdated',
                        severity: 'medium',
                        description: `File not updated for ${Math.floor(hoursOld)} hours`,
                        lastModified: stats.mtime
                    });
                }
            }
        }
        
        // Kiểm tra config sync
        for (const config of criticalConfigs) {
            if (fs.existsSync(config)) {
                try {
                    const content = fs.readFileSync(config, 'utf8');
                    JSON.parse(content); // Validate JSON
                    console.log(`   ✅ Config valid: ${config}`);
                } catch (error) {
                    this.unsyncedFiles.push({
                        file: config,
                        status: 'corrupted',
                        severity: 'high',
                        description: `Invalid JSON: ${error.message}`
                    });
                }
            }
        }
        
        console.log(`   📊 Found ${this.unsyncedFiles.length} sync issues`);
    }
    
    async checkProjectStructure() {
        console.log('📋 Checking project structure...');
        
        const requiredDirs = [
            'src', 'public', 'config', 'logs', 'docs',
            'Script', 'SECURITY', 'Ghost', 'system'
        ];
        
        const requiredFiles = [
            'package.json',
            'src/admin-dashboard-server.js',
            'public/index.html',
            'system/unified-system-activator.js'
        ];
        
        // Kiểm tra directories
        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                this.issues.push({
                    type: 'warning',
                    category: 'structure',
                    message: `Missing directory: ${dir}`,
                    file: 'project-root'
                });
            } else {
                console.log(`   ✅ Directory exists: ${dir}`);
            }
        }
        
        // Kiểm tra files
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                this.issues.push({
                    type: 'error',
                    category: 'structure',
                    message: `Missing critical file: ${file}`,
                    file: 'project-root'
                });
            } else {
                console.log(`   ✅ File exists: ${file}`);
            }
        }
    }
    
    async checkDependencies() {
        console.log('📦 Checking dependencies...');
        
        if (fs.existsSync('package.json')) {
            try {
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                const deps = Object.keys(pkg.dependencies || {});
                const devDeps = Object.keys(pkg.devDependencies || {});
                
                console.log(`   📊 Found ${deps.length} dependencies, ${devDeps.length} dev dependencies`);
                
                // Kiểm tra critical dependencies
                const requiredDeps = ['express', 'socket.io', 'cors', 'jsonwebtoken'];
                for (const dep of requiredDeps) {
                    if (!deps.includes(dep)) {
                        this.issues.push({
                            type: 'error',
                            category: 'dependency',
                            message: `Missing required dependency: ${dep}`,
                            file: 'package.json'
                        });
                    }
                }
                
            } catch (error) {
                this.issues.push({
                    type: 'error',
                    category: 'dependency',
                    message: `Failed to parse package.json: ${error.message}`,
                    file: 'package.json'
                });
            }
        }
    }
    
    async generateReport() {
        console.log('📄 Generating comprehensive report...');
        
        const timestamp = new Date().toISOString();
        const summary = this.generateSummary();
        
        const report = `# 🤖 Auto System Monitor Report
        
**Generated:** ${timestamp}
**Monitor Version:** ${this.version}
**Scan Duration:** ${Date.now() - this.scanStartTime}ms

## 📊 Executive Summary

${summary}

## 🔌 Port Analysis

### Port Conflicts (${this.portConflicts.length})
${this.portConflicts.map(conflict => `
- **Port ${conflict.port}** (${conflict.severity} severity)
  - Processes: ${conflict.processes.join(', ')}
  - Description: ${conflict.description}
`).join('')}

### Defined Ports Status
${Object.entries(this.definedPorts).map(([port, service]) => `
- Port ${port}: ${service} ✅
`).join('')}

## 📁 Duplicate Files (${this.duplicates.length})

${this.duplicates.map(dup => `
### Duplicate Group (${dup.severity} severity)
- **Files:** ${dup.files.join(', ')}
- **Size:** ${dup.size} bytes
- **Hash:** ${dup.hash.substring(0, 8)}...
`).join('')}

## 🔄 Synchronization Issues (${this.unsyncedFiles.length})

${this.unsyncedFiles.map(issue => `
- **File:** ${issue.file}
- **Status:** ${issue.status} (${issue.severity} severity)
- **Description:** ${issue.description}
${issue.lastModified ? `- **Last Modified:** ${issue.lastModified}` : ''}
`).join('')}

## ⚠️ System Issues (${this.issues.length})

${this.issues.map(issue => `
- **${issue.type.toUpperCase()}** [${issue.category}] ${issue.file}
  - ${issue.message}
`).join('')}

## 🎯 Recommendations

${this.generateRecommendations()}

## 📈 System Health Score

**Overall Score:** ${this.calculateHealthScore()}/100

---
*Report generated by Auto System Monitor v${this.version}*
*Next scan recommended in 6 hours*
`;

        // Ensure logs directory exists
        const logsDir = path.dirname(this.reportPath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        fs.writeFileSync(this.reportPath, report, 'utf8');
        console.log(`   ✅ Report saved to: ${this.reportPath}`);
    }
    
    generateSummary() {
        const totalIssues = this.issues.length + this.portConflicts.length + this.duplicates.length + this.unsyncedFiles.length;
        const criticalIssues = this.issues.filter(i => i.type === 'error').length + 
                              this.portConflicts.filter(p => p.severity === 'high').length +
                              this.unsyncedFiles.filter(u => u.severity === 'critical').length;
        
        if (totalIssues === 0) {
            return '🟢 **System Status: EXCELLENT** - No issues detected';
        } else if (criticalIssues === 0) {
            return `🟡 **System Status: GOOD** - ${totalIssues} minor issues detected`;
        } else {
            return `🔴 **System Status: NEEDS ATTENTION** - ${criticalIssues} critical issues, ${totalIssues} total issues`;
        }
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (this.portConflicts.length > 0) {
            recommendations.push('🔌 **Port Management:** Review and resolve port conflicts. Consider using environment variables for port configuration.');
        }
        
        if (this.duplicates.length > 0) {
            recommendations.push('📁 **File Cleanup:** Remove duplicate files to reduce storage and maintenance overhead.');
        }
        
        if (this.unsyncedFiles.length > 0) {
            recommendations.push('🔄 **Synchronization:** Update outdated files and fix corrupted configurations.');
        }
        
        if (this.issues.filter(i => i.category === 'dependency').length > 0) {
            recommendations.push('📦 **Dependencies:** Install missing dependencies with `npm install`.');
        }
        
        recommendations.push('⏰ **Monitoring:** Run this monitor script every 6 hours for optimal system health.');
        recommendations.push('🔧 **Automation:** Consider setting up automated fixes for common issues.');
        
        return recommendations.join('\n');
    }
    
    calculateHealthScore() {
        let score = 100;
        
        // Deduct points for issues
        score -= this.issues.filter(i => i.type === 'error').length * 10;
        score -= this.issues.filter(i => i.type === 'warning').length * 5;
        score -= this.portConflicts.filter(p => p.severity === 'high').length * 15;
        score -= this.portConflicts.filter(p => p.severity === 'medium').length * 8;
        score -= this.duplicates.length * 3;
        score -= this.unsyncedFiles.filter(u => u.severity === 'critical').length * 20;
        score -= this.unsyncedFiles.filter(u => u.severity === 'high').length * 10;
        
        return Math.max(0, score);
    }
    
    showRecommendations() {
        console.log('\n🎯 IMMEDIATE ACTIONS REQUIRED:\n');
        
        const criticalIssues = this.issues.filter(i => i.type === 'error');
        const highPriorityPorts = this.portConflicts.filter(p => p.severity === 'high');
        const criticalSync = this.unsyncedFiles.filter(u => u.severity === 'critical');
        
        if (criticalIssues.length > 0) {
            console.log('❌ CRITICAL ERRORS:');
            criticalIssues.forEach(issue => {
                console.log(`   • ${issue.message} (${issue.file})`);
            });
        }
        
        if (highPriorityPorts.length > 0) {
            console.log('\n🔌 PORT CONFLICTS:');
            highPriorityPorts.forEach(conflict => {
                console.log(`   • ${conflict.description}`);
            });
        }
        
        if (criticalSync.length > 0) {
            console.log('\n🔄 SYNC FAILURES:');
            criticalSync.forEach(sync => {
                console.log(`   • ${sync.file}: ${sync.description}`);
            });
        }
        
        console.log(`\n🏥 SYSTEM HEALTH: ${this.calculateHealthScore()}/100`);
        console.log(`📧 Full report: ${this.reportPath}`);
    }
    
    async globFiles(pattern) {
        // Simple glob implementation using fs
        const files = [];
        const basePath = process.cwd();
        
        if (pattern.includes('*')) {
            const parts = pattern.split('/');
            const dir = parts[0];
            const filePattern = parts[1];
            
            if (fs.existsSync(dir)) {
                const dirFiles = fs.readdirSync(dir);
                for (const file of dirFiles) {
                    if (filePattern === '*.js' && file.endsWith('.js')) {
                        files.push(path.join(dir, file));
                    } else if (filePattern === '*.json' && file.endsWith('.json')) {
                        files.push(path.join(dir, file));
                    } else if (filePattern === file) {
                        files.push(path.join(dir, file));
                    }
                }
            }
        } else {
            if (fs.existsSync(pattern)) {
                files.push(pattern);
            }
        }
        
        return files;
    }
}

// Export for use as module
module.exports = AutoSystemMonitor;

// Auto-run if called directly
if (require.main === module) {
    const monitor = new AutoSystemMonitor();
    monitor.scanStartTime = Date.now();
    
    console.log('🚀 Starting Auto System Monitor...');
    console.log('⏰ This will take 30-60 seconds...\n');
    
    monitor.runFullScan().then(() => {
        console.log('\n🎉 Monitoring complete! Check the report for details.');
        process.exit(0);
    }).catch(error => {
        console.error('\n💥 Monitor failed:', error);
        process.exit(1);
    });
}
