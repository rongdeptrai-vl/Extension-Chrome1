# ===================================================================
# TINI ADMIN PANEL - SQLITE REAL DATA SETUP
# PowerShell Script để khởi chạy admin panel với SQLite
# Author: TINI Security Team
# Version: 1.0
# ===================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TINI ADMIN PANEL - SQLITE SETUP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "[ERROR] Node.js not found in PATH" -ForegroundColor Red
    Write-Host "[INFO] Please install Node.js to run the admin dashboard server" -ForegroundColor Yellow
    Write-Host "[INFO] Alternative: Open admin panel\admin-panel.html directly in browser" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if SQLite is available (optional)
try {
    $sqliteVersion = sqlite3 -version 2>$null
    if ($sqliteVersion) {
        Write-Host "[INFO] SQLite3 available: $sqliteVersion" -ForegroundColor Green
        
        # Create database directory if not exists
        if (-not (Test-Path "admin panel\sqlite-init")) {
            New-Item -ItemType Directory -Path "admin panel\sqlite-init" -Force | Out-Null
            Write-Host "[INFO] Created SQLite directory" -ForegroundColor Yellow
        }
        
        # Initialize database if SQL file exists
        if (Test-Path "admin panel\sqlite-init\init-database.sql") {
            Write-Host "[INFO] Initializing SQLite database with sample data..." -ForegroundColor Yellow
            
            try {
                sqlite3 "admin panel\sqlite-init\tini-database.db" ".read admin panel\sqlite-init\init-database.sql"
                Write-Host "[SUCCESS] SQLite database initialized successfully!" -ForegroundColor Green
                Write-Host "[INFO] Database file: admin panel\sqlite-init\tini-database.db" -ForegroundColor Cyan
                Write-Host "[INFO] Schema: 8 tables, 4 views, sample data loaded" -ForegroundColor Cyan
            } catch {
                Write-Host "[WARNING] Failed to initialize SQLite database: $_" -ForegroundColor Yellow
                Write-Host "[INFO] Admin panel will run in simulation mode" -ForegroundColor Yellow
            }
        }
        
    } else {
        throw "SQLite3 not found"
    }
} catch {
    Write-Host "[WARNING] SQLite3 not found in PATH" -ForegroundColor Yellow
    Write-Host "[INFO] The admin panel will use simulation mode" -ForegroundColor Yellow
    Write-Host "[INFO] For real database, install SQLite3 or use portable version" -ForegroundColor Yellow
}

Write-Host ""

# Check if admin panel files exist
$requiredFiles = @(
    "admin panel\admin-panel.html",
    "admin panel\sqlite-adapter.js", 
    "admin panel\scripts\database-integration.js"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "[✓] $file" -ForegroundColor Green
    } else {
        Write-Host "[✗] $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "[ERROR] Some required files are missing!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[INFO] Starting TINI Admin Panel with SQLite integration..." -ForegroundColor Yellow
Write-Host "[INFO] Admin Panel high ports default: 55055 (fallbacks 55056,55057)" -ForegroundColor Cyan

# Start admin dashboard server
Write-Host "[INFO] Starting admin dashboard server on port 8099..." -ForegroundColor Yellow
Write-Host "[INFO] Access URL: http://localhost:8099" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
try {
    node admin-dashboard-server.js
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to start server: $_" -ForegroundColor Red
    Write-Host "[INFO] Alternative: Open admin panel\admin-panel.html directly in browser" -ForegroundColor Yellow
    pause
    exit 1
}
