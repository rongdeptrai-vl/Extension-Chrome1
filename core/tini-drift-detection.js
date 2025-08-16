// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - DEVICE DRIFT DETECTION SYSTEM
// Advanced device fingerprint drift detection and similarity analysis

const crypto = require('crypto');

class TiniDriftDetection {
    constructor() {
        this.similarityThreshold = 80; // 80% similarity required
        this.criticalComponents = [
            'userAgent', 'platform', 'screen.width', 'screen.height', 
            'webgl.renderer', 'webgl.vendor', 'canvas', 'timezone'
        ];
        this.weightedComponents = {
            'userAgent': 15,      // Browser version changes
            'platform': 25,       // OS shouldn't change
            'screen.width': 20,   // Monitor resolution
            'screen.height': 20,  // Monitor resolution
            'webgl.renderer': 15, // Graphics card
            'webgl.vendor': 10,   // Graphics vendor
            'canvas': 10,         // Canvas fingerprint
            'timezone': 5,        // Geographic location
            'plugins': 5,         // Browser plugins
            'fonts': 5           // System fonts
        };
    }

    // Calculate similarity between two fingerprints
    calculateSimilarity(oldFingerprint, newFingerprint) {
        try {
            const oldData = typeof oldFingerprint === 'string' ? JSON.parse(oldFingerprint) : oldFingerprint;
            const newData = typeof newFingerprint === 'string' ? JSON.parse(newFingerprint) : newFingerprint;

            let totalWeight = 0;
            let matchedWeight = 0;

            for (const [component, weight] of Object.entries(this.weightedComponents)) {
                totalWeight += weight;
                
                const oldValue = this.getNestedValue(oldData, component);
                const newValue = this.getNestedValue(newData, component);

                if (this.compareValues(oldValue, newValue, component)) {
                    matchedWeight += weight;
                }
            }

            const similarityPercentage = (matchedWeight / totalWeight) * 100;
            return Math.round(similarityPercentage * 100) / 100;

        } catch (error) {
            console.error('Error calculating similarity:', error);
            return 0; // Assume no similarity on error
        }
    }

    // Get nested object value by dot notation
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // Compare two values based on component type
    compareValues(oldValue, newValue, component) {
        if (oldValue === null || newValue === null) return false;
        
        switch (component) {
            case 'userAgent':
                // Allow minor version changes in browser
                return this.compareUserAgents(oldValue, newValue);
            
            case 'plugins':
                // Compare plugin arrays
                return this.compareArrays(oldValue, newValue, 0.8); // 80% plugins should match
            
            case 'fonts':
                // Compare font arrays
                return this.compareArrays(oldValue, newValue, 0.9); // 90% fonts should match
            
            case 'canvas':
                // Canvas might have slight rendering differences
                return this.compareCanvasFingerprints(oldValue, newValue);
            
            default:
                // Exact match for other components
                return oldValue === newValue;
        }
    }

    // Compare user agents allowing minor version differences
    compareUserAgents(oldUA, newUA) {
        if (oldUA === newUA) return true;

        // Extract browser name and major version
        const oldBrowser = this.extractBrowserInfo(oldUA);
        const newBrowser = this.extractBrowserInfo(newUA);

        // Same browser family is acceptable
        return oldBrowser.name === newBrowser.name && 
               Math.abs(oldBrowser.majorVersion - newBrowser.majorVersion) <= 2;
    }

    // Extract browser information from user agent
    extractBrowserInfo(userAgent) {
        const browsers = [
            { name: 'Chrome', regex: /Chrome\/(\d+)/ },
            { name: 'Firefox', regex: /Firefox\/(\d+)/ },
            { name: 'Safari', regex: /Safari\/(\d+)/ },
            { name: 'Edge', regex: /Edge\/(\d+)/ }
        ];

        for (const browser of browsers) {
            const match = userAgent.match(browser.regex);
            if (match) {
                return {
                    name: browser.name,
                    majorVersion: parseInt(match[1])
                };
            }
        }

        return { name: 'Unknown', majorVersion: 0 };
    }

    // Compare arrays with similarity threshold
    compareArrays(arr1, arr2, threshold) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
        if (arr1.length === 0 && arr2.length === 0) return true;

        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        
        const unionSize = new Set([...set1, ...set2]).size;
        const similarity = intersection.size / unionSize;
        
        return similarity >= threshold;
    }

    // Compare canvas fingerprints (allowing small rendering differences)
    compareCanvasFingerprints(canvas1, canvas2) {
        if (canvas1 === canvas2) return true;
        
        // If both are strings, compare with some tolerance for anti-aliasing differences
        if (typeof canvas1 === 'string' && typeof canvas2 === 'string') {
            // Calculate Levenshtein distance for canvas data
            const distance = this.levenshteinDistance(canvas1, canvas2);
            const maxLength = Math.max(canvas1.length, canvas2.length);
            const similarity = 1 - (distance / maxLength);
            
            return similarity >= 0.95; // 95% similarity for canvas
        }
        
        return false;
    }

    // Calculate Levenshtein distance
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Analyze drift and determine action
    analyzeDrift(oldFingerprint, newFingerprint, userId) {
        const similarity = this.calculateSimilarity(oldFingerprint, newFingerprint);
        const timestamp = new Date().toISOString();
        
        let status, action, severity;
        
        if (similarity >= 95) {
            status = 'NO_DRIFT';
            action = 'ALLOW';
            severity = 'LOW';
        } else if (similarity >= this.similarityThreshold) {
            status = 'MINOR_DRIFT';
            action = 'ALLOW_WITH_LOG';
            severity = 'LOW';
        } else if (similarity >= 60) {
            status = 'MODERATE_DRIFT';
            action = 'REQUIRE_MFA';
            severity = 'MEDIUM';
        } else if (similarity >= 40) {
            status = 'MAJOR_DRIFT';
            action = 'REQUIRE_MFA_AND_ADMIN_REVIEW';
            severity = 'HIGH';
        } else {
            status = 'DEVICE_CHANGED';
            action = 'BLOCK_AND_ADMIN_REVIEW';
            severity = 'CRITICAL';
        }

        return {
            userId,
            timestamp,
            similarity,
            status,
            action,
            severity,
            requiresMFA: action.includes('MFA'),
            requiresAdminReview: action.includes('ADMIN'),
            blocked: action.includes('BLOCK'),
            details: this.getDetailedDriftAnalysis(oldFingerprint, newFingerprint)
        };
    }

    // Get detailed analysis of what changed
    getDetailedDriftAnalysis(oldFingerprint, newFingerprint) {
        try {
            const oldData = typeof oldFingerprint === 'string' ? JSON.parse(oldFingerprint) : oldFingerprint;
            const newData = typeof newFingerprint === 'string' ? JSON.parse(newFingerprint) : newFingerprint;
            
            const changes = [];
            
            for (const component of Object.keys(this.weightedComponents)) {
                const oldValue = this.getNestedValue(oldData, component);
                const newValue = this.getNestedValue(newData, component);
                
                if (!this.compareValues(oldValue, newValue, component)) {
                    changes.push({
                        component,
                        oldValue: this.truncateValue(oldValue),
                        newValue: this.truncateValue(newValue),
                        weight: this.weightedComponents[component]
                    });
                }
            }

            return changes;
        } catch (error) {
            return [{ error: 'Failed to analyze changes', message: error.message }];
        }
    }

    // Truncate long values for logging
    truncateValue(value) {
        if (typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        return value;
    }

    // Store drift analysis in database
    async storeDriftAnalysis(driftResult, db) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO device_drift_logs 
                (user_id, similarity_score, drift_status, action_taken, severity, 
                 requires_mfa, requires_admin_review, blocked, details, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `;

            db.run(query, [
                driftResult.userId,
                driftResult.similarity,
                driftResult.status,
                driftResult.action,
                driftResult.severity,
                driftResult.requiresMFA ? 1 : 0,
                driftResult.requiresAdminReview ? 1 : 0,
                driftResult.blocked ? 1 : 0,
                JSON.stringify(driftResult.details)
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ logId: this.lastID, ...driftResult });
                }
            });
        });
    }

    // Get drift history for user
    async getDriftHistory(userId, db, limit = 50) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM device_drift_logs 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            `;

            db.all(query, [userId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const history = rows.map(row => ({
                        ...row,
                        details: JSON.parse(row.details || '[]'),
                        requiresMFA: row.requires_mfa === 1,
                        requiresAdminReview: row.requires_admin_review === 1,
                        blocked: row.blocked === 1
                    }));
                    resolve(history);
                }
            });
        });
    }
}

module.exports = TiniDriftDetection;
