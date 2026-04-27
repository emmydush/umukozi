-- Update jobs job_type constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_job_type_check CHECK (job_type IN ('full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'live-out', 'go-home'));

-- Update worker_profiles availability constraint
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_availability_check;
ALTER TABLE worker_profiles ADD CONSTRAINT worker_profiles_availability_check CHECK (availability IN ('full-time', 'part-time', 'weekends', 'flexible', 'live-in', 'live-out', 'go-home', 'available', 'unavailable', 'hired', 'unhired'));
