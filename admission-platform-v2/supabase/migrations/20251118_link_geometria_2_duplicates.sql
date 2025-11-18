-- Link Geometria #2 duplicate questions
-- This links questions from the two Geometria #2 tests that were converted separately

DO $$
DECLARE
  test1_id UUID := 'cfb64074-8262-49e3-8831-abb228c9178e';
  test2_id UUID := 'f5b47fae-fb09-4715-9eef-1826d61b14e0';
  q_num INTEGER;
  test1_q_id UUID;
  test2_q_id UUID;
BEGIN
  -- Loop through question numbers 1-20
  FOR q_num IN 1..20 LOOP
    -- Get question IDs for this question number from both tests
    SELECT id INTO test1_q_id
    FROM "2V_questions"
    WHERE test_id = test1_id AND question_number = q_num;

    SELECT id INTO test2_q_id
    FROM "2V_questions"
    WHERE test_id = test2_id AND question_number = q_num;

    -- If both questions exist, link them
    IF test1_q_id IS NOT NULL AND test2_q_id IS NOT NULL THEN
      -- Update test1 question to point to test2 question
      UPDATE "2V_questions"
      SET duplicate_question_ids = jsonb_build_array(test2_q_id::text)
      WHERE id = test1_q_id;

      -- Update test2 question to point to test1 question
      UPDATE "2V_questions"
      SET duplicate_question_ids = jsonb_build_array(test1_q_id::text)
      WHERE id = test2_q_id;

      RAISE NOTICE 'Linked Q%: % <-> %', q_num, test1_q_id, test2_q_id;
    ELSE
      RAISE WARNING 'Q% missing: test1=%, test2=%', q_num, test1_q_id, test2_q_id;
    END IF;
  END LOOP;
END $$;
