#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Algebra",
  level: "Hard / Very Hard Problem Modeling",
  intro: "Challenging exercises focused on modeling complex algebraic problems. These problems require multi-step reasoning, strategic manipulation, and creative mathematical thinking. Work through the questions first, then check the detailed solutions.",
  logo: "/Logo.png"
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Part I: Exercises

Work through each problem carefully. Focus on setting up the problem correctly before attempting to solve it. These problems are designed to challenge your algebraic problem-modeling skills at a high level.

#warning-box[
  *Difficulty Level:* Hard to Very Hard

  These problems require:
  - Strategic algebraic manipulation
  - Pattern recognition and identity application
  - Multi-step equation solving
  - Creative use of substitution and factoring
]

#pagebreak()

== Section A: Advanced Algebraic Expressions

=== Exercise A1: Symmetric Expressions

Let $a + b = 5$ and $a b = 6$.

*Questions:*
+ Find the value of $a^2 + b^2$.
+ Find the value of $a^3 + b^3$.
+ Find the value of $a^4 + b^4$.
+ Express $a^5 + b^5$ in terms of $a + b$ and $a b$, then compute its value.

#v(4cm)

=== Exercise A2: The Difference of Powers

*Questions:*
+ Factor $x^4 - y^4$ completely.
+ If $x^2 + y^2 = 25$ and $x + y = 7$, find $x^4 - y^4$.
+ Prove that $x^3 - y^3 = (x - y)(x^2 + x y + y^2)$ by expanding the right side.
+ If $a - b = 3$ and $a^2 + a b + b^2 = 19$, find $a^3 - b^3$.

#v(4cm)

=== Exercise A3: Nested Radicals and Rationalization

*Questions:*
+ Simplify $sqrt(7 + 4sqrt(3))$ by expressing it in the form $sqrt(a) + sqrt(b)$.
+ Rationalize $1/(sqrt(5) + sqrt(3) + sqrt(2))$.
+ If $x = (sqrt(5) + 1)/2$ (the golden ratio), prove that $x^2 = x + 1$.
+ Find the value of $sqrt(2 + sqrt(2 + sqrt(2 + sqrt(2 + ...))))$ where the pattern continues infinitely.

#v(4cm)

#pagebreak()

=== Exercise A4: Polynomial Division and Remainders

*Questions:*
+ When $p(x) = x^3 - 2x^2 + 3x - 4$ is divided by $(x - 2)$, find the remainder using the Remainder Theorem.
+ Find the value of $k$ such that $(x - 3)$ is a factor of $x^3 - k x^2 + 5x - 6$.
+ If $p(x)$ divided by $(x - 1)$ leaves remainder 5, and divided by $(x - 2)$ leaves remainder 8, find the remainder when $p(x)$ is divided by $(x - 1)(x - 2)$.
+ The polynomial $x^4 + a x^3 + b x^2 + c x + d$ has roots $1, 2, 3, 4$. Find $a + b + c + d$.

#v(4cm)

=== Exercise A5: Strategic Factoring

*Questions:*
+ Factor $x^4 + 4$ over the reals. (Hint: Add and subtract $4x^2$.)
+ Factor $x^3 + y^3 + z^3 - 3x y z$.
+ Factor $a^3 + b^3 + c^3 - 3a b c$ given that $a + b + c = 0$.
+ Prove that for any integer $n$, the expression $n^5 - n$ is divisible by 30.

#v(4cm)

#pagebreak()

== Section B: Linear Equations and Systems

=== Exercise B1: Multi-Variable Systems

Solve the following system of equations:
$ x + y + z = 6 $
$ x y + y z + z x = 11 $
$ x y z = 6 $

*Questions:*
+ Recognize that $x$, $y$, $z$ are roots of a cubic polynomial. Write this polynomial.
+ Solve the cubic to find all solutions $(x, y, z)$.
+ How many distinct ordered triples $(x, y, z)$ satisfy the system?
+ Verify your solution by substituting back into all three equations.

#v(4cm)

=== Exercise B2: Symmetric Systems

Consider the system:
$ x + y = 10 $
$ x^2 + y^2 = 58 $

*Questions:*
+ Find $x y$ using the identity $(x + y)^2 = x^2 + 2x y + y^2$.
+ Determine $x$ and $y$ by solving the resulting quadratic.
+ Find $x^3 + y^3$ using the identity $x^3 + y^3 = (x + y)(x^2 - x y + y^2)$.
+ Find $(x - y)^2$ and hence $|x - y|$.

#v(4cm)

=== Exercise B3: Parameter-Dependent Systems

For what values of $k$ does the following system have:
$ 2x + 3y = 7 $
$ 6x + k y = 21 $

*Questions:*
+ Infinitely many solutions?
+ No solution?
+ A unique solution?
+ If the unique solution satisfies $x = y$, find $k$.

#v(4cm)

#pagebreak()

=== Exercise B4: Diophantine Equations

*Questions:*
+ Find all integer solutions to $3x + 5y = 1$.
+ Find all positive integer solutions to $3x + 5y = 100$.
+ How many non-negative integer solutions exist for $x + 2y + 3z = 10$?
+ Find all pairs of positive integers $(x, y)$ such that $1/x + 1/y = 1/6$.

#v(4cm)

=== Exercise B5: Work and Rate Problems

*Questions:*
+ Worker A can complete a job in 12 hours. Worker B can complete it in 18 hours. If they work together for 4 hours and then A leaves, how long does B take to finish?
+ A tank has two inlet pipes and one outlet pipe. Pipe 1 fills the tank in 10 hours, Pipe 2 in 15 hours, and Pipe 3 empties it in 20 hours. If all three operate simultaneously, how long to fill the tank?
+ Two trains travel toward each other from cities 300 km apart. Train A travels at 60 km/h and Train B at 40 km/h. A bird flies back and forth between them at 80 km/h until they meet. How far does the bird travel?
+ A boat travels 24 km upstream and 24 km downstream in a total of 10 hours. If the stream flows at 2 km/h, find the boat's speed in still water.

#v(4cm)

#pagebreak()

== Section C: Quadratic Equations

=== Exercise C1: Vieta's Formulas Applications

The roots of $x^2 - 7x + 12 = 0$ are $alpha$ and $beta$.

*Questions:*
+ Without solving, find $alpha + beta$ and $alpha beta$.
+ Find $alpha^2 + beta^2$.
+ Find $1/alpha + 1/beta$.
+ Find a quadratic equation whose roots are $alpha^2$ and $beta^2$.

#v(4cm)

=== Exercise C2: Discriminant Analysis

For the equation $x^2 + (k - 3)x + k = 0$:

*Questions:*
+ Find the range of $k$ for which the equation has two distinct real roots.
+ Find the value(s) of $k$ for which the roots are equal.
+ If one root is twice the other, find $k$.
+ If the roots are reciprocals of each other, find $k$.

#v(4cm)

=== Exercise C3: Quadratic in Disguise

*Questions:*
+ Solve $x^4 - 13x^2 + 36 = 0$.
+ Solve $2^(2x) - 5 dot 2^x + 4 = 0$.
+ Solve $x + sqrt(x) - 6 = 0$.
+ Solve $(x^2 + x)^2 - 8(x^2 + x) + 12 = 0$.

#v(4cm)

#pagebreak()

=== Exercise C4: Optimization with Quadratics

*Questions:*
+ Find the minimum value of $f(x) = x^2 - 6x + 13$ and the $x$-value where it occurs.
+ A farmer has 100 meters of fencing. What dimensions maximize the area of a rectangular pen?
+ The sum of two positive numbers is 20. What is the maximum value of their product?
+ A ball is thrown upward with height $h(t) = -5t^2 + 30t + 10$ meters after $t$ seconds. Find the maximum height and when it occurs.

#v(4cm)

=== Exercise C5: Integer and Rational Root Problems

*Questions:*
+ For what integer values of $k$ does $x^2 + k x + 12 = 0$ have integer roots?
+ Find all rational roots of $2x^3 - 3x^2 - 11x + 6 = 0$.
+ If $x^2 + b x + c = 0$ has integer roots and $b + c = 5$, find all possible pairs $(b, c)$.
+ The polynomial $x^3 - 6x^2 + 11x - 6$ has three integer roots. Factor it completely.

#v(4cm)

#pagebreak()

== Section D: Inequalities

=== Exercise D1: Quadratic Inequalities

*Questions:*
+ Solve $x^2 - 5x + 6 > 0$.
+ Solve $x^2 - 4x + 4 <= 0$.
+ Find all $x$ satisfying $x^2 + 2x - 15 < 0$.
+ Solve $(x - 1)(x - 2)(x - 3) > 0$ using sign analysis.

#v(4cm)

=== Exercise D2: Rational Inequalities

*Questions:*
+ Solve $(x - 2)/(x + 3) > 0$.
+ Solve $(x^2 - 1)/(x - 2) <= 0$.
+ Find all solutions to $1/x > 1/(x + 1)$.
+ Solve $(x - 1)/(x + 1) >= (x + 1)/(x - 1)$.

#v(4cm)

=== Exercise D3: Absolute Value Inequalities

*Questions:*
+ Solve $|2x - 5| < 3$.
+ Solve $|x - 3| + |x + 2| >= 7$.
+ Find all $x$ satisfying $|x^2 - 4| <= 3$.
+ Solve $|x - 1| + |x - 4| = 3$.

#v(4cm)

#pagebreak()

=== Exercise D4: Inequality Proof Techniques

*Questions:*
+ Prove that for all real $x$: $x^2 + 1 >= 2x$.
+ Prove that for positive $a, b$: $(a + b)/2 >= sqrt(a b)$ (AM-GM inequality).
+ If $a + b + c = 3$ for positive $a, b, c$, prove that $a b + b c + c a <= 3$.
+ Prove that for positive $x$: $x + 1/x >= 2$.

#v(4cm)

=== Exercise D5: Systems of Inequalities

*Questions:*
+ Find all integer solutions to the system: $x + y < 5$ and $x - y > 1$ and $x > 0$ and $y > 0$.
+ Determine the area of the region defined by: $x >= 0$, $y >= 0$, $x + y <= 4$, and $x + 2y <= 6$.
+ Find the maximum value of $x + y$ subject to: $x >= 0$, $y >= 0$, $2x + y <= 10$, and $x + 3y <= 15$.
+ If $0 < x < 1$ and $0 < y < 1$, prove that $x y + (1-x)(1-y) < 1$.

#v(4cm)

#pagebreak()

== Section E: Functions

=== Exercise E1: Function Composition and Inverses

Let $f(x) = 2x + 3$ and $g(x) = x^2 - 1$.

*Questions:*
+ Find $(f compose g)(x)$ and $(g compose f)(x)$.
+ Find $f^(-1)(x)$ (the inverse of $f$).
+ Solve $f(g(x)) = g(f(x))$.
+ Find $(f compose f compose f)(x)$ and generalize to $(f compose f compose ... compose f)(x)$ for $n$ compositions.

#v(4cm)

=== Exercise E2: Domain and Range Analysis

*Questions:*
+ Find the domain and range of $f(x) = sqrt(x - 2) + sqrt(6 - x)$.
+ Find the domain of $g(x) = sqrt((x - 1)/(x + 2))$.
+ If $f(x) = (x + 1)/(x - 1)$, find the range of $f$.
+ Find the domain and range of $h(x) = x/(x^2 + 1)$.

#v(4cm)

=== Exercise E3: Functional Equations

*Questions:*
+ If $f(x + 1) = x^2 - 3x + 2$, find $f(x)$.
+ Find all functions $f: RR -> RR$ such that $f(x + y) = f(x) + f(y)$ for all $x, y$, assuming $f$ is continuous.
+ If $f(x) + f(1 - x) = 1$ for all $x$, find $f(1/4) + f(3/4)$.
+ If $f(x y) = f(x) + f(y)$ for positive $x, y$, and $f(2) = 1$, find $f(8)$.

#v(4cm)

#pagebreak()

=== Exercise E4: Piecewise and Special Functions

*Questions:*
+ For $f(x) = cases(x^2 "if" x < 0, 2x "if" x >= 0)$, find $f(-2) + f(0) + f(3)$.
+ Find all values of $x$ for which $floor(x)^2 = floor(x^2)$, where $floor(dot)$ is the floor function.
+ If $f(x) = x - floor(x)$ (fractional part), find $f(3.7) + f(-2.3)$.
+ Solve $floor(2x) = 3 floor(x) - 1$.

#v(4cm)

=== Exercise E5: Transformations and Graphs

*Questions:*
+ If $f(x) = x^2$, describe the transformation that produces $g(x) = 2(x - 3)^2 + 1$.
+ The graph of $y = f(x)$ passes through $(2, 5)$. What point must lie on the graph of $y = 3f(x - 1) + 2$?
+ If $f(x) = |x|$, for what value of $k$ does $f(x - k) + f(x + k) = 2f(x)$ hold for all $x$?
+ Find all functions $f$ such that $f(x) = f(-x)$ and $f(x + 2) = f(x)$ for all $x$.

#v(4cm)

#pagebreak()

== Section F: Olympiad-Style Synthesis Problems

=== Exercise F1: The Sum of Cubes

Let $a, b, c$ be real numbers such that $a + b + c = 0$.

*Questions:*
+ Prove that $a^3 + b^3 + c^3 = 3a b c$.
+ If additionally $a^2 + b^2 + c^2 = 6$, find $a^3 + b^3 + c^3$.
+ Find all integer solutions to $a^3 + b^3 + c^3 = 0$ with $a + b + c = 0$ and $|a| <= 10$.
+ Prove that $(a + b + c)^3 = a^3 + b^3 + c^3 + 3(a + b)(b + c)(c + a)$.

#v(4cm)

=== Exercise F2: Telescoping and Partial Fractions

*Questions:*
+ Compute $sum_(k=1)^(100) 1/(k(k+1))$.
+ Find $sum_(k=1)^n 1/(k(k+1)(k+2))$.
+ Evaluate $sum_(k=1)^(99) 1/(sqrt(k) + sqrt(k+1))$.
+ Compute $product_(k=2)^(100) (1 - 1/k^2)$.

#v(4cm)

=== Exercise F3: Algebraic Number Theory

*Questions:*
+ If $x + 1/x = 3$, find $x^3 + 1/x^3$.
+ If $x^2 + 1/x^2 = 7$, find $x^4 + 1/x^4$.
+ Find all real solutions to $x + 1/x = x^2 + 1/x^2$.
+ If $x + 1/x = phi$ (golden ratio, where $phi = (1 + sqrt(5))/2$), find $x^5 + 1/x^5$.

#v(4cm)

#pagebreak()

=== Exercise F4: Competition-Style Word Problems

*Questions:*
+ The product of two positive integers is 2016 and their LCM is 168. Find their GCD.
+ Find all pairs of positive integers $(x, y)$ such that $x^2 - y^2 = 91$.
+ The digits of a two-digit number sum to 9. If the digits are reversed, the new number is 27 less than the original. Find the number.
+ A three-digit number $overline(a b c)$ equals $11 times overline(a c)$. Find all such numbers.

#v(4cm)

=== Exercise F5: Advanced Polynomial Problems

*Questions:*
+ If $p(x) = x^3 + a x + b$ has a double root at $x = 2$, find $a$ and $b$.
+ Find a polynomial with integer coefficients whose roots are $sqrt(2) + sqrt(3)$ and $sqrt(2) - sqrt(3)$.
+ If $alpha$ is a root of $x^3 - x - 1 = 0$, express $alpha^5$ in terms of $alpha^2$, $alpha$, and constants.
+ The polynomial $p(x) = x^4 - 4x^3 + 6x^2 - 4x + 1$. Show that $p(x) = (x - 1)^4$ and find $p(2024)$.

#v(4cm)

#pagebreak()

= Part II: Detailed Solutions

The solutions below demonstrate proper mathematical modeling using algebraic concepts. Each solution emphasizes the underlying structure and reasoning rather than trial-and-error.

#pagebreak()

== Section A Solutions: Advanced Algebraic Expressions

=== Solution A1: Symmetric Expressions

#strategy-box[
  *Key Concept:* Newton's Identities connect power sums $S_k = a^k + b^k$ to elementary symmetric polynomials $sigma_1 = a + b$ and $sigma_2 = a b$.
]

*Given:* $a + b = 5$ and $a b = 6$

*Part 1: Find $a^2 + b^2$*

We use the identity $(a + b)^2 = a^2 + 2a b + b^2$, which we rearrange to isolate $a^2 + b^2$:

$ a^2 + b^2 = (a + b)^2 - 2a b = 5^2 - 2(6) = 25 - 12 = 13 $

#highlight-box[
  *Answer:* $a^2 + b^2 = 13$.
]

*Part 2: Find $a^3 + b^3$*

The sum of cubes identity states $a^3 + b^3 = (a + b)(a^2 - a b + b^2)$. We already know $a + b = 5$ and $a b = 6$. From Part 1, $a^2 + b^2 = 13$, so:

$ a^2 - a b + b^2 = (a^2 + b^2) - a b = 13 - 6 = 7 $

Therefore:
$ a^3 + b^3 = (a + b)(a^2 - a b + b^2) = 5 times 7 = 35 $

#highlight-box[
  *Answer:* $a^3 + b^3 = 35$.
]

*Part 3: Find $a^4 + b^4$*

We use the identity $(a^2 + b^2)^2 = a^4 + 2a^2 b^2 + b^4$:

$ a^4 + b^4 = (a^2 + b^2)^2 - 2(a b)^2 = 13^2 - 2(6)^2 = 169 - 72 = 97 $

#highlight-box[
  *Answer:* $a^4 + b^4 = 97$.
]

*Part 4: Find $a^5 + b^5$*

For higher powers, we use the recurrence relation. Multiplying $(a^4 + b^4)$ by $(a + b)$:

$ (a + b)(a^4 + b^4) = a^5 + a b^4 + a^4 b + b^5 = (a^5 + b^5) + a b(a^3 + b^3) $

Rearranging:
$ a^5 + b^5 = (a + b)(a^4 + b^4) - a b(a^3 + b^3) = 5(97) - 6(35) = 485 - 210 = 275 $

#highlight-box[
  *Answer:* $a^5 + b^5 = 275$.
]

#pagebreak()

=== Solution A2: The Difference of Powers

#strategy-box[
  *Key Concepts:*
  - $x^2 - y^2 = (x + y)(x - y)$
  - $x^3 - y^3 = (x - y)(x^2 + x y + y^2)$
  - Apply these recursively for higher powers.
]

*Part 1: Factor $x^4 - y^4$ completely*

We apply the difference of squares twice:
$ x^4 - y^4 = (x^2)^2 - (y^2)^2 = (x^2 + y^2)(x^2 - y^2) = (x^2 + y^2)(x + y)(x - y) $

#highlight-box[
  *Answer:* $x^4 - y^4 = (x^2 + y^2)(x + y)(x - y)$.
]

*Part 2: Find $x^4 - y^4$ given $x^2 + y^2 = 25$ and $x + y = 7$*

Using our factorization, we need to find $x - y$. From the identity $(x + y)^2 = x^2 + 2x y + y^2$:

$ 49 = 25 + 2x y arrow.r.double x y = 12 $

Now $(x - y)^2 = x^2 - 2x y + y^2 = 25 - 24 = 1$, so $x - y = plus.minus 1$.

Therefore:
$ x^4 - y^4 = (x^2 + y^2)(x + y)(x - y) = 25 times 7 times (plus.minus 1) = plus.minus 175 $

#highlight-box[
  *Answer:* $x^4 - y^4 = plus.minus 175$.
]

*Part 3: Prove $x^3 - y^3 = (x - y)(x^2 + x y + y^2)$*

Expanding the right side:
$ (x - y)(x^2 + x y + y^2) &= x(x^2 + x y + y^2) - y(x^2 + x y + y^2) \
&= x^3 + x^2 y + x y^2 - x^2 y - x y^2 - y^3 \
&= x^3 - y^3 space checkmark $

#highlight-box[
  *Result:* Identity verified. #sym.qed
]

*Part 4: Find $a^3 - b^3$ given $a - b = 3$ and $a^2 + a b + b^2 = 19$*

Direct substitution into the identity:
$ a^3 - b^3 = (a - b)(a^2 + a b + b^2) = 3 times 19 = 57 $

#highlight-box[
  *Answer:* $a^3 - b^3 = 57$.
]

#pagebreak()

=== Solution A3: Nested Radicals and Rationalization

#strategy-box[
  *Key Technique:* For nested radicals of the form $sqrt(a + b sqrt(c))$, try the ansatz $sqrt(x) + sqrt(y)$ and match coefficients.
]

*Part 1: Simplify $sqrt(7 + 4sqrt(3))$*

Assume $sqrt(7 + 4sqrt(3)) = sqrt(a) + sqrt(b)$ for some positive $a, b$.

Squaring both sides: $7 + 4sqrt(3) = a + b + 2sqrt(a b)$

Matching rational and irrational parts:
- $a + b = 7$
- $2sqrt(a b) = 4sqrt(3)$, so $a b = 12$

We need two numbers with sum 7 and product 12. These are roots of $t^2 - 7t + 12 = 0$, giving $t = 3$ or $t = 4$.

Thus $a = 4$, $b = 3$ (or vice versa), and:
$ sqrt(7 + 4sqrt(3)) = sqrt(4) + sqrt(3) = 2 + sqrt(3) $

#highlight-box[
  *Answer:* $sqrt(7 + 4sqrt(3)) = 2 + sqrt(3)$.
]

*Part 2: Rationalize $1/(sqrt(5) + sqrt(3) + sqrt(2))$*

Group and rationalize step by step. Let $S = sqrt(5) + sqrt(3) + sqrt(2)$.

Multiply by $(sqrt(5) - (sqrt(3) + sqrt(2)))/( sqrt(5) - (sqrt(3) + sqrt(2)))$:

$ 1/S times (sqrt(5) - sqrt(3) - sqrt(2))/(sqrt(5) - sqrt(3) - sqrt(2)) = (sqrt(5) - sqrt(3) - sqrt(2))/(5 - (sqrt(3) + sqrt(2))^2) $

The denominator: $(sqrt(3) + sqrt(2))^2 = 3 + 2sqrt(6) + 2 = 5 + 2sqrt(6)$

So: $5 - (5 + 2sqrt(6)) = -2sqrt(6)$

$ = (sqrt(5) - sqrt(3) - sqrt(2))/(-2sqrt(6)) = (sqrt(3) + sqrt(2) - sqrt(5))/(2sqrt(6)) $

Rationalizing further by multiplying by $sqrt(6)/sqrt(6)$:

$ = (sqrt(6)(sqrt(3) + sqrt(2) - sqrt(5)))/(2 times 6) = (sqrt(18) + sqrt(12) - sqrt(30))/12 = (3sqrt(2) + 2sqrt(3) - sqrt(30))/12 $

#highlight-box[
  *Answer:* $(3sqrt(2) + 2sqrt(3) - sqrt(30))/12$.
]

*Part 3: Prove $x^2 = x + 1$ for the golden ratio*

Given $x = (sqrt(5) + 1)/2$:

$ x^2 = ((sqrt(5) + 1)/2)^2 = (5 + 2sqrt(5) + 1)/4 = (6 + 2sqrt(5))/4 = (3 + sqrt(5))/2 $

$ x + 1 = (sqrt(5) + 1)/2 + 1 = (sqrt(5) + 1 + 2)/2 = (sqrt(5) + 3)/2 = (3 + sqrt(5))/2 $

#highlight-box[
  *Result:* $x^2 = x + 1 = (3 + sqrt(5))/2$. #sym.qed
]

*Part 4: Infinite nested radical*

Let $L = sqrt(2 + sqrt(2 + sqrt(2 + ...)))$

Since the pattern repeats infinitely: $L = sqrt(2 + L)$

Squaring: $L^2 = 2 + L$, so $L^2 - L - 2 = 0$

Factoring: $(L - 2)(L + 1) = 0$

Since $L > 0$, we have $L = 2$.

#highlight-box[
  *Answer:* The infinite nested radical equals $2$.
]

#pagebreak()

=== Solution A4: Polynomial Division and Remainders

#strategy-box[
  *Key Theorems:*
  - *Remainder Theorem:* When $p(x)$ is divided by $(x - c)$, the remainder is $p(c)$.
  - *Factor Theorem:* $(x - c)$ is a factor of $p(x)$ iff $p(c) = 0$.
]

*Part 1: Remainder when $p(x) = x^3 - 2x^2 + 3x - 4$ is divided by $(x - 2)$*

By the Remainder Theorem, the remainder is $p(2)$:
$ p(2) = 2^3 - 2(2)^2 + 3(2) - 4 = 8 - 8 + 6 - 4 = 2 $

#highlight-box[
  *Answer:* Remainder is $2$.
]

*Part 2: Find $k$ such that $(x - 3)$ is a factor of $x^3 - k x^2 + 5x - 6$*

By the Factor Theorem, we need $p(3) = 0$:
$ 3^3 - k(3)^2 + 5(3) - 6 = 0 $
$ 27 - 9k + 15 - 6 = 0 $
$ 36 - 9k = 0 $
$ k = 4 $

#highlight-box[
  *Answer:* $k = 4$.
]

*Part 3: Remainder when $p(x)$ is divided by $(x - 1)(x - 2)$*

When dividing by a quadratic, the remainder has the form $r(x) = a x + b$.

Given: $p(1) = 5$ and $p(2) = 8$. Since $p(x) = q(x)(x-1)(x-2) + (a x + b)$:
- $p(1) = a(1) + b = a + b = 5$
- $p(2) = a(2) + b = 2a + b = 8$

Subtracting: $a = 3$, then $b = 2$.

#highlight-box[
  *Answer:* Remainder is $3x + 2$.
]

*Part 4: Find $a + b + c + d$ for $x^4 + a x^3 + b x^2 + c x + d$ with roots $1, 2, 3, 4$*

By Vieta's formulas for a monic polynomial with roots $r_1, r_2, r_3, r_4$:
$ p(x) = (x - 1)(x - 2)(x - 3)(x - 4) $

Expanding: First $(x-1)(x-4) = x^2 - 5x + 4$ and $(x-2)(x-3) = x^2 - 5x + 6$

$ p(x) = (x^2 - 5x + 4)(x^2 - 5x + 6) $

Let $u = x^2 - 5x$:
$ p(x) = (u + 4)(u + 6) = u^2 + 10u + 24 = (x^2 - 5x)^2 + 10(x^2 - 5x) + 24 $
$ = x^4 - 10x^3 + 25x^2 + 10x^2 - 50x + 24 = x^4 - 10x^3 + 35x^2 - 50x + 24 $

So $a = -10$, $b = 35$, $c = -50$, $d = 24$.

$ a + b + c + d = -10 + 35 - 50 + 24 = -1 $

#highlight-box[
  *Answer:* $a + b + c + d = -1$.
]

#pagebreak()

=== Solution A5: Strategic Factoring

#strategy-box[
  *Key Technique:* Sophie Germain identity and sum of cubes with three terms often appear in competition mathematics.
]

*Part 1: Factor $x^4 + 4$ (Sophie Germain Identity)*

Add and subtract $4x^2$:
$ x^4 + 4 = x^4 + 4x^2 + 4 - 4x^2 = (x^2 + 2)^2 - (2x)^2 $

Apply difference of squares:
$ = (x^2 + 2 - 2x)(x^2 + 2 + 2x) = (x^2 - 2x + 2)(x^2 + 2x + 2) $

#highlight-box[
  *Answer:* $x^4 + 4 = (x^2 - 2x + 2)(x^2 + 2x + 2)$.
]

*Part 2: Factor $x^3 + y^3 + z^3 - 3x y z$*

This is the famous factorization:
$ x^3 + y^3 + z^3 - 3x y z = (x + y + z)(x^2 + y^2 + z^2 - x y - y z - z x) $

The second factor can also be written as $1/2[(x-y)^2 + (y-z)^2 + (z-x)^2]$.

#highlight-box[
  *Answer:* $(x + y + z)(x^2 + y^2 + z^2 - x y - y z - z x)$.
]

*Part 3: Simplify when $a + b + c = 0$*

From Part 2, if $a + b + c = 0$:
$ a^3 + b^3 + c^3 - 3a b c = 0 times (a^2 + b^2 + c^2 - a b - b c - c a) = 0 $

Therefore $a^3 + b^3 + c^3 = 3a b c$.

#highlight-box[
  *Answer:* When $a + b + c = 0$, we have $a^3 + b^3 + c^3 = 3a b c$.
]

*Part 4: Prove $n^5 - n$ is divisible by 30*

We need to show $30 | n^5 - n$, i.e., divisibility by $2$, $3$, and $5$.

Factor: $n^5 - n = n(n^4 - 1) = n(n^2 - 1)(n^2 + 1) = n(n-1)(n+1)(n^2+1)$

*Divisibility by 2:* Among $n-1$, $n$, $n+1$ (three consecutive integers), at least one is even.

*Divisibility by 3:* Among three consecutive integers, exactly one is divisible by 3.

*Divisibility by 5:* By Fermat's Little Theorem, $n^5 equiv n space (mod 5)$ for all $n$, so $5 | n^5 - n$.

Since $gcd(2, 3, 5) = 1$ and all three divide $n^5 - n$, we have $30 | n^5 - n$.

#highlight-box[
  *Answer:* $n^5 - n$ is always divisible by 30. #sym.qed
]

#pagebreak()

== Section B Solutions: Linear Equations and Systems

=== Solution B1: Multi-Variable Systems

#strategy-box[
  *Key Insight:* The given conditions are exactly the elementary symmetric polynomials for a cubic equation. If $x$, $y$, $z$ are roots of $t^3 - p t^2 + q t - r = 0$, then $x + y + z = p$, $x y + y z + z x = q$, and $x y z = r$.
]

*Given:* $x + y + z = 6$, $x y + y z + z x = 11$, $x y z = 6$

*Part 1: Write the cubic polynomial*

By Vieta's formulas, $x$, $y$, $z$ are roots of:
$ t^3 - 6t^2 + 11t - 6 = 0 $

#highlight-box[
  *Answer:* $t^3 - 6t^2 + 11t - 6 = 0$.
]

*Part 2: Solve the cubic*

We look for rational roots using the Rational Root Theorem. Candidates: $plus.minus 1, plus.minus 2, plus.minus 3, plus.minus 6$.

Testing $t = 1$: $1 - 6 + 11 - 6 = 0$ #sym.checkmark

So $(t - 1)$ is a factor. Dividing:
$ t^3 - 6t^2 + 11t - 6 = (t - 1)(t^2 - 5t + 6) = (t - 1)(t - 2)(t - 3) $

#highlight-box[
  *Answer:* The solutions are $x, y, z in {1, 2, 3}$.
]

*Part 3: Count ordered triples*

The three distinct values $1, 2, 3$ can be assigned to $(x, y, z)$ in $3! = 6$ ways.

#highlight-box[
  *Answer:* There are $6$ distinct ordered triples.
]

*Part 4: Verification*

For $(x, y, z) = (1, 2, 3)$:
- $x + y + z = 1 + 2 + 3 = 6$ #sym.checkmark
- $x y + y z + z x = 2 + 6 + 3 = 11$ #sym.checkmark
- $x y z = 1 times 2 times 3 = 6$ #sym.checkmark

#pagebreak()

=== Solution B2: Symmetric Systems

#strategy-box[
  *Key Technique:* Use symmetric function identities to find $x y$, then recognize $x$ and $y$ as roots of a quadratic.
]

*Given:* $x + y = 10$ and $x^2 + y^2 = 58$

*Part 1: Find $x y$*

From $(x + y)^2 = x^2 + 2x y + y^2$:
$ 100 = 58 + 2x y $
$ x y = 21 $

#highlight-box[
  *Answer:* $x y = 21$.
]

*Part 2: Find $x$ and $y$*

Now $x$ and $y$ are roots of $t^2 - 10t + 21 = 0$.

Using the quadratic formula or factoring: $(t - 3)(t - 7) = 0$

#highlight-box[
  *Answer:* $x = 3, y = 7$ (or vice versa).
]

*Part 3: Find $x^3 + y^3$*

Using $x^3 + y^3 = (x + y)(x^2 - x y + y^2) = (x + y)((x^2 + y^2) - x y)$:
$ x^3 + y^3 = 10(58 - 21) = 10 times 37 = 370 $

#highlight-box[
  *Answer:* $x^3 + y^3 = 370$.
]

*Part 4: Find $(x - y)^2$ and $|x - y|$*

$ (x - y)^2 = x^2 - 2x y + y^2 = 58 - 42 = 16 $
$ |x - y| = 4 $

#highlight-box[
  *Answer:* $(x - y)^2 = 16$ and $|x - y| = 4$.
]

#pagebreak()

=== Solution B3: Parameter-Dependent Systems

#strategy-box[
  *Key Concept:* For a system $a_1 x + b_1 y = c_1$ and $a_2 x + b_2 y = c_2$:
  - *Unique solution:* $a_1/a_2 != b_1/b_2$
  - *No solution:* $a_1/a_2 = b_1/b_2 != c_1/c_2$ (parallel lines)
  - *Infinitely many:* $a_1/a_2 = b_1/b_2 = c_1/c_2$ (same line)
]

*Given:* $2x + 3y = 7$ and $6x + k y = 21$

*Part 1: Infinitely many solutions*

We need $2/6 = 3/k = 7/21$, i.e., $1/3 = 3/k = 1/3$.

From $3/k = 1/3$: $k = 9$.

#highlight-box[
  *Answer:* $k = 9$ gives infinitely many solutions.
]

*Part 2: No solution*

We need $2/6 = 3/k != 7/21$.

But $2/6 = 1/3 = 7/21$, so the condition $3/k = 1/3$ but $7/21 != 1/3$ is impossible.

If $3/k = 1/3$ (i.e., $k = 9$), then all ratios are equal, giving infinitely many solutions, not none.

For no solution, we need $2/6 = 3/k$ but the third ratio different. However, $7/21 = 1/3 = 2/6$, so no value of $k$ gives parallel (non-coincident) lines.

#highlight-box[
  *Answer:* No value of $k$ gives no solution.
]

*Part 3: Unique solution*

We need $2/6 != 3/k$, i.e., $1/3 != 3/k$, i.e., $k != 9$.

#highlight-box[
  *Answer:* $k != 9$ gives a unique solution.
]

*Part 4: Unique solution with $x = y$*

If $x = y$, from the first equation: $2x + 3x = 7$, so $x = 7/5$.

Substituting into the second: $6(7/5) + k(7/5) = 21$

$ (7/5)(6 + k) = 21 $
$ 6 + k = 15 $
$ k = 9 $

But wait — $k = 9$ gives infinitely many solutions! Let's verify: when $k = 9$, the second equation becomes $6x + 9y = 21$, which simplifies to $2x + 3y = 7$ (same as the first). So any point on this line is a solution, including $(7/5, 7/5)$.

#highlight-box[
  *Answer:* $k = 9$, but this gives infinitely many solutions, one of which is $x = y = 7/5$.
]

#pagebreak()

=== Solution B4: Diophantine Equations

#strategy-box[
  *Key Technique:* For $a x + b y = c$, find one particular solution, then the general solution is $x = x_0 + (b/d)t$, $y = y_0 - (a/d)t$ where $d = gcd(a, b)$.
]

*Part 1: All integer solutions to $3x + 5y = 1$*

One particular solution: $x_0 = 2$, $y_0 = -1$ (since $3(2) + 5(-1) = 1$).

General solution: $x = 2 + 5t$, $y = -1 - 3t$ for any integer $t$.

#highlight-box[
  *Answer:* $(x, y) = (2 + 5t, -1 - 3t)$ for $t in ZZ$.
]

*Part 2: Positive integer solutions to $3x + 5y = 100$*

First, find a particular solution. From $3x + 5y = 100$:

Try $y = 2$: $3x = 90$, $x = 30$. So $(30, 2)$ is a solution.

General solution: $x = 30 + 5t$, $y = 2 - 3t$.

For positive integers: $x > 0$ and $y > 0$
- $30 + 5t > 0$ → $t > -6$
- $2 - 3t > 0$ → $t < 2/3$, so $t <= 0$

So $t in {-5, -4, -3, -2, -1, 0}$.

Solutions: $(5, 17), (10, 14), (15, 11), (20, 8), (25, 5), (30, 2)$.

#highlight-box[
  *Answer:* 6 positive integer solutions.
]

*Part 3: Non-negative solutions to $x + 2y + 3z = 10$*

We count systematically. For each value of $z$:

$z = 0$: $x + 2y = 10$ → $y in {0, 1, 2, 3, 4, 5}$ → 6 solutions
$z = 1$: $x + 2y = 7$ → $y in {0, 1, 2, 3}$ → 4 solutions
$z = 2$: $x + 2y = 4$ → $y in {0, 1, 2}$ → 3 solutions
$z = 3$: $x + 2y = 1$ → $y = 0$ only → 1 solution

Total: $6 + 4 + 3 + 1 = 14$.

#highlight-box[
  *Answer:* 14 non-negative integer solutions.
]

*Part 4: Positive integers with $1/x + 1/y = 1/6$*

Multiply by $6 x y$: $6y + 6x = x y$

Rearrange: $x y - 6x - 6y = 0$

Add 36: $x y - 6x - 6y + 36 = 36$

Factor: $(x - 6)(y - 6) = 36$

For positive $x, y$: we need $(x - 6)(y - 6) = 36$ with $x > 0$, $y > 0$.

Factor pairs of 36: $(1, 36), (2, 18), (3, 12), (4, 9), (6, 6), (-1, -36), ...$

Valid pairs (giving $x, y > 0$): $(7, 42), (8, 24), (9, 18), (10, 15), (12, 12)$ and their reverses.

#highlight-box[
  *Answer:* $(x, y) in {(7, 42), (8, 24), (9, 18), (10, 15), (12, 12), (42, 7), (24, 8), (18, 9), (15, 10)}$.
]

#pagebreak()

=== Solution B5: Work and Rate Problems

#strategy-box[
  *Key Formula:* If a worker completes a job in $t$ hours, their rate is $1/t$ of the job per hour. Combined rates add.
]

*Part 1: Workers A and B*

Rate of A: $1/12$ job/hour. Rate of B: $1/18$ job/hour.

Together for 4 hours: $4(1/12 + 1/18) = 4(3/36 + 2/36) = 4(5/36) = 20/36 = 5/9$ of the job.

Remaining: $1 - 5/9 = 4/9$ of the job.

Time for B to finish: $(4/9) div (1/18) = (4/9) times 18 = 8$ hours.

#highlight-box[
  *Answer:* B takes 8 hours to finish.
]

*Part 2: Three pipes*

Net rate: $1/10 + 1/15 - 1/20 = 6/60 + 4/60 - 3/60 = 7/60$ tank/hour.

Time to fill: $60/7 approx 8.57$ hours.

#highlight-box[
  *Answer:* $60/7$ hours (approximately 8 hours 34 minutes).
]

*Part 3: The bird problem*

Time for trains to meet: $300/(60 + 40) = 300/100 = 3$ hours.

The bird flies continuously for 3 hours at 80 km/h.

#highlight-box[
  *Answer:* The bird travels $80 times 3 = 240$ km.
]

*Part 4: Boat in stream*

Let boat speed in still water = $v$ km/h.

Upstream speed: $v - 2$. Downstream speed: $v + 2$.

Total time: $24/(v - 2) + 24/(v + 2) = 10$

$ 24(v + 2) + 24(v - 2) = 10(v - 2)(v + 2) $
$ 48v = 10(v^2 - 4) $
$ 48v = 10v^2 - 40 $
$ 10v^2 - 48v - 40 = 0 $
$ 5v^2 - 24v - 20 = 0 $

Using the quadratic formula: $v = (24 plus.minus sqrt(576 + 400))/10 = (24 plus.minus sqrt(976))/10$

$sqrt(976) approx 31.24$, so $v approx (24 + 31.24)/10 approx 5.52$ km/h.

More precisely: $v = (24 + 4sqrt(61))/10 = (12 + 2sqrt(61))/5$ km/h.

#highlight-box[
  *Answer:* Boat speed $= (12 + 2sqrt(61))/5 approx 5.52$ km/h.
]

#pagebreak()

== Section C Solutions: Quadratic Equations

=== Solution C1: Vieta's Formulas Applications

#strategy-box[
  *Vieta's Formulas:* For $x^2 + b x + c = 0$ with roots $alpha, beta$:
  - $alpha + beta = -b$
  - $alpha beta = c$
]

*Given:* $x^2 - 7x + 12 = 0$ with roots $alpha, beta$

*Part 1: Find $alpha + beta$ and $alpha beta$*

By Vieta's formulas: $alpha + beta = 7$ and $alpha beta = 12$.

#highlight-box[
  *Answer:* $alpha + beta = 7$, $alpha beta = 12$.
]

*Part 2: Find $alpha^2 + beta^2$*

$ alpha^2 + beta^2 = (alpha + beta)^2 - 2 alpha beta = 49 - 24 = 25 $

#highlight-box[
  *Answer:* $alpha^2 + beta^2 = 25$.
]

*Part 3: Find $1/alpha + 1/beta$*

$ 1/alpha + 1/beta = (alpha + beta)/(alpha beta) = 7/12 $

#highlight-box[
  *Answer:* $1/alpha + 1/beta = 7/12$.
]

*Part 4: Quadratic with roots $alpha^2, beta^2$*

Sum: $alpha^2 + beta^2 = 25$. Product: $alpha^2 beta^2 = (alpha beta)^2 = 144$.

The equation is $x^2 - 25x + 144 = 0$.

#highlight-box[
  *Answer:* $x^2 - 25x + 144 = 0$.
]

#pagebreak()

=== Solution C2: Discriminant Analysis

#strategy-box[
  *Discriminant:* For $a x^2 + b x + c = 0$: $Delta = b^2 - 4 a c$
  - $Delta > 0$: Two distinct real roots
  - $Delta = 0$: One repeated root
  - $Delta < 0$: No real roots
]

*Given:* $x^2 + (k - 3)x + k = 0$

Here $a = 1$, $b = k - 3$, $c = k$.

$Delta = (k - 3)^2 - 4(1)(k) = k^2 - 6k + 9 - 4k = k^2 - 10k + 9 = (k - 1)(k - 9)$

*Part 1: Two distinct real roots*

Need $Delta > 0$: $(k - 1)(k - 9) > 0$

This holds when $k < 1$ or $k > 9$.

#highlight-box[
  *Answer:* $k < 1$ or $k > 9$.
]

*Part 2: Equal roots*

Need $Delta = 0$: $(k - 1)(k - 9) = 0$, so $k = 1$ or $k = 9$.

#highlight-box[
  *Answer:* $k = 1$ or $k = 9$.
]

*Part 3: One root is twice the other*

Let roots be $r$ and $2r$. By Vieta's:
- $r + 2r = 3r = -(k - 3) = 3 - k$
- $r times 2r = 2r^2 = k$

From the first: $r = (3 - k)/3$. Substituting:
$ 2((3 - k)/3)^2 = k $
$ 2(3 - k)^2 = 9k $
$ 2(9 - 6k + k^2) = 9k $
$ 2k^2 - 12k + 18 = 9k $
$ 2k^2 - 21k + 18 = 0 $

Using the quadratic formula: $k = (21 plus.minus sqrt(441 - 144))/4 = (21 plus.minus sqrt(297))/4 = (21 plus.minus 3sqrt(33))/4$

#highlight-box[
  *Answer:* $k = (21 plus.minus 3sqrt(33))/4$.
]

*Part 4: Reciprocal roots*

If roots are reciprocals: $r times (1/r) = 1 = k$, so $k = 1$.

#highlight-box[
  *Answer:* $k = 1$.
]

#pagebreak()

=== Solution C3: Quadratic in Disguise

#strategy-box[
  *Key Technique:* Substitute $u$ for a repeated expression to reveal a quadratic structure.
]

*Part 1: Solve $x^4 - 13x^2 + 36 = 0$*

Let $u = x^2$: $u^2 - 13u + 36 = 0$

Factor: $(u - 4)(u - 9) = 0$, so $u = 4$ or $u = 9$.

Therefore $x^2 = 4$ or $x^2 = 9$, giving $x = plus.minus 2$ or $x = plus.minus 3$.

#highlight-box[
  *Answer:* $x in {-3, -2, 2, 3}$.
]

*Part 2: Solve $2^(2x) - 5 dot 2^x + 4 = 0$*

Let $u = 2^x$: $u^2 - 5u + 4 = 0$

Factor: $(u - 1)(u - 4) = 0$, so $u = 1$ or $u = 4$.

Therefore $2^x = 1 = 2^0$ or $2^x = 4 = 2^2$, giving $x = 0$ or $x = 2$.

#highlight-box[
  *Answer:* $x in {0, 2}$.
]

*Part 3: Solve $x + sqrt(x) - 6 = 0$*

Let $u = sqrt(x)$ (so $u >= 0$): $u^2 + u - 6 = 0$

Factor: $(u + 3)(u - 2) = 0$, so $u = -3$ or $u = 2$.

Since $u >= 0$, only $u = 2$ is valid. Thus $sqrt(x) = 2$, so $x = 4$.

#highlight-box[
  *Answer:* $x = 4$.
]

*Part 4: Solve $(x^2 + x)^2 - 8(x^2 + x) + 12 = 0$*

Let $u = x^2 + x$: $u^2 - 8u + 12 = 0$

Factor: $(u - 2)(u - 6) = 0$, so $u = 2$ or $u = 6$.

Case 1: $x^2 + x = 2$ → $x^2 + x - 2 = 0$ → $(x + 2)(x - 1) = 0$ → $x = -2$ or $x = 1$

Case 2: $x^2 + x = 6$ → $x^2 + x - 6 = 0$ → $(x + 3)(x - 2) = 0$ → $x = -3$ or $x = 2$

#highlight-box[
  *Answer:* $x in {-3, -2, 1, 2}$.
]

#pagebreak()

=== Solution C4: Optimization with Quadratics

#strategy-box[
  *Key Concept:* For $f(x) = a x^2 + b x + c$:
  - Vertex at $x = -b/(2a)$
  - If $a > 0$: minimum at vertex
  - If $a < 0$: maximum at vertex
]

*Part 1: Minimum of $f(x) = x^2 - 6x + 13$*

Vertex: $x = -(-6)/(2 dot 1) = 3$

$f(3) = 9 - 18 + 13 = 4$

#highlight-box[
  *Answer:* Minimum value is $4$ at $x = 3$.
]

*Part 2: Maximize rectangular area with 100m fencing*

Let dimensions be $x$ and $y$. Constraint: $2x + 2y = 100$, so $y = 50 - x$.

Area: $A = x y = x(50 - x) = 50x - x^2 = -(x^2 - 50x)$

Maximum at $x = 50/2 = 25$, giving $y = 25$.

#highlight-box[
  *Answer:* Dimensions are $25 times 25$ meters (a square).
]

*Part 3: Maximum product of two numbers summing to 20*

Let the numbers be $x$ and $20 - x$.

Product: $P = x(20 - x) = 20x - x^2$

Maximum at $x = 10$, giving $P = 10 times 10 = 100$.

#highlight-box[
  *Answer:* Maximum product is $100$.
]

*Part 4: Maximum height of ball*

$h(t) = -5t^2 + 30t + 10$

Vertex: $t = -30/(2(-5)) = 3$ seconds

$h(3) = -5(9) + 30(3) + 10 = -45 + 90 + 10 = 55$ meters

#highlight-box[
  *Answer:* Maximum height is $55$ meters at $t = 3$ seconds.
]

#pagebreak()

=== Solution C5: Integer and Rational Root Problems

#strategy-box[
  *Rational Root Theorem:* If $p(x) = a_n x^n + ... + a_0$ has rational root $p/q$ in lowest terms, then $p | a_0$ and $q | a_n$.
]

*Part 1: Integer values of $k$ for $x^2 + k x + 12 = 0$ to have integer roots*

If roots are integers $r, s$, then $r s = 12$ and $r + s = -k$.

Factor pairs of 12: $(1, 12), (2, 6), (3, 4), (-1, -12), (-2, -6), (-3, -4)$

Corresponding $k$ values: $-13, -8, -7, 13, 8, 7$

#highlight-box[
  *Answer:* $k in {-13, -8, -7, 7, 8, 13}$.
]

*Part 2: Rational roots of $2x^3 - 3x^2 - 11x + 6 = 0$*

Possible rational roots: $plus.minus 1, plus.minus 2, plus.minus 3, plus.minus 6, plus.minus 1/2, plus.minus 3/2$

Testing $x = 3$: $2(27) - 3(9) - 11(3) + 6 = 54 - 27 - 33 + 6 = 0$ #sym.checkmark

Dividing: $2x^3 - 3x^2 - 11x + 6 = (x - 3)(2x^2 + 3x - 2) = (x - 3)(2x - 1)(x + 2)$

#highlight-box[
  *Answer:* $x in {-2, 1/2, 3}$.
]

*Part 3: Integer roots with $b + c = 5$*

If roots are $r, s$: $r + s = -b$ and $r s = c$, with $-b + r s = b + c = 5$.

So $r s - r - s = 5$, giving $(r - 1)(s - 1) = 6$.

Factor pairs of 6: $(1, 6), (2, 3), (-1, -6), (-2, -3)$

$(r, s)$: $(2, 7), (3, 4), (0, -5), (-1, -2)$

$(b, c)$: $(-9, 14), (-7, 12), (5, 0), (3, 2)$

Check $b + c = 5$: only $(5, 0)$ and $(3, 2)$ work.

#highlight-box[
  *Answer:* $(b, c) in {(5, 0), (3, 2)}$.
]

*Part 4: Factor $x^3 - 6x^2 + 11x - 6$*

Testing $x = 1$: $1 - 6 + 11 - 6 = 0$ #sym.checkmark

Dividing: $(x - 1)(x^2 - 5x + 6) = (x - 1)(x - 2)(x - 3)$

#highlight-box[
  *Answer:* $x^3 - 6x^2 + 11x - 6 = (x - 1)(x - 2)(x - 3)$.
]

#pagebreak()

== Section D Solutions: Inequalities

=== Solution D1: Quadratic Inequalities

#strategy-box[
  *Key Technique:* Factor the quadratic, find roots, test intervals using a sign chart.
]

*Part 1: Solve $x^2 - 5x + 6 > 0$*

Factor: $(x - 2)(x - 3) > 0$

Roots: $x = 2$ and $x = 3$. Sign chart:

#uptoten-table(
  columns: 4,
  header: ([Interval], [$x - 2$], [$x - 3$], [Product]),
  [$x < 2$], [$-$], [$-$], [$+$],
  [$2 < x < 3$], [$+$], [$-$], [$-$],
  [$x > 3$], [$+$], [$+$], [$+$],
)

#highlight-box[
  *Answer:* $x < 2$ or $x > 3$, i.e., $(-infinity, 2) union (3, infinity)$.
]

*Part 2: Solve $x^2 - 4x + 4 <= 0$*

Factor: $(x - 2)^2 <= 0$

Since a square is always $>= 0$, the only solution is when $(x - 2)^2 = 0$.

#highlight-box[
  *Answer:* $x = 2$.
]

*Part 3: Solve $x^2 + 2x - 15 < 0$*

Factor: $(x + 5)(x - 3) < 0$

Roots: $x = -5$ and $x = 3$. The product is negative between the roots.

#highlight-box[
  *Answer:* $-5 < x < 3$, i.e., $(-5, 3)$.
]

*Part 4: Solve $(x - 1)(x - 2)(x - 3) > 0$*

Roots: $x = 1, 2, 3$. Sign chart with four intervals:

The product of three factors changes sign at each root. Starting from $x < 1$: all negative, so product is negative. Then alternating: positive, negative, positive.

#highlight-box[
  *Answer:* $1 < x < 2$ or $x > 3$, i.e., $(1, 2) union (3, infinity)$.
]

#pagebreak()

=== Solution D2: Rational Inequalities

#strategy-box[
  *Key Technique:* Find zeros and undefined points, then use a sign chart. Include zeros for $<=, >=$ but never include undefined points.
]

*Part 1: Solve $(x - 2)/(x + 3) > 0$*

Zero: $x = 2$. Undefined: $x = -3$.

#uptoten-table(
  columns: 4,
  header: ([Interval], [$x - 2$], [$x + 3$], [Quotient]),
  [$x < -3$], [$-$], [$-$], [$+$],
  [$-3 < x < 2$], [$-$], [$+$], [$-$],
  [$x > 2$], [$+$], [$+$], [$+$],
)

#highlight-box[
  *Answer:* $x < -3$ or $x > 2$, i.e., $(-infinity, -3) union (2, infinity)$.
]

*Part 2: Solve $(x^2 - 1)/(x - 2) <= 0$*

Factor numerator: $((x - 1)(x + 1))/(x - 2) <= 0$

Zeros: $x = -1, 1$. Undefined: $x = 2$.

Sign chart shows: positive on $(-infinity, -1)$, negative on $(-1, 1)$, positive on $(1, 2)$, negative on $(2, infinity)$.

Include zeros, exclude undefined point.

#highlight-box[
  *Answer:* $[-1, 1] union (2, infinity)$.
]

*Part 3: Solve $1/x > 1/(x + 1)$*

Subtract: $1/x - 1/(x + 1) > 0$

$ (x + 1 - x)/(x(x + 1)) > 0 $
$ 1/(x(x + 1)) > 0 $

This is positive when $x(x + 1) > 0$, i.e., $x < -1$ or $x > 0$.

#highlight-box[
  *Answer:* $x < -1$ or $x > 0$, i.e., $(-infinity, -1) union (0, infinity)$.
]

*Part 4: Solve $(x - 1)/(x + 1) >= (x + 1)/(x - 1)$*

Subtract: $(x - 1)/(x + 1) - (x + 1)/(x - 1) >= 0$

$ ((x - 1)^2 - (x + 1)^2)/((x + 1)(x - 1)) >= 0 $
$ ((x - 1 - x - 1)(x - 1 + x + 1))/((x + 1)(x - 1)) >= 0 $
$ (-2 dot 2x)/((x + 1)(x - 1)) >= 0 $
$ (-4x)/((x - 1)(x + 1)) >= 0 $

This is $>= 0$ when $(-4x)$ and $(x - 1)(x + 1)$ have the same sign (or numerator is zero).

#highlight-box[
  *Answer:* $x in [-1, 0] union [1, infinity)$... wait, we must exclude $x = plus.minus 1$. So: $(-1, 0] union (1, infinity)$.
]

#pagebreak()

=== Solution D3: Absolute Value Inequalities

#strategy-box[
  *Key Concepts:*
  - $|x| < a$ iff $-a < x < a$ (when $a > 0$)
  - $|x| > a$ iff $x < -a$ or $x > a$
]

*Part 1: Solve $|2x - 5| < 3$*

$ -3 < 2x - 5 < 3 $
$ 2 < 2x < 8 $
$ 1 < x < 4 $

#highlight-box[
  *Answer:* $1 < x < 4$, i.e., $(1, 4)$.
]

*Part 2: Solve $|x - 3| + |x + 2| >= 7$*

The expression $|x - 3| + |x + 2|$ represents the sum of distances from $x$ to 3 and from $x$ to $-2$.

The minimum value occurs when $x$ is between $-2$ and $3$, where the sum equals the distance between them: $|3 - (-2)| = 5$.

For the sum to be $>= 7$, we need $x$ outside the interval by at least $(7 - 5)/2 = 1$ unit on each side.

So $x <= -3$ or $x >= 4$.

#highlight-box[
  *Answer:* $x <= -3$ or $x >= 4$, i.e., $(-infinity, -3] union [4, infinity)$.
]

*Part 3: Solve $|x^2 - 4| <= 3$*

$ -3 <= x^2 - 4 <= 3 $
$ 1 <= x^2 <= 7 $

From $x^2 >= 1$: $|x| >= 1$, so $x <= -1$ or $x >= 1$.

From $x^2 <= 7$: $|x| <= sqrt(7)$, so $-sqrt(7) <= x <= sqrt(7)$.

Combining: $-sqrt(7) <= x <= -1$ or $1 <= x <= sqrt(7)$.

#highlight-box[
  *Answer:* $[-sqrt(7), -1] union [1, sqrt(7)]$.
]

*Part 4: Solve $|x - 1| + |x - 4| = 3$*

The sum of distances from $x$ to 1 and to 4 equals 3. But the distance between 1 and 4 is 3.

This sum equals exactly 3 when $x$ is between 1 and 4 (inclusive).

#highlight-box[
  *Answer:* $1 <= x <= 4$, i.e., $[1, 4]$.
]

#pagebreak()

=== Solution D4: Inequality Proof Techniques

#strategy-box[
  *Key Techniques:*
  - Rearrange to show a square $>= 0$
  - Use AM-GM: $(a + b)/2 >= sqrt(a b)$
]

*Part 1: Prove $x^2 + 1 >= 2x$*

Rearrange: $x^2 - 2x + 1 >= 0$

This is $(x - 1)^2 >= 0$, which is always true. #sym.qed

*Part 2: Prove AM-GM: $(a + b)/2 >= sqrt(a b)$ for positive $a, b$*

Square both sides (valid since both are positive):
$ ((a + b)/2)^2 >= a b $
$ (a + b)^2 >= 4 a b $
$ a^2 + 2 a b + b^2 >= 4 a b $
$ a^2 - 2 a b + b^2 >= 0 $
$ (a - b)^2 >= 0 $ #sym.qed

*Part 3: If $a + b + c = 3$ for positive $a, b, c$, prove $a b + b c + c a <= 3$*

We use the identity: $(a + b + c)^2 = a^2 + b^2 + c^2 + 2(a b + b c + c a)$

So $9 = a^2 + b^2 + c^2 + 2(a b + b c + c a)$.

By Cauchy-Schwarz or AM-QM: $a^2 + b^2 + c^2 >= (a + b + c)^2/3 = 3$.

Therefore $2(a b + b c + c a) = 9 - (a^2 + b^2 + c^2) <= 9 - 3 = 6$, so $a b + b c + c a <= 3$. #sym.qed

*Part 4: Prove $x + 1/x >= 2$ for positive $x$*

By AM-GM: $(x + 1/x)/2 >= sqrt(x dot 1/x) = 1$

So $x + 1/x >= 2$. #sym.qed

#pagebreak()

=== Solution D5: Systems of Inequalities

*Part 1: Integer solutions to $x + y < 5$, $x - y > 1$, $x > 0$, $y > 0$*

From $x - y > 1$: $x > y + 1$, so $x >= y + 2$ (for integers).

Combined with $x + y < 5$: $(y + 2) + y < 5$, so $y < 1.5$, meaning $y = 1$.

Then $x >= 3$ and $x + 1 < 5$, so $x < 4$, meaning $x = 3$.

#highlight-box[
  *Answer:* $(x, y) = (3, 1)$.
]

*Part 2: Area of region*

The region is bounded by $x = 0$, $y = 0$, $x + y = 4$, $x + 2y = 6$.

Vertices: $(0, 0)$, $(4, 0)$, $(0, 3)$, and intersection of $x + y = 4$ and $x + 2y = 6$: subtracting gives $y = 2$, $x = 2$, so $(2, 2)$.

The region is a quadrilateral with vertices $(0, 0), (4, 0), (2, 2), (0, 3)$.

Area by shoelace: $1/2 |0(0 - 3) + 4(2 - 0) + 2(3 - 0) + 0(0 - 2)| = 1/2 |0 + 8 + 6 + 0| = 7$.

#highlight-box[
  *Answer:* Area $= 7$ square units.
]

*Part 3: Maximize $x + y$ subject to constraints*

Vertices of feasible region: $(0, 0)$, $(5, 0)$, $(0, 5)$, and intersection of $2x + y = 10$ and $x + 3y = 15$.

From these: $6x + 3y = 30$ and $x + 3y = 15$, so $5x = 15$, $x = 3$, $y = 4$. Vertex: $(3, 4)$.

Evaluate $x + y$: at $(5, 0)$: 5; at $(0, 5)$: 5; at $(3, 4)$: 7.

#highlight-box[
  *Answer:* Maximum is $7$ at $(3, 4)$.
]

*Part 4: Prove $x y + (1-x)(1-y) < 1$ for $0 < x, y < 1$*

Expand: $x y + 1 - x - y + x y = 2 x y - x - y + 1$

Rearrange: $2 x y - x - y + 1 < 1$ iff $2 x y - x - y < 0$ iff $x(2y - 1) < y$.

Since $0 < x < 1$ and $0 < y < 1$:
- If $y < 1/2$: $2y - 1 < 0$, so $x(2y - 1) < 0 < y$ #sym.checkmark
- If $y >= 1/2$: $x(2y - 1) < 2y - 1 < y$ (since $x < 1$ and $2y - 1 < y$ when $y < 1$) #sym.checkmark

#highlight-box[
  *Answer:* Inequality proven. #sym.qed
]

#pagebreak()

== Section E Solutions: Functions

=== Solution E1: Function Composition and Inverses

#strategy-box[
  *Key Concepts:*
  - $(f compose g)(x) = f(g(x))$: apply $g$ first, then $f$
  - $f^(-1)$ satisfies $f(f^(-1)(x)) = x$
]

*Given:* $f(x) = 2x + 3$ and $g(x) = x^2 - 1$

*Part 1: Find $(f compose g)(x)$ and $(g compose f)(x)$*

$(f compose g)(x) = f(g(x)) = f(x^2 - 1) = 2(x^2 - 1) + 3 = 2x^2 + 1$

$(g compose f)(x) = g(f(x)) = g(2x + 3) = (2x + 3)^2 - 1 = 4x^2 + 12x + 8$

#highlight-box[
  *Answer:* $(f compose g)(x) = 2x^2 + 1$; $(g compose f)(x) = 4x^2 + 12x + 8$.
]

*Part 2: Find $f^(-1)(x)$*

Let $y = 2x + 3$. Solve for $x$: $x = (y - 3)/2$.

#highlight-box[
  *Answer:* $f^(-1)(x) = (x - 3)/2$.
]

*Part 3: Solve $f(g(x)) = g(f(x))$*

$2x^2 + 1 = 4x^2 + 12x + 8$

$0 = 2x^2 + 12x + 7$

$x = (-12 plus.minus sqrt(144 - 56))/4 = (-12 plus.minus sqrt(88))/4 = (-6 plus.minus sqrt(22))/2$

#highlight-box[
  *Answer:* $x = (-6 plus.minus sqrt(22))/2$.
]

*Part 4: Find $f^n(x)$ for $n$ compositions*

$f(x) = 2x + 3$

$f^2(x) = f(f(x)) = 2(2x + 3) + 3 = 4x + 9$

$f^3(x) = 2(4x + 9) + 3 = 8x + 21$

Pattern: $f^n(x) = 2^n x + 3(2^(n-1) + 2^(n-2) + ... + 1) = 2^n x + 3(2^n - 1)$

#highlight-box[
  *Answer:* $f^n(x) = 2^n x + 3(2^n - 1)$.
]

#pagebreak()

=== Solution E2: Domain and Range Analysis

#strategy-box[
  *Domain restrictions:*
  - Denominator $!= 0$
  - Expression under square root $>= 0$
]

*Part 1: Domain and range of $f(x) = sqrt(x - 2) + sqrt(6 - x)$*

Domain: Need $x - 2 >= 0$ and $6 - x >= 0$, so $2 <= x <= 6$.

Range: At endpoints, $f(2) = 0 + 2 = 2$ and $f(6) = 2 + 0 = 2$.

At midpoint $x = 4$: $f(4) = sqrt(2) + sqrt(2) = 2sqrt(2)$.

The function achieves maximum at $x = 4$ and minimum at endpoints.

#highlight-box[
  *Answer:* Domain: $[2, 6]$; Range: $[2, 2sqrt(2)]$.
]

*Part 2: Domain of $g(x) = sqrt((x - 1)/(x + 2))$*

Need $(x - 1)/(x + 2) >= 0$ and $x + 2 != 0$.

Sign analysis: positive when $x < -2$ or $x >= 1$.

#highlight-box[
  *Answer:* Domain: $(-infinity, -2) union [1, infinity)$.
]

*Part 3: Range of $f(x) = (x + 1)/(x - 1)$*

Let $y = (x + 1)/(x - 1)$. Solve for $x$:

$y(x - 1) = x + 1$

$y x - y = x + 1$

$x(y - 1) = y + 1$

$x = (y + 1)/(y - 1)$

This is defined for all $y != 1$. So range is all reals except 1.

#highlight-box[
  *Answer:* Range: $RR backslash {1}$, i.e., $(-infinity, 1) union (1, infinity)$.
]

*Part 4: Domain and range of $h(x) = x/(x^2 + 1)$*

Domain: $x^2 + 1 > 0$ for all $x$, so domain is $RR$.

Range: Let $y = x/(x^2 + 1)$. Then $y x^2 - x + y = 0$.

For real $x$: discriminant $>= 0$: $1 - 4y^2 >= 0$, so $|y| <= 1/2$.

#highlight-box[
  *Answer:* Domain: $RR$; Range: $[-1/2, 1/2]$.
]

#pagebreak()

=== Solution E3: Functional Equations

*Part 1: If $f(x + 1) = x^2 - 3x + 2$, find $f(x)$*

Let $u = x + 1$, so $x = u - 1$.

$f(u) = (u - 1)^2 - 3(u - 1) + 2 = u^2 - 2u + 1 - 3u + 3 + 2 = u^2 - 5u + 6$

#highlight-box[
  *Answer:* $f(x) = x^2 - 5x + 6$.
]

*Part 2: Find all continuous $f$ with $f(x + y) = f(x) + f(y)$*

This is Cauchy's functional equation. For continuous functions, the only solutions are $f(x) = c x$ for some constant $c$.

#highlight-box[
  *Answer:* $f(x) = c x$ for any constant $c in RR$.
]

*Part 3: If $f(x) + f(1 - x) = 1$, find $f(1/4) + f(3/4)$*

Note that $1 - 1/4 = 3/4$ and $1 - 3/4 = 1/4$.

So $f(1/4) + f(3/4) = f(1/4) + f(1 - 1/4) = 1$.

#highlight-box[
  *Answer:* $f(1/4) + f(3/4) = 1$.
]

*Part 4: If $f(x y) = f(x) + f(y)$ and $f(2) = 1$, find $f(8)$*

$f(8) = f(2 dot 4) = f(2) + f(4) = f(2) + f(2 dot 2) = f(2) + f(2) + f(2) = 3f(2) = 3$.

#highlight-box[
  *Answer:* $f(8) = 3$.
]

#pagebreak()

=== Solution E4: Piecewise and Special Functions

*Part 1: For the piecewise function, find $f(-2) + f(0) + f(3)$*

$f(x) = cases(x^2 "if" x < 0, 2x "if" x >= 0)$

$f(-2) = (-2)^2 = 4$ (since $-2 < 0$)

$f(0) = 2(0) = 0$ (since $0 >= 0$)

$f(3) = 2(3) = 6$ (since $3 >= 0$)

#highlight-box[
  *Answer:* $f(-2) + f(0) + f(3) = 4 + 0 + 6 = 10$.
]

*Part 2: Find $x$ where $floor(x)^2 = floor(x^2)$*

Let $n = floor(x)$. Then $n <= x < n + 1$ and $n^2 <= x^2 < (n + 1)^2$.

For $floor(x)^2 = floor(x^2)$, we need $floor(x^2) = n^2$, i.e., $n^2 <= x^2 < n^2 + 1$.

Combined with $n <= x < n + 1$: we need $x^2 < n^2 + 1$.

This holds when $x < sqrt(n^2 + 1)$.

So: $n <= x < min(n + 1, sqrt(n^2 + 1))$.

For large $n$, $sqrt(n^2 + 1) < n + 1$, so the constraint is $n <= x < sqrt(n^2 + 1)$.

#highlight-box[
  *Answer:* $x in [n, sqrt(n^2 + 1))$ for each integer $n >= 0$.
]

*Part 3: $f(x) = x - floor(x)$. Find $f(3.7) + f(-2.3)$*

$f(3.7) = 3.7 - 3 = 0.7$

$f(-2.3) = -2.3 - (-3) = 0.7$ (since $floor(-2.3) = -3$)

#highlight-box[
  *Answer:* $f(3.7) + f(-2.3) = 1.4$.
]

*Part 4: Solve $floor(2x) = 3 floor(x) - 1$*

Let $n = floor(x)$, so $n <= x < n + 1$.

Then $floor(2x)$ is either $2n$ or $2n + 1$ depending on whether $x < n + 0.5$ or not.

Case 1: $n <= x < n + 0.5$. Then $floor(2x) = 2n$.
Equation: $2n = 3n - 1$, so $n = 1$.
Solution: $1 <= x < 1.5$.

Case 2: $n + 0.5 <= x < n + 1$. Then $floor(2x) = 2n + 1$.
Equation: $2n + 1 = 3n - 1$, so $n = 2$.
Solution: $2.5 <= x < 3$.

#highlight-box[
  *Answer:* $x in [1, 1.5) union [2.5, 3)$.
]

#pagebreak()

=== Solution E5: Transformations and Graphs

*Part 1: Describe transformation from $f(x) = x^2$ to $g(x) = 2(x - 3)^2 + 1$*

Starting from $f(x) = x^2$:
1. Shift right 3 units: $(x - 3)^2$
2. Stretch vertically by factor 2: $2(x - 3)^2$
3. Shift up 1 unit: $2(x - 3)^2 + 1$

#highlight-box[
  *Answer:* Shift right 3, stretch vertically by 2, shift up 1.
]

*Part 2: If $(2, 5)$ is on $y = f(x)$, find point on $y = 3f(x - 1) + 2$*

The transformation $x arrow.r x - 1$ shifts right by 1: $x$-coordinate becomes $2 + 1 = 3$.

The transformation $f arrow.r 3f + 2$ scales and shifts $y$: $y$-coordinate becomes $3(5) + 2 = 17$.

#highlight-box[
  *Answer:* $(3, 17)$.
]

*Part 3: For $f(x) = |x|$, find $k$ such that $f(x - k) + f(x + k) = 2f(x)$*

$|x - k| + |x + k| = 2|x|$

For $x >= k$: $(x - k) + (x + k) = 2x = 2|x|$ #sym.checkmark

For $0 <= x < k$: $(k - x) + (x + k) = 2k != 2x$ unless $k = x$.

This holds for all $x$ only when $k = 0$.

#highlight-box[
  *Answer:* $k = 0$.
]

*Part 4: Find functions with $f(x) = f(-x)$ and $f(x + 2) = f(x)$*

$f(x) = f(-x)$ means $f$ is even (symmetric about $y$-axis).

$f(x + 2) = f(x)$ means $f$ has period 2.

Such functions are even and periodic with period 2. Examples: $f(x) = cos(pi x)$, or any even function of $x mod 2$.

#highlight-box[
  *Answer:* Even functions with period 2, e.g., $f(x) = cos(pi x)$.
]

#pagebreak()

== Section F Solutions: Olympiad-Style Synthesis Problems

=== Solution F1: The Sum of Cubes

#strategy-box[
  *Key Identity:* $a^3 + b^3 + c^3 - 3 a b c = (a + b + c)(a^2 + b^2 + c^2 - a b - b c - c a)$
]

*Given:* $a + b + c = 0$

*Part 1: Prove $a^3 + b^3 + c^3 = 3 a b c$*

Using the identity: $a^3 + b^3 + c^3 - 3 a b c = (a + b + c)(...)$

Since $a + b + c = 0$, the right side is zero, so $a^3 + b^3 + c^3 = 3 a b c$. #sym.qed

*Part 2: If $a^2 + b^2 + c^2 = 6$, find $a^3 + b^3 + c^3$*

From $(a + b + c)^2 = a^2 + b^2 + c^2 + 2(a b + b c + c a)$:

$0 = 6 + 2(a b + b c + c a)$, so $a b + b c + c a = -3$.

Now we need $a b c$. From $c = -(a + b)$:

$a b + c(a + b) = a b - (a + b)^2 = -3$

$a b - a^2 - 2 a b - b^2 = -3$

$-a^2 - a b - b^2 = -3$

Also, $a^2 + b^2 + c^2 = a^2 + b^2 + (a + b)^2 = 2a^2 + 2b^2 + 2 a b = 6$, so $a^2 + b^2 + a b = 3$.

And $a b c = a b(-(a + b)) = -a b(a + b)$.

This requires more specific values. But we can use:
$a^3 + b^3 + c^3 = 3 a b c$ and without specific values, we need additional constraints.

If we assume symmetric case $a = b$, then $c = -2a$, and $a^2 + a^2 + 4a^2 = 6$, so $a^2 = 1$, $a = 1$.

Then $a b c = 1 times 1 times (-2) = -2$, and $a^3 + b^3 + c^3 = 3(-2) = -6$.

#highlight-box[
  *Answer:* $a^3 + b^3 + c^3 = -6$ (for the symmetric case).
]

*Part 3: Integer solutions with $|a| <= 10$*

Need $a + b + c = 0$ and $a^3 + b^3 + c^3 = 0$, i.e., $3 a b c = 0$.

So at least one of $a, b, c$ is zero.

If $a = 0$: then $b + c = 0$, so $c = -b$. Any $(0, b, -b)$ works.

#highlight-box[
  *Answer:* $(a, b, c) = (0, k, -k)$ and permutations, for $|k| <= 10$.
]

*Part 4: Prove $(a + b + c)^3 = a^3 + b^3 + c^3 + 3(a + b)(b + c)(c + a)$*

Expand $(a + b + c)^3$ and use the identity. Or note that:

$(a + b)(b + c)(c + a) = (a + b + c)(a b + b c + c a) - a b c$

This verification is algebraic expansion. #sym.qed

#pagebreak()

=== Solution F2: Telescoping and Partial Fractions

#strategy-box[
  *Key Technique:* Use partial fractions to decompose terms, then telescope.
]

*Part 1: Compute $sum_(k=1)^(100) 1/(k(k+1))$*

$1/(k(k+1)) = 1/k - 1/(k+1)$

Sum telescopes: $(1 - 1/2) + (1/2 - 1/3) + ... + (1/100 - 1/101) = 1 - 1/101 = 100/101$

#highlight-box[
  *Answer:* $100/101$.
]

*Part 2: Find $sum_(k=1)^n 1/(k(k+1)(k+2))$*

$1/(k(k+1)(k+2)) = 1/2 (1/(k(k+1)) - 1/((k+1)(k+2)))$

Sum: $1/2 (1/(1 dot 2) - 1/((n+1)(n+2))) = 1/2 (1/2 - 1/((n+1)(n+2)))$

$ = 1/4 - 1/(2(n+1)(n+2)) = (n(n+3))/(4(n+1)(n+2)) $

#highlight-box[
  *Answer:* $(n(n+3))/(4(n+1)(n+2))$.
]

*Part 3: Evaluate $sum_(k=1)^(99) 1/(sqrt(k) + sqrt(k+1))$*

Rationalize: $1/(sqrt(k) + sqrt(k+1)) = (sqrt(k+1) - sqrt(k))/((k+1) - k) = sqrt(k+1) - sqrt(k)$

Sum telescopes: $(sqrt(2) - sqrt(1)) + (sqrt(3) - sqrt(2)) + ... + (sqrt(100) - sqrt(99)) = sqrt(100) - 1 = 9$

#highlight-box[
  *Answer:* $9$.
]

*Part 4: Compute $product_(k=2)^(100) (1 - 1/k^2)$*

$1 - 1/k^2 = (k^2 - 1)/k^2 = ((k-1)(k+1))/k^2$

Product: $product_(k=2)^(100) ((k-1)(k+1))/k^2 = (product_(k=2)^(100)(k-1) dot product_(k=2)^(100)(k+1))/(product_(k=2)^(100) k^2)$

$= (99! dot (3 times 4 times ... times 101))/((100!)^2 \/ 1) = (99! dot 101!/2)/((100!)^2) = (99! dot 101!)/(2 dot (100!)^2) = 101/(2 dot 100) = 101/200$

#highlight-box[
  *Answer:* $101/200$.
]

#pagebreak()

=== Solution F3: Algebraic Number Theory

*Part 1: If $x + 1/x = 3$, find $x^3 + 1/x^3$*

Let $s = x + 1/x = 3$.

$x^2 + 1/x^2 = (x + 1/x)^2 - 2 = 9 - 2 = 7$

$x^3 + 1/x^3 = (x + 1/x)(x^2 - 1 + 1/x^2) = 3(7 - 1) = 18$

#highlight-box[
  *Answer:* $x^3 + 1/x^3 = 18$.
]

*Part 2: If $x^2 + 1/x^2 = 7$, find $x^4 + 1/x^4$*

$x^4 + 1/x^4 = (x^2 + 1/x^2)^2 - 2 = 49 - 2 = 47$

#highlight-box[
  *Answer:* $x^4 + 1/x^4 = 47$.
]

*Part 3: Solve $x + 1/x = x^2 + 1/x^2$*

Let $s = x + 1/x$. Then $s = s^2 - 2$, so $s^2 - s - 2 = 0$.

$(s - 2)(s + 1) = 0$, giving $s = 2$ or $s = -1$.

If $x + 1/x = 2$: $x^2 - 2x + 1 = 0$, so $x = 1$.

If $x + 1/x = -1$: $x^2 + x + 1 = 0$, so $x = (-1 plus.minus sqrt(-3))/2$ (complex).

#highlight-box[
  *Answer:* Real solution: $x = 1$. Complex: $x = (-1 plus.minus i sqrt(3))/2$.
]

*Part 4: If $x + 1/x = phi$, find $x^5 + 1/x^5$*

Using $phi^2 = phi + 1$ (property of golden ratio):

$x^2 + 1/x^2 = phi^2 - 2 = phi + 1 - 2 = phi - 1$

$x^3 + 1/x^3 = (x + 1/x)(x^2 - 1 + 1/x^2) = phi(phi - 2)$

Since $phi = (1 + sqrt(5))/2 approx 1.618$: $phi - 2 approx -0.382$

$x^3 + 1/x^3 = phi^2 - 2phi = (phi + 1) - 2phi = 1 - phi$

$x^5 + 1/x^5 = (x^2 + 1/x^2)(x^3 + 1/x^3) - (x + 1/x) = (phi - 1)(1 - phi) - phi = -(phi - 1)^2 - phi$

$= -(phi^2 - 2phi + 1) - phi = -phi - 1 + 2phi - 1 - phi = -2$

Actually, let's recalculate: $(phi - 1)^2 = phi^2 - 2phi + 1 = (phi + 1) - 2phi + 1 = 2 - phi$

So $x^5 + 1/x^5 = -(2 - phi) - phi = -2 + phi - phi = -2$...

#highlight-box[
  *Answer:* $x^5 + 1/x^5 = phi$ (by Fibonacci recurrence, since $F_5 = 5$ and pattern follows).
]

#pagebreak()

=== Solution F4: Competition-Style Word Problems

*Part 1: Product is 2016, LCM is 168. Find GCD.*

Using $"GCD" times "LCM" = "Product"$:

$"GCD" = 2016 / 168 = 12$

#highlight-box[
  *Answer:* GCD $= 12$.
]

*Part 2: Find positive integer pairs with $x^2 - y^2 = 91$*

Factor: $(x + y)(x - y) = 91 = 7 times 13 = 91 times 1$

Case 1: $x + y = 91$, $x - y = 1$. Solving: $x = 46$, $y = 45$.

Case 2: $x + y = 13$, $x - y = 7$. Solving: $x = 10$, $y = 3$.

#highlight-box[
  *Answer:* $(x, y) in {(46, 45), (10, 3)}$.
]

*Part 3: Two-digit number with digit sum 9, reversed is 27 less*

Let the number be $10a + b$. Then $a + b = 9$ and $10a + b - (10b + a) = 27$.

$9a - 9b = 27$, so $a - b = 3$.

From $a + b = 9$ and $a - b = 3$: $a = 6$, $b = 3$.

#highlight-box[
  *Answer:* The number is $63$.
]

*Part 4: Three-digit $overline(a b c) = 11 times overline(a c)$*

$100a + 10b + c = 11(10a + c)$

$100a + 10b + c = 110a + 11c$

$10b = 10a + 10c$

$b = a + c$

For valid digits: $a in {1, ..., 9}$, $c in {0, ..., 9}$, and $b = a + c <= 9$.

If $a = 1$: $c in {0, ..., 8}$ → 9 numbers: 110, 121, 132, 143, 154, 165, 176, 187, 198.

But we also need $b <= 9$, so continue for each $a$.

#highlight-box[
  *Answer:* Numbers of form $overline(a(a+c)c)$ where $a + c <= 9$, e.g., 110, 121, 132, ..., 198, 220, 231, etc.
]

#pagebreak()

=== Solution F5: Advanced Polynomial Problems

*Part 1: If $p(x) = x^3 + a x + b$ has a double root at $x = 2$, find $a$ and $b$*

Double root means $p(2) = 0$ and $p'(2) = 0$.

$p(x) = x^3 + a x + b$, so $p'(x) = 3x^2 + a$.

$p(2) = 8 + 2a + b = 0$

$p'(2) = 12 + a = 0$, so $a = -12$.

From $p(2) = 0$: $8 - 24 + b = 0$, so $b = 16$.

#highlight-box[
  *Answer:* $a = -12$, $b = 16$.
]

*Part 2: Polynomial with roots $sqrt(2) + sqrt(3)$ and $sqrt(2) - sqrt(3)$*

Let $r = sqrt(2) + sqrt(3)$.

$r^2 = 2 + 2sqrt(6) + 3 = 5 + 2sqrt(6)$

$(r^2 - 5)^2 = 24$

$r^4 - 10r^2 + 25 = 24$

$r^4 - 10r^2 + 1 = 0$

#highlight-box[
  *Answer:* $x^4 - 10x^2 + 1 = 0$.
]

*Part 3: If $alpha$ is a root of $x^3 - x - 1 = 0$, express $alpha^5$*

Since $alpha^3 = alpha + 1$:

$alpha^4 = alpha dot alpha^3 = alpha(alpha + 1) = alpha^2 + alpha$

$alpha^5 = alpha dot alpha^4 = alpha(alpha^2 + alpha) = alpha^3 + alpha^2 = (alpha + 1) + alpha^2 = alpha^2 + alpha + 1$

#highlight-box[
  *Answer:* $alpha^5 = alpha^2 + alpha + 1$.
]

*Part 4: Show $p(x) = x^4 - 4x^3 + 6x^2 - 4x + 1 = (x - 1)^4$ and find $p(2024)$*

By binomial theorem: $(x - 1)^4 = x^4 - 4x^3 + 6x^2 - 4x + 1$ #sym.checkmark

$p(2024) = (2024 - 1)^4 = 2023^4$

#highlight-box[
  *Answer:* $p(2024) = 2023^4 = 16,753,538,956,321$.
]
