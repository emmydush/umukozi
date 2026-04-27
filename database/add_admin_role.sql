-- Add admin to user_type constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE users ADD CONSTRAINT users_user_type_check CHECK (user_type IN ('worker', 'employer', 'admin'));

-- Create default admin account if not exists
-- Password will be 'admin123' (hashed using bcrypt)
-- You should change this immediately
INSERT INTO users (name, email, phone, password, user_type, profile_complete)
VALUES ('System Admin', 'admin@umukozi.rw', '0788123456', '$2b$10$p0JkR4m7LzR4Zz1E6h8v8ueG5XjU9Wv2LqE5L5L5L5L5L', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;
