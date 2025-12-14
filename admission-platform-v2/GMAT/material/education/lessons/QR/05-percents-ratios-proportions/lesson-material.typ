#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Percents, Ratios & Proportions",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering percentages, percent change, ratios, proportions, and unit conversions.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Percents, Ratios & Proportions\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-05 (Sixth of 5 QR topics - Final QR topic)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Convert between fractions, decimals, and percentages
2. Calculate percent of a number and find the whole from a percentage
3. Compute percent increase and decrease correctly
4. Set up and solve proportion problems
5. Work with ratios and scale factors
6. Perform unit conversions efficiently

== GMAT Relevance

Percents, ratios, and proportions appear in approximately 15-20% of QR questions. These concepts are fundamental and also appear heavily in Data Insights questions.

#pagebreak()

= Part 1: Percentages - Fundamentals

== Percent Basics

#info-box[
  *Percent means "per hundred":* $25% = display(25/100) = 0.25$

  *Key Conversions:*
  - Fraction to decimal: Divide numerator by denominator
  - Decimal to percent: Multiply by 100, add %
  - Percent to decimal: Divide by 100
  - Fraction to percent: Convert to decimal, then to percent
]

== Common Percent Equivalents

#uptoten-table(
  columns: 3,
  header: ("Fraction", "Decimal", "Percent"),
  "1/2", "0.5", "50%",
  "1/3", "0.333...", "33.33%",
  "2/3", "0.666...", "66.67%",
  "1/4", "0.25", "25%",
  "3/4", "0.75", "75%",
  "1/5", "0.2", "20%",
  "1/8", "0.125", "12.5%",
  "1/10", "0.1", "10%",
)

#tip-box[
  *Memorize These:* Knowing common equivalents saves significant time on the GMAT.
]

== Finding a Percent of a Number

#info-box[
  *Formula:* $"Part" = "Percent" times "Whole"$

  Convert percent to decimal first, then multiply.
]

#example-box[
  *What is 35% of 80?*

  $35% times 80 = 0.35 times 80 = 28$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Full bar (100%)
    let bar_width = 10
    let bar_height = 0.8

    // Draw full bar outline
    rect((0, 0), (bar_width, bar_height), stroke: black, fill: rgb("#e8e8e8"))

    // Draw 35% filled portion
    rect((0, 0), (bar_width * 0.35, bar_height), stroke: black, fill: rgb("#4a90d9"))

    // Labels
    content((bar_width * 0.35 / 2, bar_height / 2), text(weight: "bold", fill: white)[35%])
    content((bar_width * 0.35 + (bar_width * 0.65) / 2, bar_height / 2), text(fill: gray.darken(30%))[65%])

    // Dimension labels
    content((0, -0.4), text(size: 9pt)[0])
    content((bar_width * 0.35, -0.4), text(size: 9pt)[28])
    content((bar_width, -0.4), text(size: 9pt)[80])

    // Title
    content((bar_width / 2, bar_height + 0.5), text(weight: "bold")[35% of 80 = 28])
  })
]

#tip-box[
  *Visual Tip:* Think of percentages as portions of a whole bar. This helps when comparing or estimating percent values.
]

== Finding the Whole from a Part

#info-box[
  *Formula:* $"Whole" = display("Part" / "Percent")$

  "15 is what percent of 60?" → $display(15/60) = 0.25 = 25%$

  "15 is 25% of what number?" → $display(15/0.25) = 60$
]

#pagebreak()

= Part 2: Percent Change

== Percent Increase/Decrease

#info-box[
  *Percent Change Formula:*

  $ "Percent Change" = display("New" - "Original" / "Original") times 100% $

  Or equivalently:
  $ "Percent Change" = display("Change" / "Original") times 100% $
]

#example-box[
  *A price increases from \$80 to \$100. What is the percent increase?*

  $ "Percent increase" = display(100 - 80 / 80) times 100% = display(20/80) times 100% = 25% $
]

#warning-box[
  *Critical Trap: Percent Change Direction*

  The percent increase FROM A to B $eq.not$ percent decrease FROM B to A

  Example:
  - \$80 to \$100: 25% increase
  - \$100 to \$80: 20% decrease (different!)
]

== Multiplier Method

#strategy-box[
  *Using Multipliers:*
  - Increase by $x%$: Multiply by $(1 + x/100)$
  - Decrease by $x%$: Multiply by $(1 - x/100)$

  20% increase: $times 1.20$\
  20% decrease: $times 0.80$\
  5% increase: $times 1.05$
]

#example-box[
  *A price of \$200 increases by 15%, then decreases by 10%. What is the final price?*

  $dollar 200 times 1.15 times 0.90 = dollar 200 times 1.035 = dollar 207$
]

== Successive Percent Changes

#warning-box[
  *Percent changes DO NOT simply add!*

  Increase 20% then decrease 20% $eq.not$ 0% change

  Using multipliers: $1.20 times 0.80 = 0.96 =$ 4% decrease overall
]

#pagebreak()

= Part 3: Ratios

== Ratio Basics

#info-box[
  *Ratio:* A comparison of two or more quantities.

  Written as: $a:b$ or $a slash b$ or "a to b"

  *Key Point:* Ratios compare relative amounts, not actual values.
]

== Working with Ratios

#example-box[
  *The ratio of boys to girls is 3:5. If there are 24 boys, how many girls are there?*

  Set up proportion: $display(3/5) = display(24/x)$\
  $3x = 120$\
  $x = 40$ girls

  *Alternative:* 3 parts = 24, so 1 part = 8. Girls = 5 parts = 40.
]

== Part-to-Whole Ratios

#info-box[
  If ratio of $A:B = 3:5$, then:
  - A is $display(3/8)$ of total (3 out of $3+5$)
  - B is $display(5/8)$ of total
]

#example-box[
  *The ratio of red to blue marbles is 2:3. What fraction of the marbles are red?*

  Total parts $= 2 + 3 = 5$\
  Red fraction $= display(2/5)$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Visual representation of ratio 2:3
    let box_size = 0.8
    let spacing = 0.15

    // Title
    content((3, 2.2), text(weight: "bold")[Ratio 2:3 — Part-to-Whole Visualization])

    // Red boxes (2 parts)
    for i in range(2) {
      rect(
        (i * (box_size + spacing), 0.8),
        (i * (box_size + spacing) + box_size, 0.8 + box_size),
        fill: rgb("#e74c3c"),
        stroke: black
      )
    }
    content((0.9, 0.4), text(size: 10pt)[Red: 2 parts])

    // Blue boxes (3 parts)
    for i in range(3) {
      rect(
        (2.5 + i * (box_size + spacing), 0.8),
        (2.5 + i * (box_size + spacing) + box_size, 0.8 + box_size),
        fill: rgb("#3498db"),
        stroke: black
      )
    }
    content((3.9, 0.4), text(size: 10pt)[Blue: 3 parts])

    // Bracket showing total
    line((0, -0.1), (0, -0.3), stroke: black)
    line((0, -0.3), (5.35, -0.3), stroke: black)
    line((5.35, -0.1), (5.35, -0.3), stroke: black)
    content((2.67, -0.6), text(size: 10pt)[Total: 5 parts])

    // Fractions
    content((-0.5, -1.1), text(size: 10pt, fill: red.darken(20%))[$"Red" = display(2/5) = 40%$])
    content((6, -1.1), text(size: 10pt, fill: blue.darken(20%))[$"Blue" = display(3/5) = 60%$])
  })
]

== Combining Ratios

#example-box[
  *If $A:B = 2:3$ and $B:C = 4:5$, what is $A:C$?*

  Make B the same in both: Multiply first ratio by 4, second by 3
  - $A:B = 8:12$
  - $B:C = 12:15$

  Therefore $A:C = 8:15$
]

#pagebreak()

= Part 4: Proportions

== Setting Up Proportions

#info-box[
  *Proportion:* An equation stating two ratios are equal.

  $ display(a/b) = display(c/d) $

  *Cross-multiplication:* $a times d = b times c$
]

#example-box[
  *If 3 workers can complete a task in 12 days, how many days will it take 4 workers?*

  Work is inversely proportional to workers.\
  $3 times 12 = 4 times d$\
  $36 = 4d$\
  $d = 9$ days
]

== Direct vs. Inverse Proportion

#info-box[
  *Direct Proportion:* As one increases, other increases proportionally.
  - More items → More cost
  - Formula: $display(y/x) = k$ (constant)

  *Inverse Proportion:* As one increases, other decreases.
  - More workers → Less time
  - Formula: $x times y = k$ (constant)
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Direct proportion graph (left)
    let ox1 = 0
    let oy = 0
    let w = 4
    let h = 3

    // Axes for direct
    line((ox1, oy), (ox1, oy + h + 0.3), stroke: black, mark: (end: ">"))
    line((ox1, oy), (ox1 + w + 0.3, oy), stroke: black, mark: (end: ">"))
    content((ox1 - 0.3, oy + h / 2), text(size: 9pt)[y])
    content((ox1 + w / 2, oy - 0.4), text(size: 9pt)[x])
    content((ox1 + w / 2, h + 0.7), text(weight: "bold", size: 10pt)[Direct Proportion])

    // Direct proportion line (y = kx)
    line((ox1, oy), (ox1 + w - 0.3, oy + h - 0.3), stroke: (paint: rgb("#27ae60"), thickness: 2pt))
    content((ox1 + w - 2, h - 0.8), text(fill: rgb("#27ae60"), size: 9pt)[$y = k x$])

    // Inverse proportion graph (right)
    let ox2 = 6

    // Axes for inverse
    line((ox2, oy), (ox2, oy + h + 0.3), stroke: black, mark: (end: ">"))
    line((ox2, oy), (ox2 + w + 0.3, oy), stroke: black, mark: (end: ">"))
    content((ox2 - 0.3, oy + h / 2), text(size: 9pt)[y])
    content((ox2 + w / 2, oy - 0.4), text(size: 9pt)[x])
    content((ox2 + w / 2, h + 0.7), text(weight: "bold", size: 10pt)[Inverse Proportion])

    // Inverse proportion curve (y = k/x)
    let points = ()
    for i in range(5, 40) {
      let x = i / 10
      let y = 2.5 / x  // k = 2.5
      if y <= h - 0.2 {
        points.push((ox2 + x, oy + y))
      }
    }
    line(..points, stroke: (paint: rgb("#e74c3c"), thickness: 2pt))
    content((ox2 + 2.2, 1.8), text(fill: rgb("#e74c3c"), size: 9pt)[$x y = k$])
  })
]

#tip-box[
  *Recognition Tip:* Direct proportion shows a straight line through the origin. Inverse proportion shows a curved hyperbola. Identify which type applies before setting up equations.
]

== Scale Factors

#info-box[
  *Scale Factor:* The multiplier relating two similar figures.

  If scale factor $= k$:
  - Linear measurements scale by $k$
  - Areas scale by $k^2$
  - Volumes scale by $k^3$
]

#example-box[
  *Two similar rectangles have sides in ratio 2:3. If the smaller has area 20, what is the larger's area?*

  Area ratio $= (3 slash 2)^2 = display(9/4)$

  Larger area $= 20 times display(9/4) = 45$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Small rectangle (scale factor k=1, represented as 2 units)
    let s_w = 2
    let s_h = 1.2
    rect((0, 0), (s_w, s_h), fill: rgb("#aed6f1"), stroke: black)
    content((s_w / 2, s_h / 2), text(size: 9pt)[Area = 20])
    content((s_w / 2, -0.4), text(size: 9pt)[Side: 2])

    // Arrow showing scale
    line((s_w + 0.5, s_h / 2), (s_w + 1.5, s_h / 2), stroke: black, mark: (end: ">"))
    content((s_w + 1, s_h / 2 + 0.4), text(size: 8pt)[$times 1.5$])

    // Large rectangle (scale factor k=1.5, represented as 3 units)
    let l_w = 3
    let l_h = 1.8
    let offset = s_w + 2
    rect((offset, -0.3), (offset + l_w, -0.3 + l_h), fill: rgb("#85c1e9"), stroke: black)
    content((offset + l_w / 2, -0.3 + l_h / 2), text(size: 9pt)[Area = 45])
    content((offset + l_w / 2, -0.7), text(size: 9pt)[Side: 3])

    // Title and explanation
    content((3.5, 2.2), text(weight: "bold")[Scale Factor Effect on Area])
    content((3.5, -1.5), text(size: 9pt)[Side ratio: $2:3$ → Scale factor $k = display(3/2)$])
    content((3.5, -2.2), text(size: 9pt)[Area ratio: $k^2 = display(9/4) = 2.25$])
  })
]

#warning-box[
  *Common Mistake:* Students often forget to square the scale factor for area problems or cube it for volume problems. Remember: Linear $arrow.r k$, Area $arrow.r k^2$, Volume $arrow.r k^3$.
]

#pagebreak()

= Part 5: Unit Conversions

== Conversion Strategy

#strategy-box[
  *Dimensional Analysis:* Multiply by conversion factors that equal 1.

  Example: Convert 5 miles to feet
  $ 5 "miles" times display(5280 "feet" / 1 "mile") = 26400 "feet" $

  The "miles" cancel, leaving "feet."
]

== Common Conversions

#uptoten-table(
  columns: 2,
  header: ("Category", "Conversions"),
  "Length", "1 mile = 5,280 feet; 1 yard = 3 feet; 1 foot = 12 inches",
  "Time", "1 hour = 60 min; 1 day = 24 hours; 1 year ≈ 365 days",
  "Volume", "1 gallon = 4 quarts; 1 quart = 2 pints",
  "Mass", "1 pound = 16 ounces; 1 ton = 2,000 pounds",
)

#warning-box[
  *GMAT Note:* Metric conversions are rarely tested. Focus on common US customary units and relationships.
]

#pagebreak()

= Part 6: GMAT Strategies

== Picking Numbers for Percent Problems

#strategy-box[
  *When answer choices contain variables or "what percent":*

  Pick 100 as the starting value. This makes percent calculations simple.
]

#example-box[
  *If a price increases by 20%, then decreases by 25%, what is the net percent change?*

  Start with 100.\
  After 20% increase: $100 times 1.20 = 120$\
  After 25% decrease: $120 times 0.75 = 90$

  Net change: $display((90 - 100)/100) = -10%$ (10% decrease)
]

== Common GMAT Percent Traps

#warning-box[
  *Avoid These Mistakes:*
  1. Calculating percent change with wrong base
  2. Adding successive percent changes
  3. Confusing percent of vs. percent more than
  4. Using original value for second percent change
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Percent fundamentals and conversions
2. Percent of a number, finding the whole
3. Basic percent increase/decrease
4. Ratio basics and part-to-whole

*Question Time:* 5-6 questions covering basic percent calculations and ratios

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Successive percent changes
2. Complex ratio problems (combining ratios)
3. Direct and inverse proportion
4. Scale factors for area and volume
5. Picking numbers strategy for percent problems

*Review errors from Training #1, focusing on:*
- Percent change calculation errors
- Ratio setup mistakes
- Part-to-whole confusion

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick recognition of direct vs. inverse proportion
- Successive percent change shortcuts

*Assessment:* 20 questions, 40 minutes

== Common Student Difficulties

1. Using the wrong base for percent change
2. Adding percent changes instead of multiplying
3. Confusing "percent of" with "percent more than"
4. Setting up inverse proportions incorrectly
5. Forgetting to square scale factor for area problems

#warning-box[
  *Tutor Tip:* Always have students identify the original value first in percent change problems. This is the most common source of errors.
]

#tip-box[
  *After this topic:* The QR section is complete! Next, the student will take QR section assessments before moving to Data Insights.
]
