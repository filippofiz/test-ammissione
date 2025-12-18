#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Graphics Interpretation",
  level: "Lesson Material",
  intro: "Comprehensive guide covering chart reading, graph types, fill-in-the-blank format, and visual data analysis strategies.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Graphics Interpretation (GI)\
*Section:* Data Insights\
*Lesson Sequence:* DI-02 (Second of 5 DI topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Read and interpret various chart types (line, bar, pie, scatter)
2. Complete fill-in-the-blank statements using dropdown options
3. Calculate values from graphical data
4. Identify trends, correlations, and outliers
5. Avoid common visual traps (scale manipulation, truncated axes)
6. Manage time effectively on GI questions

== GMAT Relevance

Graphics Interpretation tests data literacy—the ability to extract meaningful information from visual representations. This skill is essential for business contexts.

#pagebreak()

= Part 1: GI Question Format

== Structure

#info-box[
  *Every GI Question Has:*
  1. A graphic (chart, graph, or visual data display)
  2. One or more fill-in-the-blank statements
  3. Dropdown menus with answer options

  You select the option that correctly completes each statement.
]

#example-box[
  *Sample GI Format:*

  [Bar chart showing quarterly revenue for 4 companies]

  "In Q3, Company B's revenue was approximately ... million dollars."

  Dropdown: [25 | 30 | 35 | 40]

  "The company with the highest Q4 revenue is ...."

  Dropdown: [Company A | Company B | Company C | Company D]
]

== Scoring

#info-box[
  *Important:* Each dropdown selection is scored independently.

  - Getting one dropdown right and one wrong: partial credit
  - You must select an answer for each dropdown to proceed
]

#pagebreak()

= Part 2: Chart Types

== Line Graphs

#info-box[
  *Best for:* Showing trends over time

  *Key features:*
  - X-axis typically shows time
  - Y-axis shows the measured variable
  - Multiple lines allow comparison
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (10, 5),
      x-label: "Quarter",
      y-label: "Revenue (millions)",
      x-tick-step: 1,
      y-tick-step: 10,
      y-min: 0,
      y-max: 50,
      x-min: 0,
      x-max: 5,
      legend: "north-east",
      {
        // Company A - steady growth
        plot.add(
          ((1, 20), (2, 25), (3, 32), (4, 40)),
          mark: "o",
          style: (stroke: rgb("#3498db") + 2pt),
          label: "Company A"
        )
        // Company B - volatile
        plot.add(
          ((1, 30), (2, 22), (3, 35), (4, 28)),
          mark: "square",
          style: (stroke: rgb("#e74c3c") + 2pt),
          label: "Company B"
        )
      }
    )
  })
]

*What to look for:*
- Overall trend (increasing, decreasing, stable)
- Rate of change (steep vs. gradual slopes)
- Inflection points (where trend changes direction)
- Intersections between lines

== Bar Charts

#info-box[
  *Best for:* Comparing discrete categories

  *Types:*
  - Simple bar charts
  - Grouped (clustered) bar charts
  - Stacked bar charts
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Bar chart - Quarterly Sales by Region
    let bar_width = 0.6
    let gap = 0.3
    let colors = (rgb("#3498db"), rgb("#e74c3c"), rgb("#2ecc71"), rgb("#f39c12"))
    let data = (("Q1", 35), ("Q2", 42), ("Q3", 38), ("Q4", 50))
    let max_val = 60

    // Axes
    line((0, 0), (8, 0), stroke: black + 1pt)
    line((0, 0), (0, 5), stroke: black + 1pt)

    // Y-axis labels
    for i in range(0, 7) {
      let y = i * 5 / 6
      let val = i * 10
      content((-0.5, y), text(size: 8pt)[#val])
      line((-0.1, y), (0, y), stroke: gray + 0.5pt)
    }
    content((-1.2, 2.5), text(size: 9pt)[Sales])

    // Bars
    for (i, (label, value)) in data.enumerate() {
      let x = 1 + i * 1.7
      let height = value / 60 * 5
      rect(
        (x, 0), (x + bar_width, height),
        fill: colors.at(i),
        stroke: colors.at(i).darken(20%) + 1pt
      )
      content((x + bar_width/2, -0.4), text(size: 9pt)[#label])
      content((x + bar_width/2, height + 0.3), text(size: 8pt)[#value])
    }
  })
]

*What to look for:*
- Relative heights
- Patterns across categories
- In stacked bars: both individual components AND totals

== Pie Charts

#info-box[
  *Best for:* Showing parts of a whole (percentages)

  *Key features:*
  - All slices must sum to 100%
  - Visual size indicates proportion
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    let center = (4, 2.5)
    let radius = 2
    let colors = (rgb("#3498db"), rgb("#e74c3c"), rgb("#2ecc71"), rgb("#9b59b6"))
    let data = (("Product A", 35), ("Product B", 25), ("Product C", 25), ("Product D", 15))

    // Draw pie slices
    let start_angle = 0deg
    for (i, (label, pct)) in data.enumerate() {
      let angle = pct / 100 * 360deg
      let end_angle = start_angle + angle
      let mid_angle = start_angle + angle / 2

      // Draw arc sector using lines from center
      let steps = 20
      let points = (center,)
      for j in range(steps + 1) {
        let a = start_angle + angle * j / steps
        points.push((center.at(0) + radius * calc.cos(a), center.at(1) + radius * calc.sin(a)))
      }
      points.push(center)

      // Fill the sector
      line(..points, fill: colors.at(i), stroke: white + 1pt, close: true)

      // Label position
      let label_dist = radius + 0.6
      let lx = center.at(0) + label_dist * calc.cos(mid_angle)
      let ly = center.at(1) + label_dist * calc.sin(mid_angle)
      content((lx, ly), text(size: 8pt)[#pct%])

      start_angle = end_angle
    }

    // Legend
    for (i, (label, pct)) in data.enumerate() {
      let ly = 4.5 - i * 0.6
      rect((8, ly - 0.15), (8.4, ly + 0.15), fill: colors.at(i), stroke: none)
      content((9.2, ly), text(size: 8pt)[#label])
    }
  })
]

*What to look for:*
- Largest/smallest segments
- Segments that are approximately equal
- Combined percentages

== Scatter Plots

#info-box[
  *Best for:* Showing relationship between two variables

  *Key features:*
  - Each point represents one data item
  - May include trend line or line of best fit
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 5),
      x-label: "Study Hours",
      y-label: "Test Score",
      x-tick-step: 2,
      y-tick-step: 10,
      y-min: 50,
      y-max: 100,
      x-min: 0,
      x-max: 10,
      {
        // Scatter points showing positive correlation
        plot.add(
          ((1, 55), (2, 62), (2.5, 58), (3, 68), (4, 72), (4.5, 70), (5, 75), (6, 80), (6.5, 78), (7, 85), (8, 88), (9, 92)),
          mark: "o",
          mark-size: 0.15,
          style: (stroke: none),
          mark-style: (fill: rgb("#3498db"), stroke: rgb("#2980b9") + 1pt)
        )
        // Trend line
        plot.add(
          ((0, 52), (10, 95)),
          style: (stroke: (paint: rgb("#e74c3c"), thickness: 1.5pt, dash: "dashed"))
        )
      }
    )
  })
]

*What to look for:*
- Positive/negative/no correlation
- Outliers (points far from the pattern)
- Clustering patterns

#pagebreak()

= Part 3: Advanced Graph Types

== Dual-Axis Graphs

#warning-box[
  *Dual-axis graphs have two different y-axis scales!*

  - Left y-axis measures one variable
  - Right y-axis measures another variable
  - Don't compare values across different axes directly
]

== Stacked Area Charts

#info-box[
  Shows cumulative totals over time.
  - Each colored area represents a category
  - The top line shows the total
  - Individual category sizes are the HEIGHT of each band
]

== 100% Stacked Charts

#info-box[
  Each bar/column totals 100%.
  - Shows proportion, not absolute values
  - Useful for comparing composition across categories
]

#pagebreak()

= Part 4: Reading Graphs Accurately

== Scale Awareness

#warning-box[
  *Watch for Scale Manipulation:*

  1. *Truncated y-axis:* Doesn't start at zero
     - Makes small differences look dramatic
     - Always check where the axis starts!

  2. *Inconsistent intervals:* Spacing not uniform
     - Can distort relationships

  3. *Different scales:* Especially in dual-axis graphs
]

#example-box[
  *Truncated Axis Example:*

  A graph showing sales from 95 to 105 (not 0 to 105) makes a 5% change look like 50%+.

  Always identify the actual range before drawing conclusions.
]

#align(center)[
  #grid(
    columns: 2,
    gutter: 2em,
    [
      #align(center)[*Truncated Axis (Misleading)*]
      #cetz.canvas({
        import cetz.draw: *

        // Truncated axis (95-105)
        line((0, 0), (4, 0), stroke: black + 1pt)
        line((0, 0), (0, 4), stroke: black + 1pt)

        // Y-axis labels (95-105)
        for i in range(0, 5) {
          let y = i * 1
          let val = 95 + i * 2.5
          content((-0.6, y), text(size: 7pt)[#calc.round(val)])
          line((-0.1, y), (0, y), stroke: gray + 0.5pt)
        }

        // Break symbol
        line((-.15, 0.15), (0.15, 0.35), stroke: black + 1pt)
        line((-.15, 0.35), (0.15, 0.55), stroke: black + 1pt)

        // Bars - appear very different
        rect((0.5, 0), (1.3, 1.6), fill: rgb("#3498db"), stroke: none)  // 99
        rect((2.2, 0), (3, 4), fill: rgb("#e74c3c"), stroke: none)      // 105
        content((0.9, -0.4), text(size: 8pt)[A])
        content((2.6, -0.4), text(size: 8pt)[B])
      })
    ],
    [
      #align(center)[*Full Axis (Accurate)*]
      #cetz.canvas({
        import cetz.draw: *

        // Full axis (0-105)
        line((0, 0), (4, 0), stroke: black + 1pt)
        line((0, 0), (0, 4), stroke: black + 1pt)

        // Y-axis labels (0-105)
        for i in range(0, 5) {
          let y = i * 1
          let val = i * 30
          content((-0.5, y), text(size: 7pt)[#val])
          line((-0.1, y), (0, y), stroke: gray + 0.5pt)
        }

        // Bars - appear similar (as they should)
        let scale = 4 / 120
        rect((0.5, 0), (1.3, 99 * scale), fill: rgb("#3498db"), stroke: none)   // 99
        rect((2.2, 0), (3, 105 * scale), fill: rgb("#e74c3c"), stroke: none)    // 105
        content((0.9, -0.4), text(size: 8pt)[A])
        content((2.6, -0.4), text(size: 8pt)[B])
      })
    ]
  )
  #text(size: 9pt, fill: gray)[_Same data (99 vs 105) shown with different axis scales_]
]

== Reading Values

#strategy-box[
  *Accurate Value Reading:*
  1. Locate the data point
  2. Trace horizontally to the y-axis (or vertically to x-axis)
  3. Estimate between grid lines if necessary
  4. Check units (millions? thousands? percent?)
]

== Calculating from Graphs

#tip-box[
  *Common Calculations:*
  - Percent change: $("New" - "Old") / "Old" times 100$
  - Difference: Read both values, subtract
  - Ratio: Read both values, divide
  - Average: Sum values, divide by count
]

#pagebreak()

= Part 5: GI Question Strategies

== Time Management

#info-box[
  *Target Time:* 1.5-2 minutes per GI question

  GI should be one of your faster question types. The data is given; you just need to read and interpret.
]

== Systematic Approach

#strategy-box[
  *For Each GI Question:*

  1. *Scan the graphic first* (10-15 seconds)
     - What type of chart?
     - What are the axes/categories?
     - What are the units?

  2. *Read the statement carefully*
     - What exactly is being asked?
     - What part of the graphic is relevant?

  3. *Find the relevant data*
     - Locate the specific data point(s)
     - Read values accurately

  4. *Select the answer*
     - Match your reading to dropdown options
     - If uncertain, estimate and choose closest
]

== Estimation vs. Calculation

#tip-box[
  *When to Estimate:*
  - Dropdown options are spread apart
  - Exact calculation would take too long
  - Question asks for "approximately"

  *When to Calculate:*
  - Options are close together
  - Question requires exact comparison
  - Simple calculation is quick
]

#pagebreak()

= Part 6: Common GI Traps

== Trap 1: Wrong Units

#warning-box[
  *Always check units!*
  - Is the y-axis in millions, thousands, or ones?
  - Is it percentages or absolute numbers?
  - Are you comparing compatible units?
]

== Trap 2: Misreading Axes

#warning-box[
  - In dual-axis graphs, use the correct axis for each variable
  - Check if the axis is linear or logarithmic
  - Verify axis labels match what you're measuring
]

== Trap 3: Confusing Correlation and Causation

#warning-box[
  Scatter plots showing correlation do NOT prove causation.

  "X and Y are correlated" $eq.not$ "X causes Y"
]

== Trap 4: Stacked Chart Misreading

#warning-box[
  In stacked charts:
  - Individual category values are the HEIGHT of each segment
  - NOT the y-value at the top of the segment
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Stacked bar example
    let bar_width = 1.2

    // Axes
    line((0, 0), (6, 0), stroke: black + 1pt)
    line((0, 0), (0, 5), stroke: black + 1pt)

    // Y-axis labels
    for i in range(0, 6) {
      let y = i * 1
      let val = i * 20
      content((-0.5, y), text(size: 7pt)[#val])
      line((-0.1, y), (0, y), stroke: gray + 0.5pt)
    }

    // Q1 stacked bar
    let q1_a = 2    // Category A = 40
    let q1_b = 1.5  // Category B = 30
    let q1_c = 1    // Category C = 20
    rect((0.8, 0), (2, q1_a), fill: rgb("#3498db"), stroke: white + 0.5pt)
    rect((0.8, q1_a), (2, q1_a + q1_b), fill: rgb("#e74c3c"), stroke: white + 0.5pt)
    rect((0.8, q1_a + q1_b), (2, q1_a + q1_b + q1_c), fill: rgb("#2ecc71"), stroke: white + 0.5pt)
    content((1.4, -0.4), text(size: 8pt)[Q1])

    // Q2 stacked bar
    let q2_a = 2.5  // Category A = 50
    let q2_b = 1    // Category B = 20
    let q2_c = 0.75 // Category C = 15
    rect((3.5, 0), (4.7, q2_a), fill: rgb("#3498db"), stroke: white + 0.5pt)
    rect((3.5, q2_a), (4.7, q2_a + q2_b), fill: rgb("#e74c3c"), stroke: white + 0.5pt)
    rect((3.5, q2_a + q2_b), (4.7, q2_a + q2_b + q2_c), fill: rgb("#2ecc71"), stroke: white + 0.5pt)
    content((4.1, -0.4), text(size: 8pt)[Q2])

    // Annotations
    line((2.2, q1_a), (3, q1_a), stroke: gray + 0.5pt)
    line((2.2, q1_a + q1_b), (3, q1_a + q1_b), stroke: gray + 0.5pt)
    content((3.2, q1_a + q1_b/2), text(size: 7pt)[30], anchor: "west")

    // Legend
    rect((6.5, 4), (7, 4.4), fill: rgb("#2ecc71"), stroke: none)
    content((7.8, 4.2), text(size: 7pt)[Cat C])
    rect((6.5, 3.2), (7, 3.6), fill: rgb("#e74c3c"), stroke: none)
    content((7.8, 3.4), text(size: 7pt)[Cat B])
    rect((6.5, 2.4), (7, 2.8), fill: rgb("#3498db"), stroke: none)
    content((7.8, 2.6), text(size: 7pt)[Cat A])

    // Callout
    content((5, -1), text(size: 8pt)[_Cat B in Q1 = 30 (height), not 70 (top position)_])
  })
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. GI format and dropdown selection
2. Line graphs and bar charts
3. Basic value reading and estimation
4. Unit awareness

*Question Time:* 5-6 GI questions with various chart types

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Advanced chart types (dual-axis, stacked, scatter)
2. Common traps (truncated axes, unit confusion)
3. Calculation from graphics
4. Time-efficient strategies

*Review errors from Training #1, focusing on:*
- Misreading axes/scales
- Unit errors
- Estimation accuracy

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick chart type recognition
- Efficient estimation techniques

*Assessment:* 20 questions, 45 minutes

== Common Student Difficulties

1. Not checking axis scales (especially truncated)
2. Confusing values in stacked charts
3. Mixing up dual-axis readings
4. Spending too long on single questions
5. Unit conversion errors

#warning-box[
  *Tutor Tip:* Practice with various chart types. Many students have little experience with stacked or dual-axis graphs.
]
