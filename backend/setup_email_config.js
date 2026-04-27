const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'umukozi.db'));

function setupEmailConfiguration() {
    console.log('=== Setting Up Email Configuration ===');
    
    // Default email configuration (using Gmail SMTP)
    const emailConfig = {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: 'your-email@gmail.com',  // Replace with actual email
        smtp_password: 'your-app-password',     // Replace with actual app password
        smtp_from: 'your-email@gmail.com',      // Replace with actual email
        smtp_from_name: 'Umukozi Team',
        smtp_secure: 0  // 0 for TLS, 1 for SSL
    };
    
    // Check if config exists
    db.get('SELECT id FROM email_config WHERE id = 1', (err, row) => {
        if (err) {
            console.error('Error checking email config:', err);
            return;
        }
        
        if (row) {
            console.log('Email configuration already exists. Updating...');
            // Update existing config
            db.run(`
                UPDATE email_config 
                SET smtp_host = ?, smtp_port = ?, smtp_username = ?, smtp_password = ?,
                    smtp_from = ?, smtp_from_name = ?, smtp_secure = ?, updated_at = datetime('now')
                WHERE id = 1
            `, [
                emailConfig.smtp_host,
                emailConfig.smtp_port,
                emailConfig.smtp_username,
                emailConfig.smtp_password,
                emailConfig.smtp_from,
                emailConfig.smtp_from_name,
                emailConfig.smtp_secure
            ], function(err) {
                if (err) {
                    console.error('Error updating email config:', err);
                } else {
                    console.log('✅ Email configuration updated successfully!');
                    showEmailInstructions();
                }
                db.close();
            });
        } else {
            console.log('Creating new email configuration...');
            // Insert new config
            db.run(`
                INSERT INTO email_config (id, smtp_host, smtp_port, smtp_username, smtp_password,
                                        smtp_from, smtp_from_name, smtp_secure, created_at, updated_at)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [
                emailConfig.smtp_host,
                emailConfig.smtp_port,
                emailConfig.smtp_username,
                emailConfig.smtp_password,
                emailConfig.smtp_from,
                emailConfig.smtp_from_name,
                emailConfig.smtp_secure
            ], function(err) {
                if (err) {
                    console.error('Error creating email config:', err);
                } else {
                    console.log('✅ Email configuration created successfully!');
                    showEmailInstructions();
                }
                db.close();
            });
        }
    });
}

function showEmailInstructions() {
    console.log('\n📧 EMAIL CONFIGURATION INSTRUCTIONS:');
    console.log('=====================================');
    console.log('1. Go to the Admin Dashboard: http://localhost:8000');
    console.log('2. Login with admin credentials');
    console.log('3. Navigate to "Settings" or "Email Configuration"');
    console.log('4. Update the following fields:');
    console.log('');
    console.log('   SMTP Host: smtp.gmail.com');
    console.log('   SMTP Port: 587');
    console.log('   SMTP Username: your-gmail-address@gmail.com');
    console.log('   SMTP Password: your-gmail-app-password');
    console.log('   From Email: your-gmail-address@gmail.com');
    console.log('   From Name: Umukozi Team');
    console.log('   Secure Connection: No (TLS)');
    console.log('');
    console.log('🔑 GMAIL SETUP REQUIRED:');
    console.log('1. Enable 2-factor authentication on your Gmail account');
    console.log('2. Go to Google Account settings');
    console.log('3. Go to "Security" -> "App passwords"');
    console.log('4. Generate a new app password for "Mail" on "Other device"');
    console.log('5. Use that 16-character app password (not your regular password)');
    console.log('');
    console.log('⚠️  ALTERNATIVE OPTIONS:');
    console.log('- Use SendGrid (recommended for production)');
    console.log('- Use Mailgun');
    console.log('- Use other SMTP service');
    console.log('');
    console.log('🧪 TESTING:');
    console.log('After configuration, click "Test Email" to verify it works.');
    console.log('The test email will be sent to the "From Email" address.');
}

// Run the function
setupEmailConfiguration();
