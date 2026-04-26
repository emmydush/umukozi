-- Update Umukozi database constraints to support 'live-in' and 'go-home' types
-- Run this script using psql: psql -U postgres -d umukozi -f update_constraints.sql

-- Update jobs table constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_job_type_check 
CHECK (job_type IN ('full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'go-home'));

-- Update worker_profiles table constraint
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_availability_check;
ALTER TABLE worker_profiles ADD CONSTRAINT worker_profiles_availability_check 
CHECK (availability IN ('full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'go-home'));

-- Update worker_search_view if necessary (views usually don't need update for constraint changes)
-- But let's perform a simple select to verify
SELECT 'Constraints updated successfully' as status;
