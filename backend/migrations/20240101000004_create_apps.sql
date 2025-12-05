-- Create apps table
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    platform VARCHAR(50) NOT NULL,
    icon_url VARCHAR(500),
    screenshots TEXT[] DEFAULT '{}',
    download_links JSONB DEFAULT '{}',
    privacy_policy_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_platform ON apps(platform);
