# PDF to LaTeX Converter - Setup Guide

## Overview

The PDF to LaTeX Converter is an admin tool that uses AI (Claude API) to automatically extract questions from PDF text and convert them to LaTeX format for storage in the database.

**Features:**
- AI-powered question extraction from PDF text
- Automatic math notation conversion to LaTeX
- Interactive preview with editable fields
- Direct save to `2V_questions` database table
- Support for all test types (SAT, GMAT, TOLC-I, etc.)

---

## Setup Instructions

### 1. Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

### 2. Configure Supabase Edge Function

#### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd admission-platform-v2

# Set the Claude API key as a secret
npx supabase secrets set CLAUDE_API_KEY=sk-ant-your-key-here

# Deploy the edge function
npx supabase functions deploy extract-questions-from-pdf
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** > **Manage secrets**
3. Add new secret:
   - Name: `CLAUDE_API_KEY`
   - Value: `sk-ant-your-key-here`
4. Navigate to **Edge Functions** > **Deploy new function**
5. Upload the function from `supabase/functions/extract-questions-from-pdf/`

### 3. Verify Environment Variables

Ensure your `.env` file in `apps/web/` contains:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies

```bash
# Web app dependencies
cd apps/web
pnpm install

# Mobile app dependencies (if using mobile)
cd apps/mobile
npm install
```

---

## Usage Guide

### Step 1: Access the Tool

1. Login as an **ADMIN** user
2. Navigate to **Admin Dashboard**
3. Click on **PDF to LaTeX** card

### Step 2: Prepare PDF Text

1. Open your PDF file in a PDF viewer
2. Select all text (Ctrl+A / Cmd+A)
3. Copy to clipboard (Ctrl+C / Cmd+C)

**Note:** The PDF should contain questions in a structured format with:
- Clear question numbering
- Answer options (A, B, C, D, E)
- Mathematical notation

### Step 3: Configure Test Metadata

Fill in the metadata fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Test Type** | The type of test | SAT, GMAT, TOLC-I |
| **Section** | The subject section | Math, Reading, Advanced Math |
| **Exercise Type** | The exercise category | Training, Assessment Monotematico |
| **Test Number** | Sequential test number | 1, 2, 3... |

### Step 4: Extract Questions

1. Paste the PDF text into the **PDF Text** textarea
2. Click **Extract Questions with AI**
3. Wait for AI processing (typically 10-30 seconds)
4. Review extracted questions in the preview panel

### Step 5: Review and Edit

**API Cost Display:**
- After extraction, you'll see the exact API usage and cost
- Shows input tokens, output tokens, and total cost in USD
- Based on real-time Claude API pricing

For each extracted question:

- **Question Text**: Displayed with LaTeX rendering
- **Options A-E**: Displayed with LaTeX rendering
- **Correct Answer**: Select from dropdown

**Edit Mode:**
1. Click the **Edit** button (pencil icon)
2. Modify question text, options, or LaTeX markup
3. Click **Edit** again to exit edit mode

**Delete:**
- Click the **Trash** icon to remove a question

### Step 6: Save to Database

1. Verify all questions have correct answers selected
2. Click **Save All to Database**
3. Questions will be inserted into `2V_questions` table
4. Automatic redirect to Test Management page on success

---

## LaTeX Syntax Guide

The AI automatically converts mathematical notation to LaTeX. Here are common patterns:

| Math | LaTeX | Rendered |
|------|-------|----------|
| x squared | `$x^2$` | $x^2$ |
| Square root | `$\sqrt{x}$` | $\sqrt{x}$ |
| Fractions | `$\frac{a}{b}$` | $\frac{a}{b}$ |
| Inequalities | `$x < 5$` | $x < 5$ |
| Greek letters | `$\pi$, $\theta$` | $\pi$, $\theta$ |
| Integrals | `$\int_0^1 x dx$` | $\int_0^1 x dx$ |
| Summation | `$\sum_{i=1}^{n} i$` | $\sum_{i=1}^{n} i$ |

**Inline vs Display Math:**
- Inline: `$x^2$` - within text
- Display: `$$x^2$$` - centered on new line

---

## Example PDF Text Format

### Good Format (Works Well)

```
1. What is the value of x in the equation 2x + 5 = 15?
   A) x = 5
   B) x = 10
   C) x = 7.5
   D) x = 20

2. Simplify: (x^2 + 4x + 4) / (x + 2)
   A) x + 2
   B) x - 2
   C) x^2 + 2
   D) x + 4
```

### Poor Format (May Require Manual Editing)

```
Question 1: What is... (continued on next page)
A. Option A
B. Option B (see diagram on page 5)
```

**Tips for Best Results:**
1. Ensure questions are complete (not split across pages)
2. Clear numbering (1, 2, 3 or Question 1, Question 2)
3. Consistent option format (A), B), C) or A., B., C.)
4. Mathematical notation should be clear

---

## Database Structure

Questions are saved to the `2V_questions` table:

```sql
{
  test_id: UUID,              -- Auto-created or linked to existing test
  test_type: "SAT",           -- From metadata
  question_number: 1,         -- Extracted from PDF
  question_type: "multiple_choice",
  section: "Math",            -- From metadata
  difficulty: "medium",       -- Optional
  question_data: {
    question_text: "What is $x$ in $2x + 5 = 15$?",
    options: {
      a: "$x = 5$",
      b: "$x = 10$",
      c: "$x = 7.5$",
      d: "$x = 20$"
    }
  },
  answers: {
    correct_answer: "a",
    wrong_answers: ["b", "c", "d"]
  }
}
```

---

## Troubleshooting

### Error: "Missing authorization header"
**Solution:** Ensure you're logged in as an ADMIN user

### Error: "Claude API key not configured"
**Solution:** Set the `CLAUDE_API_KEY` secret in Supabase (see Setup step 2)

### Error: "Failed to extract questions"
**Possible causes:**
1. PDF text is malformed or unstructured
2. Claude API rate limit reached
3. Network connectivity issues

**Solutions:**
- Review PDF text format
- Wait a few minutes and retry
- Check Supabase Edge Function logs

### Error: "Some questions already exist in this test"
**Solution:**
- Questions with the same `question_number` already exist in the test
- Change question numbers or delete existing questions first

### Questions extracted incorrectly
**Solution:**
1. Use the **Edit** button to manually correct
2. Update question text, options, or LaTeX markup
3. Ensure correct answer is selected before saving

---

## Cost Estimation

**Claude API Pricing (as of 2025):**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Estimated Costs:**
- 10 questions: ~$0.10
- 100 questions: ~$0.50
- 1000 questions: ~$3.00

**Tips to Reduce Costs:**
1. Batch multiple questions per request (already done)
2. Review and edit before saving to avoid re-processing
3. Use clear, well-formatted PDF text

---

## Security Considerations

1. **API Key Protection**: CLAUDE_API_KEY is stored as a Supabase secret (never exposed to client)
2. **Role-Based Access**: Only ADMIN users can access this feature
3. **Input Validation**: All inputs are validated before database insertion
4. **RLS Policies**: Row-level security enforces data access controls

---

## Support

For issues or questions:
1. Check Supabase Edge Function logs: **Dashboard** > **Edge Functions** > **Logs**
2. Review browser console for client-side errors
3. Verify database constraints in `2V_questions` table
4. Contact system administrator

---

## Future Enhancements

Potential improvements:
- [ ] Direct PDF file upload (with OCR)
- [ ] Support for image-based questions
- [ ] Batch processing of multiple PDFs
- [ ] Question template presets
- [ ] Export to Excel/CSV before saving
- [ ] Version control for edited questions

---

## Files Reference

**Frontend:**
- `apps/web/src/pages/PDFToLatexConverterPage.tsx` - Main UI component
- `apps/web/src/App.tsx` - Route definition
- `apps/web/src/pages/AdminDashboardPage.tsx` - Navigation link

**Backend:**
- `supabase/functions/extract-questions-from-pdf/index.ts` - Edge function

**Database:**
- `supabase/migrations/008_create_2V_questions.sql` - Questions table schema
- `supabase/migrations/004_create_2V_tests.sql` - Tests table schema
