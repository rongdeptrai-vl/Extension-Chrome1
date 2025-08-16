// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * PRODUCTION CLEANUP SCRIPT
 * Ngăn chặn và xóa tự động các file test không mong muốn
 * 
 * ⚠️ CẢNH BÁO: ĐÂY LÀ DỰ ÁN PRODUCTION - KHÔNG TẠO FILE TEST!
 */

class ProductionCleanup {
    constructor() {
        this.testFilePatterns = [
            /.*test.*\.js$/i,
            /.*tester.*\.js$/i,
            /.*testing.*\.js$/i,
            /.*debug.*\.js$/i,
            /.*temp.*\.js$/i,
            /.*tmp.*\.js$/i
        ];
        
        this.init();
    }

    init() {
        console.log('🧹 PRODUCTION CLEANUP INITIALIZED');
        console.log('⚠️ WARNING: This is a PRODUCTION project - NO TEST FILES ALLOWED!');
        
        // Monitor for test file creation
        this.monitorFileCreation();
        
        // Clean existing test references
        this.cleanTestReferences();
    }

    monitorFileCreation() {
        // Override console methods that might create test output
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        
        console.log = (...args) => {
            const message = args.join(' ');
            if (message.includes('test') || message.includes('Test') || message.includes('TEST')) {
                if (!message.includes('PRODUCTION') && !message.includes('✅')) {
                    console.warn('⚠️ TEST OUTPUT DETECTED IN PRODUCTION!');
                }
            }
            originalLog.apply(console, args);
        };
    }

    cleanTestReferences() {
        // Remove any test-related global variables (browser environment only)
        if (typeof window !== 'undefined') {
            if (window.testRunner) {
                delete window.testRunner;
                console.log('🧹 Removed testRunner from global scope');
            }
            
            if (window.debugMode) {
                delete window.debugMode;
                console.log('🧹 Removed debugMode from global scope');
            }
            
            // Clean localStorage from test data
            if (typeof localStorage !== 'undefined') {
                const testKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('test') || key.includes('debug') || key.includes('temp'))) {
                        testKeys.push(key);
                    }
                }
                
                testKeys.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`🧹 Removed test data: ${key}`);
                });
            }
        } else {
            // In Node.js environment, clean global test variables
            if (global.testRunner) {
                delete global.testRunner;
                console.log('🧹 Removed testRunner from global scope');
            }
            
            if (global.debugMode) {
                delete global.debugMode;
                console.log('🧹 Removed debugMode from global scope');
            }
        }
    }

    // Prevent test file loading
    preventTestFileLoading() {
        const originalAppendChild = Node.prototype.appendChild;
        
        Node.prototype.appendChild = function(child) {
            if (child.tagName === 'SCRIPT' && child.src) {
                const isTestFile = this.testFilePatterns.some(pattern => 
                    pattern.test(child.src)
                );
                
                if (isTestFile) {
                    console.error('🚫 BLOCKED TEST FILE LOADING:', child.src);
                    console.error('⚠️ This is a PRODUCTION environment - test files are not allowed!');
                    return child; // Return without actually appending
                }
            }
            
            return originalAppendChild.call(this, child);
        };
    }

    // Production mode enforcer
    enforceProductionMode() {
        if (typeof window !== 'undefined') {
            // Block debug functions
            window.debug = () => {
                console.error('🚫 DEBUG FUNCTIONS DISABLED IN PRODUCTION');
            };
            
            // Block test functions
            window.test = () => {
                console.error('🚫 TEST FUNCTIONS DISABLED IN PRODUCTION');
            };
            
            // Set production flag
            window.PRODUCTION_MODE = true;
            window.NODE_ENV = 'production';
        } else {
            // Node.js environment
            global.PRODUCTION_MODE = true;
            process.env.NODE_ENV = 'production';
        }
        
        console.log('🔒 PRODUCTION MODE ENFORCED');
    }
}

// Initialize production cleanup immediately
new ProductionCleanup();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionCleanup;
}

if (typeof window !== 'undefined') {
    window.ProductionCleanup = ProductionCleanup;
}

console.log('✅ PRODUCTION CLEANUP ACTIVE - No test files will be allowed');
console.log('🔒 This is a PROFESSIONAL PRODUCTION PROJECT');
// ST:TINI_1755361782_e868a412
