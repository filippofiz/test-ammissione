#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Initial Diagnostic",
  subtitle: "Full Simulation Assessment",
  level: "Placement Assessment",
  intro: "Complete GMAT-format diagnostic simulation to determine starting cycle and identify focus areas.",
  logo: "/Logo.png"
)

= Initial Diagnostic Overview

#info-box[
  *Assessment Purpose:*
  - Determine student's starting cycle (Beginner/Intermediate/Advanced/Elite)
  - Identify strengths and weaknesses across all sections
  - Establish baseline score for progress tracking
  - Create personalized study plan based on results
]

#warning-box[
  *Important:* This simulation mirrors the actual GMAT format. Students should take it under real test conditions - timed, no interruptions, no external resources.
]

= Test Format

#uptoten-table(
  columns: 4,
  header: ("Section", "Questions", "Time", "Order"),
  "Quantitative Reasoning", "21", "45 minutes", "1st",
  "Data Insights", "20", "45 minutes", "2nd",
  "Verbal Reasoning", "23", "45 minutes", "3rd",
  "Total", "64", "2h 15min", "-",
)

#tip-box[
  *Note:* On the actual GMAT, students choose section order. For the diagnostic, we use the standard QR #sym.arrow DI #sym.arrow VR order to match our curriculum flow.
]

#pagebreak()

= Section 1: Quantitative Reasoning

*Time Allowed:* 45 minutes | *Questions:* 21

== Question Distribution

#uptoten-table(
  columns: 3,
  header: ("Topic", "Questions", "Difficulty Mix"),
  "Number Properties & Arithmetic", "3-4", "Mixed",
  "Algebra", "4-5", "Mixed",
  "Word Problems", "3-4", "Mixed",
  "Geometry", "3-4", "Mixed",
  "Statistics & Probability", "2-3", "Mixed",
  "Percents, Ratios & Proportions", "3-4", "Mixed",
)

== Question Format

All questions are Problem Solving (PS) format - standard multiple choice with 5 answer options.

== Question Slots

#info-box[
  *Questions 1-21:* Quantitative Reasoning

  Adaptive simulation: Mix of all difficulty levels (1-5) with balanced topic coverage across all six QR topics.

  Source IDs: [To be filled from question bank - 21 questions, adaptive difficulty distribution]
]

#pagebreak()

= Section 2: Data Insights

*Time Allowed:* 45 minutes | *Questions:* 20

== Question Distribution by Type

#uptoten-table(
  columns: 3,
  header: ("Question Type", "Questions", "Format"),
  "Data Sufficiency (DS)", "5-6", "Two statements evaluation",
  "Graphics Interpretation (GI)", "4-5", "Graph/chart questions",
  "Table Analysis (TA)", "3-4", "Sortable table questions",
  "Two-Part Analysis (TPA)", "3-4", "Related constraint questions",
  "Multi-Source Reasoning (MSR)", "3-4", "Multiple tab questions",
)

== Question Slots

#info-box[
  *Questions 1-20:* Data Insights

  Adaptive simulation covering all five DI question types with balanced representation.

  Source IDs: [To be filled from question bank - 20 questions across all DI types]
]

#pagebreak()

= Section 3: Verbal Reasoning

*Time Allowed:* 45 minutes | *Questions:* 23

== Question Distribution

#uptoten-table(
  columns: 3,
  header: ("Question Type", "Questions", "Format"),
  "Critical Reasoning (CR)", "11-12", "Argument-based questions",
  "Reading Comprehension (RC)", "11-12", "3-4 passages with questions",
)

== CR Question Coverage

#uptoten-table(
  columns: 2,
  header: ("CR Subcategory", "Approximate Count"),
  "Strengthen/Weaken", "4-5",
  "Assumption", "2-3",
  "Inference/Conclusion", "2-3",
  "Evaluate/Method", "2-3",
)

== RC Passage Coverage

#uptoten-table(
  columns: 2,
  header: ("RC Subcategory", "Questions"),
  "Main Idea", "2-3",
  "Specific Detail", "2-3",
  "Inference", "3-4",
  "Author's Tone/Structure", "2-3",
)

== Question Slots

#info-box[
  *Questions 1-23:* Verbal Reasoning

  Adaptive simulation with balanced CR and RC coverage across all question types.

  Source IDs: [To be filled from question bank - 23 questions, mixed CR and RC]
]

#pagebreak()

= Scoring & Cycle Placement

== Score to Cycle Mapping

#uptoten-table(
  columns: 3,
  header: ("Total Score Range", "Assigned Cycle", "Description"),
  "Below 505", "Beginner (Extended)", "Additional foundational work needed",
  "505-554", "Beginner", "Focus on fundamentals across all sections",
  "555-614", "Intermediate", "Solid foundation, ready for medium difficulty",
  "615-674", "Advanced", "Strong skills, focus on hard questions",
  "675+", "Elite", "Mastery level, fine-tuning for top scores",
)

== Section-Level Analysis

For each section, note the performance level:

#uptoten-table(
  columns: 4,
  header: ("Section", "Strong (75%+)", "Average (50-74%)", "Weak (<50%)"),
  "QR", [#checkbox], [#checkbox], [#checkbox],
  "DI", [#checkbox], [#checkbox], [#checkbox],
  "VR", [#checkbox], [#checkbox], [#checkbox],
)

#pagebreak()

= Results Recording

== Raw Scores

#uptoten-table(
  columns: 3,
  header: ("Section", "Correct", "Percentage"),
  "QR (of 21)", "...", "...%",
  "DI (of 20)", "...", "...%",
  "VR (of 23)", "...", "...%",
  "Total (of 64)", "...", "...%",
)

== Estimated GMAT Score: ...

== Assigned Cycle: #checkbox Beginner #checkbox Intermediate #checkbox Advanced #checkbox Elite

== Topic-Level Weaknesses Identified

*QR Topics Needing Focus:*
- #checkbox Number Properties & Arithmetic
- #checkbox Algebra
- #checkbox Word Problems
- #checkbox Geometry
- #checkbox Statistics & Probability
- #checkbox Percents, Ratios & Proportions

*DI Types Needing Focus:*
- #checkbox Data Sufficiency
- #checkbox Graphics Interpretation
- #checkbox Table Analysis
- #checkbox Two-Part Analysis
- #checkbox Multi-Source Reasoning

*VR Areas Needing Focus:*
- #checkbox Critical Reasoning
- #checkbox Reading Comprehension

#pagebreak()

= Next Steps

#info-box[
  *Based on diagnostic results:*

  1. Assign student to appropriate cycle
  2. Begin with QR section (first vertical lesson: Number Properties & Arithmetic)
  3. Adjust pacing based on identified weaknesses
  4. Schedule follow-up section assessments after completing each section
]

#tip-box[
  *Tutor Notes:*

  - If student scores significantly differently across sections, consider focusing extra time on weakest section
  - For borderline scores between cycles, consider student's learning pace and goals
  - Students targeting specific score goals may need cycle adjustment regardless of diagnostic
]

= Administration Notes

*Date Administered:* ...

*Proctor/Tutor:* ...

*Test Conditions:* #checkbox Standard (timed, no aids) #checkbox Modified (specify): ...

*Student Feedback:*
- Time management: #checkbox Finished early #checkbox On pace #checkbox Ran out of time
- Difficulty perception: #checkbox Too easy #checkbox Appropriate #checkbox Too hard
- Fatigue level: #checkbox Low #checkbox Moderate #checkbox High
