const nodemailer = require('nodemailer');
const { query } = require('../config/database');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      const result = await query('SELECT * FROM email_config WHERE id = 1');
      if (result.rows.length > 0) {
        const config = result.rows[0];
        this.transporter = nodemailer.createTransport({
          host: config.smtp_host,
          port: config.smtp_port,
          secure: config.smtp_secure === 1,
          auth: {
            user: config.smtp_username,
            pass: config.smtp_password
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log('Email service initialized with database configuration');
      } else {
        console.log('Using default email configuration (no DB config found)');
        // Fallback or wait for admin to configure
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async reloadConfig() {
    console.log('Reloading email service configuration...');
    await this.init();
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      await this.init();
    }

    if (!this.transporter) {
      console.error('Email transporter not initialized. Cannot send email.');
      return false;
    }

    try {
      const result = await query('SELECT smtp_from, smtp_from_name FROM email_config WHERE id = 1');
      const fromEmail = result.rows[0]?.smtp_from || 'noreply@umukozi.com';
      const fromName = result.rows[0]?.smtp_from_name || 'Umukozi Team';

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Wrapper for common email types
  async sendWelcomeEmail(to, userName) {
    const subject = 'Welcome to Umukozi!';
    const html = this.getWelcomeTemplate(userName);
    return await this.sendEmail(to, subject, html);
  }

  async sendWorkerVerificationEmail(to, userName, isVerified) {
    const subject = isVerified ? 'Worker Profile Verified - Umukozi' : 'Worker Profile Update';
    const html = this.getWorkerVerificationTemplate(userName, isVerified);
    return await this.sendEmail(to, subject, html);
  }

  async sendPaymentStatusEmail(to, userName, paymentDetails, status) {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const subject = `Payment ${statusText} - Umukozi`;
    const html = this.getPaymentStatusTemplate(userName, paymentDetails, status);
    return await this.sendEmail(to, subject, html);
  }

  async sendApplicationStatusEmail(to, userName, jobTitle, employerName, status) {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const subject = `Application ${statusText}: ${jobTitle}`;
    const html = this.getApplicationStatusTemplate(userName, jobTitle, employerName, status);
    return await this.sendEmail(to, subject, html);
  }

  async sendUserBlockedEmail(to, userName, reason) {
    const subject = 'Account Notice - Umukozi';
    const html = this.getUserBlockedTemplate(userName, reason);
    return await this.sendEmail(to, subject, html);
  }

  async sendUserUnblockedEmail(to, userName) {
    const subject = 'Account Reactivated - Umukozi';
    const html = this.getUserUnblockedTemplate(userName);
    return await this.sendEmail(to, subject, html);
  }

  // Helper method for professional email layout
  getLayout(content, headerColor = '#3b82f6') {
    const siteUrl = process.env.SITE_URL || 'http://localhost:8000';
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: ${headerColor}; padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">UMUKOZI</h1>
        </div>
        <div style="padding: 40px; background: white;">
          ${content}
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
            <a href="${siteUrl}" style="color: #64748b; text-decoration: none; font-size: 14px;">Visit Website</a>
            <span style="color: #e2e8f0; margin: 0 10px;">•</span>
            <a href="${siteUrl}/contact" style="color: #64748b; text-decoration: none; font-size: 14px;">Support</a>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Umukozi Ltd. All rights reserved.</p>
          <p style="margin: 4px 0 0;">Connecting household workers with opportunities in Kigali.</p>
        </div>
      </div>
    `;
  }

  getWelcomeTemplate(userName) {
    const content = `
      <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Welcome aboard, ${userName}! 🚀</h2>
      <p style="color: #475569; line-height: 1.7; font-size: 16px;">
        We're thrilled to have you join Umukozi. Our mission is to connect skilled household workers with great employers in a secure and efficient way.
      </p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.SITE_URL || 'http://localhost:8000'}/dashboard" 
           style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; transition: all 0.2s;">
          Explore Your Dashboard
        </a>
      </div>
      <p style="color: #475569; font-size: 15px;">
        Get started by completing your profile to unlock all platform features.
      </p>
    `;
    return this.getLayout(content);
  }

  getWorkerVerificationTemplate(userName, isVerified) {
    const color = isVerified ? '#10b981' : '#f59e0b';
    const statusText = isVerified ? 'Identity Verified' : 'Under Review';
    const content = `
      <div style="display: inline-block; background: ${color}15; color: ${color}; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; text-transform: uppercase;">
        Status: ${statusText}
      </div>
      <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Hello ${userName},</h2>
      <p style="color: #475569; line-height: 1.7; font-size: 16px;">
        ${isVerified 
          ? 'Great news! Your worker profile has been **verified** by our team. You now have a verified badge on your profile, which builds trust with potential employers.'
          : 'Your worker profile is currently being reviewed by our administrative team. We will notify you as soon as the verification is complete.'
        }
      </p>
      ${isVerified ? `
        <div style="text-align: center; margin: 35px 0;">
          <a href="${process.env.SITE_URL || 'http://localhost:8000'}/jobs" 
             style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block;">
            Find Jobs Now
          </a>
        </div>
      ` : ''}
    `;
    return this.getLayout(content, color);
  }

  getPaymentStatusTemplate(userName, paymentDetails, status) {
    const color = status === 'verified' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const content = `
      <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Payment Notification</h2>
      <p style="color: #475569; line-height: 1.7; font-size: 16px;">
        Hello ${userName}, your payment status has been updated to <strong>${statusText}</strong>.
      </p>
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #f1f5f9;">
        <h3 style="color: #334155; margin-top: 0; font-size: 16px;">Receipt Details:</h3>
        <table style="width: 100%; color: #64748b; font-size: 14px;">
          <tr><td style="padding: 5px 0;"><strong>Reference:</strong></td><td style="text-align: right;">${paymentDetails.transaction_ref}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Amount:</strong></td><td style="text-align: right; color: #1e293b; font-weight: 700;">RWF ${Number(paymentDetails.amount).toLocaleString()}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td style="text-align: right;">${new Date().toLocaleDateString()}</td></tr>
        </table>
      </div>
      ${status === 'verified' ? `
        <p style="color: #475569; font-size: 15px; text-align: center;">
          You can now access full contact details for workers.
        </p>
      ` : ''}
    `;
    return this.getLayout(content, color);
  }

  getApplicationStatusTemplate(userName, jobTitle, employerName, status) {
    const color = status === 'accepted' ? '#10b981' : status === 'rejected' ? '#64748b' : '#3b82f6';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const content = `
      <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Application Outcome</h2>
      <p style="color: #475569; line-height: 1.7; font-size: 16px;">
        Your application for <strong>${jobTitle}</strong> at ${employerName} has been <strong>${statusText}</strong>.
      </p>
      ${status === 'accepted' ? `
        <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #dcfce7;">
          <h3 style="color: #166534; margin-top: 0; font-size: 17px;">Next Steps</h3>
          <p style="color: #166534; margin: 0; font-size: 15px; line-height: 1.6;">
            The employer has expressed interest in your profile! They will contact you shortly using the phone number provided in your account.
          </p>
        </div>
      ` : status === 'rejected' ? `
        <p style="color: #64748b; line-height: 1.6; font-size: 15px;">
          While this application wasn't selected, there are many other opportunities waiting for you. Keep polishing your profile and applying!
        </p>
      ` : ''}
    `;
    return this.getLayout(content, color);
  }

  getUserBlockedTemplate(userName, reason) {
    const color = '#ef4444';
    const content = `
      <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Important: Account Status</h2>
      <p style="color: #475569; line-height: 1.7; font-size: 16px;">
        Hello ${userName}, your Umukozi account has been <strong>restricted</strong>.
      </p>
      <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #fee2e2;">
        <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">Reason for action:</h3>
        <p style="color: #b91c1c; margin: 0; font-size: 15px; line-height: 1.6;">${reason || 'Administrative policy review.'}</p>
      </div>
      <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
        If you believe this is an error, please reach out to our appeals team.
      </p>
    `;
    return this.getLayout(content, color);
  }

  getUserUnblockedTemplate(userName) {
    const color = '#10b981';
    const content = `
      <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Account Reactivated! 🎉</h2>
      <p style="color: #475569; line-height: 1.7; font-size: 16px;">
        Hello ${userName}, we're happy to inform you that your Umukozi account has been reactivated.
      </p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${process.env.SITE_URL || 'http://localhost:8000'}/login" 
           style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block;">
          Sign In Now
        </a>
      </div>
    `;
    return this.getLayout(content, color);
  }
}

module.exports = new EmailService();
