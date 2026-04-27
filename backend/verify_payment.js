const { Pool } = require('pg');
require('dotenv').config({ path: 'e:/Umukozi/backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verifyPayment(transRef) {
  try {
    const result = await pool.query(
      "UPDATE payments SET status = 'verified', updated_at = CURRENT_TIMESTAMP WHERE transaction_ref = $1 RETURNING *",
      [transRef]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No payment found with reference:', transRef);
    } else {
      console.log('✅ Payment verified successfully:', result.rows[0]);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

const ref = process.argv[2];
if (!ref) {
  console.log('Usage: node verify_payment.js <transaction_reference>');
} else {
  verifyPayment(ref);
}
