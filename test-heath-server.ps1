Param(
    [string]$Url = 'http://localhost:8099/api/health',
    [int]$TimeoutSec = 5
)

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "=== TINI HEALTH TEST ===" -ForegroundColor Yellow
Write-Host "URL: $Url | Timeout: ${TimeoutSec}s" -ForegroundColor DarkGray

try {
    $resp = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSec -UseBasicParsing
    Write-Host "[OK] HTTP $($resp.StatusCode)" -ForegroundColor Green
    if ($resp.Content) {
        try {
            $json = $resp.Content | ConvertFrom-Json
            if ($json) {
                Write-Host "--- JSON ---" -ForegroundColor DarkGray
                $json | ConvertTo-Json -Depth 6
            } else { Write-Host $resp.Content }
        } catch { Write-Host $resp.Content }
    }
    exit 0
}
catch {
    $code = $_.Exception.Response.StatusCode.value__ 2>$null
    Write-Host "[ERR] Request failed (code: $code)" -ForegroundColor Red
    exit 1
}
