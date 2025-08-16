Param(
    [int]$TimeoutSec = 5,
    [int]$Port = 8099
)

$ErrorActionPreference = 'SilentlyContinue'

function Test-TcpPort {
    param(
        [string]$Host = '127.0.0.1',
        [int]$Port = 8099,
        [int]$Timeout = 2000
    )
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect($Host, $Port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne($Timeout, $false)
        if (-not $wait) { $client.Close(); return $false }
        $client.EndConnect($iar)
        $client.Close()
        return $true
    } catch { return $false }
}

function Test-HttpQuick {
    param(
        [string]$Url,
        [int]$Timeout = 5
    )
    try {
        $resp = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec $Timeout -UseBasicParsing
        return @{ ok = $true; code = $resp.StatusCode }
    } catch { return @{ ok = $false; code = ($_.Exception.Response.StatusCode.value__ 2>$null) } }
}

Write-Host "=== TINI SERVER CONNECTIVITY TEST ===" -ForegroundColor Yellow
Write-Host "Port: $Port | Timeout: ${TimeoutSec}s" -ForegroundColor DarkGray

$tcp = Test-TcpPort -Host '127.0.0.1' -Port $Port -Timeout ($TimeoutSec*1000)
if ($tcp) {
    Write-Host "[OK] TCP connect to 127.0.0.1:$Port" -ForegroundColor Green
} else {
    Write-Host "[ERR] Cannot connect TCP 127.0.0.1:$Port" -ForegroundColor Red
}

$http = Test-HttpQuick -Url ("http://localhost:$Port/") -Timeout $TimeoutSec
if ($http.ok) {
    Write-Host "[OK] HTTP HEAD http://localhost:$Port/ (HTTP $($http.code))" -ForegroundColor Green
} else {
    Write-Host "[ERR] HTTP http://localhost:$Port/ (code: $($http.code))" -ForegroundColor Red
}

# Health endpoint
$health = Test-HttpQuick -Url ("http://localhost:$Port/api/health") -Timeout $TimeoutSec
if ($health.ok) {
    Write-Host "[OK] /api/health (HTTP $($health.code))" -ForegroundColor Green
} else {
    Write-Host "[WARN] /api/health not reachable (code: $($health.code))" -ForegroundColor Yellow
}

if ($tcp -and $http.ok) { exit 0 } else { exit 1 }
