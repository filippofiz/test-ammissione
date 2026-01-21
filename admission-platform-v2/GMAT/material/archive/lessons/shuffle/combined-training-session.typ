#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Number Properties & Algebra",
  level: "Combined Training Session",
  intro: "Practice assignment covering Number Properties, Arithmetic, and Algebra fundamentals.",
  logo: "/Logo.png"
)

// Question box with difficulty badge
#let question-box(num, difficulty, content) = {
  let diff-color = if difficulty == "Easy" { rgb("#4caf50") } else if difficulty == "Medium" { rgb("#ffb606") } else { rgb("#e53935") }
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

= Training Session Overview

#info-box[
  *Assignment Details:*
  - *Total Questions:* 24
  - *Time Limit:* 48 minutes (strictly timed)
  - *Average Pace:* 2 minutes per question
  - *Topics:* Number Properties & Arithmetic (Q1-12), Algebra (Q13-24)
  - *Level:* Beginner/Intermediate (with Hard challenges)
]

#warning-box[
  *Instructions:*
  1. Set a timer for 48 minutes
  2. Complete all questions in order
  3. Do NOT use a calculator
  4. Mark any questions you found difficult
  5. Record your time if you finish early
]

#pagebreak()

= Part 1: Number Properties & Arithmetic

#question-box(1, "Easy")[
  If $x = -7$ and $y = 3$, what is the value of $|x| + |y|$?

  #v(0.5em)
  (A) $-10$ \ (B) $-4$ \ (C) $4$ \ (D) $10$ \ (E) $21$
]

#v(1em)

#question-box(2, "Easy")[
  Which of the following statements is true about zero?

  #v(0.5em)
  (A) Zero is a positive integer\
  (B) Zero is a negative integer\
  (C) Zero is neither positive nor negative\
  (D) Zero is both positive and negative\
  (E) Zero is not an integer
]

#v(1em)

#question-box(3, "Easy")[
  How many positive factors does 24 have?

  #v(0.5em)
  (A) 4 \ (B) 6 \ (C) 8 \ (D) 10 \ (E) 12
]

#v(1em)

#question-box(4, "Medium")[
  What is the greatest common factor (GCF) of 48 and 72?

  #v(0.5em)
  (A) 6 \ (B) 12 \ (C) 18 \ (D) 24 \ (E) 36
]

#pagebreak()

#question-box(5, "Medium")[
  What is the least common multiple (LCM) of 8 and 12?

  #v(0.5em)
  (A) 4 \ (B) 24 \ (C) 48 \ (D) 72 \ (E) 96
]

#v(1em)

#question-box(6, "Easy")[
  Which of the following numbers is divisible by both 3 and 4?

  #v(0.5em)
  (A) 18 \ (B) 28 \ (C) 36 \ (D) 42 \ (E) 45
]

#v(1em)

#question-box(7, "Easy")[
  Which of the following is a prime number?

  #v(0.5em)
  (A) 1 \ (B) 9 \ (C) 15 \ (D) 21 \ (E) 23
]

#v(1em)

#question-box(8, "Medium")[
  What is the prime factorization of 180?

  #v(0.5em)
  (A) $2 times 3 times 30$ #h(1.5em) (B) $2^2 times 3^2 times 5$ #h(1.5em) (C) $2^2 times 45$ #h(1.5em) (D) $4 times 9 times 5$ #h(1.5em) (E) $2 times 3 times 5^2$
]

#v(1em)

#question-box(9, "Medium")[
  If $a$ is an odd integer and $b$ is an even integer, which of the following must be odd?

  #v(0.5em)
  (A) $a + b$ \ (B) $a times b$ \ (C) $a^2 times b$ \ (D) $2a + b$ \ (E) $a + 2b$
]

#v(1em)

#question-box(10, "Hard")[
  If $n$ is a positive integer and the product of all integers from 1 to $n$, inclusive, is divisible by 990, what is the least possible value of $n$?

  #v(0.5em)
  (A) 8 \ (B) 9 \ (C) 10 \ (D) 11 \ (E) 12
]

#v(1em)

#question-box(11, "Hard")[
  If $n$ divided by 12 leaves a remainder of 5, what is the remainder when $n^2$ is divided by 12?

  #v(0.5em)
  (A) 1 \ (B) 5 \ (C) 7 \ (D) 10 \ (E) 11
]

#v(1em)

#question-box(12, "Hard")[
  How many positive integers less than 100 have exactly 3 positive divisors?

  #v(0.5em)
  (A) 2 \ (B) 3 \ (C) 4 \ (D) 5 \ (E) 6
]

#pagebreak()

= Part 2: Algebra

#question-box(13, "Easy")[
  Simplify: $3x + 5 - 2x + 7$

  #v(0.5em)
  (A) $x + 12$ \ (B) $5x + 12$ \ (C) $x - 2$ \ (D) $5x - 2$ \ (E) $x + 2$
]

#v(1em)

#question-box(14, "Easy")[
  Expand: $4(2x - 3)$

  #v(0.5em)
  (A) $8x - 3$ \ (B) $6x - 7$ \ (C) $8x - 12$ \ (D) $8x + 12$ \ (E) $2x - 12$
]

#v(1em)

#question-box(15, "Easy")[
  Solve for $x$: $2x + 8 = 20$

  #v(0.5em)
  (A) $x = 4$ \ (B) $x = 6$ \ (C) $x = 10$ \ (D) $x = 12$ \ (E) $x = 14$
]

#v(1em)

#question-box(16, "Medium")[
  If $5x - 3 = 2x + 12$, what is the value of $x$?

  #v(0.5em)
  (A) $3$ \ (B) $5$ \ (C) $9$ \ (D) $15$ \ (E) $17$
]

#pagebreak()

#question-box(17, "Medium")[
  If $x + y = 12$ and $x - y = 4$, what is the value of $x$?

  #v(0.5em)
  (A) $4$ \ (B) $6$ \ (C) $8$ \ (D) $10$ \ (E) $16$
]

#v(1em)

#question-box(18, "Easy")[
  Which of the following is a solution to $(x - 3)(x + 2) = 0$?

  #v(0.5em)
  (A) $x = -3$ only \ (B) $x = 2$ only \ (C) $x = 3$ only \ (D) $x = -2$ only \ (E) $x = 3$ or $x = -2$
]

#v(1em)

#question-box(19, "Medium")[
  What are the solutions to $x^2 - 5x + 6 = 0$?

  #v(0.5em)
  (A) $x = 1$ and $x = 6$ \ (B) $x = 2$ and $x = 3$ \ (C) $x = -2$ and $x = -3$ \ (D) $x = -1$ and $x = -6$ \ (E) $x = 5$ and $x = 1$
]

#v(1em)

#question-box(20, "Medium")[
  Solve for $x$: $3x - 6 > 9$

  #v(0.5em)
  (A) $x > 1$ \ (B) $x > 3$ \ (C) $x > 5$ \ (D) $x < 5$ \ (E) $x > 15$
]

#v(1em)

#question-box(21, "Medium")[
  If $f(x) = 2x^2 - 3x + 1$, what is $f(2)$?

  #v(0.5em)
  (A) $1$ \ (B) $3$ \ (C) $5$ \ (D) $7$ \ (E) $9$
]

#v(1em)

#question-box(22, "Hard")[
  If $x^2 - y^2 = 24$ and $x + y = 6$, what is the value of $x - y$?

  #v(0.5em)
  (A) $2$ \ (B) $3$ \ (C) $4$ \ (D) $6$ \ (E) $8$
]

#pagebreak()

#question-box(23, "Hard")[
  For what value of $k$ does the equation $x^2 - 6x + k = 0$ have exactly one solution?

  #v(0.5em)
  (A) $-9$ \ (B) $0$ \ (C) $6$ \ (D) $9$ \ (E) $12$
]

#v(1em)

#question-box(24, "Hard")[
  If $|2x - 5| = 11$, what is the sum of all possible values of $x$?

  #v(0.5em)
  (A) $-3$ \ (B) $0$ \ (C) $3$ \ (D) $5$ \ (E) $8$
]

#pagebreak()

= Answer Key

#table(
  columns: (auto, auto, auto, auto, auto),
  align: center,
  fill: (col, row) => if row == 0 { rgb("#021d49").lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Q*], [*Answer*], [*Q*], [*Answer*], [*Topic*],
  [1], [D], [13], [A], [Number Props / Algebra],
  [2], [C], [14], [C], [Number Props / Algebra],
  [3], [C], [15], [B], [Number Props / Algebra],
  [4], [D], [16], [B], [Number Props / Algebra],
  [5], [B], [17], [C], [Number Props / Algebra],
  [6], [C], [18], [E], [Number Props / Algebra],
  [7], [E], [19], [B], [Number Props / Algebra],
  [8], [B], [20], [C], [Number Props / Algebra],
  [9], [A], [21], [B], [Number Props / Algebra],
  [10], [D], [22], [C], [Number Props / Algebra],
  [11], [A], [23], [D], [Number Props / Algebra],
  [12], [C], [24], [D], [Number Props / Algebra],
)

#v(1em)

#info-box[
  *Question Distribution*

  - *Easy* (8 questions): 1, 2, 3, 6, 7, 13, 14, 15, 18
  - *Medium* (10 questions): 4, 5, 8, 9, 16, 17, 19, 20, 21
  - *Hard* (6 questions): 10, 11, 12, 22, 23, 24
]

