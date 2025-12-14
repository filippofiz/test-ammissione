#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Full Mock Simulation",
  subtitle: "Complete Practice Exam",
  level: "Final Preparation",
  intro: "Complete GMAT-format mock exam to prepare for the actual test. Mirrors real test conditions.",
  logo: "/Logo.png"
)

= Mock Simulation Overview

#info-box[
  *Simulation Details:*
  - *Total Questions:* 64 (exact GMAT format)
  - *Total Time:* 2 hours 15 minutes
  - *Sections:* QR (21) + DI (20) + VR (23)
  - *Purpose:* Final preparation before actual GMAT
  - *Recommended:* 3-5 full mocks before test day
]

#warning-box[
  *Test Conditions Required:*
  - Complete in one sitting
  - No breaks between sections (or standard 10-min break if simulating)
  - No external resources or notes
  - Timed strictly per section
  - Quiet, distraction-free environment
]

= Test Structure

#uptoten-table(
  columns: 4,
  header: ("Section", "Questions", "Time", "Notes"),
  "Quantitative Reasoning", "21", "45 min", "Calculator allowed",
  "Data Insights", "20", "45 min", "Calculator allowed",
  "Verbal Reasoning", "23", "45 min", "No calculator",
  "Total", "64", "2h 15min", "",
)

#tip-box[
  *Section Order:* On the actual GMAT, students choose their section order. For practice, use QR #sym.arrow DI #sym.arrow VR to match curriculum, or let student practice their preferred order.
]

#pagebreak()

= Section 1: Quantitative Reasoning

*Time:* 45 minutes | *Questions:* 21

== Topic Distribution

#uptoten-table(
  columns: 3,
  header: ("Topic", "Questions", "Difficulty"),
  "Number Properties & Arithmetic", "3-4", "Mixed by cycle",
  "Algebra", "4-5", "Mixed by cycle",
  "Word Problems", "3-4", "Mixed by cycle",
  "Geometry", "3-4", "Mixed by cycle",
  "Statistics & Probability", "2-3", "Mixed by cycle",
  "Percents, Ratios & Proportions", "3-4", "Mixed by cycle",
)

== Difficulty Distribution

#uptoten-table(
  columns: 4,
  header: ("Cycle", "Easy", "Medium", "Hard"),
  "Beginner", "15 (70%)", "5 (25%)", "1 (5%)",
  "Intermediate", "6 (30%)", "11 (50%)", "4 (20%)",
  "Advanced", "2 (10%)", "8 (40%)", "11 (50%)",
  "Elite", "1 (5%)", "5 (25%)", "15 (70%)",
)

== Question Slots

#info-box[
  *Questions 1-21:* Complete QR section

  Source IDs: [To be filled from question bank - 21 questions with appropriate difficulty distribution for student's cycle]
]

#pagebreak()

= Section 2: Data Insights

*Time:* 45 minutes | *Questions:* 20

== Question Type Distribution

#uptoten-table(
  columns: 3,
  header: ("Type", "Questions", "Time per Q"),
  "Data Sufficiency", "5-6", "~2 min",
  "Graphics Interpretation", "4-5", "~2 min",
  "Table Analysis", "3-4", "~2.5 min",
  "Two-Part Analysis", "3-4", "~2.5 min",
  "Multi-Source Reasoning", "3-4", "~3 min",
)

== Difficulty Distribution

#uptoten-table(
  columns: 4,
  header: ("Cycle", "Easy", "Medium", "Hard"),
  "Beginner", "14 (70%)", "5 (25%)", "1 (5%)",
  "Intermediate", "6 (30%)", "10 (50%)", "4 (20%)",
  "Advanced", "2 (10%)", "8 (40%)", "10 (50%)",
  "Elite", "1 (5%)", "5 (25%)", "14 (70%)",
)

== Question Slots

#info-box[
  *Questions 1-20:* Complete DI section

  Source IDs: [To be filled from question bank - 20 questions covering all DI types]
]

#pagebreak()

= Section 3: Verbal Reasoning

*Time:* 45 minutes | *Questions:* 23

== Question Type Distribution

#uptoten-table(
  columns: 3,
  header: ("Type", "Questions", "Format"),
  "Critical Reasoning", "11-12", "Argument analysis",
  "Reading Comprehension", "11-12", "3-4 passages",
)

== CR Subcategory Coverage

#uptoten-table(
  columns: 2,
  header: ("Subcategory", "Questions"),
  "Strengthen/Weaken", "4-5",
  "Assumption", "2-3",
  "Inference/Conclusion", "2-3",
  "Evaluate/Method/Flaw", "2-3",
)

== RC Passage Distribution

#uptoten-table(
  columns: 2,
  header: ("Passage Topic", "Questions"),
  "Business/Economics", "3-4",
  "Social Sciences", "3-4",
  "Natural Sciences", "3-4",
  "Mixed (if 4th passage)", "2-3",
)

== Question Slots

#info-box[
  *Questions 1-23:* Complete VR section

  Source IDs: [To be filled from question bank - 23 questions, balanced CR/RC]
]

#pagebreak()

= Scoring & Evaluation

== Mock Score Interpretation

#uptoten-table(
  columns: 3,
  header: ("Raw Score (of 64)", "Estimated GMAT", "Cycle Level"),
  "48-56 (75-87%)", "675-715+", "Elite",
  "40-47 (62-74%)", "615-674", "Advanced",
  "32-39 (50-61%)", "555-614", "Intermediate",
  "24-31 (37-49%)", "505-554", "Beginner",
  "Below 24", "Below 505", "Foundational",
)

#tip-box[
  *Note:* Actual GMAT uses adaptive scoring. Mock scores are approximate indicators based on raw performance.
]

== Target Scores by Cycle

#uptoten-table(
  columns: 3,
  header: ("Current Cycle", "Target Score", "Advancement Threshold"),
  "Beginner", "555+", "Ready for Intermediate",
  "Intermediate", "615+", "Ready for Advanced",
  "Advanced", "675+", "Ready for Elite",
  "Elite", "705+", "Test ready",
)

#pagebreak()

= Results Recording

== Section Scores

#uptoten-table(
  columns: 4,
  header: ("Section", "Correct", "Percentage", "Time Used"),
  "QR (of 21)", "...", "...%", "... min",
  "DI (of 20)", "...", "...%", "... min",
  "VR (of 23)", "...", "...%", "... min",
  "Total (of 64)", "...", "...%", "135 min",
)

== Estimated GMAT Score: ...

== Performance Analysis

*Strongest Section:* ...

*Weakest Section:* ...

== Detailed Section Breakdown

=== QR Performance
#uptoten-table(
  columns: 2,
  header: ("Topic", "Score"),
  "Number Properties", "... / 3-4",
  "Algebra", "... / 4-5",
  "Word Problems", "... / 3-4",
  "Geometry", "... / 3-4",
  "Statistics & Probability", "... / 2-3",
  "Percents, Ratios", "... / 3-4",
)

=== DI Performance
#uptoten-table(
  columns: 2,
  header: ("Type", "Score"),
  "Data Sufficiency", "... / 5-6",
  "Graphics Interpretation", "... / 4-5",
  "Table Analysis", "... / 3-4",
  "Two-Part Analysis", "... / 3-4",
  "Multi-Source Reasoning", "... / 3-4",
)

=== VR Performance
#uptoten-table(
  columns: 2,
  header: ("Type", "Score"),
  "Critical Reasoning", "... / 11-12",
  "Reading Comprehension", "... / 11-12",
)

#pagebreak()

= Mock Progression Tracking

== Mock Simulation History

#uptoten-table(
  columns: 5,
  header: ("Mock #", "Date", "Score", "Est. GMAT", "Notes"),
  "1", "", "", "", "",
  "2", "", "", "", "",
  "3", "", "", "", "",
  "4", "", "", "", "",
  "5", "", "", "", "",
)

== Score Trend Analysis

*First Mock Score:* ...
*Latest Mock Score:* ...
*Improvement:* ... points

#info-box[
  *Ready for Test Day Indicators:*

  #checkbox Achieved target score on 2+ consecutive mocks
  #checkbox Consistent performance across all sections
  #checkbox Effective time management (no sections rushed/overtime)
  #checkbox Confidence level high
  #checkbox Error patterns identified and addressed
]

#pagebreak()

= Test Day Preparation

#tip-box[
  *Final Checklist Before Actual GMAT:*

  *Administrative:*
  - #checkbox Test center location confirmed
  - #checkbox ID and confirmation documents ready
  - #checkbox Test time and arrival requirements known

  *Strategic:*
  - #checkbox Section order decided
  - #checkbox Time management strategy practiced
  - #checkbox Guessing strategy for flagged questions clear

  *Physical:*
  - #checkbox Good sleep schedule established
  - #checkbox Test day nutrition planned
  - #checkbox Stress management techniques practiced
]

#highlight-box[
  *Congratulations!*

  Completing mock simulations means the student has finished the entire UpToTen GMAT preparation program. They have:

  - Completed all 13 vertical topic lessons
  - Passed all topic assessments
  - Passed all section assessments
  - Practiced with full mock simulations

  The student is now ready for the actual GMAT!
]

= Administration Notes

*Mock Number:* ... | *Date:* ... | *Tutor:* ...

*Test Conditions:*
- Environment: #checkbox Quiet/Ideal #checkbox Some distractions #checkbox Not ideal
- Timing: #checkbox Strict #checkbox Minor flexibility #checkbox Untimed sections
- Breaks: #checkbox No breaks #checkbox Standard break #checkbox Extended breaks

*Student Observations:*
- Energy level throughout: #checkbox Strong #checkbox Faded #checkbox Struggled
- Section where most errors: ...
- Recommended focus for next mock: ...

*Decision:*
#checkbox Schedule another mock
#checkbox Review specific topics first
#checkbox Ready for actual GMAT
