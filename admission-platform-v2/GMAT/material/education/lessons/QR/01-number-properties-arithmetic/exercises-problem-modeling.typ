#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Number Properties & Arithmetic",
  level: "Hard / Very Hard Problem Modeling",
  intro: "Challenging exercises focused on modeling complex number property problems. These problems require multi-step reasoning and creative mathematical thinking. Work through the questions first, then check the detailed solutions.",
  logo: "/Logo.png"
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Part I: Exercises

Work through each problem carefully. Focus on setting up the problem correctly before attempting to solve it. These problems are designed to challenge your problem-modeling skills at a high level.

#warning-box[
  *Difficulty Level:* Hard to Very Hard

  These problems require:
  - Multiple mathematical concepts working together
  - Careful algebraic modeling
  - Creative insight and pattern recognition
  - Systematic case analysis
]

#pagebreak()

== Section A: Advanced Divisibility and Prime Factorization

=== Exercise A1: The Divisor Product Identity

For a positive integer $n$, let $P(n)$ denote the product of all positive divisors of $n$.

*Questions:*
+ Prove that if $n$ has exactly $d$ divisors, then $P(n) = n^(d\/2)$.
+ Find the smallest positive integer $n$ such that $P(n) = n^6$.
+ If $P(n) = 2^(30) times 3^(15)$, find all possible values of $n$.
+ For which positive integers $n$ is $P(n)$ a perfect cube?

#v(4cm)

=== Exercise A2: Factorial Divisibility

*Questions:*
+ Find the largest power of 2 that divides $50!$.
+ Find the largest power of 12 that divides $100!$.
+ How many trailing zeros does $200!$ have?
+ Find the smallest positive integer $n$ such that $n!$ is divisible by $10^(24)$.

#v(4cm)

=== Exercise A3: The GCF-LCM Relationship

Two positive integers $a$ and $b$ satisfy:
- $"GCF"(a, b) = 12$
- $"LCM"(a, b) = 540$

*Questions:*
+ Using the fundamental GCF-LCM relationship, find the product $a times b$.
+ Express $a$ and $b$ in terms of their prime factorizations. What constraints must the exponents satisfy?
+ Find all pairs $(a, b)$ with $a <= b$ that satisfy these conditions.
+ If additionally $a + b = 168$, find the unique pair $(a, b)$.

#v(4cm)

#pagebreak()

=== Exercise A4: Counting Divisors with Constraints

*Questions:*
+ How many positive divisors of $10!$ are perfect squares?
+ How many positive divisors of $12!$ are divisible by 6 but not by 9?
+ Find the number of positive divisors of $2^(10) times 3^8 times 5^6$ that are divisible by 6 but not divisible by 4.
+ How many ordered pairs $(a, b)$ of positive integers satisfy $"LCM"(a, b) = 2^4 times 3^3 times 5^2$?

#v(4cm)

=== Exercise A5: The Factor Counting Formula

*Questions:*
+ Find the smallest positive integer with exactly 12 positive divisors.
+ Find all positive integers less than 100 that have exactly 12 divisors.
+ A positive integer $N = 2^a times 3^b times 5^c$ has exactly 24 divisors. If $N$ is also a perfect square, find the smallest such $N$.
+ Prove that a positive integer has an odd number of divisors if and only if it is a perfect square.

#v(4cm)

#pagebreak()

== Section B: Even/Odd Properties and Parity Analysis

=== Exercise B1: The Sum of Squares Formula

Let $S_n = 1^2 + 2^2 + 3^2 + ... + n^2 = (n(n+1)(2n+1))/6$.

*Questions:*
+ Prove algebraically that $S_n$ is always an integer by analyzing the factors in the numerator.
+ For which values of $n$ is $S_n$ divisible by 5? Characterize all such $n$.
+ Prove that $S_n$ is odd if and only if $n equiv 1$ or $2 space (mod 4)$.
+ Find the smallest $n > 1$ such that $S_n$ is a perfect square.

#v(4cm)

=== Exercise B2: Consecutive Integer Products

For three consecutive positive integers $n$, $n+1$, $n+2$, let $P = n(n+1)(n+2)$.

*Questions:*
+ Prove that $P$ is always divisible by 6 using properties of consecutive integers.
+ Prove that $P$ is always divisible by 3 using the fact that among any 3 consecutive integers, exactly one is divisible by 3.
+ Under what conditions on $n$ is $P$ divisible by 24? Express your answer in terms of congruence classes.
+ Find the smallest $n > 0$ such that $P$ is divisible by 120.

#v(4cm)

=== Exercise B3: Parity in Algebraic Expressions

*Questions:*
+ Prove that for any integer $n$, the expression $n^2 + n$ is always even.
+ Prove that the expression $n^3 - n$ is always divisible by 6 for any integer $n$.
+ For which integers $n$ is $n^4 + 4n^3 + 6n^2 + 4n$ divisible by 16?
+ Prove that if $a + b + c$ is divisible by 6, then $a^3 + b^3 + c^3$ is also divisible by 6.

#v(4cm)

#pagebreak()

== Section C: Advanced Remainder Problems

=== Exercise C1: Systematic Remainder Analysis

A positive integer $N$ satisfies:
- $N equiv 2 space (mod 3)$
- $N equiv 3 space (mod 5)$
- $N equiv 4 space (mod 7)$

*Questions:*
+ Model this system algebraically by expressing $N$ in terms of each modulus.
+ Use the Chinese Remainder Theorem approach: solve the first two congruences simultaneously, then incorporate the third.
+ Find the smallest positive $N$ satisfying all three conditions.
+ What is the general form of all solutions?

#v(4cm)

=== Exercise C2: Power Remainder Patterns

*Questions:*
+ Using Fermat's Little Theorem, find the remainder when $2^(100)$ is divided by 13.
+ Find the remainder when $7^(7^7)$ is divided by 10 by analyzing the periodicity of units digits.
+ Find the last two digits of $3^(2024)$ using Euler's theorem.
+ Find the remainder when $99^(99)$ is divided by 100.

#v(4cm)

=== Exercise C3: Units Digit Analysis

*Questions:*
+ Determine the period of the units digit sequence for powers of 7. Use this to find the units digit of $7^(2024)$.
+ Find the units digit of $3^(100) + 7^(100)$ by analyzing each term separately.
+ Find the units digit of $2^(100) times 3^(100)$ using properties of units digit multiplication.
+ For how many positive integers $n <= 100$ does $n^n$ have a units digit of 1? Justify systematically.

#v(4cm)

#pagebreak()

=== Exercise C4: Digit Sum Properties

For a positive integer $n$, let $S(n)$ denote the sum of its digits.

*Questions:*
+ Prove that $n equiv S(n) space (mod 9)$ using the decimal representation of $n$.
+ Find all two-digit numbers $n$ such that $n = 7 times S(n)$. Model this algebraically.
+ Prove that if $n$ is divisible by 9, then $S(n)$ is also divisible by 9.
+ If $n$ is a three-digit number and $n = 11 times S(n)$, find all possible values of $n$.

#v(4cm)

== Section D: GCF, LCM, and Divisibility Chains

=== Exercise D1: Prime Factorization and GCF/LCM

Let $a = 2^3 times 3^2 times 5$ and $b = 2^2 times 3^4 times 7$.

*Questions:*
+ Find $"GCF"(a, b)$ and $"LCM"(a, b)$ using the min/max rule for exponents.
+ Verify that $"GCF"(a, b) times "LCM"(a, b) = a times b$.
+ Find all positive integers $c$ such that $"GCF"(a, c) = 12$ and $"LCM"(a, c) = 360$.
+ How many positive integers $d$ satisfy both $d | a$ and $d | b$?

#v(4cm)

=== Exercise D2: Divisibility Chain Counting

A sequence of positive integers $d_1, d_2, ..., d_k$ is called a *divisibility chain* ending at $n$ if $d_1 | d_2 | d_3 | ... | d_k = n$.

*Questions:*
+ How many divisibility chains of length 2 end at 12?
+ How many divisibility chains of length 3 end at 24?
+ For $n = 2^a times 3^b$, derive a formula for the number of divisibility chains of length 2 ending at $n$.
+ Find the number of divisibility chains of length 3 ending at $n = 2^3 times 3^2$.

#v(4cm)

#pagebreak()

== Section E: Perfect Powers and Special Numbers

=== Exercise E1: Perfect Square Analysis

*Questions:*
+ Prove that a positive integer is a perfect square if and only if all exponents in its prime factorization are even.
+ Find the smallest perfect square that has exactly 15 positive divisors.
+ Find the smallest positive integer $n$ such that $2n$ is a perfect square and $3n$ is a perfect cube.
+ Prove that if $n^2$ is divisible by 12, then $n$ is divisible by 6.

#v(4cm)

=== Exercise E2: Perfect Sixth Powers

*Questions:*
+ Find all positive integers less than 1000 that are both perfect squares and perfect cubes.
+ Prove that a positive integer is both a perfect square and a perfect cube if and only if it is a perfect sixth power.
+ The number $2^a times 3^b$ is a perfect sixth power with exactly 49 divisors. Find $a$ and $b$.
+ Find the smallest positive integer that can be expressed as both $m^2 + 1$ and $k^3 - 1$ for positive integers $m$ and $k$.

#v(4cm)

=== Exercise E3: Sum of Divisors

For a positive integer $n$, let $sigma(n)$ denote the sum of all positive divisors of $n$.

*Questions:*
+ For a prime $p$, prove that $sigma(p^k) = 1 + p + p^2 + ... + p^k = (p^(k+1) - 1)/(p - 1)$.
+ Using the multiplicative property of $sigma$, calculate $sigma(72)$.
+ Verify that 28 is a perfect number (i.e., $sigma(28) = 2 times 28$).
+ Prove that $sigma(n)$ is odd if and only if $n$ is a perfect square or twice a perfect square.

#v(4cm)

#pagebreak()

== Section F: Olympiad-Style Synthesis Problems

=== Exercise F1: The Integer Equation

Find all pairs of positive integers $(x, y)$ such that $x^2 - y! = 2023$.

*Questions:*
+ Determine for which values of $y$ we have $y! < 2023$.
+ For each such $y$, check whether $y! + 2023$ is a perfect square.
+ Prove that for $y >= 8$, there are no solutions by considering $y! + 2023 space (mod 16)$.
+ List all solution pairs $(x, y)$.

#v(4cm)

=== Exercise F2: Largest Proper Divisor

For a positive integer $n > 1$, define $f(n)$ to be the largest proper divisor of $n$ (the largest divisor less than $n$).

*Questions:*
+ Express $f(n)$ in terms of the smallest prime factor of $n$. Prove your formula.
+ Compute $f(f(f(1000)))$ using your formula.
+ For which positive integers $n$ does the sequence $n, f(n), f(f(n)), ...$ reach 1 in exactly 10 steps?
+ Find the smallest $n > 1$ such that $n / f(n) = f(n) / f(f(n))$.

#v(4cm)

=== Exercise F3: The Locker Problem

A school has 100 lockers, all initially closed. Student $k$ (for $k = 1, 2, ..., 100$) toggles every $k$-th locker.

*Questions:*
+ After all students pass, locker $n$ is open if and only if it was toggled an odd number of times. Express the number of toggles in terms of divisor counting.
+ Prove that locker $n$ is open if and only if $n$ is a perfect square.
+ How many lockers are open after all 100 students pass?
+ Which locker number is toggled exactly 6 times?

#v(4cm)

#pagebreak()

= Part II: Detailed Solutions

The solutions below demonstrate proper mathematical modeling using concepts from number theory. Each solution emphasizes the underlying structure and reasoning rather than trial-and-error.

#pagebreak()

== Section A Solutions: Advanced Divisibility and Prime Factorization

=== Solution A1: The Divisor Product Identity

#strategy-box[
  *Key Concepts:* Divisor pairing, prime factorization, divisor counting formula.
]

*Part 1: Prove that $P(n) = n^(d\/2)$*

#example-box[
  *Mathematical Model:*

  Let the divisors of $n$ be $d_1, d_2, ..., d_k$ where $k = tau(n)$ is the total number of divisors.

  *Key Insight:* Divisors come in complementary pairs. For each divisor $d_i$, the number $n\/d_i$ is also a divisor, and $d_i times (n\/d_i) = n$.
]

Consider the product of all divisors:
$ P(n) = d_1 times d_2 times ... times d_k $

Now consider $P(n)^2$:
$ P(n)^2 = (d_1 times d_2 times ... times d_k)^2 $

We can rewrite this by pairing each $d_i$ with its complement $n\/d_i$:
$ P(n)^2 = product_(i=1)^k d_i times product_(i=1)^k d_i = product_(i=1)^k d_i times product_(i=1)^k (n\/d_i) = product_(i=1)^k (d_i times n\/d_i) = product_(i=1)^k n = n^k $

Therefore: $P(n)^2 = n^k$, which gives us $P(n) = n^(k\/2) = n^(d\/2)$.

#highlight-box[
  *Result:* $P(n) = n^(d\/2)$ where $d = tau(n)$ is the number of divisors of $n$. #sym.qed
]

*Part 2: Find smallest $n$ with $P(n) = n^6$*

From Part 1, we need $n^(d\/2) = n^6$, so $d\/2 = 6$, meaning $d = 12$. The problem therefore reduces to finding the smallest positive integer with exactly 12 divisors.

The divisor counting formula tells us that if $n = p_1^(a_1) times p_2^(a_2) times ... times p_r^(a_r)$, then $tau(n) = (a_1 + 1)(a_2 + 1)...(a_r + 1)$. We therefore need to find exponents such that the product of their increments equals 12.

To systematically find the smallest such integer, we consider all factorizations of 12 and determine the corresponding prime factorization forms. When 12 is expressed as a single factor, we get $n = p^(11)$, and the smallest such number using $p = 2$ gives $2^(11) = 2048$. If we write $12 = 6 times 2$, then $n = p^5 times q$ for distinct primes $p$ and $q$, yielding $2^5 times 3 = 96$ as the smallest candidate. The factorization $12 = 4 times 3$ corresponds to $n = p^3 times q^2$, giving $2^3 times 3^2 = 72$. Finally, $12 = 3 times 2 times 2$ gives us $n = p^2 times q times r$ for three distinct primes, producing $2^2 times 3 times 5 = 60$.

The key optimization principle here is that to minimize the value of $n$, we should assign larger exponents to smaller primes. This is because increasing the exponent of a smaller prime contributes less to the overall product than increasing the exponent of a larger prime.

Comparing all candidates, we find that $60 < 72 < 96 < 2048$, so the smallest integer with exactly 12 divisors is 60.

#highlight-box[
  *Answer:* $n = 60 = 2^2 times 3 times 5$.
]

*Part 3: Find $n$ if $P(n) = 2^(30) times 3^(15)$*

Since $P(n)$ contains only primes 2 and 3, we know $n = 2^a times 3^b$ for some non-negative integers $a, b$.

From $P(n) = n^(d\/2)$:
$ 2^(30) times 3^(15) = (2^a times 3^b)^(d\/2) = 2^(a d\/2) times 3^(b d\/2) $

Equating exponents:
- $a d\/2 = 30$ → $a d = 60$
- $b d\/2 = 15$ → $b d = 30$

From these: $a\/b = 60\/30 = 2$, so $a = 2b$.

The number of divisors is $d = (a+1)(b+1) = (2b+1)(b+1)$.

Substituting into $b d = 30$:
$ b(2b+1)(b+1) = 30 $

To solve the equation $b(2b+1)(b+1) = 30$ systematically, we recognize that since $b$ is a positive integer, we can factor 30 and look for compatible values. The left side grows rapidly with $b$, so we start with small values. For $b = 1$, we obtain $1 times 3 times 2 = 6$, which is too small. For $b = 2$, we get $2 times 5 times 3 = 30$, which matches exactly.

Having found $b = 2$, we can now determine the complete solution. Since $a = 2b$, we have $a = 4$. The number of divisors is $d = (a+1)(b+1) = 5 times 3 = 15$.

To verify this solution, we compute $n = 2^4 times 3^2 = 144$. The number of divisors is indeed $tau(144) = (4+1)(2+1) = 15$. Finally, $P(144) = 144^(15\/2) = (2^4 times 3^2)^(7.5) = 2^(30) times 3^(15)$, which confirms our answer.

#highlight-box[
  *Answer:* $n = 144 = 2^4 times 3^2$.
]

*Part 4: When is $P(n)$ a perfect cube?*

We begin by recalling that $P(n) = n^(d\/2)$ is a perfect cube when $n^(d\/2)$ can be written as $k^3$ for some integer $k$. To analyze this condition, let us write $n = p_1^(a_1) times ... times p_r^(a_r)$ in its prime factorization form. Then we have:
$ P(n) = p_1^(a_1 d\/2) times ... times p_r^(a_r d\/2) $

For $P(n)$ to be a perfect cube, each exponent $a_i d\/2$ must be divisible by 3. This condition can be satisfied in two fundamentally different ways.

In the first case, suppose the number of divisors satisfies $d equiv 0 space (mod 6)$. Then $d\/2 equiv 0 space (mod 3)$, which means that for every prime factor $p_i$, the exponent $a_i d\/2$ is automatically divisible by 3, regardless of the value of $a_i$. This is because any multiple of 3 times any integer remains a multiple of 3.

In the second case, suppose $n$ itself is a perfect cube, meaning all exponents $a_i equiv 0 space (mod 3)$. In this situation, $a_i d\/2 equiv 0 space (mod 3)$ regardless of the value of $d$, since any multiple of 3 times any rational number with integer result will be a multiple of 3.

These two cases are not mutually exclusive, but together they capture all possibilities for $P(n)$ being a perfect cube.

#highlight-box[
  *Answer:* $P(n)$ is a perfect cube if and only if $tau(n) equiv 0 space (mod 6)$, or $n$ is a perfect cube (or both).
]

#pagebreak()

=== Solution A2: Factorial Divisibility

#strategy-box[
  *Key Concept:* Legendre's Formula — The exponent of prime $p$ in $n!$ is:
  $ v_p(n!) = sum_(i=1)^(infinity) floor(n/p^i) = floor(n/p) + floor(n/p^2) + floor(n/p^3) + ... $
]

*Part 1: Largest power of 2 dividing $50!$*

Apply Legendre's formula with $p = 2$:
$ v_2(50!) = floor(50/2) + floor(50/4) + floor(50/8) + floor(50/16) + floor(50/32) $
$ = 25 + 12 + 6 + 3 + 1 = 47 $

#highlight-box[
  *Answer:* $2^(47)$ is the largest power of 2 dividing $50!$.
]

*Part 2: Largest power of 12 dividing $100!$*

Since $12 = 2^2 times 3$, we need both $2^2$ and $3$ as factors.

The largest power of 12 is $min(floor(v_2(100!)\/2), v_3(100!))$.

$v_2(100!) = 50 + 25 + 12 + 6 + 3 + 1 = 97$

$v_3(100!) = 33 + 11 + 3 + 1 = 48$

Power of $2^2$ available: $floor(97\/2) = 48$

Power of 12: $min(48, 48) = 48$

#highlight-box[
  *Answer:* $12^(48)$ is the largest power of 12 dividing $100!$.
]

*Part 3: Trailing zeros in $200!$*

Trailing zeros come from factors of 10 = $2 times 5$.

Since factors of 2 are more abundant than factors of 5 in any factorial, the number of trailing zeros equals $v_5(200!)$.

$ v_5(200!) = floor(200/5) + floor(200/25) + floor(200/125) + floor(200/625) $
$ = 40 + 8 + 1 + 0 = 49 $

#highlight-box[
  *Answer:* $200!$ has *49 trailing zeros*.
]

*Part 4: Smallest $n$ with $10^(24) | n!$*

Since $10 = 2 times 5$ and factors of 2 are always more abundant than factors of 5 in any factorial, we need $v_5(n!) >= 24$. The power of 5 is the limiting factor that determines divisibility by $10^(24)$.

Using Legendre's formula, we have $v_5(n!) = floor(n/5) + floor(n/25) + floor(n/125) + ...$, and we seek the smallest $n$ for which this sum reaches at least 24.

Rather than testing values randomly, we can estimate that the sum is approximately $n/5 + n/25 + n/125 + ... = n/4$ (using the geometric series formula). This suggests $n approx 96$, so we examine values near this estimate.

For $n = 100$, we compute $v_5(100!) = floor(100/5) + floor(100/25) + floor(100/125) = 20 + 4 + 0 = 24$, which exactly meets our requirement.

To confirm this is the smallest such $n$, we check the previous candidate. For $n = 99$, we get $v_5(99!) = floor(99/5) + floor(99/25) + floor(99/125) = 19 + 3 + 0 = 22 < 24$, which falls short.

The jump from 22 to 24 when going from $n = 99$ to $n = 100$ occurs because 100 contributes two factors of 5 (since $100 = 4 times 25 = 4 times 5^2$). This is precisely what brings us to the threshold of 24 factors of 5.

#highlight-box[
  *Answer:* $n = 100$.
]

#pagebreak()

=== Solution A3: The GCF-LCM Relationship

#strategy-box[
  *Key Concepts:*
  - $"GCF"(a,b) times "LCM"(a,b) = a times b$
  - For $"GCF"(a,b) = g$, we can write $a = g times m$ and $b = g times n$ where $"GCF"(m,n) = 1$
  - Then $"LCM"(a,b) = g times m times n$
]

*Given:* $"GCF"(a,b) = 12$, $"LCM"(a,b) = 540$

*Part 1: Find $a times b$*

Using the fundamental identity:
$ a times b = "GCF"(a,b) times "LCM"(a,b) = 12 times 540 = 6480 $

#highlight-box[
  *Answer:* $a times b = 6480$.
]

*Part 2: Prime factorization constraints*

$12 = 2^2 times 3$ and $540 = 2^2 times 3^3 times 5$

Since $"GCF" = 12 = 2^2 times 3$, both $a$ and $b$ must contain at least $2^2 times 3$.

Since $"LCM" = 540 = 2^2 times 3^3 times 5$:
- The maximum power of 2 in either $a$ or $b$ is 2
- The maximum power of 3 in either $a$ or $b$ is 3
- The maximum power of 5 in either $a$ or $b$ is 1

*Structure:* Let $a = 2^2 times 3^(alpha) times 5^(beta)$ and $b = 2^2 times 3^(gamma) times 5^(delta)$

From GCF: $min(alpha, gamma) = 1$ and $min(beta, delta) = 0$

From LCM: $max(alpha, gamma) = 3$ and $max(beta, delta) = 1$

#highlight-box[
  *Constraints:*
  - For powers of 3: one of ${alpha, gamma}$ is 1 and the other is 3
  - For powers of 5: one of ${beta, delta}$ is 0 and the other is 1
]

*Part 3: Find all pairs $(a,b)$ with $a <= b$*

From the constraints, we have four combinations:

#uptoten-table(
  columns: 6,
  header: ($alpha$, $gamma$, $beta$, $delta$, $a$, $b$),
  [1], [3], [0], [1], [$2^2 times 3^1 = 12$], [$2^2 times 3^3 times 5 = 540$],
  [1], [3], [1], [0], [$2^2 times 3^1 times 5 = 60$], [$2^2 times 3^3 = 108$],
  [3], [1], [0], [1], [$2^2 times 3^3 = 108$], [$2^2 times 3^1 times 5 = 60$],
  [3], [1], [1], [0], [$2^2 times 3^3 times 5 = 540$], [$2^2 times 3^1 = 12$],
)

Applying $a <= b$: $(12, 540)$ and $(60, 108)$

#highlight-box[
  *Answer:* $(a,b) in {(12, 540), (60, 108)}$.
]

*Part 4: Find pair with $a + b = 168$*

Check: $12 + 540 = 552 != 168$

Check: $60 + 108 = 168$

#highlight-box[
  *Answer:* $(a, b) = (60, 108)$ gives $a + b = 168$.
]

#pagebreak()

=== Solution A4: Counting Divisors with Constraints

#strategy-box[
  *Key Concept:* To count divisors with constraints, think of choosing exponents for each prime factor independently, then multiply the number of valid choices. This uses the fundamental counting principle: when making independent choices, the total number of combinations equals the product of the number of choices at each step.
]

*Part 1: Perfect square divisors of $10!$*

We first find the prime factorization of $10!$ using Legendre's formula, which gives us $10! = 2^8 times 3^4 times 5^2 times 7^1$.

A divisor of $10!$ has the form $d = 2^a times 3^b times 5^c times 7^e$ where $0 <= a <= 8$, $0 <= b <= 4$, $0 <= c <= 2$, and $0 <= e <= 1$. For $d$ to be a perfect square, each exponent must be even.

We now count the valid choices for each prime factor independently. For the prime 2, the even exponents in the range $[0, 8]$ are $a in {0, 2, 4, 6, 8}$, giving us 5 choices. For the prime 3, the even exponents in $[0, 4]$ are $b in {0, 2, 4}$, giving 3 choices. For the prime 5, the even exponents in $[0, 2]$ are $c in {0, 2}$, giving 2 choices. For the prime 7, since the maximum exponent is 1, the only even value is $e = 0$, giving just 1 choice.

By the multiplication principle, the total number of perfect square divisors is $5 times 3 times 2 times 1 = 30$.

#highlight-box[
  *Answer:* *30* perfect square divisors.
]

*Part 2: Divisors of $12!$ divisible by 6 but not by 9*

The prime factorization of $12!$ is $12! = 2^(10) times 3^5 times 5^2 times 7^1 times 11^1$ (computed via Legendre's formula).

We need divisors that satisfy two constraints simultaneously. First, divisibility by $6 = 2 times 3$ requires the divisor to contain at least one factor of 2 and at least one factor of 3, meaning $a >= 1$ and $b >= 1$. Second, non-divisibility by $9 = 3^2$ requires the divisor to contain fewer than two factors of 3, meaning $b <= 1$. Combining these constraints on the exponent of 3, we conclude that $b = 1$ exactly.

With these constraints established, we count valid choices for each prime. For the prime 2, we need $a >= 1$ with $a <= 10$, giving 10 valid values. For the prime 3, we are forced to have $b = 1$, giving exactly 1 choice. For the remaining primes 5, 7, and 11, there are no constraints beyond the bounds from $12!$, so we have $c in {0, 1, 2}$ (3 choices), $d in {0, 1}$ (2 choices), and $e in {0, 1}$ (2 choices).

By the multiplication principle, the total count is $10 times 1 times 3 times 2 times 2 = 120$.

#highlight-box[
  *Answer:* *120* divisors.
]

*Part 3: Divisors of $2^(10) times 3^8 times 5^6$ divisible by 6 but not by 4*

We apply the same reasoning framework as in Part 2. For divisibility by $6 = 2 times 3$, we require $a >= 1$ and $b >= 1$. For non-divisibility by $4 = 2^2$, we need $a <= 1$. These two constraints on the exponent of 2 combine to give us exactly $a = 1$.

For the exponent of 3, we only have the lower bound $b >= 1$ from the divisibility by 6 requirement, so $b$ can range from 1 to 8, giving 8 choices. For the exponent of 5, there are no constraints from divisibility by 6 or 4, so $c$ can be any value from 0 to 6, giving 7 choices.

The total count is therefore $1 times 8 times 7 = 56$.

#highlight-box[
  *Answer:* *56* divisors.
]

*Part 4: Ordered pairs with $"LCM"(a,b) = 2^4 times 3^3 times 5^2$*

For each prime $p$ with exponent $e$ in the LCM, we need $max(a_p, b_p) = e$.

The number of ordered pairs $(a_p, b_p)$ with $0 <= a_p, b_p <= e$ and $max(a_p, b_p) = e$ is:

Total pairs with max $<= e$: $(e+1)^2$
Minus pairs with max $< e$: $e^2$
Result: $(e+1)^2 - e^2 = 2e + 1$

For $2^4$: $2(4) + 1 = 9$ pairs
For $3^3$: $2(3) + 1 = 7$ pairs
For $5^2$: $2(2) + 1 = 5$ pairs

Total: $9 times 7 times 5 = 315$

#highlight-box[
  *Answer:* *315* ordered pairs.
]

#pagebreak()

=== Solution A5: The Factor Counting Formula

#strategy-box[
  *Key Concept:* If $n = p_1^(a_1) times ... times p_k^(a_k)$, then $tau(n) = (a_1+1)(a_2+1)...(a_k+1)$.

  To minimize $n$ for a given $tau(n)$, assign larger exponents to smaller primes.
]

*Part 1: Smallest integer with exactly 12 divisors*

To find the smallest integer with exactly 12 divisors, we use the divisor counting formula and work backwards. We need to factor 12 into products of positive integers, where each factor $(a_i + 1)$ determines an exponent $a_i$ in the prime factorization.

The possible factorizations of 12, along with their corresponding prime factorization forms, are as follows. Writing $12 = 12$ gives $n = p^(11)$ for a single prime. Writing $12 = 6 times 2$ gives $n = p^5 times q$ for two distinct primes. Writing $12 = 4 times 3$ gives $n = p^3 times q^2$. Finally, writing $12 = 3 times 2 times 2$ gives $n = p^2 times q times r$ for three distinct primes.

To minimize $n$ within each form, we apply the optimization principle: assign larger exponents to smaller primes. This is because $2^k$ grows more slowly than $3^k$, which grows more slowly than $5^k$, and so on. Applying this principle, the smallest number of each form is $2^(11) = 2048$, then $2^5 times 3 = 96$, then $2^3 times 3^2 = 72$, and finally $2^2 times 3 times 5 = 60$.

#highlight-box[
  *Answer:* The smallest is $n = 60 = 2^2 times 3 times 5$.
]

*Part 2: All integers less than 100 with exactly 12 divisors*

Building on Part 1, we systematically enumerate all integers less than 100 with exactly 12 divisors by considering each valid prime factorization form.

For the form $p^2 times q times r$, using the three smallest primes gives $2^2 times 3 times 5 = 60$. We can also use larger primes: $2^2 times 3 times 7 = 84$ is still under 100, but $2^2 times 3 times 11 = 132$ exceeds our bound.

For the form $p^3 times q^2$, we have $2^3 times 3^2 = 72$. The alternative arrangement $2^2 times 3^3 = 108$ exceeds 100.

For the form $p^5 times q$, we get $2^5 times 3 = 96$. Note that $2^5 times 5 = 160$ exceeds 100.

For the form $p^(11)$, even the smallest prime gives $2^(11) = 2048$, which is far too large.

Collecting all valid candidates, we have ${60, 72, 84, 96}$.

#highlight-box[
  *Answer:* ${60, 72, 84, 96}$.
]

*Part 3: Smallest $N = 2^a times 3^b times 5^c$ with 24 divisors and perfect square*

For $N$ to be a perfect square, all exponents $a, b, c$ must be even. For $tau(N) = 24$, we need $(a+1)(b+1)(c+1) = 24$.

Let us substitute $a = 2alpha$, $b = 2beta$, $c = 2gamma$ where $alpha, beta, gamma$ are non-negative integers. Then we require $(2alpha + 1)(2beta + 1)(2gamma + 1) = 24$.

Here we encounter a fundamental obstruction: each factor of the form $(2k + 1)$ is odd, so their product is also odd. However, $24 = 2^3 times 3$ is even. This is a contradiction, meaning the equation has no solution when all three primes are present with positive exponents.

We might hope to resolve this by allowing some exponents to be zero (effectively removing that prime from the factorization). If $c = 0$, then we need $(a+1)(b+1) = 24$ with $a, b$ both even. The divisor pairs of 24 are $(1,24), (2,12), (3,8), (4,6)$. For $a$ to be even, we need $a + 1$ to be odd, meaning $a + 1 in {1, 3}$. Similarly for $b$. But the factorizations of 24 never give us two odd factors whose product is 24 (since $1 times 3 = 3 != 24$, $3 times 3 = 9 != 24$, etc.).

In fact, for any factorization of 24 into two or three positive integer factors, at least one factor must be even, which means the corresponding exponent would be odd, contradicting the perfect square requirement.

#highlight-box[
  *Answer:* No such $N$ exists. A perfect square with prime factorization involving only 2, 3, and 5 cannot have exactly 24 divisors, because 24 has no factorization into a product of exclusively odd integers greater than 1.
]

*Part 4: Prove odd divisor count iff perfect square*

We prove both directions of the equivalence using the divisor counting formula $tau(n) = (a_1+1)(a_2+1)...(a_k+1)$.

A product of integers is odd if and only if every factor is odd. This is because any even factor introduces at least one factor of 2 into the product. Therefore, $tau(n)$ is odd if and only if every factor $(a_i + 1)$ is odd.

Now, $(a_i + 1)$ is odd if and only if $a_i$ is even. This is simply because adding 1 to an even number gives an odd number, and adding 1 to an odd number gives an even number.

Finally, $n$ is a perfect square if and only if every exponent $a_i$ in its prime factorization is even. This is because $n = m^2$ implies $n = (p_1^(b_1) ... p_k^(b_k))^2 = p_1^(2b_1) ... p_k^(2b_k)$, so all exponents are even. Conversely, if all $a_i$ are even, we can write $a_i = 2b_i$ and factor $n = (p_1^(b_1) ... p_k^(b_k))^2$.

Combining these equivalences: $tau(n)$ is odd if and only if all $(a_i + 1)$ are odd, if and only if all $a_i$ are even, if and only if $n$ is a perfect square.

#highlight-box[
  *Answer:* A positive integer has an odd number of divisors if and only if it is a perfect square. #sym.qed
]

#pagebreak()

== Section B Solutions: Even/Odd Properties and Parity Analysis

=== Solution B1: The Sum of Squares Formula

#strategy-box[
  *Key Formula:* $S_n = (n(n+1)(2n+1))/6$

  *Analysis Strategy:* Examine the factors $n$, $n+1$, $2n+1$ modulo various numbers.
]

*Part 1: Prove $S_n$ is always an integer*

We must show that $6 | n(n+1)(2n+1)$.

*Divisibility by 2:* Among $n$ and $n+1$, exactly one is even, so $2 | n(n+1)$.

*Divisibility by 3:* We analyze cases mod 3:
- If $n equiv 0 space (mod 3)$: $3 | n$ #sym.checkmark
- If $n equiv 1 space (mod 3)$: $2n + 1 equiv 3 equiv 0 space (mod 3)$ #sym.checkmark
- If $n equiv 2 space (mod 3)$: $n + 1 equiv 0 space (mod 3)$ #sym.checkmark

So $3 | n(n+1)(2n+1)$ always.

Since $gcd(2, 3) = 1$ and both divide the product, $6 | n(n+1)(2n+1)$.

#highlight-box[
  *Result:* $S_n$ is always an integer. #sym.qed
]

*Part 2: When is $S_n$ divisible by 5?*

We need $S_n equiv 0 space (mod 5)$, which occurs if and only if $5 | n(n+1)(2n+1)$. Since 5 is prime, this happens precisely when at least one of the three factors is divisible by 5.

To determine when this occurs, we analyze each residue class of $n$ modulo 5 systematically. When $n equiv 0 space (mod 5)$, the factor $n$ itself is divisible by 5, so $S_n equiv 0 space (mod 5)$.

When $n equiv 1 space (mod 5)$, we compute the product modulo 5: $n(n+1)(2n+1) equiv 1 times 2 times 3 = 6 equiv 1 space (mod 5)$. Since none of the factors is divisible by 5, $S_n$ is not divisible by 5 in this case.

When $n equiv 2 space (mod 5)$, we observe that $2n + 1 equiv 5 equiv 0 space (mod 5)$, so the third factor provides divisibility by 5, and $S_n equiv 0 space (mod 5)$.

When $n equiv 3 space (mod 5)$, we compute $n(n+1)(2n+1) equiv 3 times 4 times 7 equiv 3 times 4 times 2 = 24 equiv 4 space (mod 5)$. Again, no factor is divisible by 5.

When $n equiv 4 space (mod 5)$, we have $n + 1 equiv 0 space (mod 5)$, so the second factor provides divisibility by 5.

#highlight-box[
  *Answer:* $S_n$ is divisible by 5 iff $n equiv 0, 2,$ or $4 space (mod 5)$.
]

*Part 3: When is $S_n$ odd?*

We need to determine when $S_n = n(n+1)(2n+1)/6$ is odd. The key observation is that $2n+1$ is always odd (since it's one more than an even number), so the parity of $S_n$ depends on how many factors of 2 appear in $n(n+1)$ compared to the factor of 2 in the denominator 6.

We analyze each residue class of $n$ modulo 4 to track the power of 2 precisely.

When $n equiv 0 space (mod 4)$, we write $n = 4k$. Then $n(n+1) = 4k(4k+1)$, which contributes exactly two factors of 2 (from $4k$). After dividing by the 2 in 6, we have one factor of 2 remaining in the numerator, making $S_n$ even.

When $n equiv 1 space (mod 4)$, we have $n = 4k+1$ and $n+1 = 4k+2 = 2(2k+1)$. The product $n(n+1) = (4k+1) times 2(2k+1)$ contributes exactly one factor of 2. After dividing by 6, the quotient is odd, so $S_n$ is odd.

When $n equiv 2 space (mod 4)$, we have $n = 4k+2 = 2(2k+1)$ and $n+1 = 4k+3$. The product $n(n+1) = 2(2k+1)(4k+3)$ contributes exactly one factor of 2. Similar analysis shows $S_n$ is odd.

When $n equiv 3 space (mod 4)$, we have $n = 4k+3$ and $n+1 = 4k+4 = 4(k+1)$. The product $n(n+1) = (4k+3) times 4(k+1)$ contributes at least two factors of 2, leaving $S_n$ even.

#highlight-box[
  *Answer:* $S_n$ is odd iff $n equiv 1$ or $2 space (mod 4)$.
]

*Part 4: Smallest $n > 1$ with $S_n$ a perfect square*

We seek the smallest $n > 1$ such that $S_n = (n(n+1)(2n+1))/6$ is a perfect square. This is a classic problem in number theory known as the "cannonball problem" or "square pyramidal number problem."

Rather than testing values at random, we can use properties of the formula to guide our search. The expression $n(n+1)(2n+1)/6$ is a perfect square when the prime factorization of the numerator (after cancellation with 6) has all even exponents.

For small values, we can verify: $S_1 = 1 = 1^2$ is a perfect square, but we need $n > 1$. The sequence continues with $S_2 = 5$, $S_3 = 14$, $S_4 = 30$, and so on, none of which are perfect squares.

The next solution occurs at $n = 24$. To verify: $S_(24) = (24 times 25 times 49)/6$. We can simplify by observing that $24/6 = 4$, so $S_(24) = 4 times 25 times 49 = 4 times 1225 = 4900$. Since $4900 = 70^2$ (because $70 = 2 times 5 times 7$ and $70^2 = 4 times 25 times 49$), this confirms our answer.

It is a remarkable fact (proven by G.N. Watson in 1918) that $n = 1$ and $n = 24$ are the only positive integers for which $S_n$ is a perfect square.

#highlight-box[
  *Answer:* $n = 24$, giving $S_(24) = 4900 = 70^2$.
]

#pagebreak()

=== Solution B2: Consecutive Integer Products

#strategy-box[
  *Key Properties of Consecutive Integers:*
  - Among any 2 consecutive integers, exactly one is even
  - Among any 3 consecutive integers, exactly one is divisible by 3
  - Among any $k$ consecutive integers, at least one is divisible by $k$
]

*Part 1: Prove $P = n(n+1)(n+2)$ is divisible by 6*

*Divisibility by 2:* Among $n$ and $n+1$, one is even. So $2 | P$.

*Divisibility by 3:* Among any three consecutive integers $n, n+1, n+2$, the remainders mod 3 are three distinct values from ${0, 1, 2}$. Therefore exactly one is divisible by 3.

Since $gcd(2,3) = 1$, we have $6 | P$.

#highlight-box[
  *Result:* $n(n+1)(n+2)$ is always divisible by 6. #sym.qed
]

*Part 2: Direct proof of divisibility by 3*

Among any three consecutive integers, we cycle through all residue classes mod 3. Specifically:
- If $n equiv 0 space (mod 3)$: $3 | n$
- If $n equiv 1 space (mod 3)$: $n + 2 equiv 0 space (mod 3)$
- If $n equiv 2 space (mod 3)$: $n + 1 equiv 0 space (mod 3)$

In every case, exactly one of the three factors is divisible by 3.

#highlight-box[
  *Result:* $3 | n(n+1)(n+2)$ for all integers $n$. #sym.qed
]

*Part 3: When is $P$ divisible by 24?*

Since $24 = 8 times 3 = 2^3 times 3$, and we have already established that $3 | P$ always holds, the question reduces to determining when $8 | P$.

We analyze this by considering the parity of $n$. When $n$ is even, both $n$ and $n+2$ are even, while $n+1$ is odd. Among any two consecutive even numbers, one is divisible by 4 and the other is only divisible by 2 (not 4). This is because consecutive even numbers are $2k$ and $2k+2 = 2(k+1)$, and exactly one of $k$ and $k+1$ is even. Therefore, the product of the two even terms contributes at least $4 times 2 = 8$ to the factorization, ensuring $8 | P$.

When $n$ is odd, only $n+1$ is even among our three consecutive integers. For $8 | P$, we need $8 | (n+1)$. Since $n$ is odd, we can write $n = 2m + 1$, and $n + 1 = 2m + 2 = 2(m + 1)$. For $8 | (n+1)$, we need $4 | (m+1)$. Writing $n = 8q + r$ where $r in {1, 3, 5, 7}$, we find that $n + 1 equiv 0 space (mod 8)$ only when $r = 7$, i.e., $n equiv 7 space (mod 8)$.

#highlight-box[
  *Answer:* $P$ is divisible by 24 iff $n$ is even OR $n equiv 7 space (mod 8)$.
]

*Part 4: Smallest $n > 0$ with $P$ divisible by 120*

Since $120 = 8 times 15 = 2^3 times 3 times 5$, we need $P$ to be divisible by 8, by 3, and by 5. We already know from Part 1 that $3 | P$ always, so we need to ensure divisibility by 8 and by 5.

From Part 3, divisibility by 8 occurs when $n$ is even, or when $n equiv 7 space (mod 8)$.

For divisibility by 5, we apply the same reasoning as for divisibility by 3: among any three consecutive integers, at least one must be divisible by 5 if and only if one of $n$, $n+1$, or $n+2$ is a multiple of 5. This happens when $n equiv 0, 3, 4 space (mod 5)$ (corresponding to the cases where $n$, $n+2$, or $n+1$ is divisible by 5, respectively).

To find the smallest $n > 0$ satisfying both conditions, we examine small candidates systematically. For $n = 2$, the product is $P = 2 times 3 times 4 = 24$, which satisfies $8 | P$ (since $n$ is even) but not $5 | P$. For $n = 3$, we get $P = 3 times 4 times 5 = 60$, which is divisible by 5 but we need to check divisibility by 8: since 3 is odd and $3 equiv.not 7 space (mod 8)$, we have $8 divides.not P$. Indeed, $60 = 4 times 15$, confirming only one factor of 4.

For $n = 4$, the product is $P = 4 times 5 times 6 = 120$. Here $n = 4$ is even (so $8 | P$), and $5 | P$ since $n + 1 = 5$. We verify: $120 = 2^3 times 3 times 5$, confirming divisibility by 120.

#highlight-box[
  *Answer:* $n = 4$.
]

#pagebreak()

=== Solution B3: Parity in Algebraic Expressions

#strategy-box[
  *Key Technique:* Factor expressions to reveal divisibility structure, then analyze cases based on parity.
]

*Part 1: Prove $n^2 + n$ is always even*

Factor: $n^2 + n = n(n+1)$

Among any two consecutive integers $n$ and $n+1$, exactly one is even.

Therefore $n(n+1)$ is always even.

#highlight-box[
  *Result:* $n^2 + n = n(n+1)$ is always even. #sym.qed
]

*Part 2: Prove $n^3 - n$ is divisible by 6*

Factor: $n^3 - n = n(n^2 - 1) = n(n-1)(n+1) = (n-1)n(n+1)$

This is the product of three consecutive integers!

From Exercise B2, we know three consecutive integers always have product divisible by 6.

#highlight-box[
  *Result:* $n^3 - n = (n-1)n(n+1)$ is always divisible by 6. #sym.qed
]

*Part 3: When is $n^4 + 4n^3 + 6n^2 + 4n$ divisible by 16?*

The key to this problem is recognizing the algebraic structure of the expression. Observing that $(n+1)^4 = n^4 + 4n^3 + 6n^2 + 4n + 1$ (by the binomial theorem), we see that our expression equals $(n+1)^4 - 1$.

We can factor this difference of squares and then further factor using the sum/difference pattern:
$(n+1)^4 - 1 = ((n+1)^2 - 1)((n+1)^2 + 1) = (n+1-1)(n+1+1)((n+1)^2 + 1) = n(n+2)((n+1)^2 + 1)$

Now we analyze divisibility by 16 based on the parity of $n$.

When $n$ is even, write $n = 2k$. The first two factors become $n(n+2) = 2k(2k+2) = 2k times 2(k+1) = 4k(k+1)$. Since $k$ and $k+1$ are consecutive integers, exactly one of them is even, so $k(k+1) = 2m$ for some integer $m$. Therefore $n(n+2) = 8m$.

For the third factor, $(n+1)^2 + 1 = (2k+1)^2 + 1 = 4k^2 + 4k + 1 + 1 = 4k^2 + 4k + 2 = 2(2k^2 + 2k + 1)$. The quantity in parentheses is odd (since $2k^2 + 2k$ is even and adding 1 makes it odd), so this factor contributes exactly one factor of 2.

Combining: $n(n+2) times ((n+1)^2 + 1) = 8m times 2 times (text("odd")) = 16 times (text("integer"))$, confirming $16 | (n^4 + 4n^3 + 6n^2 + 4n)$.

When $n$ is odd, write $n = 2k+1$. Then $n(n+2) = (2k+1)(2k+3)$ is the product of two odd numbers, hence odd. Also, $(n+1)^2 + 1 = (2k+2)^2 + 1 = 4(k+1)^2 + 1$ is one more than a multiple of 4, hence odd.

The entire expression is therefore odd when $n$ is odd, so it cannot be divisible by 16 (or even by 2).

#highlight-box[
  *Answer:* The expression is divisible by 16 iff $n$ is even.
]

*Part 4: If $a + b + c equiv 0 space (mod 6)$, prove $a^3 + b^3 + c^3 equiv 0 space (mod 6)$*

Use the identity: For any integer $x$, $x^3 equiv x space (mod 6)$.

*Proof of identity:* $x^3 - x = x(x-1)(x+1)$, which is divisible by 6 (three consecutive integers).

Therefore: $a^3 + b^3 + c^3 equiv a + b + c equiv 0 space (mod 6)$.

#highlight-box[
  *Result:* If $6 | (a + b + c)$, then $6 | (a^3 + b^3 + c^3)$. #sym.qed
]

#pagebreak()

== Section C Solutions: Advanced Remainder Problems

=== Solution C1: Systematic Remainder Analysis

#strategy-box[
  *Key Concept:* Chinese Remainder Theorem — If $gcd(m, n) = 1$, then the system $x equiv a space (mod m)$, $x equiv b space (mod n)$ has a unique solution mod $m n$.

  *Method:* Solve congruences pairwise, then combine.
]

*Given:* $N equiv 2 space (mod 3)$, $N equiv 3 space (mod 5)$, $N equiv 4 space (mod 7)$

*Part 1: Algebraic model*

$ N = 3k + 2 "for some integer" k $
$ N = 5m + 3 "for some integer" m $
$ N = 7j + 4 "for some integer" j $

*Part 2: Solve using CRT approach*

*Step 1:* Combine first two congruences.

From $N = 3k + 2$ and $N equiv 3 space (mod 5)$:
$3k + 2 equiv 3 space (mod 5)$
$3k equiv 1 space (mod 5)$

To solve, find $3^(-1) space (mod 5)$. Since $3 times 2 = 6 equiv 1 space (mod 5)$, we have $3^(-1) equiv 2$.
$k equiv 2 space (mod 5)$, so $k = 5t + 2$.

Substituting: $N = 3(5t + 2) + 2 = 15t + 8$.

So $N equiv 8 space (mod 15)$.

*Step 2:* Incorporate the third congruence.

From $N = 15t + 8$ and $N equiv 4 space (mod 7)$:
$15t + 8 equiv 4 space (mod 7)$
$15t equiv -4 space (mod 7)$
$t equiv -4 space (mod 7)$ (since $15 equiv 1 space (mod 7)$)
$t equiv 3 space (mod 7)$

So $t = 7s + 3$, and $N = 15(7s + 3) + 8 = 105s + 53$.

*Part 3: Smallest positive $N$*

#highlight-box[
  *Answer:* $N = 53$.
]

*Part 4: General form*

#highlight-box[
  *Answer:* $N equiv 53 space (mod 105)$, i.e., $N = 105k + 53$ for non-negative integers $k$.
]

#pagebreak()

=== Solution C2: Power Remainder Patterns

#strategy-box[
  *Key Theorems:*
  - *Fermat's Little Theorem:* If $p$ is prime and $gcd(a, p) = 1$, then $a^(p-1) equiv 1 space (mod p)$.
  - *Euler's Theorem:* If $gcd(a, n) = 1$, then $a^(phi(n)) equiv 1 space (mod n)$.
]

*Part 1: $2^(100) space (mod 13)$*

By Fermat's Little Theorem with $p = 13$: $2^(12) equiv 1 space (mod 13)$.

$100 = 12 times 8 + 4$

$2^(100) = 2^(12 times 8 + 4) = (2^(12))^8 times 2^4 equiv 1^8 times 16 equiv 16 equiv 3 space (mod 13)$

#highlight-box[
  *Answer:* The remainder is *3*.
]

*Part 2: $7^(7^7) space (mod 10)$*

Powers of 7 mod 10 cycle with period 4: $7, 49, 343, 2401 arrow.r 7, 9, 3, 1, 7, 9, 3, 1, ...$

We need $7^7 space (mod 4)$ to determine position in the cycle.

$7 equiv 3 space (mod 4)$, and $3^2 = 9 equiv 1 space (mod 4)$.

$7^7 = 7^6 times 7 = (7^2)^3 times 7 equiv 1^3 times 3 equiv 3 space (mod 4)$

So $7^(7^7) equiv 7^3 space (mod 10)$.

$7^3 = 343 equiv 3 space (mod 10)$

#highlight-box[
  *Answer:* The remainder is *3*.
]

*Part 3: Last two digits of $3^(2024)$*

We need $3^(2024) space (mod 100)$.

$phi(100) = phi(4) times phi(25) = 2 times 20 = 40$

By Euler's theorem: $3^(40) equiv 1 space (mod 100)$

$2024 = 40 times 50 + 24$

$3^(2024) equiv 3^(24) space (mod 100)$

Compute $3^(24)$:
- $3^2 = 9$
- $3^4 = 81$
- $3^8 = 81^2 = 6561 equiv 61 space (mod 100)$
- $3^(16) = 61^2 = 3721 equiv 21 space (mod 100)$
- $3^(24) = 3^(16) times 3^8 equiv 21 times 61 = 1281 equiv 81 space (mod 100)$

#highlight-box[
  *Answer:* The last two digits are *81*.
]

*Part 4: $99^(99) space (mod 100)$*

$99 equiv -1 space (mod 100)$

$99^(99) equiv (-1)^(99) = -1 equiv 99 space (mod 100)$

#highlight-box[
  *Answer:* The remainder is *99*.
]

#pagebreak()

=== Solution C3: Units Digit Analysis

#strategy-box[
  *Key Insight:* Units digits of powers follow periodic cycles. The period divides $phi(10) = 4$.
]

*Part 1: Units digit of $7^(2024)$*

The units digit of $7^n$ cycles with period 4: $7, 9, 3, 1, 7, 9, 3, 1, ...$

$2024 = 4 times 506 + 0$

Since $2024 equiv 0 space (mod 4)$, we're at position 4 in the cycle.

#highlight-box[
  *Answer:* The units digit is *1*.
]

*Part 2: Units digit of $3^(100) + 7^(100)$*

Units digit of $3^n$: cycle $3, 9, 7, 1$ (period 4). $100 equiv 0 space (mod 4)$ → units digit 1.

Units digit of $7^n$: cycle $7, 9, 3, 1$ (period 4). $100 equiv 0 space (mod 4)$ → units digit 1.

Sum: $1 + 1 = 2$.

#highlight-box[
  *Answer:* The units digit is *2*.
]

*Part 3: Units digit of $2^(100) times 3^(100)$*

$2^(100) times 3^(100) = 6^(100)$

The units digit of $6^n$ is always 6 (since $6 times 6 = 36$, $36 times 6 = 216$, etc.).

#highlight-box[
  *Answer:* The units digit is *6*.
]

*Part 4: Count $n <= 100$ with $n^n$ having units digit 1*

The units digit of $n^n$ depends only on the units digit of $n$, which we denote by $d$. We need $d^n equiv 1 space (mod 10)$ where $n equiv d space (mod 10)$.

For each possible units digit $d$, we determine whether the condition can be satisfied.

When $d = 0$, we have $0^n = 0$ for all $n > 0$, which is never equal to 1.

When $d = 1$, we have $1^n = 1$ for all $n$, so the units digit is always 1. The numbers from 1 to 100 with units digit 1 are 1, 11, 21, ..., 91, giving us 10 valid values.

When $d = 2$, the units digits of powers of 2 follow the cycle 2, 4, 8, 6 with period 4. For the units digit to be 1, we would need $n equiv 0 space (mod 4)$. However, numbers ending in 2 satisfy $n equiv 2 space (mod 4)$, placing us at position 2 in the cycle, which gives units digit 4.

When $d = 3$, the cycle is 3, 9, 7, 1 with period 4. We need $n equiv 0 space (mod 4)$ for units digit 1, but numbers ending in 3 satisfy $n equiv 3 space (mod 4)$, giving position 3 in the cycle, which yields units digit 7.

When $d = 4$, the cycle is 4, 6 with period 2. Numbers ending in 4 are even, so we're at position 2, giving units digit 6.

When $d = 5$, we have $5^n equiv 5 space (mod 10)$ for all $n >= 1$, which is never 1.

When $d = 6$, we have $6^n equiv 6 space (mod 10)$ for all $n >= 1$, which is never 1.

When $d = 7$, the cycle is 7, 9, 3, 1 with period 4. We need $n equiv 0 space (mod 4)$, but numbers ending in 7 satisfy $n equiv 3 space (mod 4)$, yielding units digit 3.

When $d = 8$, the cycle is 8, 4, 2, 6 with period 4. Numbers ending in 8 satisfy $n equiv 0 space (mod 4)$, giving position 4 in the cycle, which yields units digit 6.

When $d = 9$, the cycle is 9, 1 with period 2. We need $n$ even for units digit 1, but numbers ending in 9 are odd, so the units digit is always 9.

In summary, only numbers ending in 1 produce $n^n$ with units digit 1.

#highlight-box[
  *Answer:* *10* values (those ending in 1: 1, 11, 21, 31, 41, 51, 61, 71, 81, 91).
]

#pagebreak()

=== Solution C4: Digit Sum Properties

#strategy-box[
  *Key Property:* $n equiv S(n) space (mod 9)$ because $10 equiv 1 space (mod 9)$.
]

*Part 1: Prove $n equiv S(n) space (mod 9)$*

Let $n = a_k times 10^k + a_(k-1) times 10^(k-1) + ... + a_1 times 10 + a_0$ where $a_i$ are digits.

Since $10 equiv 1 space (mod 9)$, we have $10^i equiv 1^i = 1 space (mod 9)$ for all $i >= 0$.

Therefore:
$n equiv a_k times 1 + a_(k-1) times 1 + ... + a_1 times 1 + a_0 = S(n) space (mod 9)$

#highlight-box[
  *Result:* $n equiv S(n) space (mod 9)$. #sym.qed
]

*Part 2: Two-digit $n$ with $n = 7 times S(n)$*

Let $n = 10a + b$ where $a in {1,...,9}$ and $b in {0,...,9}$.

$10a + b = 7(a + b)$
$10a + b = 7a + 7b$
$3a = 6b$
$a = 2b$

Valid pairs $(a, b)$ with $a = 2b$ and $1 <= a <= 9$:
- $b = 1, a = 2$ → $n = 21$
- $b = 2, a = 4$ → $n = 42$
- $b = 3, a = 6$ → $n = 63$
- $b = 4, a = 8$ → $n = 84$

#highlight-box[
  *Answer:* $n in {21, 42, 63, 84}$.
]

*Part 3: If $9 | n$, prove $9 | S(n)$*

From Part 1: $n equiv S(n) space (mod 9)$.

If $9 | n$, then $n equiv 0 space (mod 9)$, so $S(n) equiv 0 space (mod 9)$.

#highlight-box[
  *Result:* If $9 | n$, then $9 | S(n)$. #sym.qed
]

*Part 4: Three-digit $n$ with $n = 11 times S(n)$*

Let $n = 100a + 10b + c$.

$100a + 10b + c = 11(a + b + c)$
$100a + 10b + c = 11a + 11b + 11c$
$89a = b + 10c$

Since $b + 10c <= 9 + 90 = 99$ and $89a >= 89$:
- $a = 1$: $b + 10c = 89$. With $c <= 9$: $b = 89 - 10c$. For $b <= 9$: $89 - 10c <= 9$ → $c >= 8$.
  - $c = 8$: $b = 9$ → $n = 198$. Check: $S(198) = 18$, $11 times 18 = 198$. #sym.checkmark
  - $c = 9$: $b = -1$ invalid.

#highlight-box[
  *Answer:* $n = 198$.
]

#pagebreak()

== Section D Solutions: GCF, LCM, and Divisibility Chains

=== Solution D1: Prime Factorization and GCF/LCM

#strategy-box[
  *GCF/LCM Rules:*
  - $"GCF"$: take $min$ of each prime's exponent
  - $"LCM"$: take $max$ of each prime's exponent
]

*Given:* $a = 2^3 times 3^2 times 5 = 360$ and $b = 2^2 times 3^4 times 7 = 2268$

*Part 1: Compute GCF and LCM*

$"GCF"(a, b) = 2^(min(3,2)) times 3^(min(2,4)) times 5^(min(1,0)) times 7^(min(0,1)) = 2^2 times 3^2 = 36$

$"LCM"(a, b) = 2^(max(3,2)) times 3^(max(2,4)) times 5^(max(1,0)) times 7^(max(0,1)) = 2^3 times 3^4 times 5 times 7 = 22680$

#highlight-box[
  *Answer:* $"GCF"(a,b) = 36$, $"LCM"(a,b) = 22680$.
]

*Part 2: Verify $"GCF" times "LCM" = a times b$*

$"GCF" times "LCM" = 36 times 22680 = 816480$

$a times b = 360 times 2268 = 816480$ #sym.checkmark

#highlight-box[
  *Verification confirmed.* #sym.qed
]

*Part 3: Find $c$ with $"GCF"(a,c) = 12$ and $"LCM"(a,c) = 360$*

$a = 2^3 times 3^2 times 5$, $"GCF" = 12 = 2^2 times 3$, $"LCM" = 360 = 2^3 times 3^2 times 5$

For each prime:
- Prime 2: $min(3, c_2) = 2$ and $max(3, c_2) = 3$. So $c_2 = 2$.
- Prime 3: $min(2, c_3) = 1$ and $max(2, c_3) = 2$. So $c_3 = 1$.
- Prime 5: $min(1, c_5) = 0$ and $max(1, c_5) = 1$. So $c_5 = 0$.

Therefore $c = 2^2 times 3^1 = 12$.

#highlight-box[
  *Answer:* $c = 12$.
]

*Part 4: Count common divisors of $a$ and $b$*

Common divisors of $a$ and $b$ are exactly the divisors of $"GCF"(a,b) = 36 = 2^2 times 3^2$.

$tau(36) = (2+1)(2+1) = 9$

#highlight-box[
  *Answer:* *9* positive integers divide both $a$ and $b$.
]

#pagebreak()

=== Solution D2: Divisibility Chain Counting

#strategy-box[
  *Key Insight:* A divisibility chain $d_1 | d_2 | ... | d_k = n$ corresponds to choosing intermediate divisors. Each step moves "up" in the divisor lattice.
]

*Part 1: Chains of length 2 ending at 12*

A chain of length 2 is $(d_1, 12)$ where $d_1 | 12$.

The divisors of 12 are: 1, 2, 3, 4, 6, 12.

#highlight-box[
  *Answer:* *6* chains (one for each divisor of 12).
]

*Part 2: Chains of length 3 ending at 24*

A chain $(d_1, d_2, 24)$ requires $d_1 | d_2$ and $d_2 | 24$. For each choice of $d_2$, the number of valid choices for $d_1$ equals the number of divisors of $d_2$, since $d_1$ can be any divisor of $d_2$.

The prime factorization $24 = 2^3 times 3$ has divisors 1, 2, 3, 4, 6, 8, 12, 24. We compute the number of divisors of each, which equals the number of chains where that value serves as $d_2$:

#uptoten-table(
  columns: 3,
  header: ($d_2$, $tau(d_2)$, [Chains with this $d_2$]),
  [1], [1], [1],
  [2], [2], [2],
  [3], [2], [2],
  [4], [3], [3],
  [6], [4], [4],
  [8], [4], [4],
  [12], [6], [6],
  [24], [8], [8],
)

Summing over all divisors: $1 + 2 + 2 + 3 + 4 + 4 + 6 + 8 = 30$.

#highlight-box[
  *Answer:* *30* chains.
]

*Part 3: Formula for $n = 2^a times 3^b$*

For chains of length 2, we count divisors: $tau(n) = (a+1)(b+1)$.

#highlight-box[
  *Answer:* Number of length-2 chains = $(a+1)(b+1)$.
]

*Part 4: Length-3 chains ending at $n = 2^3 times 3^2 = 72$*

Each divisor $d_2 = 2^i times 3^j$ (with $0 <= i <= 3$, $0 <= j <= 2$) contributes $tau(d_2) = (i+1)(j+1)$ chains.

$sum_(i=0)^3 sum_(j=0)^2 (i+1)(j+1) = (sum_(i=0)^3 (i+1))(sum_(j=0)^2 (j+1)) = (1+2+3+4)(1+2+3) = 10 times 6 = 60$

#highlight-box[
  *Answer:* *60* chains.
]

#pagebreak()

== Section E Solutions: Perfect Powers and Special Numbers

=== Solution E1: Perfect Square Analysis

*Part 1: Perfect square iff all exponents even*

*($arrow.r$)* If $n = m^2$, then $n = (p_1^(a_1) ... p_k^(a_k))^2 = p_1^(2a_1) ... p_k^(2a_k)$. All exponents are even.

*($arrow.l$)* If $n = p_1^(2b_1) ... p_k^(2b_k)$, then $n = (p_1^(b_1) ... p_k^(b_k))^2$, so $n$ is a perfect square.

#highlight-box[
  *Result:* $n$ is a perfect square $arrow.l.r.double$ all exponents in its prime factorization are even. #sym.qed
]

*Part 2: Smallest perfect square with 15 divisors*

For a perfect square, all exponents in the prime factorization must be even. From the divisor counting formula $tau(n) = product_i (a_i + 1)$, if each $a_i$ is even, then each factor $(a_i + 1)$ is odd. Therefore, we need to express 15 as a product of odd positive integers.

The factorizations of 15 into odd factors are: $15 = 15$, $15 = 5 times 3$, and $15 = 3 times 5$ (the last two are equivalent up to ordering).

For $15 = 15$, we have $(a_1 + 1) = 15$, so $a_1 = 14$, giving $n = p^(14)$. The smallest such number is $2^(14) = 16384$.

For $15 = 5 times 3$, we have $(a_1 + 1) = 5$ and $(a_2 + 1) = 3$, so $a_1 = 4$ and $a_2 = 2$. To minimize $n$, we assign the larger exponent to the smaller prime, giving $n = 2^4 times 3^2 = 144$.

For $15 = 3 times 5$, we have $a_1 = 2$ and $a_2 = 4$, giving $n = 2^2 times 3^4 = 324$.

Comparing: $144 < 324 < 16384$, so the smallest is 144.

#highlight-box[
  *Answer:* $n = 144 = 2^4 times 3^2 = 12^2$.
]

*Part 3: Smallest $n$ with $2n$ perfect square and $3n$ perfect cube*

We analyze the constraints on the exponents of each prime in the factorization of $n$.

For $2n$ to be a perfect square, every prime in its factorization must have an even exponent. If $n = 2^a times 3^b times ...$, then $2n = 2^(a+1) times 3^b times ...$, requiring $a + 1$ to be even (so $a$ is odd) and $b$ to be even, and so on for other primes.

For $3n$ to be a perfect cube, every prime must have an exponent divisible by 3. We have $3n = 2^a times 3^(b+1) times ...$, requiring $a equiv 0 space (mod 3)$ and $b + 1 equiv 0 space (mod 3)$, meaning $b equiv 2 space (mod 3)$.

Combining the constraints for the prime 2: $a$ must be odd and divisible by 3. The smallest such positive integer is $a = 3$.

Combining the constraints for the prime 3: $b$ must be even and satisfy $b equiv 2 space (mod 3)$. The values satisfying $b equiv 2 space (mod 3)$ are 2, 5, 8, 11, ... and among these, the even values are 2, 8, 14, .... The smallest is $b = 2$.

For any other prime $p$ in the factorization, the exponent $c$ must be even (for $2n$ to be a square) and divisible by 3 (for $3n$ to be a cube). The smallest non-negative value satisfying both is $c = 0$, meaning we don't need any other primes.

Therefore the smallest $n$ is $2^3 times 3^2 = 72$. Verification: $2 times 72 = 144 = 12^2$ is a perfect square, and $3 times 72 = 216 = 6^3$ is a perfect cube.

#highlight-box[
  *Answer:* $n = 72$.
]

*Part 4: If $12 | n^2$, prove $6 | n$*

$12 = 2^2 times 3$.

If $12 | n^2$, then $2^2 | n^2$ and $3 | n^2$.

$2^2 | n^2$ means $n^2$ has at least two factors of 2, so $n$ has at least one factor of 2.

$3 | n^2$ means $n^2$ has at least one factor of 3, so $n$ has at least one factor of 3 (since 3 is prime).

Therefore $2 times 3 = 6 | n$.

#highlight-box[
  *Result:* If $12 | n^2$, then $6 | n$. #sym.qed
]

#pagebreak()

=== Solution E2: Perfect Sixth Powers

*Part 1: Perfect squares and cubes less than 1000*

$n$ is both a perfect square and perfect cube iff $n$ is a perfect sixth power.

$1^6 = 1$, $2^6 = 64$, $3^6 = 729$, $4^6 = 4096 > 1000$

#highlight-box[
  *Answer:* $n in {1, 64, 729}$.
]

*Part 2: Proof of equivalence*

*($arrow.r$)* If $n = k^6$, then $n = (k^3)^2$ (perfect square) and $n = (k^2)^3$ (perfect cube).

*($arrow.l$)* If $n = a^2 = b^3$, then all exponents in the prime factorization are divisible by both 2 and 3, hence by $"LCM"(2,3) = 6$. So $n$ is a perfect sixth power.

#highlight-box[
  *Result:* $n$ is both perfect square and cube $arrow.l.r.double$ $n$ is a perfect sixth power. #sym.qed
]

*Part 3: $2^a times 3^b$ is perfect sixth power with 49 divisors*

Perfect sixth power: $a equiv 0 space (mod 6)$ and $b equiv 0 space (mod 6)$.

$tau(n) = (a+1)(b+1) = 49 = 7 times 7$

So $a + 1 = 7$ and $b + 1 = 7$, giving $a = b = 6$.

Check: $a = 6 equiv 0 space (mod 6)$ #sym.checkmark

#highlight-box[
  *Answer:* $a = 6$, $b = 6$, so $n = 2^6 times 3^6 = 46656$.
]

*Part 4: Smallest $n = m^2 + 1 = k^3 - 1$*

Rearranging the equation $m^2 + 1 = k^3 - 1$, we obtain $m^2 = k^3 - 2$. We seek the smallest positive integer $n$ that can be expressed both as one more than a perfect square and as one less than a perfect cube.

This is equivalent to finding a perfect square that is exactly 2 less than a perfect cube. Such Diophantine equations (called Mordell equations of the form $y^2 = x^3 + D$) have been extensively studied.

For small values of $k$, we examine whether $k^3 - 2$ is a perfect square. When $k = 2$, we have $k^3 - 2 = 8 - 2 = 6$, and since $2^2 = 4 < 6 < 9 = 3^2$, this is not a perfect square. When $k = 3$, we get $k^3 - 2 = 27 - 2 = 25 = 5^2$, which is indeed a perfect square.

Therefore the smallest solution occurs with $m = 5$ and $k = 3$, giving $n = m^2 + 1 = 25 + 1 = 26 = k^3 - 1 = 27 - 1$.

#highlight-box[
  *Answer:* $n = 26$ (since $26 = 5^2 + 1 = 3^3 - 1$).
]

#pagebreak()

=== Solution E3: Sum of Divisors

*Part 1: Formula for $sigma(p^k)$*

The divisors of $p^k$ are $1, p, p^2, ..., p^k$.

$sigma(p^k) = 1 + p + p^2 + ... + p^k = (p^(k+1) - 1)/(p - 1)$ (geometric series formula)

#highlight-box[
  *Result:* $sigma(p^k) = (p^(k+1) - 1)/(p - 1)$. #sym.qed
]

*Part 2: Calculate $sigma(72)$*

$72 = 2^3 times 3^2$

Using the multiplicative property: $sigma(72) = sigma(2^3) times sigma(3^2)$

$sigma(2^3) = 1 + 2 + 4 + 8 = 15$

$sigma(3^2) = 1 + 3 + 9 = 13$

$sigma(72) = 15 times 13 = 195$

#highlight-box[
  *Answer:* $sigma(72) = 195$.
]

*Part 3: Verify 28 is perfect*

$28 = 2^2 times 7$

$sigma(28) = sigma(2^2) times sigma(7) = (1 + 2 + 4) times (1 + 7) = 7 times 8 = 56$

$2 times 28 = 56$ #sym.checkmark

#highlight-box[
  *Result:* $sigma(28) = 56 = 2 times 28$, confirming 28 is a perfect number. #sym.qed
]

*Part 4: $sigma(n)$ odd iff $n$ is a square or twice a square*

Since $sigma$ is a multiplicative function, we have $sigma(n) = product_p sigma(p^(a_p))$ where the product runs over all primes $p$ dividing $n$. Therefore, $sigma(n)$ is odd if and only if each factor $sigma(p^(a_p))$ is odd.

For the prime 2, we compute $sigma(2^k) = 1 + 2 + 4 + ... + 2^k = 2^(k+1) - 1$ using the geometric series formula. This expression is always odd, regardless of $k$, since it equals one less than a power of 2.

For an odd prime $p$, we have $sigma(p^k) = 1 + p + p^2 + ... + p^k$. Since $p$ is odd, every term $p^i$ is odd. The sum of $k + 1$ odd terms is odd if and only if $k + 1$ is odd, which happens precisely when $k$ is even.

Combining these observations: $sigma(n)$ is odd if and only if the exponent of every odd prime in the factorization of $n$ is even. There is no constraint on the exponent of 2.

This characterization means $n$ can be written as $n = 2^a times m^2$ where $m$ is an odd integer. When $a$ is even, say $a = 2c$, we have $n = 2^(2c) times m^2 = (2^c times m)^2$, a perfect square. When $a$ is odd, say $a = 2c + 1$, we have $n = 2 times 2^(2c) times m^2 = 2 times (2^c times m)^2$, which is twice a perfect square.

#highlight-box[
  *Result:* $sigma(n)$ is odd $arrow.l.r.double$ $n$ is a perfect square or twice a perfect square. #sym.qed
]

#pagebreak()

== Section F Solutions: Olympiad-Style Synthesis Problems

=== Solution F1: The Integer Equation

*Equation:* $x^2 - y! = 2023$

*Part 1: Values of $y$ with $y! < 2023$*

$1! = 1$, $2! = 2$, $3! = 6$, $4! = 24$, $5! = 120$, $6! = 720$, $7! = 5040 > 2023$

#highlight-box[
  *Answer:* $y in {1, 2, 3, 4, 5, 6}$.
]

*Part 2: Check each case using prime factorization analysis*

For each valid $y$, we compute $x^2 = y! + 2023$ and determine whether the result is a perfect square by analyzing its prime factorization.

For $y = 1$, we have $x^2 = 1 + 2023 = 2024 = 8 times 253 = 2^3 times 11 times 23$. Since the exponent of 2 is 3 (odd), this cannot be a perfect square.

For $y = 2$, we get $x^2 = 2 + 2023 = 2025$. Factoring: $2025 = 25 times 81 = 5^2 times 3^4$. All exponents are even, confirming this is a perfect square. Indeed, $2025 = 45^2$, so $x = 45$ is a solution.

For $y = 3$, we have $x^2 = 6 + 2023 = 2029$. Checking divisibility by small primes reveals that 2029 is prime, hence not a perfect square.

For $y = 4$, we get $x^2 = 24 + 2023 = 2047 = 23 times 89$. Since 2047 is the product of two distinct primes, both with exponent 1 (odd), it is not a perfect square.

For $y = 5$, we have $x^2 = 120 + 2023 = 2143$. Testing reveals 2143 is prime, so not a perfect square.

For $y = 6$, we get $x^2 = 720 + 2023 = 2743 = 13 times 211$. Again, this is a product of distinct primes with odd exponents, so not a perfect square.

#highlight-box[
  *Answer:* Only $y = 2$ gives a perfect square.
]

*Part 3: For $y >= 8$, no solutions*

For $y >= 8$: $y!$ contains $8! = 40320$ as a factor, so $y! equiv 0 space (mod 16)$.

$x^2 = y! + 2023 equiv 0 + 2023 equiv 2023 equiv 7 space (mod 16)$

But perfect squares mod 16 are only: $0, 1, 4, 9$ (checking $0^2, 1^2, ..., 15^2$).

Since $7$ is not among these, $x^2 equiv 7 space (mod 16)$ is impossible.

#highlight-box[
  *Result:* For $y >= 8$, there are no solutions. #sym.qed
]

*Part 4: All solutions*

#highlight-box[
  *Answer:* $(x, y) = (45, 2)$.
]

#pagebreak()

=== Solution F2: Largest Proper Divisor

*Part 1: Express $f(n)$ in terms of smallest prime factor*

Let $p$ be the smallest prime factor of $n$.

The largest proper divisor of $n$ is $n$ divided by its smallest prime factor.

*Proof:* If $d$ is a proper divisor of $n$, then $n/d > 1$ is an integer. To maximize $d$, minimize $n/d$. The smallest value $n/d > 1$ can take is the smallest prime factor $p$ of $n$.

#highlight-box[
  *Result:* $f(n) = n/p$ where $p$ is the smallest prime factor of $n$.
]

*Part 2: Compute $f(f(f(1000)))$*

$1000 = 2^3 times 5^3$. Smallest prime factor: 2.

$f(1000) = 1000/2 = 500 = 2^2 times 5^3$

$f(500) = 500/2 = 250 = 2 times 5^3$

$f(250) = 250/2 = 125 = 5^3$

#highlight-box[
  *Answer:* $f(f(f(1000))) = 125$.
]

*Part 3: Reach 1 in exactly 10 steps*

The sequence $n arrow.r f(n) arrow.r f^2(n) arrow.r ...$ divides by the smallest prime at each step.

For $n = 2^k$: each step divides by 2, reaching 1 in exactly $k$ steps.

So $n = 2^(10) = 1024$ reaches 1 in exactly 10 steps.

#highlight-box[
  *Answer:* $n = 2^(10) = 1024$ (and other numbers with the same "path length").
]

*Part 4: Smallest $n > 1$ with $n/f(n) = f(n)/f(f(n))$*

$n/f(n) = p$ (smallest prime factor of $n$)

$f(n)/f(f(n)) = q$ (smallest prime factor of $f(n)$)

We need $p = q$.

For $n = p^k$: $f(n) = p^(k-1)$, $f(f(n)) = p^(k-2)$ (if $k >= 2$).

Then $n/f(n) = p$ and $f(n)/f(f(n)) = p$. Equal! #sym.checkmark

Smallest such $n$: $2^2 = 4$.

#highlight-box[
  *Answer:* $n = 4$.
]

#pagebreak()

=== Solution F3: The Locker Problem

*Part 1: Number of toggles for locker $n$*

Student $k$ toggles locker $n$ iff $k | n$.

Therefore, locker $n$ is toggled exactly $tau(n)$ times (the number of divisors of $n$).

#highlight-box[
  *Result:* Locker $n$ is toggled $tau(n)$ times.
]

*Part 2: Open lockers are perfect squares*

Locker $n$ is open iff it was toggled an odd number of times, i.e., $tau(n)$ is odd.

From our earlier result: $tau(n)$ is odd iff $n$ is a perfect square.

#highlight-box[
  *Result:* Locker $n$ is open $arrow.l.r.double$ $n$ is a perfect square. #sym.qed
]

*Part 3: Count of open lockers*

Perfect squares from 1 to 100: $1^2, 2^2, ..., 10^2$ (since $10^2 = 100 <= 100 < 121 = 11^2$).

#highlight-box[
  *Answer:* *10* lockers are open (lockers 1, 4, 9, 16, 25, 36, 49, 64, 81, 100).
]

*Part 4: Locker toggled exactly 6 times*

We seek the smallest locker number $n$ (with $n <= 100$) such that $tau(n) = 6$.

Using the divisor counting formula, we need $(a_1 + 1)(a_2 + 1)... = 6$. The factorizations of 6 are $6 = 6$, $6 = 3 times 2$, and $6 = 2 times 3$ (the last two being equivalent up to ordering).

For the factorization $6 = 6$, we have $n = p^5$ for a prime $p$. The smallest such number is $2^5 = 32$.

For the factorization $6 = 3 times 2$, we have $n = p^2 times q$ for distinct primes $p$ and $q$. To minimize $n$, we assign the larger exponent to the smaller prime, giving $n = 2^2 times 3 = 12$.

For the factorization $6 = 2 times 3$, we have $n = p times q^2$. With the optimization principle, the smallest such number is $2 times 3^2 = 18$.

Comparing the candidates: $12 < 18 < 32$, so the smallest $n$ with $tau(n) = 6$ is 12.

To verify, the divisors of 12 are 1, 2, 3, 4, 6, and 12, which is indeed exactly 6 divisors. Since $12 <= 100$, locker 12 is toggled exactly 6 times.

#highlight-box[
  *Answer:* Locker *12* is toggled exactly 6 times.
]
