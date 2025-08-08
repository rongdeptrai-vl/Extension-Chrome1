@echo off
REM Quick Start Script for Admin Dashboard
echo 🚀 Starting Admin Dashboard...
echo.

REM Change to project directory (if needed)
cd /d "%~dp0"

REM Check if port 3001 is in use
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 3001 is already in use! Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 >nul
)

echo 🌐 Starting server on port 3001...
echo 📊 Dashboard: http://localhost:3001
echo 🔐 Login: Use credentials from .env file
echo.
npm start
