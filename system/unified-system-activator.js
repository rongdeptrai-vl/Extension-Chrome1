// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * Unified System Activator
 * Manages system-wide initialization and coordination
 */

class UnifiedSystemActivator {
    constructor() {
        this.modules = new Map();
        this.status = {
            isReady: false,
            startTime: Date.now(),
            activeModules: 0
        };
    }

    registerModule(name, module) {
        this.modules.set(name, {
            instance: module,
            status: 'registered',
            lastUpdate: Date.now()
        });
    }

    async activateAll() {
        console.log('🚀 Activating all system modules...');
        
        for (const [name, module] of this.modules) {
            try {
                if (typeof module.instance.activate === 'function') {
                    await module.instance.activate();
                    module.status = 'active';
                    this.status.activeModules++;
                }
            } catch (error) {
                console.error(`❌ Failed to activate module ${name}:`, error);
                module.status = 'error';
            }
        }

        this.status.isReady = true;
        console.log(`✅ System activation complete. ${this.status.activeModules} modules active.`);
    }

    getStatus() {
        return {
            ...this.status,
            uptime: Date.now() - this.status.startTime,
            modules: Array.from(this.modules.entries()).map(([name, module]) => ({
                name,
                status: module.status,
                lastUpdate: module.lastUpdate
            }))
        };
    }
}

module.exports = new UnifiedSystemActivator();
