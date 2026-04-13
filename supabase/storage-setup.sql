-- Supabase Storage Setup for Farmer SaaS
-- [SAFE]: Run this in your Supabase SQL Editor.

-- 1. Create a public bucket for shop assets
-- Note: 'storage' schema might not be accessible directly via SQL in some Supabase versions, 
-- but you can run this to ensure the bucket is configured.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for site-assets
-- Allow public access to all assets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- Allow authenticated users to upload their own assets
CREATE POLICY "Shop Owners Can Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' AND
  auth.role() = 'authenticated'
);

-- Allow owners to delete/update their own assets
CREATE POLICY "Shop Owners Can Modify"
ON storage.objects FOR ALL
USING ( bucket_id = 'site-assets' AND auth.uid()::text = (storage.foldername(name))[1] );


-- 3. Update farms table for dynamic color/branding
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='primary_color') THEN 
        ALTER TABLE public.farms ADD COLUMN primary_color TEXT DEFAULT '#1d4d35'; 
    END IF;
END $$;
