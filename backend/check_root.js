// fetch is global in Node.js 18+

async function checkRoot() {
  try {
    const res = await fetch('http://localhost:3001/');
    const data = await res.json();
    console.log('Root Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}

checkRoot();
