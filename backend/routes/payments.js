const express = require('express');
const { query } = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if employer has paid to unlock workers
router.get('/check/:workerId', authenticateToken, async (req, res) => {
  try {
    // Check if employer has any verified payment (one payment unlocks all workers)
    const result = await query(
      `SELECT status FROM payments 
       WHERE employer_id = $1 
       ORDER BY CASE 
         WHEN status = 'verified' THEN 1 
         WHEN status = 'pending' THEN 2 
         ELSE 3 
       END ASC LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ paid: false, status: 'none' });
    }

    res.json({ 
      paid: true, 
      status: result.rows[0].status 
    });
  } catch (error) {
    console.error('Check payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a new payment
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { workerId, transactionRef } = req.body;
    
    if (!workerId || !transactionRef) {
      return res.status(400).json({ error: 'Worker ID and Transaction Reference are required' });
    }

    // Insert or update payment
    const result = await query(
      `INSERT INTO payments (employer_id, worker_id, transaction_ref, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (employer_id, worker_id) 
       DO UPDATE SET transaction_ref = $3, status = 'pending', updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, workerId, transactionRef]
    );

    res.status(201).json({
      message: 'Payment submitted successfully. Please wait for verification.',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Submit payment error:', error);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
});

module.exports = router;
