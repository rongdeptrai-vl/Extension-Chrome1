# TINI System Analysis Script
param(
    [switch]$AnalyzeOnly
)

Write-Host "TINI System Analysis" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# Check Node.js processes
$NodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($NodeProcesses) {
    $TotalMemory = ($NodeProcesses | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB
    Write-Host "Node.js Processes: $($NodeProcesses.Count)" -ForegroundColor Yellow
    Write-Host "Total Memory Usage: $([math]::Round($TotalMemory, 2)) MB" -ForegroundColor Yellow
} else {
    Write-Host "No Node.js processes running" -ForegroundColor Red
}

# Check database files
$MainDB = "admin-panel\tini_admin.db"
$ApiDB = "admin-panel\sqlite-init\tini_admin.db"

if (Test-Path $MainDB) {
    $MainSize = (Get-Item $MainDB).Length / 1KB
    Write-Host "Main Database: Found ($([math]::Round($MainSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "Main Database: Not Found" -ForegroundColor Red
}

if (Test-Path $ApiDB) {
    $ApiSize = (Get-Item $ApiDB).Length / 1KB
    Write-Host "API Database: Found ($([math]::Round($ApiSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "API Database: Not Found" -ForegroundColor Red
}

# Check JavaScript files
$JSFiles = Get-ChildItem -Path "." -Recurse -Include "*.js" -ErrorAction SilentlyContinue
Write-Host "JavaScript Files: $($JSFiles.Count)" -ForegroundColor Yellow

# Check running ports
Write-Host "`nChecking server ports..." -ForegroundColor Cyan
$Ports = @(55057, 55058, 8099, 5001, 3004, 3005, 6906)
foreach ($Port in $Ports) {
    $Connection = netstat -an | findstr ":$Port "
    if ($Connection) {
        Write-Host "Port $Port : Running" -ForegroundColor Green
    } else {
        Write-Host "Port $Port : Not Active" -ForegroundColor Red
    }
}

Write-Host "`nAnalysis Complete!" -ForegroundColor Cyan
