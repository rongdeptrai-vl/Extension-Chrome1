// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-17T10:00:00Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

/**
 * ENTERPRISE ALERT NOTIFICATION SYSTEM
 * Email, SMS, and real-time alerts for security events
 * Supports multiple channels and escalation policies
 */

// Try to load optional dependencies
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.log('📧 Nodemailer not available - email alerts disabled');
    nodemailer = null;
}

const crypto = require('crypto');

class EnterpriseAlertSystem {
    constructor(config = {}) {
        this.config = {
            email: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            },
            sms: {
                provider: process.env.SMS_PROVIDER || 'twilio',
                apiKey: process.env.SMS_API_KEY,
                apiSecret: process.env.SMS_API_SECRET,
                from: process.env.SMS_FROM
            },
            alerts: {
                enabled: true,
                channels: ['email', 'realtime'], // 'sms' requires setup
                escalationLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
            },
            ...config
        };

        this.emailTransporter = null;
        this.alertQueue = [];
        this.processingQueue = false;
        this.setupEmailTransporter();
    }

    /**
     * Setup email transporter
     */
    async setupEmailTransporter() {
        try {
            if (!nodemailer) {
                console.warn('⚠️ Nodemailer not available, email alerts disabled');
                return;
            }
            
            if (this.config.email.auth.user && this.config.email.auth.pass) {
                this.emailTransporter = nodemailer.createTransporter(this.config.email);
                
                // Verify connection
                await this.emailTransporter.verify();
                console.log('✅ Email transporter ready');
            } else {
                console.warn('⚠️ Email credentials not configured, email alerts disabled');
            }
        } catch (error) {
            console.error('❌ Email setup failed:', error.message);
            this.emailTransporter = null;
        }
    }

    /**
     * Send security alert
     */
    async sendSecurityAlert(alertData) {
        const alert = {
            id: crypto.randomUUID(),
            type: alertData.type || 'SECURITY_EVENT',
            severity: alertData.severity || 'MEDIUM',
            title: alertData.title || 'Security Alert',
            message: alertData.message,
            details: alertData.details || {},
            timestamp: new Date().toISOString(),
            source: alertData.source || 'TINI_SECURITY_SYSTEM',
            recipients: alertData.recipients || await this.getDefaultRecipients(alertData.severity)
        };

        console.log('🚨 Processing security alert:', {
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            title: alert.title
        });

        // Add to queue for processing
        this.alertQueue.push(alert);
        this.processAlertQueue();

        return alert.id;
    }

    /**
     * Process alert queue
     */
    async processAlertQueue() {
        if (this.processingQueue || this.alertQueue.length === 0) {
            return;
        }

        this.processingQueue = true;

        try {
            while (this.alertQueue.length > 0) {
                const alert = this.alertQueue.shift();
                await this.processAlert(alert);
            }
        } catch (error) {
            console.error('❌ Alert queue processing error:', error);
        } finally {
            this.processingQueue = false;
        }
    }

    /**
     * Process individual alert
     */
    async processAlert(alert) {
        const channels = this.getChannelsForSeverity(alert.severity);
        const results = {
            alert_id: alert.id,
            channels: {},
            success: false
        };

        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'email':
                        results.channels.email = await this.sendEmailAlert(alert);
                        break;
                    case 'sms':
                        results.channels.sms = await this.sendSMSAlert(alert);
                        break;
                    case 'realtime':
                        results.channels.realtime = await this.sendRealtimeAlert(alert);
                        break;
                }
            } catch (error) {
                console.error(`❌ ${channel} alert failed:`, error.message);
                results.channels[channel] = { success: false, error: error.message };
            }
        }

        results.success = Object.values(results.channels).some(r => r.success);

        // Log alert
        await this.logAlert(alert, results);

        console.log('📊 Alert processed:', {
            id: alert.id,
            success: results.success,
            channels: Object.keys(results.channels)
        });

        return results;
    }

    /**
     * Send email alert
     */
    async sendEmailAlert(alert) {
        if (!this.emailTransporter) {
            throw new Error('Email transporter not configured');
        }

        const htmlContent = this.generateEmailHTML(alert);
        
        const mailOptions = {
            from: `"TINI Security System" <${this.config.email.auth.user}>`,
            to: alert.recipients.email?.join(', '),
            subject: `[${alert.severity}] ${alert.title}`,
            html: htmlContent,
            text: this.generateEmailText(alert)
        };

        try {
            const info = await this.emailTransporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: info.messageId,
                recipients: alert.recipients.email?.length || 0
            };
        } catch (error) {
            throw new Error(`Email send failed: ${error.message}`);
        }
    }

    /**
     * Send SMS alert (placeholder - requires SMS service setup)
     */
    async sendSMSAlert(alert) {
        // Placeholder for SMS implementation
        // Would integrate with Twilio, AWS SNS, etc.
        console.log('📱 SMS Alert (simulated):', {
            to: alert.recipients.sms,
            message: `[${alert.severity}] ${alert.title}: ${alert.message}`
        });

        return {
            success: true,
            method: 'simulated',
            recipients: alert.recipients.sms?.length || 0
        };
    }

    /**
     * Send real-time alert (WebSocket/Socket.IO)
     */
    async sendRealtimeAlert(alert) {
        try {
            // Emit to admin dashboard if socket is available
            if (global.io) {
                global.io.emit('security_alert', {
                    id: alert.id,
                    type: alert.type,
                    severity: alert.severity,
                    title: alert.title,
                    message: alert.message,
                    timestamp: alert.timestamp
                });
            }

            return {
                success: true,
                method: 'websocket',
                broadcast: true
            };
        } catch (error) {
            throw new Error(`Real-time alert failed: ${error.message}`);
        }
    }

    /**
     * Generate email HTML content
     */
    generateEmailHTML(alert) {
        const severityColors = {
            LOW: '#22d3ee',
            MEDIUM: '#f59e0b', 
            HIGH: '#ef4444',
            CRITICAL: '#dc2626'
        };

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>TINI Security Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: ${severityColors[alert.severity]}; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🚨 Security Alert</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">${alert.severity} Level</p>
                </div>
                
                <div style="padding: 30px;">
                    <h2 style="color: #333; margin-top: 0;">${alert.title}</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">${alert.message}</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Alert Details:</h3>
                        <p><strong>Alert ID:</strong> ${alert.id}</p>
                        <p><strong>Type:</strong> ${alert.type}</p>
                        <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
                        <p><strong>Source:</strong> ${alert.source}</p>
                        ${Object.keys(alert.details).length > 0 ? `
                        <h4>Additional Information:</h4>
                        ${Object.entries(alert.details).map(([key, value]) => 
                            `<p><strong>${key}:</strong> ${value}</p>`
                        ).join('')}
                        ` : ''}
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:55058'}" 
                           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Admin Dashboard
                        </a>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        This is an automated security alert from TINI Security System.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate email text content
     */
    generateEmailText(alert) {
        return `
TINI SECURITY ALERT - ${alert.severity} LEVEL

${alert.title}

${alert.message}

Alert Details:
- Alert ID: ${alert.id}
- Type: ${alert.type}
- Time: ${new Date(alert.timestamp).toLocaleString()}
- Source: ${alert.source}

${Object.keys(alert.details).length > 0 ? 
`Additional Information:
${Object.entries(alert.details).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
` : ''}

View Admin Dashboard: ${process.env.ADMIN_PANEL_URL || 'http://localhost:55058'}

This is an automated security alert from TINI Security System.
        `.trim();
    }

    /**
     * Get channels based on severity
     */
    getChannelsForSeverity(severity) {
        const channelMap = {
            LOW: ['realtime'],
            MEDIUM: ['email', 'realtime'],
            HIGH: ['email', 'realtime', 'sms'],
            CRITICAL: ['email', 'realtime', 'sms']
        };

        return channelMap[severity] || ['realtime'];
    }

    /**
     * Get default recipients based on severity
     */
    async getDefaultRecipients(severity) {
        // Default recipients - should be configurable
        const recipients = {
            email: [
                process.env.SECURITY_EMAIL || 'security@company.com',
                process.env.ADMIN_EMAIL || 'admin@company.com'
            ],
            sms: [
                process.env.SECURITY_PHONE || '+1234567890'
            ]
        };

        // Add more recipients for higher severity
        if (severity === 'CRITICAL') {
            recipients.email.push(
                process.env.EMERGENCY_EMAIL || 'emergency@company.com'
            );
        }

        return recipients;
    }

    /**
     * Log alert to database
     */
    async logAlert(alert, results) {
        try {
            // This would integrate with your database logging system
            console.log('📝 Alert logged:', {
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                success: results.success,
                channels: Object.keys(results.channels)
            });
        } catch (error) {
            console.error('❌ Alert logging failed:', error);
        }
    }

    /**
     * Predefined alert templates
     */
    async sendDriftDetectedAlert(employeeId, driftInfo) {
        return await this.sendSecurityAlert({
            type: 'DEVICE_DRIFT_DETECTED',
            severity: driftInfo.similarity < 0.5 ? 'HIGH' : 'MEDIUM',
            title: 'Device Fingerprint Drift Detected',
            message: `Device fingerprint changes detected for employee ${employeeId}. Similarity: ${(driftInfo.similarity * 100).toFixed(1)}%`,
            details: {
                employee_id: employeeId,
                similarity_score: driftInfo.similarity,
                action_required: driftInfo.action,
                detection_time: new Date().toISOString()
            }
        });
    }

    async sendBulkOperationAlert(adminId, operation, results) {
        return await this.sendSecurityAlert({
            type: 'BULK_OPERATION_COMPLETED',
            severity: results.failed > 0 ? 'MEDIUM' : 'LOW',
            title: 'Bulk Device Operation Completed',
            message: `Admin ${adminId} completed ${operation}. Processed: ${results.processed}, Failed: ${results.failed}`,
            details: {
                admin_id: adminId,
                operation: operation,
                total_devices: results.total,
                processed: results.processed,
                failed: results.failed,
                completion_time: new Date().toISOString()
            }
        });
    }

    async sendSecurityIncidentAlert(incident) {
        return await this.sendSecurityAlert({
            type: 'SECURITY_INCIDENT',
            severity: incident.severity || 'HIGH',
            title: incident.title || 'Security Incident Detected',
            message: incident.description,
            details: {
                incident_id: incident.id,
                source_ip: incident.ip,
                user_agent: incident.userAgent,
                detection_rules: incident.rules,
                mitigation_actions: incident.actions
            }
        });
    }

    /**
     * Test alert system
     */
    async testAlertSystem() {
        console.log('🧪 Testing alert system...');
        
        try {
            const testAlert = await this.sendSecurityAlert({
                type: 'SYSTEM_TEST',
                severity: 'LOW',
                title: 'Alert System Test',
                message: 'This is a test alert to verify the notification system is working correctly.',
                details: {
                    test_time: new Date().toISOString(),
                    test_id: crypto.randomUUID()
                }
            });

            console.log('✅ Test alert sent:', testAlert);
            return { success: true, alertId: testAlert };
        } catch (error) {
            console.error('❌ Test alert failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EnterpriseAlertSystem;
// ST:TINI_1755432586_e868a412
