# Admin Dashboard Setup & Run Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:\Users\Administrator\đcm
npm install
```

### 2. Start with Docker (Recommended)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f admin-dashboard
```

### 3. Start without Docker
```bash
# Start the admin dashboard server
npm start
```

## 📊 Access Points

- **Admin Dashboard**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000
- **Database**: localhost:3306
- **Redis**: localhost:6379

## 🔐 Default Credentials

- **Username**: admin
- **Password**: admin123

## 🌟 Features

### ✅ Real-time Dashboard
- Live user activity monitoring
- System statistics (CPU, Memory, Network)
- WebSocket-based real-time updates
- Responsive admin interface

### ✅ Docker Integration
- Complete Docker Compose setup
- MySQL database for data persistence
- Redis for session management
- Nginx reverse proxy
- Auto-restart capabilities

### ✅ Admin Functions
- User management and monitoring
- Real-time activity tracking
- System logs and analytics
- JWT-based authentication
- Admin command execution via WebSocket

### ✅ API Endpoints
- `POST /api/login` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/activities` - User activities
- `GET /api/admin/stats` - System statistics
- `POST /api/admin/users/update` - Update user data

## 🔧 Configuration

### Environment Variables
```bash
ADMIN_PORT=3000
JWT_SECRET=admin_dashboard_secret_2025
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin_user
DB_PASSWORD=admin_password
DB_NAME=admin_dashboard
```

### Port Configuration
- **Admin Dashboard**: Port 3000 (Clearly defined)
- **MySQL Database**: Port 3306
- **Redis Cache**: Port 6379
- **Nginx Proxy**: Port 80/443

## 📈 Real-time Data Updates

### WebSocket Events
- `data_update` - Real-time dashboard data
- `user_updated` - User data changes
- `admin_login` - Admin login notifications
- `system_logs` - System activity logs

### Update Intervals
- Dashboard data: Every 5 seconds
- System stats: Every 10 seconds
- User activities: Real-time on action

## 🛠️ Commands

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose build --no-cache

# Scale admin dashboard
docker-compose up -d --scale admin-dashboard=2
```

### Development Commands
```bash
# Start in development mode
npm run dev

# Build Docker images
npm run docker:build

# Start Docker services
npm run docker:up

# Stop Docker services
npm run docker:down
```

## 📱 Dashboard Features

### Live Monitoring
- Real-time user count and status
- System performance metrics
- Network I/O monitoring
- Memory and CPU usage

### User Management
- View active users
- Monitor user activities
- Update user status
- Track login sessions

### Admin Controls
- Execute admin commands via WebSocket
- View system logs
- Real-time activity feed
- User detail management

## 🔒 Security Features

- JWT token authentication
- Secure admin-only endpoints
- Rate limiting protection
- CORS configuration
- Encrypted communications

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    last_login DATETIME,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Activities Table
```sql
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🌐 Integration with Existing System

This admin dashboard integrates seamlessly with your existing GHOST system:

- **Port 3000**: Clear, dedicated admin port
- **No conflicts**: Uses separate port from GHOST system
- **Real-time sync**: Updates login data and activities in real-time
- **Docker ready**: Complete containerization for easy deployment

## 🚀 Access Your Dashboard

1. **Start the system**: `docker-compose up -d`
2. **Open browser**: http://localhost:3000
3. **Login**: admin / admin123
4. **Monitor**: Real-time dashboard with live updates

Your admin dashboard is now running on **Port 3000** with full Docker integration and real-time data updates!
