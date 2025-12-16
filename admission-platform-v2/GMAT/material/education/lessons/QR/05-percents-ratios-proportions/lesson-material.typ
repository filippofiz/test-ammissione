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

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Lesson Overview

*Topic:* Percents, Ratios & Proportions\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-05 (Final QR topic)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Convert between fractions, decimals, and percentages fluently
2. Calculate percent of a number and find the whole from a percentage
3. Compute percent increase and decrease correctly, avoiding common traps
4. Set up and solve proportion problems using cross-multiplication
5. Work with ratios, including combining ratios and part-to-whole conversions
6. Apply scale factors correctly to linear, area, and volume problems
7. Perform unit conversions using dimensional analysis

== GMAT Relevance

Percents, ratios, and proportions appear in approximately *15-20% of Quantitative Reasoning questions*, making this one of the most frequently tested topic areas. These concepts also appear heavily in Data Insights questions, particularly in graphs, tables, and data interpretation scenarios.

What makes this topic particularly important:
- *High frequency:* You will almost certainly see multiple questions on these topics
- *Foundation for other topics:* Percent and ratio reasoning underlies many word problems, profit/loss questions, and mixture problems
- *Error-prone:* The GMAT specifically designs questions to exploit common misconceptions (like adding successive percent changes)
- *Time-sensitive:* Knowing shortcuts can save significant time on test day

#pagebreak()

= Percentages - Fundamentals

Percentages are one of the most practical mathematical concepts---we encounter them daily in sales tax, discounts, interest rates, and statistics. The word "percent" literally means "per hundred" (from Latin *per centum*), so a percentage is simply a way of expressing a number as a fraction of 100.

== Percent Basics

Understanding how to convert between fractions, decimals, and percentages is fundamental. These are three different ways of expressing the same value---for example, $1/2$, $0.5$, and $50%$ all represent the same quantity.

#info-box[
  *Percent means "per hundred":*

  $ 25% = frac(25, 100) = 0.25 $

  This means 25% is 25 parts out of 100, or one quarter of the whole.
]

#info-box[
  *Conversion Rules:*

  - *Fraction → Decimal:* Divide numerator by denominator
    - Example: $3/4 = 3 div 4 = 0.75$

  - *Decimal → Percent:* Multiply by 100 (move decimal 2 places right)
    - Example: $0.75 times 100 = 75%$

  - *Percent → Decimal:* Divide by 100 (move decimal 2 places left)
    - Example: $75% div 100 = 0.75$

  - *Fraction → Percent:* First convert to decimal, then to percent
    - Example: $3/4 arrow 0.75 arrow 75%$
]

#example-box[
  *Convert $3/8$ to a percent:*

  Step 1 (Fraction → Decimal): $3 div 8 = 0.375$

  Step 2 (Decimal → Percent): $0.375 times 100 = 37.5%$

  Therefore, $3/8 = 37.5%$
]

== Common Percent Equivalents

Memorizing these common equivalents will save significant time on the GMAT. Rather than calculating $1/8$ as a percent each time, instant recognition that $1/8 = 12.5%$ allows you to move quickly through problems.

#align(center)[
  #uptoten-table(
    columns: 3,
    header: ("Fraction", "Decimal", "Percent"),
    [$1\/2$], [0.5], [50%],
    [$1\/3$], [0.333...], [33.33%],
    [$2\/3$], [0.666...], [66.67%],
    [$1\/4$], [0.25], [25%],
    [$3\/4$], [0.75], [75%],
    [$1\/5$], [0.2], [20%],
    [$2\/5$], [0.4], [40%],
    [$3\/5$], [0.6], [60%],
    [$4\/5$], [0.8], [80%],
    [$1\/8$], [0.125], [12.5%],
    [$1\/10$], [0.1], [10%],
    [$1\/6$], [0.1666...], [16.67%],
  )
]

#tip-box[
  *Pattern Recognition:*

  - Fifths are easy: $1\/5 = 20%$, so each additional fifth adds 20%
  - Eighths: $1\/8 = 12.5%$, $3\/8 = 37.5%$, $5\/8 = 62.5%$, $7\/8 = 87.5%$
  - Thirds: Recognize $33.33%$ and $66.67%$---these appear frequently
]

== Finding a Percent of a Number

When you see "What is X% of Y?", the word "of" indicates multiplication. Convert the percent to a decimal first, then multiply.

#info-box[
  *The Percent Equation:*

  $ "Part" = "Percent" (italic("as decimal")) times "Whole" $

  The "Part" is the portion you're finding, and the "Whole" is the total amount you're taking a percentage of.
]

#example-box(breakable: true)[
  *What is 35% of 80?*

  Step 1: Convert percent to decimal: $35% = 0.35$

  Step 2: Multiply by the whole: $0.35 times 80 = 28$

  *Answer:* 35% of 80 is 28.

  *Meaning:* If you have 80 items and take 35% of them, you get 28 items.
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
  *Mental Math Shortcut:*

  To find 35% of 80 quickly:
  - 10% of 80 = 8
  - 30% of 80 = 24 (multiply by 3)
  - 5% of 80 = 4 (half of 10%)
  - 35% of 80 = 24 + 4 = 28

  Breaking percentages into 10%, 5%, and 1% chunks makes mental calculation faster.
]

== Finding the Whole from a Part

Sometimes you know the part and the percentage, but need to find the whole. This requires rearranging the percent equation: if Part = Percent × Whole, then Whole = Part ÷ Percent.

#info-box[
  *Three Types of Percent Problems:*

  Every percent problem asks you to find one of three things:

  1. *Find the Part:* "What is 25% of 60?"
    - You know the percent and the whole, find the part
    - Calculation: $0.25 times 60 = 15$

  2. *Find the Percent:* "15 is what percent of 60?"
    - You know the part and the whole, find the percent
    - Calculation: $frac(15, 60) = 0.25 = 25%$

  3. *Find the Whole:* "15 is 25% of what number?"
    - You know the part and the percent, find the whole
    - Calculation: $frac(15, 0.25) = 60$
]

#example-box(breakable: true)[
  *If 42 students represent 30% of a class, how many students are in the whole class?*

  We know: Part = 42, Percent = 30% = 0.30

  We need: Whole = ?

  Rearranging: $"Whole" = frac("Part", "Percent") = frac(42, 0.30) = 140$

  *Answer:* The class has 140 students.

  *Check:* $30% times 140 = 0.30 times 140 = 42$ ✓
]

#strategy-box[
  *The "IS over OF" Method:*

  A helpful way to set up any percent problem is to identify:
  - *"IS"* = the part (the number that comes after "is")
  - *"OF"* = the whole (the number that comes after "of")

  Then set up: $ frac("IS", "OF") = frac("Percent", 100) $

  *Example:* "15 is 25% of what?"
  - IS = 15, Percent = 25, OF = unknown ($x$)
  - Setup: $frac(15, x) = frac(25, 100)$
  - Cross-multiply: $15 times 100 = 25 times x$
  - Solve: $x = frac(1500, 25) = 60$
]

#pagebreak()

= Percent Change

Percent change measures how much a quantity has increased or decreased relative to its original value. When a store advertises "30% off" or a news report says "prices rose 5%," they're describing percent change. This is one of the most error-prone topics on the GMAT because it's easy to use the wrong base or to add successive changes incorrectly.

== Percent Increase/Decrease

The key to percent change is remembering that it's always calculated relative to the *original* value, not the new value. The original value is always your denominator---this is the "base" of the percent change.

#info-box[
  *Percent Change Formula:*

  $ "Percent Change" = frac("New" - "Original", "Original") times 100% $

  Or equivalently:
  $ "Percent Change" = frac("Change", "Original") times 100% $

  - If the result is positive → percent increase
  - If the result is negative → percent decrease

  *Remember:* The denominator is always the *starting* value (what you're changing FROM).
]

#example-box(breakable: true)[
  *A price increases from \$80 to \$100. What is the percent increase?*

  Step 1: Identify Original and New values
  - Original = \$80 (starting price)
  - New = \$100 (ending price)

  Step 2: Calculate the change
  - Change = New − Original = \$100 − \$80 = \$20

  Step 3: Divide by Original and convert to percent
  $ "Percent increase" = frac(20, 80) times 100% = 0.25 times 100% = 25% $

  *The price increased by 25%.*
]

#warning-box[
  *Critical Trap: The Base Matters!*

  The percent increase FROM A to B $eq.not$ percent decrease FROM B to A

  This is one of the GMAT's favorite traps. When a value goes up and then comes back down (or vice versa), the percentages are different because the base changes.

  *Example:*
  - \$80 → \$100: $frac(20, 80) = 25%$ increase (base is 80)
  - \$100 → \$80: $frac(20, 100) = 20%$ decrease (base is 100)

  Both changes involve a \$20 difference, but the percentages differ because you divide by different bases!
]

#example-box(breakable: true)[
  *A stock price drops from \$50 to \$40, then rises back to \$50. What was the percent decrease? The percent increase?*

  *First change (\$50 → \$40):*
  - Original = \$50, New = \$40, Change = \$10
  - Percent decrease: $frac(10, 50) times 100% = 20%$ decrease

  *Second change (\$40 → \$50):*
  - Original = \$40, New = \$50, Change = \$10
  - Percent increase: $frac(10, 40) times 100% = 25%$ increase

  *Key insight:* Even though the stock returned to its original price, the percentages are different. It takes a *larger* percent increase (25%) to recover from a percent decrease (20%). This is because the base is smaller after the decrease.
]

== Multiplier Method

The multiplier method is the most efficient way to handle percent changes, especially when there are multiple successive changes. Instead of calculating the change and then adding or subtracting, you multiply by a single factor that represents the entire operation.

The logic is simple: if you have 100% of something and add 20%, you now have 120%, or 1.20 times the original. If you remove 20%, you have 80%, or 0.80 times the original.

#strategy-box[
  *Multiplier Rules:*

  - *Increase by $x%$:* Multiply by $(1 + frac(x, 100))$
    - Example: 15% increase → multiply by $1 + 0.15 = 1.15$

  - *Decrease by $x%$:* Multiply by $(1 - frac(x, 100))$
    - Example: 15% decrease → multiply by $1 - 0.15 = 0.85$
]

#align(center)[
  #uptoten-table(
    columns: 2,
    header: ("Percent Change", "Multiplier"),
    [10% increase], [$times 1.10$],
    [10% decrease], [$times 0.90$],
    [20% increase], [$times 1.20$],
    [20% decrease], [$times 0.80$],
    [25% increase], [$times 1.25$],
    [25% decrease], [$times 0.75$],
    [50% increase], [$times 1.50$],
    [50% decrease], [$times 0.50$],
  )
]

#tip-box[
  *Memorize the common multipliers above.* On the GMAT, recognizing that "25% decrease" means "multiply by 0.75" saves valuable time.
]

#example-box(breakable: true)[
  *A price of \$200 increases by 15%, then decreases by 10%. What is the final price?*

  Step 1: Convert each percent change to a multiplier
  - 15% increase → multiplier of 1.15
  - 10% decrease → multiplier of 0.90

  Step 2: Multiply the original by both multipliers
  $ \$200 times 1.15 times 0.90 = \$200 times 1.035 = \$207 $

  *Final price: \$207*

  *Interpretation:* The combined multiplier is 1.035, which means a net 3.5% increase overall (since $1.035 = 1 + 0.035$). Notice this is NOT simply 15% − 10% = 5%.
]

== Successive Percent Changes

This is where most students make mistakes. When you have multiple percent changes in sequence, you *cannot* simply add or subtract the percentages. Each subsequent percent change applies to the *new* value, not the original.

#warning-box[
  *Critical Rule: Percent Changes Do NOT Add!*

  Increase by 20% then decrease by 20% $eq.not$ 0% change

  *Why?* The second percentage applies to a different base (the already-changed value). The 20% decrease is taken from the larger, increased amount.
]

#example-box(breakable: true)[
  *A salary increases by 20%, then decreases by 20%. What is the net percent change?*

  *Method 1: Using multipliers (recommended)*

  $1.20 times 0.80 = 0.96$

  Since 0.96 = 1 − 0.04, this represents a *4% decrease* overall (not 0%!).

  *Method 2: Verification with actual numbers*

  - Start with \$100
  - After 20% increase: $\$100 times 1.20 = \$120$
  - After 20% decrease: $\$120 times 0.80 = \$96$
  - Net change: $frac(96-100, 100) = -4%$ (4% decrease)

  *Why isn't it 0%?* The 20% decrease is applied to \$120, not \$100. So you're losing 20% of a bigger number than you gained.
]

#tip-box[
  *Quick Formula for Two Successive Changes:*

  For successive changes of $a%$ and $b%$:

  $ "Net multiplier" = (1 + frac(a, 100)) times (1 + frac(b, 100)) $

  Or approximately: Net change $approx a + b + frac(a times b, 100)$

  The extra $frac(a times b, 100)$ term is why simply adding doesn't work---it accounts for the "percent of a percent" effect.
]

#example-box(breakable: true)[
  *A product's price increases by 10% one year and 20% the next. What is the total percent increase?*

  *Using multipliers:*
  $ 1.10 times 1.20 = 1.32 $

  Total increase = 32% (not 30%)

  *Using the approximation formula:*
  $ 10 + 20 + frac(10 times 20, 100) = 10 + 20 + 2 = 32% checkmark $

  The extra 2% comes from the 20% increase being applied to the already-increased price.
]

#pagebreak()

= Ratios

A ratio compares the relative sizes of two or more quantities. Unlike absolute measurements, ratios tell us how quantities relate to each other. For example, knowing a recipe uses flour and sugar in a 3:1 ratio tells us we need three times as much flour as sugar, regardless of how much we're making.

== Ratio Basics

A ratio expresses how many times one quantity contains another. When we say the ratio of boys to girls is 3:2, we mean for every 3 boys, there are 2 girls---or equivalently, there are 1.5 times as many boys as girls.

#info-box[
  *Ratio:* A comparison of two or more quantities.

  *Notation:* A ratio can be written as:
  - $a:b$ (colon notation) — most common on GMAT
  - $a\/b$ or $frac(a, b)$ (fraction notation)
  - "a to b" (verbal form)

  *Key Point:* Ratios compare *relative* amounts, not actual values. A ratio of 3:5 could represent 3 and 5, or 30 and 50, or 300 and 500---any pair of numbers in that proportion.
]

#info-box[
  *Simplifying Ratios:*

  Like fractions, ratios should be reduced to lowest terms by dividing all parts by their greatest common factor (GCF):
  - $12:8 = 3:2$ (divide both by 4)
  - $15:25:10 = 3:5:2$ (divide all by 5)
  - $0.5:1.5 = 1:3$ (multiply both by 2 to eliminate decimals)

  *Important:* Always express ratios in whole numbers in lowest terms.
]

== Working with Ratios

The key to solving ratio problems is understanding that ratios represent "parts." If the ratio of boys to girls is 3:5, think of boys as occupying 3 equal parts and girls occupying 5 equal parts. Each "part" represents the same quantity---we just don't know what that quantity is until we're given more information.

#strategy-box[
  *The "Parts" Method for Ratio Problems:*

  1. Identify what each quantity equals in terms of "parts" from the ratio
  2. Use the given information to find the value of 1 part
  3. Calculate the unknown quantity using its number of parts

  This method is often faster than setting up proportions and cross-multiplying.
]

#example-box(breakable: true)[
  *The ratio of boys to girls is 3:5. If there are 24 boys, how many girls are there?*

  *Method 1: Using the "parts" approach (recommended)*

  - Boys = 3 parts, Girls = 5 parts
  - We know boys = 24, so: 3 parts = 24
  - Therefore: 1 part = $24 div 3 = 8$
  - Girls = 5 parts = $5 times 8 = 40$ girls

  *Method 2: Using proportions*

  Set up proportion: $frac("boys", "girls") = frac(3, 5) = frac(24, x)$

  Cross-multiply: $3x = 5 times 24 = 120$

  Solve: $x = 40$ girls
]

== Part-to-Whole Ratios

A common GMAT task is converting a part-to-part ratio to a part-to-whole ratio. The ratio 2:3 tells us how two parts relate to *each other*, but we often need to know what fraction each is of the *total*.

#info-box[
  *Converting Part-to-Part to Part-to-Whole:*

  If the ratio of $A:B = 3:5$, then:
  - Total parts = $3 + 5 = 8$
  - A is $frac(3, 8)$ of total (part-to-whole)
  - B is $frac(5, 8)$ of total (part-to-whole)

  *General rule:* Each part's fraction of the whole = $frac("its parts", "sum of all parts")$
]

#warning-box[
  *Common Mistake:* Don't confuse part-to-part with part-to-whole!

  If the ratio of boys to girls is 3:5:
  - Part-to-part: Boys are $frac(3, 5)$ of girls (60% as many)
  - Part-to-whole: Boys are $frac(3, 8)$ of total students (37.5%)

  Read carefully to determine which type the question asks for.
]

#example-box(breakable: true)[
  *The ratio of red to blue marbles is 2:3. What fraction of the marbles are red? If there are 45 marbles total, how many are red?*

  Step 1: Find total parts
  - Total parts = $2 + 3 = 5$

  Step 2: Find fraction of red (part-to-whole)
  - Red fraction = $frac(2, 5) = 40%$

  Step 3: Apply to actual total
  - If total = 45: Red marbles = $frac(2, 5) times 45 = 18$

  *Check:* Blue = $frac(3, 5) times 45 = 27$, and $18 + 27 = 45$ ✓
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

Sometimes you're given two separate ratios that share a common term, and you need to combine them into a single ratio. The key is to make the shared term the same value in both ratios.

#strategy-box[
  *Method for Combining Ratios:*

  Given $A:B = m:n$ and $B:C = p:q$:

  1. Find the LCM of the two values for B (that's $n$ and $p$)
  2. Scale each ratio so that B has this common value
  3. Combine into a single ratio $A:B:C$

  This works because ratios can be multiplied by any constant without changing their meaning.
]

#example-box(breakable: true)[
  *If $A:B = 2:3$ and $B:C = 4:5$, what is $A:B:C$? What is $A:C$?*

  Step 1: Identify the shared term
  - B = 3 in the first ratio, B = 4 in the second ratio

  Step 2: Find LCM of 3 and 4
  - LCM(3, 4) = 12

  Step 3: Scale each ratio so B = 12
  - $A:B = 2:3$ → multiply by 4 → $A:B = 8:12$
  - $B:C = 4:5$ → multiply by 3 → $B:C = 12:15$

  Step 4: Combine
  - $A:B:C = 8:12:15$
  - Therefore $A:C = 8:15$
]

#tip-box[
  *Quick Check:* After combining ratios, verify the individual ratios still hold. In the example above: $8:12 = 2:3$ ✓ and $12:15 = 4:5$ ✓
]

#pagebreak()

= Proportions

A proportion is an equation stating that two ratios are equal. Proportions are the mathematical tool we use when we know that two quantities maintain a constant relationship, and we want to find an unknown value. For example, if a map scale tells us that 1 inch represents 50 miles, we can use a proportion to find how many miles 3.5 inches represents.

== Setting Up Proportions

The key to solving proportion problems is setting up the equation correctly. Both sides of the equation must compare the same types of quantities in the same order.

#info-box[
  *Proportion:* An equation stating two ratios are equal.

  $ frac(a, b) = frac(c, d) $

  *Solving by Cross-Multiplication:*

  When $frac(a, b) = frac(c, d)$, then $a times d = b times c$

  This works because multiplying both sides by $b times d$ eliminates both denominators.
]

#strategy-box[
  *Setting Up Proportions Correctly:*

  1. Identify what quantities are being compared
  2. Set up both ratios with the *same units in the same position*
  3. Use a variable for the unknown
  4. Cross-multiply and solve

  *Correct setup:* $frac("miles", "hours") = frac("miles", "hours")$ or $frac("part", "whole") = frac("part", "whole")$

  *Incorrect setup:* $frac("miles", "hours") = frac("hours", "miles")$ (units don't match!)
]

#example-box(breakable: true)[
  *A car travels 150 miles in 3 hours. At the same rate, how far will it travel in 5 hours?*

  Step 1: Identify the relationship (distance and time at constant speed)

  Step 2: Set up the proportion with matching units
  $ frac("miles", "hours") = frac("miles", "hours") $
  $ frac(150, 3) = frac(x, 5) $

  Step 3: Cross-multiply
  $ 150 times 5 = 3 times x $
  $ 750 = 3x $

  Step 4: Solve
  $ x = 250 "miles" $

  *Check:* The rate is $150 div 3 = 50$ mph. In 5 hours: $50 times 5 = 250$ miles ✓
]

== Direct vs. Inverse Proportion

Not all proportional relationships work the same way. Understanding whether quantities are directly or inversely proportional is crucial for setting up the correct equation. Getting this wrong is one of the most common errors on GMAT proportion problems.

#info-box[
  *Direct Proportion:* As one quantity increases, the other increases by the same factor.

  If you double one quantity, the other doubles too. The ratio between them stays constant.

  $ frac(y, x) = k quad "or equivalently" quad y = k x $

  *Examples:*
  - More items purchased → Higher total cost (at fixed price per item)
  - More hours worked → More distance traveled (at constant speed)
  - Larger recipe batch → More of each ingredient needed
]

#info-box[
  *Inverse Proportion:* As one quantity increases, the other decreases proportionally.

  If you double one quantity, the other is cut in half. The *product* of the two quantities stays constant.

  $ x times y = k quad "or equivalently" quad y = frac(k, x) $

  *Examples:*
  - More workers → Less time to complete a job (same total work)
  - Faster speed → Less time to cover a distance
  - Wider pipe → Lower water pressure (same flow rate)
]

#warning-box[
  *How to Identify Which Type:*

  Ask yourself: "If I increase one quantity, does the other go up or down?"

  - If they move in the *same direction* → Direct proportion (use $frac(a, b) = frac(c, d)$)
  - If they move in *opposite directions* → Inverse proportion (use $a times b = c times d$)
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

#example-box(breakable: true)[
  *If 3 workers can complete a task in 12 days, how many days will it take 4 workers?*

  Step 1: Identify the relationship

  More workers means less time needed (they move in opposite directions), so this is *inverse proportion*. The total amount of work stays constant.

  Step 2: Set up the equation

  For inverse proportion, the product stays constant:
  $ "workers" times "days" = k $
  $ 3 times 12 = 4 times d $

  Step 3: Solve
  $ 36 = 4d $
  $ d = 9 "days" $

  *Check:* Total work = 3 workers × 12 days = 36 worker-days. With 4 workers: 36 ÷ 4 = 9 days ✓
]

#example-box(breakable: true)[
  *A recipe calls for 2 cups of flour to make 24 cookies. How much flour is needed for 60 cookies?*

  Step 1: Identify the relationship

  More cookies means more flour (they move in the same direction), so this is *direct proportion*.

  Step 2: Set up the proportion
  $ frac("flour", "cookies") = frac("flour", "cookies") $
  $ frac(2, 24) = frac(x, 60) $

  Step 3: Cross-multiply and solve
  $ 2 times 60 = 24 times x $
  $ 120 = 24x $
  $ x = 5 "cups of flour" $
]

== Scale Factors

When two figures are *similar* (same shape, different size), all corresponding lengths are related by a constant multiplier called the scale factor. Understanding how scale factors affect different measurements is essential for geometry problems involving similar figures.

#info-box[
  *Scale Factor:* The multiplier $k$ relating corresponding lengths in similar figures.

  The critical insight is that different types of measurements scale differently:

  - *Linear measurements* (length, width, height, perimeter) scale by $k$
  - *Area measurements* (surface area, cross-section) scale by $k^2$
  - *Volume measurements* scale by $k^3$

  This happens because area involves two dimensions (length × width), and volume involves three dimensions (length × width × height).
]

#example-box(breakable: true)[
  *Two similar rectangles have sides in ratio 2:3. If the smaller has area 20, what is the larger's area?*

  Step 1: Find the scale factor

  The sides are in ratio 2:3, so the scale factor from smaller to larger is $k = frac(3, 2) = 1.5$

  Step 2: Apply the area scaling rule

  Since area scales by $k^2$:
  $ "Area ratio" = k^2 = (frac(3, 2))^2 = frac(9, 4) $

  Step 3: Calculate the larger area
  $ "Larger area" = 20 times frac(9, 4) = frac(180, 4) = 45 $

  *Answer:* The larger rectangle has area 45.
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

#example-box(breakable: true)[
  *Two similar cubes have edges in ratio 1:2. If the smaller cube has volume 8 cubic inches, what is the volume of the larger cube?*

  Step 1: Identify the scale factor
  - Scale factor $k = frac(2, 1) = 2$

  Step 2: Apply volume scaling (cube the scale factor)
  - Volume scales by $k^3 = 2^3 = 8$

  Step 3: Calculate the larger volume
  - Larger volume = $8 times 8 = 64$ cubic inches

  *Why does volume scale by $k^3$?* If each edge doubles, then the volume becomes $2 times 2 times 2 = 8$ times larger.
]

#warning-box[
  *Common Mistake:* Students often forget to square the scale factor for area problems or cube it for volume problems.

  *Memory aid:*
  - Linear (1D) → $k^1$ = $k$
  - Area (2D) → $k^2$
  - Volume (3D) → $k^3$

  The exponent matches the number of dimensions!
]

#pagebreak()

= Unit Conversions

Unit conversion problems require you to express a quantity in different units while preserving its actual value. The key technique is called *dimensional analysis*, which uses the fact that multiplying by a cleverly chosen form of "1" changes the units without changing the value.

== Conversion Strategy

The fundamental principle is that any conversion factor can be written as a fraction equal to 1. For example, since 1 foot = 12 inches, we can write $frac("12 inches", "1 foot") = 1$. Multiplying by this fraction changes feet to inches without changing the actual length.

#strategy-box[
  *Dimensional Analysis Method:*

  1. Start with the quantity you want to convert
  2. Multiply by conversion factor(s) written as fractions
  3. Arrange fractions so unwanted units cancel out
  4. The remaining units should be your target units

  *Key insight:* Units behave like algebraic variables---they can be cancelled when they appear in both numerator and denominator.
]

#example-box(breakable: true)[
  *Convert 5 miles to feet.*

  We know that 1 mile = 5,280 feet. Set up the conversion so "miles" cancels:

  $ 5 cancel("miles") times frac(5280 "feet", 1 cancel("mile")) = 5 times 5280 "feet" = 26400 "feet" $

  The "miles" unit cancels out because it appears in both the numerator (from 5 miles) and the denominator (from the conversion factor), leaving only "feet."
]

#example-box(breakable: true)[
  *Convert 45 miles per hour to feet per second.*

  This requires multiple conversion factors. We need to convert miles → feet and hours → seconds.

  $ 45 frac(cancel("miles"), cancel("hour")) times frac(5280 "feet", 1 cancel("mile")) times frac(1 cancel("hour"), 60 cancel("min")) times frac(1 cancel("min"), 60 "sec") $

  $ = 45 times frac(5280, 60 times 60) frac("feet", "sec") = 45 times frac(5280, 3600) frac("feet", "sec") = 66 frac("feet", "sec") $

  *Tip:* For speed conversions, remember that mph × $frac(22, 15)$ ≈ feet per second (useful shortcut).
]

== Common Conversions

These are the unit relationships most likely to appear on the GMAT. You don't need to memorize obscure conversions---the test will provide any unusual conversion factors you need.

#align(center)[
  #uptoten-table(
    columns: 2,
    header: ("Category", "Conversions"),
    "Length", "1 mile = 5,280 feet; 1 yard = 3 feet; 1 foot = 12 inches",
    "Time", "1 hour = 60 min; 1 minute = 60 sec; 1 day = 24 hours",
    "Volume", "1 gallon = 4 quarts; 1 quart = 2 pints; 1 pint = 2 cups",
    "Mass", "1 pound = 16 ounces; 1 ton = 2,000 pounds",
  )
]

#tip-box[
  *Memory Aids:*

  - *5,280 feet in a mile:* "Five tomatoes" sounds like "5-2-8-0"
  - *Cups → Pints → Quarts → Gallons:* Each step multiplies by 2 (2 cups = 1 pint, 2 pints = 1 quart, 4 quarts = 1 gallon)
  - *Time:* 60-60-24 (seconds per minute, minutes per hour, hours per day)
]

== Converting Rates and Compound Units

When converting rates (like speed or density), you may need to convert both the numerator and denominator units. Apply dimensional analysis to each part separately.

#example-box(breakable: true)[
  *A car's fuel efficiency is 30 miles per gallon. Express this in feet per quart.*

  Convert miles → feet (multiply by 5,280) and gallons → quarts (divide by 4):

  $ 30 frac("miles", "gallon") = 30 frac(cancel("miles"), cancel("gallon")) times frac(5280 "feet", 1 cancel("mile")) times frac(1 cancel("gallon"), 4 "quarts") $

  $ = frac(30 times 5280, 4) frac("feet", "quart") = frac(158400, 4) frac("feet", "quart") = 39600 frac("feet", "quart") $
]

#warning-box[
  *GMAT Note:* Metric conversions (meters, liters, grams) are rarely tested. Focus on US customary units. If a metric conversion is needed, the problem will provide the conversion factor.
]

#pagebreak()

= GMAT Strategies

This section consolidates the most effective test-taking strategies for percent, ratio, and proportion problems. Mastering these techniques will help you solve problems faster and avoid the traps that the GMAT deliberately sets.

== Picking Numbers for Percent Problems

One of the most powerful strategies for percent problems is choosing convenient numbers that make calculations simple. Since percent problems often ask about relationships rather than specific values, you can pick numbers that work well with the percentages involved.

#strategy-box[
  *The "Pick 100" Strategy:*

  When a problem involves percentages without specifying actual values, start with 100 as your base number. This works because:

  - 100 is the natural base for percentages (percent = per hundred)
  - Calculating X% of 100 simply gives you X
  - The final answer will directly show the percent change

  *When to use it:* Problems asking "what percent" or "what is the net change" without giving specific starting values.
]

#example-box(breakable: true)[
  *If a price increases by 20%, then decreases by 25%, what is the net percent change?*

  Step 1: Pick a starting value
  - Choose 100 (makes percent calculations easy)

  Step 2: Apply each change sequentially
  - After 20% increase: $100 times 1.20 = 120$
  - After 25% decrease: $120 times 0.75 = 90$

  Step 3: Calculate net change from original
  - Net change: $frac(90 - 100, 100) = frac(-10, 100) = -10%$

  *Answer:* 10% decrease

  *Why this works:* Since we started with 100, our final value of 90 directly tells us we're at 90% of original, meaning a 10% decrease.
]

#tip-box[
  *Picking Numbers for Ratios:*

  For ratio problems, pick numbers that are multiples of the ratio parts. If the ratio is 3:5, use 30 and 50 (or 3 and 5 if simple enough). This avoids fractions in your calculations.
]

== The "Percent Of" vs. "Percent More/Less Than" Distinction

This is one of the most common sources of confusion on the GMAT. The test deliberately uses language that can be misinterpreted.

#info-box[
  *Critical Language Distinction:*

  - *"A is 25% of B"* means $A = 0.25 times B$
    - A is smaller than B (A is one quarter of B)

  - *"A is 25% more than B"* means $A = B + 0.25 times B = 1.25 times B$
    - A is larger than B

  - *"A is 25% less than B"* means $A = B - 0.25 times B = 0.75 times B$
    - A is smaller than B
]

#example-box(breakable: true)[
  *If John's salary is 20% more than Mary's salary of \$50,000, what is John's salary?*

  This says "20% *more than*" --- so we add 20% to Mary's salary.

  John's salary $= \$50,000 times 1.20 = \$60,000$

  *Common mistake:* Calculating 20% of \$50,000 = \$10,000 and stopping there. That's just the difference, not John's salary.
]

#example-box(breakable: true)[
  *If A is 25% less than B, then B is what percent more than A?*

  Step 1: Express the relationship
  - A = 0.75B (A is 25% less than B)

  Step 2: Solve for B in terms of A
  - $B = frac(A, 0.75) = frac(4A, 3) approx 1.333A$

  Step 3: Calculate how much more B is than A
  - B is $frac(4, 3) - 1 = frac(1, 3) approx 33.3%$ more than A

  *Key insight:* If A is 25% less than B, B is NOT 25% more than A. The bases are different!
]

== Common GMAT Percent Traps

The GMAT deliberately designs questions to exploit common misconceptions. Being aware of these traps helps you avoid them.

#warning-box[
  *Trap #1: Wrong Base for Percent Change*

  Always identify what the "original" or "base" value is. The base is what you're taking a percentage OF.

  *Example trap:* "A \$100 item is marked up 50%, then discounted 50%. What's the final price?"
  - Wrong thinking: 50% up then 50% down = back to \$100
  - Correct: $\$100 times 1.50 = \$150$, then $\$150 times 0.50 = \$75$
]

#warning-box[
  *Trap #2: Adding Successive Percent Changes*

  Never add percent changes directly. Always multiply the multipliers.

  *Example trap:* "Increase by 10% then 20%" does NOT equal 30% increase.
  - Correct: $1.10 times 1.20 = 1.32$ = 32% increase
]

#warning-box[
  *Trap #3: Confusing Part-to-Part with Part-to-Whole*

  Read carefully whether the question asks about a ratio between two parts or a part's share of the total.

  *Example trap:* "Boys to girls ratio is 2:3. What fraction are boys?"
  - Wrong: $frac(2, 3)$ (that's boys to girls, not boys to total)
  - Correct: $frac(2, 5)$ (boys are 2 out of 5 total parts)
]

#warning-box[
  *Trap #4: Inverse Proportion Setup*

  For inverse proportion (more of one means less of the other), the product stays constant---not the ratio.

  *Example trap:* "4 workers take 6 days. How long for 3 workers?"
  - Wrong setup: $frac(4, 6) = frac(3, x)$ → $x = 4.5$ days
  - Correct setup: $4 times 6 = 3 times x$ → $x = 8$ days
]

== Quick Mental Math Techniques

Speed matters on the GMAT. These shortcuts can save valuable time.

#tip-box[
  *Percent Shortcuts:*

  - *10% of anything:* Move decimal one place left ($10% "of" 250 = 25$)
  - *5% of anything:* Half of 10% ($5% "of" 250 = 12.5$)
  - *1% of anything:* Move decimal two places left ($1% "of" 250 = 2.5$)
  - *25% of anything:* Divide by 4 ($25% "of" 80 = 20$)
  - *33.3% of anything:* Divide by 3 ($33.3% "of" 90 = 30$)
  - *50% of anything:* Divide by 2 ($50% "of" 80 = 40$)

  *Building complex percentages:* 35% = 30% + 5% = 3×(10%) + (half of 10%)
]

#tip-box[
  *Ratio Shortcuts:*

  - If ratio is $a:b$, the total is $a + b$ parts
  - To find actual values, find "1 part" first, then multiply
  - For combining ratios, find the LCM of the common term
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
