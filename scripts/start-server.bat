@echo off
echo 🚀 Starting Admin Dashboard Server (No Docker)...
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
echo 🌐 Starting Admin Dashboard on port 3001...
echo.
echo 📊 Dashboard URL: http://localhost:3001
echo 🔐 Login credentials: admin / admin123
echo.
echo ⏹️ Press Ctrl+C to stop the server
echo.

node admin-dashboard-server.js

pause
