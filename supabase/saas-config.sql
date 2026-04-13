-- SaaS Operational Config Expansion
-- [SAFE]: Run this in your Supabase SQL Editor.

DO $$ 
BEGIN 
    -- 1. Add Business Config JSONB for complex settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='business_config') THEN 
        ALTER TABLE public.farms ADD COLUMN business_config JSONB DEFAULT '{
            "tax_enabled": false,
            "tax_rate": 15,
            "notifications": {"email": true, "whatsapp": true},
            "shop_status": "open",
            "official_name": "",
            "trading_address": ""
        }'::jsonb; 
    END IF;

    -- 2. Ensure owner_id is captured correctly for RLS if not already
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farms' AND column_name='owner_id') THEN 
        ALTER TABLE public.farms ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
