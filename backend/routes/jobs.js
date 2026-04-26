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

// Create new job (employers only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('=== JOB CREATION REQUEST ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    if (!req.user || !req.user.userId) {
      console.log('ERROR: Invalid user token - missing userId');
      return res.status(401).json({ error: 'Invalid authentication - user not found' });
    }
    
    if (req.user.userType !== 'employer') {
      console.log('ERROR: User type check failed:', req.user.userType, 'expected: employer');
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }

    let {
      title,
      description,
      location,
      jobType,
      salaryRangeMin,
      salaryRangeMax,
      requirements
    } = req.body;

    console.log('Job data received:', { title, description, location, jobType, salaryRangeMin });

    // Validation
    console.log('Validating required fields...');
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!location) missingFields.push('location');
    if (!jobType) missingFields.push('jobType');
    
    if (missingFields.length > 0) {
      console.log('ERROR: Validation failed - missing fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: `Please provide: ${missingFields.join(', ')}` 
      });
    }
    
    // Validate job type
    const validJobTypes = ['full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'go-home'];
    if (!validJobTypes.includes(jobType)) {
      console.log('ERROR: Invalid job type:', jobType);
      return res.status(400).json({ 
        error: 'Invalid job type', 
        details: `Must be one of: ${validJobTypes.join(', ')}` 
      });
    }

    // Convert empty strings to null for optional numeric/text fields
    salaryRangeMin = salaryRangeMin === '' ? null : salaryRangeMin;
    salaryRangeMax = salaryRangeMax === '' ? null : salaryRangeMax;
    requirements = requirements === '' ? null : requirements;

    console.log('Inserting job into database...');
    console.log('Query parameters:', [req.user.userId, title, description, location, jobType, salaryRangeMin, salaryRangeMax, requirements]);

    const result = await query(
      `INSERT INTO jobs 
       (employer_id, title, description, location, job_type, salary_range_min, salary_range_max, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.userId, title, description, location, jobType, salaryRangeMin, salaryRangeMax, requirements]
    );

    console.log('SUCCESS: Job created successfully with ID:', result.rows[0].id);

    res.status(201).json({
      message: 'Job posted successfully',
      job: result.rows[0]
    });

  } catch (error) {
    console.error('=== JOB CREATION FAILED ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific DB errors
    if (error.code === '23514') {
      console.log('Database constraint violation');
      return res.status(400).json({ 
        error: 'Invalid job data', 
        details: 'Specific field value not allowed by database constraints (e.g., invalid job type).' 
      });
    }
    
    if (error.code === '23505') {
      console.log('Database unique constraint violation');
      return res.status(400).json({ 
        error: 'Duplicate entry', 
        details: 'This job already exists or conflicts with existing data.' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Database connection refused');
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: 'Cannot connect to the database. Please check if the database server is running.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create job',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while creating the job.'
    });
  }
});

// Get all jobs (public endpoint)
router.get('/', async (req, res) => {
  try {
    const {
      location,
      jobType,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let queryParams = [];
    let queryConditions = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (location) {
      queryConditions.push(`LOWER(j.location) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (jobType) {
      queryConditions.push(`j.job_type = $${paramIndex}`);
      queryParams.push(jobType);
      paramIndex++;
    }

    const whereClause = queryConditions.length > 0 
      ? `WHERE ${queryConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      ${whereClause} AND j.is_active = TRUE
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get jobs with pagination
    const jobsQuery = `
      SELECT 
        j.id, j.title, j.description, j.location, j.job_type,
        j.salary_range_min, j.salary_range_max, j.requirements, j.created_at,
        u.name as employer_name, u.email as employer_email, u.phone as employer_phone
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      ${whereClause} AND j.is_active = TRUE
      ORDER BY j.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const jobsResult = await query(jobsQuery, queryParams);

    res.json({
      jobs: jobsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        j.id, j.title, j.description, j.location, j.job_type,
        j.salary_range_min, j.salary_range_max, j.requirements, j.created_at,
        u.name as employer_name, u.email as employer_email, u.phone as employer_phone
      FROM jobs j
      JOIN users u ON j.employer_id = u.id
      WHERE j.id = $1 AND j.is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job: result.rows[0] });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// Get employer's jobs
router.get('/employer/my-jobs', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view their jobs' });
    }

    const result = await query(
      `SELECT 
        id, title, description, location, job_type,
        salary_range_min, salary_range_max, requirements, is_active, created_at
      FROM jobs
      WHERE employer_id = $1
      ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({ jobs: result.rows });

  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

// Update job
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'employer') {
      return res.status(403).json({ error: 'Only employers can update jobs' });
    }

    const { id } = req.params;
    let {
      title,
      description,
      location,
      jobType,
      salaryRangeMin,
      salaryRangeMax,
      requirements,
      isActive
    } = req.body;

    // Check if job exists and belongs to employer
    const jobCheck = await query(
      'SELECT employer_id FROM jobs WHERE id = $1',
      [id]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobCheck.rows[0].employer_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own jobs' });
    }

    // Convert empty strings to null for optional numeric/text fields
    salaryRangeMin = salaryRangeMin === '' ? null : salaryRangeMin;
    salaryRangeMax = salaryRangeMax === '' ? null : salaryRangeMax;
    requirements = requirements === '' ? null : requirements;

    const result = await query(
      `UPDATE jobs 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           location = COALESCE($3, location), 
           job_type = COALESCE($4, job_type),
           salary_range_min = $5, 
           salary_range_max = $6, 
           requirements = $7,
           is_active = COALESCE($8, is_active), 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, description, location, jobType, salaryRangeMin, salaryRangeMax, requirements, isActive, id]
    );

    res.json({
      message: 'Job updated successfully',
      job: result.rows[0]
    });

  } catch (error) {
    console.error('Update job error:', error);
    
    // Check for specific DB errors (like CHECK constraint violations)
    if (error.code === '23514') {
      return res.status(400).json({ 
        error: 'Invalid job data', 
        details: 'Specific field value not allowed by database constraints (e.g., invalid job type).' 
      });
    }

    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'employer') {
      return res.status(403).json({ error: 'Only employers can delete jobs' });
    }

    const { id } = req.params;

    // Check if job belongs to employer
    const jobCheck = await query(
      'SELECT employer_id FROM jobs WHERE id = $1',
      [id]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobCheck.rows[0].employer_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own jobs' });
    }

    await query('DELETE FROM jobs WHERE id = $1', [id]);

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
