#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Two-Part Analysis",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering two related questions, constraint problems, logical TPA, and efficient solving strategies.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Two-Part Analysis (TPA)\
*Section:* Data Insights\
*Lesson Sequence:* DI-04 (Fourth of 5 DI topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Understand the TPA format with two columns and shared options
2. Identify relationships between the two parts
3. Solve mathematical TPA problems (equations, constraints)
4. Solve logical TPA problems (strengthen/weaken style)
5. Determine which part to solve first
6. Check answer consistency efficiently

== GMAT Relevance

Two-Part Analysis tests the ability to solve interconnected problems—a skill essential for business analysis where multiple related factors must be considered simultaneously.

#pagebreak()

= Part 1: TPA Question Format

== Structure

#info-box[
  *Every TPA Question Has:*
  1. A problem statement or scenario
  2. A table with two question columns and shared answer options
  3. You select ONE option for each column

  Both selections must come from the SAME set of answer options.
]

#example-box[
  *Sample TPA Format:*

  A store sells two products. Product A costs \$15 and Product B costs \$20. A customer spent exactly \$100.

  #align(center)[
    #table(
      columns: 3,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      fill: (col, row) => if row == 0 { rgb("#3498db").lighten(70%) } else { white },
      [*Product A Qty*], [*Product B Qty*], [*Options*],
      [#sym.circle.stroked], [#sym.circle.stroked], [0],
      [#sym.circle.stroked], [#sym.circle.stroked], [1],
      [#sym.circle.stroked], [#sym.circle.stroked], [2],
      [#sym.circle.filled], [#sym.circle.stroked], [4],
      [#sym.circle.stroked], [#sym.circle.filled], [2],
      [#sym.circle.stroked], [#sym.circle.stroked], [5],
    )
  ]

  Select 4 for Product A ($4 times dollar 15 = dollar 60$) and 2 for Product B ($2 times dollar 20 = dollar 40$)\
  Total $= dollar 100$ #sym.checkmark
]

== Scoring

#info-box[
  Each column selection is scored independently.
  - Getting one correct but not the other: partial credit
  - Both must be from the same option list
]

== Visual: TPA Answer Format

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Title
    content((3.5, 7), text(size: 10pt, weight: "bold")[Two-Part Analysis Answer Grid])

    // Column headers with better spacing
    let header_y = 6.2
    let row_height = 0.7
    let col_a_width = 2.2
    let col_b_width = 2.2
    let opt_width = 2.6

    rect((0, header_y), (col_a_width, header_y + 0.5), fill: rgb("#3498db").lighten(40%), stroke: 0.5pt)
    rect((col_a_width, header_y), (col_a_width + col_b_width, header_y + 0.5), fill: rgb("#e74c3c").lighten(40%), stroke: 0.5pt)
    rect((col_a_width + col_b_width, header_y), (col_a_width + col_b_width + opt_width, header_y + 0.5), fill: gray.lighten(50%), stroke: 0.5pt)
    content((col_a_width / 2, header_y + 0.25), text(size: 8pt, weight: "bold")[Column A])
    content((col_a_width + col_b_width / 2, header_y + 0.25), text(size: 8pt, weight: "bold")[Column B])
    content((col_a_width + col_b_width + opt_width / 2, header_y + 0.25), text(size: 8pt, weight: "bold")[Options])

    // Option rows with better spacing
    let options = ("Option 1", "Option 2", "Option 3", "Option 4", "Option 5")
    for (i, opt) in options.enumerate() {
      let y = header_y - 0.35 - i * row_height
      let row_fill = if calc.rem(i, 2) == 0 { white } else { gray.lighten(90%) }

      // Column A cell
      rect((0, y - row_height/2 + 0.02), (col_a_width, y + row_height/2 - 0.02), fill: row_fill, stroke: 0.5pt)
      circle((col_a_width / 2, y), radius: 0.12, stroke: gray + 1pt, fill: if i == 2 { rgb("#3498db") } else { white })

      // Column B cell
      rect((col_a_width, y - row_height/2 + 0.02), (col_a_width + col_b_width, y + row_height/2 - 0.02), fill: row_fill, stroke: 0.5pt)
      circle((col_a_width + col_b_width / 2, y), radius: 0.12, stroke: gray + 1pt, fill: if i == 3 { rgb("#e74c3c") } else { white })

      // Option text cell
      rect((col_a_width + col_b_width, y - row_height/2 + 0.02), (col_a_width + col_b_width + opt_width, y + row_height/2 - 0.02), fill: row_fill, stroke: 0.5pt)
      content((col_a_width + col_b_width + opt_width / 2, y), text(size: 8pt)[#opt])
    }

    // Annotation labels - positioned to the right of the table (no crossing arrows)
    let selected_a_y = header_y - 0.35 - 2 * row_height
    let selected_b_y = header_y - 0.35 - 3 * row_height
    let label_x = col_a_width + col_b_width + opt_width + 0.3

    // Label for Column A selection (Option 3) - simple horizontal line from table edge
    line((col_a_width + col_b_width + opt_width, selected_a_y), (label_x + 0.5, selected_a_y), stroke: rgb("#3498db") + 1.5pt)
    content((label_x + 1.3, selected_a_y), text(size: 7pt, fill: rgb("#3498db"))[Selected for A])

    // Label for Column B selection (Option 4) - simple horizontal line from table edge
    line((col_a_width + col_b_width + opt_width, selected_b_y), (label_x + 0.5, selected_b_y), stroke: rgb("#e74c3c") + 1.5pt)
    content((label_x + 1.3, selected_b_y), text(size: 7pt, fill: rgb("#e74c3c"))[Selected for B])

    // Key insight box at bottom
    let bottom_y = header_y - 0.35 - 5 * row_height - 0.8
    rect((-0.5, bottom_y), (col_a_width + col_b_width + opt_width + 0.5, bottom_y + 0.7), fill: rgb("#f1c40f").lighten(70%), stroke: rgb("#f39c12") + 1pt, radius: 3pt)
    content(((col_a_width + col_b_width + opt_width) / 2, bottom_y + 0.35), text(size: 8pt)[*Key:* Select ONE option per column — both from the same list])
  })
]

#pagebreak()

= Part 2: Types of TPA Problems

== Type 1: Mathematical/Constraint Problems

#info-box[
  *Characteristics:*
  - Two unknowns related by equations or constraints
  - Answer options are numerical values
  - Solutions must satisfy given conditions
]

#example-box[
  *Given: $x + y = 10$ and $x - y = 4$*

  Find $x$ and $y$ from the options.

  Solving: $x = 7$, $y = 3$
]

== Type 2: Logical/Argument Problems

#info-box[
  *Characteristics:*
  - Argument or scenario described
  - One column: "Strengthens the argument"
  - Other column: "Weakens the argument"
  - Options are statements or facts

  These are like Critical Reasoning questions with a twist.
]

== Type 3: Business Scenario Problems

#info-box[
  *Characteristics:*
  - Real-world business scenario
  - Find two related quantities (cost and revenue, supply and demand)
  - May involve optimization
]

== Visual: TPA Problem Types Overview

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Layout parameters
    let box_width = 3.2
    let box_height = 2
    let gap = 0.5
    let start_x = 0

    // Title
    content((start_x + 1.5 * box_width + gap, 5.5), text(size: 11pt, weight: "bold")[Three Types of TPA Problems])

    // Type 1: Mathematical
    let x1 = start_x
    rect((x1, 3), (x1 + box_width, 3 + box_height), fill: rgb("#3498db").lighten(70%), stroke: rgb("#3498db") + 1.5pt, radius: 5pt)
    content((x1 + box_width/2, 4.6), text(size: 10pt, weight: "bold", fill: rgb("#2980b9"))[Mathematical])
    content((x1 + box_width/2, 4.1), text(size: 8pt)[Equations])
    content((x1 + box_width/2, 3.7), text(size: 8pt)[Constraints])
    content((x1 + box_width/2, 3.25), text(size: 7pt, fill: gray.darken(20%))[Numbers as options])

    // Type 2: Logical
    let x2 = x1 + box_width + gap
    rect((x2, 3), (x2 + box_width, 3 + box_height), fill: rgb("#9b59b6").lighten(70%), stroke: rgb("#9b59b6") + 1.5pt, radius: 5pt)
    content((x2 + box_width/2, 4.6), text(size: 10pt, weight: "bold", fill: rgb("#8e44ad"))[Logical])
    content((x2 + box_width/2, 4.1), text(size: 8pt)[Strengthen/Weaken])
    content((x2 + box_width/2, 3.7), text(size: 8pt)[Arguments])
    content((x2 + box_width/2, 3.25), text(size: 7pt, fill: gray.darken(20%))[Statements as options])

    // Type 3: Business
    let x3 = x2 + box_width + gap
    rect((x3, 3), (x3 + box_width, 3 + box_height), fill: rgb("#27ae60").lighten(70%), stroke: rgb("#27ae60") + 1.5pt, radius: 5pt)
    content((x3 + box_width/2, 4.6), text(size: 10pt, weight: "bold", fill: rgb("#1e8449"))[Business])
    content((x3 + box_width/2, 4.1), text(size: 8pt)[Real scenarios])
    content((x3 + box_width/2, 3.7), text(size: 8pt)[Cost/Revenue])
    content((x3 + box_width/2, 3.25), text(size: 7pt, fill: gray.darken(20%))[Mixed options])

    // Frequency section
    let freq_y = 2.2
    content((start_x + 1.5 * box_width + gap, freq_y), text(size: 9pt, weight: "bold")[Relative Frequency on GMAT])

    // Frequency bars - aligned under each type
    let bar_y = 1.2
    let bar_height = 0.5
    rect((x1 + 0.3, bar_y), (x1 + box_width - 0.3, bar_y + bar_height), fill: rgb("#3498db"), stroke: none, radius: 2pt)
    content((x1 + box_width/2, bar_y + bar_height/2), text(size: 8pt, fill: white, weight: "bold")[Most Common])

    rect((x2 + 0.5, bar_y), (x2 + box_width - 0.5, bar_y + bar_height), fill: rgb("#9b59b6"), stroke: none, radius: 2pt)
    content((x2 + box_width/2, bar_y + bar_height/2), text(size: 8pt, fill: white, weight: "bold")[Common])

    rect((x3 + 0.7, bar_y), (x3 + box_width - 0.7, bar_y + bar_height), fill: rgb("#27ae60"), stroke: none, radius: 2pt)
    content((x3 + box_width/2, bar_y + bar_height/2), text(size: 7pt, fill: white, weight: "bold")[Less Common])
  })
]

#pagebreak()

= Part 3: Solving Mathematical TPA

== Identifying Relationships

#strategy-box[
  *Look for:*
  - Equations relating the two unknowns
  - Constraints limiting possible values
  - Whether the two parts are independent or dependent
]

== Constraint Analysis

#example-box[
  *Problem: A vendor sells apples for \$2 and bananas for \$3. Total revenue was \$50.*

  *Constraint:* $2A + 3B = 50$ (where $A$ and $B$ are positive integers)

  *Test options:*
  - If $A = 4$: $2(4) + 3B = 50 arrow.r 3B = 42 arrow.r B = 14$ #sym.checkmark
  - If $A = 10$: $2(10) + 3B = 50 arrow.r 3B = 30 arrow.r B = 10$ #sym.checkmark

  Multiple solutions possible! Need additional constraint or check options.
]

== Systems of Equations

#tip-box[
  *For two equations with two unknowns:*
  1. Use substitution or elimination
  2. Verify solution satisfies both equations
  3. Match to answer options
]

#pagebreak()

= Part 4: Solving Logical TPA

== The Strengthen/Weaken Format

#info-box[
  *Common logical TPA format:*

  "Select the statement that strengthens the conclusion and the statement that weakens the conclusion."

  Apply Critical Reasoning skills to both columns.
]

== Approach for Logical TPA

#strategy-box[
  1. Identify the conclusion in the argument
  2. Identify the evidence supporting it
  3. Find the assumption (gap between evidence and conclusion)
  4. Look for options that:
     - Support the assumption (strengthen)
     - Attack the assumption (weaken)
]

== Common Logical Relationships

#info-box[
  *Strengthening:*
  - Provides additional evidence
  - Rules out alternative explanations
  - Supports the assumption

  *Weakening:*
  - Provides counter-evidence
  - Suggests alternative explanations
  - Attacks the assumption
]

#pagebreak()

= Part 5: Strategic Solving

== Which Part First?

#strategy-box[
  *Solve the more constrained part first:*

  - If one column has fewer valid options, start there
  - If one part is independent, solve it first
  - If neither is clearly easier, just pick one and test
]

== TPA Solving Flowchart

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Colors
    let start_color = rgb("#3498db")
    let decision_color = rgb("#f39c12")
    let action_color = rgb("#27ae60")
    let end_color = rgb("#9b59b6")

    // Layout parameters
    let center_x = 5

    // Start node (rounded rectangle)
    rect((center_x - 1.8, 8), (center_x + 1.8, 8.6), fill: start_color.lighten(60%), stroke: start_color + 1.5pt, radius: 10pt)
    content((center_x, 8.3), text(size: 9pt, weight: "bold")[Read Problem])

    // Arrow down to decision
    line((center_x, 8), (center_x, 7.5), stroke: 1.2pt, mark: (end: ">"))

    // Decision 1: Math or Logical? - Diamond
    let d1_y = 6.5
    let d1_h = 0.9
    let d1_w = 1.4
    line((center_x, d1_y + d1_h), (center_x + d1_w, d1_y), (center_x, d1_y - d1_h), (center_x - d1_w, d1_y), close: true, fill: decision_color.lighten(70%), stroke: decision_color + 1.5pt)
    content((center_x, d1_y + 0.15), text(size: 8pt, weight: "bold")[Math or])
    content((center_x, d1_y - 0.2), text(size: 8pt, weight: "bold")[Logical?])

    // Left branch: Math
    let math_x = 1.8
    let math_box_center = math_x + 0.5
    // Horizontal line from diamond to turning point
    line((center_x - d1_w, d1_y), (math_box_center, d1_y), stroke: 1.2pt)
    // Label above the horizontal line
    content(((center_x - d1_w + math_box_center) / 2, d1_y + 0.25), text(size: 8pt, fill: start_color)[Math])
    // Vertical line down to box
    line((math_box_center, d1_y), (math_box_center, 5.5), stroke: 1.2pt, mark: (end: ">"))

    // Math action box
    rect((math_x - 0.8, 4.6), (math_x + 1.8, 5.5), fill: action_color.lighten(70%), stroke: action_color + 1.5pt, radius: 4pt)
    content((math_box_center, 5.2), text(size: 8pt)[Set up equations])
    content((math_box_center, 4.85), text(size: 8pt)[Find relationship])

    // Right branch: Logical
    let logic_x = 8.2
    let logic_box_center = logic_x - 0.5
    // Horizontal line from diamond to turning point
    line((center_x + d1_w, d1_y), (logic_box_center, d1_y), stroke: 1.2pt)
    // Label above the horizontal line
    content(((center_x + d1_w + logic_box_center) / 2, d1_y + 0.25), text(size: 8pt, fill: end_color)[Logical])
    // Vertical line down to box
    line((logic_box_center, d1_y), (logic_box_center, 5.5), stroke: 1.2pt, mark: (end: ">"))

    // Logical action box
    rect((logic_x - 1.8, 4.6), (logic_x + 0.8, 5.5), fill: action_color.lighten(70%), stroke: action_color + 1.5pt, radius: 4pt)
    content((logic_box_center, 5.2), text(size: 8pt)[ID conclusion])
    content((logic_box_center, 4.85), text(size: 8pt)[Find assumption])

    // Arrows down from action boxes and converging
    line((math_box_center, 4.6), (math_box_center, 4.1), stroke: 1.2pt)
    line((logic_box_center, 4.6), (logic_box_center, 4.1), stroke: 1.2pt)

    // Converging horizontal lines
    line((math_box_center, 4.1), (center_x, 4.1), stroke: 1.2pt)
    line((logic_box_center, 4.1), (center_x, 4.1), stroke: 1.2pt)
    line((center_x, 4.1), (center_x, 3.6), stroke: 1.2pt, mark: (end: ">"))

    // Decision 2: Which column? - Diamond (larger for text)
    let d2_y = 2.5
    let d2_h = 1.0
    let d2_w = 1.6
    line((center_x, d2_y + d2_h), (center_x + d2_w, d2_y), (center_x, d2_y - d2_h), (center_x - d2_w, d2_y), close: true, fill: decision_color.lighten(70%), stroke: decision_color + 1.5pt)
    content((center_x, d2_y + 0.15), text(size: 7pt, weight: "bold")[Which column])
    content((center_x, d2_y - 0.2), text(size: 7pt, weight: "bold")[more constrained?])

    // Arrow down from decision 2
    line((center_x, d2_y - d2_h), (center_x, 1.1), stroke: 1.2pt, mark: (end: ">"))

    // Final action box (rounded)
    rect((center_x - 2.2, 0.2), (center_x + 2.2, 1.1), fill: end_color.lighten(60%), stroke: end_color + 1.5pt, radius: 6pt)
    content((center_x, 0.8), text(size: 8pt, weight: "bold")[Solve that column first])
    content((center_x, 0.5), text(size: 7pt)[Then verify both parts together])
  })
]

== Testing Efficiency

#tip-box[
  *Smart Testing:*
  1. Don't test all options for both columns
  2. Narrow down one column first
  3. Then test remaining candidates in the other
]

== Checking Consistency

#warning-box[
  *Before finalizing:*
  - Verify both selections satisfy ALL given conditions
  - For math problems: plug values back into equations
  - For logical problems: ensure one truly strengthens and one truly weakens
]

#pagebreak()

= Part 6: Common TPA Patterns

== Pattern 1: Sum and Difference

If given $x + y$ and $x - y$, you can find $x$ and $y$:\
\
$x = display(("sum" + "difference") / 2)$\
\
$y = display(("sum" - "difference") / 2)$

== Pattern 2: Price $times$ Quantity

#info-box[
  $"Total" = "Price"_1 times "Quantity"_1 + "Price"_2 times "Quantity"_2$

  If you know the total and prices, test quantity combinations from options.
]

== Pattern 3: Ratio Problems

If items are in ratio $a:b$ and total is known:
- First item $= display(a / (a+b)) times "Total"$
- Second item $= display(b / (a+b)) times "Total"$

== Pattern 4: Rate $times$ Time Problems

$"Distance" = "Rate" times "Time"$ or $"Work" = "Rate" times "Time"$

== Visual: Common Patterns at a Glance

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Layout parameters
    let box_width = 5
    let box_height = 1.4
    let gap_x = 0.6
    let gap_y = 0.5
    let start_x = 0

    // Title
    content((start_x + box_width + gap_x/2, 6), text(size: 11pt, weight: "bold")[Quick Reference: TPA Pattern Formulas])

    // Row 1
    let row1_y = 4.2

    // Pattern 1: Sum and Difference
    rect((start_x, row1_y), (start_x + box_width, row1_y + box_height), fill: rgb("#3498db").lighten(80%), stroke: rgb("#3498db") + 1.5pt, radius: 4pt)
    content((start_x + box_width/2, row1_y + box_height - 0.25), text(size: 9pt, weight: "bold", fill: rgb("#2980b9"))[Sum & Difference])
    content((start_x + box_width/2, row1_y + 0.45), text(size: 9pt)[$x = display((S + D) / 2)$, #h(0.3em) $y = display((S - D) / 2)$])

    // Pattern 2: Price × Quantity
    let x2 = start_x + box_width + gap_x
    rect((x2, row1_y), (x2 + box_width, row1_y + box_height), fill: rgb("#27ae60").lighten(80%), stroke: rgb("#27ae60") + 1.5pt, radius: 4pt)
    content((x2 + box_width/2, row1_y + box_height - 0.35), text(size: 9pt, weight: "bold", fill: rgb("#1e8449"))[Price $times$ Quantity])
    content((x2 + box_width/2, row1_y + 0.45), text(size: 9pt)[$P_1 Q_1 + P_2 Q_2 = "Total"$])

    // Row 2
    let row2_y = row1_y - box_height - gap_y

    // Pattern 3: Ratio
    rect((start_x, row2_y), (start_x + box_width, row2_y + box_height), fill: rgb("#9b59b6").lighten(80%), stroke: rgb("#9b59b6") + 1.5pt, radius: 4pt)
    content((start_x + box_width/2, row2_y + box_height - 0.25), text(size: 9pt, weight: "bold", fill: rgb("#8e44ad"))[Ratio $a:b$])
    content((start_x + box_width/2, row2_y + 0.45), text(size: 9pt)[$"Part" = display(a / (a+b)) times "Total"$])

    // Pattern 4: Rate × Time
    rect((x2, row2_y), (x2 + box_width, row2_y + box_height), fill: rgb("#e74c3c").lighten(80%), stroke: rgb("#e74c3c") + 1.5pt, radius: 4pt)
    content((x2 + box_width/2, row2_y + box_height - 0.35), text(size: 9pt, weight: "bold", fill: rgb("#c0392b"))[Rate $times$ Time])
    content((x2 + box_width/2, row2_y + 0.45), text(size: 9pt)[$D = R times T$, #h(0.5em) $W = R times T$])

    // Tip box at bottom
    let tip_y = row2_y - gap_y - 0.9
    rect((start_x + 0.5, tip_y), (x2 + box_width - 0.5, tip_y + 0.9), fill: rgb("#f1c40f").lighten(70%), stroke: rgb("#f39c12") + 1.5pt, radius: 4pt)
    content((start_x + box_width + gap_x/2, tip_y + 0.6), text(size: 9pt, weight: "bold")[Tip: Memorize these patterns to save time!])
    content((start_x + box_width + gap_x/2, tip_y + 0.25), text(size: 8pt)[Recognize the pattern #sym.arrow Apply the formula #sym.arrow Test options])
  })
]

#pagebreak()

= Part 7: Time Management

== Pacing Guidelines

#info-box[
  *Target Time:* 2-2.5 minutes per TPA question

  TPA requires careful analysis but shouldn't take too long if you identify the relationship quickly.
]

== Efficiency Tips

#strategy-box[
  1. *Identify problem type immediately* - math or logical?
  2. *Write down relationships/constraints* - don't solve in your head
  3. *Eliminate impossible options* - reduce testing
  4. *Check both parts together* - they must be consistent
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. TPA format and two-column structure
2. Simple mathematical TPA (two equations)
3. Basic constraint problems
4. Testing approach

*Question Time:* 5-6 mathematical TPA questions

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Logical/argument TPA
2. Complex business scenarios
3. Efficiency strategies
4. Common patterns and shortcuts

*Review errors from Training #1, focusing on:*
- Not checking consistency between parts
- Inefficient testing strategies
- Misidentifying logical relationships

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick pattern recognition
- Time management strategies

*Assessment:* 20 questions, 50 minutes

== Common Student Difficulties

1. Not recognizing the relationship between parts
2. Testing too many options inefficiently
3. Choosing inconsistent answers
4. Struggling with logical TPA vs. math TPA
5. Spending too long on complex calculations

#warning-box[
  *Tutor Tip:* Have students explicitly state the relationship between parts before solving. This prevents inconsistent answers.
]
