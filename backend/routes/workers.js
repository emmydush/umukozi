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

// Create/update worker profile
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ error: 'Only workers can create profiles' });
    }

    const {
      nationalId,
      profilePhoto,
      location,
      availability,
      expectedSalary,
      experienceYears,
      skills,
      recommendation1Name,
      recommendation1Phone,
      recommendation2Name,
      recommendation2Phone
    } = req.body;

    // Validation
    const requiredFields = [
      nationalId, location, availability, expectedSalary, 
      experienceYears, skills, recommendation1Name, 
      recommendation1Phone, recommendation2Name, recommendation2Phone
    ];

    if (requiredFields.some(field => !field)) {
      return res.status(400).json({ error: 'All profile fields are required' });
    }

    // Check if profile already exists
    const existingProfile = await query(
      'SELECT id FROM worker_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    let result;
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      result = await query(
        `UPDATE worker_profiles 
         SET national_id = $1, profile_photo = $2, location = $3, availability = $4,
             expected_salary = $5, experience_years = $6, skills = $7,
             recommendation1_name = $8, recommendation1_phone = $9,
             recommendation2_name = $10, recommendation2_phone = $11,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $12
         RETURNING *`,
        [
          nationalId, profilePhoto, location, availability, expectedSalary,
          experienceYears, skills, recommendation1Name, recommendation1Phone,
          recommendation2Name, recommendation2Phone, req.user.userId
        ]
      );
    } else {
      // Create new profile
      result = await query(
        `INSERT INTO worker_profiles 
         (user_id, national_id, profile_photo, location, availability, expected_salary,
          experience_years, skills, recommendation1_name, recommendation1_phone,
          recommendation2_name, recommendation2_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          req.user.userId, nationalId, profilePhoto, location, availability,
          expectedSalary, experienceYears, skills, recommendation1Name,
          recommendation1Phone, recommendation2Name, recommendation2Phone
        ]
      );
    }

    // Update user profile_complete status
    await query(
      'UPDATE users SET profile_complete = TRUE WHERE id = $1',
      [req.user.userId]
    );

    res.json({
      message: 'Profile saved successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get worker profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT wp.*, u.name, u.email, u.phone 
       FROM worker_profiles wp 
       JOIN users u ON wp.user_id = u.id 
       WHERE wp.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: result.rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Search workers (for employers)
router.get('/search', async (req, res) => {
  try {
    const {
      location,
      skills,
      availability,
      minSalary,
      maxSalary,
      minExperience,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    let queryParams = [];
    let queryConditions = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (location) {
      queryConditions.push(`LOWER(wp.location) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (skills) {
      queryConditions.push(`LOWER(wp.skills) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${skills}%`);
      paramIndex++;
    }

    if (availability) {
      queryConditions.push(`wp.availability = $${paramIndex}`);
      queryParams.push(availability);
      paramIndex++;
    }

    if (minSalary) {
      queryConditions.push(`wp.expected_salary >= $${paramIndex}`);
      queryParams.push(minSalary);
      paramIndex++;
    }

    if (maxSalary) {
      queryConditions.push(`wp.expected_salary <= $${paramIndex}`);
      queryParams.push(maxSalary);
      paramIndex++;
    }

    if (minExperience) {
      queryConditions.push(`wp.experience_years >= $${paramIndex}`);
      queryParams.push(minExperience);
      paramIndex++;
    }

    const whereClause = queryConditions.length > 0 
      ? `WHERE ${queryConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get workers with pagination
    const workersQuery = `
      SELECT 
        u.id, u.name, u.email, u.phone,
        wp.national_id, wp.profile_photo, wp.location, wp.availability,
        wp.expected_salary, wp.experience_years, wp.skills, wp.is_verified,
        wp.recommendation1_name, wp.recommendation1_phone,
        wp.recommendation2_name, wp.recommendation2_phone
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      ${whereClause}
      ORDER BY wp.is_verified DESC, wp.experience_years DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const workersResult = await query(workersQuery, queryParams);

    res.json({
      workers: workersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search workers error:', error);
    res.status(500).json({ error: 'Failed to search workers' });
  }
});

// Get worker by ID (for employers to view profile)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        wp.national_id, wp.profile_photo, wp.location, wp.availability,
        wp.expected_salary, wp.experience_years, wp.skills, wp.is_verified,
        wp.recommendation1_name, wp.recommendation1_phone,
        wp.recommendation2_name, wp.recommendation2_phone,
        wp.created_at
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    res.json({ worker: result.rows[0] });

  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({ error: 'Failed to get worker' });
  }
});

module.exports = router;
