const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: 'e:/Umukozi/backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('e:/Umukozi/database/add_payments_table.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Payments table created successfully');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
