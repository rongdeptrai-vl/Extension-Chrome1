# 🗄️ TINI Admin Panel Database Configuration Guide

## 📋 Overview

This guide helps you configure MySQL and Redis for the TINI Admin Panel. The admin panel includes comprehensive database integration with real-time connection monitoring and health checks.

## 🎯 Quick Start

### Option 1: Docker Setup (Recommended)
```bash
cd admin panel
./setup-database.bat
# Choose option 1 for Docker setup
```

### Option 2: Local Installation
```bash
cd admin panel
./setup-database.bat
# Choose option 2 for local setup
```

## 🔧 Database Configuration

### MySQL Configuration

#### Environment Variables (.env)
```env
# MySQL Settings
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tini_admin_dashboard
DB_USER=tini_admin_user
DB_PASSWORD=tini_secure_db_password_2025

# Connection Pool Settings
DB_CONNECTION_LIMIT=100
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
DB_RECONNECT=true
```

#### Manual MySQL Setup
1. **Install MySQL 8.0+**
```sql
-- Create database
CREATE DATABASE tini_admin_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'tini_admin_user'@'localhost' IDENTIFIED BY 'tini_secure_db_password_2025';
GRANT ALL PRIVILEGES ON tini_admin_dashboard.* TO 'tini_admin_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Run initialization script**
```bash
mysql -u tini_admin_user -p tini_admin_dashboard < mysql-init/01-init-database.sql
```

### Redis Configuration

#### Environment Variables (.env)
```env
# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_secure_password_2025
REDIS_DB=0

# Redis Connection Settings
REDIS_RETRY_DELAY=100
REDIS_MAX_RETRIES=3
```

#### Manual Redis Setup
1. **Install Redis 7.0+**
2. **Configure Redis (redis.conf)**
```conf
# Basic settings
port 6379
bind 127.0.0.1
requirepass redis_secure_password_2025

# Memory settings
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
save 900 1
save 300 10
save 60 10000
```

## 🐳 Docker Compose Setup

### Complete Stack
The `docker-compose.yml` includes:
- **Admin Panel**: Main application on port 3001
- **MySQL 8.0**: Database on port 3306
- **Redis 7**: Cache/sessions on port 6379
- **phpMyAdmin**: Database management on port 8080
- **Redis Commander**: Redis management on port 8081
- **Nginx**: Reverse proxy on port 80/443

### Starting Services
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs admin-panel
docker-compose logs mysql-db
docker-compose logs redis-cache
```

### Service URLs
- **Admin Panel**: http://localhost:3001
- **phpMyAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

## 📊 Database Schema

### Core Tables

#### admin_users
```sql
- id (Primary Key)
- username (Unique)
- email
- password_hash
- role (super_admin, admin, moderator)
- status (active, inactive, suspended)
- last_login
- login_attempts
```

#### system_users
```sql
- id (Primary Key)
- employee_id (Unique)
- username (Unique)
- email
- full_name
- department
- role (user, staff, manager, admin)
- status (active, inactive, suspended, terminated)
```

#### user_activities
```sql
- id (Primary Key)
- user_id (Foreign Key)
- activity_type
- activity_description
- ip_address
- metadata (JSON)
- created_at
```

#### user_sessions
```sql
- id (Primary Key)
- session_id (Unique)
- user_id (Foreign Key)
- auth_token
- device_info (JSON)
- expires_at
```

### Performance Views
- `v_active_users`: Active users with activity counts
- `v_recent_activities`: Latest 100 user activities
- `v_security_events`: Security events with user info

## 🔍 Database Monitoring

### Real-time Status Check
The admin panel includes a **Database Status** section that shows:
- ✅ MySQL connection status
- ✅ Redis connection status
- 🔧 Environment configuration
- ⚡ Real-time testing buttons

### Health Monitoring Features
```javascript
// Test connections manually
tiniDatabaseIntegration.testConnection('mysql');
tiniDatabaseIntegration.testConnection('redis');

// Get connection status
const status = tiniDatabaseIntegration.getConnectionStatus();
console.log(status);
```

### Automatic Health Checks
- **Interval**: Every 30 seconds
- **Metrics**: Connection status, response time, error tracking
- **Alerts**: Automatic failure detection and logging

## 🛠️ Troubleshooting

### Common Issues

#### MySQL Connection Failed
1. **Check MySQL service**
```bash
# Windows
net start mysql80

# Docker
docker-compose restart mysql-db
```

2. **Verify credentials**
```bash
mysql -h localhost -u tini_admin_user -p
```

3. **Check port availability**
```bash
netstat -an | findstr 3306
```

#### Redis Connection Failed
1. **Check Redis service**
```bash
# Windows
redis-server

# Docker
docker-compose restart redis-cache
```

2. **Test connection**
```bash
redis-cli -h localhost -p 6379 ping
```

3. **Check authentication**
```bash
redis-cli -h localhost -p 6379 -a redis_secure_password_2025 ping
```

### Connection Status Indicators
- 🟢 **CONNECTED**: Service is healthy and responsive
- 🟡 **CHECKING**: Connection test in progress
- 🔴 **DISCONNECTED**: Service unavailable or error

### Debug Information
```javascript
// Access debug information
console.log(window.tiniDatabaseIntegration.connections);
console.log(globalThis.TINI_DATABASE_INTEGRATION);

// Manual operations
await tiniDatabaseIntegration.executeQuery('SELECT 1');
await tiniDatabaseIntegration.redisOperation('GET', 'test_key');
```

## ⚙️ Configuration Management

### Environment Updates
```javascript
// Update database configuration
tiniDatabaseIntegration.updateEnvironmentConfig({
    mysql: {
        host: 'new-host',
        port: 3306
    },
    redis: {
        host: 'new-redis-host',
        port: 6379
    }
});
```

### Production Settings
```env
# Production example
NODE_ENV=production
DB_HOST=prod-mysql-server
DB_PASSWORD=YourSecureProductionPassword2025!
REDIS_HOST=prod-redis-server
REDIS_PASSWORD=YourSecureRedisPassword2025!

# Security settings
JWT_SECRET=YourUniqueJWTSecret64CharactersLong
SESSION_SECRET=YourUniqueSessionSecret
MAX_LOGIN_ATTEMPTS=3
SESSION_TIMEOUT=900
```

## 📈 Performance Optimization

### MySQL Optimization
```sql
-- Index optimization
ANALYZE TABLE user_activities;
ANALYZE TABLE admin_activities;
ANALYZE TABLE system_logs;

-- Connection pool settings
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_buffer_pool_size = 256M;
```

### Redis Optimization
```conf
# Memory optimization
maxmemory 256mb
maxmemory-policy allkeys-lru

# Performance tuning
tcp-keepalive 300
timeout 0
```

## 🔒 Security Best Practices

### Password Security
- Use strong, unique passwords (minimum 12 characters)
- Include uppercase, lowercase, numbers, and symbols
- Rotate passwords every 90 days
- Never use default passwords in production

### Network Security
- Use firewall rules to restrict database access
- Enable SSL/TLS for database connections
- Use VPN for remote database access
- Monitor failed connection attempts

### Access Control
- Implement least privilege principle
- Use separate users for different applications
- Regular audit of user permissions
- Monitor admin activities

## 📚 Additional Resources

### Database Management Tools
- **phpMyAdmin**: Web-based MySQL administration
- **Redis Commander**: Web-based Redis management
- **MySQL Workbench**: Desktop MySQL client
- **RedisInsight**: Desktop Redis client

### Monitoring Commands
```bash
# MySQL status
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Queries';
SHOW PROCESSLIST;

# Redis info
INFO memory
INFO clients
INFO stats
```

### Backup and Recovery
```bash
# MySQL backup
mysqldump -u tini_admin_user -p tini_admin_dashboard > backup.sql

# Redis backup
redis-cli -h localhost -p 6379 --rdb dump.rdb

# Docker volumes backup
docker run --rm -v tini_mysql_data:/data -v ${PWD}:/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

---

**🎯 Next Steps**: After database setup, test all connections in the Admin Panel's Database Status section and verify the environment configuration matches your setup.
