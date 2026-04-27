const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  try {
    // 1. Update user_type constraint
    await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;`);
    await pool.query(`ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('worker', 'employer', 'admin'));`);
    console.log('✅ Updated users table constraint');

    // 2. Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await pool.query(
      `INSERT INTO users (name, email, phone, password, user_type, profile_complete)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['System Admin', 'admin@umukozi.rw', '0788000000', hashedPassword, 'admin', true]
    );
    console.log('✅ Default admin user created (admin@umukozi.rw / admin123)');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
