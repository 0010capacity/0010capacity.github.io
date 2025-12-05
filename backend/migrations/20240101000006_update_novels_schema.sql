-- Add novel_type column to novels table
-- novel_type: 'short' (단편), 'long' (장편), 'series' (연재물)
ALTER TABLE novels ADD COLUMN novel_type VARCHAR(50) DEFAULT 'series';

-- Add predefined genres support
-- genre will now be stored as an array for multiple genres
ALTER TABLE novels ADD COLUMN genres TEXT[] DEFAULT '{}';

-- Add related novels support (self-referencing many-to-many)
CREATE TABLE novel_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    related_novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) DEFAULT 'related', -- 'related', 'sequel', 'prequel', 'spinoff', 'same_universe'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(novel_id, related_novel_id),
    CHECK (novel_id != related_novel_id)
);

CREATE INDEX idx_novel_relations_novel_id ON novel_relations(novel_id);
CREATE INDEX idx_novel_relations_related_novel_id ON novel_relations(related_novel_id);

-- Drop cover_image_url column (no longer needed)
ALTER TABLE novels DROP COLUMN IF EXISTS cover_image_url;

-- Update status options comment
-- status: 'draft' (임시저장), 'ongoing' (연재중), 'completed' (완결), 'hiatus' (휴재)

-- Create index for novel_type
CREATE INDEX idx_novels_novel_type ON novels(novel_type);

-- Create index for genres (GIN index for array)
CREATE INDEX idx_novels_genres ON novels USING GIN(genres);
