@echo off
setlocal enabledelayedexpansion

title TINI Server Manager
color 0A

:menu
cls
echo ========================================
echo      TINI ADMIN PANEL - SERVER MANAGER
echo ========================================
echo.
echo [1] Start Server
echo [2] Stop Server  
echo [3] Restart Server
echo [4] Check Server Status
echo [5] View Server Logs
echo [6] Exit
echo.
set /p choice="Please select an option (1-6): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto stop_server
if "%choice%"=="3" goto restart_server
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto view_logs
if "%choice%"=="6" goto exit
goto menu

:start_server
echo.
echo Starting TINI Admin Panel Server...
cd /d "c:\Users\Administrator\đcm"
set PORT=3000
set NODE_ENV=production
start "TINI Server" cmd /k "node admin-panel/server.js"
echo Server started in new window!
pause
goto menu

:stop_server
echo.
echo Stopping TINI Admin Panel Server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq TINI Server*" 2>nul
if !errorlevel! equ 0 (
    echo Server stopped successfully!
) else (
    echo No running server found or failed to stop.
)
pause
goto menu

:restart_server
echo.
echo Restarting TINI Admin Panel Server...
call :stop_server
timeout /t 2 /nobreak >nul
call :start_server
goto menu

:check_status
echo.
echo Checking server status...
netstat -ano | findstr :3000
if !errorlevel! equ 0 (
    echo Server is running on port 3000
) else (
    echo Server is not running
)
echo.
tasklist | findstr node.exe
pause
goto menu

:view_logs
echo.
echo Opening log directory...
if exist "c:\Users\Administrator\đcm\logs" (
    explorer "c:\Users\Administrator\đcm\logs"
) else (
    echo No logs directory found.
)
pause
goto menu

:exit
echo.
echo Goodbye!
timeout /t 1 /nobreak >nul
exit
