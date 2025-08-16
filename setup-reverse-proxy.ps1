# TINI Reverse Proxy Setup Script for Windows
# Triển khai Single Entry Point cho 6 services

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  TINI REVERSE PROXY SETUP - WINDOWS EDITION" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra quyền admin
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Script cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host "Nhấn chuột phải PowerShell và chọn 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# 1. Cài đặt Chocolatey (nếu chưa có)
Write-Host "🍫 CHECKING CHOCOLATEY..." -ForegroundColor Yellow
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "✅ Chocolatey đã được cài đặt" -ForegroundColor Green
} else {
    Write-Host "📦 Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "✅ Chocolatey installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Chocolatey" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 2. Cài đặt Nginx
Write-Host "🌐 INSTALLING NGINX..." -ForegroundColor Yellow
try {
    choco install nginx -y
    Write-Host "✅ Nginx installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Nginx: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Tạo thư mục cấu hình
$nginxPath = "C:\tools\nginx"
$configPath = "$nginxPath\conf"
$sitesPath = "$configPath\sites-available"
$sitesEnabled = "$configPath\sites-enabled"

Write-Host "📁 CREATING CONFIGURATION DIRECTORIES..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $sitesPath -Force | Out-Null
New-Item -ItemType Directory -Path $sitesEnabled -Force | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green

# 4. Copy cấu hình reverse proxy
Write-Host "⚙️ CONFIGURING REVERSE PROXY..." -ForegroundColor Yellow
$sourceConfig = ".\nginx-reverse-proxy.conf"
$targetConfig = "$sitesPath\tini-security.conf"

if (Test-Path $sourceConfig) {
    Copy-Item $sourceConfig $targetConfig -Force
    Write-Host "✅ Reverse proxy config copied" -ForegroundColor Green
} else {
    Write-Host "❌ nginx-reverse-proxy.conf not found!" -ForegroundColor Red
    exit 1
}

# 5. Tạo symbolic link
$linkPath = "$sitesEnabled\tini-security.conf"
if (Test-Path $linkPath) {
    Remove-Item $linkPath -Force
}
New-Item -ItemType SymbolicLink -Path $linkPath -Target $targetConfig | Out-Null
Write-Host "✅ Site enabled" -ForegroundColor Green

# 6. Cập nhật nginx.conf chính
$mainConfig = "$configPath\nginx.conf"
$backupConfig = "$configPath\nginx.conf.backup"

Write-Host "📝 UPDATING MAIN NGINX CONFIG..." -ForegroundColor Yellow

# Backup config cũ
Copy-Item $mainConfig $backupConfig -Force

# Tạo config mới
$nginxMainConfig = @"
worker_processes auto;
error_log logs/error.log;
pid logs/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log logs/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security settings
    server_tokens off;
    
    # Include site configurations
    include sites-enabled/*;
}
"@

Set-Content -Path $mainConfig -Value $nginxMainConfig -Encoding UTF8
Write-Host "✅ Main config updated" -ForegroundColor Green

Write-Host ""

# 7. Tạo SSL certificates (self-signed for testing)
Write-Host "🔐 CREATING SSL CERTIFICATES..." -ForegroundColor Yellow
$sslPath = "$nginxPath\ssl"
New-Item -ItemType Directory -Path $sslPath -Force | Out-Null

# Sử dụng OpenSSL (nếu có) hoặc tạo placeholder
try {
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$sslPath\tini-security.key" -out "$sslPath\tini-security.crt" -subj "/C=VN/ST=HCM/L=HCM/O=TINI/OU=Security/CN=tini-security.local"
        Write-Host "✅ SSL certificates created with OpenSSL" -ForegroundColor Green
    } else {
        # Tạo placeholder certificates
        "# Self-signed certificate placeholder" | Out-File "$sslPath\tini-security.crt" -Encoding UTF8
        "# Private key placeholder" | Out-File "$sslPath\tini-security.key" -Encoding UTF8
        Write-Host "⚠️ SSL placeholder created. Install OpenSSL for real certificates" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ SSL setup incomplete: $_" -ForegroundColor Yellow
}

Write-Host ""

# 8. Cập nhật hosts file
Write-Host "🌍 UPDATING HOSTS FILE..." -ForegroundColor Yellow
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostsEntry = "127.0.0.1    tini-security.local"

$hostsContent = Get-Content $hostsFile
if ($hostsContent -notcontains $hostsEntry) {
    Add-Content $hostsFile $hostsEntry
    Write-Host "✅ Hosts file updated" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Hosts entry already exists" -ForegroundColor Gray
}

Write-Host ""

# 9. Test cấu hình
Write-Host "🧪 TESTING NGINX CONFIGURATION..." -ForegroundColor Yellow
try {
    & "$nginxPath\nginx.exe" -t -c "$configPath\nginx.conf"
    Write-Host "✅ Nginx configuration is valid" -ForegroundColor Green
} catch {
    Write-Host "❌ Nginx configuration test failed: $_" -ForegroundColor Red
    Write-Host "Check the configuration file at: $targetConfig" -ForegroundColor Yellow
}

Write-Host ""

# 10. Hướng dẫn khởi động
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🚀 REVERSE PROXY SETUP COMPLETED!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor White
Write-Host ""
Write-Host "1. Start all TINI services:" -ForegroundColor Yellow
Write-Host "   npm run start:all" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Nginx:" -ForegroundColor Yellow
Write-Host "   cd C:\tools\nginx" -ForegroundColor White
Write-Host "   .\nginx.exe" -ForegroundColor White
Write-Host ""
Write-Host "3. Access services through single entry point:" -ForegroundColor Yellow
Write-Host "   🌐 Main Hub:      https://tini-security.local/" -ForegroundColor Green
Write-Host "   🔐 Auth:         https://tini-security.local/auth/" -ForegroundColor Green
Write-Host "   🎛️ Admin Panel:  https://tini-security.local/admin/" -ForegroundColor Green
Write-Host "   🌉 Gateway:      https://tini-security.local/gateway/" -ForegroundColor Green
Write-Host "   🔧 API:          https://tini-security.local/api/" -ForegroundColor Green
Write-Host "   📊 Dashboard:    https://tini-security.local/dashboard/" -ForegroundColor Green
Write-Host ""
Write-Host "4. Control Nginx:" -ForegroundColor Yellow
Write-Host "   Stop:   .\nginx.exe -s stop" -ForegroundColor White
Write-Host "   Reload: .\nginx.exe -s reload" -ForegroundColor White
Write-Host "   Test:   .\nginx.exe -t" -ForegroundColor White
Write-Host ""
Write-Host "🛡️ SECURITY BENEFITS:" -ForegroundColor Red
Write-Host "✅ Single entry point (Port 443 only)" -ForegroundColor Green
Write-Host "✅ SSL/TLS termination" -ForegroundColor Green
Write-Host "✅ Rate limiting protection" -ForegroundColor Green
Write-Host "✅ IP whitelisting for admin areas" -ForegroundColor Green
Write-Host "✅ Security headers" -ForegroundColor Green
Write-Host "✅ Attack pattern blocking" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ NOTE: For production, replace self-signed certificates with valid SSL certificates" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
