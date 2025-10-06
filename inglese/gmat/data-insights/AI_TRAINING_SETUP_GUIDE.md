# 🎓 AI Training System - Setup & Usage Guide

## ✅ What's Been Built

A complete **Approval + Few-Shot Learning** system that makes AI continuously better!

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Create Database Table

Run this SQL in Supabase SQL Editor:

```sql
-- Copy everything from CREATE_AI_TRAINING_TABLE.sql
```

This creates:
- `ai_question_history` table to track all AI generations
- Indexes for fast retrieval
- Function to track example usage

### Step 2: Test the System

1. Go to GMAT Data Insights question creator
2. Click "✨ Generate Question"
3. AI generates → Review modal appears
4. Rate the question (1-5 stars)
5. Approve/Reject/Edit

### Step 3: Watch It Learn!

After 5-10 approved questions:
- AI starts using your approved examples
- Quality improves automatically
- Avoids patterns you've rejected

---

## 📋 How It Works

### 1️⃣ **Generation Flow**

```
User clicks "Generate"
    ↓
AI creates question
    ↓
Review modal opens automatically
    ↓
User rates & decides:
├─ ✅ Approve → Saved as example
├─ ✏️ Edit & Approve → Saves both versions
└─ ❌ Reject → Saves feedback
```

### 2️⃣ **Learning Flow (Few-Shot)**

```
Next time user generates:
    ↓
System fetches top 3 approved examples
    ↓
Injects examples into AI prompt
    ↓
AI learns from real approved questions
    ↓
Better quality output
```

### 3️⃣ **Smart Example Selection**

- ⭐ Prioritizes 4-5 star ratings
- 🔄 Rotates examples (uses least-used first)
- 🎯 Matches difficulty & type
- 📊 Tracks usage to ensure diversity

---

## 🎯 Review Modal Options

### ✅ **Approve & Use**
- Question is perfect as-is
- Saved to example bank
- Form populates immediately
- Used for future training

### ✏️ **Edit & Approve**
- Question needs minor tweaks
- You edit in the form
- Original + your edits both saved
- AI learns from corrections

### ❌ **Reject**
- Question has major issues
- Must provide feedback (required)
- Feedback prevents similar mistakes
- Question not used

---

## ⭐ Rating System

**5 Stars** - Perfect! Use exactly as example
**4 Stars** - Good, minor tweaks only
**3 Stars** - Average, needs editing
**2 Stars** - Below average, major fixes
**1 Star** - Poor quality, reject

💡 **Tip**: Only 4-5 star questions become examples

---

## 📊 Database Tracking

Every generation saves:

```sql
{
  "question_type": "DS",
  "difficulty": "medium",
  "generated_json": {...},      -- What AI created
  "status": "approved",          -- approved/rejected/corrected
  "rating": 5,                   -- 1-5 stars
  "rejection_reason": null,      -- Why rejected (if applicable)
  "corrected_json": {...},       -- Your edited version (if edited)
  "example_usage_count": 3       -- How many times used as example
}
```

---

## 🔄 Continuous Improvement

### Week 1: **Bootstrap Phase**
- ❌ No examples yet
- ✅ AI uses base prompts only
- 📝 You approve/reject to build library
- Target: 10-15 approved questions per type

### Week 2: **Learning Phase**
- ✅ Examples start appearing in prompts
- 📈 Quality improves noticeably
- 🎯 AI mimics your approved style
- Target: 70-80% approval rate

### Week 3: **Optimization Phase**
- ⭐ Top-rated examples dominate
- 🚫 Rejection patterns avoided
- 🎓 AI "knows" your standards
- Target: 85%+ approval rate

### Month 2+: **Mastery Phase**
- 🏆 Consistent high-quality output
- ⚡ Fast approvals (minor edits only)
- 📚 Rich example library
- Target: 90%+ approval rate

---

## 💡 Best Practices

### ✅ DO:
- Rate every question honestly
- Provide detailed rejection feedback
- Approve diverse question types
- Edit and approve when close
- Track improvement over time

### ❌ DON'T:
- Reject without feedback (AI can't learn!)
- Only approve one topic (causes bias)
- Rush through reviews
- Approve wrong answers
- Skip the rating step

---

## 🔧 Advanced: Prompt Analysis

AI learns from:

### What Gets Approved (✅)
- Question structure
- Difficulty calibration
- Data presentation
- Answer format
- Topic selection

### What Gets Rejected (❌)
- Calculation errors
- Format violations
- Unclear wording
- Wrong difficulty
- Missing information

---

## 📈 Monitoring Performance

### Check Your Progress:

```sql
-- Approval rate by type
SELECT
  question_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'approved') / COUNT(*), 1) as approval_rate
FROM ai_question_history
GROUP BY question_type;

-- Average rating trend
SELECT
  DATE(created_at) as date,
  AVG(rating) as avg_rating,
  COUNT(*) as questions
FROM ai_question_history
WHERE rating IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Most used examples
SELECT
  question_type,
  rating,
  example_usage_count,
  LEFT(generated_json::text, 100) as preview
FROM ai_question_history
WHERE used_as_example = TRUE
ORDER BY example_usage_count DESC
LIMIT 10;
```

---

## 🎯 Success Metrics

**Day 1-7**: Build example library (10+ per type)
**Week 2**: 70%+ approval rate
**Week 3**: 80%+ approval rate
**Month 1**: 85%+ approval rate
**Month 2+**: 90%+ approval rate

---

## 🐛 Troubleshooting

### "Examples not appearing in prompt"
→ Need 1+ approved questions with rating ≥4

### "Same examples every time"
→ System rotates automatically, approve more variety

### "Quality not improving"
→ Check rejection feedback is specific and actionable

### "Database error when saving"
→ Ensure `ai_question_history` table exists in Supabase

---

## 🚀 What's Next

Current: **Few-Shot Learning** ✅
Future: **Fine-Tuning** (when you have 500+ approved questions)

The system is learning from every review you do! 🎓

---

## 📝 Quick Reference

| Action | Result | Used for Training |
|--------|--------|-------------------|
| ✅ Approve | Use as-is | ✅ Yes - as perfect example |
| ✏️ Edit | Use edited version | ✅ Yes - shows improvements |
| ❌ Reject | Don't use | ✅ Yes - pattern to avoid |

**Remember**: Every review makes the AI smarter! 🤖🧠
