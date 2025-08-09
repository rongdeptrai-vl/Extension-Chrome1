# TINI Windows Service Installer
# Run as Administrator

param(
    [ValidateSet("install", "uninstall", "start", "stop", "restart")]
    [string]$Action = "install"
)

$ServiceName = "TINI-AdminPanel"
$ServiceDisplayName = "TINI Admin Panel Server"
$ServiceDescription = "TINI Ultimate Security Admin Panel Server"
$ExePath = "node.exe"
$WorkingDirectory = "c:\Users\Administrator\đcm"
$Arguments = "admin-panel/server.js"

function Install-Service {
    Write-Host "Installing TINI Admin Panel as Windows Service..." -ForegroundColor Green
    
    # Using NSSM (Non-Sucking Service Manager) - you need to download it first
    $nssmPath = "$WorkingDirectory\tools\nssm.exe"
    
    if (!(Test-Path $nssmPath)) {
        Write-Host "NSSM not found. Please download NSSM and place nssm.exe in tools folder" -ForegroundColor Red
        Write-Host "Download from: https://nssm.cc/download" -ForegroundColor Yellow
        return
    }
    
    & $nssmPath install $ServiceName $ExePath
    & $nssmPath set $ServiceName AppDirectory $WorkingDirectory
    & $nssmPath set $ServiceName AppParameters $Arguments
    & $nssmPath set $ServiceName DisplayName $ServiceDisplayName
    & $nssmPath set $ServiceName Description $ServiceDescription
    & $nssmPath set $ServiceName Start SERVICE_AUTO_START
    
    # Set environment variables
    & $nssmPath set $ServiceName AppEnvironmentExtra PORT=3000 NODE_ENV=production
    
    Write-Host "Service installed successfully!" -ForegroundColor Green
    Write-Host "Use 'Start-Service $ServiceName' to start the service" -ForegroundColor Yellow
}

function Uninstall-Service {
    Write-Host "Uninstalling TINI Admin Panel Service..." -ForegroundColor Yellow
    
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    
    $nssmPath = "$WorkingDirectory\tools\nssm.exe"
    if (Test-Path $nssmPath) {
        & $nssmPath remove $ServiceName confirm
    } else {
        # Fallback using sc command
        sc.exe delete $ServiceName
    }
    
    Write-Host "Service uninstalled successfully!" -ForegroundColor Green
}

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

switch ($Action) {
    "install" { Install-Service }
    "uninstall" { Uninstall-Service }
    "start" { Start-Service -Name $ServiceName }
    "stop" { Stop-Service -Name $ServiceName -Force }
    "restart" { 
        Stop-Service -Name $ServiceName -Force
        Start-Service -Name $ServiceName 
    }
}
