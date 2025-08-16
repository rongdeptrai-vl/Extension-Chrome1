// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Script để đồng bộ localStorage với database
// Chạy script này trong browser console hoặc extension popup

async function syncLocalStorageWithDatabase() {
    try {
        console.log('🔄 Starting localStorage sync with database...');
        
        // Get base URL
        const base = 'http://localhost:55057';
        console.log('🌐 Using base URL:', base);
        
        // Fetch all registrations from database
        const response = await fetch(`${base}/api/registrations/all`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📋 Database registrations:', data);
        
        if (!data.success || !data.registrations || data.registrations.length === 0) {
            console.log('⚠️ No registrations found in database');
            return { success: false, message: 'No registrations found' };
        }
        
        // Use the first registration (should match the user)
        const registration = data.registrations[0];
        console.log('✅ Using registration:', registration);
        
        // Update localStorage
        localStorage.setItem('device_id', registration.device_id);
        localStorage.setItem('registered_full_name', registration.full_name);
        localStorage.setItem('registration_status', registration.status);
        localStorage.setItem('last_sync', new Date().toISOString());
        
        console.log('📱 Updated localStorage:');
        console.log('  device_id:', localStorage.getItem('device_id'));
        console.log('  registered_full_name:', localStorage.getItem('registered_full_name'));
        
        // Update popup form fields if available
        const deviceIdField = document.getElementById('deviceId');
        const employeeIdField = document.getElementById('employeeId');
        
        if (deviceIdField) {
            deviceIdField.value = registration.device_id;
            console.log('📱 Updated device ID field');
        }
        
        if (employeeIdField) {
            employeeIdField.value = registration.full_name;
            console.log('👤 Updated employee ID field');
        }
        
        console.log('🎉 localStorage sync completed successfully!');
        
        return {
            success: true,
            message: 'localStorage synced with database',
            data: registration
        };
        
    } catch (error) {
        console.error('❌ Error syncing localStorage:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Make function available globally
window.syncLocalStorageWithDatabase = syncLocalStorageWithDatabase;

console.log('✅ Sync script loaded. Run syncLocalStorageWithDatabase() to sync.');
