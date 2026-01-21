#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Number Properties & Arithmetic",
  level: "Lesson Material",
  intro: "Comprehensive guide covering integers, factors, primes, divisibility, even/odd properties, and arithmetic operations.",
  logo: "/Logo.png"
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Lesson Overview

*Topic:* Number Properties & Arithmetic\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-01 (First of 5 QR topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Identify and apply properties of integers, including positive, negative, and zero
2. Understand factors, multiples, and divisibility rules
3. Work with prime numbers and prime factorization
4. Apply even/odd number rules in problem-solving
5. Perform operations with integers efficiently
6. Recognize number property patterns commonly tested on the GMAT

== GMAT Relevance

Number properties appear in approximately 15-20% of QR questions. These concepts are foundational—weaknesses here will impact performance across all quantitative topics.

#pagebreak()

= Integers and the Number Line

== What Are Integers?

In mathematics, numbers come in many forms, and understanding the distinctions between them is essential for success on the GMAT. The most fundamental type of number you will encounter is the *integer*.

An integer is simply a whole number—one that has no fractional or decimal component. The set of integers includes all positive whole numbers (1, 2, 3, ...), all negative whole numbers (-1, -2, -3, ...), and zero. We can represent this set as:

$ ZZ = {..., -3, -2, -1, 0, 1, 2, 3, ...} $

It is equally important to recognize what integers are _not_. Fractions such as $1\/2$ or $3\/4$ are not integers because they represent parts of a whole. Similarly, decimal numbers like $3.5$ or $-2.75$ are not integers. Even numbers that might appear "whole" in some contexts, such as $sqrt(2)$ (approximately 1.414...), are not integers because their exact values cannot be expressed without decimals that continue infinitely.

#info-box[
  *Key Definition:* An integer is any number that can be written without a fractional or decimal component. This includes positive numbers, negative numbers, and zero.
]

== The Number Line

One of the most useful tools for visualizing integers (and numbers in general) is the *number line*. The number line is a straight line on which every point corresponds to a real number, and every real number corresponds to exactly one point.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Draw the number line with arrows
    line((-5, 0), (5, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    // Draw tick marks and labels
    for i in range(-4, 5) {
      line((i, -0.15), (i, 0.15), stroke: 1pt)
      content((i, -0.5), $#i$)
    }
  })
]

The number line extends infinitely in both directions, which is indicated by the arrows at each end. By convention, we place smaller numbers to the left and larger numbers to the right. This means that as you move rightward along the number line, the values increase; as you move leftward, they decrease.

Zero occupies the central reference point on the number line. All positive numbers lie to the right of zero, while all negative numbers lie to the left. The integers appear as equally spaced points along this line, with each consecutive integer exactly one unit apart from its neighbors.

Understanding the number line helps us grasp important concepts such as the *ordering* of numbers. For any two numbers, the one that appears further to the right is the greater number. For instance, since 3 lies to the right of -5, we know that $3 > -5$, even though 5 is "larger" than 3 in absolute terms.

== Positive, Negative, and Zero

The integers can be divided into three distinct categories based on their relationship to zero:

*Positive integers* are all integers greater than zero. These are the counting numbers we use in everyday life: 1, 2, 3, 4, and so on, continuing without bound. On the number line, positive integers appear to the right of zero.

*Negative integers* are all integers less than zero. These numbers represent quantities "below" zero, such as temperatures below freezing or debts. The negative integers are -1, -2, -3, -4, and so on. On the number line, they appear to the left of zero.

*Zero* itself occupies a special position. It is neither positive nor negative—it serves as the boundary between the positive and negative integers. This distinction is critically important on the GMAT, where questions frequently test whether students understand that zero is excluded from both categories.

#warning-box[
  *GMAT Trap:* Zero is NEITHER positive NOR negative.

  When a problem states "positive integers," zero is not included. Similarly, "negative integers" excludes zero. However, "non-negative integers" (meaning "not negative") _does_ include zero, as do "non-positive integers."
]

== Absolute Value

The *absolute value* of a number represents its distance from zero on the number line, regardless of direction. Since distance is always measured as a positive quantity (or zero), the absolute value of any number is never negative.

We denote the absolute value of a number $x$ using vertical bars: $|x|$. Geometrically, $|x|$ tells us "how far" $x$ is from the origin (zero) without regard to whether $x$ lies to the left or right of zero.

Consider the numbers 5 and -5. Although they are different numbers—one positive and one negative—they are both exactly 5 units away from zero on the number line. Therefore, $|5| = 5$ and $|-5| = 5$. The absolute value "strips away" the sign and gives us only the magnitude.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Draw the number line
    line((-4, 0), (4, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    // Draw tick marks
    for i in range(-3, 4) {
      line((i, -0.1), (i, 0.1), stroke: 1pt)
      content((i, -0.4), $#i$)
    }

    // Highlight absolute value example: |-3| = |3| = 3
    line((-3, 0.3), (0, 0.3), stroke: (paint: blue, thickness: 1.5pt), mark: (start: "|", end: "|"))
    content((-1.5, 0.6), text(fill: blue, size: 9pt)[$|-3| = 3$])

    line((0, 0.7), (3, 0.7), stroke: (paint: red, thickness: 1.5pt), mark: (start: "|", end: "|"))
    content((1.5, 1.0), text(fill: red, size: 9pt)[$|3| = 3$])
  })
]

The diagram above illustrates this concept. Both -3 and 3 are exactly 3 units from zero, so they share the same absolute value.

Formally, we can define absolute value as follows:

$ |x| = cases(x & "if" x >= 0, -x & "if" x < 0) $

This definition might seem counterintuitive at first—why would we write "$-x$" for negative numbers? Remember that if $x$ is already negative (say, $x = -5$), then $-x$ becomes $-(-5) = 5$, which is positive. The definition ensures that the output is always non-negative.

#info-box[
  *Key Property:* For all real numbers $x$, we have $|x| >= 0$. The absolute value equals zero only when $x = 0$.
]

== Number Sets

Before delving deeper into number properties, it is valuable to understand how integers fit within the broader hierarchy of number sets. Mathematics organizes numbers into nested categories, each building upon the previous one.

The *natural numbers* (denoted $NN$) are the counting numbers: 1, 2, 3, 4, and so on. These are the most basic numbers, used since ancient times for counting objects. Some mathematicians include zero in this set, but for GMAT purposes, natural numbers typically begin at 1.

The *whole numbers* extend the natural numbers by including zero: 0, 1, 2, 3, 4, and so on. This addition allows us to represent "nothing" or an empty quantity.

The *integers* (denoted $ZZ$) further extend the whole numbers by including negative numbers. This expansion allows us to represent concepts like debt, temperature below zero, or movement in opposite directions.

The *rational numbers* (denoted $QQ$) include all numbers that can be expressed as a fraction $p\/q$ where $p$ and $q$ are integers and $q != 0$. Every integer is also a rational number (since any integer $n$ can be written as $n\/1$), but rational numbers also include fractions like $1\/2$, $-3\/4$, and decimals that either terminate (like 0.75) or repeat (like $0.333... = 1\/3 = 0.overline(3)$).

The *irrational numbers* are numbers that cannot be expressed as fractions of integers. Their decimal representations neither terminate nor repeat. Famous examples include $sqrt(2)$, $pi$, and $e$.

Together, the rational and irrational numbers form the *real numbers* (denoted $RR$), which represent every point on the number line.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Draw nested rounded rectangles for number sets (Venn-style diagram)
    // Using rect with radius for rounded corners

    // Real numbers (outermost)
    rect((-6, -3.5), (6, 3.5), stroke: (paint: gray, thickness: 1.5pt), fill: gray.lighten(90%), radius: 1.5)
    content((4, 2.7), text(fill: gray, weight: "bold", size: 9pt)[Real Numbers $RR$])

    // Rational numbers
    rect((-5.5, -2.8), (2.5, 2.8), stroke: (paint: purple, thickness: 1.5pt), fill: purple.lighten(90%), radius: 1.2)
    content((-3.8, 2.4), text(fill: purple, weight: "bold", size: 9pt)[Rational $QQ$])

    // Integers
    rect((-4.8, -2.1), (1.2, 2.1), stroke: (paint: blue, thickness: 1.5pt), fill: blue.lighten(90%), radius: 1)
    content((-3.2, 1.7), text(fill: blue, weight: "bold", size: 9pt)[Integers $ZZ$])

    // Whole numbers
    rect((-4, -1.4), (0.4, 1.4), stroke: (paint: green, thickness: 1.5pt), fill: green.lighten(90%), radius: 0.7)
    content((-2.9, 1.05), text(fill: green, weight: "bold", size: 9pt)[Whole])

    // Natural numbers (innermost)
    rect((-3.2, -0.8), (-0.2, 0.8), stroke: (paint: orange, thickness: 1.5pt), fill: orange.lighten(85%), radius: 0.5)
    content((-1.7, 0.3), text(fill: orange, weight: "bold", size: 9pt)[Natural $NN$])

    // Irrational numbers label (outside rational but inside real)
    content((4.2, 0), text(fill: gray.darken(20%), size: 8pt)[Irrational:])
    content((4.2, -0.5), text(fill: gray.darken(20%), size: 8pt)[$sqrt(2), pi, e$])

    // Example numbers in each region
    content((-1.7, -0.3), text(size: 7pt)[1, 2, 3 ...])
    content((-2.5, -1.1), text(size: 7pt)[0])
    content((-1, -1.75), text(size: 7pt)[-1, -2 ...])
    content((-1.8, -2.5), text(size: 7pt)[$1/2$, $0.75$, $-3/4$, $0.overline(3)$])
  })
]

This hierarchy illustrates an important principle: every natural number is also a whole number, every whole number is an integer, every integer is a rational number, and every rational number is a real number. The GMAT primarily tests integers and rational numbers, but understanding where these fit in the broader mathematical landscape helps clarify their properties.

#tip-box[
  *For the GMAT:* Most number property questions focus on integers. When a problem mentions "numbers" without specification, consider whether the solution changes if non-integers are allowed. This distinction frequently appears in Data Sufficiency questions.
]

#pagebreak()

= Factors and Multiples

== Understanding Factors and Multiples

The concepts of factors and multiples are two sides of the same coin, and understanding their relationship is fundamental to working with integers on the GMAT.

A *factor* (also called a divisor) of a number is any integer that divides evenly into that number—that is, the division results in another integer with no remainder. For example, when we divide 12 by 3, we get exactly 4, with nothing left over. This tells us that 3 is a factor of 12. Similarly, 1, 2, 4, 6, and 12 itself are all factors of 12, because each divides into 12 without leaving a remainder.

A *multiple* of a number is the result of multiplying that number by any positive integer. In other words, multiples are what you get when you "count by" a number. The multiples of 3 are 3, 6, 9, 12, 15, and so on—each obtained by multiplying 3 by 1, 2, 3, 4, 5, and so forth.

The relationship between factors and multiples is reciprocal: if $a$ is a factor of $b$, then $b$ is a multiple of $a$. For instance, since 3 is a factor of 12, we can equally say that 12 is a multiple of 3. This duality often appears in GMAT problems, so being comfortable moving between both perspectives is essential.

#info-box[
  *Key Definitions:*

  - *Factor:* An integer $a$ is a factor of integer $b$ if $b div a$ is an integer (no remainder).
  - *Multiple:* An integer $b$ is a multiple of integer $a$ if $b = a times k$ for some positive integer $k$.

  These definitions are two ways of expressing the same relationship: $a$ is a factor of $b$ if and only if $b$ is a multiple of $a$.
]

== Finding All Factors of a Number

To find all factors of a given number, we systematically test which integers divide evenly into it. The most efficient approach is to test divisors starting from 1 and working upward, noting that factors come in pairs.

When a number $n$ has a factor $a$, there is always a corresponding factor $b$ such that $a times b = n$. For example, if we discover that 3 is a factor of 36 (because $36 div 3 = 12$), we simultaneously discover that 12 is also a factor. This pairing continues until the two factors meet or cross over—which happens at $sqrt(n)$.

Therefore, we only need to test potential factors up to the square root of the number. Once we pass this point, any new factors we would find have already been discovered as the "partners" of smaller factors.

#example-box[
  *Find all factors of 36:*

  We test integers from 1 up to $sqrt(36) = 6$:

  - $36 div 1 = 36$ #sym.checkmark #h(1em) This gives us the pair: 1 and 36
  - $36 div 2 = 18$ #sym.checkmark #h(1em) This gives us the pair: 2 and 18
  - $36 div 3 = 12$ #sym.checkmark #h(1em) This gives us the pair: 3 and 12
  - $36 div 4 = 9$ #sym.checkmark #h(1em) This gives us the pair: 4 and 9
  - $36 div 5 = 7.2$ #sym.crossmark #h(1em) Not an integer, so 5 is not a factor
  - $36 div 6 = 6$ #sym.checkmark #h(1em) The pair is 6 and 6 (same number)

  Arranging all discovered factors in order: *1, 2, 3, 4, 6, 9, 12, 18, 36*
]

Notice that 36, being a perfect square, has an odd number of factors (9 factors). This occurs because one factor pair consists of the same number repeated ($6 times 6$). Non-perfect squares always have an even number of factors.

== What Are Prime Numbers?

Before we can discuss prime factorization, we must first understand what prime numbers are. A *prime number* is a positive integer greater than 1 that has exactly two distinct factors: 1 and itself. In other words, a prime number cannot be divided evenly by any positive integer other than 1 and the number itself.

The first several prime numbers are: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, ...

These numbers are the "atoms" of arithmetic—the indivisible building blocks from which all other positive integers are constructed through multiplication.

Several important facts about prime numbers deserve special attention:

*The number 1 is not prime.* By definition, a prime must have exactly two factors. The number 1 has only one factor (itself), so it does not qualify. This distinction matters because it ensures that every integer has a unique prime factorization.

*The number 2 is the only even prime.* Every even number greater than 2 is divisible by 2, which means it has at least three factors (1, 2, and itself). Therefore, 2 stands alone as the only even prime number. All other primes are odd.

*There are infinitely many primes.* This was proven by Euclid over two thousand years ago. No matter how far we count, we will always find more prime numbers.

#info-box[
  *Key Definition:* A prime number is a positive integer greater than 1 whose only factors are 1 and itself.

  *Remember:*
  - 1 is NOT prime (only one factor)
  - 2 is the ONLY even prime
  - Every integer greater than 1 is either prime or can be expressed as a product of primes
]

=== Identifying Prime Numbers

To determine whether a number $n$ is prime, we need to check if it has any factors other than 1 and itself. The efficient approach is to test divisibility only by prime numbers up to $sqrt(n)$.

Why only up to the square root? If $n$ has a factor larger than $sqrt(n)$, then it must also have a corresponding factor smaller than $sqrt(n)$ (since factors come in pairs that multiply to give $n$). So if we find no factors up to $sqrt(n)$, there cannot be any factors beyond it either.

#example-box[
  *Is 97 prime?*

  First, calculate $sqrt(97) approx 9.8$, so we only need to test prime divisors up to 9.

  The primes up to 9 are: 2, 3, 5, 7

  - *Divisible by 2?* No—97 is odd (ends in 7)
  - *Divisible by 3?* No—digit sum is $9 + 7 = 16$, not divisible by 3
  - *Divisible by 5?* No—doesn't end in 0 or 5
  - *Divisible by 7?* No—$97 div 7 approx 13.86$, not an integer

  Since 97 is not divisible by any prime up to its square root, *97 is prime*. #sym.checkmark
]

#tip-box[
  *Quick Prime Check:* For numbers under 100, you only need to test divisibility by 2, 3, 5, and 7 (since $sqrt(100) = 10$). For numbers under 50, testing just 2, 3, 5, and 7 is still sufficient (since $sqrt(49) = 7$).
]

== Prime Factorization: The Foundation

Before exploring GCF and LCM in depth, we must understand *prime factorization*, the process of expressing any integer greater than 1 as a product of prime numbers. This concept is so fundamental that it serves as the most powerful tool for solving factor-related problems.

Every positive integer greater than 1 can be written as a unique product of prime numbers (this is known as the Fundamental Theorem of Arithmetic). For example:

$ 36 = 2 times 2 times 3 times 3 = 2^2 times 3^2 $

$ 60 = 2 times 2 times 3 times 5 = 2^2 times 3 times 5 $

$ 84 = 2 times 2 times 3 times 7 = 2^2 times 3 times 7 $

The prime factorization reveals the "building blocks" of a number. Just as any physical structure is composed of basic components, every integer is composed of prime numbers multiplied together. This representation makes it straightforward to analyze relationships between numbers, particularly when finding common factors or multiples.

To find the prime factorization, we use a systematic method called *repeated division*. Starting with the original number, we divide by the smallest prime number that divides it evenly. We continue this process with the quotient until we reach 1. The prime factors are all the divisors we used along the way.

This process is typically written in a two-column format: the quotients appear in the left column, and the prime divisors appear in the right column, separated by a vertical line.

#example-box[
  *Find the prime factorization of 60:*

  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Draw the vertical line
      line((0.4, 0.5), (0.4, -4.5), stroke: 1pt)

      // Left column: numbers being divided
      content((0, 0), text(size: 11pt)[$60$])
      content((0, -1), text(size: 11pt)[$30$])
      content((0, -2), text(size: 11pt)[$15$])
      content((0, -3), text(size: 11pt)[$5$])
      content((0, -4), text(size: 11pt)[$1$])

      // Right column: prime divisors
      content((0.8, 0), text(fill: red, size: 11pt)[$2$])
      content((0.8, -1), text(fill: red, size: 11pt)[$2$])
      content((0.8, -2), text(fill: red, size: 11pt)[$3$])
      content((0.8, -3), text(fill: red, size: 11pt)[$5$])

      // Explanation arrows and text
      content((2.5, 0), text(size: 9pt)[($60 div 2 = 30$)])
      content((2.5, -1), text(size: 9pt)[($30 div 2 = 15$)])
      content((2.5, -2), text(size: 9pt)[($15 div 3 = 5$)])
      content((2.5, -3), text(size: 9pt)[($5 div 5 = 1$)])
    })
  ]

  Reading the prime factors from the right column: $60 = 2 times 2 times 3 times 5 = 2^2 times 3 times 5$
]

#example-box[
  *Find the prime factorization of 84:*

  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Draw the vertical line
      line((0.4, 0.5), (0.4, -4.5), stroke: 1pt)

      // Left column: numbers being divided
      content((0, 0), text(size: 11pt)[$84$])
      content((0, -1), text(size: 11pt)[$42$])
      content((0, -2), text(size: 11pt)[$21$])
      content((0, -3), text(size: 11pt)[$7$])
      content((0, -4), text(size: 11pt)[$1$])

      // Right column: prime divisors
      content((0.8, 0), text(fill: red, size: 11pt)[$2$])
      content((0.8, -1), text(fill: red, size: 11pt)[$2$])
      content((0.8, -2), text(fill: red, size: 11pt)[$3$])
      content((0.8, -3), text(fill: red, size: 11pt)[$7$])

      // Explanation arrows and text
      content((2.5, 0), text(size: 9pt)[($84 div 2 = 42$)])
      content((2.5, -1), text(size: 9pt)[($42 div 2 = 21$)])
      content((2.5, -2), text(size: 9pt)[($21 div 3 = 7$)])
      content((2.5, -3), text(size: 9pt)[($7 div 7 = 1$)])
    })
  ]

  Reading the prime factors: $84 = 2 times 2 times 3 times 7 = 2^2 times 3 times 7$
]

#tip-box[
  *Tips for Finding Prime Factorization:*

  - Always start with the smallest prime (2) and work your way up
  - Continue dividing by the same prime as long as possible before moving to the next
  - The process ends when you reach 1
]

== Greatest Common Factor (GCF)

The *Greatest Common Factor* (also called Greatest Common Divisor or GCD) of two or more numbers is the largest integer that divides evenly into all of them. Understanding the GCF helps simplify fractions, solve problems involving shared quantities, and recognize common structure between numbers.

While listing all factors of each number and finding the largest shared one works for small numbers, prime factorization provides a more elegant and efficient method, especially for larger values.

The key insight is this: if we write each number in terms of its prime factorization, then any common factor must be built from primes that appear in *both* factorizations. The GCF is constructed by taking each prime that appears in both numbers and using the *smaller* exponent.

#example-box[
  *Find the GCF of 72 and 120 using prime factorization:*

  First, find the prime factorization of each number:

  $ 72 = 2^3 times 3^2 $
  $ 120 = 2^3 times 3^1 times 5^1 $

  Now identify the common primes and take the minimum power of each:
  - Prime 2 appears in both: minimum power is $min(3, 3) = 3$
  - Prime 3 appears in both: minimum power is $min(2, 1) = 1$
  - Prime 5 appears only in 120, so it is not included in the GCF

  Therefore: $"GCF"(72, 120) = 2^3 times 3^1 = 8 times 3 = 24$
]

Why does this method work? Any common factor of 72 and 120 must divide both numbers. If a factor contained $2^4$, it could not divide 72 (which only has $2^3$). If it contained $3^2$, it could not divide 120 (which only has $3^1$). By taking the minimum power of each shared prime, we construct the largest possible factor that still divides both numbers.

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Venn diagram showing prime factors
    // Draw circles with stroke only (no fill) for clean overlap
    circle((-1.2, 0), radius: 2.1, stroke: (paint: blue, thickness: 2pt), fill: none)
    circle((1.2, 0), radius: 2.1, stroke: (paint: red, thickness: 2pt), fill: none)

    // Labels for the sets
    content((-3.5, 1.8), text(fill: blue, weight: "bold", size: 11pt)[72])
    content((3.8, 1.8), text(fill: red, weight: "bold", size: 11pt)[120])

    // Prime factorizations below set names
    content((-3.5, 1.3), text(fill: blue, size: 8pt)[$2^3 times 3^2$])
    content((3.8, 1.3), text(fill: red, size: 8pt)[$2^3 times 3 times 5$])

    // Intersection (common factors) - the GCF
    content((0, 0.5), text(weight: "bold", size: 9pt)[Common])
    content((0, 0), text(size: 10pt)[$2^3 times 3$])
    content((0, -0.6), text(fill: purple.lighten(30%), weight: "bold", size: 9pt)[GCF = 24])

    // Only in 72 (the extra factor of 3)
    content((-2.4, 0), text(fill: blue, size: 10pt)[$3$])

    // Only in 120 (the factor of 5)
    content((2.4, 0), text(fill: red, size: 10pt)[$5$])
  })
]

== Least Common Multiple (LCM)

The *Least Common Multiple* of two or more numbers is the smallest positive integer that is a multiple of all of them. The LCM is essential for adding fractions with different denominators, solving problems about cyclical events, and finding when patterns align.

Just as with the GCF, prime factorization provides the most systematic approach to finding the LCM.

The reasoning is complementary to the GCF: the LCM must be divisible by each of the original numbers. To ensure this, the LCM must contain every prime factor from *either* number, raised to the *highest* power that appears in any of the factorizations.

#example-box[
  *Find the LCM of 72 and 120 using prime factorization:*

  Using our earlier factorizations:

  $ 72 = 2^3 times 3^2 $
  $ 120 = 2^3 times 3^1 times 5^1 $

  Take every prime that appears in either factorization with its maximum power:
  - Prime 2: maximum power is $max(3, 3) = 3$
  - Prime 3: maximum power is $max(2, 1) = 2$
  - Prime 5: maximum power is $max(0, 1) = 1$ (treating absence as power 0)

  Therefore: $"LCM"(72, 120) = 2^3 times 3^2 times 5 = 8 times 9 times 5 = 360$
]

The LCM formula ensures that 360 is divisible by 72 (because $360 = 72 times 5$) and by 120 (because $360 = 120 times 3$), and no smaller number has this property.

#strategy-box[
  *Summary of Prime Factorization Methods:*

  - *GCF:* Take the *minimum* power of each *common* prime
  - *LCM:* Take the *maximum* power of *all* primes present

  These methods are reliable for any pair of numbers, no matter how large.
]

== The GCF-LCM Relationship

There is an elegant mathematical relationship between the GCF and LCM of any two positive integers:

$ "GCF"(a, b) times "LCM"(a, b) = a times b $

This formula can be rearranged to find one value if you know the other:

$ "LCM"(a, b) = (a times b) / "GCF"(a, b) $

Let us verify this with our example. For 72 and 120:
- $"GCF" = 24$
- $"LCM" = 360$
- $"GCF" times "LCM" = 24 times 360 = 8640$
- $72 times 120 = 8640$ #sym.checkmark

This relationship arises because when we multiply $a times b$, each prime factor gets "counted twice"—once from $a$ and once from $b$. The GCF captures the overlap (what they share), and the LCM captures the union (everything needed to cover both). Together, they account for exactly $a times b$.

#tip-box[
  *Practical Application:*

  If you need to find the LCM but the GCF is easier to compute, use the formula:

  $ "LCM"(a, b) = (a times b) / "GCF"(a, b) $

  This is often faster than listing multiples, especially for larger numbers.
]

#pagebreak()

= Divisibility Rules

Divisibility rules are shortcuts that allow you to quickly determine whether one number divides evenly into another without performing the actual division. These rules are invaluable on the GMAT, where time is limited and mental math is essential.

Each rule exploits a pattern in our base-10 number system. For instance, since 10 is divisible by 2 and 5, the divisibility of any number by 2 or 5 depends only on its last digit. Similarly, since $10 equiv 1 space (mod 3)$ and $10 equiv 1 space (mod 9)$, divisibility by 3 or 9 can be checked by summing the digits.

#info-box[
  *The Modulo Notation:* The expression $a equiv b space (mod n)$ reads "$a$ is congruent to $b$ modulo $n$" and means that $a$ and $b$ have the same remainder when divided by $n$. Equivalently, $n$ divides $(a - b)$ evenly.

  For example, $17 equiv 2 space (mod 5)$ because both 17 and 2 leave a remainder of 2 when divided by 5. This notation is useful for understanding why divisibility rules work and appears occasionally in advanced GMAT problems.
]

The following table summarizes the most important divisibility rules:

#align(center)[
  #uptoten-table(
    columns: 2,
    header: ("Divisor", "Rule"),
    "2", "Last digit is even (0, 2, 4, 6, 8)",
    "3", "Sum of digits is divisible by 3",
    "4", "Last two digits form a number divisible by 4",
    "5", "Last digit is 0 or 5",
    "6", "Divisible by both 2 AND 3",
    "7", "Double the last digit and subtract from the rest; result divisible by 7",
    "8", "Last three digits form a number divisible by 8",
    "9", "Sum of digits is divisible by 9",
    "10", "Last digit is 0",
    "11", "Alternating sum of digits is divisible by 11",
  )
]

Notice the pattern: rules for 2, 5, and 10 involve only the last digit because these numbers are factors of 10. Rules for 4 and 8 extend this logic to the last two or three digits because $4 = 2^2$ divides $100 = 10^2$ and $8 = 2^3$ divides $1000 = 10^3$. Rules for 3 and 9 use digit sums because of how remainders behave when dividing powers of 10.

The rule for 6 illustrates an important principle: to check divisibility by a composite number, you can check divisibility by its coprime factors separately. Since $6 = 2 times 3$ and 2 and 3 share no common factors, a number is divisible by 6 if and only if it is divisible by both 2 and 3.

== Rules for 7 and 11

The divisibility rules for 7 and 11 are slightly more complex but can be useful for larger numbers.

*Divisibility by 7:* Take the last digit, double it, and subtract this value from the remaining digits. If the result is divisible by 7 (or is 0), then the original number is divisible by 7. You can repeat this process if the result is still large.

#example-box[
  *Is 364 divisible by 7?*

  - Last digit: 4. Double it: $4 times 2 = 8$
  - Remaining digits: 36
  - Subtract: $36 - 8 = 28$
  - Is 28 divisible by 7? Yes ($28 = 7 times 4$). #sym.checkmark

  Therefore, 364 is divisible by 7.
]

*Divisibility by 11:* Calculate the alternating sum of the digits (subtract and add alternately from right to left, or equivalently, subtract the sum of digits in even positions from the sum of digits in odd positions). If the result is divisible by 11 (including 0), the original number is divisible by 11.

#example-box[
  *Is 9,174 divisible by 11?*

  Writing the digits with alternating signs from right to left: $4 - 7 + 1 - 9 = -11$

  Is $-11$ divisible by 11? Yes. #sym.checkmark

  Therefore, 9,174 is divisible by 11.
]

#example-box[
  *Is 2,736 divisible by:*

  *3?* Sum of digits: $2 + 7 + 3 + 6 = 18$. Is 18 divisible by 3? Yes ($18 = 3 times 6$). #sym.checkmark

  *4?* Last two digits: 36. Is 36 divisible by 4? Yes ($36 = 4 times 9$). #sym.checkmark

  *6?* Divisible by 2 (ends in 6, which is even) AND divisible by 3 (shown above)? Yes. #sym.checkmark

  *9?* Sum of digits: 18. Is 18 divisible by 9? Yes ($18 = 9 times 2$). #sym.checkmark
]

#warning-box[
  *Common Mistake:* Divisibility by 6 requires BOTH 2 AND 3, not just one.

  Example: 15 is divisible by 3 but not by 2, so it is not divisible by 6.

  Example: 14 is divisible by 2 but not by 3, so it is not divisible by 6.
]

#tip-box[
  *GMAT Application:* Divisibility rules are particularly useful in Data Sufficiency questions, where you often need to determine whether a number has certain properties without calculating its exact value. They also speed up prime factorization by helping you quickly identify which primes to test.
]

#pagebreak()

= Even and Odd Numbers

The classification of integers into even and odd numbers is one of the most fundamental concepts in number theory. This simple distinction — whether a number is divisible by 2 or not — leads to powerful patterns that appear frequently on the GMAT.

== Understanding Even and Odd Numbers

An *even number* is any integer that can be divided by 2 with no remainder. Mathematically, we can write any even number as $2k$ where $k$ is an integer. The even numbers are: $..., -6, -4, -2, 0, 2, 4, 6, ...$

An *odd number* is any integer that leaves a remainder of 1 when divided by 2. We can write any odd number as $2k + 1$ where $k$ is an integer. The odd numbers are: $..., -5, -3, -1, 1, 3, 5, ...$

#info-box[
  *Quick Identification:* You can identify whether a number is even or odd by looking at its last digit:
  - *Even:* ends in 0, 2, 4, 6, or 8
  - *Odd:* ends in 1, 3, 5, 7, or 9
]

=== Is Zero Even or Odd?

A common question: is zero even? The answer is *yes, zero is even*. By definition, an even number is one that is divisible by 2 with no remainder. Since $0 div 2 = 0$ (an integer, with no remainder), zero satisfies the definition of an even number. Alternatively, we can write $0 = 2 times 0$, which matches our formula $2k$ with $k = 0$.

== Arithmetic with Even and Odd Numbers

One of the most useful properties of even and odd numbers is that the parity (evenness or oddness) of arithmetic results follows predictable patterns. Understanding *why* these patterns work — not just memorizing them — will help you apply them confidently.

=== Addition and Subtraction Rules

#align(center)[
  #uptoten-table(
    columns: 3,
    header: ("Operation", "Result", "Example"),
    [$"Even" + "Even"$], "Even", [$4 + 6 = 10$],
    [$"Odd" + "Odd"$], "Even", [$3 + 5 = 8$],
    [$"Even" + "Odd"$], "Odd", [$4 + 3 = 7$],
    [$"Even" - "Even"$], "Even", [$8 - 4 = 4$],
    [$"Odd" - "Odd"$], "Even", [$7 - 3 = 4$],
    [$"Even" - "Odd"$], "Odd", [$6 - 3 = 3$],
    [$"Odd" - "Even"$], "Odd", [$7 - 4 = 3$],
  ) 
]


*Why do these rules work?* Let's use algebra to see why. If we represent even numbers as $2a$ and odd numbers as $2b + 1$:

- *Even + Even:* $2a + 2b = 2(a + b)$ — clearly divisible by 2, so even
- *Odd + Odd:* $(2a + 1) + (2b + 1) = 2a + 2b + 2 = 2(a + b + 1)$ — divisible by 2, so even
- *Even + Odd:* $2a + (2b + 1) = 2(a + b) + 1$ — one more than a multiple of 2, so odd

#tip-box[
  *Memory Shortcut for Addition/Subtraction:*
  - *Same parity* (both even or both odd) → *Even result*
  - *Different parity* → *Odd result*

  Subtraction follows the same rules as addition because subtracting is the same as adding a negative, and negative numbers preserve parity ($-3$ is still odd, $-4$ is still even).
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Title
    content((4, 4), text(weight: "bold", size: 11pt)[Even/Odd Addition Rules])

    // Draw grid for addition
    let cell-size = 1.2

    // Headers
    content((2.5, 3), text(weight: "bold", size: 9pt)[$+$])
    content((4, 3), text(fill: blue, weight: "bold", size: 9pt)[Even])
    content((5.5, 3), text(fill: red, weight: "bold", size: 9pt)[Odd])

    content((2.5, 2), text(fill: blue, weight: "bold", size: 9pt)[Even])
    content((2.5, 1), text(fill: red, weight: "bold", size: 9pt)[Odd])

    // Results
    rect((3.4, 1.5), (4.6, 2.5), fill: blue.lighten(80%), stroke: 0.5pt)
    content((4, 2), text(fill: blue, size: 9pt)[Even])

    rect((4.9, 1.5), (6.1, 2.5), fill: purple.lighten(80%), stroke: 0.5pt)
    content((5.5, 2), text(fill: purple, size: 9pt)[Odd])

    rect((3.4, 0.5), (4.6, 1.5), fill: purple.lighten(80%), stroke: 0.5pt)
    content((4, 1), text(fill: purple, size: 9pt)[Odd])

    rect((4.9, 0.5), (6.1, 1.5), fill: blue.lighten(80%), stroke: 0.5pt)
    content((5.5, 1), text(fill: blue, size: 9pt)[Even])
  })
]

=== Multiplication Rules

#align(center)[
  #uptoten-table(
    columns: 3,
    header: ("Operation", "Result", "Example"),
    [$"Even" times "Even"$], "Even", [$4 times 6 = 24$],
    [$"Even" times "Odd"$], "Even", [$4 times 3 = 12$],
    [$"Odd" times "Odd"$], "Odd", [$3 times 5 = 15$],
  )
]

*Why do these rules work?* Again, let's use algebra:

- *Even × Even:* $2a times 2b = 4 a b = 2(2 a b)$ — divisible by 2, so even
- *Even × Odd:* $2a times (2b + 1) = 4 a b + 2a = 2(2 a b + a)$ — divisible by 2, so even
- *Odd × Odd:* $(2a + 1)(2b + 1) = 4 a b + 2a + 2b + 1 = 2(2 a b + a + b) + 1$ — one more than a multiple of 2, so odd

#tip-box[
  *Memory Shortcut for Multiplication:*
  - If *any* factor is even → *Even result*
  - *Only* odd × odd → *Odd result*

  Think of it this way: an even number "carries" a factor of 2, and that factor of 2 will appear in any product involving that number.
]

=== Division: The Tricky Case

Division is more complicated because dividing two integers doesn't always yield an integer. The even/odd rules only apply to integers, so we can only make predictions when the division results in an integer:

#warning-box[
  *Division Rules (when the result is an integer):*
  - Even ÷ Even → Could be either (e.g., $8 div 2 = 4$ is even, but $6 div 2 = 3$ is odd)
  - Even ÷ Odd → Even (e.g., $6 div 3 = 2$)
  - Odd ÷ Odd → Odd (e.g., $15 div 3 = 5$)
  - Odd ÷ Even → Never an integer! An odd number cannot be evenly divided by an even number.
]

The key insight is that *odd ÷ even is never an integer*. This is because an odd number has no factor of 2, so it cannot be evenly divided by any even number.

== Applications on the GMAT

Understanding even/odd properties allows you to answer many GMAT questions without performing actual calculations.

#example-box[
  *Example 1: Is the product of three consecutive integers even or odd?*

  Three consecutive integers always include at least one even number (every other integer is even). Since any product containing an even factor is even, the product must be *even*.

  We don't need to know which three consecutive integers, the answer is always the same.
]

#example-box[
  *Example 2: If $n$ is an odd integer, is $n^2 + n$ even or odd?*

  We can factor: $n^2 + n = n(n + 1)$

  Since $n$ is odd, $n + 1$ is even. The product of an odd and an even number is even.

  Therefore, $n^2 + n$ is *even* for any odd integer $n$.
]

#strategy-box[
  *GMAT Strategy:* When a problem asks about even/odd properties:
  1. Don't calculate specific values, think about parity
  2. Consider representing unknowns as $2k$ (even) or $2k + 1$ (odd)
  3. Remember that consecutive integers alternate between even and odd
  4. Watch for products, one even factor makes the entire product even
]

#pagebreak()

= Remainders

When we divide one integer by another, the result is not always a whole number. The *remainder* is what "remains" after we have divided as many complete groups as possible. Understanding remainders is essential for the GMAT, where they appear in problems involving divisibility, cyclical patterns, and number properties.

== The Division Algorithm

When we divide a positive integer $a$ (the *dividend*) by a positive integer $b$ (the *divisor*), we can always express the relationship as:

$ a = b times q + r $

where $q$ is the *quotient* (how many complete groups of $b$ fit into $a$) and $r$ is the *remainder* (what's left over). This formula is known as the *Division Algorithm*, and it is the foundation for all remainder problems.

#example-box[
  *When 17 is divided by 5:*

  We ask: how many complete groups of 5 fit into 17? The answer is 3, because $5 times 3 = 15$.

  What remains? $17 - 15 = 2$

  Therefore: $17 = 5 times 3 + 2$

  Here, 17 is the dividend, 5 is the divisor, 3 is the quotient, and 2 is the remainder.
]

#info-box[
  *The Division Algorithm:*

  For any integers $a$ and $b$ with $b > 0$, there exist unique integers $q$ and $r$ such that:

  $ a = b times q + r quad "where" quad 0 <= r < b $

  The condition $0 <= r < b$ is crucial: the remainder must be non-negative and strictly less than the divisor.
]

== Key Properties of Remainders

Several important properties follow directly from the division algorithm:

*Property 1: The remainder is always less than the divisor.*

If we're dividing by 7, the possible remainders are 0, 1, 2, 3, 4, 5, and 6. There cannot be a remainder of 7 or greater, because that would mean we could fit another complete group of 7.

*Property 2: A remainder of 0 means exact divisibility.*

When $r = 0$, the equation $a = b times q + 0$ simplifies to $a = b times q$, which means $b$ divides $a$ exactly. This is the connection between remainders and divisibility.

*Property 3: Two numbers with the same remainder when divided by $n$ differ by a multiple of $n$.*

If $a = n times q_1 + r$ and $b = n times q_2 + r$ (same remainder $r$), then:

$ a - b = n times q_1 - n times q_2 = n(q_1 - q_2) $

This difference is a multiple of $n$. This property is the foundation of modular arithmetic.

#tip-box[
  *Expressing Numbers with Remainders:*

  When a problem states "when $n$ is divided by 7, the remainder is 3," you can write:

  $ n = 7k + 3 quad "for some non-negative integer" k $

  This algebraic representation is extremely powerful for solving GMAT remainder problems.
]

== Remainder Arithmetic

One of the most useful skills for GMAT problems is understanding how remainders behave under arithmetic operations. When we add, subtract, or multiply numbers, we can work with their remainders directly.

=== Addition of Remainders

When adding two numbers, the remainder of the sum equals the sum of the individual remainders (adjusted if necessary to stay within range).

#example-box[
  *If $a$ has remainder 4 when divided by 7, and $b$ has remainder 5 when divided by 7, what is the remainder when $a + b$ is divided by 7?*

  We can write: $a = 7 j + 4$ and $b = 7k + 5$ for some integers $j$ and $k$.

  Then: $a + b = 7 j + 4 + 7k + 5 = 7(j + k) + 9 = 7(j + k) + 7 + 2 = 7(j + k + 1) + 2$

  The remainder is *2*.

  Shortcut: $4 + 5 = 9$, and $9 = 7 times 1 + 2$, so the remainder is 2.
]

=== Multiplication of Remainders

Similarly, when multiplying numbers, we can multiply their remainders and then find the remainder of that product.

#example-box[
  *If $n$ divided by 7 has remainder 3, what is the remainder when $2n$ is divided by 7?*

  We write: $n = 7k + 3$ for some integer $k$.

  Then: $2n = 2(7k + 3) = 14k + 6 = 7(2k) + 6$

  The remainder is *6*.

  Shortcut: The remainder of $n$ is 3, so the remainder of $2n$ is $2 times 3 = 6$. Since $6 < 7$, no adjustment is needed.
]

#example-box[
  *If $m$ has remainder 5 when divided by 6, what is the remainder when $m^2$ is divided by 6?*

  The remainder of $m$ is 5, so the remainder of $m^2$ corresponds to $5^2 = 25$.

  Now find the remainder when 25 is divided by 6: $25 = 6 times 4 + 1$

  The remainder is *1*.
]

#warning-box[
  *Important:* After adding or multiplying remainders, always check if the result exceeds the divisor. If so, divide again to find the final remainder.

  For example, if remainders 5 and 4 are added with divisor 6: $5 + 4 = 9$, but $9 = 6 + 3$, so the actual remainder is 3.
]

== Cyclical Patterns in Remainders

One of the most powerful properties of remainders is that they follow *cyclical patterns*. When we repeatedly multiply a number by itself (computing powers), the remainders cycle through a repeating sequence.

This property is invaluable for problems involving very large exponents, where direct calculation is impossible.

#example-box[
  *What is the remainder when $2^50$ is divided by 3?*

  Instead of calculating $2^50$ (an astronomically large number), we find the pattern of remainders:

  - $2^1 = 2$ #sym.arrow remainder 2 when divided by 3
  - $2^2 = 4$ #sym.arrow remainder 1 when divided by 3
  - $2^3 = 8$ #sym.arrow remainder 2 when divided by 3
  - $2^4 = 16$ #sym.arrow remainder 1 when divided by 3

  The pattern repeats: *2, 1, 2, 1, 2, 1, ...* with a period of 2.

  Since 50 is even, $2^50$ falls on the same position in the cycle as $2^2$.

  The remainder is *1*.
]

The key insight is that once a remainder repeats, the entire pattern must repeat from that point. This is because each remainder uniquely determines the next one (through the same multiplication).

#example-box[
  *What is the units digit of $7^100$?*

  The units digit is the same as the remainder when divided by 10. Let's find the pattern:

  - $7^1 = 7$ #sym.arrow units digit 7
  - $7^2 = 49$ #sym.arrow units digit 9
  - $7^3 = 343$ #sym.arrow units digit 3
  - $7^4 = 2401$ #sym.arrow units digit 1
  - $7^5 = 16807$ #sym.arrow units digit 7 (cycle repeats!)

  The pattern is *7, 9, 3, 1* with period 4.

  Since $100 = 4 times 25$, the exponent 100 is a multiple of 4, so $7^100$ has the same units digit as $7^4$.

  The units digit is *1*.
]

#strategy-box[
  *GMAT Strategy for Cyclical Patterns:*

  1. Calculate the first several terms until you see the pattern repeat
  2. Determine the period (length of the cycle)
  3. Divide the target exponent by the period and find the remainder
  4. The answer corresponds to that position in the cycle

  For units digit problems, the cycle length is at most 4 for any base (often less).
]

== Common GMAT Remainder Techniques

#tip-box[
  *Technique 1: Translate Words to Algebra*

  "When $n$ is divided by 5, the remainder is 2" becomes $n = 5k + 2$.

  This representation lets you substitute and manipulate algebraically.
]

#tip-box[
  *Technique 2: Test Small Numbers*

  If a problem asks about remainders for an unknown integer with certain properties, test small examples that satisfy those properties. The remainder pattern will often become clear.
]

#tip-box[
  *Technique 3: Use the "Rebuild" Method*

  To find what numbers leave remainder $r$ when divided by $d$:

  Start with $r$ and keep adding $d$: the numbers are $r, r + d, r + 2d, r + 3d, ...$

  Example: Numbers that leave remainder 3 when divided by 7 are: 3, 10, 17, 24, 31, ...
]

#pagebreak()

= Order of Operations

When an expression contains multiple operations, we need a consistent set of rules to determine which operations to perform first. Without such rules, an expression like $2 + 3 times 4$ could be interpreted as either $(2 + 3) times 4 = 20$ or $2 + (3 times 4) = 14$. The *order of operations* provides the standard convention that ensures everyone evaluates expressions the same way.

== The PEMDAS/BODMAS Convention

The order of operations is commonly remembered using the acronym *PEMDAS* (used in the United States) or *BODMAS* (used in the United Kingdom and other countries). Both represent the same rules:

#info-box[
  *Order of Operations:*
  1. *P*arentheses / *B*rackets — Evaluate expressions inside grouping symbols first
  2. *E*xponents / *O*rders — Calculate powers and roots
  3. *M*ultiplication and *D*ivision — Perform from left to right
  4. *A*ddition and *S*ubtraction — Perform from left to right
]

The key insight is that multiplication and division have *equal priority* — neither comes before the other. The same is true for addition and subtraction. When operations of equal priority appear in an expression, we simply work from left to right.

#example-box[
  *Evaluate: $3 + 4 times 2^2 - 6 div 2$*

  Step 1 — Exponents: $3 + 4 times 4 - 6 div 2$

  Step 2 — Multiplication and Division (left to right):
  - $4 times 4 = 16$: #h(1em) $3 + 16 - 6 div 2$
  - $6 div 2 = 3$: #h(1em) $3 + 16 - 3$

  Step 3 — Addition and Subtraction (left to right):
  - $3 + 16 = 19$: #h(1em) $19 - 3$
  - $19 - 3 = 16$

  Final answer: *16*
]

=== Common Misconceptions

Many students misinterpret PEMDAS to mean that multiplication *always* comes before division, and addition *always* comes before subtraction. This is incorrect and leads to errors.

#warning-box[
  *Common Mistake #1:* Thinking multiplication comes before division.

  *Wrong approach:* $24 div 4 times 2 = 24 div 8 = 3$ (doing $4 times 2$ first)

  *Correct approach:* $24 div 4 times 2 = 6 times 2 = 12$ (left to right)

  Multiplication and division have *equal priority* — work left to right!
]

#warning-box[
  *Common Mistake #2:* Thinking addition comes before subtraction.

  *Wrong approach:* $10 - 3 + 2 = 10 - 5 = 5$ (doing $3 + 2$ first)

  *Correct approach:* $10 - 3 + 2 = 7 + 2 = 9$ (left to right)

  Addition and subtraction have *equal priority* — work left to right!
]

=== Nested Parentheses

When parentheses are nested inside each other, work from the *innermost* parentheses outward. Different types of brackets — ( ), [ ], \{ \} — all serve the same purpose of grouping, with the variety used simply to make nested expressions easier to read.

#example-box[
  *Evaluate: $2 times [3 + (4 - 1)^2]$*

  Step 1 — Innermost parentheses: $(4 - 1) = 3$
  $ 2 times [3 + 3^2] $

  Step 2 — Exponent inside brackets: $3^2 = 9$
  $ 2 times [3 + 9] $

  Step 3 — Brackets: $3 + 9 = 12$
  $ 2 times 12 $

  Step 4 — Multiplication:
  $ 24 $

  Final answer: *24*
]

== Properties of Arithmetic Operations

Beyond the order of operations, certain fundamental properties govern how arithmetic operations behave. Understanding these properties helps you simplify calculations and manipulate expressions efficiently.

=== The Commutative Property

The *commutative property* states that the order of operands does not affect the result for addition and multiplication:

$ a + b = b + a quad "and" quad a times b = b times a $

This property allows us to rearrange terms to make calculations easier. For example, when adding $7 + 38 + 3$, we can rearrange to $7 + 3 + 38 = 10 + 38 = 48$.

#warning-box[
  *Important:* Subtraction and division are *not* commutative!

  $ 5 - 3 != 3 - 5 quad "and" quad 6 div 2 != 2 div 6 $
]

=== The Associative Property

The *associative property* states that the grouping of operands does not affect the result for addition and multiplication:

$ (a + b) + c = a + (b + c) quad "and" quad (a times b) times c = a times (b times c) $

This property allows us to regroup terms. For instance, $25 times 17 times 4$ is easier to compute as $25 times 4 times 17 = 100 times 17 = 1700$.

#warning-box[
  *Important:* Subtraction and division are *not* associative!

  $ (8 - 4) - 2 != 8 - (4 - 2) quad "since" quad 2 != 6 $
  $ (8 div 4) div 2 != 8 div (4 div 2) quad "since" quad 1 != 4 $
]

=== The Distributive Property

The *distributive property* connects multiplication and addition, allowing us to "distribute" multiplication over terms inside parentheses:

$ a times (b + c) = a times b + a times c $

This property is perhaps the most useful for simplifying expressions and performing mental math.

#example-box[
  *Calculate $7 times 98$ mentally using the distributive property:*

  $ 7 times 98 = 7 times (100 - 2) = 7 times 100 - 7 times 2 = 700 - 14 = 686 $
]

The distributive property also works "in reverse" — we can *factor* common terms out of a sum:

$ a times b + a times c = a times (b + c) $

#example-box[
  *Simplify: $15 times 7 + 15 times 3$*

  $ 15 times 7 + 15 times 3 = 15 times (7 + 3) = 15 times 10 = 150 $
]

=== Identity and Inverse Properties

The *identity* elements are special numbers that leave other numbers unchanged under an operation:

- *Additive identity:* $a + 0 = a$ (zero leaves numbers unchanged under addition)
- *Multiplicative identity:* $a times 1 = a$ (one leaves numbers unchanged under multiplication)

The *inverse* of a number "undoes" an operation, returning the identity element:

- *Additive inverse:* $a + (-a) = 0$ (every number has a negative that sums to zero)
- *Multiplicative inverse:* $a times (1\/a) = 1$ for $a != 0$ (every non-zero number has a reciprocal)

#tip-box[
  *GMAT Application:* These properties are especially useful for:
  - Simplifying complex expressions by rearranging terms (commutative/associative)
  - Breaking apart difficult calculations (distributive)
  - Recognizing equivalent expressions in answer choices
  - Mental math shortcuts on calculation-heavy problems
]

#align(center)[
  #uptoten-table(
    columns: 3,
    header: ("Property", "For Addition", "For Multiplication"),
    "Commutative", [$a + b = b + a$], [$a times b = b times a$],
    "Associative", [$(a + b) + c = a + (b + c)$], [$(a times b) times c = a times (b times c)$],
    "Identity", [$a + 0 = a$], [$a times 1 = a$],
    "Inverse", [$a + (-a) = 0$], [$a times (1\/a) = 1$],
  )
]

#info-box[
  *The Distributive Property* (connecting multiplication and addition):

  $ a(b + c) = a b + a c $

  This is the only property that connects two different operations.
]

#pagebreak()

= Common GMAT Patterns

The GMAT frequently tests certain number patterns that appear across many different problem types. Recognizing these patterns allows you to solve problems more quickly and confidently. This section consolidates the most important patterns related to number properties.

== Consecutive Integers

*Consecutive integers* are integers that follow each other in order, with no gaps between them. If we start with any integer $n$, the consecutive integers are $n, n+1, n+2, n+3, ...$ and so on.

Examples of consecutive integer sequences:
- 5, 6, 7, 8 (four consecutive integers starting at 5)
- -2, -1, 0, 1, 2 (five consecutive integers including zero)
- 100, 101, 102 (three consecutive integers)

=== Properties of Consecutive Integers

Consecutive integers have several useful properties that appear frequently on the GMAT:

*Property 1: The product of any two or more consecutive integers is always even.*

Among any two consecutive integers, exactly one is even and one is odd. Since an even number is a factor of the product, the result must be even.

*Property 2: The product of any three or more consecutive integers is always divisible by 6.*

Among any three consecutive integers, exactly one is divisible by 2 and exactly one is divisible by 3 (since every third integer is divisible by 3). Therefore, the product contains both 2 and 3 as factors, making it divisible by $2 times 3 = 6$.

*Property 3: The product of any $n$ consecutive integers is divisible by $n!$ (n factorial).*

This generalizes the previous property. For example, the product of any 4 consecutive integers is divisible by $4! = 24$.

#info-box[
  *Sum of Consecutive Integers:*

  The sum of $n$ consecutive integers equals $n times ("average")$, where the average is the middle number (for odd $n$) or the average of the two middle numbers (for even $n$).

  Equivalently: Sum $= n times ("first" + "last") / 2$
]

#example-box[
  *What is the sum of the integers from 1 to 100?*

  Using the formula: Sum $= n times ("first" + "last") / 2 = 100 times (1 + 100) / 2 = 100 times 50.5 = 5050$

  This is the famous result discovered by young Gauss!
]

=== Other Types of Consecutive Sequences

The GMAT also tests variations of consecutive integers:

- *Consecutive even integers:* 2, 4, 6, 8, ... (or generally $2n, 2n+2, 2n+4, ...$)
- *Consecutive odd integers:* 1, 3, 5, 7, ... (or generally $2n+1, 2n+3, 2n+5, ...$)
- *Consecutive multiples of $k$:* $k, 2k, 3k, 4k, ...$ (e.g., consecutive multiples of 5: 5, 10, 15, 20, ...)

#tip-box[
  *GMAT Tip:* When a problem involves consecutive integers, represent them algebraically as $n, n+1, n+2, ...$ This makes it easy to set up equations and work with their properties.
]

== Counting Factors

One of the most powerful techniques in number theory is using prime factorization to count how many factors a number has. This method is far more efficient than listing all factors manually.

=== The Factor Counting Formula

If a number $n$ has the prime factorization:

$ n = p_1^(a_1) times p_2^(a_2) times p_3^(a_3) times ... times p_k^(a_k) $

then the *total number of positive factors* of $n$ is:

$ (a_1 + 1) times (a_2 + 1) times (a_3 + 1) times ... times (a_k + 1) $

*Why does this work?* Each factor of $n$ is formed by choosing how many of each prime to include. For prime $p_1$, we can include it 0, 1, 2, ..., or $a_1$ times — that's $(a_1 + 1)$ choices. We make an independent choice for each prime, so we multiply the number of choices together.

#example-box[
  *How many positive factors does 72 have?*

  Step 1: Find the prime factorization.
  $ 72 = 8 times 9 = 2^3 times 3^2 $

  Step 2: Apply the formula.
  $ "Number of factors" = (3 + 1) times (2 + 1) = 4 times 3 = 12 $

  Step 3: Verify by listing (optional).
  The 12 factors are: 1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72 #sym.checkmark
]

#example-box[
  *How many positive factors does 360 have?*

  Step 1: Find the prime factorization.
  $ 360 = 8 times 45 = 8 times 9 times 5 = 2^3 times 3^2 times 5^1 $

  Step 2: Apply the formula.
  $ "Number of factors" = (3 + 1) times (2 + 1) times (1 + 1) = 4 times 3 times 2 = 24 $

  Therefore, 360 has *24 positive factors*.
]

#strategy-box[
  *To find the number of factors:*

  1. Find the prime factorization: $n = p_1^a times p_2^b times p_3^c times ...$
  2. Add 1 to each exponent
  3. Multiply: Number of factors $= (a+1)(b+1)(c+1)...$
]

== Perfect Squares and Perfect Cubes

=== Perfect Squares

A *perfect square* is an integer that can be expressed as the square of another integer: $n = k^2$ for some integer $k$. The first several perfect squares are: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, ...

Perfect squares have distinctive properties that make them easy to identify:

*Property 1: All prime factors appear an even number of times.*

When we square a number, every prime factor gets doubled. For example:
$ 36 = 6^2 = (2 times 3)^2 = 2^2 times 3^2 $

The exponents (2 and 2) are both even. This is true for every perfect square.

*Property 2: Perfect squares have an odd number of factors.*

Recall that the number of factors is $(a_1 + 1)(a_2 + 1)...$, where each $a_i$ is an exponent in the prime factorization. For a perfect square, every exponent is even. Adding 1 to each even number gives odd numbers, and the product of odd numbers is always odd.

*Why do perfect squares have an odd number of factors?* Because factors normally come in pairs that multiply to give $n$. For example, $36 = 1 times 36 = 2 times 18 = 3 times 12 = 4 times 9 = 6 times 6$. But when $n$ is a perfect square, one "pair" consists of the same number repeated (like $6 times 6$), which counts as only one factor rather than two.

#info-box[
  *Perfect Square Properties:*
  - Can be written as $k^2$ for some integer $k$
  - All prime factors have *even* exponents
  - Has an *odd* number of total factors
  - The square root is an integer
]

#example-box[
  *Is 1,764 a perfect square?*

  Find the prime factorization:
  $ 1764 = 4 times 441 = 4 times 9 times 49 = 2^2 times 3^2 times 7^2 $

  All exponents are even (2, 2, and 2), so *yes, 1,764 is a perfect square*.

  In fact, $1764 = (2 times 3 times 7)^2 = 42^2$.
]

=== Perfect Cubes

A *perfect cube* is an integer that can be expressed as the cube of another integer: $n = k^3$ for some integer $k$. The first several perfect cubes are: 1, 8, 27, 64, 125, 216, ...

*Key Property:* In the prime factorization of a perfect cube, all exponents are multiples of 3.

#example-box[
  *Is 216 a perfect cube?*

  $ 216 = 8 times 27 = 2^3 times 3^3 $

  Both exponents (3 and 3) are multiples of 3, so *yes, 216 is a perfect cube*.

  In fact, $216 = 6^3$.
]

== Units Digit Patterns

The units digit (last digit) of a number follows predictable patterns under multiplication and exponentiation. This is particularly useful for problems involving large powers.

=== Units Digits of Powers

When we raise a number to successive powers, the units digit cycles through a repeating pattern. The cycle length depends on the units digit of the base:

#align(center)[
  #uptoten-table(
    columns: 3,
    header: ("Units Digit of Base", "Cycle of Units Digits", "Cycle Length"),
    "0", "0, 0, 0, ...", "1",
    "1", "1, 1, 1, ...", "1",
    "2", "2, 4, 8, 6, 2, 4, 8, 6, ...", "4",
    "3", "3, 9, 7, 1, 3, 9, 7, 1, ...", "4",
    "4", "4, 6, 4, 6, ...", "2",
    "5", "5, 5, 5, ...", "1",
    "6", "6, 6, 6, ...", "1",
    "7", "7, 9, 3, 1, 7, 9, 3, 1, ...", "4",
    "8", "8, 4, 2, 6, 8, 4, 2, 6, ...", "4",
    "9", "9, 1, 9, 1, ...", "2",
  )
]

#tip-box[
  *Quick Reference:* The maximum cycle length is 4. Numbers ending in 0, 1, 5, or 6 always produce the same units digit when raised to any positive power.
]

#example-box[
  *What is the units digit of $3^{75}$?*

  The units digits of powers of 3 cycle: 3, 9, 7, 1, 3, 9, 7, 1, ... (period 4)

  Divide the exponent by 4: $75 div 4 = 18$ remainder $3$

  The remainder 3 means we're at the 3rd position in the cycle.

  The 3rd number in the cycle (3, 9, *7*, 1) is *7*.
]

== Sum and Product Patterns

Certain patterns involving sums and products appear frequently on the GMAT:

=== Sum of First $n$ Positive Integers

$ 1 + 2 + 3 + ... + n = (n(n+1))/2 $

#example-box[
  *What is $1 + 2 + 3 + ... + 50$?*

  $ (50 times 51)/2 = 2550/2 = 1275 $
]

=== Sum of First $n$ Perfect Squares

$ 1^2 + 2^2 + 3^2 + ... + n^2 = (n(n+1)(2n+1))/6 $

=== Product Divisibility

The product of $n$ consecutive positive integers starting from 1 (which equals $n!$) is divisible by all positive integers up to $n$.

#warning-box[
  *Common GMAT Trap:* When a problem asks "Is $n$ divisible by...?", remember to consider what you know about $n$'s factors. Use prime factorization to analyze divisibility questions systematically.
]

#strategy-box[
  *Pattern Recognition Strategy:*

  When facing a number properties problem on the GMAT:
  1. Identify what type of numbers are involved (consecutive, prime, perfect squares, etc.)
  2. Recall the key properties of those number types
  3. Look for patterns that simplify the calculation
  4. Use prime factorization when dealing with factors, multiples, or divisibility
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Integer definitions and number line (quick review)
2. Factors vs. multiples (common confusion point)
3. Divisibility rules (memorization essential)
4. Prime numbers and prime factorization

*Question Time:* 5-6 questions covering basic factor/multiple identification and divisibility

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Even/odd rules (very frequently tested)
2. GCF and LCM applications
3. Remainder problems
4. Common GMAT patterns

*Review errors from Training #1, focusing on:*
- Misapplication of divisibility rules
- Confusion between factors and multiples
- Even/odd rule mistakes

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick-fire even/odd questions
- Number of factors problems

*Assessment:* 20 questions, 40 minutes

== Common Student Difficulties

1. Forgetting that 0 is even and neither positive nor negative
2. Confusing factors and multiples
3. Forgetting that 1 is not prime
4. Misapplying even/odd rules to subtraction and division
5. Making arithmetic errors under time pressure

#warning-box[
  *Tutor Tip:* Have students verbalize their thinking. Many errors come from rushing through logic without checking.
]
