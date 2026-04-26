-- Database verification script
-- Check if all tables were created and have data

-- List all tables
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check users table
SELECT 'Users table:' as info;
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN user_type = 'worker' THEN 1 END) as workers,
       COUNT(CASE WHEN user_type = 'employer' THEN 1 END) as employers
FROM users;

-- Check worker profiles
SELECT 'Worker profiles:' as info;
SELECT COUNT(*) as total_profiles, 
       COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_profiles
FROM worker_profiles;

-- Check jobs table
SELECT 'Jobs table:' as info;
SELECT COUNT(*) as total_jobs,
       COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_jobs
FROM jobs;

-- Sample data verification
SELECT 'Sample users:' as info;
SELECT id, name, email, user_type FROM users LIMIT 3;

SELECT 'Sample worker profiles:' as info;
SELECT u.name, wp.location, wp.availability, wp.expected_salary 
FROM users u 
JOIN worker_profiles wp ON u.id = wp.user_id 
LIMIT 2;

SELECT 'Sample jobs:' as info;
SELECT title, location, job_type, salary_range_min, salary_range_max 
FROM jobs 
LIMIT 2;
