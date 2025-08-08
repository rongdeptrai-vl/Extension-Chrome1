// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🔧 TINI PORT SYNCHRONIZATION & CONFLICT RESOLVER
 * 
 * Giải quyết xung đột port và chuẩn hóa toàn bộ hệ thống
 * Author: rongdeptrai-dev
 * Version: 1.0 - Critical System Fix
 */

const fs = require('fs');
const path = require('path');

class TINIPortSynchronizer {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.portMapping = new Map();
        this.newPortAssignments = new Map();
        
        // Chuẩn hóa ports theo chức năng
        this.standardPorts = {
            // Admin & Management
            'admin-dashboard': 3001,
            'admin-api': 3002,
            'admin-auth': 3003,
            
            // Security Services
            'security-scanner': 6900,
            'threat-monitor': 6901,
            'honeypot': 6902,
            'fortress': 6903,
            
            // API Services
            'main-api': 5001,
            'auth-service': 5002,
            'data-service': 5003,
            
            // Database & Cache
            'mysql': 3306,        // Keep standard
            'redis': 6379,        // Keep standard
            
            // Development & Testing
            'test-server': 8000,
            'dev-server': 8001,
            'debug-server': 8002,
            
            // Specialized
            'ghost-system': 31337, // Keep unique port
            'tiktok-blocker': 8099
        };
        
        console.log('🔧 [SYNC] TINI Port Synchronizer initialized');
    }

    async synchronizeAllPorts() {
        console.log('🔄 [SYNC] Starting port synchronization process...');
        
        // 1. Đọc báo cáo phân tích
        await this.loadAnalysisReport();
        
        // 2. Tạo port mapping strategy
        this.createPortMapping();
        
        // 3. Áp dụng thay đổi vào files
        await this.applyPortChanges();
        
        // 4. Tạo port configuration file
        this.generatePortConfig();
        
        // 5. Tạo documentation
        this.generatePortDocumentation();
        
        console.log('✅ [SYNC] Port synchronization completed!');
    }

    async loadAnalysisReport() {
        try {
            const reportPath = path.join(this.workspaceRoot, 'SYSTEM-ANALYSIS-REPORT.json');
            const reportData = fs.readFileSync(reportPath, 'utf8');
            this.analysisReport = JSON.parse(reportData);
            
            console.log(`📊 [LOAD] Analysis report loaded: ${this.analysisReport.summary.totalPorts} ports found`);
        } catch (error) {
            console.error('❌ [LOAD] Could not load analysis report:', error.message);
            throw error;
        }
    }

    createPortMapping() {
        console.log('🗺️  [MAP] Creating port mapping strategy...');
        
        // Phân tích từng port conflict
        Object.entries(this.analysisReport.ports).forEach(([port, locations]) => {
            const portNum = parseInt(port);
            
            if (locations.length > 1) {
                console.log(`⚠️  [CONFLICT] Port ${portNum} used in ${locations.length} locations`);
                
                // Phân loại theo file để assign port mới
                this.categorizeAndAssignPorts(portNum, locations);
            } else {
                // Port không conflict - giữ nguyên hoặc chuẩn hóa
                this.validateSinglePort(portNum, locations[0]);
            }
        });
    }

    categorizeAndAssignPorts(conflictPort, locations) {
        const assignments = [];
        
        locations.forEach((location, index) => {
            const category = this.categorizeFile(location.file);
            let newPort;
            
            switch (category) {
                case 'admin':
                    newPort = this.getNextPortInRange(3001, 3010);
                    break;
                case 'security':
                    newPort = this.getNextPortInRange(6900, 6920);
                    break;
                case 'api':
                    newPort = this.getNextPortInRange(5001, 5020);
                    break;
                case 'test':
                    newPort = this.getNextPortInRange(8000, 8020);
                    break;
                case 'database':
                    newPort = conflictPort; // Keep database ports
                    break;
                default:
                    newPort = this.getNextPortInRange(7000, 7100);
            }
            
            assignments.push({
                file: location.file,
                oldPort: conflictPort,
                newPort: newPort,
                category: category,
                context: location.context
            });
        });
        
        // Đặc biệt: Nếu là port 3001 (main admin), chỉ file chính giữ lại
        if (conflictPort === 3001) {
            const mainAdminFile = assignments.find(a => 
                a.file.includes('admin') && !a.file.includes('test') && !a.file.includes('example')
            );
            
            if (mainAdminFile) {
                mainAdminFile.newPort = 3001; // Giữ port gốc cho file chính
            }
        }
        
        assignments.forEach(assignment => {
            this.portMapping.set(`${assignment.file}:${assignment.oldPort}`, assignment);
        });
    }

    categorizeFile(filePath) {
        const fileName = path.basename(filePath).toLowerCase();
        const dirName = path.dirname(filePath).toLowerCase();
        
        if (fileName.includes('admin') || dirName.includes('admin')) return 'admin';
        if (fileName.includes('security') || fileName.includes('fortress') || fileName.includes('honeypot')) return 'security';
        if (fileName.includes('api') || fileName.includes('server')) return 'api';
        if (fileName.includes('test') || fileName.includes('example')) return 'test';
        if (fileName.includes('mysql') || fileName.includes('redis') || fileName.includes('db')) return 'database';
        
        return 'general';
    }

    getNextPortInRange(startPort, endPort) {
        for (let port = startPort; port <= endPort; port++) {
            if (!this.isPortAssigned(port)) {
                this.markPortAsAssigned(port);
                return port;
            }
        }
        
        // Nếu hết range, tìm port cao hơn
        return this.getNextAvailablePort(endPort + 1);
    }

    isPortAssigned(port) {
        // Kiểm tra trong assignments hiện tại
        const assigned = Array.from(this.portMapping.values()).some(assignment => 
            assignment.newPort === port
        );
        
        // Kiểm tra ports chuẩn được giữ lại
        const isStandardPort = Object.values(this.standardPorts).includes(port);
        
        return assigned || isStandardPort;
    }

    markPortAsAssigned(port) {
        this.newPortAssignments.set(port, true);
    }

    getNextAvailablePort(startPort) {
        let port = startPort;
        while (this.isPortAssigned(port) || this.isSystemPort(port)) {
            port++;
        }
        this.markPortAsAssigned(port);
        return port;
    }

    isSystemPort(port) {
        const systemPorts = [80, 443, 21, 22, 23, 25, 53, 110, 143, 993, 995];
        const reservedPorts = [1, 7, 9, 11, 13, 17, 19, 20];
        
        return systemPorts.includes(port) || reservedPorts.includes(port) || port < 1024;
    }

    validateSinglePort(port, location) {
        const category = this.categorizeFile(location.file);
        const isAppropriatePort = this.isPortAppropriateForCategory(port, category);
        
        if (!isAppropriatePort) {
            console.log(`🔄 [REASSIGN] Moving port ${port} to appropriate range for ${category}`);
            
            const newPort = this.getNewPortForCategory(category);
            this.portMapping.set(`${location.file}:${port}`, {
                file: location.file,
                oldPort: port,
                newPort: newPort,
                category: category,
                context: location.context,
                reason: 'Port standardization'
            });
        }
    }

    isPortAppropriateForCategory(port, category) {
        switch (category) {
            case 'admin': return port >= 3001 && port <= 3010;
            case 'security': return port >= 6900 && port <= 6920;
            case 'api': return port >= 5001 && port <= 5020;
            case 'test': return port >= 8000 && port <= 8020;
            case 'database': return [3306, 6379, 5432, 27017].includes(port);
            default: return true; // General ports are flexible
        }
    }

    getNewPortForCategory(category) {
        switch (category) {
            case 'admin': return this.getNextPortInRange(3001, 3010);
            case 'security': return this.getNextPortInRange(6900, 6920);
            case 'api': return this.getNextPortInRange(5001, 5020);
            case 'test': return this.getNextPortInRange(8000, 8020);
            default: return this.getNextPortInRange(7000, 7100);
        }
    }

    async applyPortChanges() {
        console.log('🔧 [APPLY] Applying port changes to files...');
        
        const changesByFile = new Map();
        
        // Group changes by file
        this.portMapping.forEach((assignment, key) => {
            const file = assignment.file;
            if (!changesByFile.has(file)) {
                changesByFile.set(file, []);
            }
            changesByFile.get(file).push(assignment);
        });
        
        // Apply changes to each file
        for (const [filePath, assignments] of changesByFile) {
            await this.updateFilePort(filePath, assignments);
        }
        
        console.log(`✅ [APPLY] Updated ${changesByFile.size} files`);
    }

    async updateFilePort(filePath, assignments) {
        try {
            const fullPath = path.join(this.workspaceRoot, filePath);
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Sort assignments by oldPort descending to avoid replacement conflicts
            assignments.sort((a, b) => b.oldPort - a.oldPort);
            
            assignments.forEach(assignment => {
                if (assignment.oldPort !== assignment.newPort) {
                    // Replace port numbers carefully
                    const patterns = [
                        new RegExp(`\\b${assignment.oldPort}\\b`, 'g'),
                        new RegExp(`port\\s*[=:]\\s*${assignment.oldPort}`, 'gi'),
                        new RegExp(`PORT\\s*[=:]\\s*${assignment.oldPort}`, 'gi'),
                        new RegExp(`listen\\s*\\(\\s*${assignment.oldPort}`, 'gi'),
                        new RegExp(`:${assignment.oldPort}\\b`, 'g')
                    ];
                    
                    patterns.forEach(pattern => {
                        content = content.replace(pattern, (match) => {
                            return match.replace(assignment.oldPort.toString(), assignment.newPort.toString());
                        });
                    });
                    
                    console.log(`  🔄 ${filePath}: ${assignment.oldPort} → ${assignment.newPort} (${assignment.category})`);
                }
            });
            
            // Write updated content
            fs.writeFileSync(fullPath, content);
            
        } catch (error) {
            console.error(`❌ [UPDATE] Error updating ${filePath}:`, error.message);
        }
    }

    generatePortConfig() {
        console.log('📋 [CONFIG] Generating port configuration...');
        
        const portConfig = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: 'production',
            
            standardPorts: this.standardPorts,
            
            portRanges: {
                admin: { start: 3001, end: 3010, description: 'Admin and management services' },
                security: { start: 6900, end: 6920, description: 'Security and monitoring services' },
                api: { start: 5001, end: 5020, description: 'API and web services' },
                database: { ports: [3306, 6379, 5432, 27017], description: 'Database services' },
                testing: { start: 8000, end: 8020, description: 'Testing and development' },
                general: { start: 7000, end: 7100, description: 'General services' }
            },
            
            assignments: {},
            
            rules: [
                'Admin services: 3001-3010',
                'Security services: 6900-6920', 
                'API services: 5001-5020',
                'Database services: Standard ports (3306, 6379, etc.)',
                'Testing services: 8000-8020',
                'General services: 7000-7100',
                'Avoid system ports: < 1024',
                'Avoid common dev ports: 3000, 8080 (unless necessary)'
            ]
        };
        
        // Add current assignments
        this.portMapping.forEach((assignment, key) => {
            const configKey = `${assignment.category}_${path.basename(assignment.file, path.extname(assignment.file))}`;
            portConfig.assignments[configKey] = {
                file: assignment.file,
                port: assignment.newPort,
                category: assignment.category,
                description: `${assignment.category} service in ${path.basename(assignment.file)}`
            };
        });
        
        const configPath = path.join(this.workspaceRoot, 'config', 'ports.json');
        
        // Create config directory if it doesn't exist
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        fs.writeFileSync(configPath, JSON.stringify(portConfig, null, 2));
        
        console.log(`📋 [CONFIG] Port configuration saved to: ${configPath}`);
    }

    generatePortDocumentation() {
        console.log('📚 [DOC] Generating port documentation...');
        
        const doc = `# 🔌 TINI System Port Configuration

## Overview
This document outlines the standardized port assignments for the TINI security system.

## Port Ranges

### Admin Services (3001-3010)
- **3001**: Main Admin Dashboard
- **3002**: Admin API Service
- **3003**: Admin Authentication Service
- **3004-3010**: Reserved for future admin services

### Security Services (6900-6920)
- **6900**: Security Scanner
- **6901**: Threat Monitor
- **6902**: Honeypot Service
- **6903**: Fortress Security
- **6904-6920**: Reserved for security modules

### API Services (5001-5020)
- **5001**: Main API Service
- **5002**: Authentication Service
- **5003**: Data Service
- **5004-5020**: Reserved for API services

### Database Services
- **3306**: MySQL Database
- **6379**: Redis Cache
- **5432**: PostgreSQL (if used)
- **27017**: MongoDB (if used)

### Testing & Development (8000-8020)
- **8000**: Test Server
- **8001**: Development Server
- **8002**: Debug Server
- **8003-8020**: Reserved for testing

### General Services (7000-7100)
- **7000-7100**: General purpose services

### Special Ports
- **31337**: GHOST System (unique identifier)
- **8099**: TikTok Blocker Service

## Port Assignment Rules

1. **No Conflicts**: Each service must have a unique port
2. **Range Compliance**: Ports must be within designated ranges
3. **System Ports**: Avoid ports < 1024 (system reserved)
4. **Common Ports**: Avoid 3000, 8080 unless necessary
5. **Documentation**: All port changes must be documented

## File Mapping

`;

        // Add current port assignments
        const sortedAssignments = Array.from(this.portMapping.values())
            .sort((a, b) => a.newPort - b.newPort);
        
        let docContent = doc;
        sortedAssignments.forEach(assignment => {
            docContent += `- **${assignment.newPort}**: \`${assignment.file}\` (${assignment.category})\n`;
        });

        docContent += `

## Conflict Resolution

The following conflicts were resolved:

`;

        // Add conflict resolution details
        const conflicts = this.analysisReport.conflicts.filter(c => c.type === 'PORT_CONFLICT');
        conflicts.forEach(conflict => {
            docContent += `- **Port ${conflict.port}**: Was used in ${conflict.locations.length} files, now properly distributed\n`;
        });

        docContent += `

## Environment Variables

Create a \`.env\` file with the following variables:

\`\`\`env
# Admin Services
ADMIN_DASHBOARD_PORT=3001
ADMIN_API_PORT=3002
ADMIN_AUTH_PORT=3003

# Security Services  
SECURITY_SCANNER_PORT=6900
THREAT_MONITOR_PORT=6901
HONEYPOT_PORT=6902
FORTRESS_PORT=6903

# API Services
MAIN_API_PORT=5001
AUTH_SERVICE_PORT=5002
DATA_SERVICE_PORT=5003

# Database
MYSQL_PORT=3306
REDIS_PORT=6379

# Testing
TEST_SERVER_PORT=8000
DEV_SERVER_PORT=8001

# Special
GHOST_SYSTEM_PORT=31337
TIKTOK_BLOCKER_PORT=8099
\`\`\`

## Verification

Run the following command to verify port configuration:

\`\`\`bash
node scripts/system-checker.js
\`\`\`

---
*Generated by TINI Port Synchronizer*
*Last updated: ${new Date().toISOString()}*
`;

        const docPath = path.join(this.workspaceRoot, 'docs', 'PORT-CONFIGURATION.md');
        
        // Create docs directory if it doesn't exist
        const docsDir = path.dirname(docPath);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        fs.writeFileSync(docPath, docContent);
        
        console.log(`📚 [DOC] Port documentation saved to: ${docPath}`);
    }
}

// Export for external use
module.exports = TINIPortSynchronizer;

// Run if called directly
if (require.main === module) {
    async function runPortSync() {
        try {
            const synchronizer = new TINIPortSynchronizer();
            await synchronizer.synchronizeAllPorts();
            
            console.log('\n🎉 [SUCCESS] Port synchronization completed successfully!');
            console.log('📋 [NEXT STEPS]:');
            console.log('  1. Review config/ports.json for port assignments');
            console.log('  2. Check docs/PORT-CONFIGURATION.md for documentation');
            console.log('  3. Update environment variables as needed');
            console.log('  4. Restart services with new port configuration');
            
        } catch (error) {
            console.error('❌ [ERROR] Port synchronization failed:', error);
            process.exit(1);
        }
    }
    
    runPortSync();
}
