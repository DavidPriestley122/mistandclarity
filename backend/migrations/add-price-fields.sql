-- Add asking price and sale status fields to paintings table
ALTER TABLE paintings
ADD COLUMN IF NOT EXISTS asking_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS sale_status VARCHAR(20) DEFAULT 'available';

-- Add a check constraint for valid sale status values
ALTER TABLE paintings
DROP CONSTRAINT IF EXISTS paintings_sale_status_check;

ALTER TABLE paintings
ADD CONSTRAINT paintings_sale_status_check
CHECK (sale_status IN ('available', 'sold', 'not_for_sale'));
