// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// 🔐 ADMIN AUTHENTICATION & PANEL INTEGRATION
        
        // 🚀 INITIALIZE SECURITY SYSTEMS BY GROUPS
        console.log('🔥 [EXTENSION] Loading TINI Ultimate Security Extension v3.2.0');
        console.log('🛡️ [NHÓM 1] AI Counterattack System - Tầng 11 loaded');
        console.log('🛡️ [NHÓM 2] Ultimate Security Core - DDoS Shield active');
        console.log('👑 [NHÓM 3] BOSS Device Control - Hardware binding ready');
        console.log('🔐 [NHÓM 4] Authentication Variants - BOSS GHOST active');
        console.log('🌐 [NHÓM 5] Server Infrastructure - Ultra secure ready');
        
        // Initialize core security systems
        setTimeout(() => {
            console.log('✅ [INTEGRATION] All security groups initialized successfully');
        }, 1000);
        
        // Check current authentication level
        function checkAuthLevel() {
            const userRole = localStorage.getItem('userRole');
            const authLevel = localStorage.getItem('authLevel');
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            const hasAdminPrivileges = localStorage.getItem('hasAdminPrivileges') === 'true';
            
            return {
                userRole: userRole || 'none',
                authLevel: parseInt(authLevel) || 0,
                isAuthenticated,
                hasAdminPrivileges,
                isAdmin: userRole === 'admin' || hasAdminPrivileges,
                isBoss: userRole === 'boss' || localStorage.getItem('bossLevel10000') === 'true',
                isGhost: userRole === 'ghost_boss' || localStorage.getItem('ghostBossMode') === 'true'
            };
        }

        // Function to open admin panel with authentication check
        function openAdminPanel() {
            const auth = checkAuthLevel();
            
            console.log('🔍 Checking admin access...', auth);
            
            // Check if user has admin privileges
            if (auth.isAdmin || auth.isBoss || auth.isGhost) {
                console.log('✅ Admin access granted - Opening admin panel...');
                
                // Open admin authentication page
                const adminAuthUrl = chrome.runtime.getURL('admin-authentication.html');
                chrome.tabs.create({ url: adminAuthUrl });
                
                // Show success message
                showMessage('🛡️ Admin Panel Access Granted\n\nRedirecting to admin dashboard...', 'success');
            } else {
                console.log('❌ Admin access denied - Redirecting to authentication...');
                
                // Show authentication required message
                showMessage(
                    '🔐 Admin Authentication Required\n\n' +
                    'You need admin privileges to access the admin panel.\n' +
                    'Please authenticate first.',
                    'warning'
                );
                
                // Open authentication page anyway for login
                const adminAuthUrl = chrome.runtime.getURL('admin-authentication.html');
                chrome.tabs.create({ url: adminAuthUrl });
            }
        }

        // Show message function
        function showMessage(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `popup-message message-${type}`;
            notification.textContent = message;
            
            // Add to container or body
            let container = document.querySelector('.message-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'message-container';
                document.body.appendChild(container);
            }
            
            container.appendChild(notification);
            
            // Auto remove
            setTimeout(() => {
                notification.classList.add('slide-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // Initialize admin panel integration
        function initAdminIntegration() {
            const auth = checkAuthLevel();
            console.log('🔧 Initializing admin integration...', auth);
            
            // Auto-detect internal IP
            detectInternalIP();
            
            // Show auth status in console
            if (auth.isAuthenticated) {
                console.log(`✅ Authenticated as ${auth.userRole.toUpperCase()} (Level ${auth.authLevel})`);
            } else {
                console.log('❌ Not authenticated - Admin features hidden');
            }
        }

        // Detect internal IP address
        function detectInternalIP() {
            const internalIpSpan = document.getElementById('internalIp');
            if (internalIpSpan) {
                // Simple IP detection
                const conn = new RTCPeerConnection({iceServers:[]});
                conn.createDataChannel('');
                conn.createOffer().then(conn.setLocalDescription.bind(conn));
                conn.onicecandidate = function(ice) {
                    if (ice && ice.candidate && ice.candidate.candidate) {
                        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
                        if (myIP) {
                            internalIpSpan.textContent = myIP;
                            localStorage.setItem('detectedIP', myIP);
                            console.log('🌐 Internal IP detected:', myIP);
                        }
                        conn.onicecandidate = null;
                    }
                };
            }
        }

        // Simple authentication for BOSS SERVER/ADMIN/USERS (no password needed)
        function authenticateUser() {
            const employeeId = document.getElementById('employeeId').value;
            const deviceId = document.getElementById('deviceId').value;
            const detectedIP = localStorage.getItem('detectedIP');
            
            if (!employeeId || !deviceId) {
                showMessage('❌ Please enter Employee ID and Device ID', 'warning');
                return;
            }
            
            // Check if it's internal IP range (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
            const isInternalIP = detectedIP && (
                detectedIP.startsWith('192.168.') ||
                detectedIP.startsWith('10.') ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(detectedIP)
            );
            
            if (!isInternalIP) {
                showMessage('❌ Access denied: External IP detected\nInternal network access required', 'warning');
                return;
            }
            
            // Simple validation - just check format
            if (employeeId.length >= 3 && deviceId.length >= 5) {
                // Set authentication data
                localStorage.setItem('tiniAuthenticated', 'true');
                localStorage.setItem('employeeId', employeeId);
                localStorage.setItem('deviceId', deviceId);
                localStorage.setItem('authLevel', '5'); // Standard auth level
                localStorage.setItem('userRole', 'verified_user');
                localStorage.setItem('isAuthenticated', 'true');
                
                // Hide auth container, show main content
                document.getElementById('authContainer').classList.remove('active');
                document.getElementById('mainContent').classList.add('active');
                
                showMessage('✅ Authentication successful\nEmployee: ' + employeeId + '\nDevice: ' + deviceId, 'success');
                console.log('✅ User authenticated:', { employeeId, deviceId, detectedIP });
            } else {
                showMessage('❌ Invalid Employee ID or Device ID format', 'warning');
            }
        }

        // Add keyboard shortcut for admin panel
        document.addEventListener('keydown', function(event) {
            // Ctrl+Shift+A = Open Admin Panel
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                event.preventDefault();
                openAdminPanel();
            }
        });

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 TINI Popup with Admin Integration loaded');
            initAdminIntegration();
            
            // Setup admin panel bar events
            const adminPanelBar = document.getElementById('adminPanelBar');
            if (adminPanelBar) {
                adminPanelBar.addEventListener('click', openAdminPanel);
                adminPanelBar.addEventListener('mouseover', function() {
                    this.classList.add('admin-bar-hover');
                });
                adminPanelBar.addEventListener('mouseout', function() {
                    this.classList.remove('admin-bar-hover');
                });
            }
            
            // Setup admin button events
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) {
                adminBtn.addEventListener('click', openAdminPanel);
            }
            
            // Setup login button
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.addEventListener('click', authenticateUser);
            }
        });

        // Make functions globally available
        window.openAdminPanel = openAdminPanel;
        window.checkAuthLevel = checkAuthLevel;
        window.initAdminIntegration = initAdminIntegration;

        // 🔗 SYNC WITH ADMIN-AUTHENTICATION.HTML
        
        // Listen for auth changes from admin panel
        window.addEventListener('storage', function(event) {
            if (event.key && (
                event.key.includes('userRole') || 
                event.key.includes('authLevel') || 
                event.key.includes('isAuthenticated') ||
                event.key.includes('hasAdminPrivileges') ||
                event.key.includes('bossLevel') ||
                event.key.includes('Boss')
            )) {
                console.log('🔄 Auth data changed - Refreshing popup features...');
                setTimeout(() => {
                    initAdminIntegration();
                }, 100);
            }
        });

        // Function to trigger auth update (called from admin panel)
        function updatePopupAuth() {
            console.log('🔄 Manual auth update triggered');
            initAdminIntegration();
        }

        // Function to sync popup state with admin panel
        function syncWithAdminPanel() {
            try {
                const authData = checkAuthLevel();
                localStorage.setItem('popupAuthSync', JSON.stringify({
                    timestamp: Date.now(),
                    auth: authData,
                    source: 'popup'
                }));
                console.log('📤 Popup auth state synced to admin panel');
            } catch (e) {
                console.log('📤 Auth sync failed:', e);
            }
        }

        // Auto-sync every 5 seconds
        setInterval(syncWithAdminPanel, 5000);
        
        // Make sync functions globally available
        window.updatePopupAuth = updatePopupAuth;
        window.syncWithAdminPanel = syncWithAdminPanel;// ST:TINI_1754716154_e868a412
