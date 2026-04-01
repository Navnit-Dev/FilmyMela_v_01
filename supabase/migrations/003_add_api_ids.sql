-- Migration: Add missing API ID columns to movies table
-- Created: April 2025
-- Adds mal_id (MyAnimeList) and tvmaze_id columns for anime and web series

-- Add mal_id column for anime
ALTER TABLE movies 
  ADD COLUMN IF NOT EXISTS mal_id INTEGER,
  ADD COLUMN IF NOT EXISTS tvmaze_id INTEGER;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_movies_mal_id ON movies(mal_id) WHERE mal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_movies_tvmaze_id ON movies(tvmaze_id) WHERE tvmaze_id IS NOT NULL;
