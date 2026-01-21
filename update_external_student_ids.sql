-- ============================================================================
-- Update external_student_id for students based on name matching
-- ============================================================================

-- First, let's see what names exist in 2V_profiles for comparison
-- (Run this first to check potential mismatches)
SELECT
    name,
    external_student_id,
    email
FROM "2V_profiles"
WHERE name ILIKE ANY (ARRAY[
    'Alberto Cacchioli',
    'Andrea Barill%',
    'Angelica Cornaggia',
    'Camille Martin',
    'Carolina Metti',
    'Cecilia Limonta',
    'Cesare Sersale',
    'Edoardo Merci',
    'Emma Liverani',
    'Ettore Tosano',
    'Gaia Mottarelli',
    'Giacomo Negri',
    'Giampiero Lucibello',
    'Ginevra Panetta',
    'Giulia Brancatelli',
    'Giulia Nardone',
    'Jacopo Menegazzi',
    'Kiryl Buhayeu',
    'Laura De Capitani',
    'Leonardo Conticelli',
    'Lorenzo Gelfi',
    'Luca Martino Sassella',
    'Luca Merlo',
    'Luca Rastaldi',
    'Ludovico Andrea Grasso Macola',
    'Manuel Gatti',
    'Marcello Zecca',
    'Margherita Gabbani',
    'Margherita Garegnani',
    'Matilde Spessa',
    'Matteo Russotti',
    'Mattia Sarno',
    'Melissa Ferraris',
    'Omar Baccour',
    'Paolo Nardella',
    'Paolo Vigan%',
    'Renzo Ballerini',
    'Riccardo Di Pasquale',
    'Sara Pietrunti',
    'Sergio D''Auria',
    'Sofia Mauri',
    'Tommaso Bignami',
    'Victor Decker',
    'Victoria Marie Ava Marquet',
    'Virginia Siano',
    'Vittorio Carrera'
])
ORDER BY name;

-- ============================================================================
-- UPDATE STATEMENTS
-- ============================================================================

-- Update each student's external_student_id
UPDATE "2V_profiles" SET external_student_id = 362 WHERE TRIM(name) ILIKE 'Alberto Cacchioli';
UPDATE "2V_profiles" SET external_student_id = 280 WHERE TRIM(name) ILIKE 'Andrea Barill%'; -- Handle encoding issue
UPDATE "2V_profiles" SET external_student_id = 370 WHERE TRIM(name) ILIKE 'Angelica Cornaggia';
UPDATE "2V_profiles" SET external_student_id = 349 WHERE TRIM(name) ILIKE 'Camille Martin';
UPDATE "2V_profiles" SET external_student_id = 331 WHERE TRIM(name) ILIKE 'Carolina Metti';
UPDATE "2V_profiles" SET external_student_id = 450 WHERE TRIM(name) ILIKE 'Cecilia Limonta';
UPDATE "2V_profiles" SET external_student_id = 374 WHERE TRIM(name) ILIKE 'Cesare Sersale';
UPDATE "2V_profiles" SET external_student_id = 424 WHERE TRIM(name) ILIKE 'Edoardo Merci';
UPDATE "2V_profiles" SET external_student_id = 342 WHERE TRIM(name) ILIKE 'Emma Liverani';
UPDATE "2V_profiles" SET external_student_id = 528 WHERE TRIM(name) ILIKE 'Ettore Tosano';
UPDATE "2V_profiles" SET external_student_id = 464 WHERE TRIM(name) ILIKE 'Gaia Mottarelli';
UPDATE "2V_profiles" SET external_student_id = 338 WHERE TRIM(name) ILIKE 'Giacomo Negri';
UPDATE "2V_profiles" SET external_student_id = 103 WHERE TRIM(name) ILIKE 'Giampiero Lucibello';
UPDATE "2V_profiles" SET external_student_id = 492 WHERE TRIM(name) ILIKE 'Ginevra Panetta';
UPDATE "2V_profiles" SET external_student_id = 432 WHERE TRIM(name) ILIKE 'Giulia Brancatelli';
UPDATE "2V_profiles" SET external_student_id = 118 WHERE TRIM(name) ILIKE 'Giulia Nardone';
UPDATE "2V_profiles" SET external_student_id = 393 WHERE TRIM(name) ILIKE 'Jacopo Menegazzi';
UPDATE "2V_profiles" SET external_student_id = 493 WHERE TRIM(name) ILIKE 'Kiryl Buhayeu';
UPDATE "2V_profiles" SET external_student_id = 484 WHERE TRIM(name) ILIKE 'Laura De Capitani';
UPDATE "2V_profiles" SET external_student_id = 357 WHERE TRIM(name) ILIKE 'Leonardo Conticelli';
UPDATE "2V_profiles" SET external_student_id = 144 WHERE TRIM(name) ILIKE 'Lorenzo Gelfi';
UPDATE "2V_profiles" SET external_student_id = 431 WHERE TRIM(name) ILIKE 'Luca Martino Sassella';
UPDATE "2V_profiles" SET external_student_id = 379 WHERE TRIM(name) ILIKE 'Luca Merlo';
UPDATE "2V_profiles" SET external_student_id = 147 WHERE TRIM(name) ILIKE 'Luca Rastaldi';
UPDATE "2V_profiles" SET external_student_id = 152 WHERE TRIM(name) ILIKE 'Ludovico Andrea Grasso Macola';
UPDATE "2V_profiles" SET external_student_id = 471 WHERE TRIM(name) ILIKE 'Manuel Gatti';
UPDATE "2V_profiles" SET external_student_id = 158 WHERE TRIM(name) ILIKE 'Marcello Zecca';
UPDATE "2V_profiles" SET external_student_id = 358 WHERE TRIM(name) ILIKE 'Margherita Gabbani';
UPDATE "2V_profiles" SET external_student_id = 301 WHERE TRIM(name) ILIKE 'Margherita Garegnani';
UPDATE "2V_profiles" SET external_student_id = 512 WHERE TRIM(name) ILIKE 'Matilde Spessa';
UPDATE "2V_profiles" SET external_student_id = 489 WHERE TRIM(name) ILIKE 'Matteo Russotti';
UPDATE "2V_profiles" SET external_student_id = 260 WHERE TRIM(name) ILIKE 'Mattia Sarno';
UPDATE "2V_profiles" SET external_student_id = 473 WHERE TRIM(name) ILIKE 'Melissa Ferraris';
UPDATE "2V_profiles" SET external_student_id = 311 WHERE TRIM(name) ILIKE 'Omar Baccour';
UPDATE "2V_profiles" SET external_student_id = 386 WHERE TRIM(name) ILIKE 'Paolo Nardella';
UPDATE "2V_profiles" SET external_student_id = 276 WHERE TRIM(name) ILIKE 'Paolo Vigan%'; -- Handle encoding issue
UPDATE "2V_profiles" SET external_student_id = 324 WHERE TRIM(name) ILIKE 'Renzo Ballerini'; -- Duplicate entry, both get same ID
UPDATE "2V_profiles" SET external_student_id = 330 WHERE TRIM(name) ILIKE 'Riccardo Di Pasquale';
UPDATE "2V_profiles" SET external_student_id = 372 WHERE TRIM(name) ILIKE 'Sara Pietrunti';
UPDATE "2V_profiles" SET external_student_id = 507 WHERE TRIM(name) ILIKE 'Sergio D''Auria';
UPDATE "2V_profiles" SET external_student_id = 347 WHERE TRIM(name) ILIKE 'Sofia Mauri';
UPDATE "2V_profiles" SET external_student_id = 459 WHERE TRIM(name) ILIKE 'Tommaso Bignami';
UPDATE "2V_profiles" SET external_student_id = 377 WHERE TRIM(name) ILIKE 'Victor Decker';
UPDATE "2V_profiles" SET external_student_id = 382 WHERE TRIM(name) ILIKE 'Victoria Marie Ava Marquet';
UPDATE "2V_profiles" SET external_student_id = 474 WHERE TRIM(name) ILIKE 'Virginia Siano';
UPDATE "2V_profiles" SET external_student_id = 366 WHERE TRIM(name) ILIKE 'Vittorio Carrera';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check which students were successfully updated
SELECT
    'SUCCESS' as status,
    name,
    external_student_id,
    email
FROM "2V_profiles"
WHERE external_student_id IN (
    362, 280, 370, 349, 331, 450, 374, 424, 342, 528,
    464, 338, 103, 492, 432, 118, 393, 493, 484, 357,
    144, 431, 379, 147, 152, 471, 158, 358, 301, 512,
    489, 260, 473, 311, 386, 276, 324, 330, 372, 507,
    347, 459, 377, 382, 474, 366
)
ORDER BY name;

-- Create a temporary table with expected names to find missing ones
WITH expected_updates AS (
    SELECT name, external_student_id FROM (VALUES
        ('Alberto Cacchioli', 362),
        ('Andrea Barill%', 280),
        ('Angelica Cornaggia', 370),
        ('Camille Martin', 349),
        ('Carolina Metti', 331),
        ('Cecilia Limonta', 450),
        ('Cesare Sersale', 374),
        ('Edoardo Merci', 424),
        ('Emma Liverani', 342),
        ('Ettore Tosano', 528),
        ('Gaia Mottarelli', 464),
        ('Giacomo Negri', 338),
        ('Giampiero Lucibello', 103),
        ('Ginevra Panetta', 492),
        ('Giulia Brancatelli', 432),
        ('Giulia Nardone', 118),
        ('Jacopo Menegazzi', 393),
        ('Kiryl Buhayeu', 493),
        ('Laura De Capitani', 484),
        ('Leonardo Conticelli', 357),
        ('Lorenzo Gelfi', 144),
        ('Luca Martino Sassella', 431),
        ('Luca Merlo', 379),
        ('Luca Rastaldi', 147),
        ('Ludovico Andrea Grasso Macola', 152),
        ('Manuel Gatti', 471),
        ('Marcello Zecca', 158),
        ('Margherita Gabbani', 358),
        ('Margherita Garegnani', 301),
        ('Matilde Spessa', 512),
        ('Matteo Russotti', 489),
        ('Mattia Sarno', 260),
        ('Melissa Ferraris', 473),
        ('Omar Baccour', 311),
        ('Paolo Nardella', 386),
        ('Paolo Vigan%', 276),
        ('Renzo Ballerini', 324),
        ('Riccardo Di Pasquale', 330),
        ('Sara Pietrunti', 372),
        ('Sergio D''Auria', 507),
        ('Sofia Mauri', 347),
        ('Tommaso Bignami', 459),
        ('Victor Decker', 377),
        ('Victoria Marie Ava Marquet', 382),
        ('Virginia Siano', 474),
        ('Vittorio Carrera', 366)
    ) AS t(name, external_student_id)
),
matched AS (
    SELECT DISTINCT e.external_student_id
    FROM expected_updates e
    WHERE EXISTS (
        SELECT 1 FROM "2V_profiles" p
        WHERE p.external_student_id = e.external_student_id
    )
)
SELECT
    'FAILED' as status,
    e.name as expected_name,
    e.external_student_id as expected_id,
    'No match found in 2V_profiles' as reason
FROM expected_updates e
WHERE e.external_student_id NOT IN (SELECT external_student_id FROM matched)
ORDER BY e.name;

-- Summary count
SELECT
    COUNT(*) as total_updated,
    COUNT(DISTINCT external_student_id) as unique_external_ids
FROM "2V_profiles"
WHERE external_student_id IN (
    362, 280, 370, 349, 331, 450, 374, 424, 342, 528,
    464, 338, 103, 492, 432, 118, 393, 493, 484, 357,
    144, 431, 379, 147, 152, 471, 158, 358, 301, 512,
    489, 260, 473, 311, 386, 276, 324, 330, 372, 507,
    347, 459, 377, 382, 474, 366
);

-- Find potential name variations in database (for troubleshooting)
SELECT
    'POSSIBLE_MATCH' as status,
    name,
    external_student_id,
    email,
    CASE
        WHEN name ILIKE '%andrea%' AND name ILIKE '%barill%' THEN 'Andrea Barillà (280)'
        WHEN name ILIKE '%paolo%' AND name ILIKE '%vigan%' THEN 'Paolo Viganò (276)'
        ELSE 'Check manually'
    END as likely_match
FROM "2V_profiles"
WHERE (
    (name ILIKE '%andrea%' AND name ILIKE '%barill%')
    OR (name ILIKE '%paolo%' AND name ILIKE '%vigan%')
)
AND external_student_id IS NULL;
