// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Script to check browser localStorage for device_id
console.log('🔍 Checking browser localStorage...');
console.log('Current device_id:', localStorage.getItem('device_id'));
console.log('All localStorage keys:', Object.keys(localStorage));

// If you want to update device_id to match database:
// localStorage.setItem('device_id', '3207073b-9d87-4457-b5af-cf43ec2c6de1');

// If you want to clear and regenerate:
// localStorage.removeItem('device_id');
