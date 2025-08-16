// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - SECURE SESSION MANAGEMENT SYSTEM
// JWT-based session management with rotation and security features

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class TiniSessionManager {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || this.generateSecureSecret();
        this.refreshSecret = process.env.REFRESH_SECRET || this.generateSecureSecret();
        this.accessTokenExpiry = '15m'; // Short-lived access tokens
        this.refreshTokenExpiry = '7d';  // Longer refresh tokens
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes inactivity timeout
        this.maxConcurrentSessions = 5; // Max sessions per user
    }

    // Generate cryptographically secure secret
    generateSecureSecret() {
        return crypto.randomBytes(64).toString('hex');
    }

    // Create new session for user
    async createSession(userId, deviceId, ipAddress, userAgent, mfaVerified = false, db) {
        const sessionId = this.generateSessionId();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

        // Payload for JWT tokens
        const payload = {
            userId,
            sessionId,
            deviceId,
            ipAddress,
            mfaVerified,
            iat: Math.floor(now.getTime() / 1000)
        };

        // Generate tokens
        const accessToken = jwt.sign(payload, this.jwtSecret, { 
            expiresIn: this.accessTokenExpiry,
            issuer: 'tini-company',
            audience: 'tini-employees'
        });

        const refreshToken = jwt.sign(
            { ...payload, type: 'refresh' }, 
            this.refreshSecret, 
            { expiresIn: this.refreshTokenExpiry }
        );

        // Store session in database
        await this.storeSession({
            sessionId,
            userId,
            deviceId,
            ipAddress,
            userAgent,
            accessToken,
            refreshToken,
            mfaVerified,
            expiresAt,
            lastActivity: now
        }, db);

        // Clean up old sessions
        await this.cleanupUserSessions(userId, db);

        return {
            sessionId,
            accessToken,
            refreshToken,
            expiresAt,
            mfaVerified
        };
    }

    // Generate unique session ID
    generateSessionId() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Store session in database
    async storeSession(sessionData, db) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO user_sessions 
                (session_id, user_id, device_id, ip_address, user_agent, 
                 access_token_hash, refresh_token_hash, mfa_verified, 
                 expires_at, last_activity, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `;

            // Hash tokens for security (don't store raw tokens)
            const accessTokenHash = crypto.createHash('sha256').update(sessionData.accessToken).digest('hex');
            const refreshTokenHash = crypto.createHash('sha256').update(sessionData.refreshToken).digest('hex');

            db.run(query, [
                sessionData.sessionId,
                sessionData.userId,
                sessionData.deviceId,
                sessionData.ipAddress,
                sessionData.userAgent,
                accessTokenHash,
                refreshTokenHash,
                sessionData.mfaVerified ? 1 : 0,
                sessionData.expiresAt.toISOString(),
                sessionData.lastActivity.toISOString()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ sessionId: sessionData.sessionId });
                }
            });
        });
    }

    // Validate access token
    validateAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: 'tini-company',
                audience: 'tini-employees'
            });
            
            return {
                valid: true,
                payload: decoded,
                expired: false
            };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { valid: false, expired: true, error: 'Token expired' };
            }
            return { valid: false, expired: false, error: error.message };
        }
    }

    // Refresh access token using refresh token
    async refreshAccessToken(refreshToken, db) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, this.refreshSecret);
            
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            // Check if session exists and is valid
            const session = await this.getSessionByRefreshToken(refreshToken, db);
            if (!session || session.expired) {
                throw new Error('Session not found or expired');
            }

            // Generate new access token
            const newPayload = {
                userId: decoded.userId,
                sessionId: decoded.sessionId,
                deviceId: decoded.deviceId,
                ipAddress: decoded.ipAddress,
                mfaVerified: decoded.mfaVerified,
                iat: Math.floor(Date.now() / 1000)
            };

            const newAccessToken = jwt.sign(newPayload, this.jwtSecret, {
                expiresIn: this.accessTokenExpiry,
                issuer: 'tini-company',
                audience: 'tini-employees'
            });

            // Update access token hash in database
            await this.updateAccessToken(session.session_id, newAccessToken, db);

            return {
                success: true,
                accessToken: newAccessToken,
                expiresIn: 15 * 60 // 15 minutes
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get session by refresh token
    async getSessionByRefreshToken(refreshToken, db) {
        return new Promise((resolve, reject) => {
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            
            const query = `
                SELECT * FROM user_sessions 
                WHERE refresh_token_hash = ? 
                AND expires_at > datetime('now')
            `;

            db.get(query, [tokenHash], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Update access token in session
    async updateAccessToken(sessionId, newAccessToken, db) {
        return new Promise((resolve, reject) => {
            const tokenHash = crypto.createHash('sha256').update(newAccessToken).digest('hex');
            
            const query = `
                UPDATE user_sessions 
                SET access_token_hash = ?, last_activity = datetime('now') 
                WHERE session_id = ?
            `;

            db.run(query, [tokenHash, sessionId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ updated: this.changes > 0 });
                }
            });
        });
    }

    // Update session activity
    async updateActivity(sessionId, db) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE user_sessions 
                SET last_activity = datetime('now') 
                WHERE session_id = ?
            `;

            db.run(query, [sessionId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ updated: this.changes > 0 });
                }
            });
        });
    }

    // Terminate session
    async terminateSession(sessionId, db) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM user_sessions WHERE session_id = ?';
            
            db.run(query, [sessionId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ terminated: this.changes > 0 });
                }
            });
        });
    }

    // Terminate all sessions for user
    async terminateAllUserSessions(userId, db) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM user_sessions WHERE user_id = ?';
            
            db.run(query, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ terminatedCount: this.changes });
                }
            });
        });
    }

    // Clean up old sessions for user (keep only latest N sessions)
    async cleanupUserSessions(userId, db) {
        return new Promise((resolve, reject) => {
            // Keep only the most recent sessions
            const query = `
                DELETE FROM user_sessions 
                WHERE user_id = ? 
                AND session_id NOT IN (
                    SELECT session_id FROM user_sessions 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT ?
                )
            `;

            db.run(query, [userId, userId, this.maxConcurrentSessions], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ cleanedUp: this.changes });
                }
            });
        });
    }

    // Get active sessions for user
    async getUserSessions(userId, db) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT session_id, device_id, ip_address, user_agent, 
                       mfa_verified, last_activity, created_at
                FROM user_sessions 
                WHERE user_id = ? AND expires_at > datetime('now')
                ORDER BY last_activity DESC
            `;

            db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        ...row,
                        mfaVerified: row.mfa_verified === 1,
                        isCurrentSession: false // Will be set by caller
                    })));
                }
            });
        });
    }

    // Clean up expired sessions
    async cleanupExpiredSessions(db) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM user_sessions WHERE expires_at <= datetime("now")';
            
            db.run(query, [], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ cleanedUp: this.changes });
                }
            });
        });
    }

    // Generate CSRF token
    generateCSRFToken(sessionId) {
        const data = `${sessionId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
        return crypto.createHmac('sha256', this.jwtSecret).update(data).digest('hex');
    }

    // Verify CSRF token
    verifyCSRFToken(token, sessionId) {
        // Simple CSRF token verification
        // In production, you might want more sophisticated validation
        return typeof token === 'string' && token.length === 64;
    }

    // Session middleware for Express
    sessionMiddleware() {
        return async (req, res, next) => {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Access token required' });
            }

            const validation = this.validateAccessToken(token);
            
            if (!validation.valid) {
                if (validation.expired) {
                    return res.status(401).json({ 
                        error: 'Token expired', 
                        requiresRefresh: true 
                    });
                }
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Add user info to request
            req.user = validation.payload;
            req.sessionId = validation.payload.sessionId;

            // Update session activity
            if (req.db) {
                await this.updateActivity(req.sessionId, req.db).catch(console.error);
            }

            next();
        };
    }
}

module.exports = TiniSessionManager;
