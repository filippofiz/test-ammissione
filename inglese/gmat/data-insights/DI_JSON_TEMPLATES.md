# GMAT Data Insights JSON Templates

## 1. Data Sufficiency (DS)

```json
{
  "problem": "What is the value of x?",
  "statement1": "x > 5",
  "statement2": "x < 10",
  "correct_answer": "C",
  "explanation": "Both statements together narrow the range to 5 < x < 10",
  "image_url": null,
  "answer_choices": {
    "A": "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "B": "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "C": "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "D": "EACH statement ALONE is sufficient.",
    "E": "Statements (1) and (2) TOGETHER are NOT sufficient."
  }
}
```

## 2. Graphics Interpretation (GI)

```json
{
  "image_url": "https://example.com/chart.png",
  "statement_text": "The correlation between sales and profit is [BLANK1], and revenue [BLANK2] from 2020 to 2021.",
  "blank1_options": [
    "positive",
    "negative",
    "zero",
    "variable"
  ],
  "blank1_correct": "positive",
  "blank2_options": [
    "increased",
    "decreased",
    "remained constant",
    "fluctuated"
  ],
  "blank2_correct": "increased"
}
```

## 3. Table Analysis (TA)

```json
{
  "table_title": "Annual Sales Data by Region",
  "statement_column_title": "Statement",
  "answer_col1_title": "True",
  "answer_col2_title": "False",
  "column_headers": [
    "Region",
    "2020 Sales",
    "2021 Sales",
    "Growth %"
  ],
  "table_data": [
    ["North", "450000", "520000", "15.6%"],
    ["South", "380000", "410000", "7.9%"],
    ["East", "520000", "580000", "11.5%"],
    ["West", "490000", "470000", "-4.1%"]
  ],
  "statements": [
    {
      "text": "The North region had the highest growth percentage.",
      "is_true": true
    },
    {
      "text": "All regions showed positive growth.",
      "is_true": false
    },
    {
      "text": "The East region had the highest sales in both years.",
      "is_true": true
    }
  ]
}
```

## 4. Two-Part Analysis (TPA)

```json
{
  "scenario": "A company needs to increase revenue by 20% next year. The CEO is evaluating several strategies.",
  "statement_title": "Strategy",
  "column1_title": "Achieves 20% Growth",
  "column2_title": "Does Not Achieve 20% Growth",
  "shared_options": [
    "Increase marketing budget by 15%",
    "Hire 3 additional sales representatives",
    "Expand to two new markets",
    "Launch a new product line",
    "Reduce operating costs by 10%"
  ],
  "correct_answers": {
    "Increase marketing budget by 15%": "col2",
    "Hire 3 additional sales representatives": "col2",
    "Expand to two new markets": "col1",
    "Launch a new product line": "col1",
    "Reduce operating costs by 10%": "col2"
  }
}
```

## 5. Multi-Source Reasoning (MSR)

### Multiple Choice Question Format:
```json
{
  "sources": [
    {
      "tab_name": "Email",
      "content_type": "text",
      "content": "From: CEO\nTo: All Staff\n\nOur Q3 revenue exceeded expectations..."
    },
    {
      "tab_name": "Sales Chart",
      "content_type": "chart",
      "image_url": "https://example.com/sales-chart.png"
    },
    {
      "tab_name": "Financial Data",
      "content_type": "table",
      "table_headers": ["Quarter", "Revenue", "Profit"],
      "table_data": [
        ["Q1", "$2.5M", "$500K"],
        ["Q2", "$3.2M", "$650K"],
        ["Q3", "$4.1M", "$820K"]
      ]
    }
  ],
  "questions": [
    {
      "text": "Based on the email and chart, what is the primary reason for Q3 success?",
      "question_type": "multiple_choice",
      "options": [
        "A) Increased marketing spend",
        "B) New product launch",
        "C) Market expansion",
        "D) Cost reduction",
        "E) Strategic partnerships"
      ],
      "correct_answer": "B"
    }
  ]
}
```

### Two-Column Question Format:
```json
{
  "sources": [
    {
      "tab_name": "Email",
      "content_type": "text",
      "content": "From: CFO\nTo: Board\n\nFinancial projections for next quarter..."
    },
    {
      "tab_name": "Budget",
      "content_type": "table",
      "table_headers": ["Department", "Q4 Budget", "Q1 Projection"],
      "table_data": [
        ["Sales", "$500K", "$550K"],
        ["Marketing", "$300K", "$280K"],
        ["R&D", "$400K", "$450K"]
      ]
    }
  ],
  "questions": [
    {
      "text": "Evaluate whether each statement is supported by the sources.",
      "question_type": "two_column",
      "column1_title": "Supported",
      "column2_title": "Not Supported",
      "statements": [
        "Sales budget will increase in Q1",
        "Marketing budget will decrease",
        "Total budget will remain the same",
        "R&D will receive the largest increase"
      ],
      "correct_answers": {
        "Sales budget will increase in Q1": "col1",
        "Marketing budget will decrease": "col1",
        "Total budget will remain the same": "col2",
        "R&D will receive the largest increase": "col1"
      }
    }
  ]
}
```

---

## Notes:

1. **Data Sufficiency**: Always has standard 5 answer choices (A-E)
2. **Graphics Interpretation**: Always has exactly 2 blanks with dropdown options
3. **Table Analysis**: Always has exactly 3 True/False statements, sortable table
4. **Two-Part Analysis**: Shared options with 2-column radio button selection
5. **Multi-Source Reasoning**: 2-3 sources (text/chart/table), multiple questions can be added

## Column Names in Database:
- `di_question_type`: VARCHAR - stores "DS", "GI", "TA", "TPA", or "MSR"
- `di_question_data`: JSONB - stores the complete JSON structure above
