const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'e:/Umukozi/backend/.env' });

// Test the applications endpoint
async function testApplications() {
    console.log('=== Testing Applications Endpoint ===');
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    // Create a test token for worker user ID 3
    const testUser = {
        userId: 3,
        userType: 'worker',
        email: 'emmychris915@gmail.com'
    };
    
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Test token created:', token);
    
    // Test the API call
    try {
        const response = await fetch('http://localhost:3001/api/applications/worker/my-applications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
    } catch (error) {
        console.error('Error testing applications:', error);
    }
}

testApplications();
