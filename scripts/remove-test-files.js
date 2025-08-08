// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🧹 SIMPLE TEST FILE REMOVER
 * Tìm và xóa tất cả file test khỏi dự án
 * No dependencies required
 */

const fs = require('fs');
const path = require('path');

class TestFileRemover {
    constructor() {
        this.projectRoot = process.cwd();
        this.deletedFiles = [];
        this.errors = [];
        
        console.log('🧹 Test File Remover initialized');
        console.log(`📂 Project root: ${this.projectRoot}`);
    }
    
    async removeAllTestFiles() {
        console.log('🔍 Scanning for test files...\n');
        
        await this.scanDirectory(this.projectRoot);
        
        this.generateReport();
    }
    
    async scanDirectory(dirPath) {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    // Skip node_modules and .git
                    if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
                        await this.scanDirectory(fullPath);
                    }
                } else if (stats.isFile()) {
                    await this.checkAndRemoveTestFile(fullPath);
                }
            }
        } catch (error) {
            console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
        }
    }
    
    async checkAndRemoveTestFile(filePath) {
        const fileName = path.basename(filePath).toLowerCase();
        const relativePath = path.relative(this.projectRoot, filePath);
        
        let shouldDelete = false;
        let reason = '';
        
        // Kiểm tra các pattern để xóa file test
        if (fileName.includes('test-') || fileName.startsWith('test') || fileName.includes('-test')) {
            shouldDelete = true;
            reason = 'Test file';
        } else if (fileName.includes('demo') && !fileName.includes('ghost-trap-demo')) {
            shouldDelete = true;
            reason = 'Demo file';
        } else if (fileName.includes('example')) {
            shouldDelete = true;
            reason = 'Example file';
        } else if (fileName.includes('backup') || fileName.includes('old')) {
            shouldDelete = true;
            reason = 'Backup/old file';
        } else if (fileName.includes('temp') || fileName.includes('tmp')) {
            shouldDelete = true;
            reason = 'Temporary file';
        } else if (path.extname(fileName) === '.bak' || path.extname(fileName) === '.tmp') {
            shouldDelete = true;
            reason = 'Backup/temp file extension';
        }
        
        // Kiểm tra file cụ thể trong dự án
        if (relativePath.includes('test-save-load.js') || 
            relativePath.includes('test-api-quick.js') ||
            relativePath.includes('save-load-test.html') ||
            relativePath.includes('test-popup-fix.bat') ||
            relativePath.includes('test-save-load-quick.bat')) {
            shouldDelete = true;
            reason = 'Project test file';
        }
        
        if (shouldDelete) {
            try {
                const stats = fs.statSync(filePath);
                const fileSize = (stats.size / 1024).toFixed(2);
                
                fs.unlinkSync(filePath);
                
                this.deletedFiles.push({
                    path: relativePath,
                    reason: reason,
                    size: fileSize + ' KB'
                });
                
                console.log(`🗑️  Deleted: ${relativePath} (${fileSize} KB) - ${reason}`);
            } catch (error) {
                this.errors.push({
                    file: relativePath,
                    error: error.message
                });
                console.error(`❌ Error deleting ${relativePath}:`, error.message);
            }
        }
    }
    
    generateReport() {
        const totalSize = this.deletedFiles.reduce((sum, file) => {
            return sum + parseFloat(file.size.replace(' KB', ''));
        }, 0);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST FILE REMOVAL REPORT');
        console.log('='.repeat(60));
        console.log(`🗑️  Files deleted: ${this.deletedFiles.length}`);
        console.log(`💾 Total space freed: ${totalSize.toFixed(2)} KB`);
        console.log(`❌ Errors: ${this.errors.length}`);
        
        if (this.deletedFiles.length > 0) {
            console.log('\n📋 DELETED FILES:');
            this.deletedFiles.forEach(file => {
                console.log(`   ✓ ${file.path} (${file.size}) - ${file.reason}`);
            });
        }
        
        if (this.errors.length > 0) {
            console.log('\n⚠️  ERRORS:');
            this.errors.forEach(error => {
                console.log(`   - ${error.file}: ${error.error}`);
            });
        }
        
        console.log('\n✅ Test file removal completed!');
        
        // Save report
        const reportData = {
            timestamp: new Date().toISOString(),
            deleted_files: this.deletedFiles,
            errors: this.errors,
            summary: {
                total_deleted: this.deletedFiles.length,
                space_freed_kb: totalSize,
                error_count: this.errors.length
            }
        };
        
        try {
            const reportPath = path.join(this.projectRoot, 'logs', 'test-removal-report.json');
            
            // Ensure logs directory exists
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`📄 Report saved to: ${reportPath}`);
        } catch (error) {
            console.error(`❌ Could not save report:`, error.message);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const remover = new TestFileRemover();
    remover.removeAllTestFiles().catch(console.error);
}

module.exports = TestFileRemover;
