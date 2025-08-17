// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 661d2ea | Time: 2025-08-17T12:09:46Z
// Watermark: TINI_1755432586_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// EMERGENCY FIX FOR USER DELETE WITH SESSION INVALIDATION

// Handle user deletion API with proper session cleanup
function handleUserDelete(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Database not available' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body || '{}');
            const userId = data.userId || data.id;
            
            if (!userId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'User ID is required' }));
                return;
            }

            // Start transaction
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // First get user info for logging and session cleanup
                db.get('SELECT username, full_name, employee_id FROM users WHERE id = ?', [userId], (err, user) => {
                    if (err) {
                        db.run('ROLLBACK');
                        console.error('Error fetching user info:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Database error' }));
                        return;
                    }

                    if (!user) {
                        db.run('ROLLBACK');
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'User not found' }));
                        return;
                    }

                    console.log(`🗑️ Deleting user: ${user.username} (${user.full_name})`);

                    // CRITICAL: Delete all sessions for this user immediately
                    const cleanupQueries = [
                        // 1. Delete admin sessions by username, employee_id, and full_name
                        { sql: 'DELETE FROM admin_sessions WHERE username = ? OR username = ? OR username = ?', 
                          params: [user.username, user.employee_id, user.full_name], desc: 'admin sessions' },
                        
                        // 2. Delete regular sessions
                        { sql: 'DELETE FROM sessions WHERE user_id = ?', 
                          params: [userId], desc: 'user sessions' },
                        
                        // 3. Delete activities
                        { sql: 'DELETE FROM activities WHERE user_id = ?', 
                          params: [userId], desc: 'activities' },
                        
                        // 4. Delete device registrations
                        { sql: 'DELETE FROM device_registrations WHERE user_id = ? OR full_name = ? OR full_name = ?', 
                          params: [userId, user.full_name, user.username], desc: 'device registrations' },
                        
                        // 5. Delete pending approvals
                        { sql: 'DELETE FROM pending_approvals WHERE user_id = ?', 
                          params: [userId], desc: 'pending approvals' },
                        
                        // 6. Finally delete the user
                        { sql: 'DELETE FROM users WHERE id = ?', 
                          params: [userId], desc: 'user record' }
                    ];

                    let completed = 0;
                    let hasError = false;

                    function executeNextQuery(index) {
                        if (index >= cleanupQueries.length) {
                            // All queries completed successfully
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    console.error('Error committing transaction:', commitErr);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: false, error: 'Transaction commit failed' }));
                                } else {
                                    console.log(`✅ User ${user.username} deleted successfully with all sessions invalidated`);
                                    
                                    // Broadcast user deletion to connected clients
                                    if (io) {
                                        io.emit('user-deleted', {
                                            userId: userId,
                                            username: user.username,
                                            fullName: user.full_name
                                        });
                                    }

                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ 
                                        success: true, 
                                        message: 'User and all sessions deleted successfully',
                                        deletedUser: {
                                            id: userId,
                                            username: user.username,
                                            fullName: user.full_name
                                        }
                                    }));
                                }
                            });
                            return;
                        }

                        const query = cleanupQueries[index];
                        db.run(query.sql, query.params, function(err) {
                            if (err) {
                                // Log error but continue if it's a "table doesn't exist" error
                                if (err.message.includes('no such table') || err.message.includes('no such column')) {
                                    console.log(`⚠️ Skipping ${query.desc}: ${err.message}`);
                                    executeNextQuery(index + 1);
                                } else {
                                    console.error(`❌ Error deleting ${query.desc}:`, err);
                                    hasError = true;
                                    db.run('ROLLBACK');
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: false, error: `Failed to delete ${query.desc}` }));
                                }
                            } else {
                                console.log(`✅ Deleted ${query.desc} (${this.changes} rows affected)`);
                                executeNextQuery(index + 1);
                            }
                        });
                    }

                    // Start the deletion chain
                    executeNextQuery(0);
                });
            });

        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        }
    });
}

module.exports = { handleUserDelete };
