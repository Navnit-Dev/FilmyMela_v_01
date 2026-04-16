-- Migration: Add has_scenes flag and episode_links for per-episode downloads
-- Created: April 2025

-- ============================================
-- 1. ADD HAS_SCENES COLUMN TO MOVIES TABLE
-- ============================================
ALTER TABLE movies 
  ADD COLUMN IF NOT EXISTS has_scenes BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS episode_links JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS use_episode_links BOOLEAN DEFAULT false;

-- ============================================
-- 2. CREATE INDEX FOR HAS_SCENES FILTER
-- ============================================
CREATE INDEX IF NOT EXISTS idx_movies_has_scenes ON movies(has_scenes) WHERE has_scenes = false;
CREATE INDEX IF NOT EXISTS idx_movies_use_episode_links ON movies(use_episode_links) WHERE use_episode_links = true;

-- ============================================
-- 3. UPDATE EXISTING MOVIES TO SET HAS_SCENES BASED ON SCENES_GALLERY
-- ============================================
UPDATE movies 
SET has_scenes = CASE 
  WHEN scenes_gallery IS NULL OR array_length(scenes_gallery, 1) IS NULL OR array_length(scenes_gallery, 1) = 0 
  THEN false 
  ELSE true 
END;

-- ============================================
-- 4. ADD COMMENTS
-- ============================================
COMMENT ON COLUMN movies.has_scenes IS 'Indicates if the movie has scene images (false = Non-Scened)';
COMMENT ON COLUMN movies.episode_links IS 'Array of episode-specific download links [{episode: 1, quality: "720p", url: "..."}]';
COMMENT ON COLUMN movies.use_episode_links IS 'Toggle to use per-episode links instead of regular download structure';
