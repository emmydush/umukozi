const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'umukozi.db'));

async function fixAdminPassword() {
    console.log('=== Fixing Admin Password ===');
    
    const adminEmail = 'admin@umukozi.com';
    const plainPassword = 'admin123';
    
    try {
        // Hash the password
        console.log('Hashing admin password...');
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        console.log('Password hashed successfully');
        
        // Update the admin password in the database
        db.run(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, adminEmail],
            function(err) {
                if (err) {
                    console.error('Error updating admin password:', err);
                } else {
                    console.log(`✅ Admin password updated successfully!`);
                    console.log(`   Changes made: ${this.changes} row(s) affected`);
                    
                    // Verify the update
                    db.get(
                        'SELECT id, name, email, user_type FROM users WHERE email = ?',
                        [adminEmail],
                        (err, row) => {
                            if (err) {
                                console.error('Error verifying update:', err);
                            } else if (row) {
                                console.log('\n📋 Admin User Details:');
                                console.log(`   ID: ${row.id}`);
                                console.log(`   Name: ${row.name}`);
                                console.log(`   Email: ${row.email}`);
                                console.log(`   Type: ${row.user_type}`);
                                
                                console.log('\n🔑 Updated Login Credentials:');
                                console.log(`   Email: ${adminEmail}`);
                                console.log(`   Password: ${plainPassword}`);
                                console.log('   (Password is now properly hashed in database)');
                                
                                console.log('\n🌐 You can now login with:');
                                console.log('   1. Go to http://localhost:8000');
                                console.log('   2. Click "Login"');
                                console.log('   3. Use email: admin@umukozi.com');
                                console.log('   4. Use password: admin123');
                                console.log('   5. Login should work now!');
                            } else {
                                console.log('❌ Admin user not found after update');
                            }
                            
                            db.close();
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error hashing password:', error);
        db.close();
    }
}

// Run the function
fixAdminPassword();
