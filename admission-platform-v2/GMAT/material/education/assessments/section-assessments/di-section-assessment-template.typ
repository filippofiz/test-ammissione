#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Section Assessment",
  level: "Section Mastery Evaluation",
  intro: "Full-section assessment to evaluate mastery of all DI question types before advancing to VR section.",
  logo: "/Logo.png"
)

= Section Assessment Overview

#info-box[
  *Assessment Details:*
  - *Total Questions:* 20 (mirrors actual GMAT DI section)
  - *Time Limit:* 45 minutes (strictly timed)
  - *Format:* All 5 DI question types
  - *Purpose:* Confirm DI mastery before advancing to VR section
  - *Recommended:* Complete 3-4 section assessments with target scores
]

#warning-box[
  *Progression Criteria:* Student must achieve cycle target score on at least 2 section assessments before moving to VR section.
]

= Question Distribution

== Question Type Coverage

#uptoten-table(
  columns: 4,
  header: ("Question Type", "Questions", "Time Guidance", "Format"),
  "Data Sufficiency (DS)", "5-6", "~2 min each", "Statement evaluation",
  "Graphics Interpretation (GI)", "4-5", "~2 min each", "Graph/chart analysis",
  "Table Analysis (TA)", "3-4", "~2.5 min each", "Sortable table",
  "Two-Part Analysis (TPA)", "3-4", "~2.5 min each", "Dual constraints",
  "Multi-Source Reasoning (MSR)", "3-4", "~3 min each", "Multiple tabs",
)

#pagebreak()

== Difficulty Distribution by Cycle

#uptoten-table(
  columns: 5,
  header: ("Cycle", "Easy (L1-2)", "Medium (L3)", "Hard (L4-5)", "Questions"),
  "Beginner", "70% (14)", "25% (5)", "5% (1)", "20",
  "Intermediate", "30% (6)", "50% (10)", "20% (4)", "20",
  "Advanced", "10% (2)", "40% (8)", "50% (10)", "20",
  "Elite", "5% (1)", "25% (5)", "70% (14)", "20",
)

= Question Slots

== Questions 1-6: Data Sufficiency

#info-box[
  *Subcategories:*
  - Value questions (finding specific values)
  - Yes/No questions (determining sufficiency)
  - Algebraic DS
  - Geometric DS
  - Word problem DS

  *Remember:* AD/BCE method for systematic evaluation

  Source IDs: [To be filled from question bank]
]

== Questions 7-11: Graphics Interpretation

#info-box[
  *Subcategories:*
  - Bar charts and histograms
  - Line graphs and trends
  - Pie charts
  - Scatter plots
  - Combined/complex visualizations

  Source IDs: [To be filled from question bank]
]

#pagebreak()

== Questions 12-14: Table Analysis

#info-box[
  *Subcategories:*
  - Sorting and filtering requirements
  - Cross-column calculations
  - Trend identification
  - Data inference from tables

  Source IDs: [To be filled from question bank]
]

== Questions 15-17: Two-Part Analysis

#info-box[
  *Subcategories:*
  - Quantitative constraints
  - Verbal/logical constraints
  - Mixed constraint problems
  - Optimization scenarios

  Source IDs: [To be filled from question bank]
]

== Questions 18-20: Multi-Source Reasoning

#info-box[
  *Subcategories:*
  - Two-source integration (text + data)
  - Three-source synthesis
  - Yes/No/Cannot determine questions
  - Cross-reference inference

  Source IDs: [To be filled from question bank]
]

#pagebreak()

= Scoring & Evaluation

== Performance Thresholds

#uptoten-table(
  columns: 4,
  header: ("Cycle", "Pass (Advance)", "Review Needed", "Repeat Assessment"),
  "Beginner", "70%+ (14+)", "60-69% (12-13)", "Below 60% (≤11)",
  "Intermediate", "75%+ (15+)", "65-74% (13-14)", "Below 65% (≤12)",
  "Advanced", "80%+ (16+)", "70-79% (14-15)", "Below 70% (≤13)",
  "Elite", "85%+ (17+)", "75-84% (15-16)", "Below 75% (≤14)",
)

== Results Recording

*Assessment Number:* #checkbox 1st #checkbox 2nd #checkbox 3rd #checkbox 4th

*Total Correct:* ... / 20 | *Percentage:* ...%

*Time Used:* ... minutes

== Performance by Question Type

#uptoten-table(
  columns: 3,
  header: ("Question Type", "Correct", "Notes"),
  "Data Sufficiency (Q1-6)", "... / 6", "",
  "Graphics Interpretation (Q7-11)", "... / 5", "",
  "Table Analysis (Q12-14)", "... / 3", "",
  "Two-Part Analysis (Q15-17)", "... / 3", "",
  "Multi-Source Reasoning (Q18-20)", "... / 3", "",
)

#pagebreak()

= Decision Matrix

#info-box[
  *Assessment Result:*

  #checkbox *PASS* - Move to VR section (if 2+ passing assessments achieved)

  #checkbox *CONDITIONAL PASS* - Take another section assessment

  #checkbox *REVIEW NEEDED* - Review weak question types, then reassess

  #checkbox *REPEAT TOPICS* - Return to specific DI topic lessons before reassessing
]

== Question Types Requiring Review (if applicable)

Based on error patterns, identify types for targeted review:

- #checkbox Data Sufficiency
- #checkbox Graphics Interpretation
- #checkbox Table Analysis
- #checkbox Two-Part Analysis
- #checkbox Multi-Source Reasoning

== Common Error Patterns to Note

- #checkbox DS: Confusing "together sufficient" vs "each alone sufficient"
- #checkbox GI: Misreading axes or scales
- #checkbox TA: Not sorting correctly before answering
- #checkbox TPA: Missing one of the two constraints
- #checkbox MSR: Not cross-referencing all sources

== Progression Tracking

#uptoten-table(
  columns: 4,
  header: ("Assessment", "Score", "Result", "Date"),
  "1st", "", "", "",
  "2nd", "", "", "",
  "3rd", "", "", "",
  "4th", "", "", "",
)

#tip-box[
  *Advancement Criteria:*

  Student advances to VR section when:
  - 2+ section assessments meet cycle target score, OR
  - Tutor determines sufficient mastery based on overall performance
]

= Administration Notes

*Date:* ... | *Tutor:* ...

*Student Observations:*
- Time management: #checkbox Rushed #checkbox Appropriate #checkbox Slow
- Tab navigation (MSR): #checkbox Efficient #checkbox Needs practice
- Calculator use: #checkbox Minimal #checkbox Appropriate #checkbox Over-reliant

*Action Items:*
