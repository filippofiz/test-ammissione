# API Documentation

API reference for Admission Platform v2.

---

## 🔌 API Overview

### Base URLs
- **Supabase API**: `https://your-project.supabase.co`
- **Edge Functions**: `https://your-project.supabase.co/functions/v1`

### Authentication
All requests require Authorization header:
```
Authorization: Bearer {supabase_session_token}
```

---

## 📚 Supabase REST API

### Auto-generated from PostgREST
Supabase automatically generates REST API from database schema.

### Example: Get Tests
```typescript
const { data, error } = await supabase
  .from('tests_v2')
  .select('*')
  .eq('is_active', true);
```

### Example: Create Test Attempt
```typescript
const { data, error } = await supabase
  .from('test_attempts_v2')
  .insert({
    student_id: studentId,
    test_id: testId,
    status: 'in_progress'
  })
  .select()
  .single();
```

---

## 🤖 Edge Functions

### 1. Generate Question

**Endpoint**: `POST /functions/v1/generate-question`

**Request**:
```json
{
  "questionType": "data_sufficiency",
  "difficulty": "medium",
  "topic": "algebra"
}
```

**Response**:
```json
{
  "id": "uuid",
  "question_data": {
    "stem": "What is the value of x?",
    "statement1": "x > 5",
    "statement2": "x < 10"
  },
  "correct_answer": "C",
  "explanation": "..."
}
```

### 2. Claude Proxy (Internal)

**Endpoint**: `POST /functions/v1/claude-proxy`

**Purpose**: Proxy requests to Anthropic API (hides API key)

---

## 🔧 RPC Functions

### 1. Update Password Changed

**Function**: `update_password_changed(user_auth_uid UUID)`

**Purpose**: Updates user profile after password change, bypassing RLS policies.

**Usage**:
```typescript
const { data, error } = await supabase
  .rpc('update_password_changed', {
    user_auth_uid: user.id
  });
```

**Returns**: `boolean` (true if update successful)

**Why RPC**: Direct table updates would trigger RLS policies that query the same table, causing infinite recursion. The `SECURITY DEFINER` function bypasses RLS safely.

**Implementation**:
```sql
CREATE OR REPLACE FUNCTION public.update_password_changed(user_auth_uid UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "2V_profiles"
  SET
    must_change_password = false,
    last_password_change = now(),
    updated_at = now()
  WHERE auth_uid = user_auth_uid;

  RETURN FOUND;
END;
$$;
```

**Security**:
- Function has `SECURITY DEFINER` to bypass RLS
- Only updates specific fields
- Limited to authenticated users via `GRANT EXECUTE`

---

## 💡 AI API Enhancement Ideas

### 💡 AI IDEA: Auto-generate API clients
```bash
# Use OpenAPI spec + AI to generate TypeScript client
# Saves time writing API wrappers
```

### 💡 AI IDEA: AI-powered API testing
```bash
# AI generates test cases based on schema
# Catches edge cases humans might miss
```

---

**Last Updated**: 2025-11-15
