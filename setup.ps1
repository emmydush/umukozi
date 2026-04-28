# Umukozi Web App Setup Script (PowerShell)

Write-Host "🚀 Umukozi Web App Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if (-not $?) {
        Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking Node.js: $_" -ForegroundColor Red
}

# Check if in project directory
if (-not (Test-Path "umukozi" -PathType Leaf)) {
    Write-Host "❌ Please navigate to the umukozi project directory first" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error installing dependencies: $_" -ForegroundColor Red
    exit 1
}

# Setup environment
Write-Host "Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    try {
        Copy-Item ".env.example" ".env" -ErrorAction Stop
        Write-Host "✅ Environment configured (.env created)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error configuring environment: $_" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Environment already configured (.env exists)" -ForegroundColor Green
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
try {
    Set-Location backend
    node init_db.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database initialized successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database initialization failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error initializing database: $_" -ForegroundColor Red
    exit 1
}

# Start application
Write-Host "Starting application..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Umukozi is ready!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
Write-Host "2. Click the install icon (⬇) in the address bar to install as PWA" -ForegroundColor Cyan
Write-Host "3. Desktop shortcut will be created automatically" -ForegroundColor Cyan
Write-Host "4. For mobile: Open in mobile browser and tap 'Add to Home Screen'" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Yellow

Write-Host "🌐 Your Progressive Web App is ready for installation!" -ForegroundColor Green
