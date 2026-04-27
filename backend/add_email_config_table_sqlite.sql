-- Email configuration table - SQLite compatible version
CREATE TABLE IF NOT EXISTS email_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_username TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    smtp_from TEXT NOT NULL,
    smtp_from_name TEXT NOT NULL DEFAULT 'Umukozi Team',
    smtp_secure BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System settings table - SQLite compatible version
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name TEXT NOT NULL DEFAULT 'Umukozi',
    site_url TEXT NOT NULL DEFAULT 'https://umukozi.com',
    admin_email TEXT,
    enable_email_notifications BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default email configuration
INSERT OR IGNORE INTO email_config (id, smtp_host, smtp_port, smtp_username, smtp_password, smtp_from, smtp_from_name, smtp_secure, created_at, updated_at)
VALUES (1, 'smtp.gmail.com', 587, 'your-email@gmail.com', 'your-app-password', 'noreply@umukozi.com', 'Umukozi Team', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (id, site_name, site_url, admin_email, enable_email_notifications, created_at, updated_at)
VALUES (1, 'Umukozi', 'https://umukozi.com', 'admin@umukozi.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT 'Email config and system settings tables created successfully' as result;
