#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Data Insights - Overview_],
        [
          #figure(
            image("../../Logo.png", width: 2cm)
          )
        ]
      )
      line(length: 100%, stroke: 0.5pt + rgb("#4caf50"))
    }
  },
  numbering: "1",
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 {
      align(center)[
        #line(length: 100%, stroke: 0.5pt + rgb("#4caf50"))
        #v(0.3em)
        #text(size: 9pt, fill: rgb("#021d49"))[
          Page #page-num | UpToTen - Learn Stem More
        ]
      ]
    }
  }
)

#set text(
  font: "Arial",
  size: 11pt,
  lang: "en",
)

#set par(
  justify: true,
  leading: 0.65em,
)

#set heading(numbering: "1.")

// UpToTen Brand Colors
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

// Custom styled boxes
#let info-box(content) = box(
  fill: uptoten-blue.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let tip-box(content) = box(
  fill: uptoten-green.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let warning-box(content) = box(
  fill: uptoten-orange.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("../../Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Data Insights]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Section Overview]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    A comprehensive introduction to the GMAT Data Insights section, including format, question types, and essential strategies.\
    \
    This guide covers Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics Interpretation, and Two-Part Analysis.
  ]
  #v(2.5cm)
  #text(size: 10pt, fill: gray)[
    Via G. Frua 21/6, Milano | www.uptoten.it
  ]
  #v(1.5cm)
  #block(
    width: 100%,
    inset: 10pt,
    stroke: 0.5pt + gray,
    radius: 3pt,
    [
      #set text(size: 7pt, fill: gray)
      #set par(justify: true, leading: 0.5em)
      *Trademark Notice:* GMAT™ is a trademark of the Graduate Management Admission Council (GMAC). This material is not endorsed by, affiliated with, or associated with GMAC. All GMAT-related trademarks are the property of their respective owners.

      *Copyright & Distribution Notice:* This document is proprietary educational material of UpToTen. All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without prior written permission. Unauthorized copying, sharing, or redistribution is strictly prohibited.

      *Educational Purpose:* This material is intended solely for educational purposes to help students prepare for standardized tests.
    ]
  )
]

#pagebreak()

= Introduction to Data Insights

The Data Insights (DI) section of the GMAT measures your ability to analyze and interpret data from multiple sources, reason quantitatively, and make strategic decisions based on information.

#tip-box[
  *Key Mindset Shift*

  Data Insights isn't just about calculation - it's about *extracting meaning from data*. You'll interpret charts, evaluate sufficiency of information, and synthesize data from multiple sources. These are core business skills.
]

== What the Section Measures

The Data Insights section evaluates:

- Ability to analyze data presented in different formats (tables, graphs, text)
- Skill in determining what information is sufficient to answer a question
- Capacity to synthesize information from multiple sources
- Quantitative reasoning with real-world data
- Decision-making based on complex information

#warning-box[
  *Important*: This section combines skills from both Quantitative and Verbal Reasoning. You'll need mathematical ability AND logical analysis.
]

== Section Format at a Glance

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Aspect*], [*Details*],
  [Number of Questions], [20 questions],
  [Time Allowed], [45 minutes],
  [Question Types], [5 different types (see below)],
  [Calculator], [On-screen calculator available],
  [Adaptive Format], [Item-level computer adaptive],
  [Average Time per Question], [Approximately 2 minutes, 15 seconds],
)

#pagebreak()

= Question Types Overview

The Data Insights section contains five distinct question types, each testing different skills.

== Data Sufficiency

=== Format

- A question followed by two statements of data
- You must determine whether the data is sufficient to answer the question
- You do NOT need to calculate the actual answer

=== Answer Choices (Always the Same)

#info-box[
  *Data Sufficiency Answer Choices*

  (A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient

  (B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient

  (C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient

  (D) EACH statement ALONE is sufficient

  (E) Statements (1) and (2) TOGETHER are NOT sufficient
]

=== What It Tests

- Understanding of what information is needed to solve a problem
- Recognizing constraints and limitations
- Avoiding unnecessary calculations

#pagebreak()

== Multi-Source Reasoning

=== Format

- Information presented in 2-3 tabbed pages (text passages, tables, graphs)
- Multiple questions per set (typically 3)
- You must navigate between tabs to find relevant information

=== What It Tests

- Synthesizing information from multiple sources
- Identifying which sources contain needed information
- Drawing conclusions from complex, distributed data

#tip-box[
  *Strategy Insight*

  Don't try to memorize all the data. Instead, understand what each source contains and know where to find information when questions ask for it.
]

== Table Analysis

=== Format

- A sortable table with multiple columns
- Several statements to evaluate as True or False (or similar binary choices)
- You can sort the table by any column

=== What It Tests

- Ability to organize and analyze tabular data
- Understanding statistics (mean, median, range)
- Identifying patterns and relationships in data

#pagebreak()

== Graphics Interpretation

=== Format

- A graph or visual display of data (scatter plot, line graph, bar chart, etc.)
- Statements with dropdown menus to complete
- You select the option that makes each statement accurate

=== What It Tests

- Reading and interpreting visual data
- Understanding graphical relationships
- Extracting specific values from displays

== Two-Part Analysis

=== Format

- A scenario or problem
- A table with three columns: answer choices and two response columns
- You select one answer for each column (answers can be the same or different)

=== What It Tests

- Solving problems with interrelated components
- Recognizing how parts of a solution relate to each other
- Both quantitative and verbal reasoning

#info-box[
  *Key Feature*

  Two-Part Analysis questions can be mathematical, logical, or verbal in nature. The common thread is that you must select two related answers.
]

#pagebreak()

= Understanding the On-Screen Calculator

The Data Insights section provides an on-screen calculator - the only GMAT section to do so.

== Calculator Features

- Basic arithmetic operations
- Square root function
- Memory functions
- Reciprocal function

== When to Use (and Not Use) the Calculator

#tip-box[
  *Strategic Calculator Use*

  *DO use for*:
  - Complex arithmetic you can't do mentally
  - Verifying quick estimates
  - Calculations with decimals

  *DON'T use for*:
  - Simple arithmetic (wastes time)
  - Problems that can be estimated
  - When conceptual understanding is being tested
]

#warning-box[
  *Warning*

  Over-reliance on the calculator slows you down. Many questions are designed to be solved more efficiently through estimation or conceptual analysis than through calculation.
]

#pagebreak()

= Scoring and Its Implications

== Score Range

- *Section Score*: 60 to 90 (in 1-point increments)
- *Total GMAT Score*: 205 to 805 (in 10-point increments)

The Total GMAT score is based on all three section scores (Quantitative Reasoning, Verbal Reasoning, and Data Insights).

== What the Score Means

Data Insights tests skills highly valued in business:
- Data analysis and interpretation
- Information synthesis
- Strategic decision-making

Strong performance demonstrates your ability to work with the types of data you'll encounter in business school and your career.

= Time Management Strategy

With 20 questions in 45 minutes, you have approximately *2 minutes and 15 seconds* per question. However, time varies significantly by question type.

== Time Allocation by Question Type

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Question Type*], [*Recommended Time*],
  [Data Sufficiency], [1.5 - 2 minutes],
  [Graphics Interpretation], [1.5 - 2 minutes],
  [Table Analysis], [2 - 2.5 minutes],
  [Two-Part Analysis], [2 - 2.5 minutes],
  [Multi-Source Reasoning], [2.5 - 3 minutes per question],
)

#pagebreak()

== Pacing Guidelines

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Checkpoint*], [*Target*],
  [After 5 questions], [~11 minutes elapsed],
  [After 10 questions], [~22-23 minutes elapsed],
  [After 15 questions], [~34 minutes elapsed],
  [After 20 questions], [45 minutes (section complete)],
)

#warning-box[
  *Critical Rule*

  Multi-Source Reasoning sets can be time traps. Set a limit of 8-9 minutes for a 3-question set. If you're not making progress, make educated guesses and move on.
]

= Essential Strategies

== Data Sufficiency Strategies

=== The AD/BCE Method

#info-box[
  *Systematic Approach*

  1. Evaluate Statement (1) alone
     - If sufficient #sym.arrow Answer is (A) or (D)
     - If not sufficient #sym.arrow Answer is (B), (C), or (E)

  2. Evaluate Statement (2) alone
     - Based on Step 1, narrow to remaining choices

  3. If needed, combine statements
]

=== Key Principles

- Focus on sufficiency, NOT calculation
- Test specific values when helpful
- Remember: A unique answer exists even if you don't find it

#pagebreak()

== Multi-Source Reasoning Strategies

=== First Pass Approach

#tip-box[
  *Initial Review (30-60 seconds)*

  1. Skim all tabs to understand what each contains
  2. Note the type of information in each tab
  3. Don't try to absorb all details yet
]

=== Question-Driven Navigation

- Read the question first
- Identify which tab(s) likely contain needed information
- Go directly to relevant source
- Return to question with specific data

== Table Analysis Strategies

=== Sorting Strategy

- Sort by the column most relevant to the question
- For questions about ranges or extremes, sort to find min/max
- For averages/medians, sorting often reveals patterns

=== Binary Answer Strategy

- Each statement is independent
- Don't let one answer influence another
- Use the table's sorting capability for each statement

#pagebreak()

== Graphics Interpretation Strategies

=== Reading the Visual

1. Identify axis labels and units
2. Note the scale (linear? logarithmic?)
3. Look for trends, patterns, outliers
4. Pay attention to legends and keys

=== Completing Statements

- Read the entire statement before looking at options
- Eliminate clearly wrong options
- Verify your choice matches the data precisely

== Two-Part Analysis Strategies

=== Understanding the Relationship

- Determine if the two parts are:
  - Mathematically related (one constrains the other)
  - Independent but testing similar concepts
  - Two components of the same solution

=== Solving Approach

#tip-box[
  *Efficient Two-Part Strategy*

  1. Identify the relationship between parts
  2. Often easier to solve one part first, then use that to constrain the other
  3. Check that both selections satisfy all given conditions
]

#pagebreak()

= Common Mistakes to Avoid

== Data Sufficiency Errors

1. *Calculating the answer*: You only need to determine sufficiency
2. *Ignoring constraints*: Read the question stem carefully
3. *Not testing values*: Use specific numbers to check sufficiency
4. *Forgetting answer choice patterns*: The five choices are always the same

== Multi-Source Reasoning Errors

1. *Information overload*: Trying to remember everything
2. *Wrong source*: Using information from the wrong tab
3. *Missing integration*: Not combining information from multiple sources
4. *Time mismanagement*: Spending too long on initial reading

== Table Analysis Errors

1. *Not sorting*: The table is sortable for a reason
2. *Misreading columns*: Pay attention to column headers and units
3. *Calculation errors*: Double-check arithmetic

== Graphics Interpretation Errors

1. *Misreading scales*: Check if axes are linear or logarithmic
2. *Ignoring units*: Pay attention to what's being measured
3. *Interpolation errors*: Be careful when reading between data points

== Two-Part Analysis Errors

1. *Solving parts independently*: Often one part constrains the other
2. *Missing the relationship*: Understand how the parts connect
3. *Not checking both conditions*: Verify both answers satisfy all requirements

#pagebreak()

= Preparation Recommendations

== Study Plan Components

#info-box[
  *Effective Preparation Strategy*

  1. *Master each question type*: Learn the specific approach for each
  2. *Practice data interpretation*: Work with various chart and table types
  3. *Develop estimation skills*: Reduce calculator dependence
  4. *Build synthesis skills*: Practice combining information from multiple sources
  5. *Time yourself*: Work under realistic time constraints
]

== Skill Building

- *For Data Sufficiency*: Practice determining what information is needed
- *For Table/Graphics*: Work with real-world data visualizations
- *For Multi-Source*: Read business reports with multiple sections
- *For Two-Part*: Practice problems with interrelated components

== Calculator Practice

- Practice using an on-screen calculator
- Learn when to estimate vs. calculate
- Build speed with basic operations

#pagebreak()

= Test Day Strategies

== Before the Section

- Decide section order strategically
- Use your break if available
- Clear your mind from previous sections

== During the Section

1. *Identify question type immediately*
2. *Apply type-specific strategy*
3. *Monitor the clock at checkpoints*
4. *Use the bookmark feature wisely*
5. *Don't get stuck*: Make educated guesses when needed

== Managing Multi-Source Reasoning Sets

- Budget time for the entire set
- If running behind, prioritize easier questions in the set
- Use process of elimination aggressively

#warning-box[
  *Critical Warning*

  As with all GMAT sections, unanswered questions severely penalize your score. Always answer every question, even if guessing.
]

= Next Steps

This overview has introduced you to the Data Insights section's format, question types, and strategies. To build the skills you need:

1. *Study Fundamentals*: Master data interpretation and basic calculations (see fundamentals.typ)
2. *Practice Core Techniques*: Develop proficiency with all question types (see core.typ)
3. *Achieve Excellence*: Learn advanced optimization techniques (see excellence.typ)

#align(center)[
  #v(1em)
  #text(size: 12pt, weight: "bold", fill: uptoten-green)[
    Remember: Data Insights tests your ability to extract meaning from information and make data-driven decisions - skills at the heart of business success.
  ]
]