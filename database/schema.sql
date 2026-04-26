-- Umukozi Database Schema
-- PostgreSQL database for connecting household workers with employers in Kigali

-- Create database (uncomment if creating new database)
-- CREATE DATABASE umukozi;

-- Users table - stores both workers and employers
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'employer')),
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker profiles table - additional information for workers
CREATE TABLE worker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    profile_photo VARCHAR(500), -- URL or file path
    location VARCHAR(255) NOT NULL,
    availability VARCHAR(50) NOT NULL CHECK (availability IN ('full-time', 'part-time', 'weekends', 'flexible')),
    expected_salary INTEGER NOT NULL, -- in RWF
    experience_years INTEGER NOT NULL DEFAULT 0,
    skills TEXT NOT NULL, -- comma-separated skills
    recommendation1_name VARCHAR(255) NOT NULL,
    recommendation1_phone VARCHAR(20) NOT NULL,
    recommendation2_name VARCHAR(255) NOT NULL,
    recommendation2_phone VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table - job postings by employers
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'weekends', 'flexible')),
    salary_range_min INTEGER, -- in RWF
    salary_range_max INTEGER, -- in RWF
    requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table - worker applications to jobs
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    cover_letter TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, worker_id) -- One application per worker per job
);

-- Messages table - communication between workers and employers
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table - reviews after job completion
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reviewer_id, reviewee_id, job_id) -- One review per reviewer per reviewee per job
);

-- Worker availability calendar
CREATE TABLE worker_availability (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worker_id, date)
);

-- Saved jobs table - workers can save jobs they're interested in
CREATE TABLE saved_jobs (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worker_id, job_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_worker_profiles_location ON worker_profiles(location);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(availability);
CREATE INDEX idx_worker_profiles_salary ON worker_profiles(expected_salary);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Create trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (name, email, phone, password, user_type, profile_complete) VALUES
('Jean Mugabo', 'jean@worker.com', '0788123456', 'password123', 'worker', TRUE),
('Marie Uwimana', 'marie@employer.com', '0722123456', 'password123', 'employer', TRUE),
('Alice Kantengwa', 'alice@worker.com', '0733345678', 'password123', 'worker', TRUE);

INSERT INTO worker_profiles (user_id, national_id, profile_photo, location, availability, expected_salary, experience_years, skills, recommendation1_name, recommendation1_phone, recommendation2_name, recommendation2_phone, is_verified) VALUES
(1, '1199080012345678', 'https://picsum.photos/seed/jean/200/200.jpg', 'Kiyovu, Kigali', 'full-time', 60000, 3, 'Cooking, Cleaning, Childcare, Laundry', 'Peter Niyoyita', '0788987654', 'Grace Mukamana', '0722987654', TRUE),
(3, '1199050098765432', 'https://picsum.photos/seed/alice/200/200.jpg', 'Nyarutarama, Kigali', 'part-time', 45000, 2, 'Childcare, Cooking, Light Cleaning', 'John Mugisha', '0733123456', 'Sarah Uwase', '0788234567', TRUE);

INSERT INTO jobs (employer_id, title, description, location, job_type, salary_range_min, salary_range_max, requirements) VALUES
(2, 'Experienced Housekeeper Needed', 'Looking for a reliable housekeeper for a family of 4. Duties include cleaning, cooking, and occasional childcare.', 'Kiyovu, Kigali', 'full-time', 55000, 70000, 'Minimum 2 years experience, good references required'),
(2, 'Part-time Nanny', 'Need a part-time nanny for 2 children (ages 3 and 5). Monday to Friday, 8am-12pm.', 'Nyarutarama, Kigali', 'part-time', 40000, 50000, 'Experience with young children, patient and caring personality');

-- Create view for worker search results
CREATE VIEW worker_search_view AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    wp.national_id,
    wp.profile_photo,
    wp.location,
    wp.availability,
    wp.expected_salary,
    wp.experience_years,
    wp.skills,
    wp.is_verified,
    wp.recommendation1_name,
    wp.recommendation1_phone,
    wp.recommendation2_name,
    wp.recommendation2_phone
FROM users u
JOIN worker_profiles wp ON u.id = wp.user_id
WHERE u.user_type = 'worker' AND u.profile_complete = TRUE;

-- Create view for job listings with employer info
CREATE VIEW job_listings_view AS
SELECT 
    j.id,
    j.title,
    j.description,
    j.location,
    j.job_type,
    j.salary_range_min,
    j.salary_range_max,
    j.requirements,
    j.created_at,
    e.name as employer_name,
    e.email as employer_email,
    e.phone as employer_phone
FROM jobs j
JOIN users e ON j.employer_id = e.id
WHERE j.is_active = TRUE;

-- Create function to search workers by criteria
CREATE OR REPLACE FUNCTION search_workers(
    search_location TEXT DEFAULT NULL,
    search_skills TEXT DEFAULT NULL,
    search_availability TEXT DEFAULT NULL,
    min_salary INTEGER DEFAULT NULL,
    max_salary INTEGER DEFAULT NULL,
    min_experience INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    profile_photo VARCHAR,
    location VARCHAR,
    availability VARCHAR,
    expected_salary INTEGER,
    experience_years INTEGER,
    skills TEXT,
    is_verified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wsv.id,
        wsv.name,
        wsv.email,
        wsv.phone,
        wsv.profile_photo,
        wsv.location,
        wsv.availability,
        wsv.expected_salary,
        wsv.experience_years,
        wsv.skills,
        wsv.is_verified
    FROM worker_search_view wsv
    WHERE 
        (search_location IS NULL OR LOWER(wsv.location) LIKE LOWER('%' || search_location || '%'))
        AND (search_skills IS NULL OR LOWER(wsv.skills) LIKE LOWER('%' || search_skills || '%'))
        AND (search_availability IS NULL OR wsv.availability = search_availability)
        AND (min_salary IS NULL OR wsv.expected_salary >= min_salary)
        AND (max_salary IS NULL OR wsv.expected_salary <= max_salary)
        AND (min_experience IS NULL OR wsv.experience_years >= min_experience)
    ORDER BY wsv.is_verified DESC, wsv.experience_years DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get worker statistics
CREATE OR REPLACE FUNCTION get_worker_stats()
RETURNS TABLE (
    total_workers INTEGER,
    verified_workers INTEGER,
    avg_salary NUMERIC,
    avg_experience NUMERIC,
    by_location TEXT,
    worker_count INTEGER
) AS $$
BEGIN
    -- Return summary stats
    RETURN QUERY
    SELECT 
        COUNT(*) as total_workers,
        COUNT(*) FILTER (WHERE is_verified = TRUE) as verified_workers,
        AVG(expected_salary) as avg_salary,
        AVG(experience_years) as avg_experience,
        location as by_location,
        COUNT(*) as worker_count
    FROM worker_search_view
    GROUP BY location;
END;
$$ LANGUAGE plpgsql;
