-- Migration: Advanced Movie Platform Features
-- Created: April 2025
-- Features: TMDB integration, Content Types, Download Parts, Genres, Industries

-- ============================================
-- 1. CREATE GENRES TABLE (Admin-managed taxonomy)
-- ============================================
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDUSTRIES TABLE (Admin-managed taxonomy)
-- ============================================
CREATE TABLE IF NOT EXISTS industries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CREATE CONTENT TYPES ENUM/REFERENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS content_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'movie', 'web_series', 'anime'
  label TEXT NOT NULL, -- Display name
  icon TEXT,
  description TEXT,
  has_episodes BOOLEAN DEFAULT false,
  has_seasons BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default content types
INSERT INTO content_types (name, label, icon, description, has_episodes, has_seasons) VALUES
  ('movie', 'Movie', '🎬', 'Full-length feature films', false, false),
  ('web_series', 'Web Series', '📺', 'Multi-episode web series', true, true),
  ('anime', 'Anime', '🎌', 'Japanese animated series/movies', true, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. UPDATE MOVIES TABLE WITH NEW COLUMNS
-- ============================================

-- Add content type reference
ALTER TABLE movies 
  ADD COLUMN IF NOT EXISTS content_type_id UUID REFERENCES content_types(id),
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'movie' CHECK (content_type IN ('movie', 'web_series', 'anime')),
  ADD COLUMN IF NOT EXISTS total_episodes INTEGER,
  ADD COLUMN IF NOT EXISTS seasons INTEGER,
  ADD COLUMN IF NOT EXISTS episode_duration TEXT,
  ADD COLUMN IF NOT EXISTS is_in_parts BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS download_parts JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tmdb_id INTEGER,
  ADD COLUMN IF NOT EXISTS backdrop_url TEXT,
  ADD COLUMN IF NOT EXISTS imdb_id TEXT,
  ADD COLUMN IF NOT EXISTS original_language TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_movies_content_type ON movies(content_type);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_total_episodes ON movies(total_episodes) WHERE total_episodes IS NOT NULL;

-- ============================================
-- 5. CREATE MOVIE_GENRES JUNCTION TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

-- ============================================
-- 6. CREATE MOVIE_INDUSTRIES JUNCTION TABLE (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS movie_industries (
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, industry_id)
);

-- ============================================
-- 7. CREATE TMDB CACHE TABLE (For API optimization)
-- ============================================
CREATE TABLE IF NOT EXISTS tmdb_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(tmdb_id, media_type)
);

CREATE INDEX IF NOT EXISTS idx_tmdb_cache_lookup ON tmdb_cache(tmdb_id, media_type);
CREATE INDEX IF NOT EXISTS idx_tmdb_cache_expires ON tmdb_cache(expires_at);

-- ============================================
-- 8. ENABLE RLS ON NEW TABLES
-- ============================================
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tmdb_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLS POLICIES FOR GENRES
-- ============================================
CREATE POLICY "Genres viewable by everyone" 
  ON genres FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Genres manageable by admins" 
  ON genres FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- ============================================
-- 10. RLS POLICIES FOR INDUSTRIES
-- ============================================
CREATE POLICY "Industries viewable by everyone" 
  ON industries FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Industries manageable by admins" 
  ON industries FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- ============================================
-- 11. RLS POLICIES FOR CONTENT_TYPES
-- ============================================
CREATE POLICY "Content types viewable by everyone" 
  ON content_types FOR SELECT 
  TO authenticated, anon
  USING (true);

-- ============================================
-- 12. RLS POLICIES FOR MOVIE_GENRES
-- ============================================
CREATE POLICY "Movie genres viewable by everyone" 
  ON movie_genres FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Movie genres manageable by admins" 
  ON movie_genres FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- ============================================
-- 13. RLS POLICIES FOR MOVIE_INDUSTRIES
-- ============================================
CREATE POLICY "Movie industries viewable by everyone" 
  ON movie_industries FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Movie industries manageable by admins" 
  ON movie_industries FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- ============================================
-- 14. RLS POLICIES FOR TMDB_CACHE
-- ============================================
CREATE POLICY "TMDB cache viewable by authenticated" 
  ON tmdb_cache FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "TMDB cache manageable by admins" 
  ON tmdb_cache FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- ============================================
-- 15. TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_genres_updated_at ON genres;
CREATE TRIGGER update_genres_updated_at
  BEFORE UPDATE ON genres
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_industries_updated_at ON industries;
CREATE TRIGGER update_industries_updated_at
  BEFORE UPDATE ON industries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 16. INSERT DEFAULT GENRES
-- ============================================
INSERT INTO genres (name, slug, description, sort_order) VALUES
  ('Action', 'action', 'High-energy films with physical stunts and fights', 1),
  ('Adventure', 'adventure', 'Exciting journeys and explorations', 2),
  ('Animation', 'animation', 'Animated films and cartoons', 3),
  ('Comedy', 'comedy', 'Humorous and funny films', 4),
  ('Crime', 'crime', 'Stories about criminals and law enforcement', 5),
  ('Documentary', 'documentary', 'Non-fiction films documenting reality', 6),
  ('Drama', 'drama', 'Serious stories with emotional themes', 7),
  ('Family', 'family', 'Films suitable for all ages', 8),
  ('Fantasy', 'fantasy', 'Magical and supernatural stories', 9),
  ('Horror', 'horror', 'Scary and terrifying films', 10),
  ('Mystery', 'mystery', 'Puzzling stories with secrets to uncover', 11),
  ('Romance', 'romance', 'Love stories and relationships', 12),
  ('Sci-Fi', 'sci-fi', 'Science fiction and futuristic stories', 13),
  ('Thriller', 'thriller', 'Suspenseful and exciting films', 14),
  ('War', 'war', 'Stories about military conflicts', 15),
  ('Western', 'western', 'Stories set in the American Old West', 16)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 17. INSERT DEFAULT INDUSTRIES
-- ============================================
INSERT INTO industries (name, slug, description, country, sort_order) VALUES
  ('Hollywood', 'hollywood', 'American film industry', 'USA', 1),
  ('Bollywood', 'bollywood', 'Hindi-language film industry based in Mumbai', 'India', 2),
  ('Tollywood', 'tollywood', 'Telugu-language film industry', 'India', 3),
  ('Kollywood', 'kollywood', 'Tamil-language film industry', 'India', 4),
  ('Mollywood', 'mollywood', 'Malayalam-language film industry', 'India', 5),
  ('Sandalwood', 'sandalwood', 'Kannada-language film industry', 'India', 6),
  ('Japanese', 'japanese', 'Japanese film industry', 'Japan', 7),
  ('Korean', 'korean', 'South Korean film industry', 'South Korea', 8),
  ('Chinese', 'chinese', 'Chinese film industry', 'China', 9),
  ('British', 'british', 'British film industry', 'UK', 10),
  ('French', 'french', 'French film industry', 'France', 11),
  ('Spanish', 'spanish', 'Spanish-language film industry', 'Spain', 12),
  ('Nollywood', 'nollywood', 'Nigerian film industry', 'Nigeria', 13),
  ('International', 'international', 'Other international films', NULL, 14),
  ('Web Series', 'web-series', 'Digital streaming content', NULL, 15)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 18. CREATE FUNCTION TO CLEAN EXPIRED TMDB CACHE
-- ============================================
CREATE OR REPLACE FUNCTION clean_expired_tmdb_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM tmdb_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 19. CREATE HELPER FUNCTION TO GET MOVIE WITH RELATIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_movie_with_relations(movie_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'movie', to_jsonb(m.*),
    'genres', COALESCE(
      (SELECT jsonb_agg(g.*) 
       FROM movie_genres mg 
       JOIN genres g ON mg.genre_id = g.id 
       WHERE mg.movie_id = m.id),
      '[]'::jsonb
    ),
    'industries', COALESCE(
      (SELECT jsonb_agg(i.*) 
       FROM movie_industries mi 
       JOIN industries i ON mi.industry_id = i.id 
       WHERE mi.movie_id = m.id),
      '[]'::jsonb
    )
  ) INTO result
  FROM movies m
  WHERE m.id = movie_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 20. MIGRATE EXISTING DATA
-- ============================================

-- Migrate existing movies to use content_type
UPDATE movies 
SET content_type = 'movie' 
WHERE content_type IS NULL;

-- Add comment for documentation
COMMENT ON TABLE movies IS 'Movies, Web Series, and Anime content with TMDB integration';
COMMENT ON TABLE genres IS 'Admin-managed genre taxonomy';
COMMENT ON TABLE industries IS 'Admin-managed film industry taxonomy';
COMMENT ON TABLE content_types IS 'Content type definitions (Movie, Web Series, Anime)';
