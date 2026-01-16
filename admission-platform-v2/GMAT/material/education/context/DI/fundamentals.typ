#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Data Insights - Fundamentals_],
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
  #text(size: 16pt, fill: uptoten-green)[Fundamentals]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Essential foundations for GMAT Data Insights: data interpretation, sufficiency concepts, and analytical reasoning.\
    \
    This guide covers the building blocks you'll need for all five Data Insights question types.
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

= Data Sufficiency Foundations

Data Sufficiency is unique to the GMAT and tests your ability to determine what information is needed to answer a question.

== The Core Concept

#info-box[
  *Key Understanding*

  You are NOT asked to solve the problem. You are asked to determine whether you COULD solve it with the given information.

  This changes how you approach the problem entirely.
]

== Understanding the Answer Choices

The five answer choices are *always the same* for every Data Sufficiency question:

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Choice*], [*Meaning*],
  [(A)], [Statement (1) ALONE is sufficient, but statement (2) alone is not],
  [(B)], [Statement (2) ALONE is sufficient, but statement (1) alone is not],
  [(C)], [BOTH statements TOGETHER are sufficient, but NEITHER alone is sufficient],
  [(D)], [EACH statement ALONE is sufficient],
  [(E)], [Statements (1) and (2) TOGETHER are NOT sufficient],
)

== What "Sufficient" Means

A statement is *sufficient* if it provides enough information to answer the question with a single, definite value (for value questions) or a definite yes/no (for yes/no questions).

#example-box[
  *Example*: What is the value of $x$?

  Statement (1): $x^2 = 16$

  This is NOT sufficient because $x$ could be 4 or -4. We don't get a single value.
]

#pagebreak()

== Types of Data Sufficiency Questions

=== Value Questions

Ask for a specific numerical answer.

#example-box[
  *Examples*:
  - "What is the value of $x$?"
  - "How many students are in the class?"
  - "What is the area of the triangle?"

  *Sufficiency test*: Can we determine ONE specific value?
]

=== Yes/No Questions

Ask whether a condition is true.

#example-box[
  *Examples*:
  - "Is $x > 5$?"
  - "Is the integer even?"
  - "Did the company make a profit?"

  *Sufficiency test*: Can we determine the answer is ALWAYS yes or ALWAYS no?
]

#warning-box[
  *Critical Insight for Yes/No Questions*

  A statement is sufficient if it gives a definite answer - even if that answer is "no."

  The statement is insufficient only if sometimes the answer is yes and sometimes no.
]

#pagebreak()

== The Systematic Approach

=== The AD/BCE Method

#info-box[
  *Step 1: Evaluate Statement (1) Alone*

  - If sufficient #sym.arrow Answer is (A) or (D)
  - If not sufficient #sym.arrow Answer is (B), (C), or (E)

  *Step 2: Evaluate Statement (2) Alone*

  - If (1) was sufficient and (2) is sufficient #sym.arrow Answer is (D)
  - If (1) was sufficient and (2) is not sufficient #sym.arrow Answer is (A)
  - If (1) was not sufficient and (2) is sufficient #sym.arrow Answer is (B)
  - If (1) was not sufficient and (2) is not sufficient #sym.arrow Go to Step 3

  *Step 3: Evaluate Both Together*

  - If together they're sufficient #sym.arrow Answer is (C)
  - If together they're still not sufficient #sym.arrow Answer is (E)
]

=== Testing Values

When evaluating statements, test specific values to check sufficiency.

#example-box[
  *Example*: Is $x$ positive?

  Statement (1): $x^2 > 0$

  Test $x = 2$: $4 > 0$ #sym.checkmark, and $x$ is positive

  Test $x = -2$: $4 > 0$ #sym.checkmark, but $x$ is negative

  Since we get both yes and no, Statement (1) is NOT sufficient.
]

#pagebreak()

= Reading Tables

Tables present information in rows and columns. Understanding how to extract information efficiently is crucial.

== Table Components

- *Column headers*: Identify what data each column contains
- *Row labels*: Identify what each row represents
- *Units*: Pay attention to units (thousands, percentages, etc.)
- *Footnotes*: May contain important conditions or explanations

== Key Table Skills

=== Finding Specific Values

Locate the intersection of the relevant row and column.

=== Calculating Totals

Sum values in a row or column. Be aware of whether totals are provided.

=== Finding Percentages

$ "Percentage" = "Part"/"Total" times 100% $

=== Comparing Values

- Which is largest/smallest?
- What is the difference?
- What is the ratio?

#tip-box[
  *Table Analysis Tip*

  Use the sort function! Sorting by different columns can quickly reveal:
  - Maximum and minimum values
  - Patterns and trends
  - Outliers
]

#pagebreak()

= Reading Graphs and Charts

Different graph types present data in different ways. Know what each type shows best.

== Bar Charts

- Compare quantities across categories
- Height/length represents value
- Can be vertical or horizontal

#info-box[
  *Reading Bar Charts*

  - Check the scale on the value axis
  - Note if bars represent absolute values or percentages
  - Watch for grouped or stacked bars
]

== Line Graphs

- Show trends over time or continuous data
- Slope indicates rate of change
- Multiple lines allow comparison

#info-box[
  *Reading Line Graphs*

  - Steeper slope = faster change
  - Identify points of intersection
  - Note turning points (maximum/minimum)
]

== Pie Charts

- Show parts of a whole
- Entire pie = 100%
- Useful for proportional comparisons

== Scatter Plots

- Show relationship between two variables
- Each point represents one data item
- Patterns indicate correlation

#pagebreak()

== Important Graph-Reading Skills

=== Interpolation

Estimating values between data points.

=== Extrapolation

Estimating values beyond the data range (use with caution).

=== Understanding Scale

#warning-box[
  *Scale Awareness*

  - Check if axes start at zero (truncated axes can exaggerate differences)
  - Note logarithmic vs. linear scales
  - Pay attention to units and intervals
]

= Statistical Measures

Understanding basic statistics is essential for Table Analysis and other DI questions.

== Measures of Central Tendency

=== Mean (Average)

$ "Mean" = "Sum of all values"/"Number of values" $

=== Median

The middle value when data is ordered.
- Odd number of values: The middle one
- Even number: Average of two middle values

=== Mode

The most frequently occurring value.

#pagebreak()

== Measures of Dispersion

=== Range

$ "Range" = "Maximum value" - "Minimum value" $

=== Standard Deviation

Measures how spread out values are from the mean.
- Low SD: Values clustered near mean
- High SD: Values spread widely

== Percentiles

The $n$th percentile is the value below which $n$% of the data falls.

#example-box[
  *Example*: If a score is at the 80th percentile, it is higher than 80% of scores.
]

= Rates, Ratios, and Proportions

== Rates

A rate compares two quantities with different units.

#example-box[
  *Examples*:
  - Speed: 60 km/hour
  - Price: \$5/kg
  - Growth: 3%/year
]

== Ratios

A ratio compares two quantities with the same units.

#example-box[
  *Examples*:
  - Boys to girls: 3:2
  - Profit to revenue: 1:5
]

#pagebreak()

== Proportions

An equation stating two ratios are equal.

$ a/b = c/d $

Solve by cross-multiplying: $a d = b c$

== Percentage Calculations

=== Finding a Percentage

$ x% "of" y = x/100 times y $

=== Percentage Change

$ "Percentage change" = ("New" - "Original")/"Original" times 100% $

#warning-box[
  *Common Percentage Errors*

  - Percentage increase from 100 to 150 is 50%, not 150%
  - Percentage decrease from 150 to 100 is 33.3%, not 50%
  - The base matters!
]

#pagebreak()

= Logical Reasoning in Data Insights

== Drawing Valid Conclusions

=== What Must Be True

Given the data, what MUST be true? This requires:
- The conclusion to follow logically from the data
- No exceptions to be possible

=== What Could Be True

Given the data, what COULD be true?
- More lenient than "must be true"
- Needs to be consistent with data, but not required by it

== Common Logical Patterns

=== Correlation vs. Causation

Just because two things occur together doesn't mean one causes the other.

#example-box[
  *Example*: Ice cream sales and drowning both increase in summer.

  This doesn't mean ice cream causes drowning - both are related to hot weather.
]

=== Necessary vs. Sufficient

- *Necessary*: Required but may not be enough
- *Sufficient*: Enough by itself, but may not be required

#pagebreak()

= Working with Multiple Sources

Multi-Source Reasoning requires synthesizing information from different sources.

== Types of Sources

- *Text passages*: Background, context, qualitative information
- *Tables*: Quantitative data, specific values
- *Graphs*: Trends, relationships, visual comparisons

== Integration Skills

=== Cross-Referencing

Find related information across sources.

#example-box[
  *Example*:
  - Tab 1 (text): "Product A launched in 2020"
  - Tab 2 (table): Sales data by year and product

  To find Product A's first-year sales, you need both sources.
]

=== Resolving Apparent Contradictions

Sometimes sources seem to conflict. Look for:
- Different time periods
- Different units or scales
- Different subgroups

#pagebreak()

= Two-Part Analysis Foundations

Two-Part Analysis tests your ability to solve problems with interrelated components.

== Common Formats

=== Mathematical Relationships

Two parts constrained by an equation.

#example-box[
  *Example*: $x + y = 100$

  If $x = 60$, then $y = 40$
]

=== Logical Relationships

Two conclusions from the same argument.

=== Verbal Relationships

Select two items that satisfy related conditions.

== Solving Strategy

#tip-box[
  *Two-Part Approach*

  1. Identify how the two parts relate
  2. If one constrains the other, solve for the more constrained part first
  3. Use that result to find the second part
  4. Verify both parts satisfy all conditions
]

#pagebreak()

= Summary

This Fundamentals guide has covered:

*Data Sufficiency*:
- The concept of sufficiency
- AD/BCE method
- Value vs. Yes/No questions
- Testing values

*Data Interpretation*:
- Reading tables
- Reading various graph types
- Understanding scales and units

*Statistical Measures*:
- Mean, median, mode
- Range and standard deviation
- Percentiles

*Quantitative Reasoning*:
- Rates and ratios
- Proportions
- Percentage calculations

*Logical Reasoning*:
- Valid conclusions
- Correlation vs. causation
- Necessary vs. sufficient conditions

*Multi-Source Skills*:
- Cross-referencing information
- Integrating different data types

Master these fundamentals before moving on to the Core topics (specific question types) and Excellence techniques (advanced optimization).