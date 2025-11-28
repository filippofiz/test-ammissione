-- Copy section to macro_section column for test 803a43c3-1ab8-408d-a2a5-e8c886ddf37b

UPDATE "2V_questions"
SET macro_section = section
WHERE test_id = '803a43c3-1ab8-408d-a2a5-e8c886ddf37b';
