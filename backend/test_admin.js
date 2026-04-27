async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/admin/workers');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}
test();
