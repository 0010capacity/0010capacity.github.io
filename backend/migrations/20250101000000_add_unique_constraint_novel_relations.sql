-- Add unique constraint to novel_relations table
-- This allows us to use ON CONFLICT in INSERT statements

ALTER TABLE novel_relations
ADD CONSTRAINT unique_novel_relations UNIQUE (novel_id, related_novel_id);
