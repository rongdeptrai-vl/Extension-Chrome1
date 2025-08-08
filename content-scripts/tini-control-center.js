// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// ⚠️ XSS WARNING: innerHTML usage detected - potential XSS vulnerability
// Use window.secureSetHTML(element, content) instead of element.innerHTML = content
// Or use element.textContent for plain text
/**
 * TINI BLOCKER CONTROL CENTER
 * H                'tini-full-power': {
                    name: 'TINI Full Power',
                    version: 'v4.0',
                    description: 'Maximum Performance',
                    scriptPath: 'Script/Tini-full-power.js',
                    status: 'INACTIVE',
                    instance: null,
                    color: '#9C27B0'
                },
                'tini-ai-ultra': {
                    name: 'TINI AI Ultra',
                    version: 'v5.0',
                    description: 'AI-Powered Neural Network',
                    scriptPath: 'Script/Tini-ai-ultra.js',
                    status: 'INACTIVE',
                    instance: null,
                    color: '#FF5722'
                }
            };ản lý tất cả 4 models TikTok blocker
 * Version: 1.0 - Unified Control System
 * Author: TINI Security Team
 */

(function() {
    'use strict';
    
    // Tini Blocker Control Center
    class TiniBlockerControlCenter {
        constructor() {
            this.models = {
                'tini-smart': {
                    name: 'TINI Smart',
                    version: 'v3.0',
                    description: 'Adaptive AI Detection',
                    scriptPath: 'Script/Tini-smart.js',
                    status: 'INACTIVE',
                    instance: null,
                    color: '#4CAF50'
                },
                'tini-smart-v7': {
                    name: 'TINI Smart V7',
                    version: 'v7.0',
                    description: 'Advanced Smart Detection',
                    scriptPath: 'Script/Tini-smart-v7.js',
                    status: 'INACTIVE',
                    instance: null,
                    color: '#2196F3'
                },
                'tini-monster-v6': {
                    name: 'TINI Monster V6',
                    version: 'v6.0',
                    description: 'Military Grade Security',
                    scriptPath: 'Script/Tini-monster-v6.js',
                    status: 'INACTIVE',
                    instance: null,
                    color: '#FF5722'
                },
                'tini-full-power': {
                    name: 'TINI Full Power',
                    version: 'Pro',
                    description: 'Maximum Performance',
                    scriptPath: 'Script/Tini-full-power.js',
                    status: 'INACTIVE',
                    instance: null,
                    color: '#9C27B0'
                }
            };
            
            this.activeModel = null;
            this.controlPanelVisible = false;
            this.stats = {
                totalBlocked: 0,
                sessionStart: Date.now(),
                modelsUsed: new Set()
            };
            
            this.init();
        }
        
        init() {
            console.log('🎛️ TINI Blocker Control Center - Initializing...');
            
            // Check for existing blocker instances
            this.detectExistingInstances();
            
            // Create control panel UI
            this.createControlPanel();
            
            // Create floating control button
            this.createFloatingButton();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Auto-start recommended model based on domain
            this.autoStartRecommendedModel();
            
            console.log('✅ TINI Blocker Control Center - Ready!');
            
            // Make globally available
            window.TINI_CONTROL_CENTER = this;
        }
        
        detectExistingInstances() {
            // Check for existing TikTok blocker instances
            if (window.TikTokBlocker) {
                console.log('🔍 Found existing TikTok blocker instance');
                
                // Try to identify which model is running
                if (window.TikTokBlocker.app) {
                    const appName = window.TikTokBlocker.app.constructor.name;
                    console.log('📱 Detected model:', appName);
                    
                    // Update status based on detected model
                    Object.keys(this.models).forEach(key => {
                        const model = this.models[key];
                        if (appName.includes('Adaptive') && key.includes('smart')) {
                            model.status = 'ACTIVE';
                            this.activeModel = key;
                        } else if (appName.includes('Pro') && key.includes('full')) {
                            model.status = 'ACTIVE';
                            this.activeModel = key;
                        }
                    });
                }
            }
        }
        
        createFloatingButton() {
            const button = document.createElement('div');
            button.id = 'tini-control-button';
            button.innerHTML = '🎛️';
            
            button.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 999999;
                font-size: 28px;
                transition: all 0.3s ease;
                border: 3px solid rgba(255,255,255,0.3);
            `;
            
            button.onmouseenter = () => {
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
            };
            
            button.onmouseleave = () => {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            };
            
            button.onclick = () => {
                this.toggleControlPanel();
            };
            
            document.body.appendChild(button);
        }
        
        createControlPanel() {
            const panel = document.createElement('div');
            panel.id = 'tini-control-panel';
            panel.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                width: 350px;
                background: rgba(30, 30, 30, 0.95);
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                z-index: 999998;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                display: none;
                max-height: 600px;
                overflow-y: auto;
            `;
            
            panel.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #4ECDC4; font-size: 20px;">🎛️ TINI Control Center</h2>
                    <p style="margin: 5px 0; opacity: 0.8; font-size: 12px;">Quản lý tất cả TikTok Blocker Models</p>
                </div>
                
                <div id="tini-stats" style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 12px; opacity: 0.8;">Session Stats:</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span>🚫 Blocked: <span id="blocked-count">0</span></span>
                        <span>⏰ Uptime: <span id="uptime">0s</span></span>
                    </div>
                </div>
                
                <div id="models-container"></div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="display: flex; gap: 10px;">
                        <button id="stop-all" style="flex: 1; padding: 8px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">⏹️ Stop All</button>
                        <button id="refresh-stats" style="flex: 1; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">🔄 Refresh</button>
                    </div>
                </div>
                
                <div style="margin-top: 10px; font-size: 11px; opacity: 0.6; text-align: center;">
                    ⚠️ Chỉ chạy 1 model tại một thời điểm
                </div>
            `;
            
            document.body.appendChild(panel);
            
            // Render model controls
            this.renderModelControls();
            
            // Setup panel event listeners
            this.setupPanelEvents();
        }
        
        renderModelControls() {
            const container = document.getElementById('models-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            Object.entries(this.models).forEach(([key, model]) => {
                const modelDiv = document.createElement('div');
                modelDiv.style.cssText = `
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 10px;
                    border-left: 4px solid ${model.color};
                `;
                
                const isActive = model.status === 'ACTIVE';
                const statusColor = isActive ? '#4CAF50' : '#666';
                const statusText = isActive ? 'ACTIVE' : 'INACTIVE';
                
                modelDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <strong style="color: ${model.color};">${model.name}</strong>
                            <span style="font-size: 11px; opacity: 0.7; margin-left: 8px;">${model.version}</span>
                        </div>
                        <span style="color: ${statusColor}; font-size: 10px; font-weight: bold;">${statusText}</span>
                    </div>
                    <div style="font-size: 11px; opacity: 0.8; margin-bottom: 10px;">${model.description}</div>
                    <button 
                        data-model="${key}" 
                        data-action="${isActive ? 'stop' : 'start'}"
                        style="
                            width: 100%; 
                            padding: 6px; 
                            background: ${isActive ? '#f44336' : model.color}; 
                            color: white; 
                            border: none; 
                            border-radius: 4px; 
                            cursor: pointer;
                            font-size: 12px;
                        "
                    >
                        ${isActive ? '⏹️ Stop' : '▶️ Start'} ${model.name}
                    </button>
                `;
                
                container.appendChild(modelDiv);
            });
        }
        
        setupPanelEvents() {
            // Model start/stop buttons
            document.addEventListener('click', (e) => {
                if (e.target.hasAttribute('data-model')) {
                    const modelKey = e.target.getAttribute('data-model');
                    const action = e.target.getAttribute('data-action');
                    
                    if (action === 'start') {
                        this.startModel(modelKey);
                    } else {
                        this.stopModel(modelKey);
                    }
                }
            });
            
            // Stop all button
            const stopAllBtn = document.getElementById('stop-all');
            if (stopAllBtn) {
                stopAllBtn.onclick = () => this.stopAllModels();
            }
            
            // Refresh stats button
            const refreshBtn = document.getElementById('refresh-stats');
            if (refreshBtn) {
                refreshBtn.onclick = () => this.refreshStats();
            }
        }
        
        async startModel(modelKey) {
            const model = this.models[modelKey];
            if (!model) return;
            
            console.log(`🚀 Starting ${model.name}...`);
            
            // Stop any running model first
            if (this.activeModel && this.activeModel !== modelKey) {
                await this.stopModel(this.activeModel);
            }
            
            try {
                // Load and execute the script
                await this.loadScript(model.scriptPath);
                
                // Update status
                model.status = 'ACTIVE';
                this.activeModel = modelKey;
                this.stats.modelsUsed.add(modelKey);
                
                // Re-render controls
                this.renderModelControls();
                
                console.log(`✅ ${model.name} started successfully`);
                this.showNotification(`${model.name} activated!`, 'success');
                
            } catch (error) {
                console.error(`❌ Failed to start ${model.name}:`, error);
                this.showNotification(`Failed to start ${model.name}`, 'error');
            }
        }
        
        async stopModel(modelKey) {
            const model = this.models[modelKey];
            if (!model || model.status !== 'ACTIVE') return;
            
            console.log(`⏹️ Stopping ${model.name}...`);
            
            try {
                // Try to cleanup existing instance
                if (window.TikTokBlocker && window.TikTokBlocker.app) {
                    // Stop any observers/intervals
                    if (window.TikTokBlocker.app.observer) {
                        window.TikTokBlocker.app.observer.disconnect();
                    }
                    
                    // Remove UI elements
                    const existingButtons = document.querySelectorAll('[id*="tini"], [class*="tiktok"]');
                    existingButtons.forEach(btn => {
                        if (btn.id !== 'tini-control-button' && btn.id !== 'tini-control-panel') {
                            btn.remove();
                        }
                    });
                }
                
                // Clear global references
                window.TikTokBlocker = null;
                
                // Update status
                model.status = 'INACTIVE';
                if (this.activeModel === modelKey) {
                    this.activeModel = null;
                }
                
                // Re-render controls
                this.renderModelControls();
                
                console.log(`✅ ${model.name} stopped successfully`);
                this.showNotification(`${model.name} deactivated`, 'info');
                
            } catch (error) {
                console.error(`❌ Error stopping ${model.name}:`, error);
            }
        }
        
        stopAllModels() {
            console.log('⏹️ Stopping all models...');
            
            Object.keys(this.models).forEach(key => {
                if (this.models[key].status === 'ACTIVE') {
                    this.stopModel(key);
                }
            });
            
            this.showNotification('All models stopped', 'info');
        }
        
        async loadScript(scriptPath) {
            return new Promise((resolve, reject) => {
                // Remove existing script if any
                const existingScript = document.querySelector(`script[src*="${scriptPath}"]`);
                if (existingScript) {
                    existingScript.remove();
                }
                
                const script = document.createElement('script');
                script.src = chrome.runtime ? chrome.runtime.getURL(scriptPath) : scriptPath;
                script.type = 'text/javascript';
                
                script.onload = () => {
                    console.log(`✅ Script loaded: ${scriptPath}`);
                    resolve();
                };
                
                script.onerror = () => {
                    reject(new Error(`Failed to load script: ${scriptPath}`));
                };
                
                document.head.appendChild(script);
            });
        }
        
        toggleControlPanel() {
            const panel = document.getElementById('tini-control-panel');
            if (!panel) return;
            
            this.controlPanelVisible = !this.controlPanelVisible;
            panel.style.display = this.controlPanelVisible ? 'block' : 'none';
            
            if (this.controlPanelVisible) {
                this.refreshStats();
                this.startStatsTimer();
            } else {
                this.stopStatsTimer();
            }
        }
        
        refreshStats() {
            // Update stats display
            const blockedCount = document.getElementById('blocked-count');
            const uptime = document.getElementById('uptime');
            
            if (blockedCount) {
                let totalBlocked = 0;
                
                // Try to get stats from active model
                if (window.TikTokBlocker && window.TikTokBlocker.app && window.TikTokBlocker.app.stats) {
                    const stats = window.TikTokBlocker.app.stats;
                    totalBlocked = (stats.ads || 0) + (stats.lives || 0) + (stats.blocked || 0);
                }
                
                blockedCount.textContent = totalBlocked;
            }
            
            if (uptime) {
                const uptimeSeconds = Math.floor((Date.now() - this.stats.sessionStart) / 1000);
                uptime.textContent = this.formatUptime(uptimeSeconds);
            }
        }
        
        formatUptime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            if (hours > 0) return `${hours}h ${minutes}m`;
            if (minutes > 0) return `${minutes}m ${secs}s`;
            return `${secs}s`;
        }
        
        startStatsTimer() {
            if (this.statsTimer) return;
            
            this.statsTimer = setInterval(() => {
                this.refreshStats();
            }, 1000);
        }
        
        stopStatsTimer() {
            if (this.statsTimer) {
                clearInterval(this.statsTimer);
                this.statsTimer = null;
            }
        }
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl + Shift + T: Toggle control panel
                if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                    e.preventDefault();
                    this.toggleControlPanel();
                }
                
                // Ctrl + Shift + S: Stop all models
                if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                    e.preventDefault();
                    this.stopAllModels();
                }
            });
        }
        
        autoStartRecommendedModel() {
            const domain = window.location.hostname;
            
            // Auto-start recommended model based on domain
            if (domain.includes('tiktok.com') || domain.includes('douyin.com')) {
                console.log('🎯 TikTok domain detected, auto-starting recommended model...');
                
                // Start Tini Monster V6 by default (most stable)
                setTimeout(() => {
                    this.startModel('tini-monster-v6');
                }, 2000);
            }
        }
        
        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 90px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 999999;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        
        // API for external control
        getStatus() {
            return {
                activeModel: this.activeModel,
                models: this.models,
                stats: this.stats,
                controlPanelVisible: this.controlPanelVisible
            };
        }
        
        switchToModel(modelKey) {
            if (this.models[modelKey]) {
                this.startModel(modelKey);
            }
        }
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize Control Center
    const controlCenter = new TiniBlockerControlCenter();
    
    console.log('🎛️ TINI Blocker Control Center loaded successfully!');
    console.log('📋 Keyboard shortcuts:');
    console.log('   Ctrl+Shift+T: Toggle control panel');
    console.log('   Ctrl+Shift+S: Stop all models');
    
})();
