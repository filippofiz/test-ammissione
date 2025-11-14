# Database Documentation

Complete database schema reference for Admission Platform v2.

---

## 🗄️ Schema Overview

### Tables Summary
| Table | Purpose | RLS | Records (Est.) |
|-------|---------|-----|----------------|
| `users_v2` | User accounts | ✅ | 1,000+ |
| `tutors_v2` | Tutor profiles | ✅ | 50+ |
| `students_v2` | Student profiles | ✅ | 1,000+ |
| `tests_v2` | Test definitions | ✅ | 100+ |
| `questions_v2` | Question bank | ✅ | 10,000+ |
| `ai_generated_questions_v2` | AI-generated questions | ✅ | 5,000+ |
| `test_attempts_v2` | Student test attempts | ✅ | 50,000+ |
| `student_answers_v2` | Individual answers | ✅ | 500,000+ |
| `test_assignments_v2` | Test assignments | ✅ | 5,000+ |

---

## 📊 Entity Relationship Diagram

```
users_v2
├─> tutors_v2
│   └─> students_v2
│       └─> test_assignments_v2
│           └─> tests_v2
│               └─> questions_v2
│
├─> test_attempts_v2
│   ├─> tests_v2
│   ├─> students_v2
│   └─> student_answers_v2
│       └─> questions_v2

ai_generated_questions_v2 ──> questions_v2 (if approved)
```

---

## 📋 Detailed Schema

### Complete SQL in: `supabase/migrations/`

See migration files for full schema. Key tables documented below.

---

## 🔐 Row Level Security (RLS)

### Users Table
```sql
-- Users can only see own profile
CREATE POLICY "users_view_own" ON users_v2
FOR SELECT USING (auth.uid() = auth_uid);
```

### Students Table
```sql
-- Students see own record
CREATE POLICY "students_view_own" ON students_v2
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users_v2
    WHERE users_v2.id = students_v2.user_id
    AND users_v2.auth_uid = auth.uid()
  )
);

-- Tutors see assigned students
CREATE POLICY "tutors_view_students" ON students_v2
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutors_v2
    JOIN users_v2 ON users_v2.id = tutors_v2.user_id
    WHERE tutors_v2.id = students_v2.tutor_id
    AND users_v2.auth_uid = auth.uid()
  )
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

**Last Updated**: 2025-11-14
