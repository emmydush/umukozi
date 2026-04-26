const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

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

// Leave a review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { revieweeId, jobId, rating, comment } = req.body;

    if (!revieweeId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Reviewee ID and rating (1-5) are required' });
    }

    if (revieweeId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    // Check if review already exists
    const checkReview = await query(
      `SELECT id FROM reviews WHERE reviewer_id = $1 AND reviewee_id = $2 AND (job_id = $3 OR ($3 IS NULL AND job_id IS NULL))`,
      [req.user.userId, revieweeId, jobId || null]
    );

    if (checkReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this user for this job' });
    }

    const result = await query(
      `INSERT INTO reviews (reviewer_id, reviewee_id, job_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, revieweeId, jobId || null, rating, comment]
    );

    res.status(201).json({
      message: 'Review posted successfully',
      review: result.rows[0]
    });

  } catch (error) {
    console.error('Post review error:', error);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT r.*, u.name as reviewer_name, j.title as job_title 
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN jobs j ON r.job_id = j.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // Get average rating
    const avgResult = await query(
      `SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(id) as total_reviews
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );

    res.json({ 
      reviews: result.rows,
      stats: avgResult.rows[0]
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

module.exports = router;
