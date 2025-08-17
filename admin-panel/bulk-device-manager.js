// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-17T10:00:00Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

/**
 * BULK DEVICE MANAGEMENT SYSTEM
 * Enterprise-grade bulk operations for device approvals/rejections
 * Supports department-based filtering and batch processing
 */

const crypto = require('crypto');

class BulkDeviceManager {
    constructor(db) {
        this.db = db;
        this.maxBatchSize = 100; // Limit for safety
        this.supportedActions = ['approve', 'reject', 'require_mfa', 'block'];
    }

    /**
     * Bulk approve devices with criteria
     */
    async bulkApproveDevices(adminId, criteria = {}) {
        const results = {
            total: 0,
            processed: 0,
            failed: 0,
            errors: [],
            devices: []
        };

        try {
            // Build query based on criteria
            let query = `
                SELECT id, employee_id, full_name, device_id, device_fingerprint_hash, 
                       registration_ip, created_at
                FROM device_registrations 
                WHERE device_status = 'pending'
            `;
            const params = [];

            // Add department filter
            if (criteria.department) {
                query += ` AND (full_name LIKE ? OR employee_id LIKE ?)`;
                params.push(`%${criteria.department}%`, `%${criteria.department}%`);
            }

            // Add date range filter
            if (criteria.dateFrom) {
                query += ` AND created_at >= ?`;
                params.push(criteria.dateFrom);
            }
            if (criteria.dateTo) {
                query += ` AND created_at <= ?`;
                params.push(criteria.dateTo);
            }

            // Add IP range filter
            if (criteria.ipRange) {
                query += ` AND registration_ip LIKE ?`;
                params.push(`${criteria.ipRange}%`);
            }

            // Limit for safety
            query += ` ORDER BY created_at ASC LIMIT ?`;
            params.push(this.maxBatchSize);

            console.log('🔍 Bulk query:', { query, params });

            // Get pending devices
            const pendingDevices = await this.queryPromise(query, params);
            results.total = pendingDevices.length;

            if (pendingDevices.length === 0) {
                return { ...results, message: 'No devices found matching criteria' };
            }

            // Process each device
            for (const device of pendingDevices) {
                try {
                    await this.approveDevice(device.id, adminId, 'Bulk approval', criteria);
                    results.processed++;
                    results.devices.push({
                        id: device.id,
                        employee_id: device.employee_id,
                        status: 'approved'
                    });
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        device_id: device.id,
                        employee_id: device.employee_id,
                        error: error.message
                    });
                }
            }

            // Log bulk action
            await this.logBulkAction(adminId, 'BULK_APPROVE', results, criteria);

            return results;

        } catch (error) {
            console.error('❌ Bulk approve failed:', error);
            throw new Error(`Bulk approval failed: ${error.message}`);
        }
    }

    /**
     * Bulk reject devices
     */
    async bulkRejectDevices(adminId, criteria = {}, reason = 'Bulk rejection') {
        const results = {
            total: 0,
            processed: 0,
            failed: 0,
            errors: [],
            devices: []
        };

        try {
            // Similar query logic as approve
            let query = `
                SELECT id, employee_id, full_name, device_id 
                FROM device_registrations 
                WHERE device_status = 'pending'
            `;
            const params = [];

            if (criteria.department) {
                query += ` AND (full_name LIKE ? OR employee_id LIKE ?)`;
                params.push(`%${criteria.department}%`, `%${criteria.department}%`);
            }

            query += ` ORDER BY created_at ASC LIMIT ?`;
            params.push(this.maxBatchSize);

            const pendingDevices = await this.queryPromise(query, params);
            results.total = pendingDevices.length;

            for (const device of pendingDevices) {
                try {
                    await this.rejectDevice(device.id, adminId, reason);
                    results.processed++;
                    results.devices.push({
                        id: device.id,
                        employee_id: device.employee_id,
                        status: 'rejected'
                    });
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        device_id: device.id,
                        employee_id: device.employee_id,
                        error: error.message
                    });
                }
            }

            await this.logBulkAction(adminId, 'BULK_REJECT', results, criteria);
            return results;

        } catch (error) {
            console.error('❌ Bulk reject failed:', error);
            throw new Error(`Bulk rejection failed: ${error.message}`);
        }
    }

    /**
     * Generate pending devices report for bulk operations
     */
    async generatePendingReport(filters = {}) {
        try {
            let query = `
                SELECT 
                    dr.id,
                    dr.employee_id,
                    dr.full_name,
                    dr.device_id,
                    dr.registration_ip,
                    dr.user_agent,
                    dr.created_at,
                    CAST((julianday('now') - julianday(dr.created_at)) AS INTEGER) as days_pending,
                    COUNT(dal.id) as access_attempts,
                    GROUP_CONCAT(dal.access_result) as attempt_results
                FROM device_registrations dr
                LEFT JOIN device_access_logs dal ON dr.employee_id = dal.employee_id
                WHERE dr.device_status = 'pending'
            `;
            const params = [];

            // Add filters
            if (filters.department) {
                query += ` AND (dr.full_name LIKE ? OR dr.employee_id LIKE ?)`;
                params.push(`%${filters.department}%`, `%${filters.department}%`);
            }

            if (filters.minDays) {
                query += ` AND (julianday('now') - julianday(dr.created_at)) >= ?`;
                params.push(filters.minDays);
            }

            query += ` 
                GROUP BY dr.id 
                ORDER BY dr.created_at ASC
            `;

            const devices = await this.queryPromise(query, params);

            // Add risk analysis
            const enhancedDevices = devices.map(device => {
                let riskLevel = 'LOW';
                let riskFactors = [];

                // Risk analysis
                if (device.days_pending > 7) {
                    riskLevel = 'MEDIUM';
                    riskFactors.push('Long pending');
                }
                if (device.access_attempts > 5) {
                    riskLevel = 'HIGH';
                    riskFactors.push('Multiple access attempts');
                }
                if (device.attempt_results && device.attempt_results.includes('blocked')) {
                    riskLevel = 'HIGH';
                    riskFactors.push('Previous blocks');
                }

                return {
                    ...device,
                    risk_level: riskLevel,
                    risk_factors: riskFactors,
                    recommendation: this.getRecommendation(device, riskLevel)
                };
            });

            return {
                total: enhancedDevices.length,
                devices: enhancedDevices,
                summary: {
                    low_risk: enhancedDevices.filter(d => d.risk_level === 'LOW').length,
                    medium_risk: enhancedDevices.filter(d => d.risk_level === 'MEDIUM').length,
                    high_risk: enhancedDevices.filter(d => d.risk_level === 'HIGH').length
                }
            };

        } catch (error) {
            console.error('❌ Report generation failed:', error);
            throw error;
        }
    }

    /**
     * Get recommendation for device based on analysis
     */
    getRecommendation(device, riskLevel) {
        if (riskLevel === 'HIGH') {
            return 'REJECT_OR_REQUIRE_MFA';
        }
        if (riskLevel === 'MEDIUM') {
            return 'MANUAL_REVIEW';
        }
        return 'SAFE_TO_APPROVE';
    }

    /**
     * Approve single device
     */
    async approveDevice(deviceId, adminId, reason = 'Manual approval', metadata = {}) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE device_registrations 
                SET device_status = 'approved', 
                    approved_by = ?, 
                    approved_at = datetime('now'),
                    approval_reason = ?,
                    approval_metadata = ?
                WHERE id = ? AND device_status = 'pending'
            `;

            this.db.run(query, [
                adminId, 
                reason, 
                JSON.stringify(metadata),
                deviceId
            ], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Device not found or already processed'));
                } else {
                    resolve({ deviceId, status: 'approved' });
                }
            });
        });
    }

    /**
     * Reject single device
     */
    async rejectDevice(deviceId, adminId, reason = 'Manual rejection') {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE device_registrations 
                SET device_status = 'rejected', 
                    approved_by = ?, 
                    approved_at = datetime('now'),
                    approval_reason = ?
                WHERE id = ? AND device_status = 'pending'
            `;

            this.db.run(query, [adminId, reason, deviceId], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Device not found or already processed'));
                } else {
                    resolve({ deviceId, status: 'rejected' });
                }
            });
        });
    }

    /**
     * Log bulk action for audit
     */
    async logBulkAction(adminId, action, results, criteria) {
        const logEntry = {
            admin_id: adminId,
            action,
            criteria: JSON.stringify(criteria),
            results: JSON.stringify(results),
            timestamp: new Date().toISOString()
        };

        try {
            await this.queryPromise(`
                INSERT INTO admin_audit_log 
                (admin_id, action, details, created_at)
                VALUES (?, ?, ?, datetime('now'))
            `, [adminId, action, JSON.stringify(logEntry)]);

            console.log('📝 Bulk action logged:', { action, processed: results.processed });
        } catch (error) {
            console.error('❌ Failed to log bulk action:', error);
        }
    }

    /**
     * Promise wrapper for database queries
     */
    queryPromise(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Get bulk operation statistics
     */
    async getBulkStats(adminId, days = 30) {
        try {
            const query = `
                SELECT 
                    action,
                    COUNT(*) as count,
                    DATE(created_at) as date
                FROM admin_audit_log 
                WHERE admin_id = ? 
                    AND action LIKE 'BULK_%'
                    AND created_at >= datetime('now', '-${days} days')
                GROUP BY action, DATE(created_at)
                ORDER BY created_at DESC
            `;

            const stats = await this.queryPromise(query, [adminId]);
            return {
                period_days: days,
                operations: stats,
                total_operations: stats.length
            };
        } catch (error) {
            console.error('❌ Failed to get bulk stats:', error);
            return { error: error.message };
        }
    }
}

module.exports = BulkDeviceManager;
// ST:TINI_1755432586_e868a412
