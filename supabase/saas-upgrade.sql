-- Poultry SaaS: "Spotify Version" Upgrade Script
-- [SAFE]: Run this in your Supabase SQL Editor to enable self-service onboarding.

-- 1. Create Profiles Table (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'vendor', -- vendor, admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Onboarding Trigger (Auto-create profile on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update Farms table for "Millions of Shops" branding
DO $$ 
BEGIN 
    -- Website Identity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='site_title') THEN 
        ALTER TABLE public.farms ADD COLUMN site_title TEXT; 
    END IF;

    -- Dynamic Images in JSONB Branding (Hero, About, Logo)
    -- We'll just update the default branding JSON if needed, but adding specific columns is safer for RLS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='logo_url') THEN 
        ALTER TABLE public.farms ADD COLUMN logo_url TEXT; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='hero_image_url') THEN 
        ALTER TABLE public.farms ADD COLUMN hero_image_url TEXT; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='about_image_url') THEN 
        ALTER TABLE public.farms ADD COLUMN about_image_url TEXT; 
    END IF;
END $$;

-- 4. Manual Link for existing vendor: newdawn@testing.com
-- This "Claims" the exiting New Dawn farm for your account.
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'newdawn@testing.com' LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Link the profile
        INSERT INTO public.profiles (id, email) VALUES (target_user_id, 'newdawn@testing.com') ON CONFLICT (id) DO NOTHING;
        
        -- Link the farm
        UPDATE public.farms 
        SET owner_id = target_user_id 
        WHERE slug = 'new-dawn' AND (owner_id IS NULL OR owner_id = target_user_id);
    END IF;
END $$;
