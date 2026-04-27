-- Migration script to add id_photo column to worker_profiles table
-- SQLite compatible version

-- Add id_photo column to worker_profiles table
ALTER TABLE worker_profiles 
ADD COLUMN id_photo VARCHAR(500); -- URL or file path for ID photo

-- Output success message
SELECT 'id_photo column added to worker_profiles table successfully' as result;
