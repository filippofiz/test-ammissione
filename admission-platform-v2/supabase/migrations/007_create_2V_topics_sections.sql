-- Migration: Create 2V_topics_sections lookup table
-- Date: 2025-11-15
-- Purpose: Centralized topic/section management with test type associations

-- ============================================================================
-- 2V_TOPICS_SECTIONS - Lookup table for test topics/sections
-- ============================================================================

CREATE TABLE IF NOT EXISTS "2V_topics_sections" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Topic (from argomento field)
  argomento TEXT NOT NULL,

  -- Subject area (from Materia field, nullable)
  materia TEXT,

  -- Which test types can use this topic combination
  available_for_test_types JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- UNIQUE constraint: argomento + materia together
  UNIQUE(argomento, materia)
);

-- ============================================================================
-- VALIDATION: available_for_test_types must be array
-- ============================================================================

ALTER TABLE "2V_topics_sections" ADD CONSTRAINT check_test_types_is_array
CHECK (jsonb_typeof(available_for_test_types) = 'array');

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_2V_topics_sections_argomento ON "2V_topics_sections"(argomento);
CREATE INDEX idx_2V_topics_sections_materia ON "2V_topics_sections"(materia);
CREATE INDEX idx_2V_topics_sections_active ON "2V_topics_sections"(is_active);

-- Composite index for lookup
CREATE INDEX idx_2V_topics_sections_argomento_materia ON "2V_topics_sections"(argomento, materia);

-- GIN index for fast JSONB queries (find topics by test type)
CREATE INDEX idx_2V_topics_sections_test_types_gin ON "2V_topics_sections" USING GIN (available_for_test_types);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_2V_topics_sections_updated_at ON "2V_topics_sections";
CREATE TRIGGER update_2V_topics_sections_updated_at
  BEFORE UPDATE ON "2V_topics_sections"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POPULATE with ALL unique (argomento, materia) combinations from questions
-- Extracts from BOTH argomento field AND section field
-- ============================================================================

-- Extract from argomento field
INSERT INTO "2V_topics_sections" (argomento, materia, available_for_test_types)
SELECT DISTINCT
  INITCAP(TRIM(q.argomento)) AS argomento,
  CASE
    WHEN q."Materia" IS NOT NULL AND TRIM(q."Materia") != '' THEN INITCAP(TRIM(q."Materia"))
    ELSE NULL
  END AS materia,
  -- Aggregate all test types that use this combination
  (
    SELECT jsonb_agg(DISTINCT TRIM(REPLACE(tipologia_test, ' PDF', '')))
    FROM questions q2
    WHERE INITCAP(TRIM(q2.argomento)) = INITCAP(TRIM(q.argomento))
      AND (
        (q."Materia" IS NULL AND q2."Materia" IS NULL)
        OR INITCAP(TRIM(q2."Materia")) = INITCAP(TRIM(q."Materia"))
      )
  ) AS available_for_test_types
FROM questions q
WHERE q.argomento IS NOT NULL
  AND TRIM(q.argomento) != ''
  -- Exclude generic category names from argomento (hardcoded list)
  AND LOWER(TRIM(q.argomento)) NOT IN (
    'assessment iniziale',
    'assessment',
    'simulazioni',
    'simulazione',
    'esercizi per casa',
    'test',
    'training'
  )
  -- Exclude generic category names from materia (hardcoded list)
  AND (
    q."Materia" IS NULL
    OR (
      TRIM(q."Materia") != ''
      AND LOWER(TRIM(q."Materia")) NOT IN (
        'assessment iniziale',
        'assessment',
        'simulazioni',
        'simulazione',
        'esercizi per casa',
        'test',
        'training'
      )
    )
  )
ON CONFLICT (argomento, materia) DO NOTHING;

-- Extract from section field
INSERT INTO "2V_topics_sections" (argomento, materia, available_for_test_types)
SELECT DISTINCT
  INITCAP(TRIM(q.section)) AS argomento,
  CASE
    WHEN q."Materia" IS NOT NULL AND TRIM(q."Materia") != '' THEN INITCAP(TRIM(q."Materia"))
    ELSE NULL
  END AS materia,
  -- Aggregate all test types that use this combination
  (
    SELECT jsonb_agg(DISTINCT TRIM(REPLACE(tipologia_test, ' PDF', '')))
    FROM questions q2
    WHERE INITCAP(TRIM(q2.section)) = INITCAP(TRIM(q.section))
      AND (
        (q."Materia" IS NULL AND q2."Materia" IS NULL)
        OR INITCAP(TRIM(q2."Materia")) = INITCAP(TRIM(q."Materia"))
      )
  ) AS available_for_test_types
FROM questions q
WHERE q.section IS NOT NULL
  AND TRIM(q.section) != ''
  -- Exclude generic category names from section (hardcoded list)
  AND LOWER(TRIM(q.section)) NOT IN (
    'assessment iniziale',
    'assessment',
    'simulazioni',
    'simulazione',
    'esercizi per casa',
    'test',
    'training'
  )
  -- Exclude generic category names from materia (hardcoded list)
  AND (
    q."Materia" IS NULL
    OR (
      TRIM(q."Materia") != ''
      AND LOWER(TRIM(q."Materia")) NOT IN (
        'assessment iniziale',
        'assessment',
        'simulazioni',
        'simulazione',
        'esercizi per casa',
        'test',
        'training'
      )
    )
  )
ON CONFLICT (argomento, materia) DO NOTHING;

-- ============================================================================
-- POPULATE with ALL unique (argomento, materia) combinations from banca_dati
-- Extracts from BOTH argomento field AND section field
-- NOTE: Only runs if banca_dati table exists
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banca_dati') THEN
    -- Extract from argomento field
    INSERT INTO "2V_topics_sections" (argomento, materia, available_for_test_types)
    SELECT DISTINCT
      INITCAP(TRIM(bd.argomento)) AS argomento,
      CASE
        WHEN bd."Materia" IS NOT NULL AND TRIM(bd."Materia") != '' THEN INITCAP(TRIM(bd."Materia"))
        ELSE NULL
      END AS materia,
      -- Aggregate all test types that use this combination
      (
        SELECT jsonb_agg(DISTINCT bd2.tipologia_test)
        FROM banca_dati bd2
        WHERE INITCAP(TRIM(bd2.argomento)) = INITCAP(TRIM(bd.argomento))
          AND (
            (bd."Materia" IS NULL AND bd2."Materia" IS NULL)
            OR INITCAP(TRIM(bd2."Materia")) = INITCAP(TRIM(bd."Materia"))
          )
      ) AS available_for_test_types
    FROM banca_dati bd
    WHERE bd.argomento IS NOT NULL
      AND TRIM(bd.argomento) != ''
      -- Exclude generic category names from argomento (hardcoded list)
      AND LOWER(TRIM(bd.argomento)) NOT IN (
        'assessment iniziale',
        'assessment',
        'simulazioni',
        'simulazione',
        'esercizi per casa',
        'test',
        'training'
      )
      -- Exclude generic category names from materia (hardcoded list)
      AND (
        bd."Materia" IS NULL
        OR (
          TRIM(bd."Materia") != ''
          AND LOWER(TRIM(bd."Materia")) NOT IN (
            'assessment iniziale',
            'assessment',
            'simulazioni',
            'simulazione',
            'esercizi per casa',
            'test',
            'training'
          )
        )
      )
    ON CONFLICT (argomento, materia)
    DO UPDATE SET
      -- Merge test types from both sources
      available_for_test_types = (
        SELECT jsonb_agg(DISTINCT elem)
        FROM (
          SELECT jsonb_array_elements_text(EXCLUDED.available_for_test_types) AS elem
          UNION
          SELECT jsonb_array_elements_text("2V_topics_sections".available_for_test_types) AS elem
        ) combined
      );

    -- Extract from section field
    INSERT INTO "2V_topics_sections" (argomento, materia, available_for_test_types)
    SELECT DISTINCT
      INITCAP(TRIM(bd.section)) AS argomento,
      CASE
        WHEN bd."Materia" IS NOT NULL AND TRIM(bd."Materia") != '' THEN INITCAP(TRIM(bd."Materia"))
        ELSE NULL
      END AS materia,
      -- Aggregate all test types that use this combination
      (
        SELECT jsonb_agg(DISTINCT bd2.tipologia_test)
        FROM banca_dati bd2
        WHERE INITCAP(TRIM(bd2.section)) = INITCAP(TRIM(bd.section))
          AND (
            (bd."Materia" IS NULL AND bd2."Materia" IS NULL)
            OR INITCAP(TRIM(bd2."Materia")) = INITCAP(TRIM(bd."Materia"))
          )
      ) AS available_for_test_types
    FROM banca_dati bd
    WHERE bd.section IS NOT NULL
      AND TRIM(bd.section) != ''
      -- Exclude generic category names from section (hardcoded list)
      AND LOWER(TRIM(bd.section)) NOT IN (
        'assessment iniziale',
        'assessment',
        'simulazioni',
        'simulazione',
        'esercizi per casa',
        'test',
        'training'
      )
      -- Exclude generic category names from materia (hardcoded list)
      AND (
        bd."Materia" IS NULL
        OR (
          TRIM(bd."Materia") != ''
          AND LOWER(TRIM(bd."Materia")) NOT IN (
            'assessment iniziale',
            'assessment',
            'simulazioni',
            'simulazione',
            'esercizi per casa',
            'test',
            'training'
          )
        )
      )
    ON CONFLICT (argomento, materia)
    DO UPDATE SET
      -- Merge test types from both sources
      available_for_test_types = (
        SELECT jsonb_agg(DISTINCT elem)
        FROM (
          SELECT jsonb_array_elements_text(EXCLUDED.available_for_test_types) AS elem
          UNION
          SELECT jsonb_array_elements_text("2V_topics_sections".available_for_test_types) AS elem
        ) combined
      );

    RAISE NOTICE '✅ Populated sections from banca_dati table (argomento + section + Materia combinations)';
  ELSE
    RAISE NOTICE '⚠️  banca_dati table not found - skipping interactive questions sections';
  END IF;
END $$;

-- ============================================================================
-- ADD well-known sections for specific tests (no Materia - just argomento)
-- ============================================================================

-- GMAT official sections (no Materia)
INSERT INTO "2V_topics_sections" (argomento, materia, available_for_test_types) VALUES
  ('Quantitative Reasoning', NULL, '["GMAT"]'::jsonb),
  ('Verbal Reasoning', NULL, '["GMAT"]'::jsonb),
  ('Data Insights', NULL, '["GMAT"]'::jsonb)
ON CONFLICT (argomento, materia) DO UPDATE SET
  available_for_test_types = (
    SELECT jsonb_agg(DISTINCT elem)
    FROM (
      SELECT jsonb_array_elements_text(EXCLUDED.available_for_test_types) AS elem
      UNION
      SELECT jsonb_array_elements_text("2V_topics_sections".available_for_test_types) AS elem
    ) combined
  );

-- Multi-topic (for tests with mixed sections, no Materia)
INSERT INTO "2V_topics_sections" (argomento, materia, available_for_test_types)
VALUES ('Multi-topic', NULL, '["GMAT", "BOCCONI", "BOCCONI LAW", "SAT", "SAN RAFFAELE", "ARCHED", "TOLC E"]'::jsonb)
ON CONFLICT (argomento, materia) DO UPDATE SET
  available_for_test_types = (
    SELECT jsonb_agg(DISTINCT elem)
    FROM (
      SELECT jsonb_array_elements_text(EXCLUDED.available_for_test_types) AS elem
      UNION
      SELECT jsonb_array_elements_text("2V_topics_sections".available_for_test_types) AS elem
    ) combined
  );

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "2V_topics_sections" ENABLE ROW LEVEL SECURITY;

-- Everyone can view active topics
DROP POLICY IF EXISTS "Everyone can view active topics" ON "2V_topics_sections";
CREATE POLICY "Everyone can view active topics"
  ON "2V_topics_sections" FOR SELECT
  USING (is_active = true);

-- Tutors and admins can manage topics
DROP POLICY IF EXISTS "Tutors and admins manage topics" ON "2V_topics_sections";
CREATE POLICY "Tutors and admins manage topics"
  ON "2V_topics_sections" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON "2V_topics_sections" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON "2V_topics_sections" TO authenticated; -- RLS enforces who can

-- ============================================================================
-- VERIFICATION: Check for data consistency
-- ============================================================================

DO $$
DECLARE
  total_topics INTEGER;
  pdf_topics INTEGER;
  interactive_topics INTEGER;
  topic_record RECORD;
BEGIN
  -- Count total topics
  SELECT COUNT(*) INTO total_topics FROM "2V_topics_sections";

  -- Count unique combinations from PDF questions (argomento + section + materia)
  WITH questions_topics AS (
    -- From argomento field
    SELECT DISTINCT
      INITCAP(TRIM(argomento)) AS topic,
      COALESCE(INITCAP(TRIM("Materia")), '') AS materia
    FROM questions
    WHERE argomento IS NOT NULL
      AND TRIM(argomento) != ''
      AND LOWER(TRIM(argomento)) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training')
      AND ("Materia" IS NULL OR LOWER(TRIM("Materia")) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training'))

    UNION

    -- From section field
    SELECT DISTINCT
      INITCAP(TRIM(section)) AS topic,
      COALESCE(INITCAP(TRIM("Materia")), '') AS materia
    FROM questions
    WHERE section IS NOT NULL
      AND TRIM(section) != ''
      AND LOWER(TRIM(section)) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training')
      AND ("Materia" IS NULL OR LOWER(TRIM("Materia")) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training'))
  )
  SELECT COUNT(*) INTO pdf_topics FROM questions_topics;

  -- Count unique combinations from interactive questions (argomento + section + materia)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banca_dati') THEN
    WITH banca_dati_topics AS (
      -- From argomento field
      SELECT DISTINCT
        INITCAP(TRIM(argomento)) AS topic,
        COALESCE(INITCAP(TRIM("Materia")), '') AS materia
      FROM banca_dati
      WHERE argomento IS NOT NULL
        AND TRIM(argomento) != ''
        AND LOWER(TRIM(argomento)) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training')
        AND ("Materia" IS NULL OR LOWER(TRIM("Materia")) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training'))

      UNION

      -- From section field
      SELECT DISTINCT
        INITCAP(TRIM(section)) AS topic,
        COALESCE(INITCAP(TRIM("Materia")), '') AS materia
      FROM banca_dati
      WHERE section IS NOT NULL
        AND TRIM(section) != ''
        AND LOWER(TRIM(section)) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training')
        AND ("Materia" IS NULL OR LOWER(TRIM("Materia")) NOT IN ('assessment iniziale', 'assessment', 'simulazioni', 'simulazione', 'esercizi per casa', 'test', 'training'))
    )
    SELECT COUNT(*) INTO interactive_topics FROM banca_dati_topics;
  ELSE
    interactive_topics := 0;
  END IF;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Topics/Sections Created';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total combinations in 2V_topics_sections: %', total_topics;
  RAISE NOTICE 'Unique (argomento, materia) from questions: %', pdf_topics;
  RAISE NOTICE 'Unique (argomento, materia) from banca_dati: %', interactive_topics;
  RAISE NOTICE '============================================';

  -- List all topics
  RAISE NOTICE 'Topics created:';
  FOR topic_record IN
    SELECT
      argomento,
      materia,
      jsonb_array_length(available_for_test_types) as test_count
    FROM "2V_topics_sections"
    ORDER BY argomento, materia NULLS FIRST
  LOOP
    IF topic_record.materia IS NOT NULL THEN
      RAISE NOTICE '  - % / % (% test types)', topic_record.argomento, topic_record.materia, topic_record.test_count;
    ELSE
      RAISE NOTICE '  - % (% test types)', topic_record.argomento, topic_record.test_count;
    END IF;
  END LOOP;
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "2V_topics_sections" IS 'Lookup table for topic/subject combinations with test type associations';
COMMENT ON COLUMN "2V_topics_sections".argomento IS 'Topic name (from argomento field, normalized)';
COMMENT ON COLUMN "2V_topics_sections".materia IS 'Subject area (from Materia field, nullable, normalized)';
COMMENT ON COLUMN "2V_topics_sections".available_for_test_types IS 'JSONB array of test types that can use this (argomento, materia) combination';
COMMENT ON CONSTRAINT "2V_topics_sections_argomento_materia_key" ON "2V_topics_sections" IS 'Unique constraint on (argomento, materia) combination';

-- ============================================================================
-- EXAMPLE QUERIES (for documentation)
-- ============================================================================

/*
-- Get all topics available for GMAT
SELECT name, description
FROM "2V_topics_sections"
WHERE available_for_test_types @> '"GMAT"'::jsonb
AND is_active = true;

-- Get all test types that use "Algebra"
SELECT name, available_for_test_types
FROM "2V_topics_sections"
WHERE name = 'Algebra';

-- Add new topic
INSERT INTO "2V_topics_sections" (name, available_for_test_types, description)
VALUES ('Logic', '["GMAT", "BOCCONI"]'::jsonb, 'Logical reasoning');

-- Add test type to existing topic
UPDATE "2V_topics_sections"
SET available_for_test_types = available_for_test_types || '"NEW_TEST"'::jsonb
WHERE name = 'Algebra';
*/
