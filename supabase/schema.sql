-- Multi-Tenant Poultry SaaS Schema
-- Target: Supabase (PostgreSQL)

-- 1. Farms (Vendors/Tenants)
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    farm_type TEXT DEFAULT 'poultry', -- poultry, dairy, etc.
    location TEXT,
    branding JSONB DEFAULT '{
        "primary_color": "#1b4332",
        "secondary_color": "#f5f5dc",
        "accent_color": "#d4af37",
        "logo_url": null,
        "hero_headline": "Fresh Poultry. Trusted Supply. Delivered with Care."
    }'::jsonb,
    contact_info JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Live, Eggs, Slaughtered, etc.
    description TEXT,
    price NUMERIC(10, 2),
    is_price_on_request BOOLEAN DEFAULT false,
    image_url TEXT,
    stock_status TEXT DEFAULT 'in_stock', -- in_stock, out_of_stock, low_stock
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Batches (Inventory Tracking)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    age_weeks INTEGER,
    initial_count INTEGER NOT NULL,
    current_count INTEGER NOT NULL,
    arrival_date DATE,
    health_status TEXT DEFAULT 'healthy', -- healthy, critical, recovered
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    total_price NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
    fulfillment_method TEXT DEFAULT 'pickup', -- pickup, delivery
    delivery_address TEXT,
    preferred_date DATE,
    payment_method TEXT, -- Paystack, Netcash, EFT, Cash
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, deposit_paid, paid
    notes TEXT,
    collection_pin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bookings (Services)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_type TEXT NOT NULL, -- slaughter, bulk delivery, farm visit
    booking_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inventory Logs (Mortality/Loss Tracking)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    reason TEXT NOT NULL, -- sale, mortality, theft, slaughter
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Row Level Security (RLS)
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for Public Access - initially)
-- In a real SaaS, these would use auth.uid() or vendor_id checks
CREATE POLICY "Public read access on farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read access on batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Public all on orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Public all on order_items" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Public all on bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Public all on inventory_logs" ON public.inventory_logs FOR ALL USING (true);

-- 9. Initial Seed Data: The New Dawn Poultry Farm
INSERT INTO public.farms (name, slug, farm_type, location, branding, contact_info)
VALUES (
    'The New Dawn Poultry Farm',
    'new-dawn',
    'poultry',
    'Polokwane, South Africa',
    '{
        "primary_color": "#1b4332",
        "secondary_color": "#f5f5dc",
        "accent_color": "#d4af37",
        "hero_headline": "Fresh Poultry. Trusted Supply. Delivered with Care."
    }'::jsonb,
    '{
        "phone": "+27 12 345 6789",
        "whatsapp": "+27 12 345 6789",
        "address": "123 Farm Road, Polokwane, 0700",
        "operating_hours": "Mon-Sat: 08:00 - 17:00"
    }'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Seed Products for New Dawn
-- We'll need the ID later, but for now just seed with IDs if we can or generic insert
INSERT INTO public.products (farm_id, name, category, description, price, stock_status)
SELECT id, 'Live Chickens (Broilers)', 'Live', 'Healthy, full-grown broilers ready for meat.', 85.00, 'in_stock'
FROM public.farms WHERE slug = 'new-dawn'
UNION ALL
SELECT id, 'Live Chickens (Layers)', 'Live', 'Laying hens for egg production.', 120.00, 'in_stock'
FROM public.farms WHERE slug = 'new-dawn'
UNION ALL
SELECT id, 'Day-Old Chicks', 'Live', 'Quality day-old chicks for your farm.', 12.00, 'in_stock'
FROM public.farms WHERE slug = 'new-dawn'
UNION ALL
SELECT id, 'Fresh Eggs (Crate of 30)', 'Eggs', 'Freshly harvested large eggs.', 65.00, 'in_stock'
FROM public.farms WHERE slug = 'new-dawn'
UNION ALL
SELECT id, 'Slaughtered / Cleaned Chicken', 'Meat', 'Cleaned and ready for cooking.', 95.00, 'in_stock'
FROM public.farms WHERE slug = 'new-dawn'
ON CONFLICT DO NOTHING;
