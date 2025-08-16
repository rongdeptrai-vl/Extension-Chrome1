@echo off
title TINI Admin Panel Server
echo ========================================
echo    TINI ADMIN PANEL - AUTO STARTUP
echo ========================================
echo.

cd /d "c:\Users\Administrator\đcm"
echo Starting TINI Admin Panel Server...
echo.

REM Set environment variables
set PORT=3000
set NODE_ENV=production

REM Start the server
node admin-panel/server.js

echo.
echo Server stopped. Press any key to exit...
pause >nul
