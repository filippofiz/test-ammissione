#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Placement Assessment",
  subtitle: "Cycle Determination Assessment",
  level: "Initial Assessment",
  intro: "Simil-GMAT assessment to determine the appropriate starting cycle (Foundation, Development, or Excellence).",
  logo: "/Logo.png"
)

= Placement Assessment Overview

#info-box[
  *Assessment Purpose:*
  - Determine student's starting cycle (Foundation / Development / Excellence)
  - Identify strengths and weaknesses across all sections
  - Establish baseline for progress tracking
  - Create personalized study plan based on results
]

#warning-box[
  *Important:* This assessment should be taken under test conditions:
  - Strictly timed
  - No external resources or calculators (GMAT provides on-screen calculator)
  - No interruptions
  - Ideally taken 1-2 days after the Familiarization Mock
]

= Test Format

#uptoten-table(
  columns: 4,
  header: ("Section", "Questions", "Time", "Order"),
  "Quantitative Reasoning", "15", "32 minutes", "1st",
  "Data Insights", "15", "32 minutes", "2nd",
  "Verbal Reasoning", "15", "32 minutes", "3rd",
  "Total", "45", "~1.5 hours", "-",
)

#tip-box[
  *Note:* This is a condensed format (~45 questions vs 64 on actual GMAT) designed to provide accurate placement while respecting student time. Question difficulty is mixed to assess performance across levels.
]

#pagebreak()

= Section 1: Quantitative Reasoning

*Time Allowed:* 32 minutes | *Questions:* 15 | *Pace:* ~2 min/question

== Question Distribution

#uptoten-table(
  columns: 3,
  header: ("Topic", "Questions", "Difficulty Mix"),
  "Number Properties & Arithmetic", "3", "1 Easy, 1 Medium, 1 Hard",
  "Algebra", "3", "1 Easy, 1 Medium, 1 Hard",
  "Word Problems", "3", "1 Easy, 1 Medium, 1 Hard",
  "Statistics & Probability", "3", "1 Easy, 1 Medium, 1 Hard",
  "Percents, Ratios & Proportions", "3", "1 Easy, 1 Medium, 1 Hard",
)

== Difficulty Distribution

#uptoten-table(
  columns: 2,
  header: ("Difficulty", "Questions"),
  "Easy (Foundation level)", "5",
  "Medium (Development level)", "5",
  "Hard (Excellence level)", "5",
)

== Question Slots

#info-box[
  *Questions 1-15:* Quantitative Reasoning

  Question distribution should follow the topic breakdown above.

  Source IDs: [To be filled from question bank - 15 questions with specified difficulty distribution]

  *Scoring Guide:*
  - Questions 1-5: Easy (1 point each)
  - Questions 6-10: Medium (1 point each)
  - Questions 11-15: Hard (1 point each)
]

#pagebreak()

= Section 2: Data Insights

*Time Allowed:* 32 minutes | *Questions:* 15 | *Pace:* ~2 min/question

== Question Distribution by Type

#uptoten-table(
  columns: 3,
  header: ("Question Type", "Questions", "Format"),
  "Data Sufficiency (DS)", "4", "Statement evaluation",
  "Graphics Interpretation (GI)", "3", "Graph/chart fill-in",
  "Table Analysis (TA)", "3", "True/False statements",
  "Two-Part Analysis (TPA)", "3", "Two-column selection",
  "Multi-Source Reasoning (MSR)", "2 (1 set)", "Multi-tab synthesis",
)

== Difficulty Distribution

#uptoten-table(
  columns: 2,
  header: ("Difficulty", "Questions"),
  "Easy (Foundation level)", "5",
  "Medium (Development level)", "5",
  "Hard (Excellence level)", "5",
)

== Question Slots

#info-box[
  *Questions 1-15:* Data Insights

  Source IDs: [To be filled from question bank - 15 questions across all DI types]

  Include at least one question of each type, with DS having highest representation (consistent with actual GMAT).
]

#pagebreak()

= Section 3: Verbal Reasoning

*Time Allowed:* 32 minutes | *Questions:* 15 | *Pace:* ~2 min/question

== Question Distribution

#uptoten-table(
  columns: 3,
  header: ("Question Type", "Questions", "Format"),
  "Critical Reasoning (CR)", "9", "Argument-based multiple choice",
  "Reading Comprehension (RC)", "6", "2 passages with 3 questions each",
)

== CR Question Type Coverage

#uptoten-table(
  columns: 2,
  header: ("CR Type", "Questions"),
  "Strengthen/Weaken", "3-4",
  "Assumption", "2",
  "Inference/Conclusion", "2",
  "Evaluate/Method/Flaw", "2",
)

== RC Passage Coverage

#uptoten-table(
  columns: 3,
  header: ("Passage", "Topic Area", "Questions"),
  "Passage 1", "Business/Economics", "3",
  "Passage 2", "Science/Social Science", "3",
)

== Difficulty Distribution

#uptoten-table(
  columns: 2,
  header: ("Difficulty", "Questions"),
  "Easy (Foundation level)", "5",
  "Medium (Development level)", "5",
  "Hard (Excellence level)", "5",
)

== Question Slots

#info-box[
  *Questions 1-15:* Verbal Reasoning

  Source IDs: [To be filled from question bank - 9 CR + 6 RC questions]
]

#pagebreak()

= Scoring & Cycle Placement

== Scoring Method

Each question is worth 1 point. Total possible: 45 points.

#uptoten-table(
  columns: 4,
  header: ("Section", "Questions", "Max Score", "Percentage Base"),
  "QR", "15", "15", "33%",
  "DI", "15", "15", "33%",
  "VR", "15", "15", "33%",
  "Total", "45", "45", "100%",
)

== Score to Cycle Mapping

#uptoten-table(
  columns: 4,
  header: ("Raw Score", "Percentage", "Est. GMAT Score", "Assigned Cycle"),
  "0-17", "0-38%", "Below 505", "Foundation (Extended)",
  "18-25", "40-55%", "505-605", "Foundation",
  "26-33", "58-73%", "605-665", "Development",
  "34-45", "76-100%", "665+", "Excellence",
)

#tip-box[
  *Borderline Cases:*
  - If score falls at exact boundary, consider section-level performance
  - Students with strong performance in one section but weak in another may need targeted approach
  - Consider student's target score and timeline when making final placement decision
]

== Expected Score Improvements by Cycle

#uptoten-table(
  columns: 3,
  header: ("Starting Cycle", "Expected Improvement", "Target Score Range"),
  "Foundation", "+100 to +120 points", "505-605",
  "Development", "+50 to +60 points", "605-665",
  "Excellence", "+25 points", "665-715+",
)

#pagebreak()

= Results Recording

== Section Scores

#uptoten-table(
  columns: 5,
  header: ("Section", "Easy (of 5)", "Medium (of 5)", "Hard (of 5)", "Total (of 15)"),
  "QR", "...", "...", "...", "...",
  "DI", "...", "...", "...", "...",
  "VR", "...", "...", "...", "...",
)

== Summary

*Total Raw Score:* ... / 45

*Percentage:* ...%

*Estimated GMAT Score:* ...

== Assigned Cycle

#checkbox Foundation (Extended - below 505)
#checkbox Foundation (505-605)
#checkbox Development (605-665)
#checkbox Excellence (665+)

== Section-Level Analysis

#uptoten-table(
  columns: 4,
  header: ("Section", "Strong (11+)", "Average (7-10)", "Weak (0-6)"),
  "QR", [#checkbox], [#checkbox], [#checkbox],
  "DI", [#checkbox], [#checkbox], [#checkbox],
  "VR", [#checkbox], [#checkbox], [#checkbox],
)

#pagebreak()

= Detailed Performance Analysis

== QR Topics Performance

#uptoten-table(
  columns: 4,
  header: ("Topic", "Correct", "Total", "Needs Focus?"),
  "Number Properties & Arithmetic", "...", "3", [#checkbox],
  "Algebra", "...", "3", [#checkbox],
  "Word Problems", "...", "3", [#checkbox],
  "Statistics & Probability", "...", "3", [#checkbox],
  "Percents, Ratios & Proportions", "...", "3", [#checkbox],
)

== DI Types Performance

#uptoten-table(
  columns: 4,
  header: ("Type", "Correct", "Total", "Needs Focus?"),
  "Data Sufficiency", "...", "4", [#checkbox],
  "Graphics Interpretation", "...", "3", [#checkbox],
  "Table Analysis", "...", "3", [#checkbox],
  "Two-Part Analysis", "...", "3", [#checkbox],
  "Multi-Source Reasoning", "...", "2", [#checkbox],
)

== VR Types Performance

#uptoten-table(
  columns: 4,
  header: ("Type", "Correct", "Total", "Needs Focus?"),
  "Critical Reasoning", "...", "9", [#checkbox],
  "Reading Comprehension", "...", "6", [#checkbox],
)

== Difficulty Level Analysis

#uptoten-table(
  columns: 4,
  header: ("Difficulty", "Correct", "Total", "Interpretation"),
  "Easy", "...", "15", "Foundation baseline",
  "Medium", "...", "15", "Development readiness",
  "Hard", "...", "15", "Excellence potential",
)

#pagebreak()

= Recommendations & Next Steps

#info-box[
  *Based on assessment results:*

  1. *Cycle Assignment:* ...
  2. *Starting Section:* Quantitative Reasoning (all cycles start here)
  3. *Priority Topics:* ...
  4. *Estimated Timeline:*
     - Foundation: 20-24 weeks at 2 lessons/week
     - Development: 15-18 weeks at 2 lessons/week
     - Excellence: 10-12 weeks at 2 lessons/week
]

== Areas Requiring Extra Attention

*QR Topics:*
#checkbox Number Properties & Arithmetic
#checkbox Algebra
#checkbox Word Problems
#checkbox Statistics & Probability
#checkbox Percents, Ratios & Proportions

*DI Types:*
#checkbox Data Sufficiency
#checkbox Graphics Interpretation
#checkbox Table Analysis
#checkbox Two-Part Analysis
#checkbox Multi-Source Reasoning

*VR Areas:*
#checkbox Critical Reasoning
#checkbox Reading Comprehension

== Tutor Notes

*Observations during assessment:*

...

*Time management observations:*

#checkbox Finished sections early
#checkbox Good pace throughout
#checkbox Rushed at end of sections
#checkbox Did not finish one or more sections

= Administration Record

*Date Administered:* ...

*Tutor/Proctor:* ...

*Student:* ...

*Test Conditions:*
#checkbox Standard (fully timed, no aids)
#checkbox Modified (specify): ...

*Start Time:* ... *End Time:* ...

*Student Self-Assessment:*
- Difficulty: #checkbox Too easy #checkbox Appropriate #checkbox Too hard
- Time: #checkbox Had extra time #checkbox Just enough #checkbox Needed more
- Confidence: #checkbox High #checkbox Moderate #checkbox Low
