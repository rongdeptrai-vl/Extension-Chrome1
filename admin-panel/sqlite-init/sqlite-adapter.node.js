// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI SQLite Database Adapter for Node.js
 * Provides database operations for the TINI Admin Panel
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TINISQLiteAdapter {
    constructor(options = {}) {
        this.version = '1.0';
        // Use provided dbPath or default to this adapter's directory
        this.dbPath = options.dbPath || path.join(__dirname, 'tini_admin.db');
        this.isInitialized = false;
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Failed to connect to database:', err);
                    reject(err);
                    return;
                }
                this.isInitialized = true;
                resolve();
            });
        });
    }

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.isInitialized = false;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = TINISQLiteAdapter;
