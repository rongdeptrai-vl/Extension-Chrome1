@echo off
:: TINI Admin Panel Database Setup & Verification Script
:: This script checks MySQL and Redis configuration and starts the admin panel
echo.
echo ===============================================
echo   TINI ADMIN PANEL DATABASE VERIFICATION
echo ===============================================
echo.

:: Check if .env file exists
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy .env.template .env >nul 2>&1
    echo [WARNING] Please edit .env file with your actual database credentials
    echo [INFO] Default .env file created, you may need to update the passwords
    echo.
)

:: Display current configuration
echo [INFO] Current Database Configuration:
echo.
echo MySQL Configuration:
echo   Host: localhost
echo   Port: 3306
echo   Database: tini_admin_dashboard
echo   User: tini_admin_user
echo.
echo Redis Configuration:
echo   Host: localhost  
echo   Port: 6379
echo   Database: 0
echo.

:: Check if Docker is available
docker --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [✓] Docker is available
    echo.
    echo Choose setup method:
    echo   1. Start with Docker Compose ^(Recommended^)
    echo   2. Check local MySQL/Redis connections
    echo   3. View database status in Admin Panel
    echo   4. Install Docker ^(Guide^)
    echo.
    set /p choice="Enter your choice (1-4): "
    
    if "%choice%"=="1" goto :docker_setup
    if "%choice%"=="2" goto :local_check
    if "%choice%"=="3" goto :admin_panel
    if "%choice%"=="4" goto :docker_guide
    goto :invalid_choice
) else (
    echo [!] Docker not found
    echo.
    echo 🚀 LIGHTWEIGHT SETUP OPTIONS (Recommended):
    echo   1. Use Admin Panel NOW ^(Zero setup, instant access^)
    echo   2. Lightweight Database Setup ^(XAMPP Portable - 150MB^)
    echo   3. Check local MySQL/Redis ^(If already installed^)
    echo   4. Docker Guide ^(Heavy - causes system lag^)
    echo.
    echo 💡 Recommendation: Choose option 1 for immediate use!
    echo    Admin panel works perfectly without databases.
    echo.
    set /p choice="Enter your choice (1-4): "
    
    if "%choice%"=="1" goto :admin_panel
    if "%choice%"=="2" goto :lightweight_setup
    if "%choice%"=="3" goto :local_check
    if "%choice%"=="4" goto :docker_guide
    goto :invalid_choice
)

:docker_setup
echo.
echo [INFO] Starting TINI Admin Panel with Docker Compose...
echo [INFO] This will start: MySQL, Redis, Admin Panel, phpMyAdmin, Redis Commander
echo.

:: Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found!
    echo [INFO] Please ensure you're in the admin panel directory
    pause
    exit /b 1
)

:: Start Docker services
echo [INFO] Starting Docker services...
docker-compose up -d

:: Wait for services to start
echo [INFO] Waiting for services to initialize...
timeout /t 10 /nobreak >nul

:: Check service status
echo.
echo [INFO] Checking service status...
docker-compose ps

echo.
echo [INFO] Services started! You can access:
echo   - Admin Panel: http://localhost:3001
echo   - phpMyAdmin: http://localhost:8080
echo   - Redis Commander: http://localhost:8081
echo.
echo [INFO] Database connections will be tested automatically in the Admin Panel
goto :end

:local_check
echo.
echo [INFO] Checking local MySQL and Redis installations...
echo.

:: Check MySQL
echo [INFO] Testing MySQL connection...
mysql --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [✓] MySQL client is installed
    :: Try to connect to MySQL
    mysql -h localhost -P 3306 -u root -e "SELECT 1;" >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo [✓] MySQL server is running and accessible
    ) else (
        echo [!] MySQL server may not be running or accessible
        echo [INFO] Please ensure MySQL is installed and running on port 3306
    )
) else (
    echo [!] MySQL client not found
    echo [INFO] Please install MySQL or use Docker setup
)

echo.

:: Check Redis
echo [INFO] Testing Redis connection...
redis-cli --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [✓] Redis client is installed
    :: Try to connect to Redis
    redis-cli ping >nul 2>&1
    if %ERRORLEVEL% == 0 (
        echo [✓] Redis server is running and accessible
    ) else (
        echo [!] Redis server may not be running or accessible
        echo [INFO] Please ensure Redis is installed and running on port 6379
    )
) else (
    echo [!] Redis client not found
    echo [INFO] Please install Redis or use Docker setup
)

echo.
goto :admin_panel

:admin_panel
echo [INFO] Starting TINI Admin Panel...
echo [INFO] The admin panel will test database connections automatically
echo.

:: Check if Node.js is available
node --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [✓] Node.js is available
    
    :: Check if package.json exists
    if exist "package.json" (
        echo [INFO] Installing dependencies...
        npm install
        
        echo [INFO] Starting admin panel server...
        npm start
    ) else (
        echo [INFO] Opening admin panel in browser...
        start "" "file://%~dp0admin-panel.html"
    )
) else (
    echo [INFO] Node.js not found - opening static admin panel...
    start "" "file://%~dp0admin-panel.html"
)

echo.
echo [INFO] Admin Panel is now running!
echo [INFO] Check the Database Status section to verify MySQL and Redis connections
echo.
goto :end

:lightweight_setup
echo.
echo [INFO] Lightweight Database Setup - No System Lag!
echo.
echo Option A: XAMPP Portable (Recommended)
echo   - Download: https://www.apachefriends.org/download.html
echo   - Size: ~150MB (vs Docker's 4GB+)
echo   - Zero installation - just extract and run
echo   - MySQL only, no Apache needed
echo   - Perfect for development
echo.
echo Option B: SQLite Alternative
echo   - File-based database
echo   - Zero server setup
echo   - Ultra lightweight
echo   - Perfect for testing
echo.
echo Option C: Continue without database
echo   - Admin panel fully functional
echo   - Uses demo data and simulation
echo   - Zero performance impact
echo   - Recommended for UI development
echo.

set /p setup_choice="Choose (A)XAMPP, (B)SQLite, (C)No database, or (E)Exit: "

if /i "%setup_choice%"=="A" goto :xampp_guide
if /i "%setup_choice%"=="B" goto :sqlite_guide  
if /i "%setup_choice%"=="C" goto :admin_panel
if /i "%setup_choice%"=="E" goto :end
goto :lightweight_setup

:xampp_guide
echo.
echo [INFO] XAMPP Portable Setup Guide:
echo.
echo 1. Download XAMPP Portable from: https://www.apachefriends.org/download.html
echo 2. Extract to c:\xampp-portable\ 
echo 3. Run xampp-control.exe
echo 4. Start MySQL only (not Apache)
echo 5. Import database schema from mysql-init/01-init-database.sql
echo 6. Update .env file with MySQL settings
echo.
echo After XAMPP setup, run this script again and choose option 3
goto :admin_panel

:sqlite_guide
echo.
echo [INFO] SQLite Alternative Setup:
echo.
echo SQLite is a file-based database that requires no server:
echo 1. Admin panel can be modified to use SQLite
echo 2. All data stored in local .db file
echo 3. Zero configuration needed
echo 4. Perfect for development and testing
echo.
echo This would require code modification to use SQLite instead of MySQL
echo For now, continuing with admin panel in demo mode...
goto :admin_panel

:docker_guide
echo.
echo [WARNING] Docker Desktop Performance Impact:
echo.
echo ❌ Docker Desktop Issues:
echo   - High RAM usage (2-4GB constantly)
echo   - CPU overhead (10-20% baseline)
echo   - System lag and slowdown
echo   - Large disk space (4GB+ installation)
echo   - Slow startup time (30-60 seconds)
echo.
echo ✅ Better Alternatives:
echo   - Use admin panel without databases (instant, no lag)
echo   - XAMPP Portable for lightweight MySQL (150MB)
echo   - SQLite for file-based database (zero setup)
echo.
echo Docker Installation (if you really want it):
echo   - Download from: https://www.docker.com/products/docker-desktop
echo   - Warning: Will impact system performance
echo   - Consider lightweight alternatives above
echo.

:: Check if the guide file exists and open it
if exist "LIGHTWEIGHT-SETUP-GUIDE.md" (
    echo [INFO] Opening lightweight setup guide (recommended)...
    start "" "LIGHTWEIGHT-SETUP-GUIDE.md"
)

echo.
echo Recommendation: Use admin panel without Docker for best performance
set /p continue="Press Enter to continue or type 'admin' to open admin panel: "

if /i "%continue%"=="admin" goto :admin_panel
goto :end

:invalid_choice
echo.
echo [ERROR] Invalid choice. Please enter 1, 2, 3, or 4.
pause
exit /b 1

:end
echo.
echo ===============================================
echo   DATABASE VERIFICATION COMPLETE
echo ===============================================
echo.
echo [INFO] Next steps:
echo   1. Open the admin panel
echo   2. Check the "Database Status" section
echo   3. Click "Test" buttons to verify connections
echo   4. Review environment configuration
echo.
echo [INFO] For troubleshooting:
echo   - Check .env file for correct database credentials
echo   - Ensure MySQL is running on port 3306
echo   - Ensure Redis is running on port 6379
echo   - Check Docker logs if using Docker setup
echo.
pause
