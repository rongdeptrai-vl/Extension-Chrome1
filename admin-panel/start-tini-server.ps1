# TINI Admin Panel Auto Startup Script
# © 2025 TINI COMPANY

param(
    [switch]$Hidden,
    [string]$LogPath = "c:\Users\Administrator\đcm\logs\server-startup.log"
)

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    if (!(Test-Path (Split-Path $LogPath))) {
        New-Item -ItemType Directory -Path (Split-Path $LogPath) -Force | Out-Null
    }
    Add-Content -Path $LogPath -Value $logMessage
}

Write-Log "=== TINI Admin Panel Startup Script ==="
Write-Log "Starting TINI Admin Panel Server..."

try {
    # Change to project directory
    Set-Location "c:\Users\Administrator\đcm"
    Write-Log "Changed directory to: $(Get-Location)"
    
    # Set environment variables
    $env:PORT = "3000"
    $env:NODE_ENV = "production"
    Write-Log "Environment variables set: PORT=3000, NODE_ENV=production"
    
    # Check if Node.js is available
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "Node.js version: $nodeVersion"
    } else {
        Write-Log "ERROR: Node.js not found in PATH"
        exit 1
    }
    
    # Start the server
    Write-Log "Starting server with command: node admin-panel/server.js"
    
    if ($Hidden) {
        Start-Process -FilePath "node" -ArgumentList "admin-panel/server.js" -WindowStyle Hidden
        Write-Log "Server started in hidden mode"
    } else {
        node admin-panel/server.js
    }
    
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    Write-Log "Script failed to start server"
    exit 1
}
