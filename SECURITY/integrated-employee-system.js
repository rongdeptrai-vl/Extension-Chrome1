// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Integrated Employee System - Core Management
// Essential component that was missing from the main workspace

class IntegratedEmployeeSystem {
    constructor() {
        this.employees = new Map();
        this.maxEmployees = 2000;
        this.currentEmployees = 0;
        this.securityLevel = 'maximum';
        
        this.initializeSystem();
    }
    
    initializeSystem() {
        console.log('🏢 Integrated Employee System initialized');
        console.log(`📊 Capacity: ${this.maxEmployees} employees`);
        
        // Initialize with basic admin employee
        this.addEmployee('ADMIN_001', {
            fullName: 'System Administrator',
            role: 'admin',
            joinDate: new Date().toISOString()
        });
    }
    
    addEmployee(employeeId, employeeData) {
        if (this.currentEmployees >= this.maxEmployees) {
            return {
                success: false,
                error: 'LIMIT_EXCEEDED',
                message: 'Maximum employee limit reached'
            };
        }
        
        this.employees.set(employeeId, {
            ...employeeData,
            id: employeeId,
            status: 'active',
            createdAt: new Date().toISOString()
        });
        
        this.currentEmployees++;
        
        return {
            success: true,
            employee: this.employees.get(employeeId)
        };
    }
    
    findEmployee(employeeId) {
        return this.employees.get(employeeId) || null;
    }
    
    authenticateUser(deviceId, password) {
        // Basic authentication for now
        const employee = Array.from(this.employees.values())
            .find(emp => emp.deviceId === deviceId);
            
        if (employee) {
            return {
                success: true,
                user: employee
            };
        }
        
        return {
            success: false,
            error: 'Invalid credentials'
        };
    }
    
    registerNewEmployee(fullName, deviceInfo) {
        const employeeId = `EMP_${Date.now()}`;
        const deviceId = `DEV_${Date.now()}`;
        const password = this.generatePassword();
        
        const result = this.addEmployee(employeeId, {
            fullName: fullName,
            role: 'employee',
            deviceId: deviceId,
            deviceInfo: deviceInfo
        });
        
        if (result.success) {
            return {
                success: true,
                employee: result.employee,
                credentials: {
                    deviceId: deviceId,
                    password: password
                }
            };
        }
        
        return result;
    }
    
    generatePassword() {
        return Math.random().toString(36).slice(-8);
    }
    
    getSystemStats() {
        return {
            currentEmployees: this.currentEmployees,
            maxEmployees: this.maxEmployees,
            utilizationPercent: Math.round((this.currentEmployees / this.maxEmployees) * 100)
        };
    }
    
    canDeleteUser(currentRole, targetRole, targetId, currentId) {
        // Prevent self-deletion
        if (currentId === targetId) {
            return {
                allowed: false,
                message: 'Cannot delete yourself',
                reason: 'SELF_DELETE_BLOCKED'
            };
        }
        
        // Admin cannot delete other admins
        if (currentRole === 'admin' && targetRole === 'admin') {
            return {
                allowed: false,
                message: 'Admin cannot delete other admins',
                reason: 'ADMIN_DELETE_ADMIN_BLOCKED'
            };
        }
        
        // Boss can delete anyone
        if (currentRole === 'boss' || currentRole === 'ghost') {
            return {
                allowed: true,
                message: 'Boss has full authority'
            };
        }
        
        return {
            allowed: true,
            message: 'Action permitted'
        };
    }
    
    removeEmployee(employeeId) {
        if (this.employees.has(employeeId)) {
            this.employees.delete(employeeId);
            this.currentEmployees--;
            return true;
        }
        return false;
    }
    
    logAdminAction(action, performedBy, targetId, details) {
        console.log(`📝 Admin Action: ${action} by ${performedBy} on ${targetId}`, details);
    }
}

// Make globally available
if (typeof window !== 'undefined') {
    window.integratedEmployeeSystem = new IntegratedEmployeeSystem();
    window.IntegratedEmployeeSystem = IntegratedEmployeeSystem;
} else {
    module.exports = IntegratedEmployeeSystem;
}

console.log('✅ Integrated Employee System loaded and ready');
