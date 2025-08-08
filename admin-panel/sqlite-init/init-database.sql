-- TINI Security System - User and Device Schema
-- Version 3.0 - Added IP Tracking

-- Drop existing tables to ensure a clean slate on initialization
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS security_events;

-- Create the main users table with security constraints
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL UNIQUE,      -- Employee's full name, must be unique
    device_id TEXT NOT NULL UNIQUE,      -- Unique identifier for the employee's device
    last_known_ip TEXT,                  -- Last known internal IP address
    role TEXT NOT NULL DEFAULT 'employee', -- Role (e.g., employee, manager, admin)
    password_hash TEXT,                  -- Hashed password for future use
    status TEXT NOT NULL DEFAULT 'active', -- User status (e.g., active, suspended)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create a table to log user activities
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    activity_type TEXT NOT NULL,         -- e.g., 'LOGIN_SUCCESS', 'LOGIN_FAIL', 'REGISTER'
    description TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create a table for security-related events
CREATE TABLE security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,            -- e.g., 'NEW_DEVICE_LOGIN', 'IP_MISMATCH', 'MULTIPLE_FAILURES'
    severity TEXT NOT NULL,              -- e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description TEXT,
    details TEXT,                        -- JSON object with more context
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin/boss user for initial setup
INSERT INTO users (full_name, device_id, role, status) VALUES ('boss-account', 'boss-device-placeholder', 'boss', 'active');

-- Log the initial setup
INSERT INTO activities (activity_type, description) VALUES ('SYSTEM_INIT', 'Database schema v3.0 initialized.');
