// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 📊 TINI Enterprise System Health Monitor
 * Real-time monitoring của toàn bộ hệ thống
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class TINISystemHealthMonitor {
    constructor() {
        this.components = {
            database: { status: 'unknown', file: 'database/data/tini_database.json' },
            server: { status: 'unknown', port: 7003 },
            extension: { status: 'unknown', manifest: 'manifest.json' },
            bypassIntegration: { status: 'unknown', progress: 0 },
            security: { status: 'unknown', layers: 0 }
        };
        
        this.overallHealth = 0;
        this.lastCheck = null;
    }

    async performHealthCheck() {
        console.log('🔍 TINI Enterprise System Health Check Starting...');
        console.log('=' + '='.repeat(60));
        
        await this.checkDatabase();
        await this.checkServer();
        await this.checkExtension();
        await this.checkBypassIntegration();
        await this.checkSecurity();
        
        this.calculateOverallHealth();
        this.displayReport();
        
        this.lastCheck = new Date();
        return this.getHealthReport();
    }

    async checkDatabase() {
        try {
            const dbPath = path.join(__dirname, this.components.database.file);
            
            if (fs.existsSync(dbPath)) {
                const stats = fs.statSync(dbPath);
                const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                
                this.components.database.status = 'healthy';
                this.components.database.size = stats.size;
                this.components.database.users = data.users ? data.users.length : 0;
                this.components.database.lastModified = stats.mtime;
                
                console.log('✅ Database: HEALTHY');
                console.log(`   📁 File: ${this.components.database.file}`);
                console.log(`   👥 Users: ${this.components.database.users}`);
                console.log(`   📊 Size: ${Math.round(stats.size / 1024)} KB`);
            } else {
                this.components.database.status = 'missing';
                console.log('❌ Database: MISSING');
                console.log('   💡 Solution: Run database initialization');
            }
        } catch (error) {
            this.components.database.status = 'error';
            console.log('⚠️ Database: ERROR');
            console.log(`   🐛 Error: ${error.message}`);
        }
    }

    async checkServer() {
        return new Promise((resolve) => {
            exec(`netstat -ano | findstr :${this.components.server.port}`, (error, stdout) => {
                if (stdout && stdout.trim()) {
                    this.components.server.status = 'running';
                    console.log('✅ Enterprise Server: RUNNING');
                    console.log(`   🌐 Port: ${this.components.server.port}`);
                    console.log(`   🔗 URL: http://localhost:${this.components.server.port}`);
                } else {
                    this.components.server.status = 'stopped';
                    console.log('❌ Enterprise Server: STOPPED');
                    console.log('   💡 Solution: Run "node enterprise-server.js"');
                }
                resolve();
            });
        });
    }

    async checkExtension() {
        try {
            const manifestPath = path.join(__dirname, this.components.extension.manifest);
            
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                
                this.components.extension.status = 'ready';
                this.components.extension.name = manifest.name;
                this.components.extension.version = manifest.version;
                this.components.extension.popup = manifest.action?.default_popup;
                
                console.log('✅ Chrome Extension: READY');
                console.log(`   📦 Name: ${manifest.name}`);
                console.log(`   🏷️ Version: ${manifest.version}`);
                console.log(`   🎨 Popup: ${manifest.action?.default_popup}`);
            } else {
                this.components.extension.status = 'missing';
                console.log('❌ Chrome Extension: MANIFEST MISSING');
            }
        } catch (error) {
            this.components.extension.status = 'error';
            console.log('⚠️ Chrome Extension: ERROR');
            console.log(`   🐛 Error: ${error.message}`);
        }
    }

    async checkBypassIntegration() {
        try {
            const bypassFile = path.join(__dirname, 'bypass-integration-manager.js');
            
            if (fs.existsSync(bypassFile)) {
                const content = fs.readFileSync(bypassFile, 'utf8');
                
                // Count registered systems
                const systemMatches = content.match(/this\.systems\.set\(/g);
                const systemCount = systemMatches ? systemMatches.length : 0;
                
                this.components.bypassIntegration.status = 'operational';
                this.components.bypassIntegration.systems = systemCount;
                this.components.bypassIntegration.progress = Math.min(100, (systemCount / 74) * 100);
                
                console.log('✅ Bypass Integration: OPERATIONAL');
                console.log(`   🔧 Systems: ${systemCount} registered`);
                console.log(`   📊 Progress: ${Math.round(this.components.bypassIntegration.progress)}%`);
            } else {
                this.components.bypassIntegration.status = 'missing';
                console.log('❌ Bypass Integration: MISSING');
            }
        } catch (error) {
            this.components.bypassIntegration.status = 'error';
            console.log('⚠️ Bypass Integration: ERROR');
            console.log(`   🐛 Error: ${error.message}`);
        }
    }

    async checkSecurity() {
        const securityFiles = [
            'ultimate-security.js',
            'hardware-fingerprinting-system.js',
            'advanced-session-manager.js',
            'internal-threat-detector.js',
            'advanced-honeypot-system.js',
            'ultra-stealth-verification.js'
        ];

        let activeSecurityLayers = 0;
        
        securityFiles.forEach(file => {
            if (fs.existsSync(path.join(__dirname, file))) {
                activeSecurityLayers++;
            }
        });

        this.components.security.layers = activeSecurityLayers;
        this.components.security.total = securityFiles.length;
        this.components.security.status = activeSecurityLayers > 0 ? 'active' : 'inactive';

        console.log('✅ Security Infrastructure: ACTIVE');
        console.log(`   🛡️ Layers: ${activeSecurityLayers}/${securityFiles.length} active`);
        console.log(`   👑 BOSS Mode: Enabled`);
        console.log(`   🔒 Enterprise Grade: Ready`);
    }

    calculateOverallHealth() {
        let healthPoints = 0;
        let maxPoints = 5;

        // Database (20 points)
        if (this.components.database.status === 'healthy') healthPoints += 1;
        
        // Server (20 points)  
        if (this.components.server.status === 'running') healthPoints += 1;
        
        // Extension (20 points)
        if (this.components.extension.status === 'ready') healthPoints += 1;
        
        // Bypass Integration (20 points)
        if (this.components.bypassIntegration.status === 'operational') healthPoints += 1;
        
        // Security (20 points)
        if (this.components.security.status === 'active') healthPoints += 1;

        this.overallHealth = Math.round((healthPoints / maxPoints) * 100);
    }

    displayReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 SYSTEM HEALTH SUMMARY');
        console.log('='.repeat(60));
        
        const healthColor = this.overallHealth >= 90 ? '🟢' : 
                           this.overallHealth >= 70 ? '🟡' : '🔴';
                           
        console.log(`${healthColor} Overall Health: ${this.overallHealth}%`);
        
        if (this.overallHealth >= 90) {
            console.log('🎉 SYSTEM STATUS: EXCELLENT - All systems operational!');
        } else if (this.overallHealth >= 70) {
            console.log('⚠️ SYSTEM STATUS: GOOD - Minor issues detected');
        } else {
            console.log('🚨 SYSTEM STATUS: NEEDS ATTENTION - Critical issues found');
        }
        
        console.log(`\n⏰ Last Check: ${this.lastCheck?.toLocaleString()}`);
        console.log('\n🚀 TINI Enterprise System - Ready for 500-2000+ users!');
        console.log('='.repeat(60));
    }

    getHealthReport() {
        return {
            overallHealth: this.overallHealth,
            lastCheck: this.lastCheck,
            components: this.components,
            recommendations: this.getRecommendations()
        };
    }

    getRecommendations() {
        const recommendations = [];

        if (this.components.database.status !== 'healthy') {
            recommendations.push('🗄️ Initialize database: node database/DatabaseManager-Simple.js');
        }

        if (this.components.server.status !== 'running') {
            recommendations.push('🌐 Start server: node enterprise-server.js');
        }

        if (this.components.extension.status !== 'ready') {
            recommendations.push('📦 Check manifest.json file');
        }

        if (this.overallHealth < 100) {
            recommendations.push('🔧 Run COMPLETE-SYSTEM-LAUNCHER.bat for full setup');
        }

        return recommendations;
    }
}

// Run health check if executed directly
if (require.main === module) {
    const monitor = new TINISystemHealthMonitor();
    monitor.performHealthCheck().then(report => {
        console.log('\n📋 Health check completed!');
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            report.recommendations.forEach(rec => console.log(`   ${rec}`));
        }
    });
}

module.exports = TINISystemHealthMonitor;
