-- Poultry Platform SaaS Upgrade Script
-- [SAFE]: No DROP TABLE commands. Run this in your Supabase SQL Editor.

-- 1. Create site_gallery table
CREATE TABLE IF NOT EXISTS public.site_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add security and billing columns to farms table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='owner_id') THEN 
        ALTER TABLE public.farms ADD COLUMN owner_id UUID REFERENCES auth.users(id); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='subscription_status') THEN 
        ALTER TABLE public.farms ADD COLUMN subscription_status TEXT DEFAULT 'trial'; -- trial, active, past_due, cancelled
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='setup_fee_paid') THEN 
        ALTER TABLE public.farms ADD COLUMN setup_fee_paid BOOLEAN DEFAULT false; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='monthly_rate') THEN 
        ALTER TABLE public.farms ADD COLUMN monthly_rate NUMERIC(10, 2) DEFAULT 400.00; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='setup_fee_rate') THEN 
        ALTER TABLE public.farms ADD COLUMN setup_fee_rate NUMERIC(10, 2) DEFAULT 2500.00; 
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_gallery ENABLE ROW LEVEL SECURITY;

-- 4. Set up Policies

-- Public Read Access (For the Landing Pages)
DROP POLICY IF EXISTS "Public read access on farms" ON public.farms;
CREATE POLICY "Public read access on farms" ON public.farms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access on products" ON public.products;
CREATE POLICY "Public read access on products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access on testimonials" ON public.testimonials;
CREATE POLICY "Public read access on testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access on gallery" ON public.site_gallery;
CREATE POLICY "Public read access on gallery" ON public.site_gallery FOR SELECT USING (true);

-- Authenticated Owner Access (Admin Dashboard)
-- Every farm owner can only manage their own data
DROP POLICY IF EXISTS "Owners can manage their own farm" ON public.farms;
CREATE POLICY "Owners can manage their own farm" ON public.farms 
    FOR ALL TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can manage their products" ON public.products;
CREATE POLICY "Owners can manage their products" ON public.products 
    FOR ALL TO authenticated USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage their orders" ON public.orders;
CREATE POLICY "Owners can manage their orders" ON public.orders 
    FOR ALL TO authenticated USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage their testimonials" ON public.testimonials;
CREATE POLICY "Owners can manage their testimonials" ON public.testimonials 
    FOR ALL TO authenticated USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage their gallery" ON public.site_gallery;
CREATE POLICY "Owners can manage their gallery" ON public.site_gallery 
    FOR ALL TO authenticated USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage their batches" ON public.batches;
CREATE POLICY "Owners can manage their batches" ON public.batches 
    FOR ALL TO authenticated USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage their inventory logs" ON public.inventory_logs;
CREATE POLICY "Owners can manage their inventory logs" ON public.inventory_logs 
    FOR ALL TO authenticated USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));
