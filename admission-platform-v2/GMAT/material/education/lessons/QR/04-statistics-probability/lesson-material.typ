#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Statistics & Probability",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering mean, median, mode, range, standard deviation, counting methods, and probability.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Statistics & Probability\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-04 (Fifth of 5 QR topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Calculate and interpret mean, median, mode, and range
2. Understand and apply standard deviation concepts
3. Use counting principles (fundamental counting, permutations, combinations)
4. Calculate probabilities of single and compound events
5. Apply "at least one" probability strategies
6. Solve problems involving weighted averages

== GMAT Relevance

Statistics and Probability appear in approximately 10-15% of QR questions. These concepts also appear heavily in the Data Insights section, making mastery essential.

#pagebreak()

= Part 1: Measures of Central Tendency

== Mean (Average)

#info-box[
  *Mean* $display(= "Sum of all values" / "Number of values")$

  Also called arithmetic average.

  *Key Formula:* Sum $=$ Mean $times$ Count
]

#example-box[
  *The average of 5 numbers is 12. What is their sum?*

  Sum $=$ Mean $times$ Count $= 12 times 5 = 60$
]

== Weighted Average

#info-box[
  *Weighted Average* $display(= (w_1 times v_1 + w_2 times v_2 + ...) / (w_1 + w_2 + ...))$

  Used when different values have different importance (weights).
]

#example-box[
  *A student scores 80 on a test worth 30% and 90 on a test worth 70%. What is the weighted average?*

  Weighted Avg $display(= (0.30 times 80 + 0.70 times 90) / (0.30 + 0.70))$\
  \
  $display(= (24 + 63) / 1 = 87)$
]

== Median

#info-box[
  *Median:* The middle value when data is arranged in order.

  - Odd number of values: Middle value
  - Even number of values: Average of two middle values

  *Key Property:* Median is not affected by extreme values (outliers)
]

#example-box[
  *Find the median of: 3, 7, 2, 9, 5*

  Arrange in order: 2, 3, 5, 7, 9\
  Median $= 5$ (middle value)

  *Find the median of: 3, 7, 2, 9, 5, 11*

  Arrange in order: 2, 3, 5, 7, 9, 11\
  \
  Median $display(= (5 + 7) / 2 = 6)$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line with data points
    let data = (2, 3, 5, 7, 9)
    let mean = 5.2

    // Draw number line
    line((-0.5, 0), (10.5, 0), stroke: 1pt, mark: (end: ">"))

    // Tick marks
    for i in range(0, 11) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 7pt)[$#i$])
    }

    // Data points
    for val in data {
      circle((val, 0.5), radius: 0.15, fill: blue, stroke: none)
    }

    // Mean marker
    line((mean, -0.3), (mean, 1), stroke: red + 1.5pt)
    content((mean, 1.4), text(size: 8pt, fill: red)[Mean $= 5.2$])

    // Median marker
    line((5, -0.3), (5, 0.8), stroke: green + 1.5pt)
    content((5, -0.8), text(size: 8pt, fill: green.darken(20%))[Median $= 5$])

    // Data labels
    content((5, 2), text(size: 8pt)[Data: 2, 3, 5, 7, 9])
  })
]

== Mode

#info-box[
  *Mode:* The value that appears most frequently.

  A data set can have:
  - No mode (all values appear once)
  - One mode (unimodal)
  - Multiple modes (bimodal, multimodal)
]

== Range

#info-box[
  *Range* $=$ Maximum value $-$ Minimum value

  Measures the spread of data.
]

#pagebreak()

= Part 2: Standard Deviation

== Concept

#info-box[
  *Standard Deviation (SD):* Measures how spread out values are from the mean.

  - Low SD: Values clustered near mean
  - High SD: Values spread far from mean

  *Note:* GMAT rarely requires calculating SD; focus on understanding the concept.
]

== Key Properties

#tip-box[
  *Standard Deviation Properties:*
  - Adding/subtracting a constant to all values: SD stays the same
  - Multiplying all values by a constant $k$: SD is multiplied by $|k|$
  - SD is always $>= 0$
  - SD $= 0$ only when all values are identical
]

#example-box[
  *Set A: {10, 20, 30, 40, 50} has SD $= 14.14$*

  *If we add 10 to each value: {20, 30, 40, 50, 60}*\
  New SD $= 14.14$ (unchanged)

  *If we multiply each by 2: {20, 40, 60, 80, 100}*\
  New SD $= 28.28$ (doubled)
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Low SD visualization
    content((-3, 2.5), text(size: 9pt, weight: "bold")[Low SD (clustered)])

    line((-6, 1.5), (0, 1.5), stroke: 1pt)
    // Mean line
    line((-3, 1.2), (-3, 2), stroke: red + 1.5pt)

    // Data points clustered near mean
    for x in (-3.5, -3.2, -3, -2.8, -2.5) {
      circle((x, 1.5), radius: 0.12, fill: blue, stroke: none)
    }

    // High SD visualization
    content((5, 2.5), text(size: 9pt, weight: "bold")[High SD (spread out)])

    line((2, 1.5), (8, 1.5), stroke: 1pt)
    // Mean line
    line((5, 1.2), (5, 2), stroke: red + 1.5pt)

    // Data points spread far from mean
    for x in (2.5, 3.5, 5, 6.5, 7.5) {
      circle((x, 1.5), radius: 0.12, fill: blue, stroke: none)
    }

    // SD arrows
    line((-3, 1), (-2.5, 1), stroke: 0.5pt, mark: (start: "|", end: ">"))
    content((-2.75, 0.6), text(size: 7pt)[small])

    line((5, 1), (7.5, 1), stroke: 0.5pt, mark: (start: "|", end: ">"))
    content((6.25, 0.6), text(size: 7pt)[large])
  })
]

== Normal Distribution (Bell Curve)

#info-box[
  *Normal Distribution:* A symmetric, bell-shaped distribution where data clusters around the mean.

  *The Empirical Rule (68-95-99.7 Rule):*
  - *68%* of data falls within $plus.minus 1$ standard deviation of the mean
  - *95%* of data falls within $plus.minus 2$ standard deviations of the mean
  - *99.7%* of data falls within $plus.minus 3$ standard deviations of the mean
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Bell curve parameters - larger and cleaner
    let sx = 1.4  // x scale
    let sy = 5.0  // y scale (taller curve)

    // Helper function to compute normal distribution y value
    let normal_y(x) = calc.exp(-0.5 * calc.pow(x, 2)) / calc.sqrt(2 * calc.pi)

    // Generate smooth curve points
    let curve_points = ()
    for i in range(-35, 36) {
      let x = i / 10
      curve_points.push((x * sx, normal_y(x) * sy))
    }

    // === DRAW COLORED REGIONS ===
    // Strategy: For each region, start at baseline left, go up along curve, then back down to baseline right

    // Left tail region (-3.5σ to -3σ) - very light gray
    let tail_left = ((-3.5 * sx, 0),)
    for i in range(-35, -29) {
      let x = i / 10
      tail_left.push((x * sx, normal_y(x) * sy))
    }
    tail_left.push((-3 * sx, 0))
    line(..tail_left, close: true, fill: gray.lighten(80%), stroke: none)

    // Right tail region (3σ to 3.5σ) - very light gray
    let tail_right = ((3 * sx, 0),)
    for i in range(30, 36) {
      let x = i / 10
      tail_right.push((x * sx, normal_y(x) * sy))
    }
    tail_right.push((3.5 * sx, 0))
    line(..tail_right, close: true, fill: gray.lighten(80%), stroke: none)

    // Left -3σ to -2σ region (2.35%) - orange tint
    let region_2to3_left = ((-3 * sx, 0),)
    for i in range(-30, -19) {
      let x = i / 10
      region_2to3_left.push((x * sx, normal_y(x) * sy))
    }
    region_2to3_left.push((-2 * sx, 0))
    line(..region_2to3_left, close: true, fill: orange.lighten(75%), stroke: none)

    // Right 2σ to 3σ region (2.35%) - orange tint
    let region_2to3_right = ((2 * sx, 0),)
    for i in range(20, 31) {
      let x = i / 10
      region_2to3_right.push((x * sx, normal_y(x) * sy))
    }
    region_2to3_right.push((3 * sx, 0))
    line(..region_2to3_right, close: true, fill: orange.lighten(75%), stroke: none)

    // Left -2σ to -1σ region (13.5%) - green tint
    let region_1to2_left = ((-2 * sx, 0),)
    for i in range(-20, -9) {
      let x = i / 10
      region_1to2_left.push((x * sx, normal_y(x) * sy))
    }
    region_1to2_left.push((-1 * sx, 0))
    line(..region_1to2_left, close: true, fill: green.lighten(70%), stroke: none)

    // Right 1σ to 2σ region (13.5%) - green tint
    let region_1to2_right = ((1 * sx, 0),)
    for i in range(10, 21) {
      let x = i / 10
      region_1to2_right.push((x * sx, normal_y(x) * sy))
    }
    region_1to2_right.push((2 * sx, 0))
    line(..region_1to2_right, close: true, fill: green.lighten(70%), stroke: none)

    // Left center region (-1σ to 0) - blue tint
    let region_center_left = ((-1 * sx, 0),)
    for i in range(-10, 1) {
      let x = i / 10
      region_center_left.push((x * sx, normal_y(x) * sy))
    }
    region_center_left.push((0, 0))
    line(..region_center_left, close: true, fill: blue.lighten(65%), stroke: none)

    // Right center region (0 to 1σ) - blue tint
    let region_center_right = ((0, 0),)
    for i in range(0, 11) {
      let x = i / 10
      region_center_right.push((x * sx, normal_y(x) * sy))
    }
    region_center_right.push((1 * sx, 0))
    line(..region_center_right, close: true, fill: blue.lighten(65%), stroke: none)

    // === DRAW CURVE OUTLINE ===
    line(..curve_points, stroke: blue.darken(20%) + 2pt)

    // === DRAW AXIS ===
    line((-5.5, 0), (5.5, 0), stroke: 1.2pt, mark: (end: ">"))

    // Vertical dashed lines at each SD
    for pos in (-3, -2, -1, 0, 1, 2, 3) {
      let x_pos = pos * sx
      let y_height = normal_y(pos) * sy
      line((x_pos, 0), (x_pos, y_height), stroke: (paint: gray.darken(20%), dash: "dotted", thickness: 0.8pt))
    }

    // Tick marks and SD labels
    for (pos, label) in ((-3, $-3 sigma$), (-2, $-2 sigma$), (-1, $-sigma$), (0, $mu$), (1, $+sigma$), (2, $+2 sigma$), (3, $+3 sigma$)) {
      line((pos * sx, -0.12), (pos * sx, 0.12), stroke: 1pt)
      content((pos * sx, -0.5), text(size: 8pt, weight: "medium")[#label])
    }

    // === PERCENTAGE LABELS IN EACH REGION ===

    // Central 34% labels (inside the curve)
    content((-0.5 * sx, 1.0), text(size: 10pt, weight: "bold", fill: blue.darken(30%))[34%])
    content((0.5 * sx, 1.0), text(size: 10pt, weight: "bold", fill: blue.darken(30%))[34%])

    // 13.5% labels
    content((-1.5 * sx, 1.2), text(size: 9pt, weight: "bold", fill: green.darken(30%))[13.5%])
    content((1.5 * sx, 1.2), text(size: 9pt, weight: "bold", fill: green.darken(30%))[13.5%])

    // 2.35% labels
    content((-2.5 * sx, 0.4), text(size: 8pt, fill: orange.darken(20%))[2.35%])
    content((2.5 * sx, 0.4), text(size: 8pt, fill: orange.darken(20%))[2.35%])

    // 0.15% labels (tails)
    content((-3.3 * sx, 0.2), text(size: 7pt, fill: gray.darken(30%))[0.15%])
    content((3.3 * sx, 0.2), text(size: 7pt, fill: gray.darken(30%))[0.15%])

    // === CUMULATIVE PERCENTAGE BRACKETS ===

    // 68% bracket
    let bracket_y1 = 2.3
    line((-1 * sx, bracket_y1 - 0.1), (-1 * sx, bracket_y1), stroke: blue + 1pt)
    line((-1 * sx, bracket_y1), (1 * sx, bracket_y1), stroke: blue + 1pt)
    line((1 * sx, bracket_y1 - 0.1), (1 * sx, bracket_y1), stroke: blue + 1pt)
    content((0, bracket_y1 + 0.3), text(size: 10pt, weight: "bold", fill: blue)[68%])

    // 95% bracket
    let bracket_y2 = 2.9
    line((-2 * sx, bracket_y2 - 0.1), (-2 * sx, bracket_y2), stroke: green.darken(20%) + 1pt)
    line((-2 * sx, bracket_y2), (2 * sx, bracket_y2), stroke: green.darken(20%) + 1pt)
    line((2 * sx, bracket_y2 - 0.1), (2 * sx, bracket_y2), stroke: green.darken(20%) + 1pt)
    content((0, bracket_y2 + 0.3), text(size: 10pt, weight: "bold", fill: green.darken(20%))[95%])

    // 99.7% bracket
    let bracket_y3 = 3.5
    line((-3 * sx, bracket_y3 - 0.1), (-3 * sx, bracket_y3), stroke: orange.darken(10%) + 1pt)
    line((-3 * sx, bracket_y3), (3 * sx, bracket_y3), stroke: orange.darken(10%) + 1pt)
    line((3 * sx, bracket_y3 - 0.1), (3 * sx, bracket_y3), stroke: orange.darken(10%) + 1pt)
    content((0, bracket_y3 + 0.3), text(size: 10pt, weight: "bold", fill: orange.darken(10%))[99.7%])
  })
]

#tip-box[
  *Key Percentages to Memorize:*

  #uptoten-table(
    columns: 2,
    header: ("Region", "Percentage of Data"),
    [$mu plus.minus sigma$], [68% (about 2/3)],
    [$mu plus.minus 2 sigma$], [95%],
    [$mu plus.minus 3 sigma$], [99.7% (nearly all)],
    [Below $mu - sigma$], [16% (half of remaining 32%)],
    [Above $mu + sigma$], [16%],
    [Below $mu - 2 sigma$], [2.5%],
    [Above $mu + 2 sigma$], [2.5%],
  )
]

#example-box[
  *Test scores are normally distributed with mean $mu = 500$ and standard deviation $sigma = 100$. What percentage of scores fall between 400 and 600?*

  $400 = 500 - 100 = mu - sigma$\
  $600 = 500 + 100 = mu + sigma$

  The range $400$ to $600$ represents $mu plus.minus sigma$.\
  *Answer: 68%* of scores fall in this range.
]

#example-box[
  *Using the same distribution ($mu = 500$, $sigma = 100$), what percentage of scores are above 700?*

  $700 = 500 + 200 = 500 + 2(100) = mu + 2 sigma$

  From the rule: 95% of data is within $mu plus.minus 2 sigma$\
  So 5% is outside this range, split equally: 2.5% below $mu - 2 sigma$ and 2.5% above $mu + 2 sigma$

  *Answer: 2.5%* of scores are above 700.
]

#warning-box[
  *GMAT Normal Distribution Strategy:*

  When a problem mentions "normally distributed" data:
  1. Identify the mean ($mu$) and standard deviation ($sigma$)
  2. Convert the given values to "how many SDs from the mean"
  3. Apply the 68-95-99.7 rule or use the percentage table
  4. Remember: The distribution is symmetric around the mean
]

#pagebreak()

= Part 3: Counting Methods

== Fundamental Counting Principle

#info-box[
  If there are $m$ ways to do task 1 and $n$ ways to do task 2, there are $m times n$ ways to do both tasks.

  Extends to any number of tasks: $n_1 times n_2 times n_3 times ...$
]

#example-box[
  *A restaurant offers 3 appetizers, 5 main courses, and 4 desserts. How many different 3-course meals are possible?*

  $3 times 5 times 4 = 60$ different meals
]

== Permutations (Order Matters)

#info-box[
  *Permutation:* An arrangement where ORDER MATTERS.

  *$n!$ (n factorial)* $= n times (n-1) times (n-2) times ... times 2 times 1$

  *Permutation formula:*
  $ P(n, r) = n! / (n-r)! $

  This is the number of ways to arrange $r$ items from $n$ items.
]

#example-box[
  *How many ways can 3 people be selected from 5 for President, VP, and Secretary?*

  $display(P(5, 3) = 5! / (5-3)! = 5! / 2! = (5 times 4 times 3 times 2 times 1) / (2 times 1) = 60)$

  Or think: 5 choices for President $times$ 4 for VP $times$ 3 for Secretary $= 60$
]

== Combinations (Order Doesn't Matter)

#info-box[
  *Combination:* A selection where ORDER DOESN'T MATTER.

  *Combination formula:*
  $ C(n, r) = n! / (r! times (n-r)!) $

  This is the number of ways to choose $r$ items from $n$ items.
]

#example-box[
  *How many ways can a committee of 3 be selected from 5 people?*

  $display(C(5, 3) = 5! / (3! times 2!) = (5 times 4 times 3!) / (3! times 2 times 1) = 20 / 2 = 10)$
]

#warning-box[
  *Permutation vs. Combination:*
  - Does order matter? #sym.arrow Permutation
  - Does order NOT matter? #sym.arrow Combination

  *Key test:* Would swapping two items create a different outcome?
  - Yes #sym.arrow Permutation
  - No #sym.arrow Combination
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Permutation example (order matters)
    content((-3, 3), text(size: 9pt, weight: "bold", fill: blue)[PERMUTATION])
    content((-3, 2.4), text(size: 8pt)[Order Matters])

    // Show A-B-C as different from B-A-C
    rect((-5, 1), (-1, 2), stroke: blue + 0.5pt, fill: blue.lighten(90%))
    content((-4.3, 1.5), text(size: 9pt)[A])
    content((-3, 1.5), text(size: 9pt)[B])
    content((-1.7, 1.5), text(size: 9pt)[C])

    content((-3, 0.75), text(size: 8pt)[$eq.not$])

    rect((-5, -0.5), (-1, 0.5), stroke: blue + 0.5pt, fill: blue.lighten(90%))
    content((-4.3, 0), text(size: 9pt)[B])
    content((-3, 0), text(size: 9pt)[A])
    content((-1.7, 0), text(size: 9pt)[C])

    content((-3, -1), text(size: 7pt)[President, VP, Secretary])

    // Combination example (order doesn't matter)
    content((4, 3), text(size: 9pt, weight: "bold", fill: green.darken(20%))[COMBINATION])
    content((4, 2.4), text(size: 8pt)[Order Doesn't Matter])

    // Show {A,B,C} same as {B,A,C}
    rect((2, 1), (6, 2), stroke: green + 0.5pt, fill: green.lighten(90%))
    content((2.7, 1.5), text(size: 9pt)[A])
    content((4, 1.5), text(size: 9pt)[B])
    content((5.3, 1.5), text(size: 9pt)[C])

    content((4, 0.75), text(size: 8pt)[$=$])

    rect((2, -0.5), (6, 0.5), stroke: green + 0.5pt, fill: green.lighten(90%))
    content((2.7, 0), text(size: 9pt)[B])
    content((4, 0), text(size: 9pt)[A])
    content((5.3, 0), text(size: 9pt)[C])

    content((4, -1), text(size: 7pt)[Committee of 3])
  })
]

== Special Counting Cases

#info-box[
  *Circular arrangements:* $(n-1)!$ for $n$ objects in a circle

  *Arrangements with repetition:* $display(n! / (a! times b! times ...))$ where $a$, $b$, etc. are counts of identical items
]

#pagebreak()

= Part 4: Probability

== Basic Probability

#info-box[
  *Probability* $display(="Number of favorable outcomes" / "Total number of possible outcomes")$

  Probability ranges from 0 (impossible) to 1 (certain).
]

== Probability Rules

#info-box[
  *Complement Rule:*
  $P("not "A) = P(macron(A)) = 1 - P(A)$

  *Addition Rule (OR):*
  - Mutually exclusive events: $P(A "or" B) = P(A) + P(B)$
  - Non-exclusive events: $P(A "or" B) = P(A) + P(B) - P(A "and" B)$

  *Multiplication Rule (AND):*
  - Independent events: $P(A "and" B) = P(A) times P(B)$
  - Dependent events: $P(A "and" B) = P(A) times P(B|A)$
]

== Independent vs. Dependent Events

#info-box[
  *Independent:* One event doesn't affect the other.
  - Example: Flipping a coin twice

  *Dependent:* One event affects the probability of another.
  - Example: Drawing cards without replacement
]

#example-box[
  *A bag has 3 red and 2 blue balls. Two are drawn without replacement. P(both red)?*

  $P("1st red") = 3\/5$\
  $P("2nd red" | "1st red") = 2\/4 = 1\/2$\
  $P("both red") = 3\/5 times 1\/2 = 3\/10$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Probability tree for ball drawing - improved layout
    // Title
    content((4, 5.5), text(size: 10pt, weight: "bold")[Probability Tree: Drawing 2 Balls Without Replacement])
    content((4, 5), text(size: 8pt)[Bag contains: 3 Red, 2 Blue])

    // Layout parameters
    let x0 = 0      // Start node
    let x1 = 3      // First level nodes
    let x2 = 6      // Second level nodes
    let x3 = 8.5    // Result labels

    // Y positions for clear spacing
    let y_start = 2.5
    let y_r = 3.5   // Red branch (first draw)
    let y_b = 1.5   // Blue branch (first draw)
    let y_rr = 4.2  // Red-Red
    let y_rb = 2.8  // Red-Blue
    let y_br = 2.2  // Blue-Red
    let y_bb = 0.8  // Blue-Blue

    // START NODE
    circle((x0, y_start), radius: 0.4, fill: gray.lighten(60%), stroke: 1.5pt)
    content((x0, y_start), text(size: 8pt, weight: "bold")[Start])

    // === FIRST DRAW ===

    // Branch to Red (3/5)
    line((x0 + 0.35, y_start + 0.15), (x1 - 0.3, y_r - 0.1), stroke: red + 1.5pt)
    content((1.3, 3.3), text(size: 9pt, fill: red, weight: "bold")[$3\/5$])
    circle((x1, y_r), radius: 0.3, fill: red.lighten(60%), stroke: red + 1.5pt)
    content((x1, y_r), text(size: 9pt, weight: "bold")[R])

    // Branch to Blue (2/5)
    line((x0 + 0.35, y_start - 0.15), (x1 - 0.3, y_b + 0.1), stroke: blue + 1.5pt)
    content((1.3, 1.7), text(size: 9pt, fill: blue, weight: "bold")[$2\/5$])
    circle((x1, y_b), radius: 0.3, fill: blue.lighten(60%), stroke: blue + 1.5pt)
    content((x1, y_b), text(size: 9pt, weight: "bold")[B])

    // === SECOND DRAW FROM RED ===

    // Red → Red (2/4)
    line((x1 + 0.3, y_r + 0.1), (x2 - 0.25, y_rr - 0.1), stroke: red + 1.5pt)
    content((4.3, 4.1), text(size: 8pt, fill: red)[$2\/4$])
    circle((x2, y_rr), radius: 0.25, fill: red.lighten(60%), stroke: red + 1pt)
    content((x2, y_rr), text(size: 8pt)[R])
    // Result: RR
    content((x3, y_rr), box(
      fill: red.lighten(85%),
      stroke: red + 0.5pt,
      inset: 4pt,
      radius: 3pt,
      text(size: 8pt)[RR: $3\/5 times 2\/4 = 6\/20 = 3\/10$]
    ))

    // Red → Blue (2/4)
    line((x1 + 0.3, y_r - 0.1), (x2 - 0.25, y_rb + 0.1), stroke: blue + 1.5pt)
    content((4.3, 2.9), text(size: 8pt, fill: blue)[$2\/4$])
    circle((x2, y_rb), radius: 0.25, fill: blue.lighten(60%), stroke: blue + 1pt)
    content((x2, y_rb), text(size: 8pt)[B])
    // Result: RB
    content((x3, y_rb), box(
      fill: purple.lighten(85%),
      stroke: purple + 0.5pt,
      inset: 4pt,
      radius: 3pt,
      text(size: 8pt)[RB: $3\/5 times 2\/4 = 6\/20 = 3\/10$]
    ))

    // === SECOND DRAW FROM BLUE ===

    // Blue → Red (3/4)
    line((x1 + 0.3, y_b + 0.1), (x2 - 0.25, y_br - 0.1), stroke: red + 1.5pt)
    content((4.3, 2.1), text(size: 8pt, fill: red)[$3\/4$])
    circle((x2, y_br), radius: 0.25, fill: red.lighten(60%), stroke: red + 1pt)
    content((x2, y_br), text(size: 8pt)[R])
    // Result: BR
    content((x3, y_br), box(
      fill: purple.lighten(85%),
      stroke: purple + 0.5pt,
      inset: 4pt,
      radius: 3pt,
      text(size: 8pt)[BR: $2\/5 times 3\/4 = 6\/20 = 3\/10$]
    ))

    // Blue → Blue (1/4)
    line((x1 + 0.3, y_b - 0.1), (x2 - 0.25, y_bb + 0.1), stroke: blue + 1.5pt)
    content((4.3, 0.9), text(size: 8pt, fill: blue)[$1\/4$])
    circle((x2, y_bb), radius: 0.25, fill: blue.lighten(60%), stroke: blue + 1pt)
    content((x2, y_bb), text(size: 8pt)[B])
    // Result: BB
    content((x3, y_bb), box(
      fill: blue.lighten(85%),
      stroke: blue + 0.5pt,
      inset: 4pt,
      radius: 3pt,
      text(size: 8pt)[BB: $2\/5 times 1\/4 = 2\/20 = 1\/10$]
    ))

    // Column labels
    content((x0, 0), text(size: 7pt, fill: gray)[Start])
    content((x1, 0), text(size: 7pt, fill: gray)[1st Draw])
    content((x2, 0), text(size: 7pt, fill: gray)[2nd Draw])
    content((x3, 0), text(size: 7pt, fill: gray)[Outcome])
  })
]

#tip-box[
  *Reading the Probability Tree:*
  - Multiply probabilities along each path to get outcome probability
  - Notice: After drawing Red first, only 2 Red and 2 Blue remain (dependent events)
  - All outcomes sum to 1: $3\/10 + 3\/10 + 3\/10 + 1\/10 = 10\/10 = 1$ #sym.checkmark
]

== "At Least One" Problems

#strategy-box[
  *"At Least One" Strategy:*

  $P("at least one") = 1 - P("none")$

  This is almost always easier than calculating all the "at least one" cases directly.
]

#example-box[
  *A fair coin is flipped 3 times. P(at least one head)?*

  $P("no heads") = P("all tails") = 1\/2 times 1\/2 times 1\/2 = 1\/8$

  $P("at least one head") = 1 - 1\/8 = 7\/8$
]

#pagebreak()

= Part 5: Expected Value

#info-box[
  *Expected Value* $= sum ("probability" times "value")$

  The weighted average of all possible outcomes.
]

#example-box[
  *A game: Roll a die. Win \$10 on 6, lose \$2 otherwise. What's the expected value?*

  $P(6) = 1\/6$, value $= +$\$10\
  $P("not " 6) = 5\/6$, value $= -$\$2

  $"EV" = (1\/6)(10) + (5\/6)(-2) = 10\/6 - 10\/6 = 0$

  The game is fair (expected value $= 0$).
]

#pagebreak()

= Part 6: GMAT Strategies

== Statistics Shortcuts

#tip-box[
  *Quick Statistics Tips:*
  - To find sum from average: Sum $=$ Average $times$ Count
  - Median of consecutive integers: Same as average
  - Adding a value to a set: New sum $=$ Old sum $+$ New value
  - Effect on mean when adding a value: Compare new value to old mean
]

== Probability Shortcuts

#tip-box[
  *Probability Tips:*
  - "At least one" #sym.arrow Use complement: $1 - P("none")$
  - "Exactly one" #sym.arrow Often need to consider multiple cases
  - With replacement: Events are independent
  - Without replacement: Events are dependent
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Mean, median, mode, range
2. Fundamental counting principle
3. Introduction to permutations vs. combinations
4. Basic probability

*Question Time:* 5-6 questions covering averages and basic counting

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Standard deviation concepts (not calculations)
2. Advanced counting (combinations, arrangements)
3. Compound probability (AND, OR rules)
4. "At least one" problems

*Review errors from Training #1, focusing on:*
- Permutation vs. combination confusion
- Average/median confusion
- Basic probability errors

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick recognition of counting problem types
- Probability rule application

*Assessment:* 20 questions, 40 minutes

== Common Student Difficulties

1. Confusing when to use permutation vs. combination
2. Forgetting the complement strategy for "at least one"
3. Median errors with even number of values
4. Dependent vs. independent event confusion
5. Weighted average setup errors

#warning-box[
  *Tutor Tip:* For counting problems, have students ask: "If I swap two items, is it a different outcome?" This clarifies permutation vs. combination.
]
