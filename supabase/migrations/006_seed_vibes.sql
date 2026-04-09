-- Migration: 006_seed_vibes.sql
-- Vibe lookup table + all 5 palettes (corrected hex codes)

-- ─────────────────────────────────────────────
-- TABLE: vibes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vibes (
  id              TEXT PRIMARY KEY,       -- e.g. 'wildflower'
  display_name    TEXT NOT NULL,
  color_bg        TEXT NOT NULL,          -- 7-char hex, e.g. '#E8ECF8'
  color_primary   TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  color_accent    TEXT NOT NULL,
  color_muted     TEXT NOT NULL
);

ALTER TABLE public.vibes ENABLE ROW LEVEL SECURITY;

-- Publicly readable — no auth required
DROP POLICY IF EXISTS "vibes_select_public" ON public.vibes;
CREATE POLICY "vibes_select_public"
  ON public.vibes FOR SELECT
  USING (true);

-- Only service_role can modify (e.g., add new vibes in future)
DROP POLICY IF EXISTS "vibes_service_role_write" ON public.vibes;
CREATE POLICY "vibes_service_role_write"
  ON public.vibes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- SEED DATA — 5 core vibe palettes
-- All hex codes validated as 6-digit valid values
-- ─────────────────────────────────────────────
INSERT INTO public.vibes (id, display_name, color_bg, color_primary, color_secondary, color_accent, color_muted)
VALUES
  (
    'wildflower',   'Wildflower',
    '#E8ECF8',  -- Frosted Pearl (bg)
    '#A2A6F2',  -- Periwinkle Dream (primary)
    '#B6B9F2',  -- Lilac Sky (secondary)
    '#F28627',  -- Tangerine Glow (accent)
    '#F2AE2E'   -- Golden Honey (muted)
  ),
  (
    'winter_frost', 'Winter Frost',
    '#F8CCAA',  -- Dawn (bg)
    '#525871',  -- Concrete (primary)
    '#857C91',  -- Warm Steel (secondary)
    '#CD9FA0',  -- Rosewood (accent)
    '#F2C1A3'   -- Peaches & Cream (muted)
  ),
  (
    'sakura',       'Sakura',
    '#F2CF2A',  -- Misty Gold (bg)
    '#443025',  -- Dark Chocolate (primary)
    '#7F5836',  -- Aloewood (secondary)
    '#EC9C9D',  -- Sakura Pink (accent)
    '#AA7F66'   -- Milk Tea (muted)
  ),
  (
    'botanical',    'Botanical',
    '#DEC59E',  -- Brandy (bg)
    '#202808',  -- Pine Tree (primary)
    '#33432B',  -- Kombu Green (secondary)
    '#C4866D',  -- Pale Copper (accent)
    '#6A784D'   -- Dingley (muted)
  ),
  (
    'harvest',      'Harvest',
    '#F5EDD6',  -- Cream (bg)
    '#C64632',  -- Tomato (primary)
    '#9DA33C',  -- Pear (secondary)   ← corrected from #C30A3
    '#8E9B7B',  -- Sage (accent)      ← corrected from #9AA98
    '#F2C599'   -- Honey (muted)
  )
ON CONFLICT (id) DO UPDATE SET
  display_name    = EXCLUDED.display_name,
  color_bg        = EXCLUDED.color_bg,
  color_primary   = EXCLUDED.color_primary,
  color_secondary = EXCLUDED.color_secondary,
  color_accent    = EXCLUDED.color_accent,
  color_muted     = EXCLUDED.color_muted;
