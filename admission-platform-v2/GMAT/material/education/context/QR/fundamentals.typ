#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Quantitative Reasoning - Fundamentals_],
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
  #text(size: 16pt, fill: uptoten-green)[Fundamentals]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Essential mathematical concepts and foundations for the GMAT Quantitative Reasoning section.\
    \
    This guide covers all the core topics you need to master: numbers, arithmetic operations, basic algebra, fractions, decimals, and percents.
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

= Value, Order, and Factors

This section covers the fundamental concepts of numbers, their properties, and relationships.

== Numbers and the Number Line

=== Real Numbers

All real numbers correspond to points on the number line, and all points on the number line represent real numbers.

=== Key Properties

- *Negative numbers*: Points to the left of zero
- *Positive numbers*: Points to the right of zero
- *Zero*: Neither positive nor negative
- *Ordering*: For any two numbers on the number line, the number to the left is less than the number to the right

#example-box[
  *Example*: From the number line, we can see that $-4 < -3 < -3/2 < -1$, and $1 < sqrt(2) < 2$.
]

=== Interval Notation

If a number $n$ is between 1 and 4 on the number line:
- $n > 1$ and $n < 4$, written as $1 < n < 4$
- If $n$ is "between 1 and 4, *inclusive*," then $1 <= n <= 4$

=== Absolute Value

The *absolute value* of a real number $x$, written as $|x|$, is:
- $x$ if $x >= 0$
- $-x$ if $x < 0$

The absolute value represents the *distance* between that number and zero on the number line.

#example-box[
  *Examples*:
  - $|5| = 5$
  - $|-3| = 3$
  - Both $-3$ and $3$ have the same absolute value (3) since each is three units from zero
]

#tip-box[
  *Important Property*

  For any real numbers $x$ and $y$:
  $ |x + y| <= |x| + |y| $

  This is called the *Triangle Inequality*.
]

#pagebreak()

== Integers, Factors, and Divisibility

=== Integers

An *integer* is any number in the set $\{..., -3, -2, -1, 0, 1, 2, 3, ...\}$.

*Consecutive integers*: For any integer $n$, the numbers $\{n, n+1, n+2, n+3, ...\}$ are consecutive integers.

=== Divisibility and Factors

If $x$ and $y$ are integers and $x != 0$, then $x$ is a *divisor* (or *factor*) of $y$ if $y = x n$ for some integer $n$.

In this case:
- $y$ is *divisible by* $x$
- $y$ is called a *multiple* of $x$

#example-box[
  *Example*:
  - Since $28 = (7)(4)$, both 4 and 7 are divisors (factors) of 28
  - But 8 is not a factor of 28, because $28 div 8 = 3.5$ (not an integer)
]

=== Quotient and Remainder

When dividing a positive integer $y$ by a positive integer $x$:
- The *quotient* is the result when rounding down to the nearest nonnegative integer
- The *remainder* is what's left over

Mathematically: $y = x q + r$ where $0 <= r < x$

#example-box[
  *Examples*:
  - When 28 is divided by 8: quotient = 3, remainder = 4, because $28 = (8)(3) + 4$
  - When 32 is divided by 8: quotient = 4, remainder = 0, so 32 is divisible by 8
  - When 5 is divided by 7: quotient = 0, remainder = 5, because $5 = (7)(0) + 5$
]

#tip-box[
  *Key Insight*

  The remainder $r = 0$ if and only if $y$ is divisible by $x$.
]

#pagebreak()

=== Even and Odd Numbers

*Even integers*: Any integer divisible by 2
- Set: $\{..., -4, -2, 0, 2, 4, 6, 8, ...\}$

*Odd integers*: Integers not divisible by 2
- Set: $\{..., -3, -1, 1, 3, 5, ...\}$

#info-box[
  *Rules for Even and Odd*

  *Products*:
  - Even times Any = Even
  - Odd times Odd = Odd

  *Sums and Differences*:
  - Even plus/minus Even = Even
  - Odd plus/minus Odd = Even
  - Even plus/minus Odd = Odd
]

=== Prime Numbers

A *prime number* is a positive integer with exactly two positive divisors: 1 and itself.

#example-box[
  *Examples*:
  - First six primes: 2, 3, 5, 7, 11, 13
  - 15 is NOT prime (divisors: 1, 3, 5, 15)
  - 1 is NOT prime (only one divisor)
]

#warning-box[
  *Important*: 2 is the only even prime number.
]

=== Composite Numbers and Prime Factorization

A *composite number* is an integer greater than 1 that is not prime.

Every integer greater than 1 is either prime or can be expressed as a unique product of prime factors.

#example-box[
  *Examples*:
  - $14 = 2 times 7$
  - $81 = 3 times 3 times 3 times 3 = 3^4$
  - $484 = 2 times 2 times 11 times 11 = 2^2 times 11^2$
]

#pagebreak()

== Exponents and Roots

=== Exponent Basics

An expression $k^n$ means the $n$th power of $k$, where:
- $n$ is the *exponent*
- $k$ is the *base*

When $n$ is a positive integer, $k^n$ is the product of $n$ instances of $k$.

#example-box[
  *Examples*:
  - $x^5 = x times x times x times x times x$ (x is a factor 5 times)
  - $2^2 = 2 times 2 = 4$ (2 squared)
  - $2^3 = 2 times 2 times 2 = 8$ (2 cubed)
]

=== Square Roots

A *square root* of a number $n$ is a number $x$ such that $x^2 = n$.

Every positive number has two real square roots: one positive and one negative.

#example-box[
  *Example*: The two square roots of 9 are $sqrt(9) = 3$ and $-sqrt(9) = -3$.
]

#tip-box[
  *Key Property*

  For any $x$: $sqrt(x^2) = |x|$

  The nonnegative square root of $x^2$ equals the absolute value of $x$.
]

=== Cube Roots

Every real number $r$ has exactly one real cube root, which is the number $s$ such that $s^3 = r$.

The real cube root of $r$ is written as $root(3, r)$ or $r^(1/3)$.

#example-box[
  *Examples*:
  - Since $2^3 = 8$, we have $root(3, 8) = 2$
  - Since $(-2)^3 = -8$, we have $root(3, -8) = -2$
]

#pagebreak()

=== Properties of Exponents

For any real numbers $x$, $y$, $z$ (with appropriate restrictions):

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Property*], [*Formula*],
  [Identity], [$x^1 = x$],
  [Zero exponent], [$x^0 = 1$],
  [Negative exponent], [$x^(-1) = 1/x$ (if $x != 0$)],
  [Product of powers], [$x^(y+z) = x^y times x^z$],
  [Quotient of powers], [$x^(y-z) = x^y / x^z$ (if $x != 0$)],
  [Power of a power], [$(x^y)^z = x^(y z)$],
  [Power of a product], [$(x y)^z = x^z times y^z$],
  [Power of a quotient], [$(x/z)^y = x^y / z^y$ (if $z != 0$)],
  [Fractional exponent], [$x^(y/z) = root(z, x^y)$ (if $z != 0$)],
)

== Decimals and Place Value

=== Understanding Place Value

A *decimal* is a real number written as a series of digits, often with a decimal point.

#example-box[
  *Example*: The digits in 7,654.321 have these place values:

  #table(
    columns: (1fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr),
    align: center,
    stroke: 0.5pt + gray,
    [Thousands], [Hundreds], [Tens], [Ones], ..., [Tenths], [Hundredths], [Thousandths],
    [7], [6], [5], [4], ..., [3], [2], [1],
  )
]

=== Scientific Notation

In *scientific notation*, a number is written with only one nonzero digit to the left of the decimal point, multiplied by a power of 10.

#example-box[
  *Examples*:
  - $231 = 2.31 times 10^2$
  - $0.0231 = 2.31 times 10^(-2)$
  - $2.013 times 10^4 = 20,130$ (move decimal 4 places right)
  - $1.91 times 10^(-4) = 0.000191$ (move decimal 4 places left)
]

#pagebreak()

= Properties of Operations

== Addition and Subtraction Properties

For any real numbers $x$, $y$, and $z$:

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Property*], [*Statement*],
  [Identity], [$x + 0 = x = x - 0$],
  [Inverse], [$x - x = 0$],
  [Commutative], [$x + y = y + x$],
  [Associative], [$(x + y) + z = x + (y + z)$],
)

== Multiplication and Division Properties

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Property*], [*Statement*],
  [Identity], [$x times 1 = x = x/1$],
  [Zero property], [$x times 0 = 0$],
  [Inverse], [$x/x = 1$ (if $x != 0$)],
  [Undefined], [$x/0$ is undefined],
  [Commutative], [$x y = y x$],
  [Associative], [$(x y)z = x(y z)$],
  [Distributive], [$x y + x z = x(y + z)$],
)

#info-box[
  *Sign Rules for Multiplication and Division*

  - Positive times Positive = Positive
  - Negative times Negative = Positive
  - Positive times Negative = Negative
  - If $x y = 0$, then $x = 0$ or $y = 0$ (or both)
]

#pagebreak()

= Algebra, Equalities, and Inequalities

== Algebraic Expressions

*Variables* are letters (like $x$ or $n$) that stand for unknown quantities.
*Constants* are numerical expressions for known quantities.
An *algebraic expression* combines variables, constants, and operations.

=== Terms and Coefficients

In an algebraic expression:
- A *term* is a constant, variable, or product of constants and variables
- A *constant term* has no variables
- A *coefficient* is a constant multiplied by variables

#example-box[
  *Example*: In $5x^2 - 3x + 7$:
  - Three terms: $5x^2$, $-3x$, $7$
  - Coefficients: 5 and -3
  - Constant term: 7
]

=== Polynomials

A *polynomial* is an algebraic expression that's a sum of terms with one variable raised to non-negative integer powers.

- *Linear polynomial* (first degree): highest power is 1
- *Quadratic polynomial* (second degree): highest power is 2

== Linear Equations

=== One Unknown

A *linear equation with one unknown* has a linear polynomial on one side of the equals sign.

To solve: isolate the unknown by doing the same operations on both sides.

#example-box[
  *Example*: Solve $(5x - 6)/3 = 4$

  $5x - 6 = 12$ #h(2em) (multiply both sides by 3)

  $5x = 18$ #h(2em) (add 6 to both sides)

  $x = 18/5$ #h(2em) (divide both sides by 5)

  Check: $(5 times 18/5 - 6)/3 = (18 - 6)/3 = 12/3 = 4$ #sym.checkmark
]

#pagebreak()

=== Two Unknowns - Substitution Method

Use one equation to express one variable in terms of the other, then substitute.

#example-box[
  *Example*: Solve the system:
  $ 3x + 2y = 11 $
  $ x - y = 2 $

  From equation 2: $x = 2 + y$

  Substitute into equation 1:
  $ 3(2 + y) + 2y = 11 $
  $ 6 + 3y + 2y = 11 $
  $ 5y = 5 $
  $ y = 1 $

  Therefore: $x = 2 + 1 = 3$

  Solution: $x = 3$, $y = 1$
]

== Quadratic Equations

=== The Quadratic Formula

For $a x^2 + b x + c = 0$ where $a != 0$:

$ x = (-b plus.minus sqrt(b^2 - 4a c))/(2a) $

#info-box[
  *The Discriminant: $b^2 - 4a c$*

  - If $b^2 - 4a c > 0$: Two distinct real roots
  - If $b^2 - 4a c = 0$: One repeated root
  - If $b^2 - 4a c < 0$: No real roots
]

== Inequalities

Solve like equations, but *reverse the inequality sign when multiplying or dividing by a negative number*.

#warning-box[
  *Critical Rule*

  When you multiply or divide both sides of an inequality by a *negative number*, you must *reverse* the inequality sign.

  Example: $6 > 2$, but $(-1)(6) < (-1)(2)$, that is, $-6 < -2$
]

#pagebreak()

== Functions

A *function* is an algebraic expression in one variable that assigns exactly one output to each input.

Notation: $f(x) = x^3 - 5x^2 + 2$ means "f of x equals..."

#example-box[
  *Example*: If $f(x) = x^3 - 5x^2 + 2$

  Then $f(1) = 1^3 - 5(1)^2 + 2 = 1 - 5 + 2 = -2$
]

=== Domain and Range

- *Domain*: The set of all allowed inputs
- *Range*: The set of all possible outputs

== Graphing

=== Linear Equations and Lines

The equation $y = m x + b$ represents a line where:
- $m$ is the *slope*
- $b$ is the *y-intercept*

*Slope* = (change in $y$)/(change in $x$) = $(y_2 - y_1)/(x_2 - x_1)$

#info-box[
  *Slope Properties*

  - Positive slope: line slants upward (left to right)
  - Negative slope: line slants downward
  - Zero slope: horizontal line ($y = b$)
  - Undefined slope: vertical line ($x = a$)
]

#pagebreak()

= Rates, Ratios, and Percents

== Ratio and Proportion

=== Ratio

The *ratio* of $x$ to $y$ (where $y != 0$) can be written as:
- $x : y$
- $x/y$
- "$x$ to $y$"

=== Proportion

A *proportion* is an equation between two ratios.

To solve for an unknown, *cross multiply*.

#example-box[
  *Example*: Solve $2/3 = n/12$

  Cross multiply: $3n = 24$

  Therefore: $n = 8$
]

== Fractions

=== Basic Operations

*Adding/Subtracting with same denominator*:
$ 3/5 + 4/5 = 7/5 #h(3em) 5/7 - 2/7 = 3/7 $

*Multiplying fractions*:
$ 2/3 times 4/7 = 8/21 $

*Dividing fractions*: Multiply by the reciprocal.
$ 2/3 div 4/7 = 2/3 times 7/4 = 14/12 = 7/6 $

=== Mixed Numbers

A *mixed number* is an integer plus a fraction.

To convert to improper fraction: multiply integer by denominator, add to numerator.

#example-box[
  *Example*: $7 2/3 = (7 times 3 + 2)/3 = 23/3$
]

#pagebreak()

== Percents

=== Definition

*Percent* means "per hundred" or "out of 100."

$ 37% = 37/100 = 0.37 $

=== Finding a Percent of a Number

Multiply the number by the percent as a decimal or fraction.

#example-box[
  *Examples*:
  - $20%$ of $90 = 90 times 0.2 = 18$
  - $250%$ of $80 = 80 times 2.5 = 200$
]

=== Percent Increase or Decrease

$ "Percent Change" = "Amount of Change"/"Original Amount" times 100% $

#example-box[
  *Example 1*: Price increases from \$24 to \$30

  Percent increase $= (30 - 24)/24 = 6/24 = 0.25 = 25%$

  *Example 2*: Price decreases from \$30 to \$24

  Percent decrease $= (30 - 24)/30 = 6/30 = 0.20 = 20%$
]

#warning-box[
  *Note*: The percent increase from 24 to 30 (25%) does NOT equal the percent decrease from 30 to 24 (20%). The base is different!
]

=== Simple Interest

$ "Interest" = "Principal" times "Rate" times "Time" $

=== Compound Interest

$ "Balance" = "Principal" times (1 + "Rate per period")^n $

#pagebreak()

= Summary

This Fundamentals guide has covered:

- *Numbers and Number Line*: Real numbers, integers, absolute value
- *Factors and Divisibility*: Prime numbers, even/odd, remainders
- *Exponents and Roots*: Properties and calculations
- *Decimals*: Place value, operations, scientific notation
- *Algebra*: Expressions, equations, inequalities, functions
- *Graphing*: Coordinate plane, linear equations, slope
- *Ratios and Proportions*: Setup and solving
- *Fractions*: Operations and simplification
- *Percents*: Conversions, applications, interest

Master these fundamentals before moving on to the Core topics (word problems, statistics, probability) and Excellence strategies (advanced techniques and optimization).
