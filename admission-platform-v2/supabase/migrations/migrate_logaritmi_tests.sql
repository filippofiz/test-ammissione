-- Migration: Migrate Logaritmi ed esponenziali tests from old questions table
-- Date: 2025-11-26
-- Purpose: Migrate Assessment and Esercizi per casa tests to new 2V schema

-- ============================================================================
-- STEP 1: Create tests in 2V_tests
-- ============================================================================

-- Test 1: BOCCONI - Logaritmi ed esponenziali - Assessment Monotematico #1
INSERT INTO "2V_tests" (
  test_type,
  section,
  exercise_type,
  test_number,
  format,
  default_duration_mins,
  is_active
) VALUES (
  'BOCCONI',
  'Logaritmi ed esponenziali',
  'Assessment Monotematico',
  1,
  'pdf',
  30,
  true
)
ON CONFLICT (test_type, section, exercise_type, test_number, format) DO NOTHING
RETURNING id;

-- Test 2: BOCCONI - Logaritmi ed esponenziali - Training #1
INSERT INTO "2V_tests" (
  test_type,
  section,
  exercise_type,
  test_number,
  format,
  default_duration_mins,
  is_active
) VALUES (
  'BOCCONI',
  'Logaritmi ed esponenziali',
  'Training',
  1,
  'pdf',
  30,
  true
)
ON CONFLICT (test_type, section, exercise_type, test_number, format) DO NOTHING
RETURNING id;

-- Test 3: BOCCONI - Logaritmi ed esponenziali - Training #2
INSERT INTO "2V_tests" (
  test_type,
  section,
  exercise_type,
  test_number,
  format,
  default_duration_mins,
  is_active
) VALUES (
  'BOCCONI',
  'Logaritmi ed esponenziali',
  'Training',
  2,
  'pdf',
  30,
  true
)
ON CONFLICT (test_type, section, exercise_type, test_number, format) DO NOTHING
RETURNING id;

-- ============================================================================
-- STEP 2: Insert questions for Test 1 (Assessment Monotematico #1)
-- ============================================================================

-- Get test_id for Assessment Monotematico #1
DO $$
DECLARE
  v_test_id UUID;
BEGIN
  SELECT id INTO v_test_id
  FROM "2V_tests"
  WHERE test_type = 'BOCCONI'
    AND section = 'Logaritmi ed esponenziali'
    AND exercise_type = 'Assessment Monotematico'
    AND test_number = 1
    AND format = 'pdf';

  -- Insert 20 questions for Assessment test
  INSERT INTO "2V_questions" (test_id, test_type, question_number, question_type, section, materia, question_data, answers, is_active)
  VALUES
    (v_test_id, 'BOCCONI', 1, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 2, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 3, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 4, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 5, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 6, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 7, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 8, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 9, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 10, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 11, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 12, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 13, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 14, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 15, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 16, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 17, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 18, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 19, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 20, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_1750255455415.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Assessment_1_BOCCONI_PDF_EN_1761227608091.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true)
  ON CONFLICT (test_id, question_number) DO NOTHING;

  RAISE NOTICE 'Migrated Assessment Monotematico #1 with 20 questions';
END $$;

-- ============================================================================
-- STEP 3: Insert questions for Test 2 (Training #1 - Esercizi per casa)
-- ============================================================================

DO $$
DECLARE
  v_test_id UUID;
BEGIN
  SELECT id INTO v_test_id
  FROM "2V_tests"
  WHERE test_type = 'BOCCONI'
    AND section = 'Logaritmi ed esponenziali'
    AND exercise_type = 'Training'
    AND test_number = 1
    AND format = 'pdf';

  -- Insert 20 questions for Training test #1
  INSERT INTO "2V_questions" (test_id, test_type, question_number, question_type, section, materia, question_data, answers, is_active)
  VALUES
    (v_test_id, 'BOCCONI', 1, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 2, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 3, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 4, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 5, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 6, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 7, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 8, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 9, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 10, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 11, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 12, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 13, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 14, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 15, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 16, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 17, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 18, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 19, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 20, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_1758724288603.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_1_BOCCONI_PDF_EN_1757603907702.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true)
  ON CONFLICT (test_id, question_number) DO NOTHING;

  RAISE NOTICE 'Migrated Training #1 with 20 questions';
END $$;

-- ============================================================================
-- STEP 4: Insert questions for Test 3 (Training #2 - Esercizi per casa)
-- ============================================================================

DO $$
DECLARE
  v_test_id UUID;
BEGIN
  SELECT id INTO v_test_id
  FROM "2V_tests"
  WHERE test_type = 'BOCCONI'
    AND section = 'Logaritmi ed esponenziali'
    AND exercise_type = 'Training'
    AND test_number = 2
    AND format = 'pdf';

  -- Insert 20 questions for Training test #2
  INSERT INTO "2V_questions" (test_id, test_type, question_number, question_type, section, materia, question_data, answers, is_active)
  VALUES
    (v_test_id, 'BOCCONI', 1, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 2, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 3, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 4, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 2, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "a", "wrong_answers": ["b", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 5, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 6, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 7, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 8, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 3, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 9, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 10, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 11, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 12, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 4, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 13, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "d", "wrong_answers": ["a", "b", "c", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 14, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 15, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 16, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 5, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 17, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "b", "wrong_answers": ["a", "c", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 18, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 19, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "c", "wrong_answers": ["a", "b", "d", "e"]}'::jsonb, true),

    (v_test_id, 'BOCCONI', 20, 'pdf', 'Logaritmi ed esponenziali', 'Matematica',
     '{"pdf_url": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/tolc_i/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_1759500387036.pdf", "page_number": 6, "pdf_url_eng": "https://elrwpaezjnemmiegkyin.supabase.co/storage/v1/object/public/PDF_eng/Logaritmi_ed_esponenziali_Esercizi_per_casa_2_BOCCONI_PDF_EN_1757604179958.pdf"}'::jsonb,
     '{"correct_answer": "e", "wrong_answers": ["a", "b", "c", "d"]}'::jsonb, true)
  ON CONFLICT (test_id, question_number) DO NOTHING;

  RAISE NOTICE 'Migrated Training #2 with 20 questions';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created 3 tests:
-- 1. BOCCONI - Logaritmi ed esponenziali - Assessment Monotematico #1 (20 questions)
-- 2. BOCCONI - Logaritmi ed esponenziali - Training #1 (20 questions)
-- 3. BOCCONI - Logaritmi ed esponenziali - Training #2 (20 questions)
-- Total: 60 questions migrated
-- ============================================================================
