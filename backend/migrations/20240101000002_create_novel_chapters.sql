-- Create novel_chapters table
CREATE TABLE novel_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

CREATE INDEX idx_chapters_novel_id ON novel_chapters(novel_id);
CREATE INDEX idx_chapters_number ON novel_chapters(novel_id, chapter_number);
