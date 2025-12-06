-- Add tags and published_at columns to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
