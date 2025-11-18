-- ============================================================================
-- 2V_section_order Table
-- Stores the display order of sections for each test type
-- Used to show tests in a pedagogical order rather than alphabetical
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_section_order" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Test type this order applies to
  test_type TEXT NOT NULL UNIQUE,

  -- Ordered array of section names
  -- Example: ["Matematica", "Logica", "Inglese", "Simulazioni"]
  section_order TEXT[] NOT NULL DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_2V_section_order_test_type
  ON "2V_section_order"(test_type);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE "2V_section_order" ENABLE ROW LEVEL SECURITY;

-- Anyone can read section order (needed for displaying tests)
DROP POLICY IF EXISTS "Anyone can view section order" ON "2V_section_order";
CREATE POLICY "Anyone can view section order"
  ON "2V_section_order" FOR SELECT
  USING (true);

-- Only tutors and admins can modify section order
DROP POLICY IF EXISTS "Tutors can manage section order" ON "2V_section_order";
CREATE POLICY "Tutors can manage section order"
  ON "2V_section_order" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles::jsonb ? 'TUTOR' OR roles::jsonb ? 'ADMIN')
    )
  );

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_2V_section_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_2V_section_order_updated_at ON "2V_section_order";
CREATE TRIGGER trigger_update_2V_section_order_updated_at
  BEFORE UPDATE ON "2V_section_order"
  FOR EACH ROW
  EXECUTE FUNCTION update_2V_section_order_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE "2V_section_order" IS 'Stores display order of test sections for each test type';
COMMENT ON COLUMN "2V_section_order".test_type IS 'Test type (e.g., GMAT, BOCCONI)';
COMMENT ON COLUMN "2V_section_order".section_order IS 'Array of section names in display order';
