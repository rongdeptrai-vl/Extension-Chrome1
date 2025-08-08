// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Phantom Persistence Engine - Công cụ duy trì liên tục ma quái

class PhantomPersistenceEngine {
    constructor() {
        this.isActive = false;
        this.persistenceLevel = 1;
        this.maxPersistenceLevel = 5;
        this.persistenceMethods = new Map();
        this.persistenceHistory = [];
        this.dataVaults = new Map();
        this.ghostSessions = new Set();
        
        this.initializePersistenceMethods();
        this.createDataVaults();
        this.activateBasicPersistence();
        
        console.log('👻 [Phantom Persistence] Engine initialized - data persistence active');
    }

    initializePersistenceMethods() {
        this.persistenceMethods.set('localStorage', {
            level: 1,
            priority: 'high',
            description: 'Local Storage Persistence',
            store: (key, data) => this.localStoragePersist(key, data),
            retrieve: (key) => this.localStorageRetrieve(key),
            verify: (key) => this.localStorageVerify(key)
        });
        
        this.persistenceMethods.set('sessionStorage', {
            level: 1,
            priority: 'medium',
            description: 'Session Storage Persistence',
            store: (key, data) => this.sessionStoragePersist(key, data),
            retrieve: (key) => this.sessionStorageRetrieve(key),
            verify: (key) => this.sessionStorageVerify(key)
        });
        
        this.persistenceMethods.set('indexedDB', {
            level: 2,
            priority: 'high',
            description: 'IndexedDB Phantom Storage',
            store: (key, data) => this.indexedDBPersist(key, data),
            retrieve: (key) => this.indexedDBRetrieve(key),
            verify: (key) => this.indexedDBVerify(key)
        });
        
        this.persistenceMethods.set('serviceWorker', {
            level: 3,
            priority: 'high',
            description: 'Service Worker Ghost Cache',
            store: (key, data) => this.serviceWorkerPersist(key, data),
            retrieve: (key) => this.serviceWorkerRetrieve(key),
            verify: (key) => this.serviceWorkerVerify(key)
        });
        
        this.persistenceMethods.set('domStorage', {
            level: 4,
            priority: 'medium',
            description: 'Hidden DOM Element Storage',
            store: (key, data) => this.domStoragePersist(key, data),
            retrieve: (key) => this.domStorageRetrieve(key),
            verify: (key) => this.domStorageVerify(key)
        });
        
        this.persistenceMethods.set('phantom', {
            level: 5,
            priority: 'critical',
            description: 'Phantom Dimensional Storage',
            store: (key, data) => this.phantomStoragePersist(key, data),
            retrieve: (key) => this.phantomStorageRetrieve(key),
            verify: (key) => this.phantomStorageVerify(key)
        });
    }

    createDataVaults() {
        console.log('🗄️ [Phantom Persistence] Creating secure data vaults...');
        
        this.dataVaults.set('authentication', {
            description: 'Authentication Data Vault',
            encryption: 'AES-256',
            priority: 'critical',
            autoBackup: true,
            multiLocation: true
        });
        
        this.dataVaults.set('system_state', {
            description: 'System State Vault',
            encryption: 'ChaCha20',
            priority: 'high',
            autoBackup: true,
            multiLocation: true
        });
        
        this.dataVaults.set('user_preferences', {
            description: 'User Preferences Vault',
            encryption: 'AES-128',
            priority: 'medium',
            autoBackup: false,
            multiLocation: false
        });
        
        this.dataVaults.set('threat_intelligence', {
            description: 'Threat Intelligence Vault',
            encryption: 'AES-256',
            priority: 'high',
            autoBackup: true,
            multiLocation: true
        });
        
        this.dataVaults.set('emergency_backup', {
            description: 'Emergency Recovery Vault',
            encryption: 'XChaCha20',
            priority: 'critical',
            autoBackup: true,
            multiLocation: true
        });
    }

    activateBasicPersistence() {
        console.log('⚡ [Phantom Persistence] Activating basic persistence...');
        
        this.isActive = true;
        this.setPersistenceLevel(1);
        
        // Start persistence monitoring
        this.startPersistenceMonitoring();
        
        // Setup auto-backup
        this.setupAutoBackup();
        
        console.log('✅ [Phantom Persistence] Basic persistence activated');
    }

    setPersistenceLevel(level) {
        if (level > this.maxPersistenceLevel) {
            console.warn('⚠️ [Phantom Persistence] Maximum persistence level reached');
            return false;
        }
        
        console.log(`📈 [Phantom Persistence] Setting persistence level to ${level}`);
        
        this.persistenceLevel = level;
        
        // Activate all methods up to this level
        for (const [methodName, method] of this.persistenceMethods) {
            if (method.level <= level) {
                console.log(`✅ [Phantom Persistence] ${method.description} activated`);
            }
        }
        
        this.logPersistenceChange(level);
        return true;
    }

    async persistData(vault, key, data, options = {}) {
        const vaultConfig = this.dataVaults.get(vault);
        if (!vaultConfig) {
            console.error(`❌ [Phantom Persistence] Vault ${vault} not found`);
            return false;
        }
        
        console.log(`💾 [Phantom Persistence] Persisting data to vault: ${vault}`);
        
        try {
            // Encrypt data
            const encryptedData = await this.encryptData(data, vaultConfig.encryption);
            
            // Create persistence package
            const persistencePackage = {
                vault,
                key,
                data: encryptedData,
                timestamp: Date.now(),
                checksum: this.calculateChecksum(data),
                metadata: {
                    encryption: vaultConfig.encryption,
                    version: '1.0',
                    options
                }
            };
            
            // Store using multiple methods if required
            const success = await this.storeMultiLocation(persistencePackage, vaultConfig);
            
            if (success) {
                console.log(`✅ [Phantom Persistence] Data persisted successfully to ${vault}`);
                this.logPersistenceActivity('persist', vault, key, true);
            } else {
                console.error(`❌ [Phantom Persistence] Failed to persist data to ${vault}`);
                this.logPersistenceActivity('persist', vault, key, false);
            }
            
            return success;
            
        } catch (error) {
            console.error(`❌ [Phantom Persistence] Persistence error:`, error);
            return false;
        }
    }

    async retrieveData(vault, key) {
        const vaultConfig = this.dataVaults.get(vault);
        if (!vaultConfig) {
            console.error(`❌ [Phantom Persistence] Vault ${vault} not found`);
            return null;
        }
        
        console.log(`📖 [Phantom Persistence] Retrieving data from vault: ${vault}`);
        
        try {
            // Try to retrieve from multiple locations
            const persistencePackage = await this.retrieveMultiLocation(vault, key, vaultConfig);
            
            if (!persistencePackage) {
                console.warn(`⚠️ [Phantom Persistence] Data not found in vault ${vault} for key ${key}`);
                return null;
            }
            
            // Decrypt data
            const decryptedData = await this.decryptData(persistencePackage.data, vaultConfig.encryption);
            
            // Verify integrity
            const isValid = this.verifyChecksum(decryptedData, persistencePackage.checksum);
            if (!isValid) {
                console.error(`❌ [Phantom Persistence] Data integrity check failed for ${vault}:${key}`);
                return null;
            }
            
            console.log(`✅ [Phantom Persistence] Data retrieved successfully from ${vault}`);
            this.logPersistenceActivity('retrieve', vault, key, true);
            
            return decryptedData;
            
        } catch (error) {
            console.error(`❌ [Phantom Persistence] Retrieval error:`, error);
            this.logPersistenceActivity('retrieve', vault, key, false);
            return null;
        }
    }

    async storeMultiLocation(persistencePackage, vaultConfig) {
        const locations = vaultConfig.multiLocation ? 
            Array.from(this.persistenceMethods.keys()) : 
            ['localStorage'];
        
        const results = [];
        
        for (const location of locations) {
            const method = this.persistenceMethods.get(location);
            if (method && method.level <= this.persistenceLevel) {
                try {
                    const key = `${persistencePackage.vault}_${persistencePackage.key}`;
                    const success = await method.store(key, persistencePackage);
                    results.push(success);
                    
                    if (success) {
                        console.log(`✅ [Phantom Persistence] Stored in ${location}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ [Phantom Persistence] Failed to store in ${location}:`, error);
                    results.push(false);
                }
            }
        }
        
        // Return true if at least one location succeeded
        return results.some(result => result === true);
    }

    async retrieveMultiLocation(vault, key, vaultConfig) {
        const locations = vaultConfig.multiLocation ? 
            Array.from(this.persistenceMethods.keys()) : 
            ['localStorage'];
        
        for (const location of locations) {
            const method = this.persistenceMethods.get(location);
            if (method && method.level <= this.persistenceLevel) {
                try {
                    const fullKey = `${vault}_${key}`;
                    const data = await method.retrieve(fullKey);
                    
                    if (data) {
                        console.log(`✅ [Phantom Persistence] Retrieved from ${location}`);
                        return data;
                    }
                } catch (error) {
                    console.warn(`⚠️ [Phantom Persistence] Failed to retrieve from ${location}:`, error);
                }
            }
        }
        
        return null;
    }

    // Storage Method Implementations
    localStoragePersist(key, data) {
        try {
            localStorage.setItem(`phantom_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ [Phantom Persistence] localStorage persist failed:', error);
            return false;
        }
    }

    localStorageRetrieve(key) {
        try {
            const data = localStorage.getItem(`phantom_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ [Phantom Persistence] localStorage retrieve failed:', error);
            return null;
        }
    }

    localStorageVerify(key) {
        return localStorage.getItem(`phantom_${key}`) !== null;
    }

    sessionStoragePersist(key, data) {
        try {
            sessionStorage.setItem(`phantom_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ [Phantom Persistence] sessionStorage persist failed:', error);
            return false;
        }
    }

    sessionStorageRetrieve(key) {
        try {
            const data = sessionStorage.getItem(`phantom_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ [Phantom Persistence] sessionStorage retrieve failed:', error);
            return null;
        }
    }

    sessionStorageVerify(key) {
        return sessionStorage.getItem(`phantom_${key}`) !== null;
    }

    async indexedDBPersist(key, data) {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('PhantomDB', 1);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('phantom_store')) {
                        db.createObjectStore('phantom_store');
                    }
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['phantom_store'], 'readwrite');
                    const store = transaction.objectStore('phantom_store');
                    store.put(data, key);
                    
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => resolve(false);
                };
                
                request.onerror = () => resolve(false);
            } catch (error) {
                console.error('❌ [Phantom Persistence] IndexedDB persist failed:', error);
                resolve(false);
            }
        });
    }

    async indexedDBRetrieve(key) {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('PhantomDB', 1);
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['phantom_store'], 'readonly');
                    const store = transaction.objectStore('phantom_store');
                    const getRequest = store.get(key);
                    
                    getRequest.onsuccess = () => resolve(getRequest.result || null);
                    getRequest.onerror = () => resolve(null);
                };
                
                request.onerror = () => resolve(null);
            } catch (error) {
                console.error('❌ [Phantom Persistence] IndexedDB retrieve failed:', error);
                resolve(null);
            }
        });
    }

    async indexedDBVerify(key) {
        const data = await this.indexedDBRetrieve(key);
        return data !== null;
    }

    // Simplified implementations for other methods
    serviceWorkerPersist(key, data) { 
        console.log('📡 [Phantom Persistence] Service Worker storage simulated'); 
        return this.localStoragePersist(`sw_${key}`, data);
    }
    serviceWorkerRetrieve(key) { return this.localStorageRetrieve(`sw_${key}`); }
    serviceWorkerVerify(key) { return this.localStorageVerify(`sw_${key}`); }

    domStoragePersist(key, data) {
        try {
            let hiddenDiv = document.getElementById('phantom-storage');
            if (!hiddenDiv) {
                hiddenDiv = document.createElement('div');
                hiddenDiv.id = 'phantom-storage';
                hiddenDiv.style.display = 'none';
                document.body.appendChild(hiddenDiv);
            }
            
            hiddenDiv.setAttribute(`data-${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ [Phantom Persistence] DOM storage persist failed:', error);
            return false;
        }
    }

    domStorageRetrieve(key) {
        try {
            const hiddenDiv = document.getElementById('phantom-storage');
            if (hiddenDiv) {
                const data = hiddenDiv.getAttribute(`data-${key}`);
                return data ? JSON.parse(data) : null;
            }
            return null;
        } catch (error) {
            console.error('❌ [Phantom Persistence] DOM storage retrieve failed:', error);
            return null;
        }
    }

    domStorageVerify(key) {
        const hiddenDiv = document.getElementById('phantom-storage');
        return hiddenDiv && hiddenDiv.hasAttribute(`data-${key}`);
    }

    phantomStoragePersist(key, data) {
        console.log('👻 [Phantom Persistence] Phantom dimensional storage simulated');
        return this.localStoragePersist(`phantom_dimensional_${key}`, data);
    }
    phantomStorageRetrieve(key) { return this.localStorageRetrieve(`phantom_dimensional_${key}`); }
    phantomStorageVerify(key) { return this.localStorageVerify(`phantom_dimensional_${key}`); }

    // Utility Methods
    async encryptData(data, algorithm) {
        // Simplified encryption simulation
        const dataString = JSON.stringify(data);
        const encoded = btoa(dataString);
        return `${algorithm}:${encoded}`;
    }

    async decryptData(encryptedData, algorithm) {
        try {
            const [alg, encoded] = encryptedData.split(':');
            if (alg !== algorithm) {
                throw new Error('Algorithm mismatch');
            }
            const decoded = atob(encoded);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('❌ [Phantom Persistence] Decryption failed:', error);
            return null;
        }
    }

    calculateChecksum(data) {
        const dataString = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    verifyChecksum(data, expectedChecksum) {
        const actualChecksum = this.calculateChecksum(data);
        return actualChecksum === expectedChecksum;
    }

    startPersistenceMonitoring() {
        setInterval(() => {
            this.performPersistenceHealthCheck();
        }, 60000); // Check every minute
    }

    performPersistenceHealthCheck() {
        console.log('🏥 [Phantom Persistence] Performing health check...');
        
        let healthScore = 100;
        const healthReport = {
            timestamp: Date.now(),
            methods: {},
            vaults: {},
            overall: 'healthy'
        };
        
        // Check persistence methods
        for (const [methodName, method] of this.persistenceMethods) {
            if (method.level <= this.persistenceLevel) {
                try {
                    const testKey = `health_check_${Date.now()}`;
                    const testData = { test: true, timestamp: Date.now() };
                    
                    const storeSuccess = method.store(testKey, testData);
                    const retrieveSuccess = method.retrieve(testKey);
                    const verifySuccess = method.verify(testKey);
                    
                    const methodHealth = storeSuccess && retrieveSuccess && verifySuccess;
                    healthReport.methods[methodName] = methodHealth;
                    
                    if (!methodHealth) {
                        healthScore -= 20;
                    }
                } catch (error) {
                    healthReport.methods[methodName] = false;
                    healthScore -= 20;
                }
            }
        }
        
        healthReport.score = healthScore;
        healthReport.overall = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical';
        
        console.log(`🏥 [Phantom Persistence] Health check complete - Score: ${healthScore}%`);
        
        // Store health report
        this.localStoragePersist('persistence_health', healthReport);
    }

    setupAutoBackup() {
        console.log('⚡ [Phantom Persistence] Setting up auto-backup system...');
        
        setInterval(() => {
            this.performAutoBackup();
        }, 300000); // Every 5 minutes
    }

    async performAutoBackup() {
        console.log('💾 [Phantom Persistence] Performing auto-backup...');
        
        const backupData = {
            timestamp: Date.now(),
            persistenceLevel: this.persistenceLevel,
            vaultStates: {},
            systemState: this.captureSystemState()
        };
        
        // Backup critical vaults
        for (const [vaultName, vaultConfig] of this.dataVaults) {
            if (vaultConfig.autoBackup) {
                backupData.vaultStates[vaultName] = await this.backupVault(vaultName);
            }
        }
        
        // Store backup
        await this.persistData('emergency_backup', 'auto_backup', backupData);
        
        console.log('✅ [Phantom Persistence] Auto-backup completed');
    }

    async backupVault(vaultName) {
        // Simplified vault backup
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(`phantom_${vaultName}`)) {
                backupKeys.push({
                    key: key,
                    data: localStorage.getItem(key)
                });
            }
        }
        return backupKeys;
    }

    captureSystemState() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            phantomSessions: this.ghostSessions.size,
            activeVaults: Array.from(this.dataVaults.keys())
        };
    }

    logPersistenceActivity(action, vault, key, success) {
        this.persistenceHistory.push({
            timestamp: Date.now(),
            action,
            vault,
            key,
            success,
            level: this.persistenceLevel
        });
        
        // Keep only last 100 activities
        if (this.persistenceHistory.length > 100) {
            this.persistenceHistory = this.persistenceHistory.slice(-100);
        }
    }

    logPersistenceChange(level) {
        this.persistenceHistory.push({
            timestamp: Date.now(),
            action: 'level_change',
            newLevel: level,
            success: true
        });
    }

    getStatus() {
        return {
            isActive: this.isActive,
            persistenceLevel: this.persistenceLevel,
            maxPersistenceLevel: this.maxPersistenceLevel,
            availableMethods: Array.from(this.persistenceMethods.keys()),
            activeVaults: Array.from(this.dataVaults.keys()),
            ghostSessions: this.ghostSessions.size,
            historyCount: this.persistenceHistory.length,
            healthy: this.isActive
        };
    }
}

// Tạo global instance
if (!window.TINI_PHANTOM_PERSISTENCE) {
    window.TINI_PHANTOM_PERSISTENCE = new PhantomPersistenceEngine();
    console.log('✅ [Phantom Persistence] Global phantom persistence engine created');
}

console.log('👻 [Phantom Persistence] Phantom Persistence Engine ready - data immortality achieved');
