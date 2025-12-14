#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Hand-to-Hand Assessment_],
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
    image("../../Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Hand-to-Hand Assessment]
  #v(0.5em)
  #text(size: 14pt, fill: uptoten-green)[Based on Extended Practice Set 1]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    This assessment contains *18 carefully selected questions* designed to evaluate understanding of core GMAT Quantitative concepts.\
    \
    Questions progress from easier to challenging, covering fundamental arithmetic, algebra, rates, ratios, functions, and complex word problems.\
    \
    *Recommended Time:* 1 hour 30 minutes (approximately 5 minutes per question)\
    \
    *Format:* Take questions one by one, discuss after each question
  ]
  #v(3cm)
  #text(size: 10pt, fill: gray)[
    Via G. Frua 21/6, Milano \
    www.uptoten.it
  ]
]

#pagebreak()

= Instructions

This assessment is designed for a *hand-to-hand evaluation* format. The instructor will:

1. Present one question at a time to the student
2. Allow the student to work through the problem
3. Immediately discuss and correct the answer
4. Mark the response in the assessment tool
5. Move to the next question

== Assessment Structure

The 18 questions are organized by increasing difficulty:

- *Questions 1-4:* Warm-up (Difficulty Level 1-2)
  - Basic arithmetic, primes, percents, exponents
  - Expected time: 3-4 minutes each

- *Questions 5-10:* Building Difficulty (Difficulty Level 2-3)
  - Ratios, rates, LCM, distance problems
  - Expected time: 4-6 minutes each

- *Questions 11-15:* Advanced (Difficulty Level 3-4)
  - Functions, work problems, quadratic functions, number theory
  - Expected time: 5-7 minutes each

- *Questions 16-18:* Challenging (Difficulty Level 5)
  - 3D geometry, polynomials, complex ratios
  - Expected time: 7-8 minutes each

== Scoring System

Each question is weighted by difficulty:
- Level 1 questions: 1 point
- Level 2 questions: 2 points
- Level 3 questions: 3 points
- Level 4 questions: 4 points
- Level 5 questions: 5 points

*Total Possible Points:* 54

== Performance Levels

- *Excellent (45-54 points):* Strong understanding, ready for advanced material
- *Good (36-44 points):* Solid foundation, minor gaps to address
- *Fair (27-35 points):* Basic understanding, needs targeted practice
- *Needs Improvement (below 27 points):* Foundational work required

#pagebreak()

= Assessment Questions

== Question 1 #text(fill: uptoten-orange)[●] #text(size: 9pt, fill: gray)[Difficulty: 1 | Time: 3 min | Points: 1]

If $x$ and $y$ are positive integers such that $x^2 + y^2 = 13$ and $x < y$, what is $x + y$?

#v(0.5em)
(A) 3 \
(B) 4 \
(C) 5 \
(D) 6 \
(E) 7

#v(2em)

== Question 2 #text(fill: uptoten-orange)[●] #text(size: 9pt, fill: gray)[Difficulty: 1 | Time: 3 min | Points: 1]

What is the greatest prime factor of $84$?

#v(0.5em)
(A) 2 \
(B) 3 \
(C) 5 \
(D) 7 \
(E) 11

#v(2em)

== Question 3 #text(fill: uptoten-orange)[●] #text(size: 9pt, fill: gray)[Difficulty: 1 | Time: 4 min | Points: 1]

A shirt originally priced at \$60 is first marked up by 25%, then marked down by 20%. What is the final price?

#v(0.5em)
(A) \$57 \
(B) \$60 \
(C) \$63 \
(D) \$66 \
(E) \$72

#pagebreak()

== Question 4 #text(fill: uptoten-orange)[●●] #text(size: 9pt, fill: gray)[Difficulty: 2 | Time: 4 min | Points: 2]

If $2^a = 5$ and $2^b = 7$, what is $2^(a+2b)$ in terms of numbers?

#v(0.5em)
(A) 175 \
(B) 245 \
(C) 280 \
(D) 315 \
(E) 350

#v(2em)

== Question 5 #text(fill: uptoten-orange)[●●] #text(size: 9pt, fill: gray)[Difficulty: 2 | Time: 4 min | Points: 2]

If $a:b = 4:5$ and $b:c = 3:7$, what is the ratio of $a$ to $c$?

#v(0.5em)
(A) $4:7$ \
(B) $7:12$ \
(C) $12:35$ \
(D) $15:28$ \
(E) $20:21$

#v(2em)

== Question 6 #text(fill: uptoten-orange)[●●] #text(size: 9pt, fill: gray)[Difficulty: 2 | Time: 5 min | Points: 2]

How many positive integers less than 80 are divisible by both 4 and 6?

#v(0.5em)
(A) 4 \
(B) 5 \
(C) 6 \
(D) 7 \
(E) 8

#pagebreak()

== Question 7 #text(fill: uptoten-orange)[●●] #text(size: 9pt, fill: gray)[Difficulty: 2 | Time: 5 min | Points: 2]

A car travels 180 km at a constant speed. If the speed had been 15 km/h faster, the journey would have taken 1 hour less. What was the original speed in km/h?

#v(0.5em)
(A) 30 \
(B) 36 \
(C) 45 \
(D) 60 \
(E) 90

#v(2em)

== Question 8 #text(fill: uptoten-orange)[●●●] #text(size: 9pt, fill: gray)[Difficulty: 3 | Time: 6 min | Points: 3]

Two pipes can fill a tank in 10 hours and 15 hours respectively. Both pipes are opened together, but after 3 hours the faster pipe is closed. How many more hours will it take to fill the tank?

#v(0.5em)
(A) 6 hours \
(B) 6.5 hours \
(C) 7 hours \
(D) 7.5 hours \
(E) 8 hours

#v(2em)

== Question 9 #text(fill: uptoten-orange)[●●●] #text(size: 9pt, fill: gray)[Difficulty: 3 | Time: 5 min | Points: 3]

If $sqrt(2x - sqrt(2x - sqrt(2x - ...))) = 3$, what is the value of $x$?

#v(0.5em)
(A) 3 \
(B) 4.5 \
(C) 6 \
(D) 7.5 \
(E) 9

#pagebreak()

== Question 10 #text(fill: uptoten-orange)[●●●] #text(size: 9pt, fill: gray)[Difficulty: 3 | Time: 6 min | Points: 3]

A merchant mixes nuts costing \$8 per kg with nuts costing \$12 per kg in a ratio of 3:2. What is the cost per kg of the mixture?

#v(0.5em)
(A) \$9.20 \
(B) \$9.40 \
(C) \$9.60 \
(D) \$9.80 \
(E) \$10.00

#v(2em)

== Question 11 #text(fill: uptoten-orange)[●●●] #text(size: 9pt, fill: gray)[Difficulty: 3 | Time: 5 min | Points: 3]

If $f(x) = 2x + 3$ and $f(f(x)) = 17$, what is the value of $x$?

#v(0.5em)
(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

#v(2em)

== Question 12 #text(fill: uptoten-orange)[●●●●] #text(size: 9pt, fill: gray)[Difficulty: 4 | Time: 7 min | Points: 4]

Machine X can produce 80 units in 5 hours and machine Y can produce 120 units in 6 hours. If both machines work together for 3 hours, how many units will be produced?

#v(0.5em)
(A) 96 \
(B) 108 \
(C) 120 \
(D) 128 \
(E) 140

#pagebreak()

== Question 13 #text(fill: uptoten-orange)[●●●●] #text(size: 9pt, fill: gray)[Difficulty: 4 | Time: 6 min | Points: 4]

If $x + y = 10$ and $x^2 - y^2 = 40$, what is the value of $x - y$?

#v(0.5em)
(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

#v(2em)

== Question 14 #text(fill: uptoten-orange)[●●●●] #text(size: 9pt, fill: gray)[Difficulty: 4 | Time: 7 min | Points: 4]

If $x$ satisfies $|x - 3| + |x + 4| < 11$, how many integer values of $x$ are possible?

#v(0.5em)
(A) 3 \
(B) 5 \
(C) 7 \
(D) 9 \
(E) 11

#v(2em)

== Question 15 #text(fill: uptoten-orange)[●●●●] #text(size: 9pt, fill: gray)[Difficulty: 4 | Time: 6 min | Points: 4]

If $4^(x+1) - 4^(x-1) = 60$, what is the value of $x$?

#v(0.5em)
(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

#pagebreak()

== Question 16 #text(fill: uptoten-orange)[●●●●●] #text(size: 9pt, fill: gray)[Difficulty: 5 | Time: 8 min | Points: 5]

A cylinder has a radius of $r$ cm and a height of $h$ cm. If the radius is increased by 50% and the height is decreased by 20%, by what percent does the volume change?

#v(0.5em)
(A) Increases by 50% \
(B) Increases by 60% \
(C) Increases by 70% \
(D) Increases by 80% \
(E) Increases by 90%

#v(2em)

== Question 17 #text(fill: uptoten-orange)[●●●●●] #text(size: 9pt, fill: gray)[Difficulty: 5 | Time: 8 min | Points: 5]

If $x^2 + k x + 25 = (x + p)^2$ for all values of $x$, what is the value of $|k|$?

#v(0.5em)
(A) 3 \
(B) 5 \
(C) 8 \
(D) 10 \
(E) 25

#v(2em)

== Question 18 #text(fill: uptoten-orange)[●●●●●] #text(size: 9pt, fill: gray)[Difficulty: 5 | Time: 7 min | Points: 5]

The average of five consecutive even integers is 22. If the smallest and largest integers are removed, what is the average of the remaining three integers?

#v(0.5em)
(A) 20 \
(B) 21 \
(C) 22 \
(D) 23 \
(E) 24

#pagebreak()

= Answer Key

The following are the correct answers for this assessment. Use these only after the student has completed each question.

#table(
  columns: 4,
  stroke: 1pt + uptoten-blue,
  fill: (col, row) => if row == 0 { uptoten-green.lighten(80%) },
  align: center,
  [*Question*], [*Answer*], [*Difficulty*], [*Points*],
  [1], [C], [1], [1],
  [2], [D], [1], [1],
  [3], [B], [1], [1],
  [4], [B], [2], [2],
  [5], [C], [2], [2],
  [6], [C], [2], [2],
  [7], [C], [2], [2],
  [8], [D], [3], [3],
  [9], [C], [3], [3],
  [10], [C], [3], [3],
  [11], [B], [3], [3],
  [12], [B], [4], [4],
  [13], [C], [4], [4],
  [14], [D], [4], [4],
  [15], [B], [4], [4],
  [16], [D], [5], [5],
  [17], [D], [5], [5],
  [18], [C], [5], [5],
)

#v(1em)

*Total Possible Points:* 54

#pagebreak()

= Notes for Instructor

== Using This Assessment

This hand-to-hand assessment is designed to provide immediate feedback and identify learning gaps in real-time. Here's how to maximize its effectiveness:

=== During the Assessment

1. *Present one question at a time* - Don't let the student see ahead
2. *Observe the solving process* - Watch for methodology, not just the answer
3. *Note time taken* - Compare to estimated time for insights
4. *Discuss immediately* - Correct misconceptions before moving on
5. *Mark in the digital tool* - Record correct/incorrect and actual time

=== What to Observe

- *Problem-solving approach:* Does the student have a systematic method?
- *Algebraic manipulation:* Are basic skills solid?
- *Conceptual understanding:* Can they explain their reasoning?
- *Time management:* Are they spending time efficiently?
- *Error patterns:* Calculation errors vs. conceptual misunderstandings

=== After the Assessment

Use the digital tool's report to:
- Calculate the weighted score
- Identify weak topic areas
- Determine appropriate difficulty level for future lessons
- Plan targeted practice sessions

=== Scoring Interpretation Guide

*By Total Score:*
- 45-54 points (83-100%): Excellent - ready for advanced problems
- 36-44 points (67-81%): Good - solid foundation with minor gaps
- 27-35 points (50-65%): Fair - needs focused review
- Below 27 points (under 50%): Needs foundational work

*By Topic Performance:*
Track performance across:
- Arithmetic & Number Theory (Questions 1, 2, 6, 14)
- Algebra & Equations (Questions 4, 11, 15, 17)
- Ratios & Percents (Questions 3, 5, 10, 18)
- Rates & Motion (Questions 7, 8)
- Functions & Graphing (Questions 9, 11, 13)
- Work Problems (Question 12)
- Geometry (Question 16)

=== Recommended Next Steps

Based on score ranges:

*45-54 points:*
- Move to advanced GMAT problems (700+ level)
- Focus on timing and test-taking strategies
- Introduce data sufficiency questions

*36-44 points:*
- Continue with mixed difficulty practice
- Target identified weak areas
- Build speed on foundational concepts

*27-35 points:*
- Review fundamental concepts in weak areas
- Practice easier problems for confidence
- Focus on one topic at a time

*Below 27 points:*
- Return to basics in arithmetic and algebra
- Work through Extended Practice Set systematically
- Consider additional foundational materials