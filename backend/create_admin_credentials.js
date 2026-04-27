const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'umukozi.db'));

async function createAdminCredentials() {
    console.log('=== Creating Admin Credentials ===');
    
    // Check existing admin users
    db.all("SELECT id, name, email, user_type FROM users WHERE user_type = 'admin'", (err, rows) => {
        if (err) {
            console.error('Error checking admin users:', err);
            return;
        }
        
        console.log('\nExisting Admin Users:');
        if (rows.length === 0) {
            console.log('No admin users found.');
        } else {
            rows.forEach(admin => {
                console.log(`ID: ${admin.id}, Name: ${admin.name}, Email: ${admin.email}`);
            });
        }
        
        // Default admin credentials (from database initialization)
        console.log('\n=== DEFAULT ADMIN CREDENTIALS ===');
        console.log('Email: admin@umukozi.com');
        console.log('Password: admin123');
        console.log('User Type: admin');
        console.log('================================\n');
        
        // Create additional admin if needed
        const newAdmin = {
            name: 'System Administrator',
            email: 'sysadmin@umukozi.com',
            phone: '0788998776',
            password: 'admin2024',
            userType: 'admin'
        };
        
        // Check if new admin already exists
        db.get("SELECT email FROM users WHERE email = ?", [newAdmin.email], async (err, row) => {
            if (err) {
                console.error('Error checking admin existence:', err);
                return;
            }
            
            if (row) {
                console.log(`Admin with email ${newAdmin.email} already exists.`);
            } else {
                try {
                    // Hash the password
                    const hashedPassword = await bcrypt.hash(newAdmin.password, 10);
                    
                    // Insert new admin
                    db.run(
                        `INSERT INTO users (name, email, phone, password, user_type, profile_complete, is_active, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        [newAdmin.name, newAdmin.email, newAdmin.phone, hashedPassword, newAdmin.userType],
                        function(err) {
                            if (err) {
                                console.error('Error creating admin:', err);
                            } else {
                                console.log('\n=== NEW ADMIN CREDENTIALS CREATED ===');
                                console.log(`Name: ${newAdmin.name}`);
                                console.log(`Email: ${newAdmin.email}`);
                                console.log(`Password: ${newAdmin.password}`);
                                console.log(`User Type: ${newAdmin.userType}`);
                                console.log(`User ID: ${this.lastID}`);
                                console.log('=====================================\n');
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error hashing password:', error);
                }
            }
            
            // Test admin login functionality
            console.log('=== Testing Admin Login ===');
            console.log('You can test the admin login by:');
            console.log('1. Going to http://localhost:8000');
            console.log('2. Clicking "Login" button');
            console.log('3. Using email: admin@umukozi.com');
            console.log('4. Using password: admin123');
            console.log('5. You should be redirected to the admin dashboard\n');
            
            db.close();
        });
    });
}

// Run the function
createAdminCredentials().catch(console.error);
