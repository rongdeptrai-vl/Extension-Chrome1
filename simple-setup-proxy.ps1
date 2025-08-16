# TINI Reverse Proxy Setup - Simple Version
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  TINI REVERSE PROXY SETUP - SIMPLIFIED" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "WARNING: Script should run with Administrator privileges for full functionality" -ForegroundColor Yellow
    Write-Host "Some features may not work without admin rights" -ForegroundColor Yellow
    Write-Host ""
}

# 1. Check if Chocolatey exists
Write-Host "1. CHECKING CHOCOLATEY..." -ForegroundColor Yellow
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "   Chocolatey is installed" -ForegroundColor Green
} else {
    Write-Host "   Chocolatey not found" -ForegroundColor Red
    Write-Host "   Manual installation required:" -ForegroundColor Yellow
    Write-Host "   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor Gray
}

Write-Host ""

# 2. Check if Nginx exists
Write-Host "2. CHECKING NGINX..." -ForegroundColor Yellow
$nginxPath = "C:\tools\nginx"
if (Test-Path "$nginxPath\nginx.exe") {
    Write-Host "   Nginx found at $nginxPath" -ForegroundColor Green
} else {
    Write-Host "   Nginx not found" -ForegroundColor Red
    Write-Host "   Install with: choco install nginx -y" -ForegroundColor Yellow
}

Write-Host ""

# 3. Create configuration directories
Write-Host "3. CREATING DIRECTORIES..." -ForegroundColor Yellow
$configDirs = @(
    "C:\tools\nginx\conf\sites-available",
    "C:\tools\nginx\conf\sites-enabled",
    "C:\tools\nginx\ssl"
)

foreach($dir in $configDirs) {
    if (Test-Path $dir) {
        Write-Host "   Directory exists: $dir" -ForegroundColor Green
    } else {
        try {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "   Created directory: $dir" -ForegroundColor Green
        } catch {
            Write-Host "   Failed to create: $dir" -ForegroundColor Red
        }
    }
}

Write-Host ""

# 4. Copy configuration file
Write-Host "4. COPYING CONFIGURATION..." -ForegroundColor Yellow
$sourceConfig = ".\nginx-reverse-proxy.conf"
$targetConfig = "C:\tools\nginx\conf\sites-available\tini-security.conf"

if (Test-Path $sourceConfig) {
    try {
        Copy-Item $sourceConfig $targetConfig -Force
        Write-Host "   Configuration copied successfully" -ForegroundColor Green
    } catch {
        Write-Host "   Failed to copy configuration: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   Source configuration not found: $sourceConfig" -ForegroundColor Red
}

Write-Host ""

# 5. Update hosts file
Write-Host "5. UPDATING HOSTS FILE..." -ForegroundColor Yellow
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostsEntry = "127.0.0.1    tini-security.local"

try {
    $hostsContent = Get-Content $hostsFile -ErrorAction SilentlyContinue
    if ($hostsContent -notcontains $hostsEntry) {
        Add-Content $hostsFile $hostsEntry
        Write-Host "   Hosts file updated" -ForegroundColor Green
    } else {
        Write-Host "   Hosts entry already exists" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Failed to update hosts file (need admin rights): $_" -ForegroundColor Yellow
}

Write-Host ""

# 6. Show current system status
Write-Host "6. SYSTEM STATUS..." -ForegroundColor Yellow
Write-Host "   Checking running services..." -ForegroundColor Gray

$services = @(
    @{Name="Integration"; Port=8080},
    @{Name="Auth"; Port=3002},
    @{Name="Panel"; Port=55057},
    @{Name="Gateway"; Port=8099},
    @{Name="API"; Port=5001},
    @{Name="Dashboard"; Port=3004}
)

$runningCount = 0
foreach($service in $services) {
    $result = netstat -an | findstr "LISTENING" | findstr ":$($service.Port) "
    if($result) {
        Write-Host "   ✓ $($service.Name) ($($service.Port)) - Running" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "   ✗ $($service.Name) ($($service.Port)) - Not running" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "SETUP SUMMARY" -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Backend Services: $runningCount/6 running" -ForegroundColor $(if($runningCount -eq 6){"Green"}else{"Yellow"})

if (Test-Path "$nginxPath\nginx.exe") {
    Write-Host "Nginx: Available" -ForegroundColor Green
} else {
    Write-Host "Nginx: Not installed" -ForegroundColor Red
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. If Nginx not installed: choco install nginx -y" -ForegroundColor White
Write-Host "2. Start backend services: npm run start:all" -ForegroundColor White  
Write-Host "3. Start reverse proxy: .\manage-proxy.ps1 start" -ForegroundColor White
Write-Host "4. Access via: https://tini-security.local/" -ForegroundColor White
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
