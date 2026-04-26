-- Migration script to add id_photo column to worker_profiles table
-- This fixes the "column wp.id_photo does not exist" error

-- Add id_photo column to worker_profiles table
ALTER TABLE worker_profiles 
ADD COLUMN id_photo VARCHAR(500); -- URL or file path for ID photo

-- Update existing records to have NULL id_photo (optional)
-- UPDATE worker_profiles SET id_photo = NULL WHERE id_photo IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN worker_profiles.id_photo IS 'URL or file path for worker ID verification photo';

-- Output success message
SELECT 'id_photo column added to worker_profiles table successfully' as result;
