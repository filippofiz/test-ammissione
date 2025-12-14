#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Practice Set - Quantitative Reasoning (All Topics)_],
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
  #text(size: 20pt, weight: "bold", fill: uptoten-blue)[Quantitative Reasoning - All Topics]
  #v(0.5em)
  #text(size: 14pt, fill: uptoten-green)[Comprehensive Review: 20 Practice Questions]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    This practice set covers all major Quantitative Reasoning topics:\
    *Arithmetic*: Statistics, Probability, Percents, Ratios, Rate Problems, Number Properties\
    *Algebra*: Linear Equations, Quadratic Equations, Inequalities, Exponents, Sequences\
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

= Practice Questions

== Arithmetic Questions

#question-box(1, "Easy")[
  City X has a population 4 times as great as the population of City Y, which has a population twice as great as the population of City Z. What is the ratio of the population of City X to the population of City Z?

  #v(0.5em)
  (A) 1:8 #h(2em) (B) 1:4 #h(2em) (C) 2:1 #h(2em) (D) 4:1 #h(2em) (E) 8:1
]

#v(1em)

#question-box(2, "Easy")[
  The table shows the numbers of packages shipped daily by each of five companies during a 4-day period. The standard deviation of the numbers of packages shipped daily during the period was greatest for which of the five companies?

  #table(
    columns: (auto, auto, auto, auto, auto),
    align: center,
    stroke: 0.5pt + gray,
    [], [*Mon*], [*Tue*], [*Wed*], [*Thu*],
    [*A*], [45], [55], [50], [50],
    [*B*], [10], [30], [30], [10],
    [*C*], [34], [28], [28], [30],
    [*D*], [39], [42], [41], [38],
    [*E*], [50], [60], [60], [70],
  )

  #v(0.5em)
  (A) A #h(2em) (B) B #h(2em) (C) C #h(2em) (D) D #h(2em) (E) E
]

#v(1em)

#question-box(3, "Easy")[
  Each week, a clothing salesperson receives a commission equal to 15 percent of the first \$500 in sales and 20 percent of all additional sales that week. What commission would the salesperson receive on total sales for the week of \$1,300?

  #v(0.5em)
  (A) \$195 #h(2em) (B) \$227 #h(2em) (C) \$235 #h(2em) (D) \$260 #h(2em) (E) \$335
]

#v(1em)

#question-box(4, "Easy")[
  Bouquets are to be made using white tulips and red tulips, and the ratio of the number of white tulips to the number of red tulips is to be the same in each bouquet. If there are 15 white tulips and 85 red tulips available for the bouquets, what is the greatest number of bouquets that can be made using all the tulips available?

  #v(0.5em)
  (A) 3 #h(2em) (B) 5 #h(2em) (C) 8 #h(2em) (D) 10 #h(2em) (E) 13
]

#pagebreak()

#question-box(5, "Medium")[
  If the mass of 1 cubic centimeter of a certain substance is 7.3 grams, what is the mass, in kilograms, of 1 cubic meter of this substance? (1 cubic meter = 1,000,000 cubic centimeters; 1 kilogram = 1,000 grams)

  #v(0.5em)
  (A) 0.0073 #h(1em) (B) 0.73 #h(1em) (C) 7.3 #h(1em) (D) 7,300 #h(1em) (E) 7,300,000
]

#v(1em)

#question-box(6, "Medium")[
  Each person who attended a company meeting was either a stockholder in the company, an employee of the company, or both. If 62 percent of those who attended the meeting were stockholders and 47 percent were employees, what percent were stockholders who were NOT employees?

  #v(0.5em)
  (A) 34% #h(2em) (B) 38% #h(2em) (C) 45% #h(2em) (D) 53% #h(2em) (E) 62%
]

#v(1em)

#question-box(7, "Medium")[
  Sam has \$800 in his account. He will deposit \$1 in his account one week from now, \$2 two weeks from now, and each week thereafter he will deposit an amount that is \$1 greater than the amount that he deposited one week before. If there are no other transactions, how much money will Sam have in his account 50 weeks from now?

  #v(0.5em)
  (A) \$850 #h(2em) (B) \$1,200 #h(2em) (C) \$1,675 #h(2em) (D) \$2,075 #h(2em) (E) \$3,350
]

#v(1em)

#question-box(8, "Hard")[
  A store reported total sales of \$385 million for February of this year. If the total sales for the same month last year was \$320 million, approximately what was the percent increase in sales?

  #v(0.5em)
  (A) 2% #h(2em) (B) 17% #h(2em) (C) 20% #h(2em) (D) 65% #h(2em) (E) 83%
]

#pagebreak()

#question-box(9, "Hard")[
  When positive integer $x$ is divided by positive integer $y$, the remainder is 9. If $frac(x, y) = 96.12$, what is the value of $y$?

  #v(0.5em)
  (A) 96 #h(2em) (B) 75 #h(2em) (C) 48 #h(2em) (D) 25 #h(2em) (E) 12
]

#v(1em)

#question-box(10, "Hard")[
  If $p$ is the product of the integers from 1 to 30, inclusive, what is the greatest integer $k$ for which $3^k$ is a factor of $p$?

  #v(0.5em)
  (A) 10 #h(2em) (B) 12 #h(2em) (C) 14 #h(2em) (D) 16 #h(2em) (E) 18
]

#v(1em)

== Algebra Questions

#question-box(11, "Easy")[
  A collection of 16 coins, each with a face value of either 10 cents or 25 cents, has a total face value of \$2.35. How many of the coins have a face value of 25 cents?

  #v(0.5em)
  (A) 3 #h(2em) (B) 5 #h(2em) (C) 7 #h(2em) (D) 9 #h(2em) (E) 11
]

#v(1em)

#question-box(12, "Easy")[
  If $1 < x < y < z$, which of the following has the greatest value?

  #v(0.5em)
  (A) $z(x + 1)$ #h(1em) (B) $z(y + 1)$ #h(1em) (C) $x(y + z)$ #h(1em) (D) $y(x + z)$ #h(1em) (E) $z(x + y)$
]

#pagebreak()

#question-box(13, "Medium")[
  To rent a tractor, it costs a total of $x$ dollars for the first 24 hours, plus $y$ dollars per hour for each hour in excess of 24 hours. Which of the following represents the cost, in dollars, to rent a tractor for 36 hours?

  #v(0.5em)
  (A) $x + 12y$ #h(1em) (B) $x + 36y$ #h(1em) (C) $12x + y$ #h(1em) (D) $24x + 12y$ #h(1em) (E) $24x + 36y$
]

#v(1em)

#question-box(14, "Medium")[
  If $a(a + 2) = 24$ and $b(b + 2) = 24$, where $a eq.not b$, then $a + b =$

  #v(0.5em)
  (A) $-48$ #h(2em) (B) $-2$ #h(2em) (C) 2 #h(2em) (D) 46 #h(2em) (E) 48
]

#v(1em)

#question-box(15, "Medium")[
  Three printing presses, R, S, and T, working together at their respective constant rates, can do a certain printing job in 4 hours. S and T, working together at their respective constant rates, can do the same job in 5 hours. How many hours would it take R, working alone at its constant rate, to do the same job?

  #v(0.5em)
  (A) 8 #h(2em) (B) 10 #h(2em) (C) 12 #h(2em) (D) 15 #h(2em) (E) 20
]

#v(1em)

#question-box(16, "Hard")[
  The cost to rent a small bus for a trip is $x$ dollars, which is to be shared equally among the people taking the trip. If 10 people take the trip rather than 16, how many more dollars, in terms of $x$, will it cost per person?

  #v(0.5em)
  (A) $frac(x, 6)$ #h(1em) (B) $frac(x, 10)$ #h(1em) (C) $frac(x, 16)$ #h(1em) (D) $frac(3x, 40)$ #h(1em) (E) $frac(3x, 80)$
]

#pagebreak()

#question-box(17, "Hard")[
  What is the smallest integer $n$ for which $25^n > 5^12$?

  #v(0.5em)
  (A) 6 #h(2em) (B) 7 #h(2em) (C) 8 #h(2em) (D) 9 #h(2em) (E) 10
]

#v(1em)

#question-box(18, "Hard")[
  Which of the following is equivalent to the pair of inequalities $x + 6 > 10$ and $x - 3 lt.eq 5$?

  #v(0.5em)
  (A) $2 lt.eq x < 16$ #h(1em) (B) $2 lt.eq x < 4$ #h(1em) (C) $2 < x lt.eq 8$ #h(1em) (D) $4 < x lt.eq 8$ #h(1em) (E) $4 lt.eq x < 16$
]

#v(1em)

#question-box(19, "Hard")[
  In a certain sequence, the term $x_n$ is given by the formula $x_n = 2x_(n-1) - frac(1, 2)(x_(n-2))$ for all $n gt.eq 2$. If $x_0 = 3$ and $x_1 = 2$, what is the value of $x_3$?

  #v(0.5em)
  (A) 2.5 #h(2em) (B) 3.125 #h(2em) (C) 4 #h(2em) (D) 5 #h(2em) (E) 6.75
]

#v(1em)

#question-box(20, "Hard")[
  If $s > 0$ and $sqrt(frac(r, s)) = s$, what is $r$ in terms of $s$?

  #v(0.5em)
  (A) $frac(1, s)$ #h(2em) (B) $sqrt(s)$ #h(2em) (C) $s sqrt(s)$ #h(2em) (D) $s^3$ #h(2em) (E) $s^2 - s$
]

#pagebreak()

= Answer Key

#table(
  columns: (auto, auto, auto, auto, auto),
  align: center,
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Q*], [*Answer*], [*Q*], [*Answer*], [*Topic*],
  [1], [E], [11], [B], [Ratio & Proportion / Linear Eq.],
  [2], [B], [12], [E], [Statistics / Inequalities],
  [3], [C], [13], [A], [Percents / Algebraic Expressions],
  [4], [B], [14], [B], [Ratio & Proportion / Quadratic Eq.],
  [5], [D], [15], [E], [Unit Conversions / Rate Problems],
  [6], [D], [16], [E], [Sets / Algebraic Expressions],
  [7], [D], [17], [B], [Sequences / Exponents],
  [8], [C], [18], [D], [Percents / Inequalities],
  [9], [B], [19], [C], [Number Properties / Sequences],
  [10], [C], [20], [D], [Number Properties / Exponents],
)

#v(2em)

#info-box[
  *Question Distribution by Difficulty*

  - *Easy* (Questions 1-4, 11-12): 6 questions
  - *Medium* (Questions 5-7, 13-15): 6 questions
  - *Hard* (Questions 8-10, 16-20): 8 questions
]

#v(1em)

#info-box[
  *Topic Coverage*

  *Arithmetic Topics:*
  - Statistics (Standard Deviation)
  - Percents
  - Ratio and Proportion
  - Unit Conversions
  - Sets (Venn Diagrams)
  - Sequences and Series
  - Properties of Numbers (Divisibility, Factors, Remainders)

  *Algebra Topics:*
  - Linear Equations
  - Quadratic Equations
  - Inequalities
  - Algebraic Expressions
  - Exponents
  - Rate Problems
  - Sequences
]

#v(1em)

#tip-box[
  *Study Tips*

  1. For *Statistics*: Remember that mean = sum/count. For consecutive integers, mean = median.

  2. For *Probability*: Identify whether events are independent or dependent. Use complement rule for "at least one" problems.

  3. For *Percents*: Set up equations carefully. Percent change = (New - Old)/Old $times$ 100.

  4. For *Algebra*: Factor quadratics to find roots. For exponents, use $a^m times a^n = a^(m+n)$ and $(a^m)^n = a^(m n)$.

  5. For *Rate Problems*: Use the formula Work = Rate $times$ Time. For combined rates, add individual rates.

  6. For *Number Properties*: Know divisibility rules. Prime factorization is key for GCD/LCM problems.
]
