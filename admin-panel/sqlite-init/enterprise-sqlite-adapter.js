// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// Enterprise SQLite3 Adapter - Optimized for 2000 users
// Author: TINI Security Team
// Date: 2025-08-15

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

class EnterpriseSQLiteAdapter {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(__dirname, '..', 'tini_admin.db');
        this.db = null;
        this.isConnected = false;
        this.queryQueue = [];
        this.maxConcurrentQueries = 10;
        this.activeQueries = 0;
    }

    async connect() {
        if (this.isConnected) return;

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async (err) => {
                if (err) {
                    console.error('❌ SQLite connection failed:', err);
                    reject(err);
                } else {
                    console.log('📱 Connected to SQLite database');
                    this.isConnected = true;
                    
                    // Apply enterprise optimizations
                    await this.applyOptimizations();
                    resolve();
                }
            });
        });
    }

    async applyOptimizations() {
        const optimizations = [
            "PRAGMA journal_mode = WAL;",           // Better concurrency
            "PRAGMA synchronous = NORMAL;",         // Faster writes
            "PRAGMA cache_size = 10000;",          // 10MB cache
            "PRAGMA temp_store = memory;",         // Temp tables in memory
            "PRAGMA mmap_size = 268435456;",       // 256MB memory map
            "PRAGMA busy_timeout = 30000;"         // 30 second timeout
        ];

        for (const pragma of optimizations) {
            await this.run(pragma);
        }

        console.log('⚡ SQLite optimized for enterprise scale (2000+ users)');
    }

    // Core query methods with connection pooling simulation
    async run(sql, params = []) {
        return this.executeQuery('run', sql, params);
    }

    async get(sql, params = []) {
        return this.executeQuery('get', sql, params);
    }

    async all(sql, params = []) {
        return this.executeQuery('all', sql, params);
    }

    async executeQuery(method, sql, params = []) {
        if (!this.isConnected) {
            await this.connect();
        }

        // Simple queue management for high concurrency
        if (this.activeQueries >= this.maxConcurrentQueries) {
            await this.waitForSlot();
        }

        this.activeQueries++;

        return new Promise((resolve, reject) => {
            const callback = function(err, result) {
                if (err) {
                    console.error('❌ SQLite query error:', err, 'SQL:', sql);
                    reject(err);
                } else {
                    resolve(method === 'run' ? this : result);
                }
            };

            try {
                if (method === 'run') {
                    this.db.run(sql, params, callback);
                } else if (method === 'get') {
                    this.db.get(sql, params, callback);
                } else if (method === 'all') {
                    this.db.all(sql, params, callback);
                }
            } catch (error) {
                reject(error);
            } finally {
                this.activeQueries--;
            }
        });
    }

    async waitForSlot() {
        return new Promise(resolve => {
            const checkSlot = () => {
                if (this.activeQueries < this.maxConcurrentQueries) {
                    resolve();
                } else {
                    setTimeout(checkSlot, 10);
                }
            };
            checkSlot();
        });
    }

    // Enterprise device registration methods
    async registerDevice(deviceData) {
        const {
            employeeId, fullName, normalizedName, deviceId,
            fingerprint, internalIp, userAgent, registrationIp
        } = deviceData;

        // Hash fingerprint with pepper
        const fingerprintHash = fingerprint ? this.hashFingerprint(fingerprint) : null;
        const pepperSalt = crypto.randomBytes(32).toString('hex');

        const sql = `
            INSERT INTO device_registrations (
                employee_id, full_name, normalized_name, device_id,
                device_fingerprint_hash, pepper_salt, internal_ip, 
                user_agent, registration_ip, device_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
        `;

        const params = [
            employeeId, fullName, normalizedName, deviceId,
            fingerprintHash, pepperSalt, internalIp, userAgent, registrationIp
        ];

        try {
            const result = await this.run(sql, params);
            
            // Log the registration
            await this.logSecurityEvent({
                eventType: 'DEVICE_REGISTERED',
                severity: 'MEDIUM',
                employeeId: employeeId,
                description: `Device registered for ${fullName}`,
                details: JSON.stringify({ deviceId, fingerprintHash: fingerprintHash?.substring(0, 16) }),
                ipAddress: registrationIp
            });

            return {
                success: true,
                registrationId: result.lastID,
                message: 'Device registered successfully'
            };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return {
                    success: false,
                    error: 'DUPLICATE_REGISTRATION',
                    message: 'Employee or device already registered'
                };
            }
            throw error;
        }
    }

    async checkDeviceRegistration(employeeId, deviceId) {
        const sql = `
            SELECT * FROM device_registrations 
            WHERE employee_id = ? AND device_id = ? AND device_status = 'approved'
        `;
        
        const device = await this.get(sql, [employeeId, deviceId]);
        
        if (device) {
            // Update last access time
            await this.logDeviceAccess({
                employeeId: employeeId,
                deviceFingerprintHash: device.device_fingerprint_hash,
                accessResult: 'success',
                ipAddress: null // Will be filled by caller
            });
        }

        return device;
    }

    async validateDeviceFingerprint(employeeId, currentFingerprint) {
        const hashedFingerprint = this.hashFingerprint(currentFingerprint);
        
        const sql = `
            SELECT device_fingerprint_hash, device_status, security_score
            FROM device_registrations 
            WHERE employee_id = ?
        `;
        
        const device = await this.get(sql, [employeeId]);
        
        if (!device) {
            return { valid: false, reason: 'DEVICE_NOT_REGISTERED' };
        }

        if (device.device_status !== 'approved') {
            return { valid: false, reason: 'DEVICE_NOT_APPROVED', status: device.device_status };
        }

        if (device.device_fingerprint_hash === hashedFingerprint) {
            return { valid: true, reason: 'FINGERPRINT_MATCH' };
        }

        // Calculate drift if fingerprints don't match exactly
        const similarity = this.calculateFingerprintSimilarity(
            device.device_fingerprint_hash, 
            hashedFingerprint
        );

        if (similarity > 0.8) {
            // Minor drift - log and allow
            await this.logSecurityEvent({
                eventType: 'FINGERPRINT_DRIFT',
                severity: 'LOW',
                employeeId: employeeId,
                description: `Minor device fingerprint drift detected (${(similarity * 100).toFixed(1)}% match)`,
                details: JSON.stringify({ similarity, action: 'ALLOWED' })
            });
            
            return { valid: true, reason: 'MINOR_DRIFT', similarity };
        } else if (similarity > 0.6) {
            // Major drift - require MFA
            await this.logSecurityEvent({
                eventType: 'FINGERPRINT_DRIFT',
                severity: 'HIGH',
                employeeId: employeeId,
                description: `Major device fingerprint drift detected (${(similarity * 100).toFixed(1)}% match)`,
                details: JSON.stringify({ similarity, action: 'REQUIRE_MFA' })
            });
            
            return { valid: false, reason: 'MAJOR_DRIFT', similarity, requiresMFA: true };
        } else {
            // Complete mismatch - block
            await this.logSecurityEvent({
                eventType: 'FINGERPRINT_MISMATCH',
                severity: 'CRITICAL',
                employeeId: employeeId,
                description: `Device fingerprint completely changed (${(similarity * 100).toFixed(1)}% match)`,
                details: JSON.stringify({ similarity, action: 'BLOCKED' })
            });
            
            return { valid: false, reason: 'FINGERPRINT_MISMATCH', similarity };
        }
    }

    async logDeviceAccess(accessData) {
        const {
            employeeId, deviceFingerprintHash, accessResult, 
            ipAddress, userAgent, securityNotes
        } = accessData;

        const sql = `
            INSERT INTO device_access_logs (
                employee_id, device_fingerprint_hash, access_result,
                ip_address, user_agent, security_notes
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        await this.run(sql, [
            employeeId, deviceFingerprintHash, accessResult,
            ipAddress, userAgent, securityNotes
        ]);
    }

    async logSecurityEvent(eventData) {
        const {
            eventType, severity, employeeId, deviceFingerprintHash,
            description, details, ipAddress, userAgent
        } = eventData;

        const sql = `
            INSERT INTO security_events (
                event_type, severity, employee_id, device_fingerprint_hash,
                description, details, ip_address, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await this.run(sql, [
            eventType, severity, employeeId, deviceFingerprintHash,
            description, details, ipAddress, userAgent
        ]);
    }

    // Admin methods for bulk operations
    async getPendingDevices(limit = 50) {
        const sql = `
            SELECT * FROM device_registrations 
            WHERE device_status = 'pending' 
            ORDER BY created_at ASC 
            LIMIT ?
        `;
        
        return await this.all(sql, [limit]);
    }

    async bulkApproveDevices(deviceIds, adminId) {
        const placeholders = deviceIds.map(() => '?').join(',');
        const sql = `
            UPDATE device_registrations 
            SET device_status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP
            WHERE id IN (${placeholders})
        `;
        
        const params = [adminId, ...deviceIds];
        const result = await this.run(sql, params);

        // Log bulk approval
        await this.logSecurityEvent({
            eventType: 'BULK_DEVICE_APPROVAL',
            severity: 'MEDIUM',
            description: `Bulk approved ${result.changes} devices`,
            details: JSON.stringify({ deviceIds, adminId }),
            employeeId: adminId
        });

        return result.changes;
    }

    async getSecurityReport(days = 7) {
        const sql = `
            SELECT 
                event_type,
                severity,
                COUNT(*) as count,
                DATE(created_at) as date
            FROM security_events 
            WHERE created_at >= datetime('now', '-${days} days')
            GROUP BY event_type, severity, DATE(created_at)
            ORDER BY created_at DESC
        `;
        
        return await this.all(sql);
    }

    async cleanupOldLogs(daysToKeep = 90) {
        const accessLogsSql = `
            DELETE FROM device_access_logs 
            WHERE access_time < datetime('now', '-${daysToKeep} days')
        `;
        
        const securityEventsSql = `
            DELETE FROM security_events 
            WHERE created_at < datetime('now', '-${daysToKeep} days')
            AND severity IN ('LOW', 'MEDIUM')
        `;

        const accessResult = await this.run(accessLogsSql);
        const eventsResult = await this.run(securityEventsSql);

        console.log(`🧹 Cleaned up ${accessResult.changes} access logs and ${eventsResult.changes} security events`);
        return {
            accessLogsDeleted: accessResult.changes,
            securityEventsDeleted: eventsResult.changes
        };
    }

    // Helper methods
    hashFingerprint(fingerprint) {
        const pepper = process.env.FINGERPRINT_PEPPER || 'TINI_FINGERPRINT_SALT_2024';
        return crypto.createHmac('sha256', pepper).update(fingerprint).digest('hex');
    }

    calculateFingerprintSimilarity(hash1, hash2) {
        if (!hash1 || !hash2) return 0;
        
        // Simple string similarity (in production, use more sophisticated algorithm)
        let matches = 0;
        const length = Math.min(hash1.length, hash2.length);
        
        for (let i = 0; i < length; i++) {
            if (hash1[i] === hash2[i]) matches++;
        }
        
        return matches / length;
    }

    close() {
        if (this.db) {
            this.db.close();
            this.isConnected = false;
        }
    }
}

module.exports = EnterpriseSQLiteAdapter;
