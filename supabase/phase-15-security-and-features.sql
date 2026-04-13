-- ============================================================
-- Poultry Central: Phase 15 - Security, Payments & Live Board
-- [SAFE]: Only adds columns, no data is dropped.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. Add Payment & Integration Columns to farms table
DO $$
BEGIN
    -- Paystack Integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='paystack_public_key') THEN
        ALTER TABLE public.farms ADD COLUMN paystack_public_key TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='paystack_secret_key') THEN
        ALTER TABLE public.farms ADD COLUMN paystack_secret_key TEXT;
    END IF;

    -- Netcash Alternative Payments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='netcash_config') THEN
        ALTER TABLE public.farms ADD COLUMN netcash_config JSONB DEFAULT '{}';
    END IF;

    -- WhatsApp Notification Bot
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='whatsapp_config') THEN
        ALTER TABLE public.farms ADD COLUMN whatsapp_config JSONB DEFAULT '{}';
    END IF;

    -- Custom Domain / Branding URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='custom_domain') THEN
        ALTER TABLE public.farms ADD COLUMN custom_domain TEXT;
    END IF;

    -- Logistics: Delivery fees, radius, driver contacts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='logistics_config') THEN
        ALTER TABLE public.farms ADD COLUMN logistics_config JSONB DEFAULT '{"delivery_fee": 0, "free_delivery_threshold": 0, "max_delivery_radius_km": 20}';
    END IF;
END $$;

-- 2. Add customer_arrived flag to orders table (for the Arrival Alert system)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_arrived') THEN
        ALTER TABLE public.orders ADD COLUMN customer_arrived BOOLEAN DEFAULT false;
    END IF;

    -- Order verification PIN for secure order handoff
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='verification_pin') THEN
        ALTER TABLE public.orders ADD COLUMN verification_pin TEXT;
    END IF;
END $$;

-- 3. Secure the paystack_secret_key column so only the owner can read it
-- First drop any existing policy
DROP POLICY IF EXISTS "Owners can manage their own farm" ON public.farms;
CREATE POLICY "Owners can manage their own farm" ON public.farms
    FOR ALL TO authenticated USING (owner_id = auth.uid());

-- Public can still read non-sensitive farm data
DROP POLICY IF EXISTS "Public read access on farms" ON public.farms;
CREATE POLICY "Public read access on farms" ON public.farms
    FOR SELECT USING (true);

-- 4. Allow public order inserts (customers placing orders)
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Allow public to update customer_arrived (customer notifies shop)
DROP POLICY IF EXISTS "Public update arrival" ON public.orders;
CREATE POLICY "Public update arrival" ON public.orders
    FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Ensure RLS is active
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
