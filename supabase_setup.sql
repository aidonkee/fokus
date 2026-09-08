-- Setup Database Schema for School Photography Service

-- 1. Create tables
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'single', 'spread')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE landing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID UNIQUE NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Setup Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security (RLS)

-- Enable RLS on tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;

-- Schools: Anyone can read, only authenticated can insert/update/delete
CREATE POLICY "Public profiles are viewable by everyone" ON schools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert schools" ON schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update schools" ON schools FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete schools" ON schools FOR DELETE USING (auth.role() = 'authenticated');

-- Classes: Anyone can read, only authenticated can insert/update/delete
CREATE POLICY "Public classes are viewable by everyone" ON classes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert classes" ON classes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update classes" ON classes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete classes" ON classes FOR DELETE USING (auth.role() = 'authenticated');

-- Photos: Anyone can read, only authenticated can insert/update/delete
CREATE POLICY "Public photos are viewable by everyone" ON photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert photos" ON photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update photos" ON photos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete photos" ON photos FOR DELETE USING (auth.role() = 'authenticated');

-- Landing Config: Anyone can read, only authenticated can insert/update/delete
CREATE POLICY "Public landing_config are viewable by everyone" ON landing_config FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert landing_config" ON landing_config FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update landing_config" ON landing_config FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete landing_config" ON landing_config FOR DELETE USING (auth.role() = 'authenticated');

-- Storage Policies for 'photos' bucket
-- Allow public to select photos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
-- Allow authenticated users to insert/upload photos
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
-- Allow authenticated users to update photos
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
-- Allow authenticated users to delete photos
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- ============================================================
-- MIGRATION: Run this separately if you already have the base schema
-- ============================================================
-- ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_type_check;
-- ALTER TABLE photos ADD CONSTRAINT photos_type_check CHECK (type IN ('group', 'single', 'spread'));
-- Then run the CREATE TABLE landing_config and its RLS policies above.

