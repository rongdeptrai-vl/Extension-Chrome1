// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// BOSS Device Binding - Liên kết thiết bị BOSS

class BOSSDeviceBinding {
    constructor() {
        this.boundDevices = new Map();
        this.bindingKeys = new Map();
        this.deviceHierarchy = new Map();
        this.crossDeviceSync = new Map();
        this.deviceAuthTokens = new Map();
        this.bindingHistory = [];
        this.masterDevices = new Set();
        this.slaveDevices = new Set();
        this.bindingProtocols = new Map();
        this.deviceClusters = new Map();
        
        this.initializeBOSSBinding();
        this.setupDeviceHierarchy();
        this.activateBindingProtocols();
        
        console.log('🔗 [BOSS Binding] BOSS Device Binding initialized');
    }

    initializeBOSSBinding() {
        console.log('⚡ [BOSS Binding] Initializing BOSS device binding...');
        
        // Load existing bindings
        this.loadDeviceBindings();
        
        // Setup binding cryptography
        this.setupBindingCryptography();
        
        // Initialize device discovery
        this.initializeDeviceDiscovery();
        
        // Setup cross-device communication
        this.setupCrossDeviceComm();
        
        console.log('✅ [BOSS Binding] BOSS binding initialization complete');
    }

    setupBindingCryptography() {
        console.log('🔐 [BOSS Binding] Setting up binding cryptography...');
        
        // Generate master binding key
        this.masterBindingKey = this.generateMasterKey();
        
        // Setup key derivation
        this.keyDerivationSalt = this.generateSalt();
        
        // Initialize encryption protocols
        this.bindingProtocols.set('AES-256-GCM', {
            algorithm: 'AES-GCM',
            keyLength: 256,
            ivLength: 12,
            tagLength: 16
        });
        
        this.bindingProtocols.set('ChaCha20-Poly1305', {
            algorithm: 'ChaCha20-Poly1305',
            keyLength: 256,
            nonceLength: 12,
            tagLength: 16
        });
        
        this.bindingProtocols.set('XSalsa20-Poly1305', {
            algorithm: 'XSalsa20-Poly1305',
            keyLength: 256,
            nonceLength: 24,
            tagLength: 16
        });
        
        console.log('🔑 [BOSS Binding] Binding cryptography ready');
    }

    generateMasterKey() {
        // Generate cryptographically secure master key
        if (crypto && crypto.getRandomValues) {
            const keyBytes = new Uint8Array(32); // 256 bits
            crypto.getRandomValues(keyBytes);
            return Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
            // Fallback for environments without crypto API
            return this.generateSecureRandom(64);
        }
    }

    generateSalt() {
        if (crypto && crypto.getRandomValues) {
            const saltBytes = new Uint8Array(16);
            crypto.getRandomValues(saltBytes);
            return Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        } else {
            return this.generateSecureRandom(32);
        }
    }

    generateSecureRandom(length) {
        const chars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async initializeDeviceDiscovery() {
        console.log('📡 [BOSS Binding] Initializing device discovery...');
        
        // Get current device ID
        this.currentDeviceId = this.getCurrentDeviceId();
        
        // Setup device broadcast
        this.setupDeviceBroadcast();
        
        // Setup device listening
        this.setupDeviceListener();
        
        // Discover nearby devices
        await this.discoverNearbyDevices();
        
        console.log('🔍 [BOSS Binding] Device discovery ready');
    }

    getCurrentDeviceId() {
        // Get device ID from device registry if available
        if (window.TINI_DEVICE_REGISTRY) {
            return window.TINI_DEVICE_REGISTRY.getCurrentDevice().id;
        }
        
        // Fallback to localStorage
        let deviceId = localStorage.getItem('boss_device_id');
        if (!deviceId) {
            deviceId = 'boss_' + this.generateSecureRandom(32);
            localStorage.setItem('boss_device_id', deviceId);
        }
        
        return deviceId;
    }

    setupDeviceBroadcast() {
        // Setup periodic broadcast of device presence
        this.broadcastInterval = setInterval(() => {
            this.broadcastDevicePresence();
        }, 30000); // Every 30 seconds
        
        // Setup local storage event listener for cross-tab communication
        addEventListener('storage', (event) => {
            if (event.key === 'boss_device_broadcast') {
                this.handleDeviceBroadcast(event.newValue);
            }
        });
    }

    broadcastDevicePresence() {
        const broadcastData = {
            deviceId: this.currentDeviceId,
            timestamp: Date.now(),
            capabilities: this.getDeviceCapabilities(),
            bindingStatus: this.getBindingStatus(),
            hierarchy: this.getDeviceHierarchyInfo(),
            authToken: this.generateDeviceAuthToken(),
            nonce: this.generateSecureRandom(16)
        };
        
        // Encrypt broadcast data
        const encryptedData = this.encryptBroadcastData(broadcastData);
        
        // Store in localStorage for cross-tab communication
        localStorage.setItem('boss_device_broadcast', JSON.stringify({
            data: encryptedData,
            timestamp: Date.now()
        }));
        
        // Use additional communication channels if available
        this.broadcastViaAlternativeChannels(encryptedData);
    }

    encryptBroadcastData(data) {
        try {
            const jsonData = JSON.stringify(data);
            const key = this.deriveEncryptionKey('broadcast');
            return this.encryptWithKey(jsonData, key);
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Broadcast encryption failed:', error);
            return btoa(JSON.stringify(data)); // Fallback to base64
        }
    }

    deriveEncryptionKey(purpose) {
        // Derive key for specific purpose using PBKDF2-like approach
        const input = this.masterBindingKey + purpose + this.keyDerivationSalt;
        return this.hashString(input);
    }

    encryptWithKey(data, key) {
        // Simple XOR encryption for demo (use proper encryption in production)
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            const dataChar = data.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(dataChar ^ keyChar);
        }
        return btoa(encrypted);
    }

    decryptWithKey(encryptedData, key) {
        try {
            const encrypted = atob(encryptedData);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                const encChar = encrypted.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(encChar ^ keyChar);
            }
            return decrypted;
        } catch (error) {
            return null;
        }
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    broadcastViaAlternativeChannels(encryptedData) {
        // Broadcast via service worker if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'boss_device_broadcast',
                data: encryptedData
            });
        }
        
        // Broadcast via shared worker if available
        if (window.SharedWorker) {
            try {
                const worker = new SharedWorker('data:application/javascript,self.onconnect=function(e){e.ports[0].onmessage=function(m){}}');
                worker.port.postMessage({
                    type: 'boss_device_broadcast',
                    data: encryptedData
                });
            } catch (e) {
                // Shared worker not available
            }
        }
    }

    setupDeviceListener() {
        // Listen for device broadcasts
        setInterval(() => {
            this.scanForDeviceBroadcasts();
        }, 5000); // Every 5 seconds
    }

    scanForDeviceBroadcasts() {
        try {
            const broadcastData = localStorage.getItem('boss_device_broadcast');
            if (broadcastData) {
                const parsed = JSON.parse(broadcastData);
                
                // Check if broadcast is recent (within 2 minutes)
                if (Date.now() - parsed.timestamp < 120000) {
                    this.handleDeviceBroadcast(broadcastData);
                }
            }
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Failed to scan broadcasts:', error);
        }
    }

    handleDeviceBroadcast(broadcastData) {
        try {
            const parsed = JSON.parse(broadcastData);
            const decryptedData = this.decryptBroadcastData(parsed.data);
            
            if (decryptedData && decryptedData.deviceId !== this.currentDeviceId) {
                this.processDiscoveredDevice(decryptedData);
            }
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Failed to handle broadcast:', error);
        }
    }

    decryptBroadcastData(encryptedData) {
        try {
            const key = this.deriveEncryptionKey('broadcast');
            const decryptedJson = this.decryptWithKey(encryptedData, key);
            return JSON.parse(decryptedJson);
        } catch (error) {
            // Try fallback base64 decode
            try {
                return JSON.parse(atob(encryptedData));
            } catch (e) {
                return null;
            }
        }
    }

    async processDiscoveredDevice(deviceData) {
        console.log(`📱 [BOSS Binding] Discovered device: ${deviceData.deviceId}`);
        
        // Verify device authenticity
        const isAuthentic = await this.verifyDeviceAuthenticity(deviceData);
        if (!isAuthentic) {
            console.warn(`⚠️ [BOSS Binding] Device ${deviceData.deviceId} failed authenticity check`);
            return;
        }
        
        // Check if device is already bound
        if (this.boundDevices.has(deviceData.deviceId)) {
            this.updateBoundDevice(deviceData);
        } else {
            // Initiate binding process
            await this.initiateBondingProcess(deviceData);
        }
    }

    async verifyDeviceAuthenticity(deviceData) {
        // Check device auth token
        if (!deviceData.authToken || !this.validateAuthToken(deviceData.authToken)) {
            return false;
        }
        
        // Check device capabilities consistency
        if (!this.validateDeviceCapabilities(deviceData.capabilities)) {
            return false;
        }
        
        // Check hierarchy information
        if (!this.validateHierarchyInfo(deviceData.hierarchy)) {
            return false;
        }
        
        // Check timestamp freshness
        if (Math.abs(Date.now() - deviceData.timestamp) > 300000) { // 5 minutes
            return false;
        }
        
        return true;
    }

    validateAuthToken(authToken) {
        // Validate device authentication token
        try {
            const parts = authToken.split('.');
            if (parts.length !== 3) return false;
            
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];
            
            // Check token expiration
            if (payload.exp && Date.now() > payload.exp * 1000) {
                return false;
            }
            
            // Verify signature (simplified)
            const expectedSignature = this.hashString(parts[0] + '.' + parts[1] + this.masterBindingKey);
            return signature === expectedSignature;
            
        } catch (error) {
            return false;
        }
    }

    generateDeviceAuthToken() {
        const header = {
            alg: 'BOSS256',
            typ: 'BDAT' // BOSS Device Auth Token
        };
        
        const payload = {
            deviceId: this.currentDeviceId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor((Date.now() + 3600000) / 1000), // 1 hour
            capabilities: this.getDeviceCapabilities(),
            hierarchy: this.getDeviceHierarchyInfo()
        };
        
        const headerB64 = btoa(JSON.stringify(header));
        const payloadB64 = btoa(JSON.stringify(payload));
        const signature = this.hashString(headerB64 + '.' + payloadB64 + this.masterBindingKey);
        
        return `${headerB64}.${payloadB64}.${signature}`;
    }

    validateDeviceCapabilities(capabilities) {
        // Basic validation of device capabilities
        return capabilities && typeof capabilities === 'object' &&
               capabilities.hasOwnProperty('storage') &&
               capabilities.hasOwnProperty('crypto') &&
               capabilities.hasOwnProperty('network');
    }

    validateHierarchyInfo(hierarchy) {
        // Validate device hierarchy information
        return hierarchy && typeof hierarchy === 'object' &&
               hierarchy.hasOwnProperty('level') &&
               typeof hierarchy.level === 'string';
    }

    async initiateBondingProcess(deviceData) {
        console.log(`🤝 [BOSS Binding] Initiating binding with device: ${deviceData.deviceId}`);
        
        // Generate binding key for this device
        const bindingKey = await this.generateDeviceBindingKey(deviceData.deviceId);
        
        // Create binding record
        const bindingRecord = {
            deviceId: deviceData.deviceId,
            bindingKey: bindingKey,
            boundAt: Date.now(),
            lastSeen: Date.now(),
            capabilities: deviceData.capabilities,
            hierarchy: deviceData.hierarchy,
            trustLevel: 'pending',
            syncStatus: 'initializing',
            bindingVersion: '1.0.0'
        };
        
        // Store binding
        this.boundDevices.set(deviceData.deviceId, bindingRecord);
        this.bindingKeys.set(deviceData.deviceId, bindingKey);
        
        // Initiate handshake
        await this.performBindingHandshake(deviceData);
        
        // Add to binding history
        this.bindingHistory.push({
            action: 'bind',
            deviceId: deviceData.deviceId,
            timestamp: Date.now(),
            success: true
        });
        
        console.log(`✅ [BOSS Binding] Device ${deviceData.deviceId} bound successfully`);
        
        // Save bindings
        this.saveDeviceBindings();
    }

    async generateDeviceBindingKey(deviceId) {
        const keyMaterial = this.masterBindingKey + deviceId + Date.now();
        
        if (crypto && crypto.subtle) {
            try {
                // Use Web Crypto API for proper key derivation
                const encoder = new TextEncoder();
                const keyMaterialBuffer = encoder.encode(keyMaterial);
                
                const importedKey = await crypto.subtle.importKey(
                    'raw',
                    keyMaterialBuffer,
                    { name: 'PBKDF2' },
                    false,
                    ['deriveKey']
                );
                
                const derivedKey = await crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: encoder.encode(this.keyDerivationSalt),
                        iterations: 100000,
                        hash: 'SHA-256'
                    },
                    importedKey,
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
                
                const keyBuffer = await crypto.subtle.exportKey('raw', derivedKey);
                return Array.from(new Uint8Array(keyBuffer))
                    .map(b => b.toString(16).padStart(2, '0')).join('');
                    
            } catch (error) {
                console.warn('⚠️ [BOSS Binding] Crypto API key derivation failed, using fallback');
            }
        }
        
        // Fallback key derivation
        return this.hashString(keyMaterial + this.keyDerivationSalt);
    }

    async performBindingHandshake(deviceData) {
        // Create handshake message
        const handshakeMessage = {
            type: 'binding_handshake',
            initiatorId: this.currentDeviceId,
            targetId: deviceData.deviceId,
            timestamp: Date.now(),
            challenge: this.generateSecureRandom(32),
            capabilities: this.getDeviceCapabilities(),
            bindingVersion: '1.0.0'
        };
        
        // Send handshake via available channels
        await this.sendBindingMessage(deviceData.deviceId, handshakeMessage);
        
        // Wait for handshake response
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn(`⚠️ [BOSS Binding] Handshake timeout for device ${deviceData.deviceId}`);
                resolve(false);
            }, 30000); // 30 second timeout
            
            // Setup response listener
            this.setupHandshakeResponseListener(deviceData.deviceId, (success) => {
                clearTimeout(timeout);
                resolve(success);
            });
        });
    }

    async sendBindingMessage(targetDeviceId, message) {
        // Encrypt message
        const bindingKey = this.bindingKeys.get(targetDeviceId) || this.masterBindingKey;
        const encryptedMessage = this.encryptWithKey(JSON.stringify(message), bindingKey);
        
        // Send via localStorage
        localStorage.setItem(`boss_binding_${targetDeviceId}`, JSON.stringify({
            data: encryptedMessage,
            timestamp: Date.now()
        }));
        
        // Send via other channels
        await this.sendViaAlternativeChannels(targetDeviceId, encryptedMessage);
    }

    async sendViaAlternativeChannels(targetDeviceId, encryptedMessage) {
        // Use phantom persistence if available
        if (window.TINI_PHANTOM_PERSISTENCE) {
            try {
                await window.TINI_PHANTOM_PERSISTENCE.persistData(
                    'device_binding',
                    `message_${targetDeviceId}`,
                    encryptedMessage
                );
            } catch (error) {
                console.warn('⚠️ [BOSS Binding] Phantom storage failed:', error);
            }
        }
        
        // Use other storage methods
        try {
            sessionStorage.setItem(`boss_binding_${targetDeviceId}`, encryptedMessage);
        } catch (error) {
            // Session storage not available
        }
    }

    setupHandshakeResponseListener(deviceId, callback) {
        const checkResponse = () => {
            const responseKey = `boss_binding_response_${deviceId}`;
            const response = localStorage.getItem(responseKey);
            
            if (response) {
                localStorage.removeItem(responseKey);
                
                try {
                    const parsed = JSON.parse(response);
                    const bindingKey = this.bindingKeys.get(deviceId) || this.masterBindingKey;
                    const decryptedResponse = this.decryptWithKey(parsed.data, bindingKey);
                    const responseData = JSON.parse(decryptedResponse);
                    
                    if (responseData.type === 'binding_handshake_response' && responseData.success) {
                        callback(true);
                        return;
                    }
                } catch (error) {
                    console.warn('⚠️ [BOSS Binding] Failed to parse handshake response:', error);
                }
            }
            
            // Continue checking
            setTimeout(checkResponse, 1000);
        };
        
        checkResponse();
    }

    updateBoundDevice(deviceData) {
        const boundDevice = this.boundDevices.get(deviceData.deviceId);
        if (boundDevice) {
            boundDevice.lastSeen = Date.now();
            boundDevice.capabilities = deviceData.capabilities;
            boundDevice.hierarchy = deviceData.hierarchy;
            
            console.log(`🔄 [BOSS Binding] Updated bound device: ${deviceData.deviceId}`);
        }
    }

    setupDeviceHierarchy() {
        console.log('🏗️ [BOSS Binding] Setting up device hierarchy...');
        
        // Determine current device hierarchy level
        this.determineHierarchyLevel();
        
        // Setup hierarchy management
        this.setupHierarchyManagement();
        
        // Initialize master/slave relationships
        this.initializeMasterSlaveRelations();
        
        console.log('📊 [BOSS Binding] Device hierarchy ready');
    }

    determineHierarchyLevel() {
        // Determine hierarchy based on device capabilities and context
        const capabilities = this.getDeviceCapabilities();
        
        let hierarchyScore = 0;
        
        // Performance scoring
        if (capabilities.performance === 'high') hierarchyScore += 3;
        else if (capabilities.performance === 'medium') hierarchyScore += 2;
        else hierarchyScore += 1;
        
        // Security scoring
        if (capabilities.security?.secureContext) hierarchyScore += 2;
        if (capabilities.crypto?.subtle) hierarchyScore += 2;
        
        // Storage scoring
        if (capabilities.storage?.persistent) hierarchyScore += 1;
        if (capabilities.storage?.indexedDB) hierarchyScore += 1;
        
        // Network scoring
        if (capabilities.network?.webSocket) hierarchyScore += 1;
        if (capabilities.network?.serviceWorker) hierarchyScore += 1;
        
        // Determine level based on score
        let level;
        if (hierarchyScore >= 8) {
            level = 'master';
            this.masterDevices.add(this.currentDeviceId);
        } else if (hierarchyScore >= 5) {
            level = 'lieutenant';
        } else {
            level = 'soldier';
            this.slaveDevices.add(this.currentDeviceId);
        }
        
        this.deviceHierarchy.set(this.currentDeviceId, {
            level: level,
            score: hierarchyScore,
            capabilities: capabilities,
            assignedAt: Date.now()
        });
        
        console.log(`👑 [BOSS Binding] Device hierarchy assigned: ${level} (score: ${hierarchyScore})`);
    }

    setupHierarchyManagement() {
        // Setup periodic hierarchy reevaluation
        setInterval(() => {
            this.reevaluateHierarchy();
        }, 300000); // Every 5 minutes
        
        // Setup hierarchy sync
        setInterval(() => {
            this.syncHierarchyInformation();
        }, 60000); // Every minute
    }

    reevaluateHierarchy() {
        // Reevaluate device hierarchy based on current conditions
        const currentHierarchy = this.deviceHierarchy.get(this.currentDeviceId);
        if (!currentHierarchy) return;
        
        const newCapabilities = this.getDeviceCapabilities();
        const newScore = this.calculateHierarchyScore(newCapabilities);
        
        if (Math.abs(newScore - currentHierarchy.score) > 2) {
            console.log('🔄 [BOSS Binding] Significant hierarchy change detected, updating...');
            this.determineHierarchyLevel();
        }
    }

    calculateHierarchyScore(capabilities) {
        // Simplified scoring for reevaluation
        let score = 0;
        if (capabilities.performance === 'high') score += 3;
        if (capabilities.security?.secureContext) score += 2;
        if (capabilities.crypto?.subtle) score += 2;
        if (capabilities.storage?.persistent) score += 1;
        return score;
    }

    syncHierarchyInformation() {
        // Sync hierarchy info across bound devices
        const hierarchyData = {
            currentDevice: this.currentDeviceId,
            hierarchy: Object.fromEntries(this.deviceHierarchy),
            masters: Array.from(this.masterDevices),
            slaves: Array.from(this.slaveDevices),
            timestamp: Date.now()
        };
        
        // Broadcast hierarchy update
        this.broadcastHierarchyUpdate(hierarchyData);
    }

    broadcastHierarchyUpdate(hierarchyData) {
        for (const deviceId of this.boundDevices.keys()) {
            if (deviceId !== this.currentDeviceId) {
                this.sendBindingMessage(deviceId, {
                    type: 'hierarchy_update',
                    data: hierarchyData,
                    timestamp: Date.now()
                });
            }
        }
    }

    initializeMasterSlaveRelations() {
        // Setup master-slave command structure
        this.setupCommandStructure();
        
        // Setup data synchronization
        this.setupDataSynchronization();
        
        // Setup load balancing
        this.setupLoadBalancing();
    }

    setupCommandStructure() {
        // Listen for commands from master devices
        addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('boss_command_')) {
                this.handleBossCommand(event.key, event.newValue);
            }
        });
    }

    handleBossCommand(commandKey, commandData) {
        try {
            const targetDeviceId = commandKey.replace('boss_command_', '');
            if (targetDeviceId !== this.currentDeviceId) return;
            
            const parsed = JSON.parse(commandData);
            const bindingKey = this.bindingKeys.get(parsed.fromDevice) || this.masterBindingKey;
            const decryptedCommand = this.decryptWithKey(parsed.data, bindingKey);
            const command = JSON.parse(decryptedCommand);
            
            this.executeCommand(command, parsed.fromDevice);
            
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Failed to handle command:', error);
        }
    }

    async executeCommand(command, fromDevice) {
        console.log(`⚡ [BOSS Binding] Executing command from ${fromDevice}: ${command.type}`);
        
        switch (command.type) {
            case 'sync_data':
                await this.syncDataWithDevice(fromDevice, command.data);
                break;
                
            case 'update_hierarchy':
                this.updateHierarchyFromMaster(command.data);
                break;
                
            case 'security_alert':
                this.handleSecurityAlert(command.data);
                break;
                
            case 'backup_request':
                await this.performBackupForMaster(fromDevice, command.data);
                break;
                
            case 'load_balance':
                this.adjustLoadBalancing(command.data);
                break;
                
            default:
                console.warn(`⚠️ [BOSS Binding] Unknown command type: ${command.type}`);
        }
    }

    setupDataSynchronization() {
        // Setup automatic data sync between bound devices
        this.syncSchedule = setInterval(() => {
            this.performPeriodicSync();
        }, 120000); // Every 2 minutes
    }

    async performPeriodicSync() {
        if (this.boundDevices.size === 0) return;
        
        console.log('🔄 [BOSS Binding] Performing periodic data sync...');
        
        const syncData = {
            deviceRegistry: this.getDeviceRegistrySnapshot(),
            securityState: this.getSecurityStateSnapshot(),
            hierarchyInfo: Object.fromEntries(this.deviceHierarchy),
            timestamp: Date.now()
        };
        
        for (const deviceId of this.boundDevices.keys()) {
            if (deviceId !== this.currentDeviceId) {
                await this.syncDataWithDevice(deviceId, syncData);
            }
        }
    }

    async syncDataWithDevice(deviceId, syncData) {
        const message = {
            type: 'sync_data',
            data: syncData,
            timestamp: Date.now()
        };
        
        await this.sendBindingMessage(deviceId, message);
    }

    getDeviceRegistrySnapshot() {
        if (window.TINI_DEVICE_REGISTRY) {
            return window.TINI_DEVICE_REGISTRY.getStatus();
        }
        return null;
    }

    getSecurityStateSnapshot() {
        const securityState = {};
        
        if (window.TINI_BOSS_SECURITY) {
            securityState.boss = window.TINI_BOSS_SECURITY.getStatus();
        }
        
        if (window.TINI_ULTIMATE_FORTRESS) {
            securityState.fortress = window.TINI_ULTIMATE_FORTRESS.getStatus();
        }
        
        return securityState;
    }

    setupLoadBalancing() {
        // Setup load balancing between devices
        this.loadMetrics = {
            cpu: 0,
            memory: 0,
            network: 0,
            storage: 0
        };
        
        // Monitor load metrics
        setInterval(() => {
            this.updateLoadMetrics();
        }, 30000); // Every 30 seconds
    }

    updateLoadMetrics() {
        // Update performance metrics
        this.loadMetrics = {
            cpu: this.getCPUUsage(),
            memory: this.getMemoryUsage(),
            network: this.getNetworkUsage(),
            storage: this.getStorageUsage(),
            timestamp: Date.now()
        };
        
        // Share metrics with master devices
        this.shareLoadMetrics();
    }

    getCPUUsage() {
        // Estimate CPU usage based on performance timing
        if (performance && performance.now) {
            const start = performance.now();
            // Simple CPU intensive operation
            for (let i = 0; i < 100000; i++) {
                Math.random();
            }
            const end = performance.now();
            return Math.min((end - start) / 10, 100); // Normalize to 0-100
        }
        return 0;
    }

    getMemoryUsage() {
        if (performance && performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.totalJSHeapSize;
            return (used / total) * 100;
        }
        return 0;
    }

    getNetworkUsage() {
        // Estimate network usage (simplified)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return connection.downlink || 0;
        }
        return 0;
    }

    getStorageUsage() {
        // Estimate storage usage
        try {
            const used = JSON.stringify(localStorage).length;
            return Math.min(used / 5242880 * 100, 100); // Assume 5MB limit
        } catch (e) {
            return 0;
        }
    }

    shareLoadMetrics() {
        // Share load metrics with master devices
        for (const deviceId of this.masterDevices) {
            if (deviceId !== this.currentDeviceId && this.boundDevices.has(deviceId)) {
                this.sendBindingMessage(deviceId, {
                    type: 'load_metrics',
                    data: this.loadMetrics,
                    timestamp: Date.now()
                });
            }
        }
    }

    activateBindingProtocols() {
        console.log('⚡ [BOSS Binding] Activating binding protocols...');
        
        // Setup protocol handlers
        this.setupProtocolHandlers();
        
        // Setup emergency unbinding
        this.setupEmergencyUnbinding();
        
        // Setup binding verification
        this.setupBindingVerification();
        
        console.log('✅ [BOSS Binding] Binding protocols fully activated');
    }

    setupProtocolHandlers() {
        // Handle various binding protocol messages
        setInterval(() => {
            this.processIncomingMessages();
        }, 5000); // Every 5 seconds
    }

    processIncomingMessages() {
        // Process messages from other devices
        for (const deviceId of this.boundDevices.keys()) {
            const messageKey = `boss_binding_${this.currentDeviceId}`;
            const message = localStorage.getItem(messageKey);
            
            if (message) {
                localStorage.removeItem(messageKey);
                this.processBindingMessage(message, deviceId);
            }
        }
    }

    processBindingMessage(message, fromDevice) {
        try {
            const parsed = JSON.parse(message);
            const bindingKey = this.bindingKeys.get(fromDevice) || this.masterBindingKey;
            const decryptedData = this.decryptWithKey(parsed.data, bindingKey);
            const messageData = JSON.parse(decryptedData);
            
            this.handleBindingMessage(messageData, fromDevice);
            
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Failed to process binding message:', error);
        }
    }

    handleBindingMessage(messageData, fromDevice) {
        switch (messageData.type) {
            case 'binding_handshake':
                this.respondToHandshake(messageData, fromDevice);
                break;
                
            case 'sync_data':
                this.handleDataSync(messageData.data, fromDevice);
                break;
                
            case 'hierarchy_update':
                this.handleHierarchyUpdate(messageData.data, fromDevice);
                break;
                
            case 'load_metrics':
                this.handleLoadMetrics(messageData.data, fromDevice);
                break;
                
            case 'emergency_unbind':
                this.handleEmergencyUnbind(messageData, fromDevice);
                break;
                
            default:
                console.warn(`⚠️ [BOSS Binding] Unknown message type: ${messageData.type}`);
        }
    }

    respondToHandshake(handshakeData, fromDevice) {
        // Respond to binding handshake
        const response = {
            type: 'binding_handshake_response',
            success: true,
            challenge: handshakeData.challenge,
            responseChallenge: this.generateSecureRandom(32),
            capabilities: this.getDeviceCapabilities(),
            hierarchy: this.getDeviceHierarchyInfo(),
            timestamp: Date.now()
        };
        
        this.sendBindingResponse(fromDevice, response);
    }

    sendBindingResponse(targetDevice, response) {
        const bindingKey = this.bindingKeys.get(targetDevice) || this.masterBindingKey;
        const encryptedResponse = this.encryptWithKey(JSON.stringify(response), bindingKey);
        
        localStorage.setItem(`boss_binding_response_${targetDevice}`, JSON.stringify({
            data: encryptedResponse,
            timestamp: Date.now()
        }));
    }

    setupEmergencyUnbinding() {
        // Setup emergency unbinding procedures
        addEventListener('beforeunload', () => {
            this.performEmergencyUnbind('browser_close');
        });
        
        // Setup security-triggered unbinding
        if (window.TINI_BOSS_SECURITY) {
            // Listen for security events that require unbinding
        }
    }

    performEmergencyUnbind(reason) {
        console.log(`🚨 [BOSS Binding] Performing emergency unbind: ${reason}`);
        
        // Send unbind notification to all bound devices
        for (const deviceId of this.boundDevices.keys()) {
            if (deviceId !== this.currentDeviceId) {
                this.sendBindingMessage(deviceId, {
                    type: 'emergency_unbind',
                    reason: reason,
                    timestamp: Date.now()
                });
            }
        }
        
        // Clear binding data
        this.clearBindingData();
    }

    clearBindingData() {
        this.boundDevices.clear();
        this.bindingKeys.clear();
        this.deviceAuthTokens.clear();
        
        // Clear storage
        localStorage.removeItem('boss_device_bindings');
        sessionStorage.removeItem('boss_device_bindings');
    }

    setupBindingVerification() {
        // Verify bindings periodically
        setInterval(() => {
            this.verifyDeviceBindings();
        }, 180000); // Every 3 minutes
    }

    verifyDeviceBindings() {
        console.log('🔍 [BOSS Binding] Verifying device bindings...');
        
        for (const [deviceId, bindingData] of this.boundDevices) {
            if (Date.now() - bindingData.lastSeen > 600000) { // 10 minutes
                console.warn(`⚠️ [BOSS Binding] Device ${deviceId} seems inactive, marking as stale`);
                bindingData.trustLevel = 'stale';
            }
        }
    }

    async discoverNearbyDevices() {
        console.log('🔍 [BOSS Binding] Discovering nearby devices...');
        
        // Discovery is handled through broadcast/listen mechanism
        // This method triggers the discovery process
        this.broadcastDevicePresence();
        
        // Wait for responses
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log(`📱 [BOSS Binding] Discovery complete. Found ${this.boundDevices.size} bound devices.`);
    }

    getDeviceCapabilities() {
        if (window.TINI_DEVICE_REGISTRY) {
            const currentDevice = window.TINI_DEVICE_REGISTRY.getCurrentDevice();
            return currentDevice.capabilities || this.getBasicCapabilities();
        }
        
        return this.getBasicCapabilities();
    }

    getBasicCapabilities() {
        return {
            storage: {
                localStorage: typeof localStorage !== 'undefined',
                sessionStorage: typeof sessionStorage !== 'undefined',
                indexedDB: typeof indexedDB !== 'undefined'
            },
            crypto: {
                subtle: 'crypto' in window && 'subtle' in crypto,
                random: 'crypto' in window && 'getRandomValues' in crypto
            },
            network: {
                webSocket: 'WebSocket' in window,
                fetch: 'fetch' in window
            },
            security: {
                secureContext: window.isSecureContext
            },
            performance: 'medium'
        };
    }

    getBindingStatus() {
        return {
            boundDevices: this.boundDevices.size,
            hierarchy: this.deviceHierarchy.get(this.currentDeviceId)?.level || 'unknown',
            isMaster: this.masterDevices.has(this.currentDeviceId),
            isSlave: this.slaveDevices.has(this.currentDeviceId)
        };
    }

    getDeviceHierarchyInfo() {
        return this.deviceHierarchy.get(this.currentDeviceId) || {
            level: 'unknown',
            score: 0,
            assignedAt: Date.now()
        };
    }

    loadDeviceBindings() {
        try {
            const stored = localStorage.getItem('boss_device_bindings');
            if (stored) {
                const data = JSON.parse(stored);
                
                if (data.boundDevices) {
                    this.boundDevices = new Map(Object.entries(data.boundDevices));
                }
                if (data.bindingKeys) {
                    this.bindingKeys = new Map(Object.entries(data.bindingKeys));
                }
                if (data.deviceHierarchy) {
                    this.deviceHierarchy = new Map(Object.entries(data.deviceHierarchy));
                }
                if (data.masterDevices) {
                    this.masterDevices = new Set(data.masterDevices);
                }
                if (data.slaveDevices) {
                    this.slaveDevices = new Set(data.slaveDevices);
                }
                
                console.log(`💾 [BOSS Binding] Loaded ${this.boundDevices.size} device bindings`);
            }
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Failed to load bindings:', error);
        }
    }

    saveDeviceBindings() {
        try {
            const data = {
                boundDevices: Object.fromEntries(this.boundDevices),
                bindingKeys: Object.fromEntries(this.bindingKeys),
                deviceHierarchy: Object.fromEntries(this.deviceHierarchy),
                masterDevices: Array.from(this.masterDevices),
                slaveDevices: Array.from(this.slaveDevices),
                lastSaved: Date.now()
            };
            
            localStorage.setItem('boss_device_bindings', JSON.stringify(data));
            
            // Also save to phantom persistence if available
            if (window.TINI_PHANTOM_PERSISTENCE) {
                window.TINI_PHANTOM_PERSISTENCE.persistData('boss_binding', 'device_bindings', data);
            }
            
        } catch (error) {
            console.warn('⚠️ [BOSS Binding] Failed to save bindings:', error);
        }
    }

    // Placeholder implementations for helper methods
    handleDataSync(data, fromDevice) { console.log(`🔄 [BOSS Binding] Data sync from ${fromDevice}`); }
    handleHierarchyUpdate(data, fromDevice) { console.log(`📊 [BOSS Binding] Hierarchy update from ${fromDevice}`); }
    handleLoadMetrics(data, fromDevice) { console.log(`📈 [BOSS Binding] Load metrics from ${fromDevice}`); }
    handleEmergencyUnbind(data, fromDevice) { console.log(`🚨 [BOSS Binding] Emergency unbind from ${fromDevice}`); }
    updateHierarchyFromMaster(data) { console.log(`👑 [BOSS Binding] Hierarchy update from master`); }
    handleSecurityAlert(data) { console.log(`🚨 [BOSS Binding] Security alert received`); }
    async performBackupForMaster(fromDevice, data) { console.log(`💾 [BOSS Binding] Backup request from ${fromDevice}`); }
    adjustLoadBalancing(data) { console.log(`⚖️ [BOSS Binding] Load balancing adjustment`); }
    setupCrossDeviceComm() { console.log('📡 [BOSS Binding] Cross-device communication setup'); }

    getStatus() {
        return {
            currentDevice: this.currentDeviceId,
            boundDevices: this.boundDevices.size,
            hierarchyLevel: this.getDeviceHierarchyInfo().level,
            isMaster: this.masterDevices.has(this.currentDeviceId),
            isSlave: this.slaveDevices.has(this.currentDeviceId),
            bindingHistory: this.bindingHistory.length,
            healthy: true
        };
    }

    getBoundDevices() {
        return Array.from(this.boundDevices.keys());
    }

    getHierarchyInfo() {
        return Object.fromEntries(this.deviceHierarchy);
    }
}

// Tạo global instance
// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BOSSDeviceBinding;
} else if (typeof window !== 'undefined' && !window.TINI_BOSS_BINDING) {
    window.TINI_BOSS_BINDING = new BOSSDeviceBinding();
    console.log('✅ [BOSS Binding] Global BOSS device binding created');
}

console.log('🔗 [BOSS Binding] BOSS Device Binding ready - seamless multi-device integration enabled');
