-- Supabase Database Schema untuk AI Image Enhancer

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create image_processing table
CREATE TABLE image_processing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    original_filename TEXT NOT NULL,
    original_url TEXT NOT NULL,
    enhanced_url TEXT,
    model_used TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size BIGINT NOT NULL,
    processing_time INTEGER, -- in seconds
    error_message TEXT
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('original-images', 'original-images', true),
('enhanced-images', 'enhanced-images', true);

-- Set up Row Level Security (RLS)
ALTER TABLE image_processing ENABLE ROW LEVEL SECURITY;

-- Policy untuk public read access
CREATE POLICY "Public can view image processing records" ON image_processing
    FOR SELECT USING (true);

-- Policy untuk public insert
CREATE POLICY "Public can insert image processing records" ON image_processing
    FOR INSERT WITH CHECK (true);

-- Policy untuk public update
CREATE POLICY "Public can update image processing records" ON image_processing
    FOR UPDATE USING (true);

-- Storage policies
CREATE POLICY "Public can upload original images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'original-images');

CREATE POLICY "Public can view original images" ON storage.objects
    FOR SELECT USING (bucket_id = 'original-images');

CREATE POLICY "Public can upload enhanced images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'enhanced-images');

CREATE POLICY "Public can view enhanced images" ON storage.objects
    FOR SELECT USING (bucket_id = 'enhanced-images');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_image_processing_updated_at 
    BEFORE UPDATE ON image_processing 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
