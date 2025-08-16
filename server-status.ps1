# TINI Ultimate Security System - Server Status Report
# © 2024 TINI COMPANY - Server Testing & Monitoring

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TINI SERVER STATUS REPORT                  ║" -ForegroundColor Cyan  
Write-Host "║                         $timestamp                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Server definitions
$servers = @(
    @{Name="Panel Server"; Port=55057; Script="admin-panel/server.js"; URL="http://localhost:55057"},
    @{Name="Gateway Server"; Port=8099; Script="scripts/start-gateway.js"; URL="http://localhost:8099"},  
    @{Name="API Server"; Port=5001; Script="core/api-server.js"; URL="http://localhost:5001"},
    @{Name="Dashboard Server"; Port=3004; Script="core/admin-dashboard-server.js"; URL="http://localhost:3004"}
)

Write-Host "`n🔍 PROCESS CHECK:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "✅ Found $($nodeProcs.Count) Node.js processes running" -ForegroundColor Green
    foreach ($proc in $nodeProcs) {
        $memoryMB = [math]::Round($proc.PM/1MB, 2)
        Write-Host "   PID: $($proc.Id) | Memory: ${memoryMB}MB" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ No Node.js processes found" -ForegroundColor Red
}

Write-Host "`n🌐 PORT STATUS:" -ForegroundColor Yellow  
Write-Host "===============" -ForegroundColor Yellow
foreach ($server in $servers) {
    $result = netstat -ano | findstr ":$($server.Port)"
    if ($result) {
        Write-Host "✅ $($server.Name) - Port $($server.Port) LISTENING" -ForegroundColor Green
    } else {
        Write-Host "❌ $($server.Name) - Port $($server.Port) NOT LISTENING" -ForegroundColor Red
    }
}

Write-Host "`n🔗 HTTP CONNECTIVITY:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
foreach ($server in $servers) {
    try {
        $response = Invoke-WebRequest -Uri $server.URL -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ $($server.Name) - HTTP $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   Response Size: $($response.Content.Length) bytes" -ForegroundColor Gray
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "Unable to connect") {
            Write-Host "❌ $($server.Name) - CONNECTION REFUSED" -ForegroundColor Red
        } elseif ($errorMsg -match "timeout") {
            Write-Host "❌ $($server.Name) - TIMEOUT" -ForegroundColor Red  
        } else {
            Write-Host "❌ $($server.Name) - ERROR: $errorMsg" -ForegroundColor Red
        }
    }
}

Write-Host "`n📊 SUMMARY:" -ForegroundColor Magenta
Write-Host "===========" -ForegroundColor Magenta

$runningServers = 0
$totalServers = $servers.Count

foreach ($server in $servers) {
    $result = netstat -ano | findstr ":$($server.Port)"
    if ($result) {
        $runningServers++
        Write-Host "🟢 $($server.Name)" -ForegroundColor Green
    } else {
        Write-Host "🔴 $($server.Name)" -ForegroundColor Red
    }
}

Write-Host "`nServers Running: $runningServers/$totalServers" -ForegroundColor $(if($runningServers -eq $totalServers){"Green"}else{"Yellow"})

if ($runningServers -eq $totalServers) {
    Write-Host "🎉 ALL SERVERS ARE RUNNING SUCCESSFULLY!" -ForegroundColor Green
} elseif ($runningServers -gt 0) {
    Write-Host "⚠️  SOME SERVERS ARE NOT RUNNING" -ForegroundColor Yellow
} else {
    Write-Host "🚨 NO SERVERS ARE RUNNING" -ForegroundColor Red
}

Write-Host "`n💻 ACCESS URLS:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "📱 Admin Panel: http://localhost:55057/admin-panel.html" -ForegroundColor White
Write-Host "🌐 Gateway: http://localhost:8099" -ForegroundColor White  
Write-Host "⚡ API: http://localhost:5001" -ForegroundColor White
Write-Host "📊 Dashboard: http://localhost:3004" -ForegroundColor White

Write-Host "`n⚡ QUICK COMMANDS:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Start all: npm run start:all" -ForegroundColor White
Write-Host "Stop all: taskkill /f /im node.exe" -ForegroundColor White
Write-Host "Check status: powershell -ExecutionPolicy Bypass -File server-status.ps1" -ForegroundColor White
