# TINI PATH VERIFICATION SCRIPT
Write-Host "TINI ULTIMATE SECURITY - PATH VERIFICATION" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check PM2 status
Write-Host "PM2 Server Status:" -ForegroundColor Yellow
pm2 list

# Test server connectivity
Write-Host "Server Connectivity Test:" -ForegroundColor Yellow

$servers = @(
    @{name="Panel Server"; port=55055},
    @{name="Gateway Server"; port=8099},
    @{name="API Server"; port=5001},
    @{name="Dashboard Server"; port=3004},
    @{name="Security Server"; port=6906},
    @{name="Master Security"; port=9999}
)

foreach($server in $servers) {
    try {
        $url = "http://localhost:$($server.port)"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 3 -UseBasicParsing
        Write-Host "OK: $($server.name) (Port $($server.port)): HTTP $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: $($server.name) (Port $($server.port)): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check configuration files
Write-Host "Configuration Files:" -ForegroundColor Yellow

$configFiles = @("ecosystem.config.js", "manifest.json", ".env", "core/config.json")

foreach($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "OK: $file exists" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $file missing" -ForegroundColor Red
    }
}

Write-Host "Path verification completed!" -ForegroundColor Green
