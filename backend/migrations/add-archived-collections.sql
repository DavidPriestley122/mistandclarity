-- Adds an archived state for collections (past exhibitions).
-- States: active (current show), archived (past show, still public),
-- neither (private draft, admin only).
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
