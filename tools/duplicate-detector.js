// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🔍 DUPLICATE FILE DETECTOR
 * Tìm kiếm file trùng lặp trong toàn bộ dự án
 * Kiểm tra theo tên, kích thước và nội dung
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DuplicateDetector {
    constructor() {
        this.projectRoot = process.cwd();
        this.fileMap = new Map(); // filename -> [paths]
        this.sizeMap = new Map(); // size -> [files]
        this.hashMap = new Map(); // hash -> [files]
        this.duplicates = {
            byName: [],
            bySize: [],
            byContent: [],
            exact: []
        };
        
        console.log('🔍 Duplicate File Detector initialized');
        console.log(`📂 Scanning: ${this.projectRoot}\n`);
    }
    
    async detectAllDuplicates() {
        console.log('🔍 Phase 1: Scanning all files...');
        await this.scanAllFiles(this.projectRoot);
        
        console.log('\n🔍 Phase 2: Detecting duplicates by name...');
        this.findNameDuplicates();
        
        console.log('\n🔍 Phase 3: Detecting duplicates by size...');
        this.findSizeDuplicates();
        
        console.log('\n🔍 Phase 4: Detecting duplicates by content...');
        await this.findContentDuplicates();
        
        this.generateReport();
    }
    
    async scanAllFiles(dirPath) {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    // Skip system directories
                    if (!['node_modules', '.git', '.vscode', 'Thumbs.db'].includes(item) && !item.startsWith('.')) {
                        await this.scanAllFiles(fullPath);
                    }
                } else if (stats.isFile()) {
                    await this.processFile(fullPath, stats);
                }
            }
        } catch (error) {
            console.error(`❌ Error scanning ${dirPath}:`, error.message);
        }
    }
    
    async processFile(filePath, stats) {
        const fileName = path.basename(filePath);
        const relativePath = path.relative(this.projectRoot, filePath);
        const fileSize = stats.size;
        
        // Track by filename
        if (!this.fileMap.has(fileName)) {
            this.fileMap.set(fileName, []);
        }
        this.fileMap.get(fileName).push({
            path: relativePath,
            fullPath: filePath,
            size: fileSize
        });
        
        // Track by size (only for files > 0 bytes)
        if (fileSize > 0) {
            if (!this.sizeMap.has(fileSize)) {
                this.sizeMap.set(fileSize, []);
            }
            this.sizeMap.get(fileSize).push({
                path: relativePath,
                fullPath: filePath,
                name: fileName
            });
        }
    }
    
    findNameDuplicates() {
        for (const [fileName, files] of this.fileMap.entries()) {
            if (files.length > 1) {
                // Check if they're actually the same file (different paths pointing to same file)
                const uniqueFiles = this.removeSameFiles(files);
                
                if (uniqueFiles.length > 1) {
                    this.duplicates.byName.push({
                        fileName: fileName,
                        files: uniqueFiles,
                        count: uniqueFiles.length
                    });
                    
                    console.log(`📄 Found ${uniqueFiles.length} files named "${fileName}":`);
                    uniqueFiles.forEach(file => {
                        console.log(`   - ${file.path} (${(file.size/1024).toFixed(2)} KB)`);
                    });
                }
            }
        }
    }
    
    findSizeDuplicates() {
        for (const [fileSize, files] of this.sizeMap.entries()) {
            if (files.length > 1) {
                const uniqueFiles = this.removeSameFiles(files);
                
                if (uniqueFiles.length > 1) {
                    this.duplicates.bySize.push({
                        size: fileSize,
                        sizeKB: (fileSize/1024).toFixed(2),
                        files: uniqueFiles,
                        count: uniqueFiles.length
                    });
                    
                    console.log(`📏 Found ${uniqueFiles.length} files with size ${(fileSize/1024).toFixed(2)} KB:`);
                    uniqueFiles.forEach(file => {
                        console.log(`   - ${file.path} (${file.name})`);
                    });
                }
            }
        }
    }
    
    async findContentDuplicates() {
        // Hash files that have the same size to check for identical content
        for (const sizeGroup of this.duplicates.bySize) {
            if (sizeGroup.files.length > 1) {
                const hashes = new Map();
                
                for (const file of sizeGroup.files) {
                    try {
                        const hash = await this.getFileHash(file.fullPath);
                        
                        if (!hashes.has(hash)) {
                            hashes.set(hash, []);
                        }
                        hashes.get(hash).push(file);
                    } catch (error) {
                        console.error(`❌ Error hashing ${file.path}:`, error.message);
                    }
                }
                
                // Find groups with identical content
                for (const [hash, files] of hashes.entries()) {
                    if (files.length > 1) {
                        this.duplicates.byContent.push({
                            hash: hash.substring(0, 8),
                            size: sizeGroup.size,
                            sizeKB: sizeGroup.sizeKB,
                            files: files,
                            count: files.length
                        });
                        
                        console.log(`🔗 Found ${files.length} files with identical content (${sizeGroup.sizeKB} KB):`);
                        files.forEach(file => {
                            console.log(`   - ${file.path}`);
                        });
                    }
                }
            }
        }
    }
    
    async getFileHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
            
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    
    removeSameFiles(files) {
        // Remove entries that point to the same physical file
        const seen = new Set();
        return files.filter(file => {
            try {
                const realPath = fs.realpathSync(file.fullPath);
                if (seen.has(realPath)) {
                    return false;
                }
                seen.add(realPath);
                return true;
            } catch (error) {
                return true; // Keep if we can't resolve real path
            }
        });
    }
    
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 DUPLICATE FILES DETECTION REPORT');
        console.log('='.repeat(80));
        
        console.log(`\n📁 Total files scanned: ${Array.from(this.fileMap.values()).reduce((sum, files) => sum + files.length, 0)}`);
        console.log(`📄 Duplicate names: ${this.duplicates.byName.length} groups`);
        console.log(`📏 Duplicate sizes: ${this.duplicates.bySize.length} groups`);
        console.log(`🔗 Identical content: ${this.duplicates.byContent.length} groups`);
        
        // Detailed reports
        if (this.duplicates.byName.length > 0) {
            console.log('\n🔍 DUPLICATE FILENAMES:');
            console.log('-'.repeat(50));
            this.duplicates.byName.forEach(dup => {
                console.log(`\n📄 "${dup.fileName}" (${dup.count} copies):`);
                dup.files.forEach(file => {
                    console.log(`   📁 ${file.path} (${(file.size/1024).toFixed(2)} KB)`);
                });
            });
        }
        
        if (this.duplicates.byContent.length > 0) {
            console.log('\n🔍 IDENTICAL CONTENT:');
            console.log('-'.repeat(50));
            this.duplicates.byContent.forEach(dup => {
                console.log(`\n🔗 ${dup.count} identical files (${dup.sizeKB} KB each):`);
                dup.files.forEach(file => {
                    console.log(`   📁 ${file.path}`);
                });
                console.log(`   🔐 Hash: ${dup.hash}...`);
            });
        }
        
        // Recommendations
        console.log('\n💡 CLEANUP RECOMMENDATIONS:');
        console.log('-'.repeat(50));
        
        let totalDuplicateSize = 0;
        let recommendationsCount = 0;
        
        this.duplicates.byContent.forEach(dup => {
            if (dup.count > 1) {
                const wasteSize = dup.size * (dup.count - 1);
                totalDuplicateSize += wasteSize;
                recommendationsCount++;
                
                console.log(`\n🗑️  Keep 1, delete ${dup.count - 1} copies of:`);
                dup.files.forEach((file, index) => {
                    if (index === 0) {
                        console.log(`   ✅ KEEP: ${file.path}`);
                    } else {
                        console.log(`   ❌ DELETE: ${file.path}`);
                    }
                });
                console.log(`   💾 Space to free: ${(wasteSize/1024).toFixed(2)} KB`);
            }
        });
        
        if (recommendationsCount === 0) {
            console.log('✅ No identical content duplicates found!');
            console.log('🎉 Your project is clean from exact file duplicates.');
        } else {
            console.log(`\n📊 SUMMARY:`);
            console.log(`🗑️  Total duplicate groups: ${recommendationsCount}`);
            console.log(`💾 Total space wasted: ${(totalDuplicateSize/1024).toFixed(2)} KB`);
        }
        
        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                total_files: Array.from(this.fileMap.values()).reduce((sum, files) => sum + files.length, 0),
                duplicate_names: this.duplicates.byName.length,
                duplicate_sizes: this.duplicates.bySize.length,
                identical_content: this.duplicates.byContent.length,
                space_wasted_kb: (totalDuplicateSize/1024).toFixed(2)
            },
            duplicates: this.duplicates
        };
        
        try {
            const reportPath = path.join(this.projectRoot, 'logs', 'duplicate-files-report.json');
            
            // Ensure logs directory exists
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        } catch (error) {
            console.error(`❌ Could not save report:`, error.message);
        }
        
        console.log('\n✅ Duplicate detection completed!');
    }
}

// Run if called directly
if (require.main === module) {
    const detector = new DuplicateDetector();
    detector.detectAllDuplicates().catch(console.error);
}

module.exports = DuplicateDetector;
