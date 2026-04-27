-- Drop and recreate worker_profiles table with correct schema
DROP TABLE IF EXISTS worker_profiles;

CREATE TABLE worker_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    national_id TEXT,
    profile_photo TEXT,
    id_photo TEXT,
    location TEXT,
    availability TEXT,
    expected_salary INTEGER,
    experience_years INTEGER DEFAULT 0,
    skills TEXT,
    recommendation1_name TEXT,
    recommendation1_phone TEXT,
    recommendation2_name TEXT,
    recommendation2_phone TEXT,
    is_verified BOOLEAN DEFAULT 0,
    verification_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
