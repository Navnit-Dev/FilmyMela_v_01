-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  duration TEXT,
  genre TEXT[] DEFAULT '{}',
  industry TEXT,
  release_year INTEGER,
  cast TEXT[] DEFAULT '{}',
  poster_url TEXT NOT NULL,
  scenes_gallery TEXT[] DEFAULT '{}',
  video_url TEXT,
  download_urls JSONB DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  sequence INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SuperAdmin', 'Admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'We are currently undergoing maintenance. Please check back soon.',
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  telegram_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (maintenance_mode, maintenance_message)
VALUES (false, 'We are currently undergoing maintenance. Please check back soon.')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_featured ON movies(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_movies_trending ON movies(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_movies_visible ON movies(visible) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_movies_industry ON movies(industry);
CREATE INDEX IF NOT EXISTS idx_movies_release_year ON movies(release_year);
CREATE INDEX IF NOT EXISTS idx_movies_sequence ON movies(sequence);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies(created_at DESC);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_movies_search ON movies USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- RLS Policies
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Movies policies
CREATE POLICY "Movies are viewable by everyone" 
  ON movies FOR SELECT 
  USING (visible = true OR auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Movies are editable by admins" 
  ON movies FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

-- Admin users policies
CREATE POLICY "Admin users viewable by authenticated admins" 
  ON admin_users FOR SELECT 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

CREATE POLICY "SuperAdmins can manage admin users" 
  ON admin_users FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'SuperAdmin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'SuperAdmin'));

-- Settings policies
CREATE POLICY "Settings viewable by authenticated admins" 
  ON settings FOR SELECT 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

CREATE POLICY "SuperAdmins can manage settings" 
  ON settings FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'SuperAdmin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'SuperAdmin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;
CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation for admin
CREATE OR REPLACE FUNCTION handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if email matches admin domain or specific emails
  -- This is a safety check - manually insert into admin_users for actual admins
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
