-- Allow chapter titles to be optional (nullable)
ALTER TABLE novel_chapters
ALTER COLUMN title DROP NOT NULL;
