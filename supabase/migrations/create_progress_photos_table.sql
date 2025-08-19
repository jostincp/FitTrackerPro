-- Create progress_photos table
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cloudflare_r2_key TEXT NOT NULL,
    signed_url TEXT,
    url_expires_at TIMESTAMPTZ,
    photo_type TEXT NOT NULL CHECK (photo_type IN ('front', 'side', 'back', 'custom')),
    photo_date DATE NOT NULL,
    notes TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_photo_date ON progress_photos(photo_date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_photos_photo_type ON progress_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos(user_id, photo_date DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_progress_photos_updated_at
    BEFORE UPDATE ON progress_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own progress photos
CREATE POLICY "Users can view own progress photos" ON progress_photos
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own progress photos
CREATE POLICY "Users can insert own progress photos" ON progress_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own progress photos
CREATE POLICY "Users can update own progress photos" ON progress_photos
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own progress photos
CREATE POLICY "Users can delete own progress photos" ON progress_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON progress_photos TO authenticated;
GRANT SELECT ON progress_photos TO anon;

-- Add comment to table
COMMENT ON TABLE progress_photos IS 'Stores progress photos with Cloudflare R2 integration for secure image storage';