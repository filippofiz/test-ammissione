#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Table Analysis",
  level: "Topic Assessment",
  intro: "Timed assessment to evaluate mastery of Table Analysis.",
  logo: "/Logo.png"
)

= Topic Assessment Overview

#info-box[
  *Assessment Details:*
  - *Total Questions:* 20 statements (from ~7 tables with 3 statements each)
  - *Time Limit:* 50 minutes (strictly timed)
  - *Topic:* Table Analysis
  - *Conducted In:* Lesson C
  - *Purpose:* Determine mastery before advancing to Two-Part Analysis
]

= Question Specifications

== Difficulty Distribution by Cycle

#uptoten-table(
  columns: 5,
  header: ("Cycle", "Easy", "Medium", "Hard", "Total"),
  "Beginner", "12 (60%)", "6 (30%)", "2 (10%)", "20",
  "Intermediate", "5 (25%)", "10 (50%)", "5 (25%)", "20",
  "Advanced", "2 (10%)", "8 (40%)", "10 (50%)", "20",
  "Elite", "1 (5%)", "5 (25%)", "14 (70%)", "20",
)

== Comprehensive Topic Coverage

#uptoten-table(
  columns: 3,
  header: ("Category", "Statements", "Coverage Required"),
  "Direct Lookup", "4-5", "Max, min, rankings",
  "Median/Statistics", "3-4", "Central tendency from sorting",
  "Percentages", "3-4", "Part/whole calculations",
  "Derived Values", "3-4", "Calculated ratios",
  "Multi-Condition", "3-4", "Combined criteria",
  "Edge Cases", "2-3", "Precise wording, ties",
)

= Question Slots

== Tables 1-2: Basic Analysis (6 statements)
- Subcategories: Direct lookup, simple median, basic percentages
- Source IDs: [To be filled from question bank]

== Tables 3-4: Calculation Required (6 statements)
- Subcategories: Derived values, complex percentages
- Source IDs: [To be filled from question bank]

== Tables 5-6: Multi-Condition Analysis (6 statements)
- Subcategories: Multiple criteria, relationships between columns
- Source IDs: [To be filled from question bank]

== Table 7: Mixed/Comprehensive (2-3 statements)
- Subcategories: All types combined
- Source IDs: [To be filled from question bank]

= Scoring & Evaluation

== Performance Thresholds

#uptoten-table(
  columns: 4,
  header: ("Cycle", "Pass", "Review Needed", "Repeat Topic"),
  "Beginner", "70%+ (14+)", "60-69% (12-13)", "Below 60%",
  "Intermediate", "75%+ (15+)", "65-74% (13-14)", "Below 65%",
  "Advanced", "80%+ (16+)", "70-79% (14-15)", "Below 70%",
  "Elite", "85%+ (17+)", "75-84% (15-16)", "Below 75%",
)

= Results

Total Statements Correct: ... / 20 | Percentage: ... %

Decision: #checkbox PASS (Advance to Two-Part Analysis) #checkbox REVIEW NEEDED #checkbox REPEAT TOPIC
