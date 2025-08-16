// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - MFA AUTHENTICATION SYSTEM
// Multi-Factor Authentication implementation for enterprise security

const crypto = require('crypto');
const qrcode = require('qrcode');
const base32 = require('thirty-two');

class TiniMFASystem {
    constructor() {
        this.secretLength = 32;
        this.windowSize = 1; // Allow 1 time step variance
        this.timeStep = 30; // 30 seconds per step
    }

    // Generate MFA secret for user
    generateSecret(userId) {
        const secretBuffer = crypto.randomBytes(this.secretLength);
        const secret = base32.encode(secretBuffer).toString().replace(/=/g, '');
        return {
            secret,
            userId,
            backupCodes: this.generateBackupCodes()
        };
    }

    // Generate backup codes for emergency access
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return codes;
    }

    // Generate QR code for authenticator app setup
    async generateQRCode(userId, secret, issuer = 'TINI Company') {
        const otpauth = `otpauth://totp/${issuer}:${userId}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
        try {
            const qrCodeDataURL = await qrcode.toDataURL(otpauth);
            return qrCodeDataURL;
        } catch (error) {
            throw new Error(`QR Code generation failed: ${error.message}`);
        }
    }

    // Generate TOTP token (for testing)
    generateTOTP(secret, timestamp = null) {
        const time = timestamp || Math.floor(Date.now() / 1000);
        const timeStep = Math.floor(time / this.timeStep);
        
        const secretBuffer = base32.decode(secret);
        const timeBuffer = Buffer.alloc(8);
        timeBuffer.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0);
        timeBuffer.writeUInt32BE(timeStep & 0xffffffff, 4);
        
        const hmac = crypto.createHmac('sha1', secretBuffer);
        hmac.update(timeBuffer);
        const hash = hmac.digest();
        
        const offset = hash[hash.length - 1] & 0xf;
        const binary = ((hash[offset] & 0x7f) << 24) |
                      ((hash[offset + 1] & 0xff) << 16) |
                      ((hash[offset + 2] & 0xff) << 8) |
                      (hash[offset + 3] & 0xff);
        
        return (binary % 1000000).toString().padStart(6, '0');
    }

    // Verify TOTP token
    verifyTOTP(token, secret, timestamp = null) {
        const time = timestamp || Math.floor(Date.now() / 1000);
        
        // Check current time window and adjacent windows
        for (let i = -this.windowSize; i <= this.windowSize; i++) {
            const testTime = time + (i * this.timeStep);
            const expectedToken = this.generateTOTP(secret, testTime);
            
            if (token === expectedToken) {
                return true;
            }
        }
        
        return false;
    }

    // Verify backup code
    verifyBackupCode(code, userBackupCodes) {
        const index = userBackupCodes.indexOf(code.toUpperCase());
        if (index !== -1) {
            // Remove used backup code
            userBackupCodes.splice(index, 1);
            return true;
        }
        return false;
    }

    // Setup MFA for user
    async setupMFA(userId, db) {
        return new Promise((resolve, reject) => {
            const mfaData = this.generateSecret(userId);
            
            const query = `
                INSERT OR REPLACE INTO user_mfa_settings 
                (user_id, secret, backup_codes, enabled, created_at) 
                VALUES (?, ?, ?, ?, datetime('now'))
            `;
            
            db.run(query, [
                userId,
                mfaData.secret,
                JSON.stringify(mfaData.backupCodes),
                0, // Disabled until user confirms setup
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        secret: mfaData.secret,
                        backupCodes: mfaData.backupCodes,
                        setupComplete: false
                    });
                }
            });
        });
    }

    // Enable MFA after user confirms setup
    async enableMFA(userId, verificationToken, db) {
        return new Promise((resolve, reject) => {
            // First get user's secret
            db.get('SELECT secret FROM user_mfa_settings WHERE user_id = ?', [userId], (err, row) => {
                if (err || !row) {
                    reject(new Error('MFA setup not found'));
                    return;
                }

                // Verify the token
                if (!this.verifyTOTP(verificationToken, row.secret)) {
                    reject(new Error('Invalid verification token'));
                    return;
                }

                // Enable MFA
                db.run('UPDATE user_mfa_settings SET enabled = 1 WHERE user_id = ?', [userId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true, message: 'MFA enabled successfully' });
                    }
                });
            });
        });
    }

    // Authenticate with MFA
    async authenticateMFA(userId, token, db) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT secret, backup_codes, enabled FROM user_mfa_settings WHERE user_id = ? AND enabled = 1';
            
            db.get(query, [userId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    reject(new Error('MFA not enabled for user'));
                    return;
                }

                let isValid = false;
                let usedBackupCode = false;

                // Try TOTP first
                if (this.verifyTOTP(token, row.secret)) {
                    isValid = true;
                } else {
                    // Try backup codes
                    const backupCodes = JSON.parse(row.backup_codes || '[]');
                    if (this.verifyBackupCode(token, backupCodes)) {
                        isValid = true;
                        usedBackupCode = true;

                        // Update backup codes in database
                        db.run('UPDATE user_mfa_settings SET backup_codes = ? WHERE user_id = ?', 
                            [JSON.stringify(backupCodes), userId]);
                    }
                }

                resolve({
                    success: isValid,
                    usedBackupCode,
                    remainingBackupCodes: usedBackupCode ? JSON.parse(row.backup_codes || '[]').length : null
                });
            });
        });
    }

    // Disable MFA (with admin override)
    async disableMFA(userId, adminUserId, db) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE user_mfa_settings 
                SET enabled = 0, disabled_by = ?, disabled_at = datetime('now') 
                WHERE user_id = ?
            `;
            
            db.run(query, [adminUserId, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        success: true, 
                        message: 'MFA disabled',
                        disabledBy: adminUserId 
                    });
                }
            });
        });
    }

    // Get MFA status for user
    async getMFAStatus(userId, db) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT enabled, created_at, backup_codes FROM user_mfa_settings WHERE user_id = ?';
            
            db.get(query, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve({ enabled: false, setup: false });
                } else {
                    const backupCodes = JSON.parse(row.backup_codes || '[]');
                    resolve({
                        enabled: row.enabled === 1,
                        setup: true,
                        setupDate: row.created_at,
                        remainingBackupCodes: backupCodes.length
                    });
                }
            });
        });
    }
}

module.exports = TiniMFASystem;
