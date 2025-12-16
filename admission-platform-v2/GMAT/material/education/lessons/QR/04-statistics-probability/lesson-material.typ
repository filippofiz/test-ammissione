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

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Lesson Overview

*Topic:* Statistics & Probability\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-04 (Fourth of 5 QR topics)\
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

Statistics and Probability appear in approximately 10-15% of QR questions. These concepts also appear heavily in the Data Insights section, making mastery essential for both the Quantitative Reasoning and Data Insights portions of the exam.

Unlike algebra or arithmetic, statistics and probability questions often feel less "computational" and more "conceptual." Many problems don't require complex calculations; instead, they test whether you understand *what* the statistical measures mean and *when* to apply different probability rules. This makes pattern recognition and conceptual understanding particularly valuable.

The good news is that the GMAT tests a relatively narrow range of statistical and probability concepts. Master the fundamentals covered in this lesson, and you'll be well-prepared for the vast majority of questions in this category.

#pagebreak()

= Measures of Central Tendency

When we have a set of data, one of the first questions we ask is: "What is a typical value?" Measures of central tendency answer this question by identifying a single value that represents the "center" of the data. The three main measures are the mean, median, and mode, each capturing a different aspect of what "central" means.

== Mean (Arithmetic Average)

The *mean* is the most commonly used measure of central tendency. It's what most people think of when they hear the word "average." To calculate the mean, you add up all the values and divide by how many values there are.

#info-box[
  *Mean Formula:*

  $ "Mean" = frac("Sum of all values", "Number of values") $

  This formula can be rearranged to find the sum when given the mean:

  $ "Sum" = "Mean" times "Count" $

  This rearrangement is extremely useful on the GMAT, where you're often given an average and asked to work backwards.
]

*Why is the mean useful?* The mean incorporates every data point, making it a comprehensive summary of the entire dataset. However, this also means that extreme values (outliers) can significantly affect the mean, pulling it toward them.

#example-box(breakable: true)[
  *The average of 5 numbers is 12. What is their sum?*

  Using the rearranged formula:
  $ "Sum" = "Mean" times "Count" = 12 times 5 = 60 $

  *Follow-up: If a sixth number is added and the new average becomes 15, what is the sixth number?*

  New sum $= 15 times 6 = 90$

  The sixth number $= 90 - 60 = 30$
]

#tip-box[
  *Mean Strategy for GMAT:* When a problem involves adding or removing values from a set, think in terms of sums rather than averages. Calculate the total sum before and after the change, then work with the difference.
]

== Weighted Average

Sometimes not all values should contribute equally to the average. When different values have different levels of importance (or "weights"), we use a *weighted average*.

#info-box[
  *Weighted Average Formula:*

  $ "Weighted Average" = frac(w_1 times v_1 + w_2 times v_2 + ..., w_1 + w_2 + ...) $

  Where $w_i$ represents the weight of each value $v_i$.

  *Key insight:* The weighted average is always between the minimum and maximum values, but closer to the values with higher weights.
]

*When do we use weighted averages?* Common scenarios include:
- Calculating course grades when assignments have different point values
- Finding average prices when different quantities are sold at different prices
- Computing average speeds over different distances (this connects to the rate problems from lesson QR-03)

#example-box(breakable: true)[
  *A student scores 80 on a test worth 30% and 90 on a test worth 70%. What is the weighted average?*

  $ "Weighted Avg" = frac(0.30 times 80 + 0.70 times 90, 0.30 + 0.70) = frac(24 + 63, 1) = 87 $

  Notice that 87 is closer to 90 than to 80. This makes sense because the 90 carries more weight (70% vs 30%).

  *Quick check:* Is 87 between 80 and 90? Yes. Is it closer to the value with higher weight (90)? Yes. #sym.checkmark
]

#warning-box[
  *Common Weighted Average Trap:*

  Don't simply average the values without considering their weights! If you had averaged 80 and 90 directly, you'd get 85, which is wrong because it ignores that the 90 is worth more than twice as much as the 80.
]

The weighted average can be visualized as a balance point on a number line. The result is pulled toward the value with the greater weight:

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line from 80 to 90
    line((0, 0), (10, 0), stroke: 1.5pt)

    // Tick marks
    for i in range(0, 11) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      if calc.rem(i, 2) == 0 {
        content((i, -0.5), text(size: 7pt)[#(80 + i)])
      }
    }

    // Weight at 80 (30%)
    circle((0, 0.8), radius: 0.4, fill: blue.lighten(60%), stroke: blue + 1pt)
    content((0, 0.8), text(size: 7pt, weight: "bold")[30%])
    content((0, 1.5), text(size: 8pt)[Score: 80])

    // Weight at 90 (70%)
    circle((10, 0.8), radius: 0.6, fill: green.lighten(60%), stroke: green + 1pt)
    content((10, 0.8), text(size: 7pt, weight: "bold")[70%])
    content((10, 1.6), text(size: 8pt)[Score: 90])

    // Balance point (weighted average = 87)
    line((7, -0.3), (7, 0), stroke: red + 2pt)
    line((6.7, -0.3), (7.3, -0.3), stroke: red + 2pt)
    line((6.7, -0.3), (7, -0.7), stroke: red + 2pt)
    line((7.3, -0.3), (7, -0.7), stroke: red + 2pt)
    content((7, -1.1), text(size: 8pt, fill: red, weight: "bold")[Weighted Avg = 87])

    // Simple average marker
    line((5, -0.2), (5, 0.3), stroke: gray + 1pt, dash: "dashed")
    content((5, 0.6), text(size: 7pt, fill: gray)[Simple avg = 85])
  })
]

== Median

The *median* is the middle value when all data points are arranged in order. Unlike the mean, the median is resistant to outliers, making it a better measure of "typical" when data contains extreme values.

#info-box[
  *Finding the Median:*

  1. Arrange all values in ascending (or descending) order
  2. If the count is *odd*: The median is the middle value
  3. If the count is *even*: The median is the average of the two middle values

  *Position formula:* For $n$ values, the median is at position $frac(n + 1, 2)$
]

*Why use the median?* Consider home prices in a neighborhood. If most homes cost around \$300,000 but one mansion sells for \$5 million, the mean price would be misleadingly high. The median, however, would still reflect the "typical" home price because it isn't affected by that single extreme value.

The table below illustrates how an outlier dramatically affects the mean while leaving the median unchanged:

#align(center)[
  #uptoten-table(
    columns: 3,
    header: ("", "Without Outlier", "With Outlier"),
    [*Data Set*], [10, 20, 30, 40, 50], [10, 20, 30, 40, 200],
    [*Mean*], [$frac(150, 5) = 30$], [$frac(300, 5) = 60$],
    [*Median*], [30 (middle value)], [30 (middle value)],
    [*Effect*], [Mean = Median], [Mean doubled, Median unchanged],
  )
]


#example-box(breakable: true)[
  *Find the median of: 3, 7, 2, 9, 5*

  *Step 1:* Arrange in order: 2, 3, 5, 7, 9

  *Step 2:* Count is 5 (odd), so the median is the middle value.

  Position $= frac(5 + 1, 2) = 3$, so the median is the 3rd value.

  *Median $= 5$*

  *Find the median of: 3, 7, 2, 9, 5, 11*

  *Step 1:* Arrange in order: 2, 3, 5, 7, 9, 11

  *Step 2:* Count is 6 (even), so the median is the average of the 3rd and 4th values.

  $ "Median" = frac(5 + 7, 2) = 6 $
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

The *mode* is the value that appears most frequently in a data set. While often considered the simplest measure of central tendency, the mode has a unique property: it's the only measure that can be used with non-numerical (categorical) data.

#info-box[
  *Mode Characteristics:*

  A data set can have:
  - *No mode:* All values appear with equal frequency
  - *One mode (unimodal):* One value appears more frequently than all others
  - *Two modes (bimodal):* Two values tie for highest frequency
  - *Multiple modes (multimodal):* More than two values share the highest frequency
]

*When is the mode useful?* The mode is particularly helpful when you want to know the most common or popular value. For example, a shoe store wants to know the most common shoe size to stock; a restaurant wants to know the most frequently ordered dish.

#example-box[
  *Find the mode of: 3, 5, 3, 7, 3, 9, 5*

  Count each value:
  - 3 appears 3 times
  - 5 appears 2 times
  - 7 appears 1 time
  - 9 appears 1 time

  *Mode $= 3$* (appears most frequently)
]

The frequency of each value can be visualized as a bar chart, making the mode easy to identify as the tallest bar:

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Axes
    line((0, 0), (8, 0), stroke: 1pt)
    line((0, 0), (0, 4), stroke: 1pt)

    // Y-axis labels
    for i in range(1, 4) {
      line((-0.1, i), (0.1, i), stroke: 0.5pt)
      content((-0.4, i), text(size: 7pt)[#i])
    }
    content((-1.2, 2), text(size: 7pt)[Freq.])

    // Bars
    let bar_width = 1.2
    let gap = 0.5

    // Value 3: frequency 3 (mode)
    rect((gap, 0), (gap + bar_width, 3), fill: green.lighten(50%), stroke: green + 1pt)
    content((gap + bar_width/2, -0.4), text(size: 8pt)[3])
    content((gap + bar_width/2, 3.4), text(size: 7pt, fill: green.darken(20%), weight: "bold")[Mode])

    // Value 5: frequency 2
    rect((gap + bar_width + gap, 0), (gap + 2*bar_width + gap, 2), fill: blue.lighten(70%), stroke: blue + 1pt)
    content((gap + 1.5*bar_width + gap, -0.4), text(size: 8pt)[5])

    // Value 7: frequency 1
    rect((gap + 2*bar_width + 2*gap, 0), (gap + 3*bar_width + 2*gap, 1), fill: blue.lighten(70%), stroke: blue + 1pt)
    content((gap + 2.5*bar_width + 2*gap, -0.4), text(size: 8pt)[7])

    // Value 9: frequency 1
    rect((gap + 3*bar_width + 3*gap, 0), (gap + 4*bar_width + 3*gap, 1), fill: blue.lighten(70%), stroke: blue + 1pt)
    content((gap + 3.5*bar_width + 3*gap, -0.4), text(size: 8pt)[9])

    // X-axis label
    content((4, -1), text(size: 8pt)[Value])
  })
]

== Range

The *range* is the simplest measure of how spread out a data set is. It tells you the distance between the smallest and largest values.

#info-box[
  *Range Formula:*

  $ "Range" = "Maximum value" - "Minimum value" $

  The range gives a quick sense of data spread, but it's sensitive to outliers since it only considers the two extreme values.
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line
    line((0, 0), (12, 0), stroke: 1pt, mark: (end: ">"))

    // Tick marks
    for i in range(0, 12) {
      line((i, -0.1), (i, 0.1), stroke: 0.5pt)
      content((i, -0.4), text(size: 7pt)[#i])
    }

    // Data points: 2, 3, 5, 7, 9
    for val in (2, 3, 5, 7, 9) {
      circle((val, 0.4), radius: 0.12, fill: blue, stroke: none)
    }

    // Range bracket
    line((2, 0.9), (2, 1.2), stroke: purple + 1.5pt)
    line((2, 1.2), (9, 1.2), stroke: purple + 1.5pt)
    line((9, 0.9), (9, 1.2), stroke: purple + 1.5pt)

    // Labels
    content((2, 0.7), text(size: 7pt, fill: purple)[Min])
    content((9, 0.7), text(size: 7pt, fill: purple)[Max])
    content((5.5, 1.6), text(size: 8pt, fill: purple, weight: "bold")[Range $= 9 - 2 = 7$])
  })
]

#tip-box[
  *Mean vs. Median vs. Mode on GMAT:*

  - *Mean:* Use when you need to account for all values; affected by outliers
  - *Median:* Use when data has outliers or is skewed; resistant to extreme values
  - *Mode:* Use when you need the most common value; can handle categorical data
  - *Range:* Quick measure of spread; tells you nothing about values in between
]

#pagebreak()

= Standard Deviation

While measures of central tendency tell us where the "center" of our data lies, they don't tell us anything about how the values are distributed around that center. Two data sets can have the exact same mean but look completely different---one might have all values clustered tightly together, while another has values scattered widely. *Standard deviation* is the measure that captures this crucial information about spread or variability.

== Concept

Standard deviation answers the question: "On average, how far do values typically fall from the mean?" A small standard deviation indicates that most data points are close to the mean, suggesting consistency or uniformity. A large standard deviation indicates that data points are spread out over a wide range of values, suggesting high variability.

#info-box[
  *Standard Deviation (SD):* Measures how spread out values are from the mean.

  - Low SD: Values clustered near mean
  - High SD: Values spread far from mean

  *Note:* GMAT rarely requires calculating SD; focus on understanding the concept.
]

== Key Properties

Understanding how standard deviation behaves under transformations is essential for GMAT success. These properties follow logically from what SD measures---the spread of data around the mean.

#tip-box[
  *Standard Deviation Properties:*
  - Adding/subtracting a constant to all values: SD stays the same
  - Multiplying all values by a constant $k$: SD is multiplied by $|k|$
  - SD is always $>= 0$
  - SD $= 0$ only when all values are identical
]

*Why Adding a Constant Doesn't Change SD:* When you add (or subtract) the same number to every value in a data set, you're simply shifting the entire distribution along the number line. The mean shifts by the same amount, so the distances between each value and the mean remain exactly the same. Since SD measures these distances, it stays unchanged.

*Why Multiplying by a Constant Scales SD:* When you multiply every value by a constant $k$, you're stretching (or compressing) the entire distribution. If $k = 2$, for example, every value doubles, the mean doubles, and crucially, the distances from the mean also double. Therefore, the SD doubles as well. We use $|k|$ (absolute value) because multiplying by a negative number flips the data around the origin, but doesn't change how spread out it is.

#example-box[
  *Set A: {10, 20, 30, 40, 50} has SD $= 14.14$*

  *If we add 10 to each value: {20, 30, 40, 50, 60}*\
  New SD $= 14.14$ (unchanged)

  *If we multiply each by 2: {20, 40, 60, 80, 100}*\
  New SD $= 28.28$ (doubled)
]

The following table illustrates how different data sets can have the same mean but vastly different standard deviations:

#align(center)[
  #uptoten-table(
    columns: 4,
    header: ("Data Set", "Mean", "Standard Deviation", "Interpretation"),
    [{28, 29, 30, 31, 32}], [$30$], [$approx 1.58$], [Very consistent values],
    [{20, 25, 30, 35, 40}], [$30$], [$approx 7.07$], [Moderate spread],
    [{10, 20, 30, 40, 50}], [$30$], [$approx 14.14$], [Wide spread],
    [{30, 30, 30, 30, 30}], [$30$], [$0$], [No variation at all],
  )
]


The visualization below shows the difference between low and high standard deviation. Both distributions have the same mean (red line), but their spreads differ dramatically:

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

Many natural phenomena---such as heights, test scores, measurement errors, and biological traits---follow a pattern called the *normal distribution* (also known as the bell curve or Gaussian distribution). Understanding this distribution is crucial because it allows us to make precise statements about what percentage of data falls within certain ranges.

The normal distribution has two key parameters:
- *Mean ($mu$)*: The center of the distribution (where the peak occurs)
- *Standard Deviation ($sigma$)*: How spread out the distribution is (determines the width)

What makes the normal distribution special is that the relationship between standard deviation and percentages is always the same, regardless of what the actual values of $mu$ and $sigma$ are.

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

The table below summarizes the key percentages you need to memorize. Notice that the "tail" percentages (like 16% and 2.5%) come from the symmetry of the distribution---if 68% is in the middle, then 32% is outside, and half of that (16%) is on each side.

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

Let's work through some examples to see how these percentages are applied in practice:

#example-box(breakable: true)[
  *Test scores are normally distributed with mean $mu = 500$ and standard deviation $sigma = 100$. What percentage of scores fall between 400 and 600?*

  *Step 1:* Express the boundaries in terms of standard deviations from the mean.
  - $400 = 500 - 100 = mu - sigma$ (one SD below the mean)
  - $600 = 500 + 100 = mu + sigma$ (one SD above the mean)

  *Step 2:* Identify what region this represents.
  - The range from $400$ to $600$ spans from $mu - sigma$ to $mu + sigma$

  *Step 3:* Apply the empirical rule.
  - 68% of data falls within $mu plus.minus sigma$

  *Answer: 68%* of scores fall in this range.
]

#example-box(breakable: true)[
  *Using the same distribution ($mu = 500$, $sigma = 100$), what percentage of scores are above 700?*

  *Step 1:* Express 700 in terms of standard deviations from the mean.
  - $700 = 500 + 200 = 500 + 2(100) = mu + 2 sigma$

  *Step 2:* Use the empirical rule to find the percentage above this point.
  - From the rule: 95% of data is within $mu plus.minus 2 sigma$
  - Therefore, 5% is outside this range (100% - 95% = 5%)
  - By symmetry, this 5% is split equally between the two tails

  *Step 3:* Calculate the answer.
  - 2.5% is below $mu - 2 sigma$ (below 300)
  - 2.5% is above $mu + 2 sigma$ (above 700)

  *Answer: 2.5%* of scores are above 700.
]

#strategy-box[
  *Step-by-Step Approach for Normal Distribution Problems:*

  1. *Identify parameters:* Find the mean ($mu$) and standard deviation ($sigma$) given in the problem
  2. *Convert to SD units:* Express the target value(s) as "how many SDs from the mean" by calculating $frac("value" - mu, sigma)$
  3. *Apply the rule:* Use the 68-95-99.7 rule or the percentage table
  4. *Use symmetry:* The distribution is symmetric around the mean, so percentages on each side are equal
  5. *Check reasonableness:* Verify your answer makes sense (e.g., a value 2 SDs above mean should have only a small percentage above it)
]

#pagebreak()

= Part 3: Counting Methods

Counting methods answer a fundamental question: "In how many ways can something happen?" While this sounds simple, the challenge lies in counting systematically without missing possibilities or counting the same thing twice. The GMAT tests three main counting techniques: the fundamental counting principle, permutations, and combinations. Each applies to different situations, and knowing which one to use is often the key to solving these problems quickly.

== Fundamental Counting Principle

The fundamental counting principle is the foundation of all counting. It tells us how to count the total number of outcomes when we have a sequence of independent choices.

#info-box[
  *Fundamental Counting Principle:*

  If there are $m$ ways to do task 1 and $n$ ways to do task 2, there are $m times n$ ways to do both tasks.

  This extends to any number of tasks: $n_1 times n_2 times n_3 times ...$
]

*Why does multiplication work?* Think of it as a tree of possibilities. If you have 3 choices for the first decision and 4 choices for the second, then for *each* of those 3 first choices, you have 4 options, giving $3 times 4 = 12$ total paths through the tree.

#example-box(breakable: true)[
  *A restaurant offers 3 appetizers, 5 main courses, and 4 desserts. How many different 3-course meals are possible?*

  Each meal consists of three independent choices:
  - Choice 1: Appetizer (3 options)
  - Choice 2: Main course (5 options)
  - Choice 3: Dessert (4 options)

  By the fundamental counting principle:
  $ 3 times 5 times 4 = 60 " different meals" $
]

#tip-box[
  *When to Use the Counting Principle:*

  Use this method when you have a sequence of *independent* decisions where each decision has a fixed number of options. The key word is "and"---you need to choose an appetizer *and* a main course *and* a dessert.
]

== Permutations (Order Matters)

A *permutation* is an arrangement of items where the order matters. Think of it as assigning items to specific positions or slots. The word "arrangement" is your clue that you're dealing with a permutation.

Before we dive into the formula, let's understand *factorial notation*, which is essential for counting problems:

#info-box[
  *Factorial Notation:*

  $n!$ (read "n factorial") $= n times (n-1) times (n-2) times ... times 2 times 1$

  Examples:
  - $5! = 5 times 4 times 3 times 2 times 1 = 120$
  - $3! = 3 times 2 times 1 = 6$
  - $1! = 1$
  - $0! = 1$ (by definition)

  *Why is factorial useful?* It counts the number of ways to arrange $n$ distinct items in a row: the first position has $n$ choices, the second has $(n-1)$, and so on.
]

#info-box[
  *Permutation Formula:*

  The number of ways to arrange $r$ items selected from $n$ distinct items:
  $ P(n, r) = frac(n!, (n-r)!) $

  *Intuition:* You have $n$ choices for the first position, $(n-1)$ for the second, and so on, until you've filled $r$ positions.
]

#example-box(breakable: true)[
  *How many ways can 3 people be selected from 5 for President, VP, and Secretary?*

  Here, order matters because President, VP, and Secretary are different positions. Selecting Alice as President and Bob as VP is different from selecting Bob as President and Alice as VP.

  *Method 1: Using the formula*
  $ P(5, 3) = frac(5!, (5-3)!) = frac(5!, 2!) = frac(5 times 4 times 3 times 2 times 1, 2 times 1) = frac(120, 2) = 60 $

  *Method 2: Step-by-step reasoning (often faster)*
  - 5 choices for President
  - 4 remaining choices for VP
  - 3 remaining choices for Secretary
  $ 5 times 4 times 3 = 60 $
]

#tip-box[
  *Permutation Shortcut:*

  Instead of calculating the full factorial and dividing, just multiply the appropriate number of decreasing terms:
  - $P(n, r) = n times (n-1) times (n-2) times ... $ (exactly $r$ terms)

  For $P(5, 3)$: Start at 5 and multiply 3 terms: $5 times 4 times 3 = 60$
]

== Combinations (Order Doesn't Matter)

A *combination* is a selection of items where the order doesn't matter. Think of it as forming a group or set where the members have no assigned positions. The words "group," "committee," "team," or "choose" often signal a combination problem.

The key difference from permutations: in a combination, selecting {Alice, Bob, Charlie} is the *same* as selecting {Charlie, Alice, Bob}---it's the same group of people.

#info-box[
  *Combination Formula:*

  The number of ways to choose $r$ items from $n$ distinct items (order doesn't matter):
  $ C(n, r) = frac(n!, r! times (n-r)!) $

  Also written as $binom(n, r)$ or "$n$ choose $r$."

  *Relationship to permutations:*
  $ C(n, r) = frac(P(n, r), r!) $

  We divide by $r!$ because each combination of $r$ items can be arranged in $r!$ different orders, and we don't want to count those separately.
]

#example-box(breakable: true)[
  *How many ways can a committee of 3 be selected from 5 people?*

  Here, order doesn't matter. A committee of {Alice, Bob, Charlie} is the same as {Bob, Charlie, Alice}---they're the same committee.

  $ C(5, 3) = frac(5!, 3! times 2!) = frac(5 times 4 times 3 times 2 times 1, (3 times 2 times 1) times (2 times 1)) = frac(120, 6 times 2) = frac(120, 12) = 10 $

  *Alternative calculation:*
  $ C(5, 3) = frac(5 times 4 times 3, 3 times 2 times 1) = frac(60, 6) = 10 $
]

*Why is the combination count smaller than the permutation count?* For any group of 3 people, there are $3! = 6$ ways to arrange them in different orders. Permutations count each arrangement separately (60 total), while combinations count each group only once ($60 div 6 = 10$).

== Permutation vs. Combination: The Decision Test

The most common mistake in counting problems is using the wrong formula. Before calculating anything, you must determine whether order matters. Here's a systematic approach:

#warning-box[
  *The Swap Test:*

  Ask yourself: "If I swap two items, do I get a different outcome?"
  - *Yes, it's different* #sym.arrow *Permutation* (order matters)
  - *No, it's the same* #sym.arrow *Combination* (order doesn't matter)

  *Examples:*
  - Arranging books on a shelf: Swap two books #sym.arrow different arrangement #sym.arrow *Permutation*
  - Selecting committee members: Swap two members #sym.arrow same committee #sym.arrow *Combination*
  - Assigning 1st, 2nd, 3rd place: Swap 1st and 2nd #sym.arrow different result #sym.arrow *Permutation*
  - Choosing pizza toppings: Swap two toppings #sym.arrow same pizza #sym.arrow *Combination*
]

#uptoten-table(
  columns: 3,
  header: ("Scenario", "Order Matters?", "Use"),
  [Selecting a president, VP, and treasurer], [Yes---different roles], [Permutation],
  [Forming a 3-person committee], [No---just a group], [Combination],
  [Creating a 4-digit PIN code], [Yes---1234 $eq.not$ 4321], [Permutation],
  [Choosing 4 cards from a deck], [No---same hand], [Combination],
  [Ranking top 3 contestants], [Yes---1st $eq.not$ 2nd $eq.not$ 3rd], [Permutation],
  [Picking 3 fruits from a basket], [No---same selection], [Combination],
)

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

Some counting problems involve constraints or special conditions that require modified formulas. Here are the most important special cases:

=== Circular Arrangements

When arranging items in a circle, rotations of the same arrangement are considered identical. For example, if four people sit around a circular table, rotating everyone one seat clockwise gives the same seating arrangement (relative positions haven't changed).

#info-box[
  *Circular Arrangement Formula:*

  The number of ways to arrange $n$ distinct objects in a circle:
  $ (n-1)! $

  *Why $(n-1)!$ instead of $n!$?* We "fix" one person's position to eliminate rotational duplicates, then arrange the remaining $(n-1)$ people.
]

#example-box[
  *How many ways can 5 people sit around a circular table?*

  $ (5-1)! = 4! = 24 " arrangements" $

  Compare to a straight line: $5! = 120$ arrangements. The circular case has fewer because rotations don't count as different.
]

=== Arrangements with Identical Items

When some items are identical (indistinguishable), we must divide by the factorial of each group's size to avoid counting the same arrangement multiple times.

#info-box[
  *Formula for Arrangements with Repetition:*

  For $n$ total items where $a$ are identical of one type, $b$ are identical of another type, etc.:
  $ frac(n!, a! times b! times ...) $
]

#example-box(breakable: true)[
  *How many ways can the letters in "MISSISSIPPI" be arranged?*

  Count the letters: M(1), I(4), S(4), P(2) --- total 11 letters

  $ frac(11!, 1! times 4! times 4! times 2!) = frac(11!, 4! times 4! times 2!) = frac(39916800, 24 times 24 times 2) = frac(39916800, 1152) = 34650 $
]

#strategy-box[
  *Counting Methods Summary:*

  1. *Fundamental Counting Principle:* Multiply choices for independent sequential decisions
  2. *Permutation $P(n,r)$:* Arranging $r$ items from $n$ when order matters
  3. *Combination $C(n,r)$:* Choosing $r$ items from $n$ when order doesn't matter
  4. *Circular:* $(n-1)!$ for arranging in a circle
  5. *With repetition:* Divide $n!$ by the factorials of identical item counts
]

#pagebreak()

= Part 4: Probability

Probability quantifies uncertainty---it tells us how likely an event is to occur. While we use probability intuitively every day ("it's probably going to rain," "I'll likely get this job"), the GMAT requires precise calculation. Understanding probability rules allows you to break complex scenarios into simple, solvable steps.

== Basic Probability

At its core, probability is simply a ratio: the number of ways something can happen divided by the total number of possible outcomes. This assumes all outcomes are equally likely (like rolling a fair die or drawing from a well-shuffled deck).

#info-box[
  *Probability Formula:*

  $ P("event") = frac("Number of favorable outcomes", "Total number of possible outcomes") $

  *Key properties:*
  - Probability always ranges from 0 to 1 (or 0% to 100%)
  - $P = 0$ means impossible; $P = 1$ means certain
  - The probabilities of all possible outcomes must sum to 1
]

#example-box[
  *What is the probability of rolling a 4 on a fair six-sided die?*

  - Favorable outcomes: 1 (rolling a 4)
  - Total possible outcomes: 6 (rolling 1, 2, 3, 4, 5, or 6)

  $ P(4) = frac(1, 6) $
]

#example-box[
  *What is the probability of drawing a heart from a standard 52-card deck?*

  - Favorable outcomes: 13 (there are 13 hearts)
  - Total possible outcomes: 52 (total cards)

  $ P("heart") = frac(13, 52) = frac(1, 4) $
]

== Probability Rules

Most GMAT probability problems require combining events using standard rules. The key is recognizing which rule applies: "OR" (addition) vs "AND" (multiplication), and whether events are independent or dependent.

=== The Complement Rule

Sometimes it's easier to calculate the probability that something *doesn't* happen and subtract from 1.

#info-box[
  *Complement Rule:*

  $ P("not " A) = 1 - P(A) $

  The probability of an event NOT occurring equals 1 minus the probability it does occur.
]

#example-box[
  *What is the probability of NOT rolling a 6 on a fair die?*

  $ P("not " 6) = 1 - P(6) = 1 - frac(1, 6) = frac(5, 6) $
]

=== The Addition Rule (OR)

Use addition when you want the probability that *at least one* of several events occurs. The word "or" signals addition.

#info-box[
  *Addition Rule (OR):*

  *Mutually exclusive events* (cannot happen simultaneously):
  $ P(A "or" B) = P(A) + P(B) $

  *Non-exclusive events* (can happen simultaneously):
  $ P(A "or" B) = P(A) + P(B) - P(A "and" B) $

  We subtract $P(A "and" B)$ to avoid counting the overlap twice.
]

#example-box(breakable: true)[
  *What is the probability of rolling a 2 OR a 5 on a fair die?*

  These are mutually exclusive (you can't roll both 2 and 5 at once):
  $ P(2 "or" 5) = P(2) + P(5) = frac(1, 6) + frac(1, 6) = frac(2, 6) = frac(1, 3) $
]

#example-box(breakable: true)[
  *From a standard deck, what is P(heart OR face card)?*

  These are NOT mutually exclusive (there are face cards that are hearts):
  - $P("heart") = 13\/52$
  - $P("face card") = 12\/52$ (J, Q, K in each of 4 suits)
  - $P("heart AND face card") = 3\/52$ (J, Q, K of hearts)

  $ P("heart OR face") = frac(13, 52) + frac(12, 52) - frac(3, 52) = frac(22, 52) = frac(11, 26) $
]

=== The Multiplication Rule (AND)

Use multiplication when you want the probability that *all* of several events occur. The word "and" signals multiplication.

#info-box[
  *Multiplication Rule (AND):*

  *Independent events* (one doesn't affect the other):
  $ P(A "and" B) = P(A) times P(B) $

  *Dependent events* (one affects the other):
  $ P(A "and" B) = P(A) times P(B | A) $

  where $P(B|A)$ means "probability of B given that A has occurred."
]

== Independent vs. Dependent Events

One of the most important distinctions in probability is whether events are *independent* or *dependent*. This determines which multiplication formula to use.

#info-box[
  *Independent Events:*
  One event does NOT affect the probability of the other.

  Examples:
  - Flipping a coin twice (the first flip doesn't affect the second)
  - Rolling two dice
  - Drawing with replacement (the item is put back)

  *Dependent Events:*
  One event DOES affect the probability of the other.

  Examples:
  - Drawing cards without replacement
  - Selecting people from a group (once selected, they can't be selected again)
]

#tip-box[
  *How to Identify:*

  Ask: "Does the first event change what's available for the second event?"
  - *Yes* #sym.arrow Dependent (probabilities change)
  - *No* #sym.arrow Independent (probabilities stay the same)

  Key phrases:
  - "with replacement" #sym.arrow Independent
  - "without replacement" #sym.arrow Dependent
]

#example-box(breakable: true)[
  *A bag has 3 red and 2 blue balls. Two balls are drawn WITHOUT replacement. What is the probability that both are red?*

  This is a dependent event problem because after the first draw, the composition of the bag changes.

  *Step 1:* P(1st ball is red)
  $ P("1st red") = frac(3, 5) $
  (3 red balls out of 5 total)

  *Step 2:* P(2nd ball is red | 1st was red)
  After removing a red ball, we have 2 red and 2 blue remaining (4 total).
  $ P("2nd red" | "1st red") = frac(2, 4) = frac(1, 2) $

  *Step 3:* Multiply for "AND"
  $ P("both red") = frac(3, 5) times frac(1, 2) = frac(3, 10) $
]

#example-box(breakable: true)[
  *Same bag (3 red, 2 blue), but now balls are drawn WITH replacement. What is P(both red)?*

  This is an independent event problem because the ball is put back after each draw.

  $ P("1st red") = frac(3, 5) $
  $ P("2nd red") = frac(3, 5) $ (same as first, since ball was replaced)
  $ P("both red") = frac(3, 5) times frac(3, 5) = frac(9, 25) $

  Notice: $9\/25 > 3\/10$ because with replacement, there are more red balls available for the second draw.
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

"At least one" is one of the most common phrases in GMAT probability problems. It means "one or more"---which could be exactly one, exactly two, exactly three, and so on. Calculating each case separately would be tedious and error-prone. Fortunately, there's an elegant shortcut.

#strategy-box[
  *"At Least One" Strategy:*

  $ P("at least one") = 1 - P("none") $

  *Why this works:* "At least one" and "none" are complements---they cover all possibilities and don't overlap. The probability of "none" is typically much easier to calculate because it's a single scenario.
]

#example-box(breakable: true)[
  *A fair coin is flipped 3 times. What is the probability of getting at least one head?*

  *The hard way (don't do this):*
  "At least one head" means 1 head, 2 heads, or 3 heads---three separate cases to calculate.

  *The easy way (use complement):*
  $ P("at least one head") = 1 - P("no heads") $

  $P("no heads")$ means all tails:
  $ P("all tails") = frac(1, 2) times frac(1, 2) times frac(1, 2) = frac(1, 8) $

  Therefore:
  $ P("at least one head") = 1 - frac(1, 8) = frac(7, 8) $
]

#example-box(breakable: true)[
  *A quality control inspector tests 4 items. Each item has a 10% chance of being defective. What is the probability that at least one item is defective?*

  $ P("at least one defective") = 1 - P("no defectives") $

  $P("item is NOT defective") = 1 - 0.10 = 0.90$

  $P("all 4 items are NOT defective") = 0.90^4 = 0.6561$

  $ P("at least one defective") = 1 - 0.6561 = 0.3439 approx 34.4% $
]

#warning-box[
  *When to Use the Complement Strategy:*

  Use $P("at least one") = 1 - P("none")$ when:
  - The problem asks for "at least one" of something
  - The problem asks for "one or more"
  - Calculating the probability directly would require many cases

  This strategy saves significant time on the GMAT.
]

#pagebreak()

= Part 5: Expected Value

Expected value (EV) answers the question: "If I repeated this random process many times, what would be my average outcome?" It's a powerful concept that combines probability with outcomes to give a single number representing the "long-run average" result.

Expected value is particularly useful for evaluating decisions under uncertainty---like whether a game is fair, which option to choose when outcomes are uncertain, or whether an investment is worthwhile.

#info-box[
  *Expected Value Formula:*

  $ "EV" = sum ("probability" times "value") $

  For each possible outcome, multiply its probability by its value, then add all these products together.

  $ "EV" = P_1 times V_1 + P_2 times V_2 + P_3 times V_3 + ... $
]

*Key insight:* Expected value is essentially a weighted average where the weights are probabilities. Outcomes that are more likely contribute more to the expected value.

== Calculating Expected Value

#example-box(breakable: true)[
  *A game: Roll a fair die. Win \$10 if you roll a 6, lose \$2 otherwise. What is the expected value of playing this game?*

  *Step 1:* Identify all outcomes with their probabilities and values.

  #uptoten-table(
    columns: 3,
    header: ("Outcome", "Probability", "Value"),
    [Roll a 6], [$1\/6$], [+\$10],
    [Roll 1-5], [$5\/6$], [-\$2],
  )

  *Step 2:* Multiply each probability by its value and sum.
  $ "EV" = (frac(1, 6))(10) + (frac(5, 6))(-2) $
  $ "EV" = frac(10, 6) + frac(-10, 6) = frac(10 - 10, 6) = 0 $

  *Interpretation:* The expected value is \$0. This means the game is *fair*---on average, you neither win nor lose money over many plays.
]

== Interpreting Expected Value

#info-box[
  *What Expected Value Tells You:*

  - *EV > 0:* Favorable outcome on average (you expect to gain)
  - *EV < 0:* Unfavorable outcome on average (you expect to lose)
  - *EV = 0:* Fair or break-even (neutral long-term outcome)

  *Important:* EV represents the average over many trials. In any single trial, you won't necessarily get the expected value---you'll get one of the actual outcomes.
]

#example-box(breakable: true)[
  *A lottery ticket costs \$5. There's a 1% chance of winning \$200 and a 99% chance of winning nothing. Should you buy the ticket?*

  *Calculate the expected value of the net gain:*

  #uptoten-table(
    columns: 3,
    header: ("Outcome", "Probability", "Net Value"),
    [Win], [0.01], [\$200 - \$5 = +\$195],
    [Lose], [0.99], [\$0 - \$5 = -\$5],
  )

  $ "EV" = (0.01)(195) + (0.99)(-5) $
  $ "EV" = 1.95 - 4.95 = -3.00 $

  *Interpretation:* The expected value is -\$3.00. On average, you lose \$3 every time you buy a ticket. This is an unfavorable game in the long run.
]

#example-box(breakable: true)[
  *A company is deciding whether to launch a new product. Market research suggests:*
  - 30% chance of high success: profit of \$500,000
  - 50% chance of moderate success: profit of \$100,000
  - 20% chance of failure: loss of \$200,000

  *What is the expected profit?*

  $ "EV" = (0.30)(500000) + (0.50)(100000) + (0.20)(-200000) $
  $ "EV" = 150000 + 50000 - 40000 = 160000 $

  *Interpretation:* The expected profit is \$160,000. Based on expected value alone, launching the product is a favorable decision.
]

== Expected Value on the GMAT

#strategy-box[
  *GMAT Expected Value Approach:*

  1. *List all possible outcomes* with their probabilities and values
  2. *Verify probabilities sum to 1* (sanity check)
  3. *Multiply* each probability by its value
  4. *Sum* all the products
  5. *Interpret* the result in context

  *Common variations:*
  - Games of chance (dice, cards, coins)
  - Business decisions with uncertain outcomes
  - Insurance and risk assessment scenarios
]

#tip-box[
  *Quick Check:*

  Before calculating, estimate whether EV should be positive or negative:
  - If the most likely outcome is good, EV is probably positive
  - If the most likely outcome is bad, EV is probably negative
  - This helps catch calculation errors
]

#pagebreak()

= Part 6: GMAT Strategies

This section consolidates the most important shortcuts, recognition patterns, and time-saving techniques for statistics and probability questions on the GMAT. Master these strategies to solve problems more quickly and accurately.

== Statistics Shortcuts

=== Working with Averages

#tip-box[
  *The Sum-Average-Count Triangle:*

  $ "Sum" = "Average" times "Count" $

  This relationship is incredibly powerful. If you know any two values, you can find the third.
]

#example-box[
  *The average of 5 numbers is 20. What is their sum?*

  $ "Sum" = 20 times 5 = 100 $
]

#example-box[
  *The sum of 8 numbers is 200. What is their average?*

  $ "Average" = frac(200, 8) = 25 $
]

=== Adding or Removing Values

#info-box[
  *Effect of Adding a Value:*

  When you add a new value to a data set:
  - If new value $>$ old mean #sym.arrow mean increases
  - If new value $<$ old mean #sym.arrow mean decreases
  - If new value $=$ old mean #sym.arrow mean stays the same

  *Formula for new mean:*
  $ "New Mean" = frac("Old Sum" + "New Value", "Old Count" + 1) $
]

#example-box(breakable: true)[
  *A class of 20 students has an average score of 80. A new student joins with a score of 90. What is the new class average?*

  Old sum $= 80 times 20 = 1600$

  New sum $= 1600 + 90 = 1690$

  New mean $= frac(1690, 21) approx 80.48$

  The mean increased because the new score (90) was above the old mean (80).
]

=== Consecutive Integers

#tip-box[
  *Consecutive Integer Shortcut:*

  For any set of consecutive integers:
  - Mean $=$ Median $=$ Middle value (or average of two middle values)
  - Mean $= frac("First" + "Last", 2)$

  This also works for evenly spaced sequences (like 2, 4, 6, 8 or 5, 10, 15, 20).
]

#example-box[
  *What is the average of the integers from 1 to 99?*

  $ "Average" = frac(1 + 99, 2) = frac(100, 2) = 50 $

  No need to add all 99 numbers!
]

=== Weighted Average Position

#tip-box[
  *Weighted Average Intuition:*

  The weighted average is always *closer to the value with more weight*.

  If group A has weight 3 and average 60, and group B has weight 1 and average 100:
  - The overall average is *not* 80 (the simple midpoint)
  - It's closer to 60 because group A has more weight
  - Actual: $frac(3(60) + 1(100), 4) = frac(280, 4) = 70$
]

== Counting Shortcuts

=== Quick Recognition

#warning-box[
  *Identify the Problem Type First:*

  Before calculating, determine what type of counting problem you have:

  1. *Sequential choices?* #sym.arrow Multiply (Fundamental Counting Principle)
  2. *Arrangements with positions?* #sym.arrow Permutation
  3. *Groups without positions?* #sym.arrow Combination
  4. *Circular arrangement?* #sym.arrow $(n-1)!$
  5. *Repeated items?* #sym.arrow Divide by factorials of repeated counts
]

=== Factorial Shortcuts

#tip-box[
  *Simplifying Factorials:*

  Cancel common terms before multiplying:

  $ frac(10!, 8!) = frac(10 times 9 times 8!, 8!) = 10 times 9 = 90 $

  $ frac(n!, (n-2)!) = n times (n-1) $

  Never compute large factorials directly---always simplify first.
]

=== Combination Symmetry

#tip-box[
  *Combination Identity:*

  $ C(n, r) = C(n, n-r) $

  Choosing $r$ items to *include* is the same as choosing $(n-r)$ items to *exclude*.

  *Practical use:* $C(10, 8)$ is the same as $C(10, 2) = frac(10 times 9, 2) = 45$

  Much easier than computing $C(10, 8)$ directly!
]

== Probability Shortcuts

=== The Complement Strategy

#strategy-box[
  *When to Use Complements:*

  Use $P(A) = 1 - P("not " A)$ when:
  - "At least one" appears in the problem
  - "One or more" appears in the problem
  - Direct calculation would require many cases
  - The complement is simpler (often "none" or "all")
]

=== Probability Keywords

#uptoten-table(
  columns: 2,
  header: ("Keyword/Phrase", "Strategy"),
  ["at least one"], [Use complement: $1 - P("none")$],
  ["at most one"], [Calculate $P(0) + P(1)$],
  ["exactly one"], [Count all ways to get exactly one],
  ["and" / "both"], [Multiply probabilities],
  ["or" / "either"], [Add probabilities (subtract overlap if not exclusive)],
  ["with replacement"], [Events are independent],
  ["without replacement"], [Events are dependent---adjust probabilities],
  ["given that" / "if"], [Conditional probability---reduce sample space],
)

=== Quick Probability Checks

#tip-box[
  *Sanity Checks:*

  - All probabilities must be between 0 and 1
  - Probabilities of all outcomes must sum to 1
  - $P(A "and" B) <= P(A)$ and $P(A "and" B) <= P(B)$
  - $P(A "or" B) >= P(A)$ and $P(A "or" B) >= P(B)$

  If your answer violates any of these, you've made an error.
]

== Time Management Tips

#strategy-box[
  *Statistics & Probability Time Strategy:*

  1. *Read carefully:* Many errors come from misreading "and" vs "or," or missing "without replacement"

  2. *Identify the type:* Spend 5 seconds classifying the problem before calculating

  3. *Estimate first:* Have a rough sense of what the answer should be

  4. *Check for shortcuts:* Look for consecutive integers, complement strategies, or factorial cancellations

  5. *Verify the answer:* Does it make sense? Is the probability between 0 and 1? Is the count positive?
]

#warning-box[
  *Common GMAT Traps:*

  - Forgetting to account for "without replacement"
  - Using permutation when combination is needed (or vice versa)
  - Adding probabilities when you should multiply
  - Computing complicated factorials instead of simplifying
  - Confusing "at least one" with "exactly one"
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
