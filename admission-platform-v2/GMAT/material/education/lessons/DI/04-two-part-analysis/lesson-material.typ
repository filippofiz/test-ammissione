#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.4.2"
#import "@preview/cetz-plot:0.1.3": plot, chart

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Two-Part Analysis",
  level: "Lesson Material",
  intro: "Comprehensive guide covering two related questions, constraint problems, logical TPA, and efficient solving strategies.",
  logo: "/Logo.png"
)

/*
===============================================================================
LESSON OVERVIEW - FOR TUTOR REFERENCE ONLY
===============================================================================

*Topic:* Two-Part Analysis (TPA)
*Section:* Data Insights
*Lesson Sequence:* DI-04 (Fourth of 5 DI topics)
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

===============================================================================
END OF LESSON OVERVIEW
===============================================================================
*/

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Introduction to Two-Part Analysis

Two-Part Analysis (TPA) questions test your ability to solve problems where two related quantities or elements must be determined simultaneously. Unlike other question types where you select a single answer, TPA requires you to make two selections from a shared list of options, with each selection answering a different aspect of the problem.

This question format mirrors real-world business decision-making, where managers often need to determine multiple variables that are interconnected. For example, a pricing decision might require determining both the optimal price point and the corresponding sales volume, or a resource allocation problem might involve finding the right balance between two competing investments.

The distinctive feature of TPA is that both answers come from the same set of options. This means that understanding the relationship between the two parts is often the key to solving the problem efficiently. In some cases, the two parts are mathematically dependent—finding one automatically determines the other. In other cases, they are conceptually related but require separate analysis.

== Question Structure

Every Two-Part Analysis question follows a consistent format. You receive a problem statement or scenario that establishes the context and constraints. Below the problem statement, a table presents two question columns on the left (one for each part you must answer) and a single column of answer options on the right. Your task is to select one option for each column, and notably, both selections must come from this same shared list of options.

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
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [0],
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [1],
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [2],
      [#sym.circle.filled.big], [#sym.circle.stroked.big], [4],
      [#sym.circle.stroked.big], [#sym.circle.filled.big], [2],
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [5],
    )
  ]

  Select 4 for Product A ($4 times 15 = 60$) and 2 for Product B ($2 times 20 = 40$)\
  Total $= 100$ #sym.checkmark
]

In this example, the constraint that the total must equal \$100 creates a mathematical relationship between the two quantities. Once you determine that 4 units of Product A is correct, you can verify that 2 units of Product B completes the equation.

== Scoring and Partial Credit

Each column selection in a TPA question is scored independently. This means that getting one part correct while missing the other still earns partial credit—you receive credit for each correct selection regardless of your performance on the other part.

This scoring system has strategic implications. You should always make selections for both columns, even if you are uncertain about one of them. An educated guess on an uncertain part has a chance of being correct, while leaving it blank guarantees no credit. Additionally, if you can confidently determine one part, focus on getting that one right while making your best attempt on the other.

== Visual: TPA Answer Format

#align(center)[
  #block(breakable: false)[
    *Two-Part Analysis Answer Grid*
    #v(0.5em)
    #table(
      columns: 4,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      fill: (x, y) => {
        if y == 0 {
          if x == 0 { rgb("#3498db").lighten(60%) }
          else if x == 1 { rgb("#e74c3c").lighten(60%) }
          else { gray.lighten(70%) }
        } else if y == 3 and x == 0 {
          rgb("#3498db").lighten(80%)
        } else if y == 4 and x == 1 {
          rgb("#e74c3c").lighten(80%)
        } else {
          white
        }
      },
      table.header([*Column A*], [*Column B*], [*Options*], []),
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Option 1], [],
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Option 2], [],
      [#text(fill: rgb("#3498db"))[#sym.circle.filled.big]], [#sym.circle.stroked.big], [Option 3], table.cell(fill: white)[#text(size: 0.85em, fill: rgb("#3498db"))[← Selected for A]],
      [#sym.circle.stroked.big], [#text(fill: rgb("#e74c3c"))[#sym.circle.filled.big]], [Option 4], table.cell(fill: white)[#text(size: 0.85em, fill: rgb("#e74c3c"))[← Selected for B]],
      [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Option 5], [],
    )
    #v(0.5em)
    #block(
      fill: rgb("#f1c40f").lighten(70%),
      stroke: rgb("#f39c12") + 1pt,
      radius: 4pt,
      inset: 8pt,
    )[
      *Key:* Select ONE option per column — both from the same list
    ]
  ]
]

#pagebreak()

= Types of TPA Problems

Two-Part Analysis questions appear in three main varieties, each requiring a somewhat different approach. Recognizing which type you are facing helps you choose the most efficient solving strategy.

== Mathematical and Constraint Problems

The most common type of TPA involves mathematical relationships between two unknowns. These problems present equations, inequalities, or other constraints that the two values must satisfy. The answer options are typically numerical values, and your task is to find the pair of values that satisfies all given conditions.

Mathematical TPA problems often involve systems of equations, where you have two equations relating two unknowns. They may also involve a single constraint with multiple valid solutions, where additional conditions narrow down the possibilities. The key insight is that these problems have a definite mathematical structure—there is a correct answer that can be derived through calculation.

#example-box[
  *Given: $x + y = 10$ and $x - y = 4$*

  Find $x$ and $y$ from the options.

  Adding the equations: $2x = 14$, so $x = 7$

  Substituting back: $7 + y = 10$, so $y = 3$
]

== Logical and Argument Problems

The second major type of TPA resembles Critical Reasoning questions but with a twist. These problems present an argument or scenario, and the two columns typically ask you to identify statements that strengthen and weaken the argument, respectively. The answer options are statements or facts rather than numbers.

This format tests your ability to analyze arguments from multiple perspectives simultaneously. You must understand not just what supports the conclusion but also what undermines it. The same set of statement options serves both purposes, so you need to evaluate each option's relationship to the argument carefully.

These logical TPA questions draw on the same skills used in Critical Reasoning: identifying the conclusion, recognizing the evidence, finding the underlying assumption, and understanding how additional information affects the argument's strength. The difference is that you must apply these skills in two directions at once.

== Business Scenario Problems

The third type presents realistic business situations where two related quantities must be determined. These might involve cost and revenue analysis, supply and demand relationships, resource allocation decisions, or optimization problems where you must find the best values for two variables.

Business scenario TPA questions often blend mathematical and logical elements. You might need to perform calculations to test different combinations while also reasoning about which combinations make business sense. These problems tend to be the most complex because they require integrating multiple types of analysis.

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

= Solving Mathematical TPA

Mathematical Two-Part Analysis problems require systematic approaches to find values that satisfy given constraints. The key is to identify the mathematical relationship between the two unknowns and use that relationship to narrow down possibilities efficiently.

== Identifying Relationships

Before attempting any calculations, take a moment to understand the structure of the problem. Look for explicit equations relating the two unknowns, constraints that limit what values are possible (such as requiring positive integers or values within a certain range), and clues about whether the two parts are dependent (knowing one determines the other) or independent (each can be solved separately).

The relationship between the parts determines your solving strategy. If the parts are tightly coupled through an equation, solving for one immediately gives you the other. If they are loosely related through a constraint with multiple valid solutions, you may need to test several combinations against the available options.

== Constraint Analysis

Many TPA problems involve a single constraint equation with multiple possible solutions. In these cases, the answer options themselves become part of the solving process—you test which combinations from the options satisfy the constraint.

#example-box[
  *Problem: A vendor sells apples for \$2 and bananas for \$3. Total revenue was \$50.*

  *Constraint:* $2A + 3B = 50$ (where $A$ and $B$ are positive integers)

  *Test options:*
  - If $A = 4$: $2(4) + 3B = 50 arrow.r 3B = 42 arrow.r B = 14$ #sym.checkmark
  - If $A = 10$: $2(10) + 3B = 50 arrow.r 3B = 30 arrow.r B = 10$ #sym.checkmark

  Multiple solutions are mathematically possible. Check which combinations appear in the answer options.
]

When a constraint equation has multiple valid solutions, look at the answer options to see which solutions are actually available. Sometimes the options themselves eliminate possibilities, leaving only one valid combination.

== Systems of Equations

When a problem provides two equations relating two unknowns, you can solve for exact values using algebraic methods. The two standard approaches are substitution (solve one equation for one variable, then substitute into the other) and elimination (add or subtract equations to eliminate one variable).

Once you have calculated the values, verify that your solution satisfies both original equations before selecting your answers. Careless arithmetic errors can lead you to values that satisfy one equation but not both. After verification, match your calculated values to the answer options.

#pagebreak()

= Solving Logical TPA

Logical Two-Part Analysis questions apply critical reasoning skills in a distinctive format. Instead of selecting a single answer, you must identify both a statement that strengthens an argument and a statement that weakens it, drawing both from the same set of options.

== The Strengthen/Weaken Format

The most common logical TPA format presents an argument and asks you to select one statement that strengthens the conclusion and another that weakens it. This requires analyzing the argument from opposing perspectives simultaneously.

The challenge lies in the shared option pool. Each statement in the options must be evaluated for its potential to support or undermine the argument. Some statements might do neither (these are irrelevant), some might clearly strengthen, some might clearly weaken, and occasionally a statement's effect might depend on interpretation.

== Approach for Logical TPA

The systematic approach to logical TPA begins with understanding the argument's structure. First, identify the conclusion—what claim is the argument trying to establish? Then identify the evidence—what facts or observations support the conclusion? Finally, find the assumption—what unstated premise connects the evidence to the conclusion?

Once you understand the argument's structure, evaluate each option against the assumption. Statements that support or reinforce the assumption strengthen the argument. Statements that challenge or undermine the assumption weaken it. Statements that have no bearing on the assumption are irrelevant.

== Strengthening and Weakening Mechanisms

Understanding how statements affect arguments helps you evaluate options more quickly.

Statements strengthen arguments when they provide additional evidence supporting the conclusion, rule out alternative explanations that could account for the evidence, or directly support the underlying assumption. A strengthening statement makes the conclusion more likely to be true given the evidence.

Statements weaken arguments when they provide counter-evidence that contradicts the conclusion, suggest alternative explanations for the evidence that do not require the conclusion, or directly attack the underlying assumption. A weakening statement makes the conclusion less likely to be true even if the evidence is accepted.

Some statements have no effect on the argument because they address topics unrelated to the conclusion or assumption. Learning to quickly identify and dismiss irrelevant options saves valuable time.

#pagebreak()

= Strategic Solving

Efficiency matters in TPA questions because they require more work than single-answer questions—you must evaluate options against two different criteria. Strategic approaches help you find correct answers without wasting time on unnecessary analysis.

== Deciding Which Part to Solve First

Not all TPA questions are symmetric. Often, one part is more constrained or easier to solve than the other. Identifying and tackling the easier part first can significantly streamline your work.

If one column has fewer valid options based on the constraints, start with that column. Narrowing down possibilities in the more constrained part often eliminates options that you would otherwise need to test for the other part.

If one part can be solved independently while the other depends on the first, solve the independent part first. Your answer to the independent part may directly determine or at least narrow the possibilities for the dependent part.

If neither part is clearly easier or more constrained, simply pick one and begin testing. Paralysis from over-analyzing which to start with wastes more time than just diving in. You can always adjust your approach if you hit a dead end.

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

== Testing Efficiently

A common mistake is to exhaustively test every option against both columns. This brute-force approach wastes time and increases the chance of errors. Instead, work strategically to minimize the number of tests required.

Start by eliminating obviously wrong options. Some options may clearly fail one column's requirements, so there is no need to test them against the other column. Once you have narrowed the field, focus your detailed testing on the remaining candidates.

After identifying a likely answer for one column, check whether it constrains the possibilities for the other. In mathematical TPA, determining one value often immediately gives you the other through the constraint equation. In logical TPA, eliminating the strengthening answer from consideration for the weakening column (and vice versa) reduces your remaining work.

== Verifying Consistency

Before finalizing your selections, verify that both choices work together and satisfy all given conditions. This verification step catches errors that might occur when you solve the two parts separately.

For mathematical problems, plug both values back into the original equations or constraints. Both values must satisfy all conditions simultaneously—it is not enough for each to satisfy some conditions independently.

For logical problems, confirm that your strengthening choice genuinely supports the argument and your weakening choice genuinely undermines it. Re-read the argument with each choice in mind to ensure the effect is what you expect.

#warning-box[
  *Common Verification Errors:*

  Selecting two answers that each satisfy their respective column's requirement individually but are inconsistent with each other, or selecting the same answer for both columns when the question requires different values.
]

#pagebreak()

= Common TPA Patterns

Certain mathematical structures appear repeatedly in TPA questions. Recognizing these patterns allows you to apply established formulas rather than deriving solutions from scratch, saving valuable time.

== Sum and Difference Pattern

When a problem gives you both the sum and the difference of two quantities, you can solve directly for each quantity using these formulas:

$ x = ("sum" + "difference") / 2 $

$ y = ("sum" - "difference") / 2 $

This pattern appears when problems state things like "the total of two numbers is 24 and their difference is 6." Applying the formulas: $x = (24 + 6) / 2 = 15$ and $y = (24 - 6) / 2 = 9$. You can verify: $15 + 9 = 24$ and $15 - 9 = 6$.

== Price Times Quantity Pattern

Many TPA problems involve purchasing multiple items at different prices. The fundamental relationship is:

$ "Total Cost" = "Price"_1 times "Quantity"_1 + "Price"_2 times "Quantity"_2 $

When you know the total cost and the individual prices, test quantity combinations from the answer options to find which pair satisfies the equation. Start with extreme values (high quantity of the cheaper item or high quantity of the expensive item) to bracket the solution, then narrow down.

== Ratio Problems

When two quantities are in a known ratio and their total is given, you can find each quantity directly:

$ "First item" = a / (a+b) times "Total" $

$ "Second item" = b / (a+b) times "Total" $

For example, if items are in ratio 3:5 and the total is 80, the first item equals $(3/8) times 80 = 30$ and the second equals $(5/8) times 80 = 50$.

== Rate Times Time Pattern

Work and distance problems follow the same fundamental relationship:

$ "Distance" = "Rate" times "Time" $ or $ "Work Done" = "Rate" times "Time" $

These problems often involve two entities working at different rates or traveling at different speeds. The TPA format might ask you to find the rate for one entity and the time for another, where a constraint ties the quantities together.

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

= Time Management

Two-Part Analysis questions require more work than single-answer questions, but they should not consume disproportionate amounts of your testing time. Effective time management ensures you complete TPA questions thoroughly while preserving time for other questions.

== Pacing Guidelines

Plan to spend approximately 2 to 2.5 minutes on each TPA question. This allows enough time to understand the problem structure, identify the relationship between parts, test candidates, and verify your selections.

If you find yourself exceeding 3 minutes on a TPA question, consider whether you have missed a simpler approach. Sometimes stepping back and re-reading the problem reveals a pattern or shortcut you overlooked. If no simpler approach emerges, make your best selections and move on—partial credit is better than spending excessive time and risking incomplete sections elsewhere.

== Working Efficiently

Several practices help you work efficiently on TPA questions.

Identify the problem type immediately upon reading the stem. Knowing whether you face a mathematical, logical, or business scenario problem shapes your entire approach. Mathematical problems call for equation-solving techniques; logical problems call for argument analysis; business scenarios may require a blend of both.

Write down relationships and constraints rather than holding them in your head. The cognitive load of tracking multiple conditions while simultaneously testing options leads to errors. A quick note of key equations or the argument's conclusion saves mental energy for analysis.

Eliminate clearly impossible options before detailed testing. If an option obviously fails one column's requirements, remove it from consideration entirely. This reduces the number of combinations you need to evaluate.

Always verify that both parts work together before confirming your selections. A few seconds spent on verification can prevent errors that would cost you points.

/*
===============================================================================
TEACHING NOTES FOR TUTORS
The following section contains detailed guidance for tutors on how to structure
and deliver the Two-Part Analysis lessons. This content is internal and should
not be displayed to students.
===============================================================================

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

*Tutor Tip:* Have students explicitly state the relationship between parts before solving. This prevents inconsistent answers.

===============================================================================
END OF TUTOR NOTES SECTION
===============================================================================
*/
