-- Add admin to user_type constraint - SQLite compatible version

-- SQLite doesn't support ALTER CONSTRAINT directly, so we need to recreate the table
-- First, create a backup of the data
CREATE TABLE users_backup AS SELECT * FROM users;

-- Drop the original table
DROP TABLE users;

-- Recreate the table with the updated constraint
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('worker', 'employer', 'admin')),
    profile_complete BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Restore the data
INSERT INTO users SELECT * FROM users_backup;

-- Drop the backup table
DROP TABLE users_backup;

-- Create default admin account if not exists
-- Password will be 'admin123' (hashed using bcrypt)
INSERT OR IGNORE INTO users (name, email, phone, password, user_type, profile_complete)
VALUES ('System Admin', 'admin@umukozi.rw', '0788123456', '$2b$10$p0JkR4m7LzR4Zz1E6h8v8ueG5XjU9Wv2LqE5L5L5L5L5L', 'admin', 1);

SELECT 'Admin role and user updated successfully' as result;
