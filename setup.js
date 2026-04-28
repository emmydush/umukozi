#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Umukozi Web App Setup');
console.log('================================');

// Check if required files exist
const requiredFiles = [
    'public/manifest.json',
    'public/sw.js',
    '.env'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.log('❌ Missing required files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    
    console.log('\n📝 Creating missing files...');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
    }
    
    // Create manifest.json
    const manifest = {
        name: "Umukozi",
        short_name: "Umukozi",
        description: "Household worker connection platform",
        start_url: "/",
        display: "standalone",
        background_color: "#8b5cf6",
        theme_color: "#8b5cf6",
        orientation: "portrait",
        scope: "/",
        icons: [
            {
                src: "images/logo.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "images/logo.png",
                sizes: "512x512",
                type: "image/png"
            }
        ],
        categories: ["business", "productivity"],
        gcm_sender_id: "your-gcm-sender-id",
        shortcuts: [
            {
                name: "Find Workers",
                short_name: "Workers",
                description: "Find household workers",
                url: "/",
                icons: [{ src: "images/logo.png", sizes: "192x192" }]
            }
        ]
    };
    
    fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✅ Created public/manifest.json');
    
    // Create service worker
    const swContent = `
const CACHE_NAME = 'umukozi-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/auth.js',
    '/js/api.js'
];

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
    `;
    
    fs.writeFileSync('public/sw.js', swContent);
    console.log('✅ Created public/sw.js');
    
    // Create .env.example if it doesn't exist
    if (!fs.existsSync('.env')) {
        const envExample = `NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:8000

# Database Configuration
# For SQLite (default)
DB_TYPE=sqlite

# For PostgreSQL (uncomment below)
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=umukozi
# DB_USER=umukozi
# DB_PASSWORD=your-password
`;
        
        fs.writeFileSync('.env.example', envExample);
        console.log('✅ Created .env.example');
    }
    
    console.log('\n✅ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy .env.example to .env and configure your settings');
    console.log('2. Run: npm install');
    console.log('3. Run: npm start');
    console.log('4. Open: http://localhost:8000');
    console.log('\n🌐 Your PWA is ready for installation!');
}
