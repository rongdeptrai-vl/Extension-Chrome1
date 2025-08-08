@echo off
echo 🔨 Building and starting Admin Dashboard with Docker...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running or not installed
    echo Please start Docker Desktop first
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Build the image
echo 🔨 Building admin dashboard image...
docker build -f Dockerfile.admin -t admin-dashboard:latest .

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Stop and remove existing container
echo 🛑 Stopping existing container...
docker stop admin-dashboard-container 2>nul
docker rm admin-dashboard-container 2>nul

REM Run the container
echo 🚀 Starting Admin Dashboard container...
docker run -d ^
    --name admin-dashboard-container ^
    -p 3001:3001 ^
    -e NODE_ENV=production ^
    -e ADMIN_PORT=3001 ^
    -e JWT_SECRET=admin_dashboard_secret_2025 ^
    --restart unless-stopped ^
    admin-dashboard:latest

if %errorlevel% neq 0 (
    echo ❌ Failed to start container
    pause
    exit /b 1
)

echo ✅ Admin Dashboard started successfully!
echo.
echo 📊 Dashboard URL: http://localhost:3001
echo 🔐 Login credentials: admin / admin123
echo.
echo 📋 Container status:
docker ps --filter "name=admin-dashboard-container"
echo.
echo 📝 To view logs: docker logs -f admin-dashboard-container
echo 🛑 To stop: docker stop admin-dashboard-container
echo.
pause
