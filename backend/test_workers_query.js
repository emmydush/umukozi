const { query } = require('./config/database');

async function testWorkersQuery() {
    try {
        console.log('Testing workers query...');
        
        // Test the exact query from the admin route
        const sql = `
          SELECT u.id, u.name, wp.national_id, wp.id_photo, wp.is_verified, wp.skills, wp.experience_years, wp.availability, 
                 wp.expected_salary, wp.profile_photo
          FROM users u
          LEFT JOIN worker_profiles wp ON u.id = wp.user_id
          WHERE u.user_type = 'worker'
          ORDER BY u.created_at DESC
        `;
        
        console.log('SQL:', sql);
        
        const result = await query(sql);
        console.log('Query successful!');
        console.log('Found', result.rows.length, 'workers');
        
        if (result.rows.length > 0) {
            console.log('First worker:', JSON.stringify(result.rows[0], null, 2));
        }
        
    } catch (error) {
        console.error('Query failed:', error.message);
        console.error('Error details:', error);
    }
    
    process.exit(0);
}

testWorkersQuery();
