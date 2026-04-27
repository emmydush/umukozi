async function testRoute() {
  try {
    const res = await fetch('http://localhost:3001/api/payments/check/1');
    const data = await res.json();
    console.log('Result:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testRoute();
