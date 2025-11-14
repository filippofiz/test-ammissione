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

**Last Updated**: 2025-11-14
