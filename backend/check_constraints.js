// Script to check database constraints for worker_profiles table
const { query } = require('./config/database');

async function checkConstraints() {
  try {
    console.log('Checking worker_profiles table constraints...');
    
    // Get table constraints
    const constraintsQuery = `
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        pg_get_constraintdef(tc.oid) as constraint_def
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'worker_profiles'
      AND tc.constraint_type = 'CHECK'
    `;
    
    const result = await query(constraintsQuery);
    
    console.log('Found constraints:');
    result.rows.forEach(row => {
      console.log(`- ${row.constraint_name}: ${row.constraint_def}`);
    });
    
    // Also check the column definition
    const columnQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'worker_profiles'
      AND column_name = 'availability'
    `;
    
    const columnResult = await query(columnQuery);
    console.log('\nAvailability column definition:');
    console.log(columnResult.rows[0]);
    
  } catch (error) {
    console.error('Error checking constraints:', error);
  } finally {
    process.exit(0);
  }
}

checkConstraints();
