# PM2 TINI System Manager - Deploy All 6 Servers
Write-Host "TINI ULTIMATE SECURITY - PM2 DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor White

# Check PM2
if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: PM2 not installed!" -ForegroundColor Red
    Write-Host "Install: npm install -g pm2" -ForegroundColor Yellow
    exit 1
}

# Clean up
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
pm2 kill
taskkill /f /im node.exe 2>$null

# Start MySQL
Write-Host "Starting MySQL Database..." -ForegroundColor Magenta
try {
    net start mysql80 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MySQL started successfully" -ForegroundColor Green
    } else {
        Write-Host "MySQL already running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "MySQL service not found" -ForegroundColor Yellow
}

# Start PM2 ecosystem
Write-Host "Starting Node.js servers with PM2..." -ForegroundColor Green
pm2 start ecosystem.config.js --env production

Start-Sleep -Seconds 3
pm2 status

# Test connections
Write-Host "Testing server connections..." -ForegroundColor Yellow
$runningCount = 0

# Test Panel Server
try {
    Invoke-WebRequest -Uri "http://localhost:55057" -Method GET -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "Panel Server (55057) - OK" -ForegroundColor Green
    $runningCount++
} catch {
    Write-Host "Panel Server (55057) - FAILED" -ForegroundColor Red
}

# Test Gateway Server  
try {
    Invoke-WebRequest -Uri "http://localhost:8099" -Method GET -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "Gateway Server (8099) - OK" -ForegroundColor Green
    $runningCount++
} catch {
    Write-Host "Gateway Server (8099) - FAILED" -ForegroundColor Red
}

# Test API Server
try {
    Invoke-WebRequest -Uri "http://localhost:5001" -Method GET -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "API Server (5001) - OK" -ForegroundColor Green
    $runningCount++
} catch {
    Write-Host "API Server (5001) - FAILED" -ForegroundColor Red
}

# Test Dashboard Server
try {
    Invoke-WebRequest -Uri "http://localhost:3004" -Method GET -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "Dashboard Server (3004) - OK" -ForegroundColor Green
    $runningCount++
} catch {
    Write-Host "Dashboard Server (3004) - FAILED" -ForegroundColor Red
}

# Test Security Server
try {
    Invoke-WebRequest -Uri "http://localhost:6906" -Method GET -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "Security Server (6906) - OK" -ForegroundColor Green
    $runningCount++
} catch {
    Write-Host "Security Server (6906) - FAILED" -ForegroundColor Red
}

# Test Master Security
try {
    Invoke-WebRequest -Uri "http://localhost:9999/api/security/health" -Method GET -TimeoutSec 3 -ErrorAction Stop | Out-Null
    Write-Host "Master Security (9999) - OK" -ForegroundColor Green
    $runningCount++
} catch {
    Write-Host "Master Security (9999) - FAILED" -ForegroundColor Red
}

# Test MySQL
try {
    $mysqlTest = Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet
    if ($mysqlTest) {
        Write-Host "MySQL Database (3306) - OK" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "MySQL Database (3306) - FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "MySQL Database (3306) - FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "DEPLOYMENT SUMMARY:" -ForegroundColor Magenta
Write-Host "Servers running: $runningCount/7" -ForegroundColor $(if($runningCount -ge 5){"Green"}else{"Red"})

if ($runningCount -ge 6) {
    Write-Host "SUCCESS: System deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Some servers failed to start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "ACCESS POINTS:" -ForegroundColor Cyan
Write-Host "1. Admin Panel: http://localhost:55055/admin-panel.html" -ForegroundColor White
Write-Host "2. Gateway: http://localhost:8099" -ForegroundColor White  
Write-Host "3. API: http://localhost:5001" -ForegroundColor White
Write-Host "4. Dashboard: http://localhost:3004" -ForegroundColor White
Write-Host "5. Security: http://localhost:6906" -ForegroundColor White
Write-Host "6. Master Security: http://localhost:9999" -ForegroundColor White
Write-Host "7. MySQL: mysql://localhost:3306" -ForegroundColor White

Write-Host ""
Write-Host "PM2 COMMANDS:" -ForegroundColor Cyan
Write-Host "Monitor: pm2 monit" -ForegroundColor Yellow
Write-Host "Restart: pm2 restart all" -ForegroundColor Yellow
Write-Host "Stop: pm2 stop all" -ForegroundColor Yellow
