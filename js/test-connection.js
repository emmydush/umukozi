// Test connection to backend API
async function testBackendConnection() {
    console.log('Testing backend connection...');
    
    try {
        // Test basic health endpoint
        const response = await fetch('http://localhost:3000/api/health');
        console.log('Health check response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Health check data:', data);
            return true;
        } else {
            console.error('Health check failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Backend connection test failed:', error);
        return false;
    }
}

// Test CORS specifically
async function testCORS() {
    console.log('Testing CORS...');
    
    try {
        const response = await fetch('http://localhost:3000/api/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8000'
            }
        });
        
        console.log('CORS test response:', response.status);
        console.log('CORS headers:', response.headers);
        
        return response.ok;
    } catch (error) {
        console.error('CORS test failed:', error);
        return false;
    }
}

// Run tests when page loads
window.addEventListener('load', async () => {
    console.log('Page loaded, running connection tests...');
    
    const isConnected = await testBackendConnection();
    const corsWorks = await testCORS();
    
    console.log('Connection test results:', { isConnected, corsWorks });
    
    if (!isConnected) {
        alert('Backend server is not responding. Please ensure the backend is running on port 3000.');
    }
});
