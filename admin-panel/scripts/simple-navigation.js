// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Simple Navigation Fix
console.log('🚀 [NAV] Simple Navigation Fix Loading...');

class SimpleNavigation {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
        } else {
            this.setupNavigation();
        }
    }

    setupNavigation() {
        console.log('🔧 [NAV] Setting up navigation...');
        
        // Get all navigation links
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        const sections = document.querySelectorAll('.content-section');
        
        console.log(`📋 [NAV] Found ${navLinks.length} nav links and ${sections.length} sections`);
        
        // Remove existing event listeners
        navLinks.forEach(link => {
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
        });
        
        // Add fresh event listeners
        const freshNavLinks = document.querySelectorAll('.nav-link[data-section]');
        freshNavLinks.forEach((link, index) => {
            const sectionId = link.getAttribute('data-section');
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🖱️ [NAV] Clicked: ${sectionId}`);
                this.showSection(sectionId);
                this.updateActiveNav(link);
            });
            
            console.log(`✅ [NAV] Link ${index} (${sectionId}) setup complete`);
        });
        
        // Special handling for logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        console.log('✅ [NAV] Navigation setup complete');
    }

    showSection(sectionId) {
        console.log(`📄 [NAV] Showing section: ${sectionId}`);
        
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            console.log(`✅ [NAV] Section ${sectionId} is now active`);
        } else {
            console.error(`❌ [NAV] Section not found: ${sectionId}`);
        }
    }

    updateActiveNav(activeLink) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        activeLink.classList.add('active');
        
        console.log(`🎯 [NAV] Active nav updated`);
    }

    handleLogout() {
        console.log('🚪 [NAV] Logout clicked');
        
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Clear any stored data
            localStorage.removeItem('tini_admin_session');
            
            // Redirect to login or close window
            window.location.href = '/';
        }
    }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.simpleNavigation = new SimpleNavigation();
    });
} else {
    window.simpleNavigation = new SimpleNavigation();
}

// Export for global access
window.SimpleNavigation = SimpleNavigation;
