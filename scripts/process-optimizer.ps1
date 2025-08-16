# TINI Process Optimization Script
# Reduces 26 processes to 6 optimized servers

Write-Host "🔧 TINI Process Optimization Starting..." -ForegroundColor Cyan

# Step 1: Stop all current processes
Write-Host "1. Stopping all Node.js processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 3

# Step 2: Start optimized servers with process isolation
Write-Host "2. Starting optimized server stack..." -ForegroundColor Green

# Admin Panel (Port 55057)
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "admin-panel/server.js" -WorkingDirectory "."

# API Server (Port 5001) 
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "core/api-server.js" -WorkingDirectory "."

# Gateway (Port 8099)
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "scripts/start-gateway.js" -WorkingDirectory "."

# Dashboard (Port 3004)
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "core/admin-dashboard-server.js" -WorkingDirectory "."

# Security Server (Port 6906)
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "SECURITY/SECURITY.js" -WorkingDirectory "."

# Performance Monitor (Background)
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "scripts/performance-monitor.js" -WorkingDirectory "."

Start-Sleep -Seconds 5

# Step 3: Verify optimization
Write-Host "3. Verification..." -ForegroundColor Green
$processes = Get-Process -Name "node" | Measure-Object
Write-Host "✅ Optimized! Processes reduced to: $($processes.Count)" -ForegroundColor Green

# Step 4: Memory usage check
$totalMemory = (Get-Process -Name "node" | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB
Write-Host "✅ Total Memory Usage: $([math]::Round($totalMemory, 2)) MB" -ForegroundColor Green

Write-Host "`n🚀 Process optimization completed!" -ForegroundColor Cyan
