#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT",
  subtitle: "Data Insights",
  level: "Section Overview",
  intro: "An introduction to the Data Insights section: format, the five question types, data analysis skills, and strategic approaches.",
  logo: "/Logo.png"
)

= Section Overview

The Data Insights (DI) section tests your ability to analyze and interpret data presented in multiple formats, combining quantitative and verbal reasoning skills.

#info-box[
  *Section Format:*
  - *Questions:* 20
  - *Time:* 45 minutes
  - *Average Time per Question:* ~2 minutes 15 seconds
  - *Score Range:* 60-90
  - *Calculator:* ON-SCREEN CALCULATOR AVAILABLE
]

== What DI Really Tests

Data Insights evaluates your ability to:

1. *Interpret Data*: Understand information in tables, graphs, and text
2. *Evaluate Sufficiency*: Determine what information is needed to solve problems
3. *Synthesize Sources*: Combine information from multiple sources
4. *Make Decisions*: Draw conclusions from complex data sets

#tip-box[
  *Key Insight:* DI is the bridge between QR and VR—it requires both mathematical analysis AND logical reasoning.
]

= The Five Question Types

DI features five distinct question types, each requiring different skills:

#uptoten-table(
  columns: 3,
  header: ("Type", "Abbreviation", "Key Skill"),
  "Data Sufficiency", "DS", "Evaluating what info is needed",
  "Graphics Interpretation", "GI", "Reading charts and graphs",
  "Table Analysis", "TA", "Sorting and analyzing tables",
  "Two-Part Analysis", "TPA", "Solving related problems",
  "Multi-Source Reasoning", "MSR", "Synthesizing multiple sources",
)

= Question Type 1: Data Sufficiency (DS)

DS questions are unique to the GMAT. They don't ask you to solve a problem—they ask if you COULD solve it.

== Format

#example-box[
  *Data Sufficiency Structure:*

  *Question:* What is the value of x?

  *(1)* x + y = 10
  *(2)* x - y = 4

  *(A)* Statement (1) ALONE is sufficient
  *(B)* Statement (2) ALONE is sufficient
  *(C)* BOTH statements TOGETHER are sufficient, but NEITHER alone
  *(D)* EACH statement ALONE is sufficient
  *(E)* Statements (1) and (2) TOGETHER are NOT sufficient
]

== The AD/BCE Method

#strategy-box[
  *Systematic Approach:*

  1. *Evaluate Statement (1) alone*
     - If sufficient → Answer is (A) or (D)
     - If insufficient → Answer is (B), (C), or (E)

  2. *Evaluate Statement (2) alone* (forget Statement 1!)
     - If (1) was sufficient AND (2) is sufficient → Answer is (D)
     - If (1) was sufficient AND (2) is insufficient → Answer is (A)
     - If (1) was insufficient AND (2) is sufficient → Answer is (B)
     - If both insufficient alone → Test together for (C) or (E)
]

== Two Types of DS Questions

#info-box[
  *Value Questions:* "What is x?" — Need ONE specific value

  *Yes/No Questions:* "Is x > 5?" — Need a DEFINITE yes or DEFINITE no

  *Critical:* For Yes/No questions, getting a definite "No" IS sufficient!
]

= Question Type 2: Graphics Interpretation (GI)

GI questions present visual data (charts, graphs) and ask you to complete statements about the data.

== Format

#example-box[
  *Graphics Interpretation Structure:*

  [A graph or chart is displayed]

  Select the answer that best completes each statement:

  "According to the graph, the year with the highest growth rate was ...."

  *Dropdown options:* 2019 / 2020 / 2021 / 2022
]

== Graph Types You'll See

- Line graphs
- Bar charts
- Pie charts
- Scatter plots
- Dual-axis graphs
- Stacked bar/area charts

#warning-box[
  *Watch Out For:*
  - Truncated y-axes (scale doesn't start at zero)
  - Different scales on dual axes
  - Percentage vs. absolute values
  - Correlation #sym.eq.not causation
]

= Question Type 3: Table Analysis (TA)

TA questions present a sortable data table and ask you to evaluate statements as True or False.

== Format

#example-box[
  *Table Analysis Structure:*

  [A sortable data table is displayed]

  For each statement, indicate whether it is True or False:

  #checkbox The median salary is greater than \$50,000.
  #checkbox Company X has the highest revenue per employee.
  #checkbox More than 60% of companies are in the technology sector.
]

== Key Skills

#tip-box[
  *Table Analysis Strategy:*
  - Use the sort function strategically
  - Calculate percentages and ratios as needed
  - Find medians by sorting the relevant column
  - Don't evaluate all data—focus on what each statement requires
]

= Question Type 4: Two-Part Analysis (TPA)

TPA questions present a scenario with two related questions that share the same answer options.

== Format

#example-box[
  *Two-Part Analysis Structure:*

  A store offers a 20% discount on purchases over \$100. A customer buys items totaling \$150 before any discount.

  Select one value for the discount amount and one for the final price.

  #table(
    columns: 3,
    [Discount], [Final Price], [Options],
    [○], [○], [\$20],
    [○], [○], [\$30],
    [○], [○], [\$120],
    [○], [○], [\$130],
  )
]

== Types of TPA Problems

1. *Mathematical*: Two values that must satisfy conditions
2. *Logical*: Strengthen/weaken arguments
3. *Constraint-based*: Find values meeting multiple criteria

#strategy-box[
  *TPA Approach:*
  1. Identify the relationship between the two parts
  2. Determine if one part constrains the other
  3. Solve the more constrained part first
  4. Check that both answers are consistent
]

= Question Type 5: Multi-Source Reasoning (MSR)

MSR questions present information across multiple tabs (2-3 sources) and ask questions requiring synthesis.

== Format

#example-box[
  *Multi-Source Reasoning Structure:*

  *Tab 1 - Email:* [Text about a project timeline]
  *Tab 2 - Report:* [Data about project costs]
  *Tab 3 - Chart:* [Graph showing resource allocation]

  Questions may ask:
  - "Based on all sources, what is the total project budget?"
  - "Which statement is supported by the information?"
  - "If the timeline is extended, what happens to costs?"
]

== Key Strategies

#tip-box[
  *MSR Approach:*
  1. Quickly scan all tabs first (don't read in detail)
  2. Read the question
  3. Identify which tabs contain relevant information
  4. Cross-reference data between sources
  5. Watch for contradictions or updates between sources
]

#warning-box[
  *Time Warning:* MSR questions take longer (3-4 minutes per set). Budget your time accordingly.
]

= Our Learning Path

You will cover DI through 5 vertical lessons:

== Lesson Sequence

#uptoten-table(
  columns: 3,
  header: ("Lesson", "Topic", "Sessions"),
  "1", "Data Sufficiency (DS)", "3 lessons",
  "2", "Graphics Interpretation (GI)", "3 lessons",
  "3", "Table Analysis (TA)", "3 lessons",
  "4", "Two-Part Analysis (TPA)", "3 lessons",
  "5", "Multi-Source Reasoning (MSR)", "3 lessons",
)

*Total: 15 lessons for the DI section*

= Using the Calculator

The DI section provides an on-screen calculator. Use it wisely.

== When to Use the Calculator

#tip-box[
  *Good Uses:*
  - Complex multiplication/division
  - Precise percentage calculations
  - Verifying estimates
  - Working with decimals
]

== When NOT to Use the Calculator

#warning-box[
  *Avoid for:*
  - Simple operations (2 × 5, 100 ÷ 4)
  - Estimation problems
  - Conceptual questions
  - When mental math is faster
]

#strategy-box[
  *Calculator Rule:* If the calculation takes less than 10 seconds mentally, don't use the calculator. The time to click and type often exceeds the time to think.
]

= Time Management

== Pacing by Question Type

#uptoten-table(
  columns: 3,
  header: ("Type", "Questions (typical)", "Time Budget"),
  "DS", "4-5", "1.5-2 min each",
  "GI", "3-4", "1.5-2 min each",
  "TA", "2-3", "2-2.5 min each",
  "TPA", "3-4", "2-2.5 min each",
  "MSR", "2-3 sets", "3-4 min per set",
)

== Time Checkpoints

#uptoten-table(
  columns: 2,
  header: ("Checkpoint", "Target"),
  "After ~7 questions", "~15 minutes used",
  "After ~13 questions", "~30 minutes used",
  "After 20 questions", "~45 minutes (done)",
)

#warning-box[
  *MSR Warning:* Don't let MSR sets consume too much time. Set a hard limit of 4 minutes per set. If you haven't finished, make educated guesses.
]

= Common Mistakes to Avoid

== DS Mistakes

#warning-box[
  *Data Sufficiency Traps:*
  - Forgetting to test Statement (2) alone
  - Not recognizing when a definite "No" is sufficient
  - Over-calculating instead of testing sufficiency
  - Missing hidden constraints in the question stem
]

== GI/TA Mistakes

#warning-box[
  *Graphics & Table Traps:*
  - Misreading axes or scales
  - Confusing percentage change with absolute change
  - Not sorting before finding medians
  - Rushing and misidentifying data points
]

== TPA/MSR Mistakes

#warning-box[
  *Complex Question Traps:*
  - Not checking that both TPA parts are consistent
  - Missing information in one of the MSR tabs
  - Spending too long on one question
  - Not using process of elimination
]

= What to Expect in Training

== Training Sessions (Homework)

Between lessons, you'll complete:
- *10-14 questions per training* (varies by type)
- *30-40 minutes* (strictly timed)
- *Focus on current question type*
- *Cycle-appropriate difficulty*

== Topic Assessments

After each question type:
- *20 questions*
- *45-50 minutes*
- *Must demonstrate mastery to advance*

== Section Assessments

After all DI topics:
- *20 questions* (full GMAT DI format)
- *45 minutes*
- *Multiple assessments before moving to VR*

= Success Mindset

#highlight-box[
  *DI Success Factors:*

  1. *Flexibility*—each question type requires different skills
  2. *Efficiency*—use the calculator strategically
  3. *Synthesis*—connect information from different sources
  4. *Logic*—DS requires reasoning, not just calculating
  5. *Time awareness*—budget differently for different types
]

= Transition from QR

Having completed Quantitative Reasoning, you bring:

- Strong mathematical foundations
- Problem-solving strategies
- Mental math skills
- Time management experience

#tip-box[
  *Building on QR:* Many DI questions use the same math concepts. The difference is HOW the questions are framed and what skills they emphasize.
]

= Next Steps

After this overview:

1. *Lesson 1A*: Data Sufficiency
2. Learn the unique format and AD/BCE method
3. Practice evaluating sufficiency without solving

#tip-box[
  *Preparation Tip:* Review the DS answer choices until you can recite them from memory. Understanding the structure is half the battle.
]
