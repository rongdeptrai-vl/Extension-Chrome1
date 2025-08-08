# © 2024 TINI COMPANY - CONFIDENTIAL
# Employee: rongdeptrai-vl <rongdz2307@gmail.com>
# Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
# Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
# WARNING: Unauthorized distribution is prohibited
# Simple SQLite Database Creation
# Creates basic database for TINI Admin Panel

import sqlite3
import os

# Database path
db_path = 'tini_admin.db'

print('🗄️  Creating TINI Admin Database...')

# Create connection
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    department TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
)
''')

# Create activities table
cursor.execute('''
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Insert sample data
cursor.execute('''
INSERT OR IGNORE INTO users (username, email, full_name, department, role) VALUES
('admin', 'admin@tini.com', 'Admin User', 'IT', 'admin'),
('boss', 'boss@tini.com', 'Boss Manager', 'Management', 'admin'),
('ghost_boss', 'ghost@tini.com', 'Ghost Boss', 'Security', 'admin'),
('EMP001', 'emp001@tini.com', 'Người Dùng Quản Trị', 'IT', 'admin'),
('EMP002', 'emp002@tini.com', 'Người Dùng Thường', 'Operations', 'user')
''')

# Insert sample activities
cursor.execute('''
INSERT OR IGNORE INTO activities (user_id, action, details, ip_address) VALUES
(1, 'Login', 'Admin login successful', '127.0.0.1'),
(1, 'Chuyển sang POWER', 'Version switched to POWER v4.0.0', '127.0.0.1'),
(2, 'Thử đăng nhập', 'Login attempt', '127.0.0.1'),
(3, 'Cập nhật cài đặt', 'Settings updated', '127.0.0.1'),
(4, 'Đăng ký thiết bị', 'Device registration', '127.0.0.1')
''')

# Commit and close
conn.commit()
conn.close()

print('✅ Database created successfully!')
print(f'📁 Database file: {os.path.abspath(db_path)}')
print('🚀 Server can now connect to real data')
