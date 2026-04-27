const nodemailer = require('nodemailer');
const { query } = require('../config/database');

class EmailService {
  constructor() {
    this.transporter = null;
    this.config = null;
  }

  // Force re-initialization (useful when config changes)
  async reloadConfig() {
    this.transporter = null;
    this.config = null;
    return await this.initialize();
  }

  // Initialize email service with current configuration
  async initialize() {
    try {
      const result = await query('SELECT * FROM email_config WHERE id = 1');
      this.config = result.rows[0];
      
      if (!this.config || !this.config.smtp_host) {
        console.log('Email service: No configuration found');
        return false;
      }

      this.transporter = nodemailer.createTransport({
        host: this.config.smtp_host,
        port: this.config.smtp_port,
        secure: this.config.smtp_secure === 1,
        tls: {
          rejectUnauthorized: false
        },
        auth: {
          user: this.config.smtp_username,
          pass: this.config.smtp_password
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      return false;
    }
  }

  // Send email with error handling
  async sendEmail(to, subject, htmlContent) {
    if (!this.transporter) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Email service not configured');
      }
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.config.smtp_from_name}" <${this.config.smtp_from}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html: htmlContent
      });

      console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  // User registration welcome email
  async sendWelcomeEmail(userEmail, userName, userType) {
    const subject = 'Welcome to Umukozi!';
    const html = this.getWelcomeTemplate(userName, userType);
    return this.sendEmail(userEmail, subject, html);
  }

  // User blocked notification
  async sendUserBlockedEmail(userEmail, userName, reason = '') {
    const subject = 'Your Umukozi Account Has Been Blocked';
    const html = this.getUserBlockedTemplate(userName, reason);
    return this.sendEmail(userEmail, subject, html);
  }

  // User unblocked notification
  async sendUserUnblockedEmail(userEmail, userName) {
    const subject = 'Your Umukozi Account Has Been Reactivated';
    const html = this.getUserUnblockedTemplate(userName);
    return this.sendEmail(userEmail, subject, html);
  }

  // Worker verification email
  async sendWorkerVerificationEmail(userEmail, userName, isVerified) {
    const subject = isVerified ? 'Your Worker Profile Has Been Verified' : 'Your Worker Verification Status';
    const html = this.getWorkerVerificationTemplate(userName, isVerified);
    return this.sendEmail(userEmail, subject, html);
  }

  // Payment status notification
  async sendPaymentStatusEmail(userEmail, userName, paymentDetails, status) {
    const subject = `Payment Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const html = this.getPaymentStatusTemplate(userName, paymentDetails, status);
    return this.sendEmail(userEmail, subject, html);
  }

  // Application status notification
  async sendApplicationStatusEmail(userEmail, userName, jobTitle, companyName, status) {
    const subject = `Application Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const html = this.getApplicationStatusTemplate(userName, jobTitle, companyName, status);
    return this.sendEmail(userEmail, subject, html);
  }

  // Email Templates
  getWelcomeTemplate(userName, userType) {
    const userTypeText = userType === 'worker' ? 'Worker' : 'Employer';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8b5cf6; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Umukozi!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for registering as a <strong>${userTypeText}</strong> on Umukozi! 
            Your account has been successfully created and you can now start using our platform.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8b5cf6; margin-top: 0;">What's Next?</h3>
            ${userType === 'worker' ? `
              <ul style="color: #6b7280;">
                <li>Complete your worker profile with skills and experience</li>
                <li>Wait for admin verification of your profile</li>
                <li>Start browsing and applying for jobs</li>
              </ul>
            ` : `
              <ul style="color: #6b7280;">
                <li>Post job openings for household workers</li>
                <li>Browse and review worker profiles</li>
                <li>Manage applications and hire workers</li>
              </ul>
            `}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.SITE_URL || 'http://localhost:8000'}" 
               style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Umukozi
            </a>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Sent from Umukozi at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  getUserBlockedTemplate(userName, reason) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Account Blocked</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your Umukozi account has been blocked due to a violation of our terms of service.
          </p>
          ${reason ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #991b1b; margin-top: 0;">Reason:</h3>
              <p style="color: #7f1d1d; margin: 0;">${reason}</p>
            </div>
          ` : ''}
          <p style="color: #6b7280; line-height: 1.6;">
            If you believe this is an error, please contact our support team for assistance.
          </p>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Sent from Umukozi at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  getUserUnblockedTemplate(userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Account Reactivated</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Good news! Your Umukozi account has been reactivated and you can now access all platform features.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.SITE_URL || 'http://localhost:8000'}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Sent from Umukozi at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  getWorkerVerificationTemplate(userName, isVerified) {
    const statusColor = isVerified ? '#10b981' : '#f59e0b';
    const statusText = isVerified ? 'Verified' : 'Under Review';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${statusColor}; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Profile ${statusText}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            ${isVerified 
              ? 'Congratulations! Your worker profile has been verified by our admin team. You can now apply for jobs and employers will be able to see your verified status.'
              : 'Your worker profile is currently under review by our admin team. We will notify you once the verification process is complete.'
            }
          </p>
          ${isVerified ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.SITE_URL || 'http://localhost:8000'}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Browse Jobs
              </a>
            </div>
          ` : ''}
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Sent from Umukozi at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  getPaymentStatusTemplate(userName, paymentDetails, status) {
    const statusColor = status === 'verified' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${statusColor}; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Payment ${statusText}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your payment has been ${status}.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Payment Details:</h3>
            <ul style="color: #6b7280;">
              <li><strong>Transaction ID:</strong> ${paymentDetails.transaction_ref}</li>
              <li><strong>Amount:</strong> ${paymentDetails.amount}</li>
              <li><strong>Status:</strong> ${statusText}</li>
            </ul>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Sent from Umukozi at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  getApplicationStatusTemplate(userName, jobTitle, companyName, status) {
    const statusColor = status === 'accepted' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${statusColor}; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Application ${statusText}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your application for the position <strong>${jobTitle}</strong> at ${companyName} has been ${status}.
          </p>
          ${status === 'accepted' ? `
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin-top: 0;">Congratulations!</h3>
              <p style="color: #047857; margin: 0;">The employer has accepted your application. They will contact you soon with next steps.</p>
            </div>
          ` : status === 'rejected' ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #991b1b; margin-top: 0;">Application Not Selected</h3>
              <p style="color: #7f1d1d; margin: 0;">The employer has decided to move forward with other candidates. Keep applying for other opportunities!</p>
            </div>
          ` : ''}
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">Sent from Umukozi at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }
}

module.exports = new EmailService();
