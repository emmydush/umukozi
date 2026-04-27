const { Pool } = require('pg');
require('dotenv').config({ path: 'e:/Umukozi/backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkJobs() {
  try {
    const res = await pool.query('SELECT employer_id, title FROM jobs');
    console.log('Jobs with employer IDs:');
    res.rows.forEach(r => console.log(`Employer ID: ${r.employer_id}, Title: ${r.title}`));
    
    const employers = await pool.query("SELECT id, name, email FROM users WHERE user_type='employer'");
    console.log('Employers:');
    employers.rows.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Email: ${r.email}`));
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkJobs();
