const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'e:/Umukozi/backend/.env' });

async function testAdmin() {
  try {
    const token = jwt.sign(
      { userId: 1, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Fetching Stats...');
    const res1 = await globalThis.fetch('http://localhost:3001/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stats:', await res1.text());

    console.log('Fetching Workers...');
    const res2 = await globalThis.fetch('http://localhost:3001/api/admin/workers?', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Workers:', await res2.text());
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testAdmin();
