# Script kiểm tra và test tất cả server trong dự án TINI
# © 2024 TINI COMPANY - Test Script

Write-Host "🚀 TINI Server Testing Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Danh sách server cần test
$servers = @(
    @{Name="Gateway Server"; Port=8099; Path="/"; Script="scripts/start-gateway.js"},
    @{Name="API Server"; Port=5001; Path="/"; Script="core/api-server.js"},
    @{Name="Dashboard Server"; Port=3004; Path="/"; Script="core/admin-dashboard-server.js"},
    @{Name="Panel Server"; Port=55055; Path="/"; Script="admin-panel/server.js"}
)

Write-Host "`n📊 Checking current running servers..." -ForegroundColor Yellow

# Kiểm tra các port đang mở
foreach ($server in $servers) {
    $port = $server.Port
    $name = $server.Name
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet
        if ($connection) {
            Write-Host "✅ $name (Port $port) - RUNNING" -ForegroundColor Green
            
            # Test HTTP response
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port$($server.Path)" -Method GET -TimeoutSec 10
                Write-Host "   HTTP Status: $($response.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "   HTTP Error: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ $name (Port $port) - NOT RUNNING" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $name (Port $port) - ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Checking Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "📝 Found $($nodeProcesses.Count) Node.js process(es):" -ForegroundColor Green
    foreach ($proc in $nodeProcesses) {
        Write-Host "   PID: $($proc.Id) | Memory: $([math]::Round($proc.PM/1MB, 2))MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ No Node.js processes found" -ForegroundColor Red
}

Write-Host "`n🌐 Detailed port check..." -ForegroundColor Yellow
$portsToCheck = @(8099, 5001, 3004, 55055, 6906, 3306, 6379)
foreach ($port in $portsToCheck) {
    $netstat = netstat -ano | findstr ":$port"
    if ($netstat) {
        Write-Host "✅ Port $port - LISTENING" -ForegroundColor Green
        Write-Host "   $netstat" -ForegroundColor Gray
    } else {
        Write-Host "❌ Port $port - NOT LISTENING" -ForegroundColor Red
    }
}

Write-Host "`n📋 Server Summary:" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta
Write-Host "🟢 Gateway Server: Port 8099" -ForegroundColor White
Write-Host "🟢 API Server: Port 5001" -ForegroundColor White  
Write-Host "🟢 Dashboard Server: Port 3004" -ForegroundColor White
Write-Host "🟢 Panel Server: Port 55055" -ForegroundColor White
Write-Host "🟢 Security Server: Port 6906" -ForegroundColor White

Write-Host "`n💡 Quick Commands:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Start all servers: npm run start:all" -ForegroundColor White
Write-Host "Start gateway: npm run start:gateway" -ForegroundColor White
Write-Host "Start API: npm run start:api" -ForegroundColor White
Write-Host "Start dashboard: npm run start:dashboard" -ForegroundColor White
Write-Host "Start panel: npm run start:panel" -ForegroundColor White
Write-Host "Kill all Node.js: taskkill /f /im node.exe" -ForegroundColor White
