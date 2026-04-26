// Database migration script to add id_photo column
const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'umukozi',
  user: 'postgres',
  password: 'Jesuslove@12'
});

async function addIdPhotoColumn() {
  try {
    console.log('Adding id_photo column to worker_profiles table...');
    
    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'worker_profiles' 
      AND column_name = 'id_photo'
    `;
    
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('id_photo column already exists!');
      return;
    }
    
    // Add the column
    const alterQuery = `
      ALTER TABLE worker_profiles 
      ADD COLUMN id_photo VARCHAR(500)
    `;
    
    await pool.query(alterQuery);
    console.log('✅ id_photo column added successfully!');
    
    // Verify the column was added
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'worker_profiles' 
      AND column_name = 'id_photo'
    `;
    
    const verifyResult = await pool.query(verifyQuery);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Column verification successful:', verifyResult.rows[0]);
    } else {
      console.log('❌ Column verification failed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addIdPhotoColumn().catch(console.error);
