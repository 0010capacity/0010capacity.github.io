-- Create novels table
CREATE TABLE novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    genre VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_created_at ON novels(created_at DESC);
