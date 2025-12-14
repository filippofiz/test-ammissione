#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Data Insights - Excellence_],
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
#let strategy-box(content) = box(fill: uptoten-green.lighten(95%), inset: 12pt, radius: 4pt, width: 100%, stroke: 1pt + uptoten-green, content)

#align(center)[
  #v(2cm)
  #figure(image("../../Logo.png", width: 7cm))
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Data Insights]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Excellence]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Advanced strategies, time optimization, and expert techniques for maximizing your GMAT Data Insights score.\
    \
    This guide covers strategic efficiency, calculator mastery, pattern recognition, and approaches that separate top scorers.
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

= The Excellence Mindset

Excellence in Data Insights requires strategic efficiency, pattern recognition, and disciplined time management across five different question types.

#info-box[
  *The Core Philosophy*

  "Data Insights tests your ability to make decisions with complex information - the core of business leadership."

  Top scorers approach this section with a clear strategy for each question type and the discipline to move on when stuck.
]

== What Separates Top Scorers

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Average Scorers*], [*Top Scorers*],
  [Calculate every problem], [Determine sufficiency conceptually],
  [Read all data thoroughly], [Navigate directly to relevant info],
  [Use calculator for everything], [Estimate when appropriate],
  [Spend equal time per question], [Allocate time by question type],
  [Get stuck on complex sets], [Set strict time limits and move on],
  [Process each tab sequentially], [Build mental index, then query],
)

#pagebreak()

= Time Optimization Mastery

== Strategic Time Allocation

#info-box[
  *Optimal Time by Question Type*

  - *Data Sufficiency*: 1.5-2 minutes (many can be done in under 1 min)
  - *Graphics Interpretation*: 1.5-2 minutes
  - *Table Analysis*: 2-2.5 minutes
  - *Two-Part Analysis*: 2-2.5 minutes
  - *Multi-Source Reasoning*: 2.5-3 minutes per question

  Key: DS and GI should be quick; save time for MSR.
]

== Pacing System

#table(
  columns: (1fr, 1fr, 1fr),
  align: (center, center, center),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Question*], [*Time Elapsed*], [*Action if Behind*],
  [5], [~11 min], [Speed up DS questions],
  [10], [~22 min], [Identify one question to guess],
  [15], [~34 min], [Accelerate remaining questions],
  [20], [45 min], [Section complete],
)

#warning-box[
  *The MSR Trap*

  Multi-Source Reasoning sets can consume disproportionate time. Set a hard limit of 9 minutes per 3-question set. If you're stuck after 3 minutes on one MSR question, guess and move to the next question in the set.
]

#pagebreak()

= Advanced Data Sufficiency Techniques

== Speed Techniques

=== Pattern Recognition

Recognize common DS patterns instantly:

#strategy-box[
  *Instant Recognition Patterns*

  - *Quadratic = 2 solutions*: $x^2 = 4$ gives $x = 2$ or $x = -2$
  - *Absolute value = 2 solutions*: $|x| = 3$ gives $x = 3$ or $x = -3$
  - *Ratio alone = insufficient*: Knowing $x:y = 3:2$ doesn't give individual values
  - *Single linear equation = sufficient*: $2x + 3 = 7$ gives $x = 2$
]

=== The "30-Second Rule"

#tip-box[
  *Quick Sufficiency Check*

  If you can't determine sufficiency within 30 seconds for a statement, try testing specific values:

  - For inequalities: Test boundary cases
  - For number properties: Test 0, 1, -1, 2, -2
  - For yes/no: Find one yes case and one no case (if possible)
]

== Advanced Sufficiency Insights

=== Statement Independence

Never assume statements conflict. Both can be true simultaneously.

=== Combined Statement Strategy

When combining statements:
1. Use ALL information from both
2. Check if they provide complementary pieces
3. Look for constraints that narrow possibilities

#pagebreak()

= Advanced Multi-Source Reasoning Techniques

== Speed Navigation

=== The Mental Index System

#strategy-box[
  *Building Your Index (60 seconds)*

  As you scan each tab, create mental tags:

  - Tab 1: "Definitions, policies, background"
  - Tab 2: "Numbers by region/year"
  - Tab 3: "Comparisons, trends"

  This index lets you jump directly to the right source for each question.
]

=== Question-First Approach

Read the question BEFORE diving into sources. Know exactly what you need.

== Handling Complex Sets

=== Prioritizing Within Sets

#tip-box[
  *Question Triage*

  In a 3-question MSR set:

  1. Identify the easiest question first (often requires just one tab)
  2. Do that question first - build confidence and understanding
  3. Then tackle the more complex integrative questions
]

=== When to Cut Losses

If a question requires extensive cross-referencing and you're running low on time, make an educated guess and move on. Use elimination to improve odds.

#pagebreak()

= Calculator Mastery

== When to Use the Calculator

#info-box[
  *Strategic Calculator Use*

  *DO use for*:
  - Verifying estimates on close answers
  - Complex percentage calculations
  - Multi-step arithmetic with decimals

  *DON'T use for*:
  - Simple multiplication/division
  - Data Sufficiency (usually)
  - When conceptual understanding is being tested
]

== Calculator Speed Techniques

=== Memory Function

Use the memory function (M+, MR) to store intermediate results.

=== Entry Verification

Always double-check your entry before hitting equals - re-entering takes more time than getting it right the first time.

== Estimation vs. Calculation

#tip-box[
  *When to Estimate*

  - Answer choices are spread apart (25%, 40%, 55%, 70%)
  - The question asks "approximately" or "closest to"
  - Exact calculation would be time-consuming

  *When to Calculate*

  - Answer choices are close together (23%, 25%, 27%)
  - Precision is explicitly required
  - You need to verify a close estimate
]

#pagebreak()

= Advanced Graphics Interpretation

== Speed Reading Graphs

=== The 10-Second Scan

Before looking at statements:
1. Check axis labels and scales (3 sec)
2. Identify data series and legend (3 sec)
3. Note general trends and extremes (4 sec)

=== Avoiding Scale Traps

#warning-box[
  *Common Scale Mistakes*

  - Axis doesn't start at zero (differences look larger)
  - Logarithmic vs. linear scale
  - Different scales for dual-axis graphs
  - Units in thousands vs. millions

  Always verify the scale before interpreting values.
]

== Completing Statements Efficiently

=== Process of Elimination

Even with dropdown menus, eliminate implausible options first:
- Options that clearly contradict the graph
- Extreme values that don't appear in the data
- Values that are off-scale

=== Estimation for Speed

Often you can determine the answer without precise reading:
- If the trend is clearly upward, "decreasing" is wrong
- If all values are between 20-30, "50" is wrong

#pagebreak()

= Advanced Table Analysis

== Strategic Sorting

=== Multi-Sort Strategy

For complex questions, you may need to sort multiple times:
1. Sort by relevant column for first statement
2. Re-sort for second statement
3. Don't assume one sort works for all statements

=== Sorting for Statistics

#tip-box[
  *Quick Statistical Sorts*

  - *Maximum/Minimum*: Sort ascending or descending, look at ends
  - *Median*: Sort, count to middle
  - *Range*: Sort, calculate max - min
  - *Percentiles*: Sort, count to position
]

== Handling Binary Statements

=== Independence Principle

#info-box[
  *Critical Rule*

  Each True/False statement is completely independent.
  - Don't let one answer influence another
  - Don't assume a pattern (not necessarily alternating)
  - Evaluate each statement from scratch
]

=== Confidence Check

If you're uncertain between True and False:
1. Re-read the statement carefully
2. Check if you're using the right column
3. Consider if sorting would help clarify

#pagebreak()

= Advanced Two-Part Analysis

== Identifying Relationship Types

=== Quick Classification

#strategy-box[
  *Relationship Types*

  *Mathematical*: Parts connected by equation
  - One constrains the other
  - Solve more constrained part first

  *Logical*: Different components of same argument
  - Identify roles (premise, conclusion)
  - Check logical connections

  *Independent*: Two separate but related questions
  - Solve each part individually
  - Still verify both satisfy all conditions
]

== Solving Efficiency

=== The Constraint Method

If parts are mathematically related:
1. Write out the relationship
2. Identify which column has more constraints
3. Solve for that column first
4. Use result to determine the other

=== Verification Shortcut

After selecting both answers, take 10 seconds to verify:
- Do both satisfy ALL given conditions?
- Is the relationship between them correct?

#pagebreak()

= Error Prevention

== Common Errors by Question Type

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Type*], [*Top Errors to Avoid*],
  [DS], [Calculating instead of testing sufficiency; forgetting constraints],
  [MSR], [Wrong tab; not integrating multiple sources],
  [TA], [Wrong column; not sorting; calculation errors],
  [GI], [Misreading scale; wrong axis; interpolation errors],
  [TPA], [Not verifying both parts; missing relationship],
)

== The Final Check

Before confirming any answer, ask:

#tip-box[
  *Quick Verification*

  1. Did I answer what was actually asked?
  2. Did I use the correct data/column/tab?
  3. Is my answer consistent with all given information?
  4. For TPA: Do BOTH selections satisfy ALL conditions?
]

#pagebreak()

= Mental Preparation

== Building Endurance

The Data Insights section requires sustained focus across diverse question types.

#info-box[
  *Mental Stamina Strategies*

  - Practice full sections under timed conditions
  - Build comfort with switching between question types
  - Develop routines for resetting between questions
  - Practice the full exam, not just individual sections
]

== Recovery Techniques

=== After a Difficult Question

1. Take a breath
2. Clear your mind of the previous question
3. Identify the new question type
4. Apply the appropriate strategy

=== When Behind on Time

1. Don't panic - it wastes more time
2. Identify which remaining questions you can do quickly
3. Make educated guesses on time-consuming questions
4. Never leave questions unanswered

#pagebreak()

= Practice Protocol

== Quality Practice

#info-box[
  *Practice Philosophy*

  - Practice each question type separately first
  - Then practice mixed sets
  - Always review errors deeply
  - Track time by question type
]

== Error Analysis

For every missed question, record:
- Question type
- Error type (conceptual, careless, timing)
- What you'll do differently

Look for patterns: Are you consistently missing one question type?

== Recommended Practice Schedule

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Activity*], [*Duration*],
  [Timed DI section (20 questions)], [45 minutes],
  [Detailed review of each question], [30-45 minutes],
  [Error log analysis], [10 minutes],
  [Calculator and estimation practice], [10 minutes],
)

#pagebreak()

= Quick Reference Checklists

== Data Sufficiency

#box(fill: uptoten-blue.lighten(95%), inset: 15pt, radius: 4pt, width: 100%)[
  #sym.square Identified question type (value or yes/no)

  #sym.square Noted constraints in question stem

  #sym.square Evaluated Statement 1 alone

  #sym.square Evaluated Statement 2 alone

  #sym.square Combined if necessary
]

== Multi-Source Reasoning

#box(fill: uptoten-green.lighten(90%), inset: 15pt, radius: 4pt, width: 100%)[
  #sym.square Built mental index of all tabs

  #sym.square Read question first

  #sym.square Navigated to relevant source(s)

  #sym.square Integrated information if needed
]

== All Question Types

#box(fill: uptoten-orange.lighten(90%), inset: 15pt, radius: 4pt, width: 100%)[
  #sym.square Identified question type immediately

  #sym.square Applied type-specific strategy

  #sym.square Used calculator appropriately

  #sym.square Verified answer before confirming
]

#pagebreak()

= Summary

Excellence in GMAT Data Insights comes from:

*Strategic Efficiency*:
- Type-specific approaches
- Optimal time allocation
- Strategic calculator use

*Pattern Recognition*:
- Common DS patterns
- Graph reading shortcuts
- Relationship identification

*Information Management*:
- Mental indexing for MSR
- Strategic sorting for TA
- Quick verification routines

*Mental Discipline*:
- Strict time limits per question
- Recovery from difficult questions
- Completion of all questions

#align(center)[
  #v(1em)
  #box(fill: uptoten-green.lighten(90%), inset: 15pt, radius: 4pt)[
    #text(size: 12pt, weight: "bold", fill: uptoten-blue)[
      Remember: Data Insights tests your ability to extract insights from complex information.

      Master the strategies. Manage your time. Execute with precision.
    ]
  ]
]