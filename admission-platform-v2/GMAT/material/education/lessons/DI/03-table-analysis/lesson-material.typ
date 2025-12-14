#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Table Analysis",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering table sorting, True/False statement evaluation, calculations from tables, and analytical strategies.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Table Analysis (TA)\
*Section:* Data Insights\
*Lesson Sequence:* DI-03 (Third of 5 DI topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Navigate and sort tables efficiently
2. Evaluate True/False statements about tabular data
3. Calculate statistics from tables (median, percentages, ratios)
4. Identify patterns and relationships in data
5. Use sorting strategically to answer questions
6. Manage time effectively on TA questions

== GMAT Relevance

Table Analysis questions test your ability to organize and analyze data—a critical business skill. The sortable table format requires strategic thinking about how to extract information efficiently.

#pagebreak()

= Part 1: TA Question Format

== Structure

#info-box[
  *Every TA Question Has:*
  1. A sortable data table (you can sort by any column)
  2. Three True/False statements to evaluate
  3. Each statement is evaluated independently

  *You must determine if each statement is True or False.*
]

== The Sortable Table

#info-box[
  *Key Feature:* You can sort the table by clicking on column headers.

  - Sort ascending or descending
  - Sorting changes the order of rows
  - Use sorting to quickly find maxima, minima, medians
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Original table (left)
    content((-4, 4), text(size: 9pt, weight: "bold")[Original Order])

    // Headers
    rect((-6.5, 3), (-4.5, 3.5), fill: rgb("#3498db").lighten(30%), stroke: 0.5pt)
    rect((-4.5, 3), (-1.5, 3.5), fill: rgb("#3498db").lighten(30%), stroke: 0.5pt)
    content((-5.5, 3.25), text(size: 7pt, weight: "bold")[Company])
    content((-3, 3.25), text(size: 7pt, weight: "bold")[Revenue])

    // Data rows
    let data = (("Alpha", "150"), ("Beta", "220"), ("Gamma", "180"))
    for (i, (name, rev)) in data.enumerate() {
      let y = 2.5 - i * 0.5
      rect((-6.5, y), (-4.5, y + 0.5), fill: white, stroke: 0.5pt)
      rect((-4.5, y), (-1.5, y + 0.5), fill: white, stroke: 0.5pt)
      content((-5.5, y + 0.25), text(size: 7pt)[#name])
      content((-3, y + 0.25), text(size: 7pt)[#rev])
    }

    // Arrow
    line((-0.5, 2), (0.5, 2), stroke: 1.5pt, mark: (end: ">"))
    content((0, 2.5), text(size: 7pt)[Sort by\ Revenue])

    // Sorted table (right)
    content((4, 4), text(size: 9pt, weight: "bold")[Sorted (Descending)])

    // Headers
    rect((1.5, 3), (3.5, 3.5), fill: rgb("#3498db").lighten(30%), stroke: 0.5pt)
    rect((3.5, 3), (6.5, 3.5), fill: rgb("#e74c3c").lighten(50%), stroke: 0.5pt)
    content((2.5, 3.25), text(size: 7pt, weight: "bold")[Company])
    content((5, 3.25), text(size: 7pt, weight: "bold")[Revenue #sym.arrow.b])

    // Sorted data rows
    let sorted_data = (("Beta", "220"), ("Gamma", "180"), ("Alpha", "150"))
    for (i, (name, rev)) in sorted_data.enumerate() {
      let y = 2.5 - i * 0.5
      let fill_color = if i == 0 { rgb("#d5f5e3") } else { white }
      rect((1.5, y), (3.5, y + 0.5), fill: fill_color, stroke: 0.5pt)
      rect((3.5, y), (6.5, y + 0.5), fill: fill_color, stroke: 0.5pt)
      content((2.5, y + 0.25), text(size: 7pt)[#name])
      content((5, y + 0.25), text(size: 7pt)[#rev])
    }

    // Callout for max
    content((7.5, 2.75), text(size: 7pt, fill: rgb("#27ae60"))[Max value\ now at top!])
  })
]

== Scoring

#info-box[
  Each True/False selection is scored independently.
  - Getting 2 of 3 correct: partial credit
  - You must answer all three to proceed
]

#pagebreak()

= Part 2: Common Table Types

== Comparative Tables

Multiple entities compared across several metrics.

#example-box[
  *Sample Comparative Table:*

  #table(
    columns: 4,
    stroke: 0.5pt + gray,
    inset: 6pt,
    [*Company*], [*Revenue (\$M)*], [*Employees*], [*Founded*],
    [Alpha], [150], [2,500], [1985],
    [Beta], [220], [3,100], [1992],
    [Gamma], [180], [2,800], [1988],
  )
]

== Time Series Tables

Same entity measured over multiple time periods.

== Mixed Tables

Combination of categories and time periods or multiple groupings.

#pagebreak()

= Part 3: Strategic Sorting

== When to Sort

#strategy-box[
  *Sort when you need to find:*
  - Maximum or minimum values (sort that column)
  - Median (sort that column, find middle)
  - Rankings or positions
  - Values above or below a threshold
]

== Finding the Median

#info-box[
  *To find the median using sorting:*
  1. Sort by the relevant column
  2. Count total rows (n)
  3. If n is odd: Median is the middle value (row (n+1)/2)
  4. If n is even: Median is average of two middle values
]

#example-box[
  *Table has 7 rows. Find median of "Sales" column.*

  1. Sort by Sales column
  2. Middle row = $(7+1)/2 =$ 4th row
  3. Median = value in Sales column of 4th row
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Title
    content((3, 5), text(size: 9pt, weight: "bold")[Finding the Median (7 rows = odd)])

    // Header
    rect((0, 4), (2, 4.5), fill: rgb("#3498db").lighten(30%), stroke: 0.5pt)
    rect((2, 4), (4, 4.5), fill: rgb("#3498db").lighten(30%), stroke: 0.5pt)
    rect((4, 4), (6, 4.5), fill: rgb("#3498db").lighten(30%), stroke: 0.5pt)
    content((1, 4.25), text(size: 7pt, weight: "bold")[Row])
    content((3, 4.25), text(size: 7pt, weight: "bold")[Item])
    content((5, 4.25), text(size: 7pt, weight: "bold")[Sales])

    // Data rows (already sorted by Sales)
    let sales_data = ((1, "G", "85"), (2, "A", "92"), (3, "E", "105"), (4, "B", "120"), (5, "D", "135"), (6, "C", "148"), (7, "F", "162"))
    for (i, (row, item, sales)) in sales_data.enumerate() {
      let y = 3.5 - i * 0.5
      let fill_color = if i == 3 { rgb("#f1c40f").lighten(50%) } else { white }
      rect((0, y), (2, y + 0.5), fill: fill_color, stroke: 0.5pt)
      rect((2, y), (4, y + 0.5), fill: fill_color, stroke: 0.5pt)
      rect((4, y), (6, y + 0.5), fill: fill_color, stroke: 0.5pt)
      content((1, y + 0.25), text(size: 7pt)[#row])
      content((3, y + 0.25), text(size: 7pt)[#item])
      content((5, y + 0.25), text(size: 7pt)[#sales])
    }

    // Arrow pointing to median row
    line((6.3, 2.25), (6.8, 2.25), stroke: rgb("#f39c12") + 1.5pt, mark: (start: ">"))
    content((8, 2.25), text(size: 8pt, fill: rgb("#e67e22"), weight: "bold")[Median = 120])

    // Explanation
    content((3, -0.5), text(size: 8pt)[4th row is the middle: 3 rows above, 3 rows below])
  })
]

== Sorting for Percentages

#tip-box[
  To find what percentage of items meet a condition:
  1. Sort by the relevant column
  2. Count rows meeting the condition
  3. Divide by total rows
]

#pagebreak()

= Part 4: Calculation Strategies

== Percentages from Tables

#info-box[
  *Common percentage calculations:*
  - $"Part" / "Total" times 100$
  - Items meeting condition / Total items
  - Category sum / Grand total
]

== Ratios from Tables

#info-box[
  *Ratio calculations:*
  - Column A value / Column B value for same row
  - Compare ratios across rows
  - Average ratios (careful: this is NOT sum of ratios / count)
]

== Derived Values

#example-box[
  *Calculate "Revenue per Employee" when table shows Revenue and Employees:*

  For each row: $"Revenue" div "Employees"$

  May need to find max, min, or median of these derived values.
]

#warning-box[
  *Derived values may not be sortable directly!*

  The table shows the raw data; you must calculate derived values mentally or on scratch paper.
]

== The GMAT Calculator

#info-box[
  *On the GMAT, you have access to an on-screen calculator for the Data Insights section.*

  - Basic operations: $+$, $-$, $times$, $div$
  - Memory functions: MC, MR, MS, M+, M-
  - Special functions: $sqrt("")$, $%$, $1\/x$, $plus.minus$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Calculator outline
    rect((0, 0), (5.5, 8), fill: white, stroke: 1.5pt)

    // Title bar
    rect((0.2, 7.2), (4.3, 7.7), fill: white, stroke: 1pt)
    content((2.25, 7.45), text(size: 9pt, weight: "bold")[CALCULATOR])
    rect((4.8, 7.2), (5.3, 7.7), fill: white, stroke: 1pt)
    content((5.05, 7.45), text(size: 10pt, weight: "bold")[X])

    // Display
    rect((0.2, 6.2), (5.3, 7), fill: white, stroke: 1pt)
    content((4.5, 6.6), text(size: 14pt)[123.45])

    // Button dimensions
    let btn-w = 0.9
    let btn-h = 0.7
    let gap = 0.15
    let start-x = 0.3
    let start-y = 5.3

    // Function to draw a button
    let draw-btn(x, y, label, size: 10pt) = {
      rect((x, y), (x + btn-w, y + btn-h), fill: white, stroke: 1pt)
      content((x + btn-w/2, y + btn-h/2), text(size: size, weight: "bold")[#label])
    }

    // Row 1: MC, MR, MS, M+, M-
    let row1 = ("MC", "MR", "MS", "M+", "M-")
    for (i, label) in row1.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, start-y, label, size: 8pt)
    }

    // Row 2: ←, CE, C, ±, √
    let row2-y = start-y - (btn-h + gap)
    let row2 = (sym.arrow.l, "CE", "C", sym.plus.minus, $sqrt("")$)
    for (i, label) in row2.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row2-y, label, size: 9pt)
    }

    // Row 3: 7, 8, 9, /, %
    let row3-y = row2-y - (btn-h + gap)
    let row3 = ("7", "8", "9", "/", "%")
    for (i, label) in row3.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row3-y, label)
    }

    // Row 4: 4, 5, 6, *, 1/x
    let row4-y = row3-y - (btn-h + gap)
    let row4 = ("4", "5", "6", sym.ast, "1/x")
    for (i, label) in row4.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row4-y, label, size: if label == "1/x" { 8pt } else { 10pt })
    }

    // Row 5: 1, 2, 3, -, = (tall button)
    let row5-y = row4-y - (btn-h + gap)
    let row5 = ("1", "2", "3", "-")
    for (i, label) in row5.enumerate() {
      let x = start-x + i * (btn-w + gap)
      draw-btn(x, row5-y, label)
    }

    // Row 6: 0 (wide), ., +
    let row6-y = row5-y - (btn-h + gap)
    // Wide 0 button
    rect((start-x, row6-y), (start-x + 2*btn-w + gap, row6-y + btn-h), fill: white, stroke: 1pt)
    content((start-x + btn-w + gap/2, row6-y + btn-h/2), text(size: 10pt, weight: "bold")[0])
    // . button
    draw-btn(start-x + 2*(btn-w + gap), row6-y, ".")
    // + button
    draw-btn(start-x + 3*(btn-w + gap), row6-y, "+")

    // = button (tall, spanning rows 5 and 6)
    let eq-x = start-x + 4*(btn-w + gap)
    rect((eq-x, row6-y), (eq-x + btn-w, row5-y + btn-h), fill: white, stroke: 1pt)
    content((eq-x + btn-w/2, row6-y + btn-h + gap/2), text(size: 12pt, weight: "bold")[=])
  })
]

#tip-box[
  *Calculator Tips:*
  - Use M+ to accumulate sums without re-entering
  - Use 1/x for quick reciprocal calculations
  - The % button calculates percentages directly
]

#pagebreak()

= Part 5: True/False Statement Types
#v(10pt)
#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    // Type boxes arranged in a single horizontal line
    let types = (
      (0, 1.8, "1. Direct\nLookup", rgb("#3498db")),
      (2.6, 1.8, "2. Calculation\nRequired", rgb("#9b59b6")),
      (5.2, 1.8, "3. Conditional\nCounting", rgb("#e67e22")),
      (7.8, 1.8, "4. Derived\nValues", rgb("#27ae60")),
      (10.4, 1.8, "5. Relation-\nships", rgb("#e74c3c")),
    )

    for (x, y, label, color) in types {
      rect((x - 1.1, y - 0.55), (x + 1.2, y + 0.55), fill: color.lighten(70%), stroke: color + 1.5pt, radius: 5pt)
      content((x + 0.05, y), text(size: 7pt, weight: "bold")[#label])
    }

    // Difficulty indicator arrow below
    line((-0.8, 0.5), (11.2, 0.5), stroke: gray + 1pt, mark: (end: ">"))
    content((-0.8, 0.1), text(size: 8pt, fill: gray.darken(20%))[Easier])
    content((11.2, 0.1), text(size: 8pt, fill: gray.darken(20%))[Harder])
  })
]

== Type 1: Direct Lookup

"Company X has the highest revenue."

*Strategy:* Sort by revenue, check if Company X is at top.

== Type 2: Calculation Required

"The median number of employees is greater than 2,500."

*Strategy:* Sort by employees, find median, compare.

== Type 3: Conditional Counting

"More than half of the companies founded before 1990 have revenue above \$100M."

*Strategy:*
1. Identify companies founded before 1990
2. Count how many have revenue $> dollar 100$M
3. Check if this is more than half

== Type 4: Derived Values

"Company Alpha has the highest revenue per employee."

*Strategy:* Calculate ratio for each company, compare.

== Type 5: Relationships

"As revenue increases, the number of employees tends to increase."

*Strategy:* Look for correlation pattern in sorted data.

#pagebreak()

= Part 6: Time Management

== Pacing Guidelines

#info-box[
  *Target Time:* 2-2.5 minutes per TA question

  TA questions take slightly longer due to three statements, but sorting helps speed up analysis.
]

== Efficiency Tips

#strategy-box[
  1. *Read all three statements first* - identify what data you need
  2. *Sort strategically* - one sort may help multiple statements
  3. *Evaluate easiest statements first* - build momentum
  4. *Don't over-verify* - once you're confident, move on
]

== Common Mistakes

#warning-box[
  *Avoid:*
  - Sorting multiple times unnecessarily
  - Calculating without sorting first (when sorting would help)
  - Confusing "at least" with "more than"
  - Missing rows that meet conditions
]

#pagebreak()

= Part 7: Advanced TA Skills

== Multi-Column Analysis

Some statements require looking at relationships between columns.

#example-box[
  "All companies with revenue above \$200M were founded after 1990."

  Check both conditions for each row meeting the first criterion.
]

== Handling Ties

#info-box[
  When values are tied:
  - "Highest" questions: Any tied value is acceptable
  - "Unique highest": No unique answer if tied
  - Rankings: Tied values share the same rank
]

== Edge Cases

#warning-box[
  *Watch for:*
  - "At least" vs. "more than" vs. "at most"
  - "All" vs. "some" vs. "none"
  - Inclusive vs. exclusive boundaries
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. TA format and True/False structure
2. Sorting mechanics and when to sort
3. Direct lookup statements
4. Finding median using sorting

*Question Time:* 5-6 TA questions with straightforward tables

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Calculation-required statements
2. Derived value problems
3. Conditional counting
4. Multi-column analysis

*Review errors from Training #1, focusing on:*
- Median calculation errors
- Counting mistakes
- Missing sorting opportunities

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Efficient sorting strategies
- Edge case awareness

*Assessment:* 20 questions, 50 minutes

== Common Student Difficulties

1. Not using sorting when it would help
2. Miscounting rows meeting conditions
3. Median calculation errors with even number of rows
4. Confusing derived values with sortable columns
5. "At least" vs. "more than" confusion

#warning-box[
  *Tutor Tip:* Have students practice sorting and finding medians on sample tables before tackling full questions.
]
