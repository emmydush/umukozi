const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'umukozi.db'));

function showAdminCredentials() {
    console.log('=== UMUKOZI ADMIN CREDENTIALS ===');
    
    // Check existing admin users
    db.all("SELECT id, name, email, phone, user_type FROM users WHERE user_type = 'admin'", (err, rows) => {
        if (err) {
            console.error('Error checking admin users:', err);
            return;
        }
        
        console.log('\n📋 Admin Users Found:');
        if (rows.length === 0) {
            console.log('❌ No admin users found. Please initialize the database first.');
        } else {
            rows.forEach((admin, index) => {
                console.log(`\n${index + 1}. Admin User:`);
                console.log(`   ID: ${admin.id}`);
                console.log(`   Name: ${admin.name}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Phone: ${admin.phone}`);
                console.log(`   Type: ${admin.user_type}`);
            });
        }
        
        console.log('\n🔑 DEFAULT LOGIN CREDENTIALS:');
        console.log('   Email: admin@umukozi.com');
        console.log('   Password: admin123');
        console.log('   User Type: admin');
        
        console.log('\n🌐 How to Login:');
        console.log('   1. Open http://localhost:8000 in your browser');
        console.log('   2. Click the "Login" button');
        console.log('   3. Enter the email: admin@umukozi.com');
        console.log('   4. Enter the password: admin123');
        console.log('   5. Click "Login" - you will be redirected to admin dashboard');
        
        console.log('\n⚠️  SECURITY NOTES:');
        console.log('   - Change the default password after first login');
        console.log('   - Keep these credentials secure');
        console.log('   - Only share with authorized administrators');
        
        console.log('\n📊 Admin Features Available:');
        console.log('   - Manage all users (workers, employers)');
        console.log('   - View and manage job postings');
        console.log('   - Handle worker verification');
        console.log('   - Monitor applications and payments');
        console.log('   - System settings and configuration');
        
        db.close();
    });
}

// Run the function
showAdminCredentials();
