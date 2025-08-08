@echo off
echo ========================================
echo 🚀 ADMIN DASHBOARD DEPLOYMENT SCRIPT
echo ========================================
echo.

echo 📋 Checking system requirements...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found: 
    node --version
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    echo ✅ npm found: 
    npm --version
)

echo.
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo 🔍 Checking port availability...
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 is already in use!
    echo 🔄 Attempting to free port...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo Killing process %%a...
        taskkill /f /pid %%a >nul 2>&1
    )
    echo ✅ Port 3001 freed
) else (
    echo ✅ Port 3001 is available
)

echo.
echo 🌐 Starting Admin Dashboard Server...
echo.
echo 📊 Dashboard URL: http://localhost:3001
echo 🔐 Login credentials: admin / admin123
echo 🔧 API Test: http://localhost:3001/api/test
echo 💾 Health Check: http://localhost:3001/api/health
echo.
echo ⏹️ Press Ctrl+C to stop the server
echo ========================================

npm start
