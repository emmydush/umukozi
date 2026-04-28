@echo off
echo ====================================
echo    Umukozi Web App Installer
echo ====================================
echo.

echo Checking prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: %node_version%

echo.
echo Installing dependencies...
cd /d "%~dp0" && cd umukozi
if exist package.json (
    echo Found package.json, installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ❌ package.json not found
    pause
    exit /b 1
)

echo.
echo Setting up environment...
if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
    echo ✅ Environment configured
) else (
    echo ✅ .env already exists
)

echo.
echo Initializing database...
cd backend && node init_db.js
if %errorlevel% neq 0 (
    echo ❌ Database initialization failed
    pause
    exit /b 1
)

echo.
echo Starting application...
echo.
echo 🚀 Umukozi is ready!
echo.
echo Application will be available at: http://localhost:8000
echo Backend API at: http://localhost:3001
echo.
echo To install as PWA on desktop:
echo   1. Open http://localhost:8000 in your browser
echo   2. Click the install icon (⬇) in the address bar
echo   3. Desktop shortcut will be created
echo.
echo To install on mobile:
echo   1. Open http://localhost:8000 in mobile browser
echo   2. Tap "Add to Home Screen" from browser menu
echo.
pause
