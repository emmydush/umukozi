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

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, jobId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'Receiver ID and message are required' });
    }

    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, job_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, receiverId, jobId || null, message]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversations (latest message per user)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT DISTINCT ON (contact_id) 
           m.*, 
           u.name as contact_name, 
           u.user_type as contact_type
       FROM (
           SELECT 
               id, sender_id, receiver_id, message, is_read, created_at,
               CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as contact_id
           FROM messages
           WHERE sender_id = $1 OR receiver_id = $1
       ) m
       JOIN users u ON m.contact_id = u.id
       ORDER BY contact_id, created_at DESC`,
      [userId]
    );

    res.json({ conversations: result.rows });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages with a specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT m.*, u1.name as sender_name, u2.name as receiver_name
       FROM messages m
       JOIN users u1 ON m.sender_id = u1.id
       JOIN users u2 ON m.receiver_id = u2.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user.userId, userId]
    );

    res.json({ messages: result.rows });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Mark messages as read
router.put('/read/:senderId', authenticateToken, async (req, res) => {
  try {
    const { senderId } = req.params;

    await query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
      [senderId, req.user.userId]
    );

    res.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;
