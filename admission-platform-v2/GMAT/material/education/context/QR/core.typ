#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Quantitative Reasoning - Core_],
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

#set text(
  font: "Arial",
  size: 11pt,
  lang: "en",
)

#set par(
  justify: true,
  leading: 0.65em,
)

#set heading(numbering: "1.")

// UpToTen Brand Colors
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

// Custom styled boxes
#let info-box(content) = box(
  fill: uptoten-blue.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let tip-box(content) = box(
  fill: uptoten-green.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let warning-box(content) = box(
  fill: uptoten-orange.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

#let example-box(content) = box(
  fill: gray.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  content
)

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("../../Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Quantitative Reasoning]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Core]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Advanced mathematical concepts and problem-solving techniques for the GMAT Quantitative Reasoning section.\
    \
    This guide covers word problems (rate, work, mixture), statistics, sets, counting methods, probability, estimation, and sequences.
  ]
  #v(2.5cm)
  #text(size: 10pt, fill: gray)[
    Via G. Frua 21/6, Milano | www.uptoten.it
  ]
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

= Rate, Work, and Mixture Problems

These word problem types appear frequently on the GMAT and follow consistent patterns.

== Rate Problems

=== The Fundamental Formula

#info-box[
  *Distance = Rate x Time*

  Or equivalently:
  - Rate = Distance / Time
  - Time = Distance / Rate
]

#example-box[
  *Example*: How many kilometers did a car travel in 4 hours at an average speed of 70 km/h?

  Distance = Rate x Time = $70 times 4 = 280$ km
]

=== Average Speed Problems

#warning-box[
  *Critical Concept*

  Average speed = Total Distance / Total Time

  *NOT* the average of the individual speeds!
]

#example-box[
  *Example*: On a 600 km trip, a car went half the distance at 60 km/h and the other half at 100 km/h. What was the average speed?

  *Step 1*: Find time for each half

  First 300 km: $300/60 = 5$ hours

  Second 300 km: $300/100 = 3$ hours

  *Step 2*: Calculate average speed

  Average speed = $600/(5 + 3) = 600/8 = 75$ km/h

  Note: This is NOT $(60 + 100)/2 = 80$ km/h!
]

#pagebreak()

=== Relative Speed Problems

When two objects move toward or away from each other:

#info-box[
  *Relative Speed Rules*

  - *Moving toward each other*: Add the speeds
  - *Moving away from each other*: Add the speeds
  - *Moving in same direction*: Subtract the speeds
]

#example-box[
  *Example*: Two trains 300 km apart travel toward each other at 60 km/h and 40 km/h. When will they meet?

  Combined speed = $60 + 40 = 100$ km/h

  Time to meet = $300/100 = 3$ hours
]

== Work Problems

=== The Work Formula

#info-box[
  *Basic Work Formula*

  If person A takes $r$ hours to complete a job, and person B takes $s$ hours to complete the same job, then working together they take $h$ hours, where:

  $ 1/r + 1/s = 1/h $

  Think of it as: (A's rate) + (B's rate) = (Combined rate)
]

#example-box[
  *Example*: Machine A takes 4 hours to make 1,000 bolts. Machine B takes 5 hours. How long do both machines working together take?

  $ 1/4 + 1/5 = 1/h $

  $ 5/20 + 4/20 = 1/h $

  $ 9/20 = 1/h $

  $ h = 20/9 = 2 2/9 $ hours
]

#pagebreak()

== Mixture Problems

=== Basic Mixture Problems

#example-box[
  *Example*: If 6 kg of nuts costing \$1.20/kg are mixed with 2 kg of nuts costing \$1.60/kg, what is the cost per kg of the mixture?

  Total cost = $6(1.20) + 2(1.60) = 7.20 + 3.20 = 10.40$

  Total weight = $6 + 2 = 8$ kg

  Cost per kg = $10.40/8 = 1.30$/kg
]

=== Mixture Problems with Percents

#example-box[
  *Example*: How many liters of a 15% salt solution must be added to 5 liters of an 8% salt solution to make a 10% salt solution?

  Let $n$ = liters of 15% solution needed

  *Set up equation*: Salt in 15% + Salt in 8% = Salt in mixture

  $ 0.15n + 0.08(5) = 0.10(n + 5) $

  $ 0.15n + 0.40 = 0.10n + 0.50 $

  $ 0.05n = 0.10 $

  $ n = 2 $ liters
]

#tip-box[
  *Mixture Problem Strategy*

  1. Identify what quantity is being "preserved" (salt, cost, etc.)
  2. Write an equation: Amount in Part 1 + Amount in Part 2 = Amount in Mixture
  3. Solve for the unknown
]

#pagebreak()

= Statistics

== Measures of Central Tendency

=== Mean (Average)

#info-box[
  *Mean Formula*

  $ "Mean" = ("Sum of all values")/("Number of values") $
]

#example-box[
  *Example*: Find the mean of 6, 4, 7, 10, 4

  Mean = $(6 + 4 + 7 + 10 + 4)/5 = 31/5 = 6.2$
]

=== Median

The *median* is the middle value when data is ordered.

- *Odd number of values*: The middle number
- *Even number of values*: Average of the two middle numbers

#example-box[
  *Example 1* (odd): Find the median of 6, 4, 7, 10, 4

  Order: 4, 4, 6, 7, 10

  Median = 6 (middle value)

  *Example 2* (even): Find the median of 4, 6, 6, 8, 9, 12

  Median = $(6 + 8)/2 = 7$
]

=== Mode

The *mode* is the value that occurs most frequently.

#example-box[
  *Example*: The mode of 1, 3, 6, 4, 3, 5 is *3* (occurs twice)
]

#pagebreak()

== Measures of Dispersion

=== Range

#info-box[
  *Range = Maximum value - Minimum value*
]

#example-box[
  *Example*: Range of 11, 10, 5, 13, 21 is $21 - 5 = 16$
]

=== Standard Deviation

*Standard deviation* measures how spread out values are from the mean.

#info-box[
  *Steps to Calculate Standard Deviation*

  1. Find the mean
  2. Find each value's difference from the mean
  3. Square each difference
  4. Find the average of the squared differences
  5. Take the square root
]

#example-box[
  *Example*: Find the standard deviation of 0, 7, 8, 10, 10 (mean = 7)

  #table(
    columns: (1fr, 1fr, 1fr),
    align: center,
    stroke: 0.5pt + gray,
    [$x$], [$x - 7$], [$(x - 7)^2$],
    [0], [$-7$], [49],
    [7], [0], [0],
    [8], [1], [1],
    [10], [3], [9],
    [10], [3], [9],
    [*Total*], [], [*68*],
  )

  Standard deviation = $sqrt(68/5) approx 3.7$
]

#pagebreak()

= Sets

== Basic Definitions

A *set* is a collection of elements. Sets are written with braces: $\{-5, 0, 1\}$

#info-box[
  *Notation*

  - $|S|$ = number of elements in set $S$ (cardinality)
  - $A union B$ = union (elements in $A$ or $B$ or both)
  - $A inter B$ = intersection (elements in both $A$ and $B$)
]

#example-box[
  *Examples*:
  - $\{3, 4\} union \{4, 5, 6\} = \{3, 4, 5, 6\}$
  - $\{3, 4\} inter \{4, 5, 6\} = \{4\}$
]

== The General Addition Rule

#info-box[
  *General Addition Rule for Sets*

  $ |A union B| = |A| + |B| - |A inter B| $

  If $A$ and $B$ are disjoint: $|A union B| = |A| + |B|$
]

#example-box[
  *Example*: Each of 25 students takes history, mathematics, or both. If 20 take history and 18 take mathematics, how many take both?

  Let $n$ = students taking both

  Using the addition rule:

  $ 25 = 20 + 18 - n $

  $ n = 38 - 25 = 13 $

  *13 students take both subjects.*
]

#pagebreak()

= Counting Methods

== The Multiplication Principle

#info-box[
  *Basic Multiplication Principle*

  If one choice can be made in $m$ ways and another independent choice in $n$ ways, then both choices can be made in $m times n$ ways.
]

#example-box[
  *Example*: A meal must include 1 entree (5 options) and 1 dessert (3 options).

  Total meals = $5 times 3 = 15$
]

== Factorials

#info-box[
  *Factorial Definition*

  For integer $n > 1$:
  $ n! = n times (n-1) times (n-2) times ... times 2 times 1 $

  Special cases: $0! = 1! = 1$
]

#example-box[
  *Examples*:
  - $3! = 3 times 2 times 1 = 6$
  - $4! = 4 times 3 times 2 times 1 = 24$
  - $5! = 120$
]

== Permutations and Combinations

A *permutation* is an ordered arrangement of elements.

A *combination* is a selection without regard to order.

#info-box[
  *Combination Formula*

  The number of ways to choose $k$ objects from $n$ objects:

  $ C(n, k) = binom(n, k) = n!/(k!(n-k)!) $
]

#example-box[
  *Example*: Choose 2 letters from $\{A, B, C, D, E\}$

  $C(5, 2) = 5!/(2! times 3!) = 120/(2 times 6) = 10$
]

#pagebreak()

= Probability

== Basic Definitions

*Probability* measures the likelihood of an event occurring.

#info-box[
  *Probability Range*

  For any event $E$:
  $ 0 <= P(E) <= 1 $

  - $P(E) = 0$: Event is impossible
  - $P(E) = 1$: Event is certain
]

== Equally Likely Outcomes

When all outcomes are equally likely:

$ P(E) = ("Number of outcomes in " E)/("Total number of possible outcomes") $

#example-box[
  *Example*: A fair 6-sided die is rolled. What is the probability of an odd number?

  Favorable outcomes: $\{1, 3, 5\}$ (3 outcomes)

  Total outcomes: 6

  $P("odd") = 3/6 = 1/2$
]

== Compound Events

#info-box[
  *Probability Rules*

  - *Complement*: $P("not " E) = 1 - P(E)$

  - *Addition Rule*: $P(A "or" B) = P(A) + P(B) - P(A "and" B)$

  - *If mutually exclusive*: $P(A "or" B) = P(A) + P(B)$
]

#pagebreak()

== Independent Events

Two events are *independent* if neither affects the other's probability.

#info-box[
  *Multiplication Rule for Independent Events*

  $ P(A "and" B) = P(A) times P(B) $
]

== Dependent Events

Events are *dependent* if one affects the other's probability.

#info-box[
  *General Multiplication Rule*

  $ P(A "and" B) = P(A | B) times P(B) $

  where $P(A | B)$ is the probability of $A$ given that $B$ occurs.
]

= Estimation

== Rounding

*Rounding* simplifies complex calculations by using nearby numbers with fewer digits.

#example-box[
  *Examples*:
  - Round 7651.4 to nearest hundred: 7700
  - Round 0.43248 to nearest thousandth: 0.432
]

#tip-box[
  *When to Use Estimation*

  - Answer choices are spread far apart
  - Exact calculation is too time-consuming
  - The question asks for an approximate value
  - You can eliminate obviously wrong answers
]

#pagebreak()

= Sequences and Series

== Sequences

A *sequence* is a function whose domain is positive integers.

Notation: $a_n$ represents the $n$th term.

*Arithmetic sequence*: Constant difference between terms

$a_n = a_1 + (n-1)d$ where $d$ is the common difference

*Geometric sequence*: Constant ratio between terms

$a_n = a_1 times r^(n-1)$ where $r$ is the common ratio

== Series

A *series* is the sum of a sequence's terms.

=== Sum of Arithmetic Series

$ S_n = n/2 (a_1 + a_n) = n/2 (2a_1 + (n-1)d) $

#example-box[
  *Example*: Sum of first 100 positive integers

  $S_(100) = 100/2 (1 + 100) = 50 times 101 = 5050$
]

#pagebreak()

= Problem-Solving Techniques

== Backsolving

Test answer choices in the original problem.

#tip-box[
  *When to Use Backsolving*

  - Numeric answer choices
  - Problem would require complex algebra
  - Start with middle value (choice C or B)
]

#example-box[
  *Example*: If $x^2 - 5x = 14$, find $x$.

  Choices: (A) -7 (B) -2 (C) 2 (D) 7 (E) 14

  Test (C): $2^2 - 5(2) = 4 - 10 = -6 != 14$ #sym.times

  Test (D): $7^2 - 5(7) = 49 - 35 = 14$ #sym.checkmark

  Answer: (D)
]

== Number Picking

Choose easy values for variables.

#tip-box[
  *When to Use Number Picking*

  - Variables in answer choices
  - Percent or ratio problems without specific numbers
  - Abstract relationships
]

#example-box[
  *Example*: If $x$ is increased by 25%, the result is what percent of $2x$?

  Pick $x = 100$

  Increased: $100 + 25 = 125$

  Percent of $2x$: $125/200 = 62.5%$
]

== Process of Elimination

Eliminate clearly wrong answers to improve odds.

#warning-box[
  Even eliminating one or two choices significantly improves your probability of guessing correctly if you need to move on.
]

#pagebreak()

= Summary

This Core guide has covered:

*Word Problems*:
- Rate problems and average speed
- Work problems with multiple workers/machines
- Mixture problems with percents

*Statistics*:
- Mean, median, mode
- Range and standard deviation

*Sets and Counting*:
- Set operations and Venn diagrams
- Multiplication principle
- Permutations and combinations

*Probability*:
- Basic probability and equally likely outcomes
- Independent and dependent events
- Compound probability rules

*Additional Topics*:
- Estimation and rounding
- Sequences and series
- Problem-solving techniques

Master these Core concepts before moving on to the Excellence guide, which covers advanced optimization strategies and time-saving techniques.
