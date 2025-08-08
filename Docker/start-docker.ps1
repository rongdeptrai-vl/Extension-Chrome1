# Simple Docker run script for Admin Dashboard
# Tạo và chạy admin dashboard container

# Build the admin dashboard image
Write-Host "🔨 Building Admin Dashboard Docker image..."
docker build -f Dockerfile.admin -t admin-dashboard:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!"
    
    # Stop existing container if running
    Write-Host "🛑 Stopping existing container..."
    docker stop admin-dashboard-container 2>$null
    docker rm admin-dashboard-container 2>$null
    
    # Run the container
    Write-Host "🚀 Starting Admin Dashboard container..."
    docker run -d `
        --name admin-dashboard-container `
        -p 3000:3000 `
        -e NODE_ENV=production `
        -e ADMIN_PORT=3000 `
        -e JWT_SECRET=admin_dashboard_secret_2025 `
        --restart unless-stopped `
        admin-dashboard:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Admin Dashboard started successfully!"
        Write-Host "📊 Dashboard URL: http://localhost:3000"
        Write-Host "🔐 Login: admin / admin123"
        Write-Host ""
        Write-Host "📋 Container status:"
        docker ps --filter "name=admin-dashboard-container"
        Write-Host ""
        Write-Host "📝 To view logs: docker logs -f admin-dashboard-container"
    } else {
        Write-Host "❌ Failed to start container"
    }
} else {
    Write-Host "❌ Build failed"
}
