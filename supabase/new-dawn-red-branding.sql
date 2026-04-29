-- ============================================================
-- New Dawn Poultry red branding backfill
-- Aligns the stored storefront brand with the farm's actual
-- red-and-white identity.
-- ============================================================

UPDATE public.farms
SET
  primary_color = '#b91c1c',
  branding = COALESCE(branding, '{}'::jsonb)
    || jsonb_build_object(
      'primary_color', '#b91c1c'
    )
WHERE slug = 'new-dawn';

NOTIFY pgrst, 'reload schema';
