-- Migration script to add missing columns to worker_profiles table
-- Run this script to update the SQLite database schema

-- Add missing columns to worker_profiles table
ALTER TABLE worker_profiles ADD COLUMN national_id TEXT;
ALTER TABLE worker_profiles ADD COLUMN id_photo TEXT;
ALTER TABLE worker_profiles ADD COLUMN location TEXT;
ALTER TABLE worker_profiles ADD COLUMN experience_years INTEGER DEFAULT 0;
ALTER TABLE worker_profiles ADD COLUMN recommendation1_name TEXT;
ALTER TABLE worker_profiles ADD COLUMN recommendation1_phone TEXT;
ALTER TABLE worker_profiles ADD COLUMN recommendation2_name TEXT;
ALTER TABLE worker_profiles ADD COLUMN recommendation2_phone TEXT;

-- Update existing records to have default values if needed
UPDATE worker_profiles SET 
    experience_years = COALESCE(experience_years, 0),
    national_id = COALESCE(national_id, ''),
    id_photo = COALESCE(id_photo, ''),
    location = COALESCE(location, ''),
    recommendation1_name = COALESCE(recommendation1_name, ''),
    recommendation1_phone = COALESCE(recommendation1_phone, ''),
    recommendation2_name = COALESCE(recommendation2_name, ''),
    recommendation2_phone = COALESCE(recommendation2_phone, '')
WHERE experience_years IS NULL OR national_id IS NULL OR id_photo IS NULL OR location IS NULL 
   OR recommendation1_name IS NULL OR recommendation1_phone IS NULL 
   OR recommendation2_name IS NULL OR recommendation2_phone IS NULL;
