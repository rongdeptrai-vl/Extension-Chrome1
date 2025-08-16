Param(
    [int]$TimeoutSec = 5
)

$ErrorActionPreference = 'SilentlyContinue'

function Write-Result {
    param(
        [string]$Name,
        [string]$Url,
        [bool]$Ok,
        [int]$Ms,
        [string]$Note = ''
    )
    if ($Ok) {
        Write-Host ("[OK]  $Name -> $Url (${Ms}ms) $Note") -ForegroundColor Green
    } else {
        Write-Host ("[ERR] $Name -> $Url ${Note}") -ForegroundColor Red
    }
}

function Test-Http {
    param(
        [string]$Url,
        [int]$Timeout = 5,
        [ValidateSet('GET','HEAD')][string]$Method = 'GET'
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        if ($Method -eq 'HEAD') {
            $resp = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec $Timeout -UseBasicParsing
        } else {
            $resp = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $Timeout -UseBasicParsing
        }
        $sw.Stop()
        return @{ ok = $true; ms = $sw.ElapsedMilliseconds; code = $resp.StatusCode }
    }
    catch {
        $sw.Stop()
        return @{ ok = $false; ms = $sw.ElapsedMilliseconds; code = ($_.Exception.Response.StatusCode.value__ 2>$null) }
    }
}

Write-Host "=== TINI UNIFIED SERVER CHECK ===" -ForegroundColor Yellow
Write-Host "Timeout: ${TimeoutSec}s" -ForegroundColor DarkGray

$fail = 0

# 1) Nginx entry (port 80)
$u1 = 'http://localhost/'
$r1 = Test-Http -Url $u1 -Timeout $TimeoutSec -Method 'GET'
Write-Result -Name 'Nginx / (80)' -Url $u1 -Ok $r1.ok -Ms $r1.ms -Note (if($r1.code){"HTTP $($r1.code)"}else{'no response'})
if(-not $r1.ok){ $fail++ }

# 2) Gateway root (8099)
$u2 = 'http://localhost:8099/'
$r2 = Test-Http -Url $u2 -Timeout $TimeoutSec -Method 'GET'
Write-Result -Name 'Gateway / (8099)' -Url $u2 -Ok $r2.ok -Ms $r2.ms -Note (if($r2.code){"HTTP $($r2.code)"}else{'no response'})
if(-not $r2.ok){ $fail++ }

# 3) Gateway health direct (8099)
$u3 = 'http://localhost:8099/api/health'
$r3 = Test-Http -Url $u3 -Timeout $TimeoutSec -Method 'GET'
Write-Result -Name 'Gateway /api/health (8099)' -Url $u3 -Ok $r3.ok -Ms $r3.ms -Note (if($r3.code){"HTTP $($r3.code)"}else{'no response'})
if(-not $r3.ok){ $fail++ }

# 4) Health via Nginx (80) if routed
$u4 = 'http://localhost/api/health'
$r4 = Test-Http -Url $u4 -Timeout $TimeoutSec -Method 'GET'
Write-Result -Name 'Nginx → /api/health (80→8099)' -Url $u4 -Ok $r4.ok -Ms $r4.ms -Note (if($r4.code){"HTTP $($r4.code)"}else{'no response'})
if(-not $r4.ok){ $fail++ }

# 5) Nginx gateway path
$u5 = 'http://localhost/gateway/'
$r5 = Test-Http -Url $u5 -Timeout $TimeoutSec -Method 'GET'
Write-Result -Name 'Nginx → /gateway/ (80→8099)' -Url $u5 -Ok $r5.ok -Ms $r5.ms -Note (if($r5.code){"HTTP $($r5.code)"}else{'no response'})
if(-not $r5.ok){ $fail++ }

Write-Host "-------------------------------------"
if ($fail -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host ("❌ FAILED CHECKS: $fail") -ForegroundColor Red
    exit 1
}
