-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS novel_relations CASCADE;
DROP TABLE IF EXISTS novel_chapters CASCADE;
DROP TABLE IF EXISTS novels CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS app_distributions CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Recreate novels table
CREATE TABLE novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    novel_type VARCHAR(50),
    genre VARCHAR(100),
    genres TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_status ON novels(status);

-- Recreate novel_chapters table with nullable title
CREATE TABLE novel_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title VARCHAR(500),
    content TEXT NOT NULL,
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

CREATE INDEX idx_chapters_novel_id ON novel_chapters(novel_id);
CREATE INDEX idx_chapters_number ON novel_chapters(novel_id, chapter_number);

-- Recreate novel_relations table
CREATE TABLE novel_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    related_novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    relation_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_relations_novel_id ON novel_relations(novel_id);
CREATE INDEX idx_relations_related_id ON novel_relations(related_novel_id);

-- Recreate blog_posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    published BOOLEAN DEFAULT FALSE,
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_published ON blog_posts(published);

-- Recreate apps table
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    github_url VARCHAR(500),
    platforms TEXT[],
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_slug ON apps(slug);

-- Recreate app_distributions table
CREATE TABLE app_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    channel VARCHAR(100) NOT NULL,
    url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_distributions_app_id ON app_distributions(app_id);

-- Recreate admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admins_username ON admins(username);
