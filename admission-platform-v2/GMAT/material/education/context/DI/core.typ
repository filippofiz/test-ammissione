#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Data Insights - Core_],
        [#figure(image("../../Logo.png", width: 2cm))]
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
        #text(size: 9pt, fill: rgb("#021d49"))[Page #page-num | UpToTen - Learn Stem More]
      ]
    }
  }
)

#set text(font: "Arial", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em)
#set heading(numbering: "1.")

#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

#let info-box(content) = box(fill: uptoten-blue.lighten(95%), inset: 12pt, radius: 4pt, width: 100%, content)
#let tip-box(content) = box(fill: uptoten-green.lighten(90%), inset: 12pt, radius: 4pt, width: 100%, content)
#let warning-box(content) = box(fill: uptoten-orange.lighten(90%), inset: 12pt, radius: 4pt, width: 100%, content)
#let example-box(content) = box(fill: gray.lighten(95%), inset: 12pt, radius: 4pt, width: 100%, content)

#align(center)[
  #v(2cm)
  #figure(image("../../Logo.png", width: 7cm))
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Data Insights]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Core]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Detailed strategies for each Data Insights question type with specific techniques and approaches.\
    \
    This guide provides comprehensive methods for Data Sufficiency, Multi-Source Reasoning, Table Analysis, Graphics Interpretation, and Two-Part Analysis.
  ]
  #v(2.5cm)
  #text(size: 10pt, fill: gray)[Via G. Frua 21/6, Milano | www.uptoten.it]
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

= Data Sufficiency: In-Depth Strategies

== Common Topic Categories

=== Number Properties

- Even/odd
- Positive/negative
- Divisibility
- Prime numbers
- Remainders

#example-box[
  *Example*: Is integer $n$ odd?

  (1) $n + 3$ is even
  (2) $2n$ is even

  Statement (1): If $n + 3$ is even, $n$ must be odd. *Sufficient*

  Statement (2): $2n$ is always even regardless of $n$. *Not sufficient*

  Answer: (A)
]

=== Algebra

- Equations and inequalities
- Systems of equations
- Quadratics
- Functions

#tip-box[
  *Key Insight for Algebra*

  One equation with one unknown is usually sufficient.
  Two unknowns require two independent equations.
  But watch for special cases (squares, absolute values).
]

#pagebreak()

=== Geometry

- Triangles, circles, rectangles
- Angles and parallel lines
- Area and perimeter
- Coordinate geometry

#info-box[
  *Geometry Sufficiency Tips*

  - Know what properties define shapes uniquely
  - Similar triangles: Need ratio or one side
  - Circles: Need radius or diameter
  - Rectangles: Need two dimensions
]

=== Word Problems

- Rate/work/distance
- Percents
- Sets and Venn diagrams
- Statistics

== Advanced Techniques

=== The "Rephrasing" Strategy

Rephrase the question into a simpler equivalent form before evaluating statements.

#example-box[
  *Example*: Is $x/y > 1$?

  *Rephrase*: Is $x > y$? (assuming $y > 0$)

  Or: Is $x - y > 0$?

  Simpler forms are often easier to evaluate.
]

#pagebreak()

=== Common Sufficiency Patterns

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Pattern*], [*Sufficient?*],
  [One linear equation, one unknown], [Usually yes],
  [$x^2 = k$ (positive k)], [No - two solutions],
  [$|x| = k$], [No - two solutions],
  [Ratio given, actual values asked], [Usually no],
  [Two independent linear equations, two unknowns], [Usually yes],
)

=== "Statement 2" Is Often Sneaky

Don't assume Statement 2 provides less information. Test each statement thoroughly.

== Common Data Sufficiency Traps

=== The "Hidden Information" Trap

Don't forget constraints in the question stem.

#example-box[
  *Example*: If $x$ is a positive integer, what is the value of $x$?

  (1) $x < 3$

  This IS sufficient! If $x$ is a positive integer and $x < 3$, then $x = 1$ or $x = 2$.

  Wait - that's two values. NOT sufficient.

  But if the question said "$x$ is a positive *even* integer," then $x = 2$ only. Sufficient!
]

=== The "Two Equations" Trap

Two equations don't always give two pieces of information if they're dependent.

#pagebreak()

= Multi-Source Reasoning: In-Depth Strategies

== Information Management

=== The First-Pass Survey

Spend 30-60 seconds surveying all sources before answering questions.

#tip-box[
  *What to Note in Each Tab*

  - Type of information (text, table, graph)
  - Main topics covered
  - Key dates, numbers, or categories
  - How it might connect to other tabs
]

=== Creating a Mental Index

As you survey, build a mental map:
- "Tab 1 has company background and policies"
- "Tab 2 has sales data by region"
- "Tab 3 has customer demographics"

== Question-Driven Approach

=== Step 1: Read the Question Carefully

Identify exactly what information is needed.

=== Step 2: Identify Relevant Source(s)

Based on your mental index, go directly to the right tab(s).

=== Step 3: Extract Specific Data

Find the precise information needed - don't get distracted by other data.

=== Step 4: Integrate if Necessary

Combine information from multiple sources if required.

#pagebreak()

== Common MSR Question Types

=== Inference Questions

"Based on the information, which must be true?"

- Requires careful reading
- All parts of the answer must be supported
- Watch for extreme language

=== Calculation Questions

"What is the value of X?"

- Identify where each piece of data lives
- May require combining information from multiple tabs
- Use calculator for complex arithmetic

=== Consistency Questions

"Which of the following is consistent with the information?"

- Check each choice against all relevant sources
- Eliminate contradictions
- The answer must be possible, not necessarily required

#warning-box[
  *Time Management Warning*

  MSR sets are time-intensive. Budget 8-9 minutes for a 3-question set.
  If falling behind, prioritize questions that require fewer tabs.
]

#pagebreak()

= Table Analysis: In-Depth Strategies

== Using the Sort Function

=== When to Sort

- Finding maximum/minimum values
- Calculating median
- Identifying patterns or clusters
- Comparing adjacent values

=== Sorting Strategy

#tip-box[
  *Sort by What Matters*

  For each statement, ask: "What column is most relevant?"

  Sort by that column before evaluating the statement.

  Re-sort for different statements if needed.
]

== Common Table Analysis Tasks

=== Finding the Median

1. Sort by the relevant column
2. Count total entries
3. Find the middle value (or average of two middle values)

=== Calculating Percentages

$ "Percentage" = "Part"/"Total" times 100% $

#example-box[
  *Example*: What percentage of companies had revenue over \$1M?

  1. Sort by revenue (descending)
  2. Count companies over \$1M
  3. Divide by total companies
  4. Multiply by 100
]

#pagebreak()

=== Comparing Ratios

Be careful with ratios - you may need to calculate them.

#example-box[
  *Example*: Which company has the highest profit-to-revenue ratio?

  You cannot determine this just by looking at profit or revenue columns individually.
  You must calculate the ratio for each company.
]

== Binary Answer Format

Table Analysis uses True/False or Yes/No format.

#info-box[
  *Key Principle*

  Each statement is evaluated independently.
  The answer to one statement should NOT influence your answer to another.
]

= Graphics Interpretation: In-Depth Strategies

== Reading Different Graph Types

=== Line Graphs

#tip-box[
  *Key Questions for Line Graphs*

  - What is the trend over time?
  - Where are peaks and valleys?
  - What is the rate of change (slope)?
  - Where do lines intersect?
]

=== Scatter Plots

#tip-box[
  *Key Questions for Scatter Plots*

  - Is there a correlation?
  - Positive or negative relationship?
  - Are there outliers?
  - What is the approximate trend line?
]

#pagebreak()

=== Stacked Bar Charts

Show both individual and cumulative values.

- Height of segment = that category's value
- Total height = sum of all categories

=== Dual-Axis Graphs

Two different scales on left and right y-axes.

#warning-box[
  *Dual-Axis Warning*

  Always check which axis applies to which data series!
  Misreading the axis is a common error.
]

== Completing Dropdown Statements

=== The Process

1. Read the entire statement first
2. Identify what value or relationship is being asked
3. Look at the graph for the specific data
4. Check all dropdown options
5. Select the most accurate answer

=== Common Statement Types

- "The value of X in year Y was closest to \[blank\]"
- "The rate of change was greatest between \[blank\] and \[blank\]"
- "The correlation between X and Y is \[blank\]"

#pagebreak()

= Two-Part Analysis: In-Depth Strategies

== Identifying the Relationship

=== Mathematical Relationships

The two parts are connected by an equation.

#example-box[
  *Example*: A shop sells apples and oranges. Apples cost \$2 and oranges cost \$3. A customer buys some of each and pays \$24 total.

  Columns: Number of apples, Number of oranges

  Relationship: $2a + 3o = 24$

  If $a = 6$, then $o = 4$.
]

=== Logical Relationships

Two conclusions from the same set of premises.

#example-box[
  *Example*: Identify the premise and the conclusion in the argument.

  The two parts are different roles in the same argument structure.
]

=== Constraint Relationships

One part limits the possibilities for the other.

#pagebreak()

== Solving Strategies

=== Strategy 1: Solve One Part First

If one part is more constrained, solve it first and use the result for the second.

=== Strategy 2: Test Combinations

If both parts have few options, test combinations systematically.

=== Strategy 3: Elimination

Eliminate options that violate given conditions.

#tip-box[
  *Verification Step*

  Always verify that BOTH selections satisfy ALL given conditions.
  It's easy to find one correct answer and assume the other must be correct.
]

== Common Two-Part Formats

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Format*], [*Approach*],
  [Algebraic equations], [Solve system of equations],
  [Strengthen/weaken], [Identify how each choice affects argument],
  [Identify components], [Find role each part plays],
  [Constraints], [Apply constraints to narrow options],
)

#pagebreak()

= Integration and Practice

== Applying the Right Strategy

#info-box[
  *Quick Reference by Question Type*

  *Data Sufficiency*: AD/BCE method, test values, don't calculate

  *Multi-Source Reasoning*: Survey first, question-driven navigation

  *Table Analysis*: Sort strategically, independent evaluation

  *Graphics Interpretation*: Read axes carefully, complete statements

  *Two-Part Analysis*: Identify relationship, verify both parts
]

== Common Cross-Type Skills

=== Estimation

Useful for:
- Checking reasonableness of answers
- Speeding up calculations
- Eliminating wrong answers

=== Logical Analysis

Useful for:
- MSR inference questions
- Two-Part logical relationships
- Data Sufficiency yes/no questions

=== Calculator Use

#tip-box[
  *When to Use Calculator*

  - Multi-digit multiplication/division
  - Percentage calculations
  - Verifying estimates

  *When NOT to Use*

  - Simple arithmetic
  - Problems testing conceptual understanding
  - When estimation is sufficient
]

#pagebreak()

= Summary

This Core guide has covered:

*Data Sufficiency*:
- Topic-specific approaches
- Rephrasing strategy
- Common patterns and traps

*Multi-Source Reasoning*:
- Information management
- Question-driven navigation
- Common question types

*Table Analysis*:
- Strategic sorting
- Common calculation tasks
- Binary answer approach

*Graphics Interpretation*:
- Graph-type specific strategies
- Dropdown completion process

*Two-Part Analysis*:
- Identifying relationships
- Solving strategies
- Common formats

Master these Core strategies before moving on to the Excellence guide for advanced optimization techniques.