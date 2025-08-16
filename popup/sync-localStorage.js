// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Script to sync localStorage with database
// Run this in browser console on the extension popup

async function syncWithDatabase() {
    console.log('🔄 Starting sync with database...');
    
    try {
        // Get current panel base URL
        let base;
        if (typeof window.resolvePanelBase === 'function') {
            base = await window.resolvePanelBase();
        } else if (typeof window.getPanelBase === 'function') {
            base = window.getPanelBase();
        } else {
            base = 'http://localhost:55057'; // Use the port we know is working
        }
        console.log('📡 Panel base:', base);
        
        // Current localStorage data
        const currentDeviceId = localStorage.getItem('device_id');
        console.log('📱 Current device ID:', currentDeviceId);
        
        // Get all registrations from database
        const response = await fetch(`${base}/api/registrations/all`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📋 Database registrations:', data);
        
        if (data.success && data.registrations && data.registrations.length > 0) {
            // Use the first/latest registration
            const registration = data.registrations[0];
            console.log('🎯 Using registration:', registration);
            
            // Update localStorage with correct device ID from database
            const correctDeviceId = registration.device_id;
            localStorage.setItem('device_id', correctDeviceId);
            console.log('✅ Updated device ID to:', correctDeviceId);
            
            // Update the form fields
            const deviceIdField = document.getElementById('deviceId');
            if (deviceIdField) {
                deviceIdField.value = correctDeviceId;
                console.log('✅ Updated device ID field');
            }
            
            const employeeNameField = document.getElementById('employeeName');
            if (employeeNameField) {
                employeeNameField.value = registration.full_name;
                console.log('✅ Updated employee name field:', registration.full_name);
            }
            
            // Clear old cache and set new one
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('device_registered_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Check device registration status with correct ID
            const checkResponse = await fetch(`${base}/api/device/check?deviceId=${encodeURIComponent(correctDeviceId)}`);
            const checkData = await checkResponse.json();
            
            if (checkData.success && checkData.exists) {
                console.log('✅ Device verification successful:', checkData.device);
                
                // Cache the verified registration info
                localStorage.setItem(`device_registered_${correctDeviceId}`, JSON.stringify(checkData.device));
                
                // Update global state
                window.__registeredDeviceInfo = checkData.device;
                
                // Apply UI updates if functions exist
                if (typeof showRegisteredDeviceInfo === 'function') {
                    showRegisteredDeviceInfo(checkData.device);
                }
                
                if (typeof applyDeviceRegisteredConstraint === 'function') {
                    applyDeviceRegisteredConstraint();
                }
                
                console.log('🎉 Full sync completed successfully!');
                
                // Try to authenticate to test
                setTimeout(() => {
                    const loginBtn = document.getElementById('loginBtn');
                    if (loginBtn) {
                        console.log('🔐 Ready for authentication test');
                    }
                }, 1000);
                
            } else {
                console.log('⚠️ Device verification failed:', checkData);
            }
            
        } else {
            console.log('❌ No registrations found in database');
        }
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

// Auto-run the sync
syncWithDatabase();
