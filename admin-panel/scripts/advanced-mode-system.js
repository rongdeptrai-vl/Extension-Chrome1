// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI ADVANCED MODE SYSTEM
 * Enhanced functionality from original admin panel
 * Integrates 4 TINI models with advanced controls
 */

class AdvancedModeSystem {
    constructor() {
        this.isAdvancedMode = (window.TINI_SYSTEM?.utils?.secureStorage?.get('advancedMode') || localStorage.getItem('advancedMode')) === 'true';
        this.models = {
            life: { name: 'TINI LIFE', color: '#00f0ff', icon: 'fas fa-heart', activeUsers: 1250 },
            flash: { name: 'TINI FLASH', color: '#ffd93d', icon: 'fas fa-bolt', activeUsers: 2140 },
            power: { name: 'TINI POWER', color: '#ff3d71', icon: 'fas fa-fire', activeUsers: 890 },
            smart: { name: 'TINI SMART', color: '#a78bfa', icon: 'fas fa-brain', activeUsers: 1580 }
        };
        this.serverMode = localStorage.getItem('serverMode') || 'default';
        this.defaultModel = localStorage.getItem('defaultModel') || 'flash';
        
        this.init();
    }

    init() {
        console.log('🔧 [ADVANCED] Advanced Mode System initializing...');
        
        // Setup existing toggle and model switcher
        this.setupAdvancedModeToggle();
        
        // Setup model switcher
        this.setupModelSwitcher();
        
        // Apply current mode
        if (this.isAdvancedMode) {
            this.enableAdvancedMode();
        }
        
        console.log('✅ [ADVANCED] Advanced Mode System ready');
    }

    setupAdvancedModeToggle() {
        const toggle = document.getElementById('advancedModeToggle');
        const modelSwitcher = document.getElementById('modelSwitcher');
        
        if (toggle) {
            // Set initial state
            toggle.checked = this.isAdvancedMode;
            if (modelSwitcher) {
                modelSwitcher.style.display = this.isAdvancedMode ? 'block' : 'none';
            }
            
            // Add event listener
            toggle.addEventListener('change', (e) => {
                this.toggleAdvancedMode(e.target.checked);
            });
        } else {
            console.warn('⚠️ [ADVANCED] Advanced settings elements not found');
        }
    }

    setupModelSwitcher() {
        const modelSelector = document.getElementById('modelSelector');
        if (modelSelector) {
            // Set initial value
            modelSelector.value = this.defaultModel;
            
            // Add event listener
            modelSelector.addEventListener('change', (e) => {
                this.switchModel(e.target.value);
            });
        }
    }

    toggleAdvancedMode(enable = null) {
        this.isAdvancedMode = enable !== null ? enable : !this.isAdvancedMode;
        localStorage.setItem('advancedMode', this.isAdvancedMode.toString());
        
        const modelSwitcher = document.getElementById('modelSwitcher');
        if (modelSwitcher) {
            modelSwitcher.style.display = this.isAdvancedMode ? 'block' : 'none';
        }
        
        if (this.isAdvancedMode) {
            this.enableAdvancedMode();
        } else {
            this.disableAdvancedMode();
        }
        
        console.log(`🔧 [ADVANCED] Advanced Mode ${this.isAdvancedMode ? 'ENABLED' : 'DISABLED'}`);
    }

    enableAdvancedMode() {
        // Add advanced stats cards
        this.updateDashboardForAdvancedMode();
        
        // Add advanced controls to sections
        this.addAdvancedControls();
        
        // Show advanced features
        this.showAdvancedFeatures();
        
        // Notification
        if (window.tiniAdminPanel?.showNotification) {
            window.tiniAdminPanel.showNotification('🔧 Advanced Mode Activated - All TINI models available', 'success');
        }
    }

    disableAdvancedMode() {
        // Remove advanced elements
        const advancedElements = document.querySelectorAll('.advanced-mode-element');
        advancedElements.forEach(el => el.remove());
        
        // Reset to basic dashboard
        this.resetToBasicMode();
        
        // Notification
        if (window.tiniAdminPanel?.showNotification) {
            window.tiniAdminPanel.showNotification('🔧 Advanced Mode Disabled - Basic mode active', 'info');
        }
    }

    updateDashboardForAdvancedMode() {
        const dashboardGrid = document.querySelector('#dashboard .dashboard-grid');
        if (dashboardGrid && this.isAdvancedMode) {
            // Add model-specific stats
            const currentModel = this.models[this.defaultModel];
            
            const advancedCard = document.createElement('div');
            advancedCard.className = 'dashboard-card animated-card advanced-mode-element';
            advancedCard.innerHTML = `
                <div class="card-title">Current TINI Model</div>
                <div class="card-value" style="color: ${currentModel.color};">
                    <i class="${currentModel.icon}"></i> ${currentModel.name}
                </div>
                <div class="card-change positive">
                    <i class="fas fa-users"></i> ${currentModel.activeUsers.toLocaleString()} active users
                </div>
            `;
            
            dashboardGrid.appendChild(advancedCard);
        }
    }

    switchModel(modelKey) {
        if (!this.models[modelKey]) return;
        
        this.defaultModel = modelKey;
        localStorage.setItem('defaultModel', modelKey);
        
        const model = this.models[modelKey];
        
        // Update dashboard card
        this.updateDashboardForAdvancedMode();
        
        // Update theme colors
        document.documentElement.style.setProperty('--model-color', model.color);
        
        // Notification
        if (window.tiniAdminPanel?.showNotification) {
            window.tiniAdminPanel.showNotification(`🎯 Switched to ${model.name} model`, 'success');
        }
        
        console.log(`🎯 [ADVANCED] Switched to model: ${model.name}`);
    }

    addAdvancedControls() {
        // Add advanced controls to each section
        const sections = ['users', 'security', 'settings', 'analytics', 'reports'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const header = section.querySelector('.header');
                if (header && !header.querySelector('.advanced-controls')) {
                    const advancedControls = document.createElement('div');
                    advancedControls.className = 'advanced-controls advanced-mode-element';
                    advancedControls.innerHTML = `
                        <button style="background: var(--accent); color: var(--bg-dark); border: none; padding: 6px 12px; border-radius: 4px; margin-left: 10px; font-size: 12px;">
                            <i class="fas fa-cog"></i> Advanced
                        </button>
                    `;
                    header.appendChild(advancedControls);
                }
            }
        });
    }

    showAdvancedFeatures() {
        // Show hidden advanced features
        const advancedFeatures = document.querySelectorAll('[data-advanced="true"]');
        advancedFeatures.forEach(feature => {
            feature.style.display = 'block';
        });
    }

    resetToBasicMode() {
        // Hide advanced features
        const advancedFeatures = document.querySelectorAll('[data-advanced="true"]');
        advancedFeatures.forEach(feature => {
            feature.style.display = 'none';
        });
        
        // Reset theme colors
        document.documentElement.style.removeProperty('--model-color');
    }

    getSystemInfo() {
        return {
            advancedMode: this.isAdvancedMode,
            currentModel: this.defaultModel,
            serverMode: this.serverMode,
            availableModels: Object.keys(this.models),
            modelStats: this.models
        };
    }
}

// Export for global access
window.AdvancedModeSystem = AdvancedModeSystem;
