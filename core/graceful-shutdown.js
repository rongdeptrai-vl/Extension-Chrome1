// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Graceful Shutdown Manager for TINI Enterprise
const EventEmitter = require('events');

class GracefulShutdown extends EventEmitter {
    constructor() {
        super();
        this.isShuttingDown = false;
        this.shutdownHandlers = new Map();
        this.setupSignalHandlers();
    }

    setupSignalHandlers() {
        // Handle SIGTERM and SIGINT
        ['SIGTERM', 'SIGINT'].forEach(signal => {
            process.on(signal, async () => {
                try {
                    await this.shutdown(signal);
                } catch (error) {
                    console.error(`❌ Error during ${signal} shutdown:`, error);
                    process.exit(1);
                }
            });
        });

        // Handle uncaught exceptions and unhandled rejections
        process.on('uncaughtException', async (error) => {
            console.error('❌ Uncaught Exception:', error);
            await this.shutdown('uncaughtException');
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            await this.shutdown('unhandledRejection');
        });
    }

    registerHandler(name, handler, priority = 0) {
        this.shutdownHandlers.set(name, { handler, priority });
    }

    async shutdown(signal) {
        if (this.isShuttingDown) {
            console.log('💫 Shutdown already in progress...');
            return;
        }

        console.log(`\n🛑 Initiating graceful shutdown (${signal})...`);
        this.isShuttingDown = true;
        this.emit('shutdown:start', signal);

        // Sort handlers by priority (higher priority runs first)
        const sortedHandlers = Array.from(this.shutdownHandlers.entries())
            .sort((a, b) => b[1].priority - a[1].priority);

        // Execute handlers in sequence
        for (const [name, { handler }] of sortedHandlers) {
            try {
                console.log(`🔄 Running shutdown handler: ${name}`);
                await handler();
                console.log(`✅ Shutdown handler completed: ${name}`);
            } catch (error) {
                console.error(`❌ Error in shutdown handler ${name}:`, error);
            }
        }

        this.emit('shutdown:complete', signal);
        console.log('👋 Graceful shutdown completed');
        
        // Exit with success code
        process.exit(0);
    }
}

module.exports = new GracefulShutdown();
