@echo off
REM ===================================================================
REM TINI ADMIN PANEL - SQLITE REAL DATA SETUP
REM Thiết lập cơ sở dữ liệu SQLite với dữ liệu thật
REM Author: TINI Security Team
REM Version: 1.0
REM ===================================================================

echo.
echo ========================================
echo   TINI ADMIN PANEL - SQLITE SETUP
echo ========================================
echo.

REM Check if SQLite is available
where sqlite3 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] SQLite3 not found in PATH
    echo [INFO] The admin panel will use simulation mode
    echo [INFO] For real database, install SQLite3 or use portable version
    echo.
    goto :start_panel
)

REM Create SQLite database directory
if not exist "admin panel\sqlite-init" (
    mkdir "admin panel\sqlite-init"
    echo [INFO] Created SQLite directory
)

REM Initialize SQLite database
echo [INFO] Initializing SQLite database with sample data...
sqlite3 "admin panel\sqlite-init\tini-database.db" < "admin panel\sqlite-init\init-database.sql"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] SQLite database initialized successfully!
    echo [INFO] Database file: admin panel\sqlite-init\tini-database.db
    echo [INFO] Schema: 8 tables, 4 views, sample data loaded
) else (
    echo [ERROR] Failed to initialize SQLite database
    echo [INFO] Admin panel will run in simulation mode
)

echo.

:start_panel
REM Update admin panel to use SQLite version
echo [INFO] Starting TINI Admin Panel with SQLite integration...

REM Copy SQLite version of database integration
if exist "admin panel\scripts\database-integration-sqlite.js" (
    copy "admin panel\scripts\database-integration-sqlite.js" "admin panel\scripts\database-integration.js" >nul
    echo [INFO] SQLite database integration activated
)

REM Start admin dashboard server
echo [INFO] Starting admin dashboard server on port 8099...
echo [INFO] Access URL: http://localhost:8099
echo [INFO] Admin Panel high ports default: 55055 (fallbacks 55056,55057)

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found in PATH
    echo [INFO] Please install Node.js to run the admin dashboard server
    echo [INFO] Alternative: Open admin panel\admin dashboarh.html directly in browser
    pause
    exit /b 1
)

REM Start the server
node admin-dashboard-server.js

pause
