// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Chrome API Compatibility Layer
// This provides fallbacks for Chrome extension APIs when running in a regular browser

(function() {
    'use strict';
    
    // Only create mock if chrome is not available
    if (typeof chrome === 'undefined') {
        console.log('🔧 Creating Chrome API compatibility layer');
        
        window.chrome = {
            storage: {
                local: {
                    set: function(data, callback) {
                        console.log('📦 Mock chrome.storage.local.set:', data);
                        try {
                            Object.keys(data).forEach(key => {
                                const value = typeof data[key] === 'object' 
                                    ? JSON.stringify(data[key]) 
                                    : data[key];
                                localStorage.setItem(key, value);
                            });
                            if (callback) setTimeout(callback, 0);
                        } catch (error) {
                            console.error('❌ Mock storage.set error:', error);
                            if (callback) setTimeout(() => callback(error), 0);
                        }
                    },
                    
                    get: function(keys, callback) {
                        console.log('📦 Mock chrome.storage.local.get:', keys);
                        try {
                            const result = {};
                            
                            if (Array.isArray(keys)) {
                                keys.forEach(key => {
                                    const value = localStorage.getItem(key);
                                    try {
                                        result[key] = JSON.parse(value);
                                    } catch (e) {
                                        result[key] = value;
                                    }
                                });
                            } else if (typeof keys === 'string') {
                                const value = localStorage.getItem(keys);
                                try {
                                    result[keys] = JSON.parse(value);
                                } catch (e) {
                                    result[keys] = value;
                                }
                            } else if (typeof keys === 'object' && keys !== null) {
                                // Handle object with default values
                                Object.keys(keys).forEach(key => {
                                    const value = localStorage.getItem(key);
                                    if (value !== null) {
                                        try {
                                            result[key] = JSON.parse(value);
                                        } catch (e) {
                                            result[key] = value;
                                        }
                                    } else {
                                        result[key] = keys[key]; // Use default value
                                    }
                                });
                            }
                            
                            if (callback) setTimeout(() => callback(result), 0);
                        } catch (error) {
                            console.error('❌ Mock storage.get error:', error);
                            if (callback) setTimeout(() => callback({}), 0);
                        }
                    },
                    
                    remove: function(keys, callback) {
                        console.log('📦 Mock chrome.storage.local.remove:', keys);
                        try {
                            if (Array.isArray(keys)) {
                                keys.forEach(key => localStorage.removeItem(key));
                            } else {
                                localStorage.removeItem(keys);
                            }
                            if (callback) setTimeout(callback, 0);
                        } catch (error) {
                            console.error('❌ Mock storage.remove error:', error);
                            if (callback) setTimeout(() => callback(error), 0);
                        }
                    },
                    
                    clear: function(callback) {
                        console.log('📦 Mock chrome.storage.local.clear');
                        try {
                            localStorage.clear();
                            if (callback) setTimeout(callback, 0);
                        } catch (error) {
                            console.error('❌ Mock storage.clear error:', error);
                            if (callback) setTimeout(() => callback(error), 0);
                        }
                    }
                }
            },
            
            runtime: {
                lastError: null,
                getManifest: function() {
                    return {
                        version: '1.0.0',
                        name: 'TINI Admin Panel',
                        description: 'Admin panel running in browser mode'
                    };
                },
                sendMessage: function(message, callback) {
                    console.log('📦 Mock chrome.runtime.sendMessage:', message);
                    if (callback) setTimeout(() => callback({status: 'mock_response'}), 0);
                }
            },
            
            tabs: {
                query: function(queryInfo, callback) {
                    console.log('📦 Mock chrome.tabs.query:', queryInfo);
                    if (callback) setTimeout(() => callback([{
                        id: 1,
                        url: window.location.href,
                        title: document.title
                    }]), 0);
                }
            }
        };
        
        console.log('✅ Chrome API compatibility layer initialized');
    } else {
        console.log('🔧 Chrome API detected, using native implementation');
    }
})();
