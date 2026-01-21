#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Practice Set - Probability, Statistics & Combinations_],
        [
          #figure(
            image("../../../Logo.png", width: 2cm)
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

#let question-box(num, difficulty, content) = {
  let diff-color = if difficulty == "Easy" { uptoten-green } else if difficulty == "Medium" { uptoten-orange } else { rgb("#e53935") }
  box(
    stroke: 1pt + gray.lighten(50%),
    inset: 12pt,
    radius: 4pt,
    width: 100%,
    [
      #grid(
        columns: (auto, 1fr, auto),
        align: (left, center, right),
        [*Question #num*],
        [],
        [#box(fill: diff-color.lighten(80%), inset: 4pt, radius: 2pt)[#text(size: 9pt, fill: diff-color.darken(20%))[#difficulty]]]
      )
      #v(0.5em)
      #content
    ]
  )
}

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("../../../Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT Practice Set]
  #v(0.3em)
  #text(size: 20pt, weight: "bold", fill: uptoten-blue)[Probability, Statistics & Combinations]
  #v(0.5em)
  #text(size: 14pt, fill: uptoten-green)[Theory Review + 20 Practice Questions]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    This practice set covers three essential GMAT topics:\
    *Probability*, *Statistics*, and *Counting Methods (Combinations/Permutations)*\
    \
    Questions are arranged by difficulty: Easy, Medium, and Hard
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

      *Copyright & Distribution Notice:* This document is proprietary educational material of UpToTen. All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
    ]
  )
]

#pagebreak()

// = Theory Review

// == Statistics

// === Measures of Central Tendency

// #info-box[
//   *Mean (Arithmetic Average)*

//   $ "Mean" = ("Sum of all values")/("Number of values") $

//   If the average of $n$ numbers is $A$, then the sum of those numbers is $n times A$.
// ]

// #example-box[
//   *Example*: Find the mean of 6, 4, 7, 10, 4

//   Mean = $(6 + 4 + 7 + 10 + 4)/5 = 31/5 = 6.2$
// ]

// #info-box[
//   *Median*

//   The *median* is the middle value when data is ordered from least to greatest.

//   - *Odd number of values*: The middle number
//   - *Even number of values*: Average of the two middle numbers
// ]

// #example-box[
//   *Example 1* (odd): Find the median of 6, 4, 7, 10, 4

//   Ordered: 4, 4, 6, 7, 10 → Median = *6* (middle value)

//   *Example 2* (even): Find the median of 4, 6, 6, 8, 9, 12

//   Median = $(6 + 8)/2 = 7$
// ]

// #info-box[
//   *Mode*

//   The *mode* is the value that occurs most frequently.

//   A set can have no mode, one mode, or multiple modes.
// ]

// === Measures of Dispersion

// #info-box[
//   *Range*

//   Range = Maximum value − Minimum value
// ]

// #info-box[
//   *Standard Deviation*

//   Standard deviation measures how spread out values are from the mean.

//   *Key Properties*:
//   - Adding a constant to all values: Standard deviation *unchanged*
//   - Multiplying all values by a constant $k$: Standard deviation multiplied by $|k|$
// ]

// #pagebreak()

// == Counting Methods

// === The Multiplication Principle

// #info-box[
//   If one choice can be made in $m$ ways and another independent choice in $n$ ways, then both choices can be made in $m times n$ ways.
// ]

// #example-box[
//   *Example*: A meal includes 1 entree (5 options) and 1 dessert (3 options).

//   Total possible meals = $5 times 3 = 15$
// ]

// === Factorials

// #info-box[
//   *Definition*: For positive integer $n$:

//   $ n! = n times (n-1) times (n-2) times ... times 2 times 1 $

//   Special cases: $0! = 1$ and $1! = 1$
// ]

// === Permutations vs Combinations

// #tip-box[
//   *Permutations*: Order matters (arrangements)

//   $ P(n, k) = n!/(n-k)! $

//   *Combinations*: Order does NOT matter (selections)

//   $ C(n, k) = binom(n, k) = n!/(k!(n-k)!) $
// ]

// #example-box[
//   *Example*: Choose 2 letters from {A, B, C, D, E}

//   *If order matters* (permutation): $P(5,2) = 5!/3! = 20$ arrangements

//   *If order doesn't matter* (combination): $C(5,2) = 5!/(2! times 3!) = 10$ selections
// ]

// #warning-box[
//   *Key Question to Ask*: Does the order of selection matter?

//   - Selecting a committee of 3 → *Combination* (order doesn't matter)
//   - Arranging people in a line → *Permutation* (order matters)
//   - Creating a 4-digit code → *Permutation* (order matters)
// ]

// #pagebreak()

// == Probability

// === Basic Definitions

// #info-box[
//   *Probability Range*: For any event $E$:

//   $ 0 <= P(E) <= 1 $

//   - $P(E) = 0$: Event is impossible
//   - $P(E) = 1$: Event is certain
// ]

// === Calculating Probability

// #info-box[
//   *Equally Likely Outcomes*

//   $ P(E) = ("Number of favorable outcomes")/("Total number of possible outcomes") $
// ]

// #example-box[
//   *Example*: A fair 6-sided die is rolled. What is P(odd number)?

//   Favorable outcomes: {1, 3, 5} → 3 outcomes

//   Total outcomes: 6

//   $P("odd") = 3/6 = 1/2$
// ]

// === Probability Rules

// #info-box[
//   *Complement Rule*

//   $ P("not " E) = 1 - P(E) $

//   *Addition Rule* (OR)

//   $ P(A "or" B) = P(A) + P(B) - P(A "and" B) $

//   If $A$ and $B$ are *mutually exclusive*: $P(A "or" B) = P(A) + P(B)$

//   *Multiplication Rule* (AND)

//   For *independent* events: $P(A "and" B) = P(A) times P(B)$

//   For *dependent* events: $P(A "and" B) = P(A) times P(B | A)$
// ]

// #tip-box[
//   *Strategy Tip*

//   When a problem asks for "at least one," it's often easier to calculate:

//   $P("at least one") = 1 - P("none")$
// ]

// #pagebreak()

= Practice Questions

== Statistics Questions

#question-box(1, "Easy")[
  During a trip that they took together, Carmen, Juan, Maria, and Rafael drove an average (arithmetic mean) of 80 miles each. Carmen drove 72 miles, Juan drove 78 miles, and Maria drove 83 miles. How many miles did Rafael drive?

  #v(0.5em)
  (A) 80 #h(2em) (B) 82 #h(2em) (C) 85 #h(2em) (D) 87 #h(2em) (E) 89
]

#v(1em)

#question-box(2, "Easy")[
  Five batches of 100 nails each are taken from a production line. The numbers of defective nails in the first four batches are 2, 4, 3, and 5, respectively. If the fifth batch has either 1, 2, or 6 defective nails, for which of these values does the average (arithmetic mean) number of defective nails per batch for the five batches equal the median number of defective nails for the five batches?

  I. 1 #h(2em) II. 2 #h(2em) III. 6

  #v(0.5em)
  (A) I only #h(1em) (B) II only #h(1em) (C) III only #h(1em) (D) I and III only #h(1em) (E) I, II, and III
]

#v(1em)

#question-box(3, "Easy")[
  List $S$ consists of 10 consecutive odd integers, and list $T$ consists of 5 consecutive even integers. If the least integer in $S$ is 7 more than the least integer in $T$, how much greater is the average (arithmetic mean) of the integers in $S$ than the average of the integers in $T$?

  #v(0.5em)
  (A) 2 #h(2em) (B) 7 #h(2em) (C) 8 #h(2em) (D) 12 #h(2em) (E) 22
]

#v(1em)

#question-box(4, "Medium")[
  The table shows the distribution of the number of absences from a Math class. For students who had at least 1 absence, what was the median number of absences?

  #table(
    columns: (auto, auto),
    align: center,
    stroke: 0.5pt + gray,
    [*Number of Absences*], [*Number of Students*],
    [0], [4],
    [1], [3],
    [2], [10],
    [3], [3],
    [4], [5],
    [5 or more], [3],
  )

  #v(0.5em)
  (A) 1.5 #h(2em) (B) 2 #h(2em) (C) 2.5 #h(2em) (D) 3 #h(2em) (E) 3.5
]

#pagebreak()

#question-box(5, "Medium")[
  A manufacturer makes and sells 2 products, P and Q. The revenue from the sale of each unit of P is \$20.00 and the revenue from the sale of each unit of Q is \$17.00. Last year the manufacturer sold twice as many units of Q as P. What was the manufacturer's average (arithmetic mean) revenue per unit sold of these 2 products last year?

  #v(0.5em)
  (A) \$28.50 #h(1em) (B) \$27.00 #h(1em) (C) \$19.00 #h(1em) (D) \$18.50 #h(1em) (E) \$18.00
]

#v(1em)

#question-box(6, "Medium")[
  If the positive number $d$ is the standard deviation of $n$, $k$, and $p$, then the standard deviation of $n + 1$, $k + 1$, and $p + 1$ is

  #v(0.5em)
  (A) $d + 3$ #h(1em) (B) $d + 1$ #h(1em) (C) $6d$ #h(1em) (D) $3d$ #h(1em) (E) $d$
]

#v(1em)

#question-box(7, "Hard")[
  If $Q$ is an odd number and the median of $Q$ consecutive integers is 120, what is the largest of these integers?

  #v(0.5em)
  (A) $frac(Q - 1, 2) + 120$ #h(1em) (B) $frac(Q, 2) + 199$ #h(1em) (C) $frac(Q, 2) + 120$ #h(1em) (D) $frac(Q + 119, 2)$ #h(1em) (E) $frac(Q + 120, 2)$
]

#v(1em)

#question-box(8, "Hard")[
  For each student in a certain class, a teacher adjusted the student's test score using the formula $y = 0.8x + 20$, where $x$ is the student's original test score and $y$ is the student's adjusted test score. If the standard deviation of the original test scores of the students in the class was 20, what was the standard deviation of the adjusted test scores?

  #v(0.5em)
  (A) 12 #h(2em) (B) 16 #h(2em) (C) 28 #h(2em) (D) 36 #h(2em) (E) 40
]

#pagebreak()

== Probability Questions

#question-box(9, "Easy")[
  In the graduating class of a certain college, 48 percent of the students identify as male and 52 percent as female. In this class, 40 percent of male students and 20 percent of female students are 25 years old or older. If one student is randomly selected, approximately what is the probability that the student will be less than 25 years old?

  #v(0.5em)
  (A) 0.90 #h(2em) (B) 0.70 #h(2em) (C) 0.45 #h(2em) (D) 0.30 #h(2em) (E) 0.25
]

#v(1em)

#question-box(10, "Easy")[
  In a certain board game, a stack of 48 cards, 8 of which represent a single share of stock, are shuffled and then placed face down. If the first 2 cards selected do not represent shares of stock, what is the probability that the third card selected will represent a share of stock?

  #v(0.5em)
  (A) $frac(1, 8)$ #h(2em) (B) $frac(1, 6)$ #h(2em) (C) $frac(1, 5)$ #h(2em) (D) $frac(3, 23)$ #h(2em) (E) $frac(4, 23)$
]

#v(1em)

#question-box(11, "Easy")[
  In a set of 24 cards, each card is numbered with a different positive integer from 1 to 24. One card will be drawn at random from the set. What is the probability that the card drawn will have either a number that is divisible by both 2 and 3 or a number that is divisible by 7?

  #v(0.5em)
  (A) $frac(3, 24)$ #h(2em) (B) $frac(4, 24)$ #h(2em) (C) $frac(7, 24)$ #h(2em) (D) $frac(8, 24)$ #h(2em) (E) $frac(17, 24)$
]

#v(1em)

#question-box(12, "Medium")[
  The sides of each of two plastic cubes are numbered 1 through 6, and each number is equally likely to appear face up after either cube is rolled. What is the probability that after the two cubes are rolled, the sum of the two numbers appearing face up will be greater than 9?

  #v(0.5em)
  (A) $frac(1, 6)$ #h(2em) (B) $frac(1, 5)$ #h(2em) (C) $frac(1, 4)$ #h(2em) (D) $frac(5, 18)$ #h(2em) (E) $frac(1, 3)$
]

#pagebreak()

#question-box(13, "Medium")[
  On Saturday morning, Malachi will begin a camping vacation, and he will return home at the end of the first day on which it rains. If on the first three days of the vacation the probability of rain on each day is 0.2, what is the probability that Malachi will return home at the end of the day on the following Monday?

  #v(0.5em)
  (A) 0.008 #h(1em) (B) 0.128 #h(1em) (C) 0.488 #h(1em) (D) 0.512 #h(1em) (E) 0.640
]

#v(1em)

#question-box(14, "Hard")[
  The probability that event $M$ will NOT occur is 0.8 and the probability that event $R$ will NOT occur is 0.6. If events $M$ and $R$ CANNOT both occur, which of the following is the probability that either event $M$ or event $R$ will occur?

  #v(0.5em)
  (A) $frac(1, 5)$ #h(2em) (B) $frac(2, 5)$ #h(2em) (C) $frac(3, 5)$ #h(2em) (D) $frac(4, 5)$ #h(2em) (E) $frac(12, 25)$
]

#v(1em)

#question-box(15, "Hard")[
  In a box of 12 pens, a total of 3 are defective. If a customer buys 2 pens selected at random from the box, what is the probability that neither pen will be defective?

  #v(0.5em)
  (A) $frac(1, 6)$ #h(2em) (B) $frac(2, 9)$ #h(2em) (C) $frac(6, 11)$ #h(2em) (D) $frac(9, 16)$ #h(2em) (E) $frac(3, 4)$
]

#v(1em)

#question-box(16, "Hard")[
  Xavier, Yvonne, and Zelda each try independently to solve a problem. If their individual probabilities for success are $frac(1, 4)$, $frac(1, 2)$, and $frac(5, 8)$, respectively, what is the probability that Xavier and Yvonne, but not Zelda, will solve the problem?

  #v(0.5em)
  (A) $frac(11, 8)$ #h(2em) (B) $frac(7, 8)$ #h(2em) (C) $frac(9, 64)$ #h(2em) (D) $frac(5, 64)$ #h(2em) (E) $frac(3, 64)$
]

#pagebreak()

== Counting/Combinations Questions

#question-box(17, "Medium")[
  If each of the 12 teams participating in a certain tournament plays exactly one game with each of the other teams, how many games will be played?

  #v(0.5em)
  (A) 144 #h(2em) (B) 132 #h(2em) (C) 66 #h(2em) (D) 33 #h(2em) (E) 23
]

#v(1em)

#question-box(18, "Hard")[
  Clarissa will create her summer reading list by randomly choosing 4 books from the 10 books approved for summer reading. She will list the books in the order in which they are chosen. How many different lists are possible?

  #v(0.5em)
  (A) 6 #h(2em) (B) 40 #h(2em) (C) 210 #h(2em) (D) 5,040 #h(2em) (E) 151,200
]

#v(1em)

#question-box(19, "Hard")[
  A three-digit code for certain locks uses the digits 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 according to the following constraints. The first digit cannot be 0 or 1, the second digit must be 0 or 1, and the second and third digits cannot both be 0 in the same code. How many different codes are possible?

  #v(0.5em)
  (A) 144 #h(2em) (B) 152 #h(2em) (C) 160 #h(2em) (D) 168 #h(2em) (E) 176
]

#v(1em)

#question-box(20, "Hard")[
  There are 8 books on a shelf, of which 2 are paperbacks and 6 are hardbacks. How many possible selections of 4 books from this shelf include at least one paperback?

  #v(0.5em)
  (A) 40 #h(2em) (B) 45 #h(2em) (C) 50 #h(2em) (D) 55 #h(2em) (E) 60
]

#pagebreak()

= Answer Key

#table(
  columns: (auto, auto, auto, auto, auto),
  align: center,
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Q*], [*Answer*], [*Q*], [*Answer*], [*Topic*],
  [1], [D], [11], [C], [Statistics / Probability],
  [2], [D], [12], [A], [Statistics / Probability],
  [3], [D], [13], [B], [Statistics / Probability],
  [4], [B], [14], [C], [Statistics / Probability],
  [5], [E], [15], [C], [Statistics / Probability],
  [6], [E], [16], [E], [Statistics / Probability],
  [7], [A], [17], [C], [Statistics / Counting],
  [8], [B], [18], [D], [Statistics / Counting],
  [9], [B], [19], [B], [Probability / Counting],
  [10], [E], [20], [D], [Probability / Counting],
)

#v(2em)

#info-box[
  *Question Distribution by Difficulty*

  - *Easy* (Questions 1-3, 9-11): 6 questions
  - *Medium* (Questions 4-6, 12-13, 17): 6 questions
  - *Hard* (Questions 7-8, 14-16, 18-20): 8 questions
]

#v(1em)

#tip-box[
  *Study Tips*

  1. For *Statistics*: Practice calculating mean, median, and mode quickly. Remember that adding a constant doesn't change standard deviation.

  2. For *Probability*: Always identify whether events are independent or dependent. Use the complement rule when calculating "at least one."

  3. For *Counting*: Ask yourself "Does order matter?" to decide between permutations and combinations.
]
