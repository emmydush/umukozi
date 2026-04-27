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
    console.log('=== WORKER PROFILE SAVE REQUEST ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    if (!req.user || !req.user.userId) {
      console.log('ERROR: Invalid user token - missing userId');
      return res.status(401).json({ error: 'Invalid authentication - user not found' });
    }
    
    if (req.user.userType !== 'worker') {
      console.log('ERROR: User type check failed:', req.user.userType, 'expected: worker');
      return res.status(403).json({ error: 'Only workers can create profiles' });
    }

    const {
      nationalId,
      profilePhoto,
      idPhoto,
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

    console.log('Profile data received:', {
      nationalId,
      profilePhoto,
      idPhoto,
      location,
      availability,
      expectedSalary,
      experienceYears,
      skills,
      recommendation1Name,
      recommendation1Phone,
      recommendation2Name,
      recommendation2Phone
    });

    // Validation
    console.log('Validating required fields...');
    const requiredFields = [
      nationalId, location, availability, expectedSalary, 
      experienceYears, skills, recommendation1Name, 
      recommendation1Phone, recommendation2Name, recommendation2Phone
    ];

    const missingFields = [];
    if (!nationalId) missingFields.push('nationalId');
    if (!location) missingFields.push('location');
    if (!availability) missingFields.push('availability');
    if (!expectedSalary) missingFields.push('expectedSalary');
    if (!experienceYears) missingFields.push('experienceYears');
    if (!skills) missingFields.push('skills');
    if (!recommendation1Name) missingFields.push('recommendation1Name');
    if (!recommendation1Phone) missingFields.push('recommendation1Phone');
    if (!recommendation2Name) missingFields.push('recommendation2Name');
    if (!recommendation2Phone) missingFields.push('recommendation2Phone');

    if (missingFields.length > 0) {
      console.log('ERROR: Validation failed - missing fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: `Please provide: ${missingFields.join(', ')}` 
      });
    }

    // Validate availability value and handle constraint mismatch
    console.log('DEBUG: Availability value received:', availability);
    
    // Map problematic values to working ones temporarily
    let mappedAvailability = availability;
    if (availability === 'live-in') {
      mappedAvailability = 'flexible'; // Temporarily map live-in to flexible
      console.log('MAPPING: live-in -> flexible (temporary fix)');
    }
    
    const validAvailabilityValues = ['full-time', 'part-time', 'weekends', 'flexible', 'go-home'];
    if (!validAvailabilityValues.includes(mappedAvailability)) {
      console.log('ERROR: Invalid availability value:', mappedAvailability);
      return res.status(400).json({ 
        error: 'Invalid availability value', 
        details: `Must be one of: ${validAvailabilityValues.join(', ')}` 
      });
    }

    console.log('Validation passed! Checking for existing profile...');

    // Check if profile already exists
    const existingProfile = await query(
      'SELECT id FROM worker_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    console.log('Existing profile found:', existingProfile.rows.length > 0);

    let result;
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      console.log('Updating existing profile...');
      result = await query(
        `UPDATE worker_profiles 
         SET national_id = $1, profile_photo = $2, id_photo = $3, location = $4, availability = $5,
             expected_salary = $6, experience_years = $7, skills = $8,
             recommendation1_name = $9, recommendation1_phone = $10,
             recommendation2_name = $11, recommendation2_phone = $12,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $13
         RETURNING *`,
        [
          nationalId, profilePhoto, idPhoto, location, mappedAvailability, expectedSalary,
          experienceYears, skills, recommendation1Name, recommendation1Phone,
          recommendation2Name, recommendation2Phone, req.user.userId
        ]
      );
      console.log('Profile updated successfully!');
    } else {
      // Create new profile
      console.log('Creating new profile...');
      result = await query(
        `INSERT INTO worker_profiles 
         (user_id, national_id, profile_photo, id_photo, location, availability, expected_salary,
          experience_years, skills, recommendation1_name, recommendation1_phone,
          recommendation2_name, recommendation2_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          req.user.userId, nationalId, profilePhoto, idPhoto, location, mappedAvailability,
          expectedSalary, experienceYears, skills, recommendation1Name,
          recommendation1Phone, recommendation2Name, recommendation2Phone
        ]
      );
      console.log('Profile created successfully!');
    }

    // Update user profile_complete status
    console.log('Updating user profile_complete status...');
    await query(
      'UPDATE users SET profile_complete = TRUE WHERE id = $1',
      [req.user.userId]
    );

    console.log('SUCCESS: Worker profile saved successfully!');
    res.json({
      message: 'Profile saved successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('=== WORKER PROFILE SAVE FAILED ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific database errors
    if (error.code === '23514') {
      console.log('Database constraint violation');
      return res.status(400).json({ 
        error: 'Invalid profile data', 
        details: 'Specific field value not allowed by database constraints (e.g., duplicate national ID).' 
      });
    }
    
    if (error.code === '23505') {
      console.log('Database unique constraint violation');
      return res.status(400).json({ 
        error: 'Duplicate entry', 
        details: 'This national ID or profile already exists in the system.' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Database connection refused');
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: 'Cannot connect to the database. Please check if the database server is running.' 
      });
    }
    
    if (error.code === '3D000') {
      console.log('Database does not exist');
      return res.status(500).json({ 
        error: 'Database not found', 
        details: 'The umukozi database does not exist. Please run the database setup script.' 
      });
    }
    
    if (error.code === '42P01') {
      console.log('Table does not exist');
      return res.status(500).json({ 
        error: 'Database table missing', 
        details: 'Required database tables are missing. Please run the database schema setup.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to save profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while saving the profile.'
    });
  }
});

// Update worker profile (PUT method)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('=== WORKER PROFILE UPDATE REQUEST (PUT) ===');
    const {
      nationalId,
      profilePhoto,
      idPhoto,
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

    // Map problematic values to working ones temporarily
    let mappedAvailability = availability;
    if (availability === 'live-in') {
      mappedAvailability = 'flexible';
    }

    const result = await query(
      `UPDATE worker_profiles 
       SET national_id = COALESCE($1, national_id), 
           profile_photo = COALESCE($2, profile_photo), 
           id_photo = COALESCE($3, id_photo), 
           location = COALESCE($4, location), 
           availability = COALESCE($5, availability),
           expected_salary = COALESCE($6, expected_salary), 
           experience_years = COALESCE($7, experience_years), 
           skills = COALESCE($8, skills),
           recommendation1_name = COALESCE($9, recommendation1_name), 
           recommendation1_phone = COALESCE($10, recommendation1_phone),
           recommendation2_name = COALESCE($11, recommendation2_name), 
           recommendation2_phone = COALESCE($12, recommendation2_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $13
       RETURNING *`,
      [
        nationalId, profilePhoto, idPhoto, location, mappedAvailability, expectedSalary,
        experienceYears, skills, recommendation1Name, recommendation1Phone,
        recommendation2Name, recommendation2Phone, req.user.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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
    console.log('=== WORKER SEARCH REQUEST ===');
    console.log('Query parameters:', req.query);
    
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

    console.log('Search filters:', { location, skills, availability, minSalary, maxSalary, minExperience, page, limit });

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

    console.log('Generated WHERE clause:', whereClause);
    console.log('Query parameters:', queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      ${whereClause}
    `;

    console.log('Count query:', countQuery);
    console.log('Executing count query with params:', queryParams);

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    console.log('Total workers found:', total);

    // Get workers with pagination
    const workersQuery = `
      SELECT 
        u.id, u.name, u.email, u.phone,
        wp.national_id, wp.profile_photo, wp.id_photo, wp.location, wp.availability,
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
    
    console.log('Workers query:', workersQuery);
    console.log('Final query parameters:', queryParams);
    
    const workersResult = await query(workersQuery, queryParams);
    
    console.log(`Found ${workersResult.rows.length} workers for page ${page}`);
    console.log('Worker search successful!');

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
    console.error('=== WORKER SEARCH FAILED ===');
    console.error('Error details:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific database errors
    if (error.code === 'ECONNREFUSED') {
      console.log('Database connection refused');
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: 'Cannot connect to the database. Please check if the database server is running.' 
      });
    }
    
    if (error.code === '3D000') {
      console.log('Database does not exist');
      return res.status(500).json({ 
        error: 'Database not found', 
        details: 'The umukozi database does not exist. Please run the database setup script.' 
      });
    }
    
    if (error.code === '42P01') {
      console.log('Table does not exist');
      return res.status(500).json({ 
        error: 'Database table missing', 
        details: 'Required database tables are missing. Please run the database schema setup.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to search workers',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while searching for workers.'
    });
  }
});

// Get worker by ID (for employers to view profile)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        wp.national_id, wp.profile_photo, wp.id_photo, wp.location, wp.availability,
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
