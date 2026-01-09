-- Add JPEG URL fields to paintings table

ALTER TABLE paintings
ADD COLUMN IF NOT EXISTS jpeg_url_front TEXT,
ADD COLUMN IF NOT EXISTS jpeg_url_reverse TEXT;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_paintings_jpeg_front ON paintings(jpeg_url_front);
CREATE INDEX IF NOT EXISTS idx_paintings_jpeg_reverse ON paintings(jpeg_url_reverse);
