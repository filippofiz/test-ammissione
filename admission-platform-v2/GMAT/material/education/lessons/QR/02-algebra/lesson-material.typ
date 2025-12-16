#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Algebra",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering algebraic expressions, equations, inequalities, functions, and polynomials.",
  logo: "/Logo.png",
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Lesson Overview

*Topic:* Algebra\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-02 (Second of 5 QR topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Simplify and evaluate algebraic expressions
2. Solve linear equations in one and two variables
3. Solve quadratic equations using multiple methods
4. Work with inequalities and understand their properties
5. Understand function notation and basic function properties
6. Factor polynomials and recognize common patterns

== GMAT Relevance

Algebra appears in approximately 25-30% of QR questions. It forms the backbone of quantitative reasoning and is essential for word problems, geometry, and data interpretation.

#pagebreak()

= Algebraic Expressions

Algebra is the language of mathematics — a system for expressing relationships between quantities using symbols. While arithmetic deals with specific numbers, algebra allows us to work with unknown quantities and general patterns. This abstraction is what makes algebra so powerful: a single algebraic statement can represent infinitely many numerical situations.

== The Building Blocks of Algebra

Every algebraic expression is built from a small set of fundamental components. Understanding these building blocks is essential for manipulating and simplifying expressions correctly.

A *variable* is a letter that represents an unknown or changeable quantity. Common choices are $x$, $y$, $z$, $n$, or $t$, though any letter can serve as a variable. Variables allow us to write general statements: instead of saying "a number plus 5 equals 12," we can write $x + 5 = 12$.

A *constant* is a fixed numerical value that doesn't change within a given problem. Examples include $3$, $-7$, $1/2$, or $pi$. Constants provide the specific numerical information in an expression.

A *term* is a single mathematical unit that can be a number, a variable, or a product of numbers and variables. For example, $3x$, $-5y^2$, $7$, and $2 x y z$ are all terms. Terms are separated by addition or subtraction signs.

The *coefficient* of a term is its numerical factor — the number multiplying the variable(s). In the term $3x$, the coefficient is $3$. In $-5y^2$, the coefficient is $-5$. When a variable appears without an explicit coefficient, the coefficient is understood to be $1$ (so $x$ means $1x$).

An *expression* is a combination of terms connected by operations. For example, $3x + 2y - 5$ is an expression with three terms.

#info-box[
  *Algebraic Vocabulary Summary:*

  - *Variable:* A letter representing an unknown value ($x$, $y$, $n$)
  - *Constant:* A fixed numerical value ($3$, $-7$, $pi$)
  - *Term:* A single mathematical unit ($3x$, $-5y^2$, $7$)
  - *Coefficient:* The numerical factor of a term (in $3x$, the coefficient is $3$)
  - *Expression:* A combination of terms ($3x + 2y - 5$)
]

== Like Terms and Combining Terms

One of the most fundamental skills in algebra is recognizing and combining *like terms*. Two terms are "like" if they have exactly the same variable part — the same variables raised to the same powers. The coefficients can be different; only the variable structure must match.

For example:
- $3x$ and $5x$ are like terms (both have $x$ to the first power)
- $2x^2$ and $-4x^2$ are like terms (both have $x^2$)
- $2 x y$ and $5 x y$ are like terms (both have $x y$)
- $3x$ and $3x^2$ are *not* like terms (different powers of $x$)
- $4x$ and $4y$ are *not* like terms (different variables)

*Why can we only combine like terms?* Think about it in concrete terms: $3$ apples plus $5$ apples equals $8$ apples, but $3$ apples plus $5$ oranges cannot be simplified further — they remain "$3$ apples and $5$ oranges." Similarly, $3x + 5x = 8x$, but $3x + 5y$ cannot be simplified because $x$ and $y$ represent potentially different quantities.

=== The Process of Combining Like Terms

To simplify an expression by combining like terms:
1. Identify groups of like terms
2. Add or subtract the coefficients within each group
3. Keep the variable part unchanged

#example-box[
  *Simplify: $4x^2 + 3x - 2x^2 + 5 - x + 7$*

  Step 1: Identify and group like terms
  - $x^2$ terms: $4x^2$ and $-2x^2$
  - $x$ terms: $3x$ and $-x$
  - Constants: $5$ and $7$

  Step 2: Combine each group
  - $x^2$ terms: $4x^2 - 2x^2 = 2x^2$
  - $x$ terms: $3x - x = 2x$
  - Constants: $5 + 7 = 12$

  Step 3: Write the simplified expression

  *Result: $2x^2 + 2x + 12$*
]

#tip-box[
  *Standard Form:* When writing polynomial expressions, it's conventional to arrange terms in descending order of degree (highest power first). So we write $2x^2 + 2x + 12$, not $12 + 2x + 2x^2$.
]

== The Distributive Property

The *distributive property* is perhaps the most important property in algebra. It creates a bridge between multiplication and addition, allowing us to expand and factor expressions.

$ a(b + c) = a b + a c $

In words: when a factor multiplies a sum, it multiplies each term of the sum individually.

*Why does this work?* Consider $3(x + 4)$. This means "three groups of $(x + 4)$." If you have three groups, each containing $x + 4$, you have three $x$'s and three $4$'s, which is $3x + 12$.

The distributive property works in both directions:

- *Expanding* (left to right): $3(x + 4) = 3x + 12$
- *Factoring* (right to left): $6x + 15 = 3(2x + 5)$

=== Distributing Negative Signs

Special care is needed when distributing negative numbers or subtraction. Remember that subtracting is the same as adding a negative, so $a(b - c) = a b - a c$.

#example-box[
  *Expand: $-2(3x - 4y + 5)$*

  Distribute $-2$ to each term inside the parentheses:

  $= (-2)(3x) + (-2)(-4y) + (-2)(5)$

  Apply the sign rules for multiplication:

  $= -6x + 8y - 10$

  Note how $(-2)(-4y) = +8y$ because negative times negative equals positive.
]

#warning-box[
  *Common Mistake:* When distributing a negative sign, students often forget to change the sign of every term.

  Wrong: $-(x - 3) = -x - 3$

  Correct: $-(x - 3) = -x + 3$

  Think of $-(x - 3)$ as $(-1)(x - 3) = (-1)(x) + (-1)(-3) = -x + 3$.
]

=== Expanding Products of Binomials (FOIL)

When multiplying two binomials (expressions with two terms each), we apply the distributive property twice. The FOIL method is a systematic way to ensure all terms are multiplied:

- *First* terms
- *Outer* terms
- *Inner* terms
- *Last* terms

#example-box[
  *Expand: $(x + 3)(x + 5)$*

  Using FOIL:
  - First: $x times x = x^2$
  - Outer: $x times 5 = 5x$
  - Inner: $3 times x = 3x$
  - Last: $3 times 5 = 15$

  Combine: $x^2 + 5x + 3x + 15 = x^2 + 8x + 15$
]

#example-box[
  *Expand: $(2x - 3)(x + 4)$*

  - First: $2x times x = 2x^2$
  - Outer: $2x times 4 = 8x$
  - Inner: $(-3) times x = -3x$
  - Last: $(-3) times 4 = -12$

  Combine: $2x^2 + 8x - 3x - 12 = 2x^2 + 5x - 12$
]

#tip-box[
  *Beyond FOIL:* FOIL only works for binomial × binomial. For larger products like $(x + 2)(x^2 + 3x + 1)$, use the general distributive property: multiply each term in the first factor by each term in the second factor, then combine like terms.
]

#pagebreak()

= Linear Equations

An *equation* is a mathematical statement that two expressions are equal. Solving an equation means finding all values of the variable(s) that make the statement true. Linear equations — equations where variables appear only to the first power — are the foundation of algebraic problem-solving.

== Equations in One Variable

A *linear equation in one variable* has the general form $a x + b = c$, where $a$, $b$, and $c$ are constants and $a eq.not 0$. The goal is to find the value of $x$ that makes the equation true.

=== The Principle of Balance

The key principle for solving equations is that *whatever you do to one side, you must do to the other*. An equation is like a balance scale — if both sides start equal, they remain equal as long as you perform the same operation on both.

The operations we use to solve equations are *inverse operations* — operations that "undo" each other:
- Addition and subtraction are inverses
- Multiplication and division are inverses

=== Solving Linear Equations Step by Step

The strategy is to isolate the variable by systematically undoing all the operations that have been applied to it.

#example-box[
  *Solve: $3x + 7 = 22$*

  Our goal is to get $x$ alone on one side.

  Step 1: Undo the addition of 7 by subtracting 7 from both sides
  $ 3x + 7 - 7 = 22 - 7 $
  $ 3x = 15 $

  Step 2: Undo the multiplication by 3 by dividing both sides by 3
  $ (3x)/3 = 15/3 $
  $ x = 5 $

  Step 3: Check by substituting back into the original equation
  $ 3(5) + 7 = 15 + 7 = 22 #sym.checkmark $
]

*Graphical interpretation:* Solving $3x + 7 = 22$ is equivalent to finding where the line $y = 3x + 7$ intersects the horizontal line $y = 22$. The $x$-coordinate of this intersection is the solution.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 5),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 5,
      x-min: -2,
      x-max: 8,
      y-min: 0,
      y-max: 30,
      axis-style: "school-book",
      {
        // Plot y = 3x + 7
        plot.add(
          domain: (-1, 7),
          x => 3 * x + 7,
          style: (stroke: blue + 1.5pt),
          label: $y = 3x + 7$,
        )
        // Horizontal line y = 22
        plot.add-hline(
          22,
          style: (stroke: (paint: red, dash: "dashed")),
          label: $y = 22$,
        )
        // Mark the solution point
        plot.add(
          ((5,22) , (5,22)),
          mark: "o"
        )
        plot.annotate({
          content(
            (4.3, 23.5),
            text(size: 9pt, fill: green.darken(30%))[$(5, 22)$]
          )
        })
      },
    )
  })
]

=== More Complex Linear Equations

When variables appear on both sides or when the equation involves fractions and parentheses, we use additional steps.

#example-box(breakable: true)[
  *Solve: $5(x - 2) = 3x + 6$*

  Step 1: Distribute on the left side
  $ 5x - 10 = 3x + 6 $

  Step 2: Get all variable terms on one side by subtracting $3x$ from both sides
  $ 5x - 3x - 10 = 6 $
  $ 2x - 10 = 6 $

  Step 3: Add 10 to both sides
  $ 2x = 16 $

  Step 4: Divide by 2
  $ x = 8 $

  Check: $5(8 - 2) = 5(6) = 30$ and $3(8) + 6 = 24 + 6 = 30$ #sym.checkmark
]

#example-box(breakable: true)[
  *Solve: $x/3 + x/4 = 7$*

  Step 1: Find a common denominator (12) and multiply the entire equation by it
  $ 12 dot (x/3 + x/4) = 12 dot 7 $
  $ 4x + 3x = 84 $

  Step 2: Combine like terms
  $ 7x = 84 $

  Step 3: Divide by 7
  $ x = 12 $

  Check: $12/3 + 12/4 = 4 + 3 = 7$ #sym.checkmark
]

#tip-box[
  *Strategy for Equations with Fractions:* Multiply both sides by the least common denominator (LCD) of all fractions to eliminate the fractions entirely. This often makes the equation much easier to solve.
]

== Systems of Linear Equations (Two Variables)

A *system of linear equations* consists of two or more equations with two or more variables. A solution to the system must satisfy all equations simultaneously.

Geometrically, each linear equation in two variables represents a line in the coordinate plane. The solution to a system of two equations is the point where the two lines intersect.

A system of two linear equations can have:
- *One solution:* The lines intersect at exactly one point
- *No solution:* The lines are parallel (never intersect)
- *Infinitely many solutions:* The lines are identical (coincide completely)

There are two main algebraic methods for solving systems: substitution and elimination. Each has advantages depending on the structure of the equations.

=== The Substitution Method

The *substitution method* works by solving one equation for one variable, then substituting that expression into the other equation. This reduces a two-variable problem to a one-variable problem.

#example-box(breakable: true)[
  *Solve the system:*
  $ x + y = 10 $
  $ x - y = 4 $

  Step 1: Solve one equation for one variable

  From the first equation: $x = 10 - y$

  Step 2: Substitute into the other equation

  Replace $x$ with $(10 - y)$ in the second equation:
  $ (10 - y) - y = 4 $
  $ 10 - 2y = 4 $
  $ -2y = -6 $
  $ y = 3 $

  Step 3: Substitute back to find the other variable
  $ x = 10 - y = 10 - 3 = 7 $

  Step 4: Verify in both original equations
  - $7 + 3 = 10$ #sym.checkmark
  - $7 - 3 = 4$ #sym.checkmark

  *Solution: $x = 7$, $y = 3$* (or the point $(7, 3)$)
]

=== The Elimination Method

The *elimination method* works by adding or subtracting the equations to eliminate one variable. If the coefficients don't match initially, we can multiply one or both equations by constants first.

#example-box(breakable: true)[
  *Solve the system:*
  $ 2x + 3y = 12 $
  $ 4x - 3y = 6 $

  Step 1: Notice that the $y$ coefficients are opposites ($+3$ and $-3$)

  Step 2: Add the equations to eliminate $y$
  $ (2x + 3y) + (4x - 3y) = 12 + 6 $
  $ 6x = 18 $
  $ x = 3 $

  Step 3: Substitute into either original equation to find $y$
  $ 2(3) + 3y = 12 $
  $ 6 + 3y = 12 $
  $ 3y = 6 $
  $ y = 2 $

  Step 4: Verify in the second equation
  $ 4(3) - 3(2) = 12 - 6 = 6 $ #sym.checkmark

  *Solution: $x = 3$, $y = 2$* (or the point $(3, 2)$)
]

*Graphical interpretation:* The solution $(3, 2)$ is the intersection point of the two lines.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (7, 5),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 2,
      x-min: -1,
      x-max: 7,
      y-min: -2,
      y-max: 6,
      axis-style: "school-book",
      {
        // Line 1: 2x + 3y = 12 => y = (12 - 2x)/3
        plot.add(
          domain: (0, 6),
          x => (12 - 2 * x) / 3,
          style: (stroke: blue + 1.5pt),
          label: $2x + 3y = 12$,
        )
        // Line 2: 4x - 3y = 6 => y = (4x - 6)/3
        plot.add(
          domain: (0, 6),
          x => (4 * x - 6) / 3,
          style: (stroke: red + 1.5pt),
          label: $4x - 3y = 6$,
        )
        // Mark intersection point
        plot.add(
          ((3,2) , (3,2)),
          mark: "o"
        )
        plot.annotate({
          content(
            (3.7, 2.1),
            text(size: 9pt, fill: green.darken(30%))[$(3, 2)$]
          )
        })
      },
    )
  })
]

=== When to Use Each Method

#tip-box[
  *Choosing Between Substitution and Elimination:*

  *Use Substitution when:*
  - One equation is already solved for a variable (like $y = 2x + 3$)
  - One variable has a coefficient of 1 or $-1$, making it easy to isolate

  *Use Elimination when:*
  - Coefficients are already set up to cancel (like $+3y$ and $-3y$)
  - Both equations are in standard form ($a x + b y = c$)
  - Substitution would create messy fractions
]

#warning-box[
  *Special Cases:*

  - If elimination produces a statement like $0 = 5$ (false), the system has *no solution* — the lines are parallel.
  - If elimination produces $0 = 0$ (always true), the system has *infinitely many solutions* — the equations represent the same line.
]

=== Solving Systems by Strategic Manipulation

Sometimes the GMAT asks for a specific expression rather than individual variable values. In these cases, you can often find the answer without solving for each variable separately.

#example-box[
  *If $x + y = 10$ and $x - y = 4$, what is $x^2 - y^2$?*

  Instead of solving for $x$ and $y$ individually, recognize the pattern:
  $ x^2 - y^2 = (x + y)(x - y) = 10 times 4 = 40 $

  We found the answer using the given information directly, without calculating $x = 7$ and $y = 3$.
]

#strategy-box[
  *GMAT Insight:* When asked for expressions like $x + y$, $x y$, or $x^2 - y^2$, look for ways to find these directly by adding, subtracting, or multiplying the original equations. This is often faster than solving for individual variables.
]

#pagebreak()

= Quadratic Equations

While linear equations describe straight-line relationships, *quadratic equations* describe curves — specifically, parabolas. These equations appear whenever quantities grow or shrink at changing rates, making them essential for modeling everything from projectile motion to profit optimization. On the GMAT, quadratic equations appear frequently, and mastery of multiple solving methods is crucial for efficiency.

== Standard Form and Structure

A *quadratic equation* is any equation that can be written in the form:

$ a x^2 + b x + c = 0 $

where $a$, $b$, and $c$ are constants and *$a eq.not 0$*.

#info-box[
  *Why must $a eq.not 0$?*

  If $a = 0$, the $x^2$ term disappears, leaving $b x + c = 0$, which is a linear equation, not quadratic. The $x^2$ term is what makes the equation quadratic and gives its graph the characteristic parabola shape.
]

The three coefficients each play a role:
- *$a$* (leading coefficient): Determines the direction and width of the parabola. If $a > 0$, the parabola opens upward; if $a < 0$, it opens downward.
- *$b$* (linear coefficient): Affects the horizontal position of the vertex.
- *$c$* (constant term): The $y$-intercept of the parabola (where the curve crosses the $y$-axis).

== How Many Solutions?

Unlike linear equations, which have exactly one solution (unless they're contradictions or identities), quadratic equations can have *zero, one, or two* real solutions.

Geometrically, the solutions (also called *roots* or *zeros*) are the $x$-coordinates where the parabola crosses the $x$-axis. A parabola might cross the axis twice (two solutions), touch it at exactly one point (one solution), or miss it entirely (no real solutions).

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (10, 4),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 2,
      x-min: -4,
      x-max: 4,
      y-min: -2,
      y-max: 5,
      axis-style: "school-book",
      {
        // Two solutions: y = x² - 1
        plot.add(
          domain: (-2, 2),
          x => calc.pow(x, 2) - 1,
          style: (stroke: blue + 1.5pt),
          label: [Two solutions],
        )
        // One solution: y = x² (shifted right)
        plot.add(
          domain: (-1.5, 1.5),
          x => calc.pow(x, 2),
          style: (stroke: green + 1.5pt),
          label: [One solution],
        )
        // No solutions: y = x² + 1 (shifted right more)
        plot.add(
          domain: (-1.5, 1.5),
          x => calc.pow(x, 2) + 1,
          style: (stroke: red + 1.5pt),
          label: [No real solutions],
        )
      },
    )
  })
]

== Method 1: Factoring

Factoring is often the fastest method when it works. It relies on a fundamental principle called the *Zero Product Property*.

=== The Zero Product Property

#info-box[
  *Zero Product Property:*

  If $A times B = 0$, then $A = 0$ or $B = 0$ (or both).

  This property is unique to zero — it's the only number with this characteristic. If $A times B = 6$, for example, we can't conclude anything specific about $A$ or $B$ individually.
]

This property allows us to convert a quadratic equation into two linear equations. If we can factor the quadratic as $(x - r)(x - s) = 0$, then either $x - r = 0$ or $x - s = 0$, giving us $x = r$ or $x = s$.

=== Factoring Trinomials: Finding the Right Pair

For a quadratic $x^2 + b x + c$, we seek two numbers that:
- *Multiply* to give $c$ (the constant term)
- *Add* to give $b$ (the coefficient of $x$)

#example-box[
  *Solve: $x^2 + 5x + 6 = 0$*

  We need two numbers that multiply to $6$ and add to $5$.

  Factor pairs of $6$: $(1, 6)$, $(2, 3)$, $(-1, -6)$, $(-2, -3)$

  Which pair adds to $5$? The pair $(2, 3)$: $2 + 3 = 5$ #sym.checkmark

  Therefore: $x^2 + 5x + 6 = (x + 2)(x + 3)$

  Setting each factor to zero:
  - $x + 2 = 0 #sym.arrow x = -2$
  - $x + 3 = 0 #sym.arrow x = -3$

  *Solutions: $x = -2$ or $x = -3$*

  Check: $(-2)^2 + 5(-2) + 6 = 4 - 10 + 6 = 0$ #sym.checkmark
]

=== The AC Method for Harder Trinomials

When the leading coefficient $a eq.not 1$, factoring becomes trickier. The *AC method* provides a systematic approach.

For $a x^2 + b x + c$:
1. Multiply $a times c$
2. Find two numbers that multiply to $a c$ and add to $b$
3. Rewrite the middle term using these numbers
4. Factor by grouping

#example-box(breakable: true)[
  *Factor: $6x^2 + 11x + 3$*

  Step 1: $a times c = 6 times 3 = 18$

  Step 2: Find two numbers that multiply to $18$ and add to $11$

  Factor pairs of $18$: $(1, 18)$, $(2, 9)$, $(3, 6)$

  The pair $(2, 9)$ adds to $11$ #sym.checkmark

  Step 3: Rewrite $11x$ as $2x + 9x$
  $ 6x^2 + 2x + 9x + 3 $

  Step 4: Factor by grouping
  $ = 2x(3x + 1) + 3(3x + 1) $
  $ = (2x + 3)(3x + 1) $

  To solve $6x^2 + 11x + 3 = 0$: $x = -3/2$ or $x = -1/3$
]

== Method 2: The Quadratic Formula

When factoring is difficult or impossible, the *quadratic formula* always works. It's derived from completing the square on the general form $a x^2 + b x + c = 0$.

#info-box[
  *The Quadratic Formula:*

  For $a x^2 + b x + c = 0$:

  $ x = (-b plus.minus sqrt(b^2 - 4 a c)) / (2 a) $

  This formula gives both solutions at once. The "$plus.minus$" indicates that one solution uses $+$ and the other uses $-$.
]

=== The Discriminant: Predicting the Number of Solutions

The expression under the square root, $b^2 - 4 a c$, is called the *discriminant* (often denoted $Delta$). It tells us how many real solutions exist without solving the equation.

#info-box[
  *The Discriminant* $Delta = b^2 - 4 a c$:

  - $Delta > 0$: Two distinct real solutions (parabola crosses $x$-axis twice)
  - $Delta = 0$: One real solution — a repeated root (parabola touches $x$-axis at vertex)
  - $Delta < 0$: No real solutions (parabola doesn't cross $x$-axis)
]

#example-box(breakable: true)[
  *Solve: $2x^2 - 7x + 3 = 0$*

  Identify coefficients: $a = 2$, $b = -7$, $c = 3$

  Calculate the discriminant first:
  $ Delta = (-7)^2 - 4(2)(3) = 49 - 24 = 25 $

  Since $Delta = 25 > 0$, we expect two distinct real solutions.

  Apply the formula:
  $ x = (7 plus.minus sqrt(25)) / 4 = (7 plus.minus 5) / 4 $

  Two solutions:
  - $x = (7 + 5) / 4 = 12/4 = 3$
  - $x = (7 - 5) / 4 = 2/4 = 1/2$

  *Solutions: $x = 3$ or $x = 1/2$*
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 5),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 1,
      y-tick-step: 2,
      x-min: -1,
      x-max: 4,
      y-min: -4,
      y-max: 6,
      axis-style: "school-book",
      {
        // Plot y = 2x² - 7x + 3
        plot.add(
          domain: (-0.5, 4),
          x => 2 * calc.pow(x, 2) - 7 * x + 3,
          style: (stroke: blue + 1.5pt),
          label: $y = 2x^2 - 7x + 3$,
        )
        // Mark the roots
        plot.add(
          ((0.5,0) , (0.5,0)),
          mark: "o",
          mark-style: (stroke: red, fill: red.lighten(70%))
        )
        plot.add(
          ((3,0) , (3,0)),
          mark: "o",
          mark-style: (stroke: red, fill: red.lighten(70%))
        )
        plot.annotate({
          content(
            (0.8, 0.8),
            text(size: 9pt, fill: red.darken(30%))[$(1\/2, 0)$]
          )
        })
        plot.annotate({
          content(
            (2.8, 0.8),
            text(size: 9pt, fill: red.darken(30%))[$(3, 0)$]
          )
        })
      },
    )
  })
]

#tip-box[
  *GMAT Tip:* If a problem asks "how many real solutions does the equation have?" you don't need to solve it — just compute the discriminant. This is much faster!
]

== Method 3: Completing the Square

*Completing the square* transforms a quadratic into the form $(x + k)^2 = d$, which can be solved by taking square roots. While not always the fastest method, it's valuable for understanding the quadratic formula's derivation and for certain applications like finding the vertex of a parabola.

=== The Process

The goal is to create a *perfect square trinomial* on one side of the equation. A perfect square trinomial has the form $x^2 + 2 k x + k^2 = (x + k)^2$.

The key insight: in $x^2 + b x$, we need to add $(b/2)^2$ to complete the square.

#example-box(breakable: true)[
  *Solve: $x^2 + 6x + 5 = 0$*

  Step 1: Move the constant to the right side
  $ x^2 + 6x = -5 $

  Step 2: Find $(b/2)^2$

  Here $b = 6$, so $(6/2)^2 = 9$

  Step 3: Add this value to both sides
  $ x^2 + 6x + 9 = -5 + 9 $
  $ (x + 3)^2 = 4 $

  Step 4: Take the square root of both sides (don't forget $plus.minus$!)
  $ x + 3 = plus.minus 2 $

  Step 5: Solve for $x$
  - $x + 3 = 2 #sym.arrow x = -1$
  - $x + 3 = -2 #sym.arrow x = -5$

  *Solutions: $x = -1$ or $x = -5$*
]

#warning-box[
  *Common Mistake:* Forgetting the $plus.minus$ when taking the square root. If $(x + 3)^2 = 4$, then $x + 3$ could be $+2$ or $-2$.
]

== Special Factoring Patterns

Recognizing these patterns can save significant time on the GMAT. They allow instant factoring without the trial-and-error of the standard methods.

=== Difference of Squares

#info-box[
  *Difference of Squares:*
  $ a^2 - b^2 = (a + b)(a - b) $

  This works because the middle terms cancel: $(a + b)(a - b) = a^2 - a b + a b - b^2 = a^2 - b^2$
]

#example-box[
  *Factor: $x^2 - 16$*

  Recognize: $x^2 - 16 = x^2 - 4^2$

  Apply the pattern: $(x + 4)(x - 4)$
]

#tip-box[
  *Extended Pattern:* Numbers like $25$, $36$, $49$, $64$, $81$, $100$, $121$, $144$ are perfect squares. When you see $x^2$ minus one of these, factor immediately!
]

=== Perfect Square Trinomials

#info-box[
  *Perfect Square Trinomials:*
  - $a^2 + 2 a b + b^2 = (a + b)^2$
  - $a^2 - 2 a b + b^2 = (a - b)^2$

  *How to recognize:* The first and last terms are perfect squares, and the middle term is twice the product of their square roots.
]

#example-box[
  *Factor: $x^2 + 10x + 25$*

  Check: Is $25$ a perfect square? Yes, $25 = 5^2$

  Check: Is the middle term $2 times x times 5 = 10x$? Yes! #sym.checkmark

  Therefore: $x^2 + 10x + 25 = (x + 5)^2$
]

=== Sum and Difference of Cubes

#info-box[
  *Sum of Cubes:*
  $ a^3 + b^3 = (a + b)(a^2 - a b + b^2) $

  *Difference of Cubes:*
  $ a^3 - b^3 = (a - b)(a^2 + a b + b^2) $

  *Memory aid:* "SOAP" — Same sign, Opposite sign, Always Positive
  - First factor: same sign as the original
  - Second factor: opposite sign in the middle, always positive at the end
]

#example-box[
  *Factor: $8x^3 - 27$*

  Recognize: $8x^3 = (2x)^3$ and $27 = 3^3$

  This is a difference of cubes: $(2x)^3 - 3^3$

  Apply the formula with $a = 2x$ and $b = 3$:
  $ (2x - 3)((2x)^2 + (2x)(3) + 3^2) = (2x - 3)(4x^2 + 6x + 9) $
]

== Vieta's Formulas: Sum and Product of Roots

*Vieta's formulas* provide a powerful shortcut that connects the roots of a quadratic to its coefficients — without solving the equation.

#info-box[
  *Vieta's Formulas:*

  For $a x^2 + b x + c = 0$ with roots $r$ and $s$:

  $ "Sum of roots:" #h(1em) r + s = -b/a $

  $ "Product of roots:" #h(1em) r times s = c/a $
]

*Why do these work?* If $r$ and $s$ are the roots, then $a x^2 + b x + c = a(x - r)(x - s)$. Expanding the right side:
$ a(x - r)(x - s) = a(x^2 - s x - r x + r s) = a x^2 - a(r + s)x + a r s $

Comparing coefficients: $b = -a(r + s)$ and $c = a r s$, which gives us Vieta's formulas.

#example-box[
  *If the roots of $x^2 - 5x + 6 = 0$ are $r$ and $s$, find $r + s$ and $r s$ without solving.*

  Here $a = 1$, $b = -5$, $c = 6$

  Sum: $r + s = -b/a = -(-5)/1 = 5$

  Product: $r s = c/a = 6/1 = 6$

  (Indeed, the roots are $2$ and $3$: $2 + 3 = 5$ and $2 times 3 = 6$)
]

#strategy-box[
  *GMAT Application:* When a problem asks for $r + s$, $r s$, $r^2 + s^2$, or $1/r + 1/s$, use Vieta's formulas instead of solving for individual roots.

  Useful derived formulas:
  - $r^2 + s^2 = (r + s)^2 - 2 r s$
  - $1/r + 1/s = (r + s)/(r s)$
]

#example-box[
  *If $r$ and $s$ are roots of $x^2 - 7x + 10 = 0$, find $r^2 + s^2$.*

  From Vieta: $r + s = 7$ and $r s = 10$

  Using the identity:
  $ r^2 + s^2 = (r + s)^2 - 2 r s = 7^2 - 2(10) = 49 - 20 = 29 $

  Much faster than finding that $r = 2$, $s = 5$, then computing $4 + 25 = 29$!
]

#pagebreak()

= Inequalities

Equations ask "when are two expressions equal?" Inequalities ask a different question: "when is one expression greater (or less) than another?" While equations typically have specific solutions, inequalities usually have *ranges* of solutions — entire intervals of numbers that satisfy the condition. This makes inequalities essential for optimization problems, constraints, and real-world scenarios where we need to find acceptable ranges rather than exact values.

== Understanding Inequality Notation

Inequalities use four basic symbols to express relationships between quantities:

#info-box[
  *Inequality Symbols:*
  - $<$ *less than* — strictly smaller (not equal)
  - $>$ *greater than* — strictly larger (not equal)
  - $<=$ *less than or equal to* — smaller or the same
  - $>=$ *greater than or equal to* — larger or the same

  The symbols $<$ and $>$ are called *strict inequalities* (they exclude equality).

  The symbols $<=$ and $>=$ are called *non-strict* or *weak inequalities* (they include equality).
]

*Reading inequalities:* Always read inequalities from left to right. The expression $x < 5$ reads "$x$ is less than $5$" and means $x$ can be any number to the left of $5$ on the number line.

== Solving Linear Inequalities

Solving inequalities follows the same principles as solving equations — with one critical exception. You can add, subtract, multiply, or divide both sides by the same quantity, but *multiplying or dividing by a negative number reverses the inequality sign*.

=== Why Does Multiplication by a Negative Flip the Sign?

Consider the true statement $2 < 5$. If we multiply both sides by $-1$:
- Left side: $-1 times 2 = -2$
- Right side: $-1 times 5 = -5$

Is $-2 < -5$? No! On the number line, $-2$ is to the *right* of $-5$, so $-2 > -5$.

Multiplying by a negative number reflects both values across zero, reversing their relative positions.

#info-box[
  *Rules for Manipulating Inequalities:*

  *Operations that PRESERVE the direction:*
  - Adding or subtracting any number from both sides
  - Multiplying or dividing both sides by a *positive* number

  *Operations that REVERSE the direction:*
  - Multiplying or dividing both sides by a *negative* number
]

#example-box[
  *Solve: $-3x + 6 > 12$*

  Step 1: Subtract 6 from both sides (direction unchanged)
  $ -3x + 6 - 6 > 12 - 6 $
  $ -3x > 6 $

  Step 2: Divide both sides by $-3$ (*reverse the inequality!*)
  $ x < -2 $

  The solution is all numbers less than $-2$.
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line for x < -2
    line((-6, 0), (3, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    for i in range(-5, 3) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 8pt)[$#i$])
    }

    // Solution region (arrow extending left from -2)
    line((-5.5, 0), (-2, 0), stroke: blue + 2.5pt)
    // Arrowhead on the left
    line((-5.5, 0), (-5.2, 0.15), stroke: blue + 2.5pt)
    line((-5.5, 0), (-5.2, -0.15), stroke: blue + 2.5pt)

    // Open circle at -2 (not included)
    circle((-2, 0), radius: 0.12, fill: white, stroke: blue + 1.5pt)

    // Label
    content((-3.5, 0.7), text(size: 9pt, fill: blue)[$x < -2$])
  })
]

#warning-box[
  *The Most Common Inequality Mistake:*

  Forgetting to flip the inequality sign when multiplying or dividing by a negative.

  Wrong: $-2x > 4 #sym.arrow x > -2$

  Correct: $-2x > 4 #sym.arrow x < -2$

  *Memory aid:* When you divide by a negative, the "bigger" and "smaller" sides swap roles.
]

#example-box(breakable: true)[
  *Solve: $5 - 2(x + 3) >= 3x + 4$*

  Step 1: Distribute on the left side
  $ 5 - 2x - 6 >= 3x + 4 $
  $ -1 - 2x >= 3x + 4 $

  Step 2: Get all variable terms on one side (add $2x$ to both sides)
  $ -1 >= 5x + 4 $

  Step 3: Subtract 4 from both sides
  $ -5 >= 5x $

  Step 4: Divide by 5 (positive, so direction unchanged)
  $ -1 >= x $

  This is equivalent to $x <= -1$.

  Check with $x = -2$: $5 - 2(-2 + 3) = 5 - 2 = 3$ and $3(-2) + 4 = -2$. Is $3 >= -2$? Yes! #sym.checkmark
]

== Compound Inequalities

A *compound inequality* combines two inequalities into one statement. There are two types:

=== "And" Inequalities (Conjunctions)

An "and" inequality requires *both* conditions to be true simultaneously. It's often written in the compact form $a < x < b$, meaning "$x$ is greater than $a$ AND less than $b$."

The solution is the *intersection* (overlap) of the two conditions.

#example-box(breakable: true)[
  *Solve: $-3 < 2x + 1 <= 7$*

  This compound inequality means: $2x + 1 > -3$ AND $2x + 1 <= 7$

  We solve by performing the same operation on all three parts:

  Step 1: Subtract 1 from all parts
  $ -3 - 1 < 2x + 1 - 1 <= 7 - 1 $
  $ -4 < 2x <= 6 $

  Step 2: Divide all parts by 2
  $ -2 < x <= 3 $

  The solution is all numbers greater than $-2$ and less than or equal to $3$.
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line for compound inequality -2 < x ≤ 3
    line((-5, 0), (6, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    for i in range(-4, 6) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 8pt)[$#i$])
    }

    // Solution region (thick blue line from -2 to 3)
    line((-2, 0), (3, 0), stroke: blue + 2.5pt)

    // Open circle at -2 (not included)
    circle((-2, 0), radius: 0.12, fill: white, stroke: blue + 1.5pt)

    // Closed circle at 3 (included)
    circle((3, 0), radius: 0.12, fill: blue, stroke: blue + 1.5pt)

    // Label
    content((0.5, 0.7), text(size: 9pt, fill: blue)[$-2 < x <= 3$])
  })
]

#tip-box[
  *Graphing Convention:*
  - *Open circle* ($circle.stroked.small$): The endpoint is NOT included ($<$ or $>$)
  - *Closed circle* ($circle.filled.small$): The endpoint IS included ($<=$ or $>=$)
]

=== "Or" Inequalities (Disjunctions)

An "or" inequality requires *at least one* condition to be true. The solution is the *union* of the two conditions.

#example-box[
  *Solve: $3x - 1 < -7$ or $2x + 5 > 11$*

  Solve each inequality separately:

  First inequality: $3x - 1 < -7$
  $ 3x < -6 $
  $ x < -2 $

  Second inequality: $2x + 5 > 11$
  $ 2x > 6 $
  $ x > 3 $

  Solution: $x < -2$ OR $x > 3$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line
    line((-5, 0), (6, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    for i in range(-4, 6) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 8pt)[$#i$])
    }

    // Left region: x < -2
    line((-4.5, 0), (-2, 0), stroke: purple + 2.5pt)
    line((-4.5, 0), (-4.2, 0.15), stroke: purple + 2.5pt)
    line((-4.5, 0), (-4.2, -0.15), stroke: purple + 2.5pt)
    circle((-2, 0), radius: 0.12, fill: white, stroke: purple + 1.5pt)

    // Right region: x > 3
    line((3, 0), (5.5, 0), stroke: purple + 2.5pt)
    line((5.5, 0), (5.2, 0.15), stroke: purple + 2.5pt)
    line((5.5, 0), (5.2, -0.15), stroke: purple + 2.5pt)
    circle((3, 0), radius: 0.12, fill: white, stroke: purple + 1.5pt)

    // Label
    content((0.5, 0.7), text(size: 9pt, fill: purple)[$x < -2$ or $x > 3$])
  })
]

== Absolute Value Inequalities

Absolute value inequalities are a special type of compound inequality in disguise. The key is understanding what absolute value means geometrically: $|x|$ represents the *distance* from $x$ to zero on the number line.

=== Less Than (Distance Within)

When $|x| < a$, we're asking: "which numbers are less than $a$ units away from zero?"

#info-box[
  *Absolute Value "Less Than" Rule:*

  $ |x| < a #h(1em) "means" #h(1em) -a < x < a $

  The solutions form a single interval *between* $-a$ and $a$.

  (For $<=$, use $-a <= x <= a$)
]

Think of it as: $x$ must stay within $a$ units of zero — it can go $a$ units left or $a$ units right, but no further.

#example-box[
  *Solve: $|x - 3| < 5$*

  The expression $|x - 3|$ represents the distance from $x$ to $3$.

  We're asking: which values of $x$ are less than $5$ units away from $3$?

  Using the rule: $-5 < x - 3 < 5$

  Add 3 to all parts: $-2 < x < 8$

  Solution: all numbers between $-2$ and $8$ (exclusive)
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line for absolute value inequality -2 < x < 8
    line((-4, 0), (10, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    for i in range(-3, 10) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 8pt)[$#i$])
    }

    // Mark the center point (3)
    circle((3, 0), radius: 0.08, fill: gray, stroke: gray)
    content((3, -0.9), text(size: 7pt, fill: gray)[center])

    // Solution region (thick green line from -2 to 8)
    line((-2, 0), (8, 0), stroke: green + 2.5pt)

    // Open circles at both ends (exclusive)
    circle((-2, 0), radius: 0.12, fill: white, stroke: green + 1.5pt)
    circle((8, 0), radius: 0.12, fill: white, stroke: green + 1.5pt)

    // Distance annotations
    content((0.5, 0.7), text(size: 8pt, fill: gray)[$5$ units])
    content((5.5, 0.7), text(size: 8pt, fill: gray)[$5$ units])

    // Label
    content((3, 1.2), text(size: 9pt, fill: green.darken(20%))[$-2 < x < 8$])
  })
]

=== Greater Than (Distance Beyond)

When $|x| > a$, we're asking: "which numbers are more than $a$ units away from zero?"

#info-box[
  *Absolute Value "Greater Than" Rule:*

  $ |x| > a #h(1em) "means" #h(1em) x < -a #h(0.5em) "OR" #h(0.5em) x > a $

  The solutions form *two separate rays* extending outward from $-a$ and $a$.

  (For $>=$, use $x <= -a$ or $x >= a$)
]

#example-box[
  *Solve: $|2x + 1| >= 7$*

  Using the rule, this splits into two cases:

  Case 1: $2x + 1 >= 7$
  $ 2x >= 6 $
  $ x >= 3 $

  Case 2: $2x + 1 <= -7$
  $ 2x <= -8 $
  $ x <= -4 $

  Solution: $x <= -4$ OR $x >= 3$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Number line
    line((-7, 0), (6, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    for i in range(-6, 6) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 8pt)[$#i$])
    }

    // Left region: x ≤ -4
    line((-6.5, 0), (-4, 0), stroke: orange + 2.5pt)
    line((-6.5, 0), (-6.2, 0.15), stroke: orange + 2.5pt)
    line((-6.5, 0), (-6.2, -0.15), stroke: orange + 2.5pt)
    circle((-4, 0), radius: 0.12, fill: orange, stroke: orange + 1.5pt)

    // Right region: x ≥ 3
    line((3, 0), (5.5, 0), stroke: orange + 2.5pt)
    line((5.5, 0), (5.2, 0.15), stroke: orange + 2.5pt)
    line((5.5, 0), (5.2, -0.15), stroke: orange + 2.5pt)
    circle((3, 0), radius: 0.12, fill: orange, stroke: orange + 1.5pt)

    // Label
    content((-0.5, 0.7), text(size: 9pt, fill: orange.darken(20%))[$x <= -4$ or $x >= 3$])
  })
]

#strategy-box[
  *Quick Recognition:*

  - $|"stuff"| < k$ → *AND* compound inequality (one interval)
  - $|"stuff"| > k$ → *OR* compound inequality (two rays)

  Memory aid: "Less than" keeps things *together* (between). "Greater than" pushes things *apart* (outside).
]

== Quadratic Inequalities

Quadratic inequalities involve expressions like $x^2 - 5x + 6 > 0$. The strategy is to factor, find the critical points (roots), and test intervals.

#example-box(breakable: true)[
  *Solve: $x^2 - 5x + 6 < 0$*

  Step 1: Factor the quadratic
  $ (x - 2)(x - 3) < 0 $

  Step 2: Find the critical points (where the expression equals zero)

  $x = 2$ and $x = 3$

  Step 3: These points divide the number line into three intervals. Test a value from each:

  - Interval $(-infinity, 2)$: Test $x = 0$: $(0-2)(0-3) = (-2)(-3) = 6 > 0$ ✗
  - Interval $(2, 3)$: Test $x = 2.5$: $(0.5)(-0.5) = -0.25 < 0$ #sym.checkmark
  - Interval $(3, infinity)$: Test $x = 4$: $(2)(1) = 2 > 0$ ✗

  Solution: $2 < x < 3$
]

#tip-box[
  *Sign Analysis Shortcut:* For $(x - a)(x - b) < 0$ where $a < b$:
  - The product is negative when the factors have *opposite signs*
  - This happens when $x$ is *between* the roots: $a < x < b$

  For $(x - a)(x - b) > 0$:
  - The product is positive when factors have the *same sign*
  - This happens when $x$ is *outside* the roots: $x < a$ or $x > b$
]

#pagebreak()

= Functions

A *function* is one of the most important concepts in mathematics — it's a precise way of describing how one quantity depends on another. Functions appear everywhere: in physics (velocity as a function of time), economics (profit as a function of units sold), and of course throughout the GMAT. Understanding function notation and behavior is essential for success.

== What Is a Function?

At its core, a function is a *rule* that takes an input and produces exactly one output. Think of a function as a machine: you feed it a number, it processes that number according to its rule, and it outputs a result.

#info-box[
  *Defining Property of Functions:*

  For every input, there is *exactly one* output.

  This is what distinguishes functions from general relations. A function cannot give two different outputs for the same input — that would be ambiguous.
]

== Function Notation

The notation $f(x)$ — read as "f of x" — represents the output of function $f$ when the input is $x$. The letter $f$ names the function, and $x$ is the variable representing the input.

#info-box[
  *Function Notation:*

  $ f(x) = "expression involving " x $

  - $f$ is the *name* of the function
  - $x$ is the *input* (also called the *argument*)
  - $f(x)$ is the *output* (also called the *value* of $f$ at $x$)
]

*Important:* $f(x)$ does NOT mean "$f$ times $x$". The parentheses here indicate function evaluation, not multiplication.

=== Evaluating Functions

To evaluate a function at a specific value, substitute that value for $x$ everywhere in the expression.

#example-box[
  *If $f(x) = 2x^2 - 3x + 1$, find $f(4)$.*

  Replace every $x$ with $4$:

  $f(4) = 2(4)^2 - 3(4) + 1$

  $#h(2.2em) = 2(16) - 12 + 1$

  $#h(2.2em) = 32 - 12 + 1 = 21$
]

#example-box[
  *If $f(x) = x^2 + 2x$, find $f(a + 1)$.*

  Replace every $x$ with $(a + 1)$:

  $f(a + 1) = (a + 1)^2 + 2(a + 1)$

  $#h(3.5em) = a^2 + 2a + 1 + 2a + 2$

  $#h(3.5em) = a^2 + 4a + 3$

  Notice: we can substitute *any* expression for $x$, not just numbers!
]

#warning-box[
  *Common Mistake:* When substituting an expression like $(a + 1)$, remember to use parentheses and apply the rule to the *entire* expression.

  Wrong: $f(a + 1) = a + 1^2 + 2 dot a + 1$

  Correct: $f(a + 1) = (a + 1)^2 + 2(a + 1)$
]

== Domain and Range

Every function has a *domain* (the set of valid inputs) and a *range* (the set of possible outputs).

#info-box[
  *Domain and Range:*

  - *Domain:* All values of $x$ for which $f(x)$ is defined (the "allowed inputs")
  - *Range:* All values that $f(x)$ can produce (the "possible outputs")
]

=== Finding the Domain

The domain includes all real numbers *unless* something causes the function to be undefined. The two main restrictions are:

#info-box[
  *Domain Restrictions:*

  1. *Division by zero is undefined:* If the function has a denominator, set it $eq.not 0$

  2. *Square roots of negatives are undefined (in real numbers):* If the function has a square root, set the expression under it $>= 0$
]

#example-box[
  *Find the domain of $f(x) = 1/(x - 3)$*

  The denominator cannot be zero:
  $ x - 3 eq.not 0 $
  $ x eq.not 3 $

  *Domain:* All real numbers except $3$

  In interval notation: $(-infinity, 3) union (3, infinity)$
]

The graph below shows why $x = 3$ must be excluded — the function "blows up" (approaches infinity) as $x$ approaches $3$:

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 5),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 2,
      x-min: -2,
      x-max: 8,
      y-min: -6,
      y-max: 6,
      axis-style: "school-book",
      {
        // Left branch: dashed part closer to -infinity
        plot.add(
          domain: (-6, -1.5),
          x => 1 / (x - 3),
          style: (stroke: (paint: blue, dash: "dashed", thickness: 1.5pt)),
        )
        // Left branch: solid part
        plot.add(
          domain: (-1.5, 2.75),
          x => 1 / (x - 3),
          style: (stroke: blue + 1.5pt),
          label: [$f(x) = 1/(x-3)$ #v(2pt)],
        )
        // Left branch: dashed part near asymptote
        plot.add(
          domain: (2.75, 2.9),
          x => 1 / (x - 3),
          style: (stroke: (paint: blue, dash: "dashed", thickness: 1.5pt)),
        )
        // Right branch: dashed part near asymptote
        plot.add(
          domain: (3.1, 3.25),
          x => 1 / (x - 3),
          style: (stroke: (paint: blue, dash: "dashed", thickness: 1.5pt)),
        )
        // Right branch: solid part
        plot.add(
          domain: (3.25, 7.5),
          x => 1 / (x - 3),
          style: (stroke: blue + 1.5pt),
        )
        // Right branch: dashed part closer to infinity
        plot.add(
          domain: (7.5, 10),
          x => 1 / (x - 3),
          style: (stroke: (paint: blue, dash: "dashed", thickness: 1.5pt)),
        )
        // Vertical asymptote (dashed)
        plot.add-vline(
          3,
          style: (stroke: (paint: red, dash: "dashed")),
          label: [Asymptote at $x = 3$],
        )
      },
    )
  })
]

#example-box[
  *Find the domain of $g(x) = sqrt(2x - 6)$*

  The expression under the square root must be non-negative:
  $ 2x - 6 >= 0 $
  $ 2x >= 6 $
  $ x >= 3 $

  *Domain:* All real numbers greater than or equal to $3$

  In interval notation: $[3, infinity)$
]

The graph shows the function only exists for $x >= 3$ — there's simply no curve to the left of that point:

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 4),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 1,
      x-min: -1,
      x-max: 11,
      y-min: -1,
      y-max: 4,
      axis-style: "school-book",
      {
        // Square root function starting at x = 3
        plot.add(
          domain: (3, 10),
          x => calc.sqrt(2 * x - 6),
          style: (stroke: green + 1.5pt),
          label: $g(x) = sqrt(2x - 6)$,
        )
        // Dashed extension to indicate it goes on indefinitely
        plot.add(
          domain: (10, 12),
          x => calc.sqrt(2 * x - 6),
          style: (stroke: (paint: green, dash: "dashed", thickness: 1.5pt)),
        )
        // Mark the starting point
        plot.add(
          ((3, 0), (3, 0)),
          mark: "o",
          mark-style: (stroke: green, fill: green)
        )
      },
    )
  })
]

#example-box(breakable: true)[
  *Find the domain of $h(x) = sqrt(x + 4)/(x - 2)$*

  This function has *both* restrictions:

  1. Square root requires: $x + 4 >= 0 #sym.arrow x >= -4$

  2. Denominator requires: $x - 2 eq.not 0 #sym.arrow x eq.not 2$

  Combining both: $x >= -4$ AND $x eq.not 2$

  *Domain:* $[-4, 2) union (2, infinity)$
]

=== Understanding Range

The range is often harder to determine than the domain. For basic functions:

#tip-box[
  *Common Function Ranges:*

  - $f(x) = x^2$: Range is $[0, infinity)$ — squares are never negative
  - $f(x) = |x|$: Range is $[0, infinity)$ — absolute values are never negative
  - $f(x) = sqrt(x)$: Range is $[0, infinity)$ — square roots output non-negative values
  - $f(x) = 1/x$: Range is all real numbers except $0$ — the output never equals zero
]

== Composite Functions

A *composite function* is formed when the output of one function becomes the input of another. It's like connecting two machines in sequence.

#info-box[
  *Composite Function Notation:*

  $ (f compose g)(x) = f(g(x)) $

  Read as "f composed with g of x" or "f of g of x"

  *Process:* First apply $g$ to $x$, then apply $f$ to the result.

  The function $g$ is the *inner* function; $f$ is the *outer* function.
]

#example-box[
  *If $f(x) = x^2$ and $g(x) = x + 3$, find $(f compose g)(2)$.*

  Step 1: Evaluate the inner function first
  $ g(2) = 2 + 3 = 5 $

  Step 2: Use that result as input to the outer function
  $ f(5) = 5^2 = 25 $

  Therefore: $(f compose g)(2) = 25$
]

#example-box(breakable: true)[
  *If $f(x) = x^2$ and $g(x) = x + 3$, find a formula for $(f compose g)(x)$.*

  Substitute $g(x)$ into $f$:
  $ (f compose g)(x) = f(g(x)) = f(x + 3) $

  Now evaluate $f$ at $(x + 3)$:
  $ = (x + 3)^2 = x^2 + 6x + 9 $

  So $(f compose g)(x) = x^2 + 6x + 9$

  We can verify: $(f compose g)(2) = 2^2 + 6(2) + 9 = 4 + 12 + 9 = 25$ #sym.checkmark
]

#warning-box[
  *Order Matters!*

  In general, $f(g(x)) eq.not g(f(x))$. Composition is NOT commutative.

  Using $f(x) = x^2$ and $g(x) = x + 3$:
  - $(f compose g)(x) = (x + 3)^2 = x^2 + 6x + 9$
  - $(g compose f)(x) = x^2 + 3$

  These are different functions!
]

=== Nested Function Evaluation

GMAT problems sometimes involve evaluating functions at unusual inputs.

#example-box[
  *If $f(x) = 2x - 1$, find $f(f(3))$.*

  Step 1: Find $f(3)$
  $ f(3) = 2(3) - 1 = 5 $

  Step 2: Find $f(5)$
  $ f(5) = 2(5) - 1 = 9 $

  Therefore: $f(f(3)) = 9$
]

== Special Functions and Transformations

=== Linear Functions

A *linear function* has the form $f(x) = m x + b$, where $m$ is the slope and $b$ is the $y$-intercept. Its graph is a straight line.

=== Quadratic Functions

A *quadratic function* has the form $f(x) = a x^2 + b x + c$. Its graph is a parabola opening upward (if $a > 0$) or downward (if $a < 0$).

The vertex (highest or lowest point) occurs at $x = -b/(2a)$.

=== Absolute Value Functions

The *absolute value function* $f(x) = |x|$ creates a V-shaped graph. It reflects all negative outputs to positive.

=== Visualizing Common Functions

The graphs below show the basic shapes you should recognize instantly:

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (10, 5),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 2,
      x-min: -4,
      x-max: 4,
      y-min: -1,
      y-max: 6,
      axis-style: "school-book",
      {
        // Linear: f(x) = x + 1
        plot.add(
          domain: (-3.5, 3.5),
          x => x + 1,
          style: (stroke: blue + 1.5pt),
          label: [Linear: $f(x) = x + 1$],
        )
        // Quadratic: f(x) = x²/2
        plot.add(
          domain: (-3, 3),
          x => calc.pow(x, 2) / 2,
          style: (stroke: red + 1.5pt),
          label: [Quadratic: $f(x) = x^2\/2$],
        )
        // Absolute value: f(x) = |x|
        plot.add(
          domain: (-4, 4),
          x => calc.abs(x),
          style: (stroke: green + 1.5pt),
          label: [Absolute value: $f(x) = |x|}$],
        )
      },
    )
  })
]

#tip-box[
  *Function Transformations (GMAT favorites):*

  Starting with $f(x)$:
  - $f(x) + k$: Shifts graph UP by $k$ units
  - $f(x) - k$: Shifts graph DOWN by $k$ units
  - $f(x + h)$: Shifts graph LEFT by $h$ units
  - $f(x - h)$: Shifts graph RIGHT by $h$ units
  - $-f(x)$: Reflects graph over the $x$-axis
  - $f(-x)$: Reflects graph over the $y$-axis
]

The graph below illustrates vertical and horizontal shifts using $f(x) = x^2$:

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (10, 5),
      x-label: $x$,
      y-label: $y$,
      x-tick-step: 2,
      y-tick-step: 2,
      x-min: -5,
      x-max: 5,
      y-min: -1,
      y-max: 8,
      axis-style: "school-book",
      {
        // Original: f(x) = x²
        plot.add(
          domain: (-2.5, 2.5),
          x => calc.pow(x, 2),
          style: (stroke: black + 1.5pt),
          label: [Original: $f(x) = x^2$],
        )
        // Shifted up: f(x) = x² + 2
        plot.add(
          domain: (-2.2, 2.2),
          x => calc.pow(x, 2) + 2,
          style: (stroke: blue + 1.5pt),
          label: [Up 2: $f(x) + 2$],
        )
        // Shifted right: f(x) = (x-2)²
        plot.add(
          domain: (-0.5, 4.5),
          x => calc.pow(x - 2, 2),
          style: (stroke: red + 1.5pt),
          label: [Right 2: $f(x - 2)$],
        )
        // Shifted left: f(x) = (x+2)²
        plot.add(
          domain: (-4.5, 0.5),
          x => calc.pow(x + 2, 2),
          style: (stroke: green + 1.5pt),
          label: [Left 2: $f(x + 2)$],
        )
      },
    )
  })
]

#warning-box[
  *Counter-Intuitive Shifts:*

  Horizontal shifts work "backwards" from what you might expect:
  - $f(x - 2)$ shifts *right* (not left)
  - $f(x + 2)$ shifts *left* (not right)

  Think of it this way: in $f(x - 2)$, you need $x = 2$ to get what was originally at $x = 0$.
]

#strategy-box[
  *GMAT Function Problem Types:*

  1. *Direct evaluation:* Given $f(x)$, find $f(a)$ — just substitute
  2. *Working backward:* Given $f(a) = k$, find $a$ — set up and solve an equation
  3. *Composition:* Find $f(g(x))$ or evaluate $f(g(a))$ — work inside-out
  4. *Domain questions:* Identify restrictions from denominators and square roots
]

#pagebreak()

= GMAT Strategies for Algebra

The GMAT is as much about strategy as it is about mathematical knowledge. While understanding algebra fundamentals is essential, knowing *when and how* to apply time-saving techniques can make the difference between finishing comfortably and running out of time. This section covers three powerful strategic approaches that expert test-takers use to solve algebra problems quickly and accurately.

== Strategy 1: Backsolving (Working Backward from Answers)

*Backsolving* is a powerful technique where instead of solving an equation algebraically, you test the answer choices to see which one works. This approach is especially effective when the algebra would be complex but checking a specific number is straightforward.

=== When to Use Backsolving

Backsolving works best when:
- Answer choices are *specific numbers* (not variables or expressions)
- The problem asks for a single value (like "What is $x$?")
- Setting up and solving the equation algebraically seems time-consuming
- The answer choices are "nice" numbers that are easy to work with

#strategy-box[
  *The Backsolving Process:*

  1. *Start with choice (C)* — the middle value. GMAT answer choices are typically arranged in order from smallest to largest.

  2. *Test it in the problem.* Substitute this value and see if it satisfies all conditions.

  3. *Adjust based on the result:*
     - If (C) is too high → the answer is (A) or (B)
     - If (C) is too low → the answer is (D) or (E)

  4. *Test one more choice* to confirm. Usually 2-3 attempts are enough.
]

=== Why Start with the Middle Choice?

Starting with choice (C) is strategic because it allows you to eliminate roughly half the choices with each test. If (C) is too large, you've eliminated (C), (D), and (E) in one step. This binary search approach is far more efficient than testing choices randomly.

#example-box(breakable: true)[
  *A number increased by 20% of itself equals 72. What is the number?*

  (A) 54 #h(1em) (B) 58 #h(1em) (C) 60 #h(1em) (D) 62 #h(1em) (E) 66

  *Backsolving approach:*

  Start with (C): 60

  60 increased by 20% of itself = $60 + 0.20 times 60 = 60 + 12 = 72$ #sym.checkmark

  The first try worked! *Answer: (C) 60*

  Note: Algebraically, you'd solve $x + 0.2x = 72$, giving $1.2x = 72$, so $x = 60$. Both methods work, but backsolving can be faster when the algebra isn't immediately obvious.
]

#example-box(breakable: true)[
  *If $3x - 7 = 2x + 5$, what is the value of $x$?*

  (A) 8 #h(1em) (B) 10 #h(1em) (C) 12 #h(1em) (D) 14 #h(1em) (E) 16

  *Backsolving approach:*

  Start with (C): $x = 12$
  - Left side: $3(12) - 7 = 36 - 7 = 29$
  - Right side: $2(12) + 5 = 24 + 5 = 29$ #sym.checkmark

  *Answer: (C) 12*
]

#example-box(breakable: true)[
  *The sum of three consecutive even integers is 66. What is the largest of these integers?*

  (A) 20 #h(1em) (B) 22 #h(1em) (C) 24 #h(1em) (D) 26 #h(1em) (E) 28

  *Backsolving approach:*

  The question asks for the *largest* integer. Start with (C): 24

  If the largest is 24, the three consecutive even integers are: 20, 22, 24

  Sum: $20 + 22 + 24 = 66$ #sym.checkmark

  *Answer: (C) 24*
]

#warning-box[
  *When NOT to Backsolve:*

  - When the algebra is simple and direct (e.g., $2x = 10$)
  - When answer choices contain variables or complex expressions
  - When there are multiple unknowns with no clear way to test
  - When the problem involves finding a range or inequality
]

== Strategy 2: Number Picking (Strategic Substitution)

*Number picking* is the complement to backsolving. While backsolving works when answer choices are numbers, number picking works when answer choices contain *variables*. You substitute convenient numbers for the variables, calculate the result, and then see which answer choice gives the same result.

=== The Logic Behind Number Picking

Any algebraic expression that's always true must work for *any* valid number you choose. So if you pick a specific number, calculate the answer, and only one answer choice matches, that choice must be correct. It's like solving a puzzle by testing a specific case.

#strategy-box[
  *The Number Picking Process:*

  1. *Choose "nice" numbers* for each variable in the problem
  2. *Calculate the answer* using your chosen numbers
  3. *Substitute your numbers* into each answer choice
  4. *The answer choice that matches* your calculated result is correct
]

=== What Makes a "Good" Number?

Not all numbers are equally useful for picking. Some choices make calculations easier while avoiding special cases that might give the same result for multiple answer choices.

#info-box[
  *Guidelines for Picking Numbers:*

  - *Avoid 0 and 1* — these often make different expressions equal (e.g., $x^2 = x$ when $x = 1$)
  - *Use small, distinct primes like 2, 3, 5* — they rarely create coincidental matches
  - *Pick 100 for percentages* — makes percent calculations trivial
  - *Pick the LCM of denominators* — eliminates fractions entirely
  - *Make sure your numbers satisfy any given conditions* (e.g., if $x > y$, pick $x = 5$, $y = 2$)
]

#example-box(breakable: true)[
  *If $x$ is a positive integer, which of the following is equivalent to $(x + 1)^2 - x^2$?*

  (A) $1$ #h(1em) (B) $x + 1$ #h(1em) (C) $2x$ #h(1em) (D) $2x + 1$ #h(1em) (E) $2x + 2$

  *Number picking approach:*

  Let $x = 3$ (a convenient positive integer, avoiding 0 and 1)

  Calculate: $(3 + 1)^2 - 3^2 = 16 - 9 = 7$

  Now test each answer choice with $x = 3$:
  - (A) $1 = 1$ #sym.times
  - (B) $3 + 1 = 4$ #sym.times
  - (C) $2(3) = 6$ #sym.times
  - (D) $2(3) + 1 = 7$ #sym.checkmark
  - (E) $2(3) + 2 = 8$ #sym.times

  *Answer: (D) $2x + 1$*

  Verification: Algebraically, $(x+1)^2 - x^2 = x^2 + 2x + 1 - x^2 = 2x + 1$ #sym.checkmark
]

#example-box(breakable: true)[
  *If $a$ and $b$ are positive integers and $a > b$, which expression must be positive?*

  (A) $b - a$ #h(1em) (B) $a - b$ #h(1em) (C) $a b - a$ #h(1em) (D) $b/a - 1$ #h(1em) (E) $b^2 - a^2$

  *Number picking approach:*

  Let $a = 5$ and $b = 2$ (satisfying $a > b$, both positive)

  Test each answer choice:
  - (A) $2 - 5 = -3$ #sym.times (negative)
  - (B) $5 - 2 = 3$ #sym.checkmark (positive!)
  - (C) $(5)(2) - 5 = 10 - 5 = 5$ — wait, this is also positive

  Two choices worked! We need to try different numbers to distinguish them.

  Let $a = 3$ and $b = 1$:
  - (B) $3 - 1 = 2$ #sym.checkmark (still positive)
  - (C) $(3)(1) - 3 = 3 - 3 = 0$ #sym.times (zero is not positive)

  *Answer: (B) $a - b$*
]

#tip-box[
  *Multiple Matches? Pick New Numbers!*

  If more than one answer choice matches your result, it doesn't mean the method failed — it means you need to test with *different* numbers to distinguish between the remaining candidates. Usually, a second set of numbers resolves this.
]

#example-box(breakable: true)[
  *If a sweater originally costs $d$ dollars, and is discounted by 20%, what is the sale price in terms of $d$?*

  (A) $0.20d$ #h(1em) (B) $0.80d$ #h(1em) (C) $d - 20$ #h(1em) (D) $d/0.20$ #h(1em) (E) $1.20d$

  *Number picking approach:*

  Pick $d = 100$ (ideal for percentage problems!)

  Original price: \$100

  20% discount: $100 times 0.20 = \$20$ off

  Sale price: $100 - 20 = \$80$

  Test answer choices with $d = 100$:
  - (A) $0.20(100) = 20$ #sym.times
  - (B) $0.80(100) = 80$ #sym.checkmark
  - (C) $100 - 20 = 80$ — also matches!

  Two choices work. Let's try $d = 50$:

  Sale price: $50 - 0.20(50) = 50 - 10 = \$40$
  - (B) $0.80(50) = 40$ #sym.checkmark
  - (C) $50 - 20 = 30$ #sym.times

  *Answer: (B) $0.80d$*
]

== Strategy 3: Pattern Recognition

Expert GMAT test-takers develop an eye for recognizing algebraic patterns that signal quick solutions. When you spot these patterns, you can often bypass lengthy calculations entirely.

=== Why Pattern Recognition Matters

Many GMAT problems are *designed* around specific algebraic identities. The test-makers expect that students who recognize the pattern will solve the problem in 30 seconds, while those who don't might struggle for 3 minutes. Pattern recognition is about knowing what to look for.

#info-box[
  *Essential Algebraic Patterns:*

  *Difference of Squares:*
  $ x^2 - y^2 = (x + y)(x - y) $

  *Perfect Square Trinomials:*
  $ x^2 + 2 x y + y^2 = (x + y)^2 $
  $ x^2 - 2 x y + y^2 = (x - y)^2 $

  *Sum and Difference Products:*
  $ (x + y)(x - y) = x^2 - y^2 $
]

=== Pattern Recognition in Action

The key is to recognize *what you're given* and *what you need to find*, then identify the relationship between them.

#example-box(breakable: true)[
  *If $x + y = 7$ and $x - y = 3$, what is the value of $x^2 - y^2$?*

  *Pattern recognition approach:*

  Notice that $x^2 - y^2 = (x + y)(x - y)$

  We're given both $(x + y)$ and $(x - y)$!

  $ x^2 - y^2 = (x + y)(x - y) = 7 times 3 = 21 $

  *Answer: 21*

  Compare this to the "brute force" approach: Solve for $x$ and $y$ individually (getting $x = 5$, $y = 2$), then compute $25 - 4 = 21$. Pattern recognition is much faster!
]

#example-box(breakable: true)[
  *If $x + y = 10$ and $x y = 21$, what is $x^2 + y^2$?*

  *Pattern recognition approach:*

  We need $x^2 + y^2$, but we're given $x + y$ and $x y$.

  Key identity: $(x + y)^2 = x^2 + 2 x y + y^2$

  Rearranging: $x^2 + y^2 = (x + y)^2 - 2 x y$

  Substituting: $x^2 + y^2 = (10)^2 - 2(21) = 100 - 42 = 58$

  *Answer: 58*
]

#strategy-box[
  *Common GMAT Pattern Triggers:*

  - *See $x^2 - y^2$?* → Think $(x+y)(x-y)$
  - *See $(x+y)$ and $(x-y)$ separately?* → Multiply them for $x^2 - y^2$
  - *Need $x^2 + y^2$ given $x + y$ and $x y$?* → Use $(x+y)^2 - 2 x y$
  - *Need $x y$ given $x + y$ and $x - y$?* → Use $[(x+y)^2 - (x-y)^2]/4$
  - *See $a^2 - 2 a b + b^2$?* → Factor as $(a-b)^2$
]

#example-box(breakable: true)[
  *What is the value of $47^2 - 53^2$?*

  (A) $-600$ #h(1em) (B) $-300$ #h(1em) (C) $-6$ #h(1em) (D) $300$ #h(1em) (E) $600$

  *Pattern recognition approach:*

  Recognize: $47^2 - 53^2 = (47 + 53)(47 - 53)$

  Calculate: $(100)(-6) = -600$

  *Answer: (A) $-600$*

  Without pattern recognition, you'd need to compute $2209 - 2809$ — much slower and more error-prone!
]

== Choosing the Right Strategy

Knowing *when* to apply each strategy is as important as knowing *how*. Here's a quick decision framework:

#info-box[
  *Strategy Selection Guide:*

  *Look at the answer choices first!*

  - *Answer choices are specific numbers* → Consider *Backsolving*
  - *Answer choices contain variables* → Consider *Number Picking*
  - *Problem involves expressions like $x^2 - y^2$, $(x+y)$, $(x-y)$* → Consider *Pattern Recognition*

  *Also consider:*
  - Is the algebra straightforward? → Just solve it directly
  - Are you stuck after 30 seconds? → Try a strategic approach
  - Does the problem feel "designed" for a trick? → Look for patterns
]

#tip-box[
  *Develop Your Strategic Instincts:*

  The best GMAT test-takers don't rigidly follow rules — they develop *intuition* for which approach will be fastest. This comes from practice. As you work through problems, consciously ask yourself: "Could I have solved this faster another way?" Over time, you'll naturally gravitate toward the most efficient method.
]

#example-box(breakable: true)[
  *Strategic Decision Example:*

  *"If $x$ is a positive integer and $x^2 = 144$, what is $x$?"*

  (A) 10 #h(1em) (B) 11 #h(1em) (C) 12 #h(1em) (D) 13 #h(1em) (E) 14

  *Analysis:* You could backsolve, but recognizing that $144 = 12^2$ is immediate. Direct knowledge is fastest here.

  *"If $(x + 3)(x - 2) = 0$, which of the following could be the value of $x$?"*

  (A) $-3$ #h(1em) (B) $-2$ #h(1em) (C) $0$ #h(1em) (D) $2$ #h(1em) (E) $3$

  *Analysis:* Pattern recognition (Zero Product Property) tells us $x = -3$ or $x = 2$. Scanning the choices: both (A) and (D) appear! Read carefully — the question asks "could be," so either works. Answer: (A) or (D).

  *"If $n$ is a positive integer, which expression represents an even number?"*

  (A) $2n + 1$ #h(1em) (B) $n^2$ #h(1em) (C) $3n$ #h(1em) (D) $4n$ #h(1em) (E) $n + 1$

  *Analysis:* Number picking! Let $n = 3$:
  - (A) $7$ — odd
  - (B) $9$ — odd
  - (C) $9$ — odd
  - (D) $12$ — even!
  - (E) $4$ — even

  Two choices work! Try $n = 2$:
  - (D) $8$ — even
  - (E) $3$ — odd

  Answer: (D) $4n$
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Algebraic expressions and simplification
2. Linear equations (one and two variables)
3. Introduction to quadratics (factoring method)
4. Basic inequalities

*Question Time:* 5-6 questions covering linear equations and simple factoring

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Quadratic formula and discriminant
2. Absolute value equations and inequalities
3. Functions and function notation
4. GMAT strategies (backsolving, number picking)

*Review errors from Training #1, focusing on:*
- Sign errors in solving equations
- Forgetting to flip inequality signs
- Factoring mistakes

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick factoring recognition
- Strategy selection (when to backsolve vs. solve algebraically)

*Assessment:* 20 questions, 40 minutes

== Common Student Difficulties

1. Sign errors when solving equations
2. Forgetting to flip inequality signs with negatives
3. Difficulty factoring non-standard quadratics
4. Confusion with function notation f(g(x))
5. Not recognizing when to use backsolving

#warning-box[
  *Tutor Tip:* Have students check their answers by substituting back into the original equation. This catches most arithmetic errors.
]
