const { Pool } = require('pg');
require('dotenv').config({ path: 'e:/Umukozi/backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkDb() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM jobs');
    console.log('Jobs count:', res.rows[0].count);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkDb();
