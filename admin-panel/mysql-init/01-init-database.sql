-- TINI Admin Panel Database Initialization Script
-- This script creates the necessary database schema for the admin panel
-- Author: TINI Security Team
-- Version: 1.0

-- Use the admin dashboard database
USE tini_admin_dashboard;

-- ==========================================
-- ADMIN USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USER SESSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(128) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    auth_token VARCHAR(255),
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SYSTEM USERS TABLE (Application Users)
-- ==========================================
CREATE TABLE IF NOT EXISTS system_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    department VARCHAR(50),
    role ENUM('user', 'staff', 'manager', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USER ACTIVITIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES system_users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ADMIN ACTIVITIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_target_type (target_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SYSTEM LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL') NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    context JSON,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_log_level (log_level),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- USER PREFERENCES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES system_users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, preference_key),
    INDEX idx_user_id (user_id),
    INDEX idx_preference_key (preference_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SECURITY EVENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS security_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    source_ip VARCHAR(45),
    user_id INT NULL,
    description TEXT NOT NULL,
    metadata JSON,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES system_users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_source_ip (source_ip),
    INDEX idx_is_resolved (is_resolved),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SYSTEM STATISTICS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS system_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_name VARCHAR(100) NOT NULL,
    stat_value DECIMAL(15,4),
    stat_type ENUM('counter', 'gauge', 'histogram') DEFAULT 'gauge',
    category VARCHAR(50),
    metadata JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_stat_name (stat_name),
    INDEX idx_category (category),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DATABASE HEALTH MONITORING TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS database_health (
    id INT AUTO_INCREMENT PRIMARY KEY,
    database_type ENUM('mysql', 'redis') NOT NULL,
    status ENUM('healthy', 'warning', 'critical') NOT NULL,
    response_time_ms INT,
    error_message TEXT,
    connection_count INT,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_database_type (database_type),
    INDEX idx_status (status),
    INDEX idx_checked_at (checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INSERT DEFAULT ADMIN USER
-- ==========================================
-- Create default admin user (password: TiniAdminSecure2025!)
-- Note: In production, change this password immediately
INSERT IGNORE INTO admin_users (username, email, password_hash, role, status) VALUES 
('admin', 'admin@tini-security.com', '$2b$12$LQv3c1yqBwLVz0fGgHCUK.VqAHgHSIQs8OXZEIFOe1pRk.HqOa6BG', 'super_admin', 'active');

-- ==========================================
-- INSERT SAMPLE DATA FOR TESTING
-- ==========================================
-- Sample system users
INSERT IGNORE INTO system_users (employee_id, username, email, full_name, department, role, status) VALUES 
('EMP001', 'john.doe', 'john.doe@company.com', 'John Doe', 'IT', 'staff', 'active'),
('EMP002', 'jane.smith', 'jane.smith@company.com', 'Jane Smith', 'HR', 'manager', 'active'),
('EMP003', 'bob.wilson', 'bob.wilson@company.com', 'Bob Wilson', 'Marketing', 'user', 'active'),
('EMP004', 'alice.brown', 'alice.brown@company.com', 'Alice Brown', 'Finance', 'user', 'inactive');

-- Sample activities
INSERT IGNORE INTO user_activities (user_id, activity_type, activity_description, ip_address, metadata) VALUES 
(1, 'LOGIN', 'User logged in successfully', '192.168.1.100', '{"browser": "Chrome", "os": "Windows"}'),
(2, 'PROFILE_UPDATE', 'User updated profile information', '192.168.1.101', '{"changes": ["email", "phone"]}'),
(3, 'PASSWORD_CHANGE', 'User changed password', '192.168.1.102', '{"strength": "strong"}'),
(1, 'LOGOUT', 'User logged out', '192.168.1.100', '{"session_duration": 3600}');

-- Sample system statistics
INSERT IGNORE INTO system_statistics (stat_name, stat_value, stat_type, category) VALUES 
('active_users', 125, 'gauge', 'users'),
('total_logins_today', 450, 'counter', 'activity'),
('blocked_items', 23, 'gauge', 'security'),
('system_uptime_hours', 168.5, 'gauge', 'system'),
('memory_usage_percent', 67.8, 'gauge', 'performance'),
('cpu_usage_percent', 34.2, 'gauge', 'performance');

-- ==========================================
-- CREATE VIEWS FOR DASHBOARD
-- ==========================================
-- Active users view
CREATE OR REPLACE VIEW v_active_users AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.department,
    u.last_login,
    u.status,
    COUNT(a.id) as activity_count
FROM system_users u
LEFT JOIN user_activities a ON u.id = a.user_id AND a.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
WHERE u.status = 'active'
GROUP BY u.id, u.username, u.full_name, u.department, u.last_login, u.status
ORDER BY u.last_login DESC;

-- Recent activities view
CREATE OR REPLACE VIEW v_recent_activities AS
SELECT 
    a.id,
    u.username,
    u.full_name,
    a.activity_type,
    a.activity_description,
    a.ip_address,
    a.created_at
FROM user_activities a
LEFT JOIN system_users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 100;

-- Security events view
CREATE OR REPLACE VIEW v_security_events AS
SELECT 
    s.id,
    s.event_type,
    s.severity,
    s.source_ip,
    u.username,
    s.description,
    s.is_resolved,
    s.created_at
FROM security_events s
LEFT JOIN system_users u ON s.user_id = u.id
ORDER BY s.created_at DESC, s.severity DESC;

-- ==========================================
-- CREATE STORED PROCEDURES
-- ==========================================
DELIMITER //

-- Procedure to log admin activity
CREATE PROCEDURE IF NOT EXISTS LogAdminActivity(
    IN p_admin_id INT,
    IN p_action VARCHAR(100),
    IN p_target_type VARCHAR(50),
    IN p_target_id VARCHAR(50),
    IN p_description TEXT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_metadata JSON
)
BEGIN
    INSERT INTO admin_activities (admin_id, action, target_type, target_id, description, ip_address, user_agent, metadata)
    VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_description, p_ip_address, p_user_agent, p_metadata);
END //

-- Procedure to record system statistic
CREATE PROCEDURE IF NOT EXISTS RecordSystemStat(
    IN p_stat_name VARCHAR(100),
    IN p_stat_value DECIMAL(15,4),
    IN p_stat_type ENUM('counter', 'gauge', 'histogram'),
    IN p_category VARCHAR(50),
    IN p_metadata JSON
)
BEGIN
    INSERT INTO system_statistics (stat_name, stat_value, stat_type, category, metadata)
    VALUES (p_stat_name, p_stat_value, p_stat_type, p_category, p_metadata);
END //

-- Procedure to cleanup old data
CREATE PROCEDURE IF NOT EXISTS CleanupOldData()
BEGIN
    -- Delete old user activities (older than 90 days)
    DELETE FROM user_activities WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Delete old system logs (older than 30 days)
    DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Delete expired sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Delete old statistics (older than 180 days)
    DELETE FROM system_statistics WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 180 DAY);
    
    -- Delete old database health records (older than 7 days)
    DELETE FROM database_health WHERE checked_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END //

DELIMITER ;

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================
-- Additional indexes for better performance
ALTER TABLE user_activities ADD INDEX idx_type_date (activity_type, created_at);
ALTER TABLE admin_activities ADD INDEX idx_action_date (action, created_at);
ALTER TABLE system_logs ADD INDEX idx_level_category (log_level, category);
ALTER TABLE security_events ADD INDEX idx_severity_resolved (severity, is_resolved);

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================
INSERT INTO system_logs (log_level, category, message, source) VALUES 
('INFO', 'DATABASE', 'TINI Admin Panel database schema initialized successfully', 'mysql-init-script');

-- Show completion status
SELECT 
    'Database initialization completed successfully!' as Status,
    NOW() as Timestamp,
    'TINI Admin Panel v1.0' as Version;
