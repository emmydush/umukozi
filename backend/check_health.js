// fetch is global in Node.js 18+

async function checkHealth() {
  try {
    const res = await fetch('http://localhost:3001/api/health');
    const data = await res.json();
    console.log('Health:', data);
    
    const jobsRes = await fetch('http://localhost:3001/api/jobs');
    const jobsData = await jobsRes.json();
    console.log('Public Jobs count:', jobsData.jobs ? jobsData.jobs.length : 'error');
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}

checkHealth();
