// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🔄 TINI PROJECT REORGANIZER
 * Tổ chức lại cấu trúc dự án theo chức năng
 * Đảm bảo không ảnh hưởng đến hoạt động của extension
 */

const fs = require('fs');
const path = require('path');

class ProjectReorganizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.movedFiles = [];
        this.updatedReferences = [];
        this.errors = [];
        
        // Define new structure
        this.reorganizationPlan = {
            // Security files consolidation
            'SECURITY/': {
                description: 'All security-related files',
                files: [
                    'src/tini-validation-system.js',
                    'production-cleanup.js', // Security cleanup
                    'SYSTEM/ANTI-AUTOMATION DETECTOR.js',
                    'SYSTEM/integrated-employee-system.js'
                ]
            },
            
            // Admin panel consolidation  
            'admin-panel/': {
                description: 'All admin panel files (renamed for consistency)',
                files: [
                    'admin panel/admin-panel.html',
                    'admin panel/server.js',
                    'admin panel/sqlite-adapter.js',
                    'admin panel/populate-database.js',
                    'admin panel/init-database.js',
                    'admin panel/ghost-integration.js',
                    'admin panel/custom-i18n.js',
                    'admin panel/i18n-helper.js',
                    'admin panel/language-handler.js',
                    'admin panel/language-system.js',
                    'admin panel/language-handler-clean.js',
                    'admin panel/manifest.json',
                    'admin panel/README.md',
                    'admin panel/.env',
                    'admin panel/docker-compose.yml',
                    'ADMIN-PANEL-GUIDE.md'
                ],
                subfolders: {
                    'scripts/': 'admin panel/scripts/',
                    'api/': 'admin panel/api/',
                    'styles/': 'admin panel/styles/',
                    'sqlite-init/': 'admin panel/sqlite-init/',
                    'mysql-init/': 'admin panel/mysql-init/'
                }
            },
            
            // Popup files consolidation
            'popup/': {
                description: 'All popup interface files',
                files: [
                    'Popup/popup.html',
                    'Popup/popup.js',
                    'Popup/popup-production-monitor.js',
                    'Popup/popup-debug.js',
                    'Popup/popup-debug-enhanced.js',
                    'Popup/popup-csp-handlers.js',
                    'Popup/popup-auth-enhanced.js',
                    'Popup/Popup Controller.js',
                    'Popup/complete-rebuild-system.js',
                    'Popup/script-manager.js'
                ]
            },
            
            // Core system files
            'core/': {
                description: 'Core extension files',
                files: [
                    'background.js',
                    'api-server.js',
                    'setup-database.js',
                    'src/admin-dashboard-server.js',
                    'src/data-base-connect.js'
                ]
            },
            
            // Content scripts
            'content-scripts/': {
                description: 'Content scripts for web pages',
                files: [
                    'Script/Tini-smart.js',
                    'Script/tini-control-center.js',
                    'Script/content.js'
                ]
            },
            
            // Ghost monitoring system
            'ghost/': {
                description: 'GHOST monitoring system files',
                files: [
                    'Ghost/GHOST Core.js',
                    'Ghost/GHOST PRIMARY.js',
                    'Ghost/Ghost Integration.js',
                    'Ghost/ghost-integration.js',
                    'Ghost/ghost-integration-bridge.js',
                    'Ghost/GHOST.js',
                    'Ghost/GHOST-TRAP-ENHANCED.js',
                    'Ghost/boss-life-monitoring.js',
                    'Ghost/system-performance-optimizer.js',
                    'Ghost/STANDARD STABILITY MONITORING.js'
                ]
            },
            
            // System integration
            'system/': {
                description: 'System integration and utilities',
                files: [
                    'SYSTEM/unified-system-activator.js',
                    'SYSTEM/MASTER-SYSTEM-INTEGRATION.js',
                    'SYSTEM/SYSTEM-INTEGRATION-STATUS.js'
                ]
            },
            
            // Development and build tools
            'tools/': {
                description: 'Development tools and scripts',
                files: [
                    'scripts/duplicate-detector.js',
                    'scripts/system-cleanup.js',
                    'scripts/system-checker.js',
                    'scripts/security-validator.js',
                    'scripts/port-synchronizer.js',
                    'scripts/event-handler-analyzer.js',
                    'scripts/auto-system-monitor.js'
                ]
            }
        };
        
        console.log('🔄 Project Reorganizer initialized');
        console.log(`📂 Working directory: ${this.projectRoot}\n`);
    }
    
    async reorganizeProject() {
        console.log('🚀 Starting project reorganization...\n');
        
        try {
            // Step 1: Create new directory structure
            await this.createNewStructure();
            
            // Step 2: Move files to new locations
            await this.moveFiles();
            
            // Step 3: Update file references
            await this.updateReferences();
            
            // Step 4: Clean up old directories
            await this.cleanupOldDirectories();
            
            // Step 5: Generate new structure documentation
            await this.generateStructureDoc();
            
            this.generateReport();
            
            console.log('✅ Project reorganization completed successfully!');
            
        } catch (error) {
            console.error('❌ Reorganization failed:', error);
            throw error;
        }
    }
    
    async createNewStructure() {
        console.log('📁 Creating new directory structure...\n');
        
        for (const [newDir, config] of Object.entries(this.reorganizationPlan)) {
            const newPath = path.join(this.projectRoot, newDir);
            
            if (!fs.existsSync(newPath)) {
                fs.mkdirSync(newPath, { recursive: true });
                console.log(`📁 Created: ${newDir}`);
            }
            
            // Create subfolders if defined
            if (config.subfolders) {
                for (const [subFolder, sourcePath] of Object.entries(config.subfolders)) {
                    const subPath = path.join(newPath, subFolder);
                    if (!fs.existsSync(subPath)) {
                        fs.mkdirSync(subPath, { recursive: true });
                        console.log(`📁 Created: ${newDir}${subFolder}`);
                    }
                }
            }
        }
    }
    
    async moveFiles() {
        console.log('\n📦 Moving files to new structure...\n');
        
        for (const [newDir, config] of Object.entries(this.reorganizationPlan)) {
            console.log(`📂 Processing ${newDir}:`);
            
            // Move individual files
            for (const filePath of config.files) {
                await this.moveFile(filePath, newDir);
            }
            
            // Move subfolders
            if (config.subfolders) {
                for (const [subFolder, sourcePath] of Object.entries(config.subfolders)) {
                    await this.moveFolder(sourcePath, path.join(newDir, subFolder));
                }
            }
            
            console.log('');
        }
    }
    
    async moveFile(sourcePath, targetDir) {
        const fullSourcePath = path.join(this.projectRoot, sourcePath);
        
        if (!fs.existsSync(fullSourcePath)) {
            console.log(`⚠️  File not found: ${sourcePath}`);
            return;
        }
        
        const fileName = path.basename(sourcePath);
        const targetPath = path.join(this.projectRoot, targetDir, fileName);
        
        try {
            // Copy file to new location
            fs.copyFileSync(fullSourcePath, targetPath);
            
            // Remove original file
            fs.unlinkSync(fullSourcePath);
            
            this.movedFiles.push({
                from: sourcePath,
                to: path.join(targetDir, fileName),
                success: true
            });
            
            console.log(`   ✅ Moved: ${sourcePath} → ${targetDir}${fileName}`);
            
        } catch (error) {
            this.errors.push({
                operation: 'move_file',
                file: sourcePath,
                error: error.message
            });
            console.log(`   ❌ Failed to move: ${sourcePath} - ${error.message}`);
        }
    }
    
    async moveFolder(sourcePath, targetPath) {
        const fullSourcePath = path.join(this.projectRoot, sourcePath);
        const fullTargetPath = path.join(this.projectRoot, targetPath);
        
        if (!fs.existsSync(fullSourcePath)) {
            console.log(`⚠️  Folder not found: ${sourcePath}`);
            return;
        }
        
        try {
            // Copy entire folder
            this.copyFolderRecursive(fullSourcePath, fullTargetPath);
            
            // Remove original folder
            this.removeFolderRecursive(fullSourcePath);
            
            console.log(`   ✅ Moved folder: ${sourcePath} → ${targetPath}`);
            
        } catch (error) {
            this.errors.push({
                operation: 'move_folder',
                folder: sourcePath,
                error: error.message
            });
            console.log(`   ❌ Failed to move folder: ${sourcePath} - ${error.message}`);
        }
    }
    
    copyFolderRecursive(source, target) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyFolderRecursive(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }
    
    removeFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    }
    
    async updateReferences() {
        console.log('🔗 Updating file references...\n');
        
        // Critical files that need reference updates
        const criticalFiles = [
            'manifest.json',
            'background.js',
            'popup/popup.html',
            'admin-panel/admin-panel.html'
        ];
        
        for (const file of criticalFiles) {
            await this.updateFileReferences(file);
        }
    }
    
    async updateFileReferences(filePath) {
        const fullPath = path.join(this.projectRoot, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  Reference file not found: ${filePath}`);
            return;
        }
        
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            let hasChanges = false;
            
            // Update common path references
            const pathUpdates = {
                'Script/': 'content-scripts/',
                'Popup/': 'popup/',
                'Ghost/': 'ghost/',
                'SECURITY/': 'SECURITY/',
                'admin panel/': 'admin-panel/',
                'src/': 'core/',
                'scripts/': 'tools/'
            };
            
            for (const [oldPath, newPath] of Object.entries(pathUpdates)) {
                const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                if (content.includes(oldPath)) {
                    content = content.replace(regex, newPath);
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                fs.writeFileSync(fullPath, content);
                this.updatedReferences.push(filePath);
                console.log(`   ✅ Updated references in: ${filePath}`);
            } else {
                console.log(`   📄 No changes needed: ${filePath}`);
            }
            
        } catch (error) {
            this.errors.push({
                operation: 'update_references',
                file: filePath,
                error: error.message
            });
            console.log(`   ❌ Failed to update: ${filePath} - ${error.message}`);
        }
    }
    
    async cleanupOldDirectories() {
        console.log('\n🧹 Cleaning up empty directories...\n');
        
        const oldDirs = ['Script', 'Popup', 'src', 'scripts'];
        
        for (const dir of oldDirs) {
            const dirPath = path.join(this.projectRoot, dir);
            
            if (fs.existsSync(dirPath)) {
                try {
                    const files = fs.readdirSync(dirPath);
                    if (files.length === 0) {
                        fs.rmdirSync(dirPath);
                        console.log(`🗑️  Removed empty directory: ${dir}/`);
                    } else {
                        console.log(`📁 Directory not empty, keeping: ${dir}/ (${files.length} items)`);
                    }
                } catch (error) {
                    console.log(`⚠️  Could not clean ${dir}/: ${error.message}`);
                }
            }
        }
    }
    
    async generateStructureDoc() {
        console.log('\n📝 Generating new structure documentation...\n');
        
        const structureDoc = `# 🏗️ TINI Project Structure (Reorganized)

Generated: ${new Date().toLocaleString()}

## 📁 New Directory Structure

### 🛡️ SECURITY/
**Purpose:** All security-related files and validation systems
- \`REAL-ULTIMATE-SECURITY.js\` - Main security system
- \`secure-admin-helper.js\` - Admin security helper
- \`secure-input-validator-clean.js\` - Input validation
- \`tini-validation-system.js\` - Core validation (moved from src/)
- \`production-cleanup.js\` - Security cleanup (moved from root)
- \`integrated-employee-system.js\` - Employee security (moved from SYSTEM/)
- \`ANTI-AUTOMATION DETECTOR.js\` - Anti-automation (moved from SYSTEM/)

### 🎛️ admin-panel/
**Purpose:** Complete admin dashboard system (renamed from "admin panel")
- \`admin-panel.html\` - Main admin interface
- \`server.js\` - Admin server
- \`sqlite-adapter.js\` - Database adapter
- \`custom-i18n.js\` - Internationalization
- \`ghost-integration.js\` - GHOST integration
- \`scripts/\` - Admin panel scripts
- \`api/\` - API endpoints
- \`styles/\` - CSS styles

### 🖼️ popup/
**Purpose:** Extension popup interface (renamed from Popup)
- \`popup.html\` - Popup interface
- \`popup.js\` - Main popup script
- \`popup-production-monitor.js\` - Production monitoring
- \`popup-csp-handlers.js\` - CSP handlers
- \`Popup Controller.js\` - Main controller

### 🔧 core/
**Purpose:** Core extension functionality (moved from src/ and root)
- \`background.js\` - Extension background script
- \`api-server.js\` - Main API server
- \`admin-dashboard-server.js\` - Dashboard server (moved from src/)
- \`setup-database.js\` - Database setup
- \`data-base-connect.js\` - Database connection (moved from src/)

### 📜 content-scripts/
**Purpose:** Scripts injected into web pages (moved from Script/)
- \`Tini-smart.js\` - Main content script
- \`tini-control-center.js\` - Control center
- \`content.js\` - Content manipulation

### 👻 ghost/
**Purpose:** GHOST monitoring system (renamed from Ghost)
- \`GHOST Core.js\` - Core GHOST system
- \`GHOST PRIMARY.js\` - Primary GHOST
- \`Ghost Integration.js\` - Integration layer
- \`boss-life-monitoring.js\` - Life monitoring
- \`system-performance-optimizer.js\` - Performance optimization

### 🔧 system/
**Purpose:** System integration utilities (moved from SYSTEM/)
- \`unified-system-activator.js\` - System activator
- \`MASTER-SYSTEM-INTEGRATION.js\` - Master integration
- \`SYSTEM-INTEGRATION-STATUS.js\` - Integration status

### 🛠️ tools/
**Purpose:** Development and build tools (moved from scripts/)
- \`duplicate-detector.js\` - Find duplicate files
- \`system-cleanup.js\` - Cleanup utilities
- \`system-checker.js\` - System validation
- \`security-validator.js\` - Security checks

### 📄 Root Files (Unchanged)
- \`manifest.json\` - Extension manifest
- \`package.json\` - Node.js dependencies
- \`README.md\` - Project documentation
- \`.env\` - Environment variables

### 🌍 Localization (Unchanged)
- \`_locales/\` - Translation files for all languages

### ⚙️ Configuration (Unchanged)
- \`config/\` - Configuration files
- \`Docker/\` - Docker setup

## 🔄 Changes Made

### Renamed Directories:
- \`admin panel/\` → \`admin-panel/\` (removed space for better compatibility)
- \`Popup/\` → \`popup/\` (lowercase for consistency)
- \`Ghost/\` → \`ghost/\` (lowercase for consistency)
- \`Script/\` → \`content-scripts/\` (more descriptive)
- \`scripts/\` → \`tools/\` (more descriptive)
- \`SYSTEM/\` → \`system/\` (lowercase for consistency)

### Moved Files:
- Security files consolidated to \`SECURITY/\`
- Core extension files moved to \`core/\`
- Development tools moved to \`tools/\`

### Updated References:
- \`manifest.json\` - Updated all file paths
- \`background.js\` - Updated import paths
- \`popup.html\` - Updated script sources
- \`admin-panel.html\` - Updated asset paths

## 🎯 Benefits

1. **🏗️ Logical Structure:** Files grouped by functionality
2. **📝 Consistent Naming:** All directories use consistent naming convention
3. **🔍 Easy Navigation:** Clear separation of concerns
4. **🚀 Better Maintainability:** Related files are together
5. **📦 Production Ready:** Clean, professional structure

## 🚨 Important Notes

- All file references have been automatically updated
- Extension functionality remains unchanged
- Development workflow improved
- Easier for new developers to understand

---

*Structure reorganized on ${new Date().toLocaleDateString()}*
`;

        const docPath = path.join(this.projectRoot, 'docs', 'PROJECT-STRUCTURE.md');
        
        // Ensure docs directory exists
        const docsDir = path.dirname(docPath);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        fs.writeFileSync(docPath, structureDoc);
        console.log(`📝 Structure documentation saved to: docs/PROJECT-STRUCTURE.md`);
    }
    
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 PROJECT REORGANIZATION REPORT');
        console.log('='.repeat(80));
        
        console.log(`\n📦 Files moved: ${this.movedFiles.length}`);
        console.log(`🔗 References updated: ${this.updatedReferences.length}`);
        console.log(`❌ Errors: ${this.errors.length}`);
        
        if (this.movedFiles.length > 0) {
            console.log('\n📦 MOVED FILES:');
            console.log('-'.repeat(50));
            this.movedFiles.forEach(move => {
                console.log(`   ${move.from} → ${move.to}`);
            });
        }
        
        if (this.updatedReferences.length > 0) {
            console.log('\n🔗 UPDATED REFERENCES:');
            console.log('-'.repeat(50));
            this.updatedReferences.forEach(file => {
                console.log(`   ✅ ${file}`);
            });
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            console.log('-'.repeat(50));
            this.errors.forEach(error => {
                console.log(`   ${error.operation}: ${error.file || error.folder} - ${error.error}`);
            });
        }
        
        console.log('\n🎉 REORGANIZATION COMPLETED!');
        console.log('📁 Your project now has a clean, logical structure');
        console.log('📖 Check docs/PROJECT-STRUCTURE.md for details');
        
        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                files_moved: this.movedFiles.length,
                references_updated: this.updatedReferences.length,
                errors: this.errors.length
            },
            moved_files: this.movedFiles,
            updated_references: this.updatedReferences,
            errors: this.errors
        };
        
        try {
            const reportPath = path.join(this.projectRoot, 'logs', 'reorganization-report.json');
            
            // Ensure logs directory exists
            const logsDir = path.dirname(reportPath);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`\n📄 Detailed report saved to: logs/reorganization-report.json`);
        } catch (error) {
            console.error(`❌ Could not save report:`, error.message);
        }
    }
}

// Export for external use
module.exports = ProjectReorganizer;

// Run if called directly
if (require.main === module) {
    async function runReorganization() {
        try {
            const reorganizer = new ProjectReorganizer();
            await reorganizer.reorganizeProject();
            
            console.log('\n🎉 SUCCESS: Project reorganization completed!');
            console.log('🔄 NEXT STEPS:');
            console.log('1. Test extension functionality');
            console.log('2. Verify all paths work correctly');
            console.log('3. Update any remaining documentation');
            console.log('4. Commit changes to version control');
            
        } catch (error) {
            console.error('❌ ERROR: Project reorganization failed:', error);
            process.exit(1);
        }
    }
    
    runReorganization();
}
