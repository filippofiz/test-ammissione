# 🤖 AI Question Generator Setup & Usage

## ✅ Setup Complete

The AI question generator is now integrated into your GMAT Data Insights question creators!

### 🔐 Security

- ✅ API key stored in `config.js` (already added to `.gitignore`)
- ✅ Never commit `config.js` to git
- ✅ Key is loaded at runtime only

---

## 📋 How It Works

### 1. **Data Sufficiency** (Already Integrated)

When creating a DS question, you'll see an AI Generator panel:
- Select difficulty: Medium (600-700) or Hard (700+)
- Click "✨ Generate Question"
- AI creates a professional question based on GMAT standards
- Form auto-populates with generated content
- Review and adjust as needed

### 2. **Integration with Other Question Types**

To add AI generation to other creators (GI, TA, TPA, MSR), add this code:

#### In the modal HTML (after info box):
```html
<div id="ai-generator-container"></div>
```

#### After appending modal (in createModal function):
```javascript
// Add AI Generator button
if (window.AIQuestionGenerator) {
  const aiContainer = document.getElementById('ai-generator-container');
  const generateBtn = window.AIQuestionGenerator.createGenerateButton('TYPE_CODE', (generatedData) => {
    this.populateFormWithAIData(generatedData);
  });
  aiContainer.appendChild(generateBtn);
}
```

Replace `TYPE_CODE` with:
- `'DS'` - Data Sufficiency
- `'GI'` - Graphics Interpretation
- `'TA'` - Table Analysis
- `'TPA'` - Two-Part Analysis
- `'MSR'` - Multi-Source Reasoning

#### Add populate method:
```javascript
populateFormWithAIData(data) {
  // Fill form fields based on your specific question type structure
  // Example for Graphics Interpretation:
  const statementField = document.getElementById('giStatement');
  if (statementField && data.statement_text) {
    statementField.value = data.statement_text;
    statementField.dispatchEvent(new Event('input'));
  }

  // ... populate other fields
}
```

---

## 🎯 AI Prompts - What Gets Generated

### Data Sufficiency (DS)
```json
{
  "problem": "Business/Math problem requiring calculation",
  "statement1": "Partial information piece 1",
  "statement2": "Partial information piece 2",
  "correct_answer": "A/B/C/D/E",
  "explanation": "Why this answer is correct",
  "image_url": null,
  "answer_choices": { /* Standard DS choices */ }
}
```

**Difficulty Levels:**
- **Medium (600-700)**: One statement sufficient, 1-2 calculation steps
- **Hard (700+)**: Need both statements together OR complex reasoning

**Topics**: Business metrics, finance, statistics, geometry, algebra

---

### Graphics Interpretation (GI)
```json
{
  "image_url": "chart_name.png",
  "statement_text": "The [BLANK1] shows X and [BLANK2] indicates Y",
  "blank1_options": ["opt1", "opt2", "opt3", "opt4"],
  "blank1_correct": "correct option",
  "blank2_options": ["opt1", "opt2", "opt3", "opt4"],
  "blank2_correct": "correct option"
}
```

**Difficulty Levels:**
- **Medium**: Direct chart reading, basic trends
- **Hard**: Calculations needed, complex interpretations

**Chart Types**: Line graphs, scatter plots, bar charts, pie charts

---

### Table Analysis (TA)
```json
{
  "table_title": "Analysis Title",
  "statement_column_title": "Statement",
  "answer_col1_title": "True",
  "answer_col2_title": "False",
  "column_headers": ["Col1", "Col2", ...],
  "table_data": [["R1C1", "R1C2", ...], ...],
  "statements": [
    { "text": "Statement 1", "is_true": true },
    { "text": "Statement 2", "is_true": false },
    { "text": "Statement 3", "is_true": true }
  ]
}
```

**Difficulty Levels:**
- **Medium**: Direct comparisons, simple calculations
- **Hard**: Complex sorting, multi-column analysis, percentages

**Data Types**: Product performance, regional data, financial ratios, metrics

---

### Two-Part Analysis (TPA)
```json
{
  "scenario": "Business scenario with constraints",
  "statement_title": "Candidate/Option",
  "column1_title": "Selection A",
  "column2_title": "Selection B",
  "shared_options": [
    "Option 1 details",
    "Option 2 details",
    ...
  ],
  "correct_answers": {
    "Option 1 details": "col1",
    "Option 2 details": "col2",
    "Option 3 details": "",
    ...
  }
}
```

**Difficulty Levels:**
- **Medium**: Clear criteria, 2-3 qualifying options per column
- **Hard**: Complex constraints, optimization, overlapping criteria

**Scenarios**: Project staffing, investment selection, vendor selection

---

### Multi-Source Reasoning (MSR)
```json
{
  "sources": [
    {
      "tab_name": "Email/Report",
      "content_type": "text",
      "content": "Business memo..."
    },
    {
      "tab_name": "Data Table",
      "content_type": "table",
      "table_headers": ["Col1", "Col2"],
      "table_data": [["R1C1", "R1C2"], ...]
    }
  ],
  "questions": [
    {
      "text": "Question 1",
      "question_type": "multiple_choice",
      "options": ["A) ...", "B) ...", ...],
      "correct_answer": "C"
    },
    {
      "text": "Evaluate statements",
      "question_type": "two_column",
      "column1_title": "Supported",
      "column2_title": "Not Supported",
      "statements": ["Stmt1", "Stmt2", "Stmt3"],
      "correct_answers": {
        "Stmt1": "col1",
        "Stmt2": "col2",
        "Stmt3": "col1"
      }
    }
  ]
}
```

**Difficulty Levels:**
- **Medium**: Direct info from sources, 1-2 sources per question
- **Hard**: Complex calculations, all sources needed, contradictory data

**Source Types**: Memos, financial tables, market analysis, production reports

---

## 🔧 Customizing AI Prompts

Edit `ai-question-generator.js` → `buildPrompt()` method to modify:

1. **Difficulty parameters**
2. **Topic focus areas**
3. **Question complexity**
4. **Response format**

Example customization:
```javascript
const baseContext = `You are an expert GMAT test question writer...
- Focus on ${customTopic}
- Difficulty: ${customDifficulty}
- Use ${customScenario} scenarios`;
```

---

## 📊 Usage Flow

1. **Select GMAT Section**: Data Insights
2. **Click Create DI Question**
3. **Choose question type** (DS/GI/TA/TPA/MSR)
4. **See AI Generator panel** with difficulty selector
5. **Click Generate** → Claude creates question
6. **Review auto-filled form** → Make adjustments
7. **Save** → Question stored in database

---

## 🔒 API Key Management

### Current Setup:
- Key stored in: `inglese/gmat/data-insights/config.js`
- Gitignored: ✅
- Used by: `ai-question-generator.js`

### To Change Key:
1. Edit `config.js`
2. Update `ANTHROPIC_API_KEY` value
3. Save (auto-loaded on next page refresh)

### Security Best Practices:
- ✅ Never commit `config.js`
- ✅ Don't share API key publicly
- ✅ Rotate keys periodically
- ✅ Monitor API usage in Anthropic Console

---

## 🐛 Troubleshooting

### "API key not configured"
→ Check if `config.js` is loaded and `AI_CONFIG` is defined

### "Failed to parse AI response"
→ Claude's response wasn't valid JSON. Check console for raw response

### "API Error: 401 Unauthorized"
→ API key is invalid or expired. Update in `config.js`

### Button doesn't appear
→ Check if `window.AIQuestionGenerator` exists in console

### Form doesn't populate
→ Check `populateFormWithAIData()` method field IDs match your form

---

## 📈 Next Steps

1. ✅ Test DS generator
2. ⬜ Add to Graphics Interpretation (GI)
3. ⬜ Add to Table Analysis (TA)
4. ⬜ Add to Two-Part Analysis (TPA)
5. ⬜ Add to Multi-Source Reasoning (MSR)

Each integration takes ~5 minutes using the template above!

---

## 💡 Tips

- **Review AI output**: Always check for accuracy and GMAT compliance
- **Adjust difficulty**: If questions are too easy/hard, try different difficulty level
- **Mix manual + AI**: Use AI for initial draft, refine manually
- **Check LaTeX**: AI supports LaTeX - formulas render automatically
- **Real scenarios**: AI generates realistic business cases

Happy question creating! 🎓✨
