-- Add missing columns to apps table
ALTER TABLE apps
ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS distribution_channels JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS privacy_policy_url VARCHAR(500);
