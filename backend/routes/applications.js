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

// Worker: Apply for a job
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Only workers can apply for jobs' });
    }

    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Check if job exists and is active
    const jobCheck = await query('SELECT id FROM jobs WHERE id = $1 AND is_active = TRUE', [jobId]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or not active' });
    }

    // Check if already applied
    const applyCheck = await query('SELECT id FROM applications WHERE job_id = $1 AND worker_id = $2', [jobId, req.user.userId]);
    if (applyCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const result = await query(
      `INSERT INTO applications (job_id, worker_id, cover_letter, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [jobId, req.user.userId, coverLetter || null]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Worker: Get my applications
router.get('/worker/my-applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Only workers can view their applications' });
    }

    const result = await query(
      `SELECT a.*, j.title as job_title, j.location as job_location, j.job_type, 
              u.name as employer_name, u.email as employer_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON j.employer_id = u.id
       WHERE a.worker_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.userId]
    );

    res.json({ applications: result.rows });

  } catch (error) {
    console.error('Get worker applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Employer: Get applications for a specific job
router.get('/employer/job/:jobId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view job applications' });
    }

    const { jobId } = req.params;

    // Verify job belongs to employer
    const jobCheck = await query('SELECT employer_id FROM jobs WHERE id = $1', [jobId]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (jobCheck.rows[0].employer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to view these applications' });
    }

    const result = await query(
      `SELECT a.*, u.name as worker_name, u.email as worker_email, u.phone as worker_phone,
              wp.skills, wp.experience_years, wp.profile_photo
       FROM applications a
       JOIN users u ON a.worker_id = u.id
       LEFT JOIN worker_profiles wp ON u.id = wp.user_id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC`,
      [jobId]
    );

    res.json({ applications: result.rows });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Employer: Update application status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'employer') {
      return res.status(403).json({ error: 'Only employers can update application status' });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify the application belongs to a job owned by this employer
    const appCheck = await query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1 AND j.employer_id = $2`,
      [id, req.user.userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    const result = await query(
      `UPDATE applications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: 'Application status updated successfully',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router;
