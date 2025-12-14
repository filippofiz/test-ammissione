#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Quantitative Reasoning - Excellence_],
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

#let strategy-box(content) = box(
  fill: uptoten-green.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  stroke: 1pt + uptoten-green,
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
  #text(size: 16pt, fill: uptoten-green)[Excellence]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    Advanced strategies, optimization techniques, and expert-level approaches for maximizing your GMAT Quantitative Reasoning score.\
    \
    This guide covers strategic flexibility, time optimization, mental math mastery, pattern recognition, and advanced problem-solving approaches.
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

= The Excellence Mindset

Achieving excellence on the GMAT Quantitative Reasoning section requires more than mathematical knowledge. It demands strategic thinking, mental discipline, and the ability to make rapid decisions under pressure.

#info-box[
  *The Core Philosophy*

  "It's not about being a math genius. It's about mastering how to think like the GMAT."

  Top scorers approach quant as *quantitative reasoning*, not "math." They see beyond equations, spotting traps, predicting logic, and deciding when to dig deep or skip.
]

== What Separates Top Scorers

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Average Scorers*], [*Top Scorers*],
  [Use one approach consistently], [Flexibly choose the best strategy],
  [Calculate exact answers], [Estimate when appropriate],
  [Work through problems linearly], [Recognize patterns and shortcuts],
  [Get stuck on hard questions], [Guess strategically and move on],
  [React emotionally to difficulty], [Maintain composure and rhythm],
  [Study content only], [Study content AND strategy],
)

== The Understand, Plan, Solve Framework (Advanced)

=== Understand Phase (15-20 seconds)

1. *Glance strategically*: Look at answer choices first - what format are they in?
2. *Identify question type*: Is this algebra, number properties, word problem?
3. *Note key constraints*: Integers only? Positive? Specific range?
4. *Spot opportunities*: Can I estimate? Backsolve? Pick numbers?

=== Plan Phase (5-10 seconds)

*Critical decision*: Choose your approach BEFORE diving in.

#strategy-box[
  *Decision Matrix*

  Ask yourself:
  - Are there variables in the answer choices? #sym.arrow *Number picking*
  - Are answers numeric and easy to test? #sym.arrow *Backsolving*
  - Are answers spread far apart? #sym.arrow *Estimation*
  - Is the setup straightforward? #sym.arrow *Direct calculation*
  - Does the problem look ugly but answers are clean? #sym.arrow *Look for patterns*
]

=== Solve Phase (90-100 seconds max)

- Execute your chosen strategy efficiently
- If stuck after 60 seconds, reassess approach
- Keep work organized but minimal
- Check answer against question requirements

#pagebreak()

= Strategic Flexibility Mastery

The most critical skill for excellence is knowing which strategy to use and when to switch.

== Strategy Selection Deep Dive

=== Number Picking (Plugging In)

#tip-box[
  *When to Use*
  - Variables in answer choices
  - Percent or ratio problems without specific numbers
  - "Must be true" or "could be true" questions
  - Relationship problems
]

*Optimal Number Choices*:
- For percents: Use 100
- For ratios: Use the LCM of denominators
- For general problems: Use 2, 3, or 5 (small, easy, distinct)
- Avoid 0 and 1 (too special)

#example-box[
  *Example*: If $a$ is 25% greater than $b$, and $b$ is 20% less than $c$, then $a$ is what percent of $c$?

  *Strategy*: Pick $c = 100$

  $b = 100 - 20 = 80$

  $a = 80 + 0.25(80) = 80 + 20 = 100$

  $a/c = 100/100 = 100%$

  *Time saved*: ~45 seconds vs. algebraic approach
]

=== Backsolving

#tip-box[
  *When to Use*
  - Numeric answer choices
  - Problem would require complex equation setup
  - Answer choices are "nice" numbers
]

*Technique*:
1. Start with choice (C) or (B) [middle value]
2. Test in the problem conditions
3. Determine if you need larger or smaller
4. Test the appropriate remaining choice

#example-box[
  *Example*: A car travels from A to B at 40 mph and returns at 60 mph. If the total trip takes 5 hours, what is the distance from A to B?

  Choices: (A) 90 (B) 100 (C) 120 (D) 150 (E) 180

  *Test (C) = 120 miles*:

  Time there: $120/40 = 3$ hours

  Time back: $120/60 = 2$ hours

  Total: $3 + 2 = 5$ hours #sym.checkmark

  Answer: (C)

  *Time saved*: Setting up and solving $d/40 + d/60 = 5$
]

#pagebreak()

=== Strategic Estimation

#tip-box[
  *When to Use*
  - Answer choices are spread far apart (differ by 20%+)
  - Complex calculations that would take too long
  - Questions asking for "approximately" or "closest to"
]

*Estimation Techniques*:

1. *Round aggressively*: 298 #sym.arrow 300, 51 #sym.arrow 50
2. *Use benchmark fractions*: 33% #sym.approx 1/3, 67% #sym.approx 2/3
3. *Simplify expressions*: $(98 times 102) approx 100^2 = 10,000$

#example-box[
  *Example*: What is $(487 times 512)/(249)$ closest to?

  Choices: (A) 500 (B) 750 (C) 1000 (D) 1250 (E) 1500

  *Estimate*:

  $(500 times 500)/250 = 250,000/250 = 1000$

  Answer: (C)

  Note: Exact answer is 1002.4 - estimation got us there instantly.
]

=== Pattern Recognition

#tip-box[
  *When to Use*
  - Problem involves special numbers (powers, squares, etc.)
  - Expression can be factored or simplified
  - Classic GMAT patterns appear
]

*Common Patterns*:

#table(
  columns: (1fr, 1fr),
  align: (left, left),
  stroke: 0.5pt + gray,
  [*Pattern*], [*Simplification*],
  [$a^2 - b^2$], [$(a-b)(a+b)$],
  [$n(n+1)$], [Always even (consecutive integers)],
  [$n^2 - n$], [$n(n-1)$, always even],
  [$10^n - 1$], [String of 9s (999...9)],
  [Sum of $1$ to $n$], [$n(n+1)/2$],
)

#example-box[
  *Example*: What is $47^2 - 53^2$?

  Recognize: Difference of squares!

  $47^2 - 53^2 = (47-53)(47+53) = (-6)(100) = -600$

  *Time*: 10 seconds vs. calculating both squares
]

#pagebreak()

= Mental Math Mastery

Without a calculator, mental math efficiency is crucial. These techniques can save 30+ seconds per problem.

== Essential Mental Math Techniques

=== Multiplication Shortcuts

#info-box[
  *Multiplying by 5*

  Multiply by 10, then divide by 2.

  $48 times 5 = 480/2 = 240$
]

#info-box[
  *Multiplying by 11*

  For two-digit numbers: Sum the digits, place between them.

  $35 times 11 = 3(3+5)5 = 385$

  (If sum > 9, carry the 1)
]

#info-box[
  *Multiplying by 25*

  Divide by 4, then multiply by 100.

  $84 times 25 = 84/4 times 100 = 21 times 100 = 2100$
]

=== Squaring Shortcuts

#info-box[
  *Squaring Numbers Ending in 5*

  $(n times 10 + 5)^2 = n(n+1) times 100 + 25$

  $35^2 = 3 times 4 times 100 + 25 = 1225$

  $85^2 = 8 times 9 times 100 + 25 = 7225$
]

#info-box[
  *Squaring Near 50*

  For $50 plus.minus k$: Result = $2500 plus.minus 100k + k^2$

  $47^2 = 2500 - 300 + 9 = 2209$

  $53^2 = 2500 + 300 + 9 = 2809$
]

=== Division Shortcuts

#info-box[
  *Division by 5*

  Multiply by 2, then divide by 10.

  $345/5 = 690/10 = 69$
]

#info-box[
  *Quick Fraction Conversions*

  - $1/8 = 0.125 = 12.5%$
  - $1/6 approx 0.167 approx 16.7%$
  - $3/8 = 0.375 = 37.5%$
  - $5/8 = 0.625 = 62.5%$
]

#pagebreak()

=== Divisibility Rules

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Divisor*], [*Rule*],
  [2], [Last digit is even],
  [3], [Sum of digits divisible by 3],
  [4], [Last two digits form number divisible by 4],
  [5], [Last digit is 0 or 5],
  [6], [Divisible by both 2 and 3],
  [8], [Last three digits divisible by 8],
  [9], [Sum of digits divisible by 9],
  [11], [Alternating sum of digits divisible by 11],
)

#example-box[
  *Example*: Is 5,874 divisible by 6?

  Check for 2: Last digit is 4 (even) #sym.checkmark

  Check for 3: $5 + 8 + 7 + 4 = 24$, and $24/3 = 8$ #sym.checkmark

  Yes, 5,874 is divisible by 6.
]

= Time Optimization Strategies

== Pacing Mastery

=== The Two-Minute Rule

#warning-box[
  *Critical Rule*

  If you've spent more than 2 minutes on a question without making clear progress, it's time to guess strategically and move on.

  One wasted question can cost you 3-4 other questions at the end.
]

=== Checkpoint System

#table(
  columns: (1fr, 1fr, 1fr),
  align: (center, center, center),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Question*], [*Time Elapsed*], [*Action if Behind*],
  [7], [15 min], [Speed up slightly],
  [10], [21-22 min], [Skip one question soon],
  [14], [30 min], [Increase guessing threshold],
  [18], [38-39 min], [Answer all remaining quickly],
  [21], [45 min], [Complete!],
)

#pagebreak()

=== Strategic Guessing

#strategy-box[
  *When to Guess*

  - Problem type you consistently struggle with
  - Setup would take more than 60 seconds
  - You've eliminated 2+ answer choices
  - You're behind pace
]

*How to Guess Smartly*:
1. Eliminate obviously wrong answers
2. Look for answer choice patterns
3. Use estimation to eliminate more
4. Trust your gut on remaining choices

== Reading Efficiency

=== Active Reading Technique

Don't just read - extract information:

1. *Circle/note* key numbers and relationships
2. *Identify* what's being asked (underline it)
3. *Spot* constraints (integers, positive, etc.)
4. *Anticipate* what approach might work

#example-box[
  *Example*: "If positive integer $n$ has exactly 3 factors and $n < 50$..."

  *Extract*:
  - Positive integer #sym.arrow whole numbers
  - Exactly 3 factors #sym.arrow must be square of prime ($p^2$)
  - $n < 50$ #sym.arrow only $4, 9, 25, 49$ qualify
]

=== Keyword Recognition

#table(
  columns: (1fr, 2fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-blue.lighten(90%) } else if calc.odd(row) { white } else { gray.lighten(95%) },
  stroke: 0.5pt + gray,
  [*Keyword*], [*Implication*],
  ["at least"], [Minimum value, use $>=$ ],
  ["at most"], [Maximum value, use $<=$ ],
  ["distinct"/"different"], [No repeats allowed],
  ["consecutive"], [Sequence with difference of 1],
  ["remainder"], [Likely involves modular arithmetic],
  ["average"/"mean"], [Total = Average $times$ Count],
)

#pagebreak()

= Advanced Number Properties

== Units Digit Patterns

#info-box[
  *Cyclical Patterns*

  Powers of integers follow repeating patterns in their units digits.

  - Powers of 2: 2, 4, 8, 6, 2, 4, 8, 6... (cycle of 4)
  - Powers of 3: 3, 9, 7, 1, 3, 9, 7, 1... (cycle of 4)
  - Powers of 7: 7, 9, 3, 1, 7, 9, 3, 1... (cycle of 4)
]

#example-box[
  *Example*: What is the units digit of $7^{83}$?

  Pattern: 7, 9, 3, 1 (cycle of 4)

  $83 = 80 + 3 = 4(20) + 3$

  So $7^{83}$ has the same units digit as $7^3 = 343$

  Answer: *3*
]

== Remainder Patterns

#tip-box[
  *Remainder Arithmetic*

  When dividing by $n$:
  - $(a + b) mod n = ((a mod n) + (b mod n)) mod n$
  - $(a times b) mod n = ((a mod n) times (b mod n)) mod n$
]

#example-box[
  *Example*: What is the remainder when $15 times 17 times 19$ is divided by 8?

  $15 mod 8 = 7$

  $17 mod 8 = 1$

  $19 mod 8 = 3$

  Product of remainders: $7 times 1 times 3 = 21$

  $21 mod 8 = 5$

  Answer: *5*
]

== Factor Counting

#info-box[
  *Number of Factors Formula*

  For $n = p_1^{a_1} times p_2^{a_2} times ... times p_k^{a_k}$

  Number of factors = $(a_1 + 1)(a_2 + 1)...(a_k + 1)$
]

#example-box[
  *Example*: How many positive factors does 360 have?

  $360 = 2^3 times 3^2 times 5^1$

  Factors = $(3+1)(2+1)(1+1) = 4 times 3 times 2 = 24$
]

#pagebreak()

= Advanced Problem Types

== Overlapping Sets (Three Sets)

For three sets with overlaps:

#info-box[
  *Three-Set Formula*

  $|A union B union C| = |A| + |B| + |C| - |A inter B| - |B inter C| - |A inter C| + |A inter B inter C|$
]

#example-box[
  *Example*: In a class of 50 students, 30 play soccer, 25 play basketball, 20 play tennis. 10 play both soccer and basketball, 8 play both basketball and tennis, 5 play both soccer and tennis, and 3 play all three. How many play at least one sport?

  $|S union B union T| = 30 + 25 + 20 - 10 - 8 - 5 + 3 = 55$

  But the class only has 50 students, so all students play at least one sport, and 5 are "double-counted" (play multiple).
]

== Weighted Averages

#info-box[
  *Weighted Average Formula*

  $ "Weighted Average" = (sum w_i x_i)/(sum w_i) $

  where $w_i$ are weights and $x_i$ are values.
]

#example-box[
  *Example*: A student scores 80 on 3 tests and 90 on 2 tests. What is the average?

  Weighted avg = $(3 times 80 + 2 times 90)/(3 + 2) = (240 + 180)/5 = 420/5 = 84$
]

#tip-box[
  *Shortcut: The Balance Method*

  The weighted average must be between the values, closer to the value with more weight.

  With 3 tests at 80 and 2 at 90, the average is closer to 80.
]

== Absolute Value Equations

#strategy-box[
  *Solving $|x - a| = b$*

  Creates two equations:
  - $x - a = b$ #sym.arrow $x = a + b$
  - $x - a = -b$ #sym.arrow $x = a - b$
]

#example-box[
  *Example*: Solve $|2x - 5| = 7$

  Case 1: $2x - 5 = 7$ #sym.arrow $x = 6$

  Case 2: $2x - 5 = -7$ #sym.arrow $x = -1$

  Solutions: $x = 6$ or $x = -1$
]

#pagebreak()

= Error Prevention and Recovery

== Common Traps to Avoid

=== Sign Errors

#warning-box[
  *Check These Situations*
  - Subtracting negative numbers
  - Distributing negative signs
  - Squaring negative numbers
  - Moving terms across equals sign
]

=== Unit Errors

#warning-box[
  *Always Verify*
  - Consistent units throughout (all in hours, or all in minutes)
  - Conversions done correctly
  - Answer matches the unit asked for
]

=== Reading Errors

#warning-box[
  *Re-read Before Answering*
  - What is actually being asked?
  - Did you solve for the right variable?
  - Did you answer the question or just find an intermediate value?
]

== The Final Check

Before confirming your answer, take 5 seconds to verify:

1. *Does the answer make sense?* (Right magnitude? Right sign?)
2. *Did you answer what was asked?*
3. *Does your answer appear in the choices?*
4. *If you estimated, is your answer close to what you got?*

#example-box[
  *Example Check*: "A 25% discount followed by a 20% discount..."

  If your answer is 50% total discount - STOP. Combined discounts are never additive (should be 40%). Re-check your work.
]

#pagebreak()

= Mental Preparation and Test Day

== Building Mental Resilience

#info-box[
  *The Mindset of Top Scorers*

  GMAT quant is mentally demanding. You'll face unexpected twists, tight clocks, and self-doubt. Top scorers prepare their mindset like athletes:

  - *Rehearse pressure*: Practice under timed conditions
  - *Study emotional patterns*: Know how you react to difficulty
  - *Develop reset rituals*: Have strategies to recover quickly

  *Confidence isn't a feeling - it's a trained response to stress.*
]

== During-Test Strategies

=== Maintaining Rhythm

- Don't let one hard question affect the next
- Take a breath between questions
- Trust your preparation
- Remember: Even top scorers miss 30-40% of questions

=== Recovery Techniques

When you feel yourself struggling:

1. *Physical reset*: Take a deep breath, relax shoulders
2. *Mental reset*: "This question doesn't define my score"
3. *Strategic reset*: Guess and start fresh on next question

#tip-box[
  *The 80% Rule*

  You don't need to get every question right. Aim to:
  - Answer 80-85% of questions with high confidence
  - Make smart guesses on 15-20%
  - Never leave questions unanswered
]

== Error Log and Continuous Improvement

#strategy-box[
  *Create Your Error Log*

  For every practice problem you miss, record:

  1. What the question tested
  2. Why you got it wrong (conceptual, careless, strategy)
  3. What you'll do differently next time

  The "why" behind mistakes is more valuable than the right answer.
]

#pagebreak()

= Practice Protocol for Excellence

== Quality Over Quantity

#tip-box[
  *Practice Philosophy*

  - 10 problems with deep review > 50 problems rushed
  - Understand WHY right answers are right
  - Understand WHY wrong answers are wrong
  - Practice all strategies, not just comfortable ones
]

== Structured Practice Plan

=== Phase 1: Foundation (Weeks 1-2)
- Review all content areas
- Practice each strategy type separately
- Build mental math speed
- Establish baseline timing

=== Phase 2: Integration (Weeks 3-4)
- Mix question types
- Practice strategy selection
- Full timed sections
- Identify weak areas

=== Phase 3: Optimization (Weeks 5-6)
- Focus on weak areas
- Simulate test conditions
- Refine timing strategy
- Build mental stamina

=== Phase 4: Peak Performance (Final Week)
- Light practice only
- Review error log
- Rest and mental preparation
- Confidence building

== Recommended Daily Practice

#table(
  columns: (auto, 1fr),
  align: (left, left),
  fill: (col, row) => if row == 0 { uptoten-green.lighten(90%) } else { white },
  stroke: 0.5pt + gray,
  [*Activity*], [*Duration*],
  [Timed problem set (15-20 questions)], [40-45 minutes],
  [Deep review of missed questions], [20-30 minutes],
  [Mental math drills], [10 minutes],
  [Error log review], [10 minutes],
)

#pagebreak()

= Quick Reference: Excellence Checklist

== Before Each Question

#box(
  fill: uptoten-blue.lighten(95%),
  inset: 15pt,
  radius: 4pt,
  width: 100%,
)[
  #sym.square Glanced at answer choices

  #sym.square Identified question type

  #sym.square Noted key constraints

  #sym.square Chose best strategy

  #sym.square Set mental time limit
]

== During Each Question

#box(
  fill: uptoten-green.lighten(90%),
  inset: 15pt,
  radius: 4pt,
  width: 100%,
)[
  #sym.square Executing chosen strategy

  #sym.square Keeping work organized

  #sym.square Monitoring time spent

  #sym.square Ready to switch approach if stuck
]

== Before Confirming Answer

#box(
  fill: uptoten-orange.lighten(90%),
  inset: 15pt,
  radius: 4pt,
  width: 100%,
)[
  #sym.square Answer makes logical sense

  #sym.square Answered what was actually asked

  #sym.square Units are correct

  #sym.square Answer matches a choice
]

= Summary

Excellence in GMAT Quantitative Reasoning comes from:

*Strategic Mastery*:
- Choosing the right approach for each problem
- Flexibility to switch strategies
- Pattern recognition

*Efficiency*:
- Mental math fluency
- Time optimization
- Strategic guessing

*Mental Strength*:
- Composure under pressure
- Quick recovery from difficulty
- Confidence from preparation

*Continuous Improvement*:
- Learning from every mistake
- Targeted practice
- Building on strengths while addressing weaknesses

#align(center)[
  #v(1em)
  #box(
    fill: uptoten-green.lighten(90%),
    inset: 15pt,
    radius: 4pt,
  )[
    #text(size: 12pt, weight: "bold", fill: uptoten-blue)[
      Remember: The GMAT tests how you think, not what you know.

      Master the strategies. Trust your preparation. Execute with confidence.
    ]
  ]
]
