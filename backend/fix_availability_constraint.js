// Script to fix the availability constraint in worker_profiles table
const { query } = require('./config/database');

async function fixAvailabilityConstraint() {
  try {
    console.log('Fixing availability constraint...');
    
    // First, drop the existing constraint
    const dropConstraintQuery = `
      ALTER TABLE worker_profiles 
      DROP CONSTRAINT IF EXISTS worker_profiles_availability_check
    `;
    
    await query(dropConstraintQuery);
    console.log('Dropped existing constraint (if it existed)');
    
    // Add the correct constraint
    const addConstraintQuery = `
      ALTER TABLE worker_profiles 
      ADD CONSTRAINT worker_profiles_availability_check 
      CHECK (availability IN ('full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'go-home'))
    `;
    
    await query(addConstraintQuery);
    console.log('Added correct availability constraint');
    
    // Verify the constraint was added
    const verifyQuery = `
      SELECT 
        tc.constraint_name, 
        pg_get_constraintdef(tc.oid) as constraint_def
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'worker_profiles'
      AND tc.constraint_name = 'worker_profiles_availability_check'
    `;
    
    const result = await query(verifyQuery);
    console.log('Verification result:', result.rows[0]);
    
  } catch (error) {
    console.error('Error fixing constraint:', error);
  } finally {
    process.exit(0);
  }
}

fixAvailabilityConstraint();
