#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Reference Sheet",
  level: "Study Material",
  intro: "Quick reference guide for essential formulas, rules, and concepts.",
  logo: "/Logo.png"
)

// Custom styling for the reference sheet
#let ref-section(title, content) = {
  block(
    width: 100%,
    fill: rgb("#f8f9fa"),
    stroke: (left: 3pt + rgb("#2c5aa0")),
    inset: 12pt,
    radius: 4pt,
    breakable: false,
    [
      #text(size: 11pt, weight: "bold", fill: rgb("#2c5aa0"))[#title]
      #v(8pt)
      #content
    ]
  )
}

#let formula-box(content) = {
  block(
    width: 100%,
    fill: rgb("#ffffff"),
    stroke: 1pt + rgb("#dee2e6"),
    inset: 10pt,
    radius: 3pt,
    content
  )
}

#let two-col-layout(left, right) = {
  grid(
    columns: (1fr, 1fr),
    column-gutter: 12pt,
    left,
    right
  )
}

#set text(size: 9.5pt)
#set par(justify: true, leading: 0.55em)

// ==================== ARITHMETIC AND DECIMALS ====================
= Arithmetic and Decimals

#v(8pt)

#two-col-layout[
  #ref-section("Absolute Value")[
    $|x|$ is $x$ if $x >= 0$ and $-x$ if $x < 0$.

    #v(4pt)

    For any $x$ and $y$:
    - $|x + y| <= |x| + |y|$

    - $|x y| = |x| dot |y|$

    - $sqrt(x^2) = |x|$
  ]
][
  #ref-section("Even and Odd Numbers")[
    #table(
      columns: (auto, auto),
      stroke: 0.5pt + gray,
      inset: 6pt,
      [*Operation*], [*Result*],
      [Even $times$ Even], [Even],
      [Even $times$ Odd], [Even],
      [Odd $times$ Odd], [Odd],
      [Even $+$ Even], [Even],
      [Odd $+$ Odd], [Even],
      [Even $+$ Odd], [Odd],
    )
  ]
]

#v(8pt)

#two-col-layout[
  #ref-section("Addition & Subtraction")[
    $ x + 0 = x = x - 0 $
    $ x - x = 0 $
    $ x + y = y + x $
    $ x - y = -(y - x) = -y + x $
    $ (x + y) + z = x + (y + z) $

    If $x$ and $y$ are both positive, then $x + y$ is positive.

    If $x$ and $y$ are both negative, then $x + y$ is negative.
  ]
][
  #ref-section("Multiplication & Division")[
    $ x times 1 = x = x / 1 $
    $ x times 0 = 0 $
    $ "If" x eq.not 0", then" x / x = 1 $
    $ x / 0 "is undefined" $
    $ x y = y x $

    If $x eq.not 0$ and $y eq.not 0$, then $display(x / y = 1 / (display(y / x)))$.

    $(x y)z = x(y z)$

    $x y + x z = x(y + z)$

    If $y eq.not 0$, then $display((x / y) + (z / y) = (x + z) / y)$.
  ]
]

#v(8pt)

#ref-section("Quotients and Remainders")[
  The quotient $q$ and the remainder $r$ of dividing positive integer $x$ by positive integer $y$ are unique positive integers such that:

  $ y = x q + r "and" 0 < r < x $

  The remainder $r$ is 0 if and only if $y$ is divisible by $x$. Then $x$ is a factor of $y$.
]

#v(8pt)

#two-col-layout[
  #ref-section("Decimals")[
    *Adding/Subtracting:* Line up decimal points

    #table(
      columns: 2,
      stroke: none,
      align: right,
      [17.6512], [653.2700],
      [+ 653.2700], [−17.6512],
      [670.9212], [635.6188],
    )

    #v(6pt)

    *Multiplying decimal* $A$ *by decimal* $B$:

    Multiply as integers. If $A$ has $n$ digits right of decimal and $B$ has $m$ digits right of decimal, place decimal point in $A times B$ so it has $m + n$ digits to its right.

    #v(6pt)

    *Dividing:* Move decimal points equally many digits right until $B$ is an integer, then divide.
  ]
][
  #ref-section("Scientific Notation")[
    To convert $A times 10^n$ to regular notation, move $A$'s decimal point $n$ places to the right if $n$ is positive, or $|n|$ places to the left if $n$ is negative.

    #v(6pt)

    To convert a decimal to scientific notation, move the decimal point $n$ spaces so exactly one nonzero digit is to its left. Multiply by $10^n$ if you moved left or by $10^(-n)$ if moved right.
  ]
]

#v(8pt)

#ref-section("Divisibility Rules")[
  An integer is divisible by:

  #table(
    columns: (auto, 1fr),
    stroke: 0.5pt + gray,
    inset: 8pt,
    [*Divisor*], [*Rule*],
    [2], [Final digit is 0, 2, 4, 6, or 8],
    [3], [Sum of digits is divisible by 3],
    [4], [Final two digits make a number divisible by 4],
    [5], [Final digit is 5 or 0],
    [9], [Sum of digits is divisible by 9],
    [10], [Final digit is 0],
  )
]

#pagebreak()

// ==================== EXPONENTS ====================
= Exponents

#v(8pt)

#ref-section("Squares, Cubes, and Square Roots")[
  Every positive number has two real square roots, one positive and one negative.

  #v(6pt)

  #align(center)[
    #table(
      columns: (auto, auto, auto, auto),
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      [$n$], [$n^2$], [$n^3$], [$sqrt(n)$],
      [1], [1], [1], [1],
      [2], [4], [8], [1.41],
      [3], [9], [27], [1.73],
      [4], [16], [64], [2],
      [5], [25], [125], [2.24],
      [6], [36], [216], [2.45],
      [7], [49], [343], [2.65],
      [8], [64], [512], [2.83],
      [9], [81], [729], [3],
      [10], [100], [1,000], [3.16],
    )
  ]
]

#v(8pt)

#ref-section("Exponentiation Rules")[
  #grid(
    columns: (1fr, 1fr),
    column-gutter: 12pt,
    [
      #formula-box[
        $ x^1 = x $
        $ x^0 = 1 "(if" x eq.not 0 ")" $
        $ x^(-1) = 1/x "(if" x eq.not 0 ")" $
        $ x^y > x "(if" x > 1 "and" y > 1 ")" $
        $ x^y < x "(if" 0 < x < 1 "and" y > 1 ")" $
      ]
    ],
    [
      #formula-box[
        $ (x^y)^z = x^(y z) = (x^z)^y $
        $ x^(y+z) = x^y x^z $
        $ x^(y-z) = x^y / x^z "(if" x eq.not 0 ")" $
        $ (x y)^z = x^z y^z $
        $ (x/y)^z = x^z / y^z "(if" y eq.not 0 ")" $
      ]
    ]
  )

  #v(6pt)

  *Examples:*
  - $2^1 = 2$

  - $2^0 = 1$

  - $2^(-1) = display(1/2)$

  - $2^3 = 8 > 2$

  - $0.2^3 = 0.008 < 0.2$

  - $(2^3)^4 = 2^12 = (2^4)^3$

  - $2^7 = 2^3 2^4$

  - $2^(5-3) = display(2^5 / 2^3)$
  
  - $6^4 = 2^4 3^4$

  - $display((3/4)^2 = 3^2 / 4^2 = 9/16)$
]

#pagebreak()

// ==================== ALGEBRAIC EXPRESSIONS ====================
= Algebraic Expressions and Linear Equations

#v(8pt)

#ref-section("Translating Words into Math Operations")[
  #table(
    columns: (auto, auto, auto, auto, auto),
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: left,
    [$x + y$], [$x - y$], [$x y$], [$x / y$], [$x^y$],
    [$x$ added to $y$], [$x$ decreased by $y$], [$x$ multiplied by $y$], [$x$ divided by $y$], [$x$ to the power of $y$],
    [$x$ increased by $y$], [difference of $x$ and $y$], [product of $x$ and $y$], [$x$ over $y$], [$x$ to the $y$th power],
    [$x$ more than $y$], [$y$ fewer than $x$], [$x$ times $y$], [quotient of $x$ and $y$], [],
    [$x$ plus $y$], [$y$ less than $x$], [], [ratio of $x$ to $y$], [],
    [sum of $x$ and $y$], [$x$ minus $y$], [If $y = 2$: double $x$, twice $x$], [If $y = 2$: half of $x$, $x$ halved], [If $y = 2$: $x$ squared],
    [total of $x$ and $y$], [$x$ reduced by $y$], [If $y = 3$: triple $x$], [], [If $y = 3$: $x$ cubed],
    [], [$y$ subtracted from $x$], [], [], [],
  )
]

#v(8pt)

#two-col-layout[
  #ref-section("Manipulating Expressions")[
    *Factor to combine like terms:*

    $3x y - 9y = 3y(x - 3)$

    #v(6pt)

    *Divide out common factors:*

    $display((3x y - 9y) / (x - 3) = (3y(x-3))/(x-3) = 3y(1) = 3y)$

    #v(6pt)

    *Multiply expressions (FOIL):*

    $(3x - 4)(9y + x)$
    $= 3x(9y + x) - 4(9y + x)$
    $= 3x(9y) + 3x(x) - 4(9y) - 4(x)$
    $= 27x y + 3x^2 - 36y - 4x$

    #v(6pt)

    *Substitute constants:*

    If $x = 3$ and $y = -2$, then
    $3x y - x^2 + y = 3(3)(-2) - (3)^2 + (-2)$
    $= -18 - 9 - 2 = -29$
  ]
][
  #ref-section("Solving Linear Equations")[
    *One variable:*

    Isolate variable by doing same operations on both sides.

    Example: $display((5x - 6)/3 = 4)$

    1. Multiply both sides by 3: $5x - 6 = 12$4

    2. Add 6 to both sides: $5x = 18$

    3. Divide both sides by 5: $display(x = 18/5)$

    #v(6pt)

    *Two variables ($x$ and $y$):*

    Solve $x - y = 2$ and $3x + 2y = 11$:

    1. From first equation: $x = 2 + y$
    2. Substitute in second: $3(2 + y) + 2y = 11$
       $6 + 3y + 2y = 11$
       $5y = 5$, so $y = 1$
    3. From first: $x = 2 + 1 = 3$
  ]
]

#pagebreak()

// ==================== FACTORING AND QUADRATICS ====================
= Factoring, Quadratic Equations, and Inequalities

#v(8pt)

#two-col-layout[
  #ref-section("Factoring Formulas")[
    $ (a + 1/a)^2 = a^2 + 1/a^2 + 2 $

    $ a^2 - b^2 = (a - b)(a + b) $

    $ a^2 + 2a b + b^2 = (a + b)^2 $

    $ a^2 - 2a b + b^2 = (a - b)^2 $

    $ a^2 + b^2 = (a + b)^2 - 2a b = (a - b)^2 + 2a b $

    $ (a + b + c)^2 = a^2 + b^2 + c^2 + 2a b + 2a c + 2b c $

    $ (a + b)^3 = a^3 + 3a^2 b + 3a b^2 + b^3 $
  ]
][
  #ref-section("The Quadratic Formula")[
    For $a x^2 + b x + c = 0$ with $a eq.not 0$:

    $ x = (-b plus.minus sqrt(b^2 - 4a c)) / (2a) $

    These roots are two distinct real numbers if $b^2 - 4a c >= 0$.

    #v(4pt)

    If $b^2 - 4a c = 0$, one root: $display(-b/(2a))$.

    If $b^2 - 4a c < 0$, no real roots.
  ]
]

#v(8pt)

#ref-section("Solving by Factoring")[
  *Steps:*
  1. Start with polynomial equation
  2. Add/subtract to get 0 on one side
  3. Write nonzero side as product of factors
  4. Set each factor to 0 to find solutions

  #v(4pt)

  *Example:* $x^3 - 2x^2 + x = -5(x - 1)^2$

  $ x^3 - 2x^2 + x + 5(x-1)^2 = 0 $
  $ x(x^2 - 2x + 1) + 5(x-1)^2 = 0 $
  $ (x + 5)(x - 1)^2 = 0 $

  So $x + 5 = 0$ or $x - 1 = 0$, giving $x = -5$ or $x = 1$.
]

#v(8pt)

#ref-section("Solving Inequalities")[
  As in equations, same operations on both sides. But *multiplying or dividing by a negative reverses the inequality*.

  Thus, $6 > 2$, but $(-1)(6) < (-1)(2)$.

  #v(4pt)

  *Example:* $display((5x - 1)/2 < 3)$

  1. Multiply by −2 (reversing inequality): $5x - 1 > -6$
  2. Add 1: $5x > -5$
  3. Divide by 5: $x > -1$
]

#pagebreak()

// ==================== COORDINATE GEOMETRY ====================
= Lines in the Coordinate Plane

#v(8pt)

#ref-section("Line Equations")[
  An equation $y = m x + b$ defines a line with slope $m$ and $y$-intercept $b$.

  #v(4pt)

  For a line through $(x_1, y_1)$ and $(x_2, y_2)$ with $x_1 eq.not x_2$, the slope is:

  $ m = (y_2 - y_1)/(x_2 - x_1) $

  Given point $(x_1, y_1)$ and slope $m$, any point $(x, y)$ on the line satisfies:

  $ m = (y - y_1)/(x - x_1) $
]

#v(8pt)

#ref-section("Finding Line Equation - Example")[
  Given points $(3, -3)$ and $(-2, 4)$, the slope is:

  $ m = ((-3) - 4)/(3 - (-2)) = -7/5 $

  Using point $(3, -3)$:

  $ y - (-3) = (-7/5)(x - 3) $
  $ y + 3 = (-7/5)x + 21/5 $
  $ y = (-7/5)x + 6/5 $

  So $y$-intercept is $display(6/5)$.

  For $x$-intercept, set $y = 0$:
  $ 0 = (-7/5)x + 6/5 $
  $ (7/5)x = 6/5 $
  $ x = 6/7 $
]

#pagebreak()

// ==================== RATES, RATIOS, PERCENTS ====================
= Rates, Ratios, and Percents

#v(8pt)

#two-col-layout[
  #ref-section("Fractions")[
    *Equivalent Fractions:*

    Divide numerator and denominator by their GCD.

    #v(4pt)

    *Operations:*

    $ a/b plus.minus c/d = (a d plus.minus b c)/(b d) $

    $ a/b times c/d = (a c)/(b d) $

    $ (a/b) / (c/d) = a/b times d/c = (a d)/(b c) $

    #v(4pt)

    *Mixed Numbers:*

    $ a b/c = (a c + b)/c $
  ]
][
  #ref-section("Percents")[
    $ x% = x/100 $

    $ x% "of" y "equals" (x y)/100 $

    #v(4pt)

    To convert percent to decimal, drop %, move decimal point 2 digits left.

    To convert decimal to percent, add %, move decimal point 2 digits right.

    #v(4pt)

    *Percent increase* from $x$ to $y$: $100(display((y - x)/x))%$

    *Percent decrease* from $x$ to $y$: $100(display((x - y)/x))%$
  ]
]

#v(8pt)

#two-col-layout[
  #ref-section("Discounts")[
    A price discounted by $n$ percent becomes $(100 - n)$ percent of original.

    #v(4pt)

    A price discounted by $n$ percent and then by $m$ percent becomes $(100 - n)(100 - m)$ percent of original.
  ]
][
  #ref-section("Rate Problems")[
    $ "Distance" = "Rate" times "Time" $

    $ "Profit" = "Revenues" - "Expenses" $
    $ "Profit" = "Selling price" - "Cost" $
  ]
]

#v(8pt)

#ref-section("Interest")[
  *Simple interest:*

  $ I = P times r times t $

  where $P$ is principal, $r$ is interest rate, $t$ is time.

  #v(4pt)

  *Compound interest over $n$ periods:*

  $ A = P times (1 + r)^n $
]

#v(8pt)

#ref-section("Work")[
  $ 1/r + 1/s = 1/h $

  where $r$ is how long one individual takes, $s$ is how long a second takes, and $h$ is how long they take together.
]

#v(8pt)

#ref-section("Mixtures")[
  #table(
    columns: (auto, auto, auto, auto),
    stroke: 0.5pt + gray,
    inset: 8pt,
    [], [*Number of units*], [*Amount per unit*], [*Total amount*],
    [Substance A], [$X$], [$M$], [$Y times M$],
    [Substance B], [$Y$], [$N$], [$Y times M$],
    [Mixture], [$X + Y$], $display(((X times M) + (Y times N))/(X + Y))$, [$(X times M) + (Y times N)$],
  )
]

#pagebreak()

// ==================== STATISTICS ====================
= Statistics, Sets, and Counting Methods

#v(8pt)

#ref-section("Statistics")[
  #table(
    columns: (auto, 1fr, 1fr),
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: left,
    [*Concept*], [*Definition for $n$ values*], [*Example: {4, 4, 5, 7, 10}*],
    [*Mean*], [Sum of $n$ values, divided by $n$], [$display((4 + 4 + 5 + 7 + 10)/5 = 30/5 = 6)$],
    [*Median*], [Middle value if $n$ odd; mean of two middle if $n$ even], [$5$ is the middle value],
    [*Mode*], [Value appearing most often], [$4$ appears twice \ (only value appearing $>1$)],
    [*Range*], [Largest value minus smallest], [$10 - 4 = 6$],
    [*Standard Deviation*], [
      1. Find mean
      2. Find differences from mean
      3. Square each difference
      4. Find average of squared differences
      5. Take nonnegative square root
    ], [
      (1) Mean is $6$

      (2) $-2, -2, -1, 1, 4$

      (3) $4, 4, 1, 1, 16$

      (4) $display(26/5 = 5.2)$

      (5) $sqrt(5.2)$
    ],
  )
]

#v(8pt)

#ref-section("Sets")[
  #table(
    columns: (auto, auto, 1fr),
    stroke: 0.5pt + gray,
    inset: 8pt,
    [*Concept*], [*Notation*], [*Example*],
    [Number of elements], [$|S|$], [$S = {-5, 0, 1}$ has $|S| = 3$],
    [Subset], [$S subset.eq T$ ($S$ is subset of $T$)], [${-5, 0, 1}$ is subset of ${-5, 0, 1, 4, 10}$],
    [Union], [$S union T$], [${3, 4} union {4, 5, 6} = {3, 4, 5, 6}$],
    [Intersection], [$S inter T$], [${3, 4} inter {4, 5, 6} = {4}$],
    [Addition rule], [$|S union T| = |S| + |T| - |S inter T|$], [$|{3,4} union {4,5,6}| = 2 + 3 - 1 = 4$],
  )
]

#v(8pt)

#two-col-layout[
  #ref-section("Counting Methods")[
    *Multiplication Principle:*

    Number of choices from sets $A_1, A_2, ..., A_n$:
    $ |A_1| times |A_2| times ... times |A_n| $

    #v(4pt)

    *Factorial:*
    $ n! = n times (n-1) times ... times 1 $
    $ 0! = 1! = 1 $
    $ n! = (n-1)! times n $

    #v(4pt)

    *Permutations:*

    A data set of $n$ objects has $n!$ permutations.
  ]
][
  #ref-section("Combinations")[
    Number of $k$-element subsets from $n$ objects:

    $ binom(n, k) = (n!)/(k!(n-k)!) $

    #v(4pt)

    *Example:* 2-element subsets of {A, B, C, D, E}:

    $ binom(5, 2) = (5!)/(2!3!) = (120)/(2 times 6) = 10 $
  ]
]

#v(8pt)

#ref-section("Probability")[
  For equally likely outcomes:

  $ P("event") = ("number of favorable outcomes")/("total number of possible outcomes") $

  The probability $P(E)$ of an event $E$ is a number between 0 and 1, inclusive. If all outcomes are equally likely:

  $ P(E) = (|E|)/(|S|) $

  where $|E|$ is the number of outcomes in event $E$ and $|S|$ is the total number of possible outcomes.

  #v(6pt)

  #table(
    columns: (auto, 1fr),
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: left,
    [*Concept*], [*Formula*],
    [*Not* $bold(E)$], [$P("not" E) = 1 - P(E)$],
    [*$bold(E)$ and $bold(F)$*], [$P(E "and" F) = P(E inter F) = P(E|F) times P(F)$],
    [*$bold(E)$ or $bold(F)$*], [$P(E "or" F) = P(E union F) = P(E) + P(F) - P(E "and" F)$],
    [*Conditional Probability*], [$P(E|F) = display((P(E inter F))/(P(F)))$],
    [*Independent Events*], [$E$ and $F$ are independent if $P(E "and" F) = P(E) times P(F)$],
  )

  #v(4pt)

  If events $E$ and $F$ are independent, then $P(E|F) = P(E)$ and $P(F|E) = P(F)$.
]

#v(8pt)

#ref-section("Sequences")[
  A *sequence* is an ordered list of elements, starting with a first element.

  #v(4pt)

  *Example:* The function $a(n) = n^2 + display((n/6))$ with the domain of all positive integers $n = 1, 2, 3, ...$ defines an infinite sequence $a_n$ where:
  $ a_1 = 1^2 + 1/6 = 7/6 $
  $ a_2 = 2^2 + 2/6 = 13/3 $
  $ a_3 = 3^2 + 3/6 = 19/2 $
  and so on...

  #v(4pt)

  *Arithmetic sequence:* Each term differs from the previous by a constant $d$.

  $ a_n = a_1 + (n-1)d $

  *Geometric sequence:* Each term is the previous term multiplied by a constant $r$.

  $ a_n = a_1 times r^(n-1) $
]

#pagebreak()

// ==================== GEOMETRY ====================
= Geometry Reference

#v(8pt)

#ref-section("Triangles")[
  *Pythagorean Theorem:* For a right triangle with legs $a, b$ and hypotenuse $c$:
  $ a^2 + b^2 = c^2 $

  #v(4pt)

  *Area:* $A = display(1/2) times "base" times "height"$

  *Sum of angles:* Always $180 degree$
]

#v(8pt)

#two-col-layout[
  #ref-section("Circles")[
    *Circumference:* $C = 2 pi r = pi d$

    *Area:* $A = pi r^2$

    where $r$ is radius and $d$ is diameter.
  ]
][
  #ref-section("Rectangles")[
    *Area:* $A = l times w$

    *Perimeter:* $P = 2l + 2w$

    where $l$ is length and $w$ is width.
  ]
]

#v(8pt)

#two-col-layout[
  #ref-section("Rectangular Solids")[
    *Volume:* $V = l times w times h$

    *Surface Area:* $S = 2(l w + l h + w h)$
  ]
][
  #ref-section("Cylinders")[
    *Volume:* $V = pi r^2 h$

    *Surface Area:* $S = 2 pi r^2 + 2 pi r h$

    where $r$ is radius and $h$ is height.
  ]
]

#v(12pt)

// ==================== FOOTER ====================
#align(center)[
  #block(
    width: 100%,
    fill: rgb("#e9ecef"),
    inset: 10pt,
    radius: 4pt,
    [
      #text(size: 10pt, weight: "bold", fill: rgb("#2c5aa0"))[
        Remember: This reference sheet is for quick lookup during practice.
      ]
      #v(2pt)
      #text(size: 9pt, fill: rgb("#495057"))[
        Understanding concepts deeply is more important than memorizing formulas.
      ]
    ]
  )
]
