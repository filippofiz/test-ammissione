# Database Documentation

Complete database schema reference for Admission Platform v2.

---

## 🗄️ Schema Overview

### Tables Summary
| Table | Purpose | RLS | Records (Current) |
|-------|---------|-----|-------------------|
| `2V_profiles` | User profiles (students, tutors, admins) | ✅ | Migrated |
| `2V_tests` | Test definitions with instances | ✅ | 95 tests |
| `2V_test_assignments` | Student-test assignments | ✅ | 1,117 assignments |
| `2V_topics_sections` | Topics/sections taxonomy | ✅ | Complete taxonomy |
| `2V_questions` | Questions with strict validation | ✅ | 1,734 questions |
| `2V_student_answers` | Student answers to questions | ✅ | 5,761 answers |

### Legacy Tables (Read-Only)
| Table | Purpose | Status |
|-------|---------|--------|
| `student_tests` | Old test assignments | 🔒 Legacy (read-only) |
| `tests` | Old PDF questions | 🔒 Legacy (read-only) |
| `banca_dati` | Old interactive questions | 🔒 Legacy (read-only) |

---

## 📊 Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ↓
2V_profiles (students, tutors, admins)
    │
    ├──> 2V_test_assignments
    │       ├── student_id → 2V_profiles
    │       ├── test_id → 2V_tests
    │       ├── assigned_by → 2V_profiles
    │       └── status, start_time, completed_at
    │
    └──> 2V_tests
            ├── test_type (GMAT, BOCCONI, etc.)
            ├── section (Algebra, Multi-topic, etc.)
            ├── exercise_type (Training, Assessment, etc.)
            ├── test_number (1, 2, 3... for multiple instances)
            └── format (pdf, interactive)
```

---

## 📋 Detailed Schema

### Migration Files

| File | Purpose | Status |
|------|---------|--------|
| `001_create_2V_profiles.sql` | User profiles table with RLS | ✅ Applied |
| `002_create_login_rpc.sql` | Login RPC function (SECURITY DEFINER) | ✅ Applied |
| `003_create_change_password_rpc.sql` | Password change RPC function | ✅ Applied |
| `004_create_2V_tests.sql` | Test definitions table with RLS | ✅ Applied |
| `005_create_2V_test_assignments.sql` | Test assignments table with RLS | ✅ Applied |
| `006_create_2V_topics_sections.sql` | Topics and sections taxonomy | ✅ Applied |
| `010_create_2V_questions.sql` | Questions table with strict validation | ✅ Applied |
| `011_create_2V_student_answers.sql` | Student answers with CASCADE delete | ✅ Applied |

### 2V_profiles Table

```sql
CREATE TABLE "2V_profiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  roles JSONB NOT NULL DEFAULT '[]', -- ["STUDENT", "TUTOR", "ADMIN"]
  tutor_id UUID REFERENCES "2V_profiles"(id), -- Student's tutor
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: Unified user profiles supporting multiple roles per user.

### 2V_tests Table

```sql
CREATE TABLE "2V_tests" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type TEXT NOT NULL, -- "GMAT", "BOCCONI", "TOLC E", etc.
  section TEXT NOT NULL, -- "Algebra", "Multi-topic", etc.
  exercise_type TEXT NOT NULL, -- "Training", "Assessment Iniziale", etc.
  test_number INTEGER NOT NULL, -- 1, 2, 3... (for multiple instances)
  format TEXT NOT NULL, -- "pdf" or "interactive"
  default_duration_mins INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES "2V_profiles"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(test_type, section, exercise_type, test_number, format)
);
```

**Purpose**: Test definitions. One row per unique test instance.

**Example Rows**:
- `BOCCONI`, `Algebra`, `Training`, `1`, `pdf`
- `BOCCONI`, `Algebra`, `Training`, `2`, `pdf` (different test)
- `GMAT`, `Multi-topic`, `Simulazione`, `1`, `interactive`

### 2V_test_assignments Table

```sql
CREATE TABLE "2V_test_assignments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES "2V_profiles"(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES "2V_tests"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked', -- locked, unlocked, in_progress, completed
  start_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES "2V_profiles"(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, test_id)
);
```

**Purpose**: ONE row per student-test combination. Tracks which tests are assigned to which students and their progress.

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with role-based access control.

### 2V_profiles Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON "2V_profiles" FOR SELECT
  USING (auth_uid = auth.uid());

-- Tutors can view their students
CREATE POLICY "Tutors view students"
  ON "2V_profiles" FOR SELECT
  USING (
    tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
  );

-- Admins can view all profiles
CREATE POLICY "Admins view all"
  ON "2V_profiles" FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );
```

### 2V_tests Policies

```sql
-- Everyone can view active tests
CREATE POLICY "Everyone can view active tests"
  ON "2V_tests" FOR SELECT
  USING (is_active = true);

-- Tutors and admins can manage tests
CREATE POLICY "Tutors and admins can manage tests"
  ON "2V_tests" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "2V_profiles"
      WHERE auth_uid = auth.uid()
      AND (roles @> '"TUTOR"'::jsonb OR roles @> '"ADMIN"'::jsonb)
    )
  );
```

### 2V_test_assignments Policies

```sql
-- Students can view their own assignments
CREATE POLICY "Students view own assignments"
  ON "2V_test_assignments" FOR SELECT
  USING (student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()));

-- Students can update their own assignments (status changes)
CREATE POLICY "Students update own assignments"
  ON "2V_test_assignments" FOR UPDATE
  USING (student_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid()));

-- Tutors can view their students' assignments
CREATE POLICY "Tutors view student assignments"
  ON "2V_test_assignments" FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid())
    )
  );

-- Tutors can manage their students' assignments
CREATE POLICY "Tutors manage student assignments"
  ON "2V_test_assignments" FOR ALL
  USING (
    student_id IN (
      SELECT id FROM "2V_profiles"
      WHERE tutor_id IN (SELECT id FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"TUTOR"'::jsonb)
    )
  );

-- Admins have full access
CREATE POLICY "Admins manage all assignments"
  ON "2V_test_assignments" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "2V_profiles" WHERE auth_uid = auth.uid() AND roles @> '"ADMIN"'::jsonb)
  );
```

---

## 🔄 Migrations

### Running Migrations
```bash
# Push to linked project
npx supabase db push

# Reset (DANGER - deletes all data)
npx supabase db reset

# Generate migration from changes
npx supabase db diff -f new_migration_name
```

### Migration Files
- `001_users_v2.sql` - Users, tutors, students
- `002_tests_v2.sql` - Tests table
- `003_questions_v2.sql` - Questions + taxonomy
- `004_ai_questions.sql` - AI generation tracking
- `005_attempts.sql` - Test attempts + answers

---

## 🤖 AI Optimization Suggestions

### Auto-generate Documentation
```bash
# 💡 AI IDEA: Use AI to auto-generate schema docs from migrations
# Run: npx supabase gen docs > DOCUMENTATION/SCHEMA_AUTO.md
```

### Query Optimization
```sql
-- 💡 AI IDEA: Use AI to analyze slow queries
-- Anthropic can suggest indexes based on query patterns
```

---

**Last Updated**: 2025-11-15
