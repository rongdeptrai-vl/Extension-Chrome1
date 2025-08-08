@echo off
echo 🚀 Starting Admin Dashboard Server (Fixed Version)...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if port 3001 is available
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 is already in use, trying port 3002...
    set ADMIN_PORT=3002
) else (
    set ADMIN_PORT=3001
)

REM Check if npm packages are installed
if not exist "node_modules" (
    echo 📦 Installing npm packages...
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
    
    echo ✅ Dependencies installed successfully!
)

REM Create public directory if not exists
if not exist "public" mkdir public

REM Start the server
echo 🌐 Starting Admin Dashboard on port %ADMIN_PORT%...
echo.
echo 📊 Dashboard URL: http://localhost:%ADMIN_PORT%
echo 🔐 Login credentials: admin / admin123
echo.
echo ⏹️ Press Ctrl+C to stop the server
echo.

set ADMIN_PORT=%ADMIN_PORT%
node admin-dashboard-server.js

pause
