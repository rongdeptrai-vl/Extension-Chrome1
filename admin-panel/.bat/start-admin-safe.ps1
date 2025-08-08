Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TINI ADMIN PANEL - SAFE START" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Admin Panel on port 8080..." -ForegroundColor Green
Write-Host "URL: http://localhost:8080/admin-panel.html" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Using Node.js HTTP server..." -ForegroundColor Green
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Gray
        
        # Start the Node.js server
        node server.js
    }
} catch {
    Write-Host "Node.js not found, trying Python..." -ForegroundColor Yellow
    
    # Try Python
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            Write-Host "Using Python HTTP server..." -ForegroundColor Green
            Write-Host "Python version: $pythonVersion" -ForegroundColor Gray
            python -m http.server 8080
        }
    } catch {
        try {
            $pyVersion = py --version 2>$null
            if ($pyVersion) {
                Write-Host "Using Python (py) HTTP server..." -ForegroundColor Green
                Write-Host "Python version: $pyVersion" -ForegroundColor Gray
                py -m http.server 8080
            }
        } catch {
            Write-Host ""
            Write-Host "ERROR: Neither Node.js nor Python found!" -ForegroundColor Red
            Write-Host "Please install Node.js or Python to run the admin panel." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Download Node.js: https://nodejs.org/" -ForegroundColor Blue
            Write-Host "Download Python: https://python.org/" -ForegroundColor Blue
            Write-Host ""
            Read-Host "Press Enter to exit..."
            exit 1
        }
    }
}

Read-Host "Press Enter to exit..."
