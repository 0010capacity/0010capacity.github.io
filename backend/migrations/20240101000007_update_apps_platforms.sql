-- Update apps table: platform -> platforms (array), and rename download_links to distribution_channels

-- Step 1: Add new platforms column (array)
ALTER TABLE apps ADD COLUMN platforms TEXT[] DEFAULT '{}';

-- Step 2: Migrate existing platform data to platforms array
UPDATE apps SET platforms = ARRAY[platform] WHERE platform IS NOT NULL;

-- Step 3: Rename download_links to distribution_channels for clarity
ALTER TABLE apps RENAME COLUMN download_links TO distribution_channels;

-- Step 4: Drop old platform column
ALTER TABLE apps DROP COLUMN platform;

-- Step 5: Add index for platforms array
CREATE INDEX idx_apps_platforms ON apps USING GIN(platforms);

-- Drop old platform index
DROP INDEX IF EXISTS idx_apps_platform;

-- Add comment for distribution_channels structure
COMMENT ON COLUMN apps.distribution_channels IS 'JSON array of distribution channels: [{"type": "app_store|play_store|web|steam|stove|landing_page|direct_download", "url": "...", "label": "..."}]';
