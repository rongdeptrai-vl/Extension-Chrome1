@echo off
echo ========================================
echo   TINI ADMIN PANEL - SAFE START
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel%==0 (
    echo Starting Node.js server...
    echo URL: http://localhost:8080/admin-panel.html
    echo.
    echo Press Ctrl+C to stop the server
    echo ========================================
    start "" "http://localhost:8080/admin-panel.html"
    node server.js
) else (
    echo Node.js not found. Opening admin panel directly...
    echo.
    echo Note: Some features may not work without a server
    echo For full functionality, install Node.js from https://nodejs.org/
    echo ========================================
    start "" "admin-panel.html"
    pause
)
