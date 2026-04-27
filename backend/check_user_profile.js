const { query } = require('./config/database');

async function checkUserProfile() {
    try {
        console.log('Checking user profile for kubwimanatheophile02@gmail.com...');
        
        const result = await query('SELECT u.email, wp.profile_photo FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.email = ?', ['kubwimanatheophile02@gmail.com']);
        
        if (result.rows.length > 0) {
            console.log('User found:');
            console.log('Email:', result.rows[0].email);
            console.log('Profile photo:', result.rows[0].profile_photo);
        } else {
            console.log('User not found');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    process.exit(0);
}

checkUserProfile();
