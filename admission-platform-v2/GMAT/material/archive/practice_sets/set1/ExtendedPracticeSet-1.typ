#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Extended Practice Set 1_],
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

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("../..//Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold")[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold")[Extended Practice Set 1]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1em)
  #text(size: 11pt)[This practice set contains 100 multiple-choice problem solving questions divided into 4 sections of 25 questions each.\
  \
  The questions cover fundamental GMAT Quantitative topics including Value, Order, and Factors; Algebra, Equalities, and Inequalities; Rates, Ratios, and Percents; and Word Problems. Questions within each section progress from easier to more challenging.\
  \
  Please take care of the fact that might be errors in the questions, in case you find any, feel free to report them.]
  #v(3cm)
  #text(size: 10pt, fill: gray)[
    Via G. Frua 21/6, Milano \
    www.uptoten.it
  ]
]

#pagebreak()

= Instructions

This Extended Practice Set contains *100 problem solving questions* designed to help you prepare for the GMAT Quantitative Reasoning section. Each question has five answer choices labeled (A) through (E). Select the best answer for each question.

== Structure

- *Section 1 (Questions 1-25):* Fundamental arithmetic, algebra, and basic problem solving
- *Section 2 (Questions 26-50):* Rates, ratios, percents, and applications
- *Section 3 (Questions 51-75):* Functions, graphing, and advanced algebra
- *Section 4 (Questions 76-100):* Mixed word problems and applications

== Time Recommendation

Allow approximately *2/3 minutes per question* (with a total of minimum 3 hours and 20 minutes, maximum 5 hours). You may divide this into four 50-minute (or 1 hour and 15 minutes) sessions, one for each section.

== Topics Covered

This practice set focuses on:
- Value, Order, and Factors (integers, primes, exponents, absolute value)
- Algebra and Equations (linear equations, quadratics, systems, inequalities)
- Rates, Ratios, and Percents (proportions, percent change, interest)
- Functions and Graphing (coordinate plane, slopes, function notation)
- Word Problems (distance, work, mixture, multi-step problems)

== Answer Key

Complete solutions with answer letters only are provided at the end of the practice set.

#pagebreak()

= Section 1: Questions 1-25

== Question 1
If $x$ and $y$ are positive integers such that $x^2 + y^2 = 25$ and $x > y$, what is $x - y$?

(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

== Question 2
If $n$ is a positive integer and the sum of all positive divisors of $n$ equals 12, which of the following could be $n$?

(A) 5 \
(B) 8 \
(C) 9 \
(D) 11 \
(E) 12

== Question 3
For how many positive integer values of $x$ is $(x - 3)(x - 5)(x - 7) < 0$?

(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) Infinitely many

== Question 4
If $|x - 5| + |x + 2| = 10$ and $x < 0$, what is the value of $x$?

(A) $-3.5$ \
(B) $-3$ \
(C) $-2.5$ \
(D) $-2$ \
(E) $-1.5$

== Question 5
If $2^a = 3$ and $2^b = 5$, what is $2^(2a+b)$ in terms of numbers?

(A) 30 \
(B) 45 \
(C) 60 \
(D) 75 \
(E) 90

== Question 6
If $p$ and $q$ are prime numbers greater than 2, which of the following must be even?

(A) $p + q$ \
(B) $p times q$ \
(C) $p - q$ \
(D) $p^2 + q^2$ \
(E) $p^2 - q^2$

== Question 7
If $x$ and $y$ are integers, $x > y > 0$, and $x^2 - y^2 = 77$, what is the value of $x + y$?

(A) 7 \
(B) 11 \
(C) 13 \
(D) 39 \
(E) 77

== Question 8
What is the greatest prime factor of $12^2 - 8^2$?

(A) 2 \
(B) 3 \
(C) 5 \
(D) 7 \
(E) 11

== Question 9
If $n$ is the smallest positive integer such that $3n$ is a perfect square and $2n$ is a perfect cube, what is the value of $n$?

(A) 12 \
(B) 24 \
(C) 72 \
(D) 108 \
(E) 216

== Question 10
If $3^x times 9^y = 3^(10)$, what is $x + 2y$?

(A) 5 \
(B) 8 \
(C) 10 \
(D) 12 \
(E) 15

== Question 11
For how many positive integers $n$ is $n^2 - 7n + 12$ a prime number?

(A) One \
(B) Two \
(C) Three \
(D) Four \
(E) More than four

== Question 12
If $a$ and $b$ are positive integers and $(a + b)^2 - (a - b)^2 = 84$, what is the value of $a times b$?

(A) 12 \
(B) 21 \
(C) 28 \
(D) 42 \
(E) 84

== Question 13
If $x$ is a positive integer less than 100, for how many values of $x$ is $x/6$ an integer and $x/15$ also an integer?

(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

== Question 14
If $x^3 - y^3 = 91$ and $x - y = 1$, what is the value of $x^2 + x y + y^2$?

(A) 13 \
(B) 49 \
(C) 81 \
(D) 91 \
(E) 121

== Question 15
How many positive integers less than 50 have exactly 3 positive divisors?

(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

== Question 16
If $16^x = 8^(x+2)$, what is the value of $x$?

(A) 2 \
(B) 4 \
(C) 6 \
(D) 8 \
(E) 10

== Question 17
If $x$ and $y$ are positive integers, $x + y = 18$, and the least common multiple of $x$ and $y$ is 77, what is the value of $x times y$?

(A) 55 \
(B) 65 \
(C) 77 \
(D) 81 \
(E) 143

== Question 18
If $|2x + 3| = |2x - 5|$, what is the value of $x$?

(A) $-4$ \
(B) $-3/2$ \
(C) $0$ \
(D) $1/2$ \
(E) $5/2$

== Question 19
If $n$ is a positive integer and $(n!)/(n-2)! = 90$, what is the value of $n$?

(A) 6 \
(B) 8 \
(C) 9 \
(D) 10 \
(E) 12

== Question 20
If $sqrt(x + sqrt(x + sqrt(x + ...))) = 5$, what is the value of $x$?

(A) 5 \
(B) 10 \
(C) 15 \
(D) 20 \
(E) 25

== Question 21
If $a$, $b$, and $c$ are distinct positive integers less than 10, and $a^3 + b^3 = c^3 - 1$, what is the value of $a + b + c$?

(A) 15 \
(B) 17 \
(C) 18 \
(D) 19 \
(E) No such values exist

== Question 22
If $x$ is a positive integer and $x^2 + x$ is divisible by 6, which of the following must be true?

(A) $x$ is even \
(B) $x$ is odd \
(C) $x$ is divisible by 3 \
(D) $x$ is divisible by 6 \
(E) Either $x$ or $x + 1$ is divisible by 6

== Question 23
For how many integer values of $k$ does the equation $x^2 + k x + 16 = 0$ have integer solutions?

(A) 3 \
(B) 5 \
(C) 7 \
(D) 9 \
(E) 10

== Question 24
If $a$ and $b$ are positive integers such that $a^2 - b^2 = 15$, how many different values of $a$ are possible?

(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

== Question 25
If $3^(x+1) + 3^(x+1) + 3^(x+1) = 3^(2023)$, what is the value of $x$?

(A) 2020 \
(B) 2021 \
(C) 2022 \
(D) 2023 \
(E) 2024

#pagebreak()

= Section 2: Questions 26-50

== Question 26
A store offers successive discounts of 20% and 15% on an item. What single discount is equivalent to these two successive discounts?

(A) 30% \
(B) 32% \
(C) 33% \
(D) 35% \
(E) 38%

== Question 27
If the ratio of $x$ to $y$ is 3:4 and the ratio of $y$ to $z$ is 5:6, what is the ratio of $x$ to $z$?

(A) $3:6$ \
(B) $5:8$ \
(C) $15:24$ \
(D) $5:7$ \
(E) $18:20$

== Question 28
A trader mixes rice costing \$6 per kg with rice costing \$4 per kg in the ratio 2:3. At what price per kg should he sell the mixture to make a 25% profit?

(A) \$5.00 \
(B) \$5.50 \
(C) \$5.75 \
(D) \$6.00 \
(E) \$6.25

== Question 29
The population of a town increases by 10% annually. If the current population is 50,000, what will be the population after 2 years?

(A) 55,000 \
(B) 58,000 \
(C) 60,000 \
(D) 60,500 \
(E) 61,050

== Question 30
A cyclist travels from point A to point B at 12 km/h and returns at 18 km/h. What is his average speed for the entire journey?

(A) 13.5 km/h \
(B) 14.0 km/h \
(C) 14.4 km/h \
(D) 15.0 km/h \
(E) 15.5 km/h

== Question 31
If $a:b = 2:5$ and $b:c = 3:7$, and $a + b + c = 94$, what is the value of $c$?

(A) 28 \
(B) 35 \
(C) 42 \
(D) 49 \
(E) 56

== Question 32
A merchant marks up an item by 50% above cost and then offers a discount of 20% on the marked price. What is the merchant's overall profit percentage?

(A) 10% \
(B) 15% \
(C) 20% \
(D) 25% \
(E) 30%

== Question 33
A solution contains alcohol and water in the ratio 2:3. If 10 liters of alcohol and 5 liters of water are added, the new ratio becomes 3:4. What was the original quantity of the solution?

(A) 15 liters \
(B) 20 liters \
(C) 25 liters \
(D) 30 liters \
(E) 35 liters

== Question 34
If $x/5 = y/7 = z/11$, and $x + z = 96$, what is the value of $y$?

(A) 21 \
(B) 28 \
(C) 35 \
(D) 42 \
(E) 49

== Question 35
Train A leaves station P at 9 AM traveling toward station Q at 60 km/h. Train B leaves station Q at 10 AM traveling toward station P at 90 km/h. If the distance between P and Q is 450 km, at what time will the trains meet?

(A) 11:12 AM \
(B) 11:35 AM \
(C) 12:00 PM \
(D) 12:36 PM \
(E) 1:44 PM

== Question 36
Working alone, machine A can complete a job in 8 hours, machine B in 12 hours, and machine C in 24 hours. If all three machines work together for 2 hours, what fraction of the job remains?

(A) $1/4$ \
(B) $1/3$ \
(C) $5/12$ \
(D) $1/2$ \
(E) $7/12$

== Question 37
A container has 80 liters of milk. A milkman removes 10 liters and replaces it with water. He repeats this process one more time. What is the final ratio of milk to water in the container?

(A) $49:31$ \
(B) $7:4$ \
(C) $60:20$ \
(D) $3:1$ \
(E) $16:9$

== Question 38
If the price of an article is increased by 25% and then decreased by 20%, the final price is \$60. What was the original price?

(A) \$50 \
(B) \$55 \
(C) \$60 \
(D) \$65 \
(E) \$70

== Question 39
An investment of \$8,000 grows to \$9,261 in 2 years with annual compound interest. What is the annual interest rate?

(A) 6% \
(B) 7% \
(C) 7.5% \
(D) 8% \
(E) 10%

== Question 40
In a class, the ratio of boys to girls is 5:7. If 4 boys leave and 4 girls join, the ratio becomes 1:2. How many students were originally in the class?

(A) 36 \
(B) 48 \
(C) 60 \
(D) 72 \
(E) 84

== Question 41
A sum of money is divided among A, B, and C in the ratio 2:3:5. If C receives \$400 more than B, what is the total sum of money?

(A) \$2,000 \
(B) \$2,500 \
(C) \$3,000 \
(D) \$3,500 \
(E) \$4,000

== Question 42
A shopkeeper marks an article at a price that would give him 30% profit. However, he gives a discount and gains only 17%. What percentage discount did he give?

(A) 8% \
(B) 10% \
(C) 12% \
(D) 13% \
(E) 15%

== Question 43
If $x$ varies inversely as $y^2$ and $x = 8$ when $y = 2$, what is the value of $x$ when $y = 4$?

(A) 1 \
(B) 2 \
(C) 4 \
(D) 16 \
(E) 32

== Question 44
A car depreciates by 20% in the first year and by 15% of its value at the beginning of the second year. If its value after 2 years is \$27,200, what was its original value?

(A) \$36,000 \
(B) \$38,000 \
(C) \$40,000 \
(D) \$42,000 \
(E) \$45,000

== Question 45
Workers A, B, and C can complete a job in 8, 12, and 24 days respectively. They start working together, but A leaves after 2 days and B leaves 1 day before the job is completed. In how many days is the job completed? (choose the closest answer)

(A) 4 days and 12 hours \
(B) 5 days and 20 hours \
(C) 6 days and 12 hours \
(D) 8 days and 10 hours \
(E) 9 days and 6 hours

== Question 46
If $a/b = 2/3$ and $b/c = 4/5$, what is $(a + b)/(b + c)$?

(A) $2/3$ \
(B) $20/27$ \
(C) $5/6$ \
(D) $7/9$ \
(E) $8/9$

== Question 47
A sum of money invested at compound interest doubles in 4 years. In how many years will it become 8 times the original amount?

(A) 8 years \
(B) 10 years \
(C) 12 years \
(D) 16 years \
(E) 20 years

== Question 48
Two pipes A and B can fill a tank in 12 and 18 minutes respectively. A third pipe C can empty the full tank in 9 minutes. If all three pipes are opened simultaneously, in how many minutes will the tank be filled?

(A) 24 minutes \
(B) 30 minutes \
(C) 36 minutes \
(D) 42 minutes \
(E) The tank will never be filled

== Question 49
A car travels from City X to City Y at an average speed of 60 km/h and returns at 40 km/h. If the total travel time is 10 hours, what is the distance between the two cities?

(A) 200 km \
(B) 220 km \
(C) 240 km \
(D) 260 km \
(E) 280 km

== Question 50
A chemist has a 30% acid solution and a 70% acid solution. How many liters of each should be mixed to obtain 20 liters of a 50% acid solution?

(A) 10 liters each \
(B) 8 liters of 30% and 12 liters of 70% \
(C) 12 liters of 30% and 8 liters of 70% \
(D) 6 liters of 30% and 14 liters of 70% \
(E) 14 liters of 30% and 6 liters of 70%

#pagebreak()

= Section 3: Questions 51-75

== Question 51
If the line $y = m x + b$ passes through points $(2, 5)$ and $(6, -3)$, what is the value of $b$?

(A) 7 \
(B) 9 \
(C) 11 \
(D) 13 \
(E) 15

== Question 52
For what value(s) of $k$ does the line $y = 2x + k$ intersect the parabola $y = x^2 - 4x + 7$ at exactly one point?

(A) 1 only \
(B) 3 only \
(C) $-2$ only \
(D) 1 and $-2$ \
(E) -1 and $2$

== Question 53
If $|x - 2| + |x - 6| = 8$, how many integer values of $x$ satisfy the equation?

(A) 3 \
(B) 5 \
(C) 7 \
(D) 9 \
(E) Infinitely many

== Question 54
If $f(x) = x^2 - 2x$ and $g(x) = 3x - 4$, for what values of $x$ does $f(x) = g(x)$?

(A) $x = 4$ and $x = 1$ \
(B) $x = -1$ and $x = 1$ \
(C) $x = -1$ and $x = -2$ \
(D) $x = 1$ and $x = 2$ \
(E) $x = -2$ and $x = 4$

== Question 55
If $4^x - 4^(x-1) = 48$, what is the value of $x$?

(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

== Question 56
The line $a x + b y = 12$ passes through the points $(1, 8)$ and $(3, 0)$. What is the value of $a + b$?

(A) 3 \
(B) 5 \
(C) 8 \
(D) 10 \
(E) 12

== Question 57
If $x^4 - 13x^2 + 36 = 0$, what is the sum of all possible values of $x$?

(A) $-6$ \
(B) 0 \
(C) 6 \
(D) 13 \
(E) 36

== Question 58
For what values of $x$ is $x^2 - 5x + 6 < 0$?

(A) $x < 2$ or $x > 3$ \
(B) $2 < x < 3$ \
(C) $x < -3$ or $x > -2$ \
(D) $-3 < x < -2$ \
(E) $x < 1$ or $x > 6$

== Question 59
If $f(x) = 2x - 1$ and $f(f(x)) = 10$, what is the value of $x$?

(A) 2.25 \
(B) 2.5 \
(C) 2.75 \
(D) 3.25 \
(E) 3.5

== Question 60
If $x^2 + k x + 9 = (x + p)^2$ for all values of $x$, what is the value of $k + p$?

(A) $-3$ \
(B) 0 \
(C) 3 \
(D) 6 \
(E) 9

== Question 61
The graph of $y = a x^2 + b x + c$ has its vertex at $(2, -3)$ and passes through the point $(0, 1)$. What is the value of $a$?

(A) $-1$ \
(B) $1/2$ \
(C) 1 \
(D) $3/2$ \
(E) 2

== Question 62
If the roots of $x^2 + p x + q = 0$ are 3 and $-5$, what is the value of $p - q$?

(A) $-17$ \
(B) $-13$ \
(C) 2 \
(D) 13 \
(E) 17

== Question 63
If $sqrt(2x + 6) + sqrt(x - 1) = 6$ and $x > 1$, what is the value of $x$?

(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

== Question 64
Two lines $2x + 3y = 12$ and $3x - k y = 8$ are perpendicular. What is the value of $k$?

(A) $-2$ \
(B) $-1$ \
(C) 1 \
(D) 2 \
(E) 4

== Question 65
If $x$ satisfies $x^2 - 7|x| + 12 = 0$, how many distinct values of $x$ are possible?

(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) Infinitely many

== Question 66
If the parabola $y = x^2 + b x + c$ has its minimum value at $x = 3$ and this minimum value is 5, what is $c$?

(A) $-4$ \
(B) 5 \
(C) 9 \
(D) 11 \
(E) 14

== Question 67
For how many integer values of $x$ is $|x - 2| + |x + 1| <= 7$?

(A) 5 \
(B) 7 \
(C) 9 \
(D) 11 \
(E) Infinitely many

== Question 68
If $x + y = 8$ and $x^2 - y^2 = 32$, what is the value of $x - y$?

(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

== Question 69
If $f(x) = (x^2 - 9)/(x - 3)$ for $x != 3$, what value should be assigned to $f(3)$ to make $f$ continuous at $x = 3$?

(A) 0 \
(B) 3 \
(C) 6 \
(D) 9 \
(E) Undefined

== Question 70
If the discriminant of the quadratic equation $a x^2 + 12x + c = 0$ is 0 and $a = 2$, what is the value of $c$?

(A) 6 \
(B) 12 \
(C) 18 \
(D) 24 \
(E) 36

== Question 71
Points $A(1, 2)$, $B(4, 6)$, and $C(7, y)$ are collinear. What is the value of $y$?

(A) 8 \
(B) 9 \
(C) 10 \
(D) 11 \
(E) 12

== Question 72
If $9^x - 3^x = 6$, what is the value of $3^x$?

(A) 1 \
(B) 2 \
(C) 3 \
(D) $-2$ or 3 \
(E) $-1$ or 3

== Question 73
Lines $L_1$ and $L_2$ are parallel. If the slope of $L_1$ is $(a - 2)/(3)$ and the slope of $L_2$ is $(3a + 1)/(6)$, what is the value of $a$?

(A) $-5$ \
(B) $-3$ \
(C) 1 \
(D) 3 \
(E) 5

== Question 74
If $f(x) = a x^2 + b x + c$ and $f(0) = 3$, $f(1) = 6$, and $f(-1) = 4$, what is the value of $a + b + c$?

(A) 3 \
(B) 4 \
(C) 5 \
(D) 6 \
(E) 7

== Question 75
If $(x - 2)$ is a factor of $x^3 - a x^2 + b x - 12$ and the remainder when this polynomial is divided by $(x - 1)$ is $-9$, what is the value of $a$?

(A) 0 \
(B) 1 \
(C) 3 \
(D) 4 \
(E) 7

#pagebreak()

= Section 4: Questions 76-100

== Question 76
A rectangular field is 50 meters longer than it is wide. If the perimeter is 380 meters, what is the area of the field in square meters?

(A) 7,200 \
(B) 7,500 \
(C) 8,400 \
(D) 9,000 \
(E) 9,600

== Question 77
A square and a rectangle have equal areas. If the rectangle has dimensions 9 cm by 16 cm, what is the perimeter of the square in cm?

(A) 24 \
(B) 36 \
(C) 40 \
(D) 48 \
(E) 50

== Question 78
John purchased apples at \$3 per kg and oranges at \$5 per kg. He spent a total of \$47 and bought 11 kg of fruit in all. How many kg of apples did he buy?

(A) 4 \
(B) 5 \
(C) 6 \
(D) 7 \
(E) 8

== Question 79
The sum of the ages of a father and son is 56 years. Four years ago, the father was 5 times as old as the son. What is the present age of the father?

(A) 36 \
(B) 40 \
(C) 44 \
(D) 48 \
(E) 52

== Question 80
A positive integer $n$ when divided by 7 leaves a remainder of 3, and when divided by 11 leaves a remainder of 5. What is the smallest possible value of $n$?

(A) 38 \
(B) 52 \
(C) 59 \
(D) 73 \
(E) 80

== Question 81
The sum of four consecutive odd integers is 112. What is the product of the smallest and largest of these integers?

(A) 675 \
(B) 693 \
(C) 728 \
(D) 755 \
(E) 775

== Question 82
A cistern has two inlet pipes A and B that can fill it in 12 and 15 hours respectively, and an outlet pipe C that can empty it in 10 hours. If all three pipes are opened when the cistern is empty, how long will it take to fill the cistern?

(A) 20 hours \
(B) 30 hours \
(C) 40 hours \
(D) 50 hours \
(E) The cistern will never fill

== Question 83
A bookseller sells books at a 10% discount on the marked price and still makes a 35% profit. If his cost price for a book is \$90, what is the marked price?

(A) \$120 \
(B) \$125 \
(C) \$130 \
(D) \$135 \
(E) \$140

== Question 84
A rectangular box has dimensions in the ratio 2:3:5, and its total surface area is 558 square cm. What is the volume of the box in cubic cm?

(A) 540 \
(B) 648 \
(C) 750 \
(D) 810 \
(E) 900

== Question 85
Two numbers are in the ratio 3:5. If 9 is added to each number, the ratio becomes 6:7. What is the larger of the two original numbers?

(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

== Question 86
A merchant has 120 liters of a 40% alcohol solution. How many liters of pure alcohol must be added to make it a 50% alcohol solution?

(A) 12 \
(B) 15 \
(C) 18 \
(D) 20 \
(E) 24

== Question 87
The average of five consecutive integers is $n$. If the smallest integer is removed, what is the average of the remaining four integers?

(A) $n - 1$ \
(B) $n$ \
(C) $n + 1$ \
(D) $n + 1/2$ \
(E) $n + 2$

== Question 88
A circular track has a circumference of 440 meters. If two runners start at the same point and run in opposite directions at speeds of 6 m/s and 5 m/s, after how many seconds will they meet for the first time?

(A) 30 \
(B) 35 \
(C) 40 \
(D) 44 \
(E) 50

== Question 89
A man invested a total of \$15,000 in two schemes A and B at 10% and 12% simple annual interest respectively. If the total interest after one year is \$1,680, how much did he invest in scheme B?

(A) \$6,000 \
(B) \$7,000 \
(C) \$8,000 \
(D) \$9,000 \
(E) \$10,000

== Question 90
In a class of 60 students, the ratio of boys to girls is 7:5. If 15 new girls join the class, what will be the new ratio of boys to girls?

(A) 7:6 \
(B) 7:7 \
(C) 7:8 \
(D) 7:9 \
(E) 7:10

== Question 91
A boat travels 30 km upstream in 6 hours and returns downstream in 3 hours. What is the speed of the stream in km/h?

(A) 1.5 \
(B) 2 \
(C) 2.5 \
(D) 3 \
(E) 3.5

== Question 92
A taxi charges \$4 for the first kilometer and \$2.50 for each additional kilometer. If a passenger paid \$41.50 for a trip, how many kilometers was the trip?

(A) 12 \
(B) 14 \
(C) 15 \
(D) 16 \
(E) 18

== Question 93
In a factory, machine X produces 120 units in 5 hours and machine Y produces 180 units in 6 hours. Working together, how many units can they produce in 4 hours?

(A) 192 \
(B) 210 \
(C) 216 \
(D) 240 \
(E) 264

== Question 94
The average of $x$, $y$, and $z$ is 18. If $x$ is 3 more than $y$ and $z$ is 6 less than $y$, what is the value of $y$?

(A) 15 \
(B) 17 \
(C) 18 \
(D) 19 \
(E) 21

== Question 95
A rectangular garden is surrounded by a 2-meter-wide path on all sides. If the garden measures 20 meters by 30 meters, what is the area of the path in square meters?

(A) 208 \
(B) 216 \
(C) 224 \
(D) 232 \
(E) 240

== Question 96
A student needs an average of 85% on four tests to earn a B grade. If his scores on the first three tests are 78%, 82%, and 88%, what is the minimum score he needs on the fourth test?

(A) 90% \
(B) 92% \
(C) 94% \
(D) 96% \
(E) 98%

== Question 97
A clock shows the correct time at noon. If it loses 15 minutes every hour, what time will it show when the actual time is 8:00 PM on the same day?

(A) 4:00 PM \
(B) 5:00 PM \
(C) 6:00 PM \
(D) 6:30 PM \
(E) 7:00 PM

== Question 98
A sum of \$900 is divided among A, B, and C in the ratio 2:3:4. If B gives \$30 to A and \$20 to C, what is the new ratio of their shares?

(A) 21:23:38 \
(B) 22:24:40 \
(C) 23:25:42 \
(D) 24:26:44 \
(E) 25:27:46

== Question 99
A container is filled with a 60-liter mixture of milk and water in the ratio 7:5. How many liters of water should be added to make the ratio 7:8?

(A) 8 \
(B) 10 \
(C) 12 \
(D) 15 \
(E) 18

== Question 100
Two cyclists start from the same point and travel in opposite directions. One cyclist travels at 15 km/h and the other at 20 km/h. After how many hours will they be 140 km apart?

(A) 3 \
(B) 3.5 \
(C) 4 \
(D) 4.5 \
(E) 5

#pagebreak()

= Answer Key

The following are the correct answers for each question in this practice set. Review your responses and identify areas where you need additional practice.

== Section 1 (Questions 1-25)

#table(
  columns: 5,
  stroke: none,
  align: left,
  column-gutter: 1.5em,
  row-gutter: 0.5em,
  [1. A], [2. D], [3. C], [4. A], [5. B],
  [6. A], [7. B], [8. C], [9. D], [10. C],
  [11. A], [12. B], [13. B], [14. D], [15. C],
  [16. C], [17. C], [18. D], [19. D], [20. D],
  [21. E], [22. E], [23. B], [24. B], [25. C]
)

== Section 2 (Questions 26-50)

#table(
  columns: 5,
  stroke: none,
  align: left,
  column-gutter: 1.5em,
  row-gutter: 0.5em,
  [26. B], [27. B], [28. D], [29. D], [30. C],
  [31. E], [32. C], [33. C], [34. D], [35. D],
  [36. D], [37. A], [38. C], [39. C], [40. B],
  [41. A], [42. B], [43. B], [44. C], [45. C],
  [46. B], [47. C], [48. C], [49. C], [50. A]
)

== Section 3 (Questions 51-75)

#table(
  columns: 5,
  stroke: none,
  align: left,
  column-gutter: 1.5em,
  row-gutter: 0.5em,
  [51. B], [52. C], [53. D], [54. A], [55. C],
  [56. B], [57. B], [58. B], [59. D], [60. E],
  [61. C], [62. E], [63. D], [64. D], [65. D],
  [66. E], [67. B], [68. C], [69. C], [70. C],
  [71. C], [72. C], [73. A], [74. D], [75. A]
)

== Section 4 (Questions 76-100)

#table(
  columns: 5,
  stroke: none,
  align: left,
  column-gutter: 1.5em,
  row-gutter: 0.5em,
  [76. C], [77. D], [78. A], [79. C], [80. A],
  [81. E], [82. A], [83. D], [84. D], [85. D],
  [86. E], [87. D], [88. C], [89. D], [90. C],
  [91. C], [92. D], [93. C], [94. D], [95. B],
  [96. B], [97. C], [98. C], [99. D], [100. C]
)