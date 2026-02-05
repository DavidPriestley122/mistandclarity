-- Add subtitle and introduction fields to collections table
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(500),
ADD COLUMN IF NOT EXISTS introduction TEXT;

-- Update existing collections to split description into subtitle and introduction if needed
-- (Optional - can be done manually through the admin interface)
