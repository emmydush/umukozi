const express = require('express');
const { query, run } = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT and check admin role
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    const workers = await query('SELECT count(*) as count FROM users WHERE user_type = "worker"');
    const employers = await query('SELECT count(*) as count FROM users WHERE user_type = "employer"');
    const pending_workers = await query('SELECT count(*) as count FROM worker_profiles WHERE is_verified = 0');
    const total_jobs = await query('SELECT count(*) as count FROM jobs');
    const pending_payments = await query('SELECT count(*) as count FROM payments WHERE status = "pending"');
    
    const stats = {
      workers: workers.rows[0].count,
      employers: employers.rows[0].count,
      pending_workers: pending_workers.rows[0].count,
      total_jobs: total_jobs.rows[0].count,
      pending_payments: pending_payments.rows[0].count
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Workers Management
router.get('/workers', async (req, res) => {
  try {
    const { status } = req.query; // pending or verified
    let sql = `
      SELECT u.*, wp.is_verified, wp.skills, wp.experience, wp.availability, 
             wp.expected_salary, wp.profile_photo
      FROM users u
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id
      WHERE u.user_type = "worker"
    `;
    
    if (status === 'pending') {
      sql += ' AND wp.is_verified = 0';
    } else if (status === 'verified') {
      sql += ' AND wp.is_verified = 1';
    }
    
    sql += ' ORDER BY u.created_at DESC';
    
    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Verify Worker
router.put('/workers/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    
    await run(
      'UPDATE worker_profiles SET is_verified = ?, verification_date = datetime("now") WHERE user_id = ?',
      [is_verified ? 1 : 0, id]
    );
    res.json({ success: true, message: is_verified ? 'Worker verified' : 'Worker unverified' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update worker verification' });
  }
});

// Payments Management
router.get('/payments', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT p.id, p.transaction_ref, p.amount, p.status, p.created_at,
             u1.name as employer_name, u1.phone as employer_phone,
             u2.name as worker_name
      FROM payments p
      JOIN users u1 ON p.employer_id = u1.id
      JOIN users u2 ON p.worker_id = u2.id
    `;
    
    if (status) {
      sql += ` WHERE p.status = '${status}'`;
    }
    
    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql);
    res.json({ payments: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Verify Payment by ID
router.put('/payments/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'verified' or 'rejected'

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await run(
      "UPDATE payments SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, message: `Payment marked as ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Users Management
router.get('/users', async (req, res) => {
  try {
    const { user_type, status } = req.query; // 'worker', 'employer', 'active', 'blocked'
    let sql = `
      SELECT id, name, email, phone, user_type, profile_complete, created_at, is_active
      FROM users
      WHERE 1=1
    `;
    
    if (user_type) {
      sql += ` AND user_type = "${user_type}"`;
    }
    
    if (status === 'active') {
      sql += ' AND (is_active = 1 OR is_active IS NULL)';
    } else if (status === 'blocked') {
      sql += ' AND is_active = 0';
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Block User
router.put('/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Add is_active column if it doesn't exist
    await run(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT 1
    `);

    const result = await run(
      'UPDATE users SET is_active = 0, updated_at = datetime("now") WHERE id = ?',
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User blocked successfully',
      blocked_user: { id, reason: reason || 'Administrative action' }
    });
  } catch (error) {
    console.error('Failed to block user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock User
router.put('/users/:id/unblock', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await run(
      'UPDATE users SET is_active = 1, updated_at = datetime("now") WHERE id = ?',
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User unblocked successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to unblock user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists first
    const userCheck = await query('SELECT name, user_type FROM users WHERE id = ?', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];
    
    // Start transaction
    await run('BEGIN TRANSACTION');

    try {
      // Delete related records based on user type
      if (user.user_type === 'worker') {
        await run('DELETE FROM worker_profiles WHERE user_id = ?', [id]);
        await run('DELETE FROM applications WHERE worker_id = ?', [id]);
      } else if (user.user_type === 'employer') {
        await run('DELETE FROM jobs WHERE employer_id = ?', [id]);
        await run('DELETE FROM payments WHERE employer_id = ?', [id]);
      }

      // Finally delete the user
      await run('DELETE FROM users WHERE id = ?', [id]);
      
      await run('COMMIT TRANSACTION');

      res.json({ 
        success: true, 
        message: `${user.user_type} '${user.name}' deleted successfully`,
        deleted_user: user
      });
    } catch (innerError) {
      await run('ROLLBACK TRANSACTION');
      throw innerError;
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Email Configuration Routes
router.get('/email/config', async (req, res) => {
  try {
    const result = await query('SELECT * FROM email_config WHERE id = 1');
    const config = result.rows[0] || {
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      smtp_from: '',
      smtp_from_name: 'Umukozi Team',
      smtp_secure: 1
    };
    res.json(config);
  } catch (error) {
    console.error('Failed to get email config:', error);
    res.status(500).json({ error: 'Failed to get email configuration' });
  }
});

router.post('/email/config', async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      smtpSecure
    } = req.body;

    // Validate required fields
    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !smtpFrom) {
      return res.status(400).json({ error: 'All SMTP fields are required' });
    }

    // Check if config exists
    const existingConfig = await query('SELECT id FROM email_config WHERE id = 1');
    
    if (existingConfig.rows.length > 0) {
      // Update existing config
      await run(`
        UPDATE email_config 
        SET smtp_host = ?, smtp_port = ?, smtp_username = ?, smtp_password = ?,
            smtp_from = ?, smtp_from_name = ?, smtp_secure = ?, updated_at = datetime('now')
        WHERE id = 1
      `, [smtpHost, smtpPort, smtpUsername, smtpPassword, smtpFrom, smtpFromName, smtpSecure ? 1 : 0]);
    } else {
      // Insert new config
      await run(`
        INSERT INTO email_config (id, smtp_host, smtp_port, smtp_username, smtp_password,
                                smtp_from, smtp_from_name, smtp_secure, created_at, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [smtpHost, smtpPort, smtpUsername, smtpPassword, smtpFrom, smtpFromName, smtpSecure ? 1 : 0]);
    }

    res.json({ success: true, message: 'Email configuration saved successfully' });
  } catch (error) {
    console.error('Failed to save email config:', error);
    res.status(500).json({ error: 'Failed to save email configuration' });
  }
});

router.post('/email/test', async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      smtpSecure
    } = req.body;

    // Create nodemailer transporter for testing
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUsername,
        pass: smtpPassword
      }
    });

    // Send test email
    await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFrom}>`,
      to: smtpFrom, // Send to the from address for testing
      subject: 'Umukozi Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Email Configuration Test</h2>
          <p>This is a test email to confirm that your SMTP configuration is working correctly.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${smtpHost}</li>
              <li><strong>SMTP Port:</strong> ${smtpPort}</li>
              <li><strong>From Email:</strong> ${smtpFrom}</li>
              <li><strong>Secure Connection:</strong> ${smtpSecure ? 'Enabled' : 'Disabled'}</li>
            </ul>
          </div>
          <p>If you received this email, your email configuration is working properly!</p>
          <p style="color: #6b7280; font-size: 14px;">
            Sent from Umukozi Admin Panel at ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Failed to send test email:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

// System Settings Routes
router.get('/settings', async (req, res) => {
  try {
    const result = await query('SELECT * FROM system_settings WHERE id = 1');
    const settings = result.rows[0] || {
      site_name: 'Umukozi',
      site_url: 'https://umukozi.com',
      admin_email: '',
      enable_email_notifications: 1
    };
    res.json(settings);
  } catch (error) {
    console.error('Failed to get system settings:', error);
    res.status(500).json({ error: 'Failed to get system settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const {
      siteName,
      siteUrl,
      adminEmail,
      enableEmailNotifications
    } = req.body;

    // Check if settings exist
    const existingSettings = await query('SELECT id FROM system_settings WHERE id = 1');
    
    if (existingSettings.rows.length > 0) {
      // Update existing settings
      await run(`
        UPDATE system_settings 
        SET site_name = ?, site_url = ?, admin_email = ?, 
            enable_email_notifications = ?, updated_at = datetime('now')
        WHERE id = 1
      `, [siteName, siteUrl, adminEmail, enableEmailNotifications ? 1 : 0]);
    } else {
      // Insert new settings
      await run(`
        INSERT INTO system_settings (id, site_name, site_url, admin_email, 
                                    enable_email_notifications, created_at, updated_at)
        VALUES (1, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [siteName, siteUrl, adminEmail, enableEmailNotifications ? 1 : 0]);
    }

    res.json({ success: true, message: 'System settings saved successfully' });
  } catch (error) {
    console.error('Failed to save system settings:', error);
    res.status(500).json({ error: 'Failed to save system settings' });
  }
});

module.exports = router;
