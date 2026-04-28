# Umukozi Web App Installation Guide

## Overview
This guide will help you set up the Umukozi web application for local development and deployment as a Progressive Web App (PWA) that can be installed on PC and mobile devices.

## Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Git (optional, for version control)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/umukozi.git
cd umukozi
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:8000

# For production:
# NODE_ENV=production
# CORS_ORIGIN=https://yourdomain.com
```

### 4. Database Setup
```bash
# Navigate to backend directory
cd backend

# Initialize database (SQLite)
node init_db.js

# Or for PostgreSQL (if configured):
# createdb umukozi
# psql -d umukozi -f database/create_sqlite_tables.sql
```

### 5. Start the Application
```bash
# Start backend server
cd backend
npm start

# In a separate terminal, start frontend
# Option 1: Simple HTTP server
cd ..
python -m http.server 8000

# Option 2: Using Node.js (recommended)
npm install -g http-server
http-server -p 8000 -c-1
```

### 6. Progressive Web App (PWA) Setup

The application is configured as a PWA to allow installation on desktop and mobile devices.

#### PWA Features Enabled:
- ✅ Service Worker for offline functionality
- ✅ Web App Manifest for installation
- ✅ Responsive design for mobile devices
- ✅ App-like experience on desktop

#### Installation on Desktop:
1. **Open the application** in your browser:
   ```
   http://localhost:8000
   ```

2. **Install the app**:
   - Chrome/Edge: Click the install icon (⬇) in the address bar
   - Firefox: Click the "+" icon in the address bar and select "Install"

3. **Desktop Shortcut Created**:
   - Application appears in Start Menu/Applications
   - Desktop shortcut for quick access

#### Installation on Mobile:
1. **Open the application** in your mobile browser:
   ```
   http://localhost:8000
   ```

2. **Install the app**:
   - Android: Tap "Add to Home Screen" in browser menu
   - iOS: Tap "Share" icon, then "Add to Home Screen"

3. **App Icon Added**:
   - Appears on home screen with full app icon
   - Native app-like experience

## Development Setup

### For Developers
```bash
# Install development dependencies
npm install --save-dev nodemon

# Run with auto-reload
npm run dev:backend

# Or with nodemon
nodemon backend/server.js
```

### Frontend Development
The frontend is a static HTML/CSS/JavaScript application. No build process required.

## Production Deployment

### Option 1: Traditional Web Hosting
```bash
# Build for production (if needed)
# npm run build

# Deploy to any web server
# Upload files to hosting provider
# Configure domain and SSL
```

### Option 2: Docker Deployment
```bash
# Build Docker image
docker build -t umukozi .

# Run with Docker
docker run -p 3001:3000 -p 8000:8000 umukozi

# Or use docker-compose
docker-compose up -d
```

### Option 3: Cloud Platform Deployment
- **Vercel**: Connect GitHub repo and deploy
- **Netlify**: Connect GitHub repo and deploy
- **Heroku**: Connect GitHub repo and deploy
- **AWS Amplify**: Connect GitHub repo and deploy

## Configuration Files

### Key Files:
- `manifest.json` - PWA manifest
- `sw.js` - Service worker (auto-generated)
- `.env` - Environment variables
- `package.json` - Dependencies and scripts

## Troubleshooting

### Common Issues:
1. **Port already in use**:
   ```bash
   # Kill processes on ports 3001/8000
   lsof -ti:3001
   lsof -ti:8000
   ```

2. **Database connection issues**:
   ```bash
   # Check database file exists
   ls -la backend/umukozi.db
   
   # Re-initialize database
   cd backend && node init_db.js
   ```

3. **CORS issues**:
   ```bash
   # Check CORS origin in .env
   grep CORS_ORIGIN .env
   ```

4. **Installation not working**:
   - Check browser console for errors
   - Verify service worker registration
   - Clear browser cache

## Support

For technical support or questions:
- 📧 Check the `README.md` file in the root directory
- 🌐 Visit the live application
- 📝 Review the code documentation

## Quick Start Commands

```bash
# Complete setup in one command
git clone https://github.com/your-username/umukozi.git && cd umukozi && npm install && cp .env.example .env && cd backend && node init_db.js && cd .. && npm start
```

---

**🚀 Your Umukozi application is now ready for installation and deployment!**
