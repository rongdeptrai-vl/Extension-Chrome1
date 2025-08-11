// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Debug script để kiểm tra vấn đề i18n
console.log('🔍 Starting i18n debug...');

// Kiểm tra các biến global
console.log('1. Global Variables Check:');
console.log('   - window.i18nSystem:', typeof window.i18nSystem);
console.log('   - window.tiniI18n:', typeof window.tiniI18n);
console.log('   - window.chrome.i18n:', typeof window.chrome?.i18n);

// Kiểm tra đường dẫn tệp
async function testFileAccess() {
    console.log('\n2. File Access Test:');
    const paths = [
        '../_locales/en/messages.json',
        '../../_locales/en/messages.json',
        '_locales/en/messages.json',
        '/_locales/en/messages.json'
    ];
    
    for (const path of paths) {
        try {
            const response = await fetch(path);
            console.log(`   ✅ ${path}: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`      Keys: ${Object.keys(data).length}`);
                console.log(`      Sample: nav_dashboard = "${data.nav_dashboard?.message || 'NOT FOUND'}"`);
            }
        } catch (error) {
            console.log(`   ❌ ${path}: ${error.message}`);
        }
    }
}

// Kiểm tra phần tử DOM
function testDOMElements() {
    console.log('\n3. DOM Elements Test:');
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`   Found ${elements.length} elements with data-i18n`);
    
    elements.forEach((el, index) => {
        if (index < 5) { // Show first 5 elements
            const key = el.getAttribute('data-i18n');
            const currentText = el.textContent || el.innerText;
            console.log(`   Element ${index + 1}: key="${key}", text="${currentText}"`);
        }
    });
}

// Kiểm tra phương thức getMessage
function testGetMessage() {
    console.log('\n4. getMessage Test:');
    if (window.i18nSystem && typeof window.i18nSystem.getMessage === 'function') {
        const testKeys = ['nav_dashboard', 'nav_users', 'nav_profile'];
        testKeys.forEach(key => {
            const result = window.i18nSystem.getMessage(key);
            console.log(`   ${key}: "${result}"`);
        });
    } else {
        console.log('   ❌ i18nSystem.getMessage not available');
    }
}

// Chạy tất cả tests
async function runAllTests() {
    await testFileAccess();
    testDOMElements();
    testGetMessage();
}

// Chạy tests ngay lập tức và sau 2 giây
runAllTests();
setTimeout(runAllTests, 2000);
