#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Word Problems",
  level: "Lesson Material",
  intro: "Comprehensive tutor guide covering rate problems, work problems, distance problems, mixture problems, and age problems.",
  logo: "/Logo.png"
)

= Lesson Overview

*Topic:* Word Problems\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-03 (Third of 5 QR topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Translate word problems into algebraic equations
2. Apply rate formulas (Distance = Rate $times$ Time, Work = Rate $times$ Time)
3. Solve work problems involving combined rates
4. Handle mixture problems with concentrations and quantities
5. Set up and solve age problems
6. Recognize word problem patterns and select efficient strategies

== GMAT Relevance

Word problems appear in approximately 20-25% of QR questions. They combine reading comprehension with mathematical reasoning, testing both skills simultaneously.

#pagebreak()

= Part 1: Translation Skills

== Key Translation Phrases

#uptoten-table(
  columns: 2,
  header: ("English Phrase", "Mathematical Translation"),
  "is, was, will be, equals", $=$,
  "more than, greater than", $+$,
  "less than, fewer than", $-$,
  "times, of, product", $times$,
  "divided by, per, ratio", $div$,
  "what, how many, a number", [$x$ (variable)],
  "twice, double", $2x$,
  "half of", [$x\/2$ or $0.5x$],
)

#warning-box[
  *Common Trap: "Less Than" Order*

  "5 less than x" = $x - 5$ (NOT $5 - x$)

  "3 less than twice a number" = $2x - 3$
]

== Setting Up Equations

#strategy-box[
  *Word Problem Framework:*
  1. Read the entire problem first
  2. Identify what you're solving for
  3. Assign variables to unknowns
  4. Translate relationships into equations
  5. Solve the equation(s)
  6. Check: Does your answer make sense?
]

#pagebreak()

= Part 2: Rate Problems

== The Rate Formula

#info-box[
  *Fundamental Rate Equation:*

  *Distance = Rate $times$ Time*  ($D = R times T$)

  Or equivalently:
  - Rate $= "Distance" \/ "Time"$
  - Time $= "Distance" \/ "Rate"$
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // D-R-T Triangle visualization
    let h = 2.5
    let w = 3

    // Triangle
    line((0, h), (-w/2, 0), stroke: 1.5pt)
    line((0, h), (w/2, 0), stroke: 1.5pt)
    line((-w/2, 0), (w/2, 0), stroke: 1.5pt)

    // Horizontal divider
    line((-w/2 + 0.3, h/2.5), (w/2 - 0.3, h/2.5), stroke: 1pt)

    // Labels
    content((0, h * 0.7), text(size: 14pt, weight: "bold", fill: blue)[$D$])
    content((-0.6, h/5), text(size: 14pt, weight: "bold", fill: red)[$R$])
    content((0.6, h/5), text(size: 14pt, weight: "bold", fill: green.darken(20%))[$T$])

    // Multiplication sign
    content((0, h/5), text(size: 10pt)[$times$])

    // Explanations
    content((3.5, h * 0.7), text(size: 9pt)[Cover $D$: $D = R times T$])
    content((3.5, h * 0.35), text(size: 9pt)[Cover $R$: $R = D \/ T$])
    content((3.5, h * 0.0), text(size: 9pt)[Cover $T$: $T = D \/ R$])
  })
]

== Average Speed

#warning-box[
  *Average Speed Trap:*

  Average speed is NOT the average of speeds!

  Average Speed $= "Total Distance" \/ "Total Time"$
]

#example-box[
  *A car travels 60 miles at 30 mph, then 60 miles at 60 mph. What is the average speed?*

  Wrong approach: $(30 + 60) \/ 2 = 45$ mph #text(fill: red)[#sym.crossmark]

  Correct approach:
  - Time for first 60 miles: $60\/30 = 2$ hours
  - Time for second 60 miles: $60\/60 = 1$ hour
  - Total distance: $120$ miles
  - Total time: $3$ hours
  - Average speed: $120\/3 = 40$ mph #sym.checkmark
]

== Relative Speed

#info-box[
  *When objects move:*
  - In the SAME direction: Relative speed $= |S_1 - S_2|$
  - In OPPOSITE directions: Relative speed $= S_1 + S_2$
]

#example-box[
  *Two cars are 200 miles apart. One travels at 40 mph, the other at 60 mph. How long until they meet if traveling toward each other?*

  *Method 1: Combined Speed (Quick Method)*

  Combined speed $= 40 + 60 = 100$ mph\
  Time $= "Distance" \/ "Speed" = 200 \/ 100 = 2$ hours

  *Method 2: Position-Time Equations*

  Set up a reference system with Car A at position $s = 0$ at time $t = 0$.

  *Position equations:*
  - Car A (moving right): $s_A (t) = 0 + 40t = 40t$
  - Car B (moving left from 200): $s_B (t) = 200 - 60t$

  *Finding meeting point:* Set $s_A (t) = s_B (t)$\
  $40t = 200 - 60t$\
  $100t = 200$\
  $t = 2$ hours

  *Meeting position:* $s_A (2) = 40 times 2 = 80$ miles from Car A's start
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Two cars approaching each other - Physical setup diagram
    let road_y = 0

    // Title
    content((0, 1.8), text(size: 10pt, weight: "bold")[Physical Setup])

    // Road
    line((-5, road_y), (5, road_y), stroke: 1.5pt + gray)

    // Origin marker
    line((-4, -0.2), (-4, 0.2), stroke: 1.5pt)
    content((-4, -0.5), text(size: 8pt)[$s = 0$])

    // End marker
    line((4, -0.2), (4, 0.2), stroke: 1.5pt)
    content((4, -0.5), text(size: 8pt)[$s = 200$])

    // Car A (left, going right)
    rect((-4.5, 0.15), (-3.5, 0.55), fill: blue.lighten(70%), stroke: blue)
    content((-4, 0.35), text(size: 8pt, fill: blue)[A])
    line((-3.3, 0.35), (-2.3, 0.35), stroke: blue + 1.5pt, mark: (end: ">"))
    content((-2.8, 0.8), text(size: 8pt, fill: blue)[40 mph])

    // Car B (right, going left)
    rect((3.5, 0.15), (4.5, 0.55), fill: red.lighten(70%), stroke: red)
    content((4, 0.35), text(size: 8pt, fill: red)[B])
    line((3.3, 0.35), (2.3, 0.35), stroke: red + 1.5pt, mark: (end: ">"))
    content((2.8, 0.8), text(size: 8pt, fill: red)[60 mph])

    // Reference system arrow
    line((-4, -1.2), (4, -1.2), stroke: 0.8pt, mark: (end: ">"))
    content((0, -1.6), text(size: 8pt)[positive $s$ direction])
  })
]

#v(0.5em)

#align(center)[
  #cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (8, 5),
      x-label: [#h(3em)$t$ (hours)],
      y-label: [$s$ (miles)],
      x-tick-step: 0.5,
      y-tick-step: 50,
      x-min: 0,
      x-max: 3,
      y-min: 0,
      y-max: 220,
      axis-style: "school-book",
      {
        // Car A: x = 40t (starts at 0, moves right)
        plot.add(
          domain: (0, 3),
          t => 40 * t,
          style: (stroke: blue + 2pt),
          label: $s_A = 40t$,
        )

        // Car B: x = 200 - 60t (starts at 200, moves left)
        plot.add(
          domain: (0, 3),
          t => 200 - 60 * t,
          style: (stroke: red + 2pt),
          label: $s_B = 200 - 60t$,
        )

        // Vertical dashed line at t=2
        plot.add-vline(2, style: (stroke: (paint: gray, dash: "dashed")))

        // Horizontal dashed line at x=80
        plot.add-hline(80, style: (stroke: (paint: gray, dash: "dashed")))

        // Mark intersection point (t=2, x=80)
        plot.add(
          ((2, 80), (2, 80)),
          mark: "o",
          mark-size: 0.2,
          mark-style: (stroke: green + 2pt, fill: green.lighten(50%)),
        )

        // Annotation for meeting point
        plot.annotate({
          content(
            (2.3, 110),
            box(
              text(size: 9pt, fill: green.darken(20%))[Meeting point\ $(t=2, s=80)$],
              fill: white,
              stroke: green.darken(20%) + 0.5pt,
              inset: 5pt,
              radius: 2pt
            )
          )
        })
      },
    )
  })
]

#tip-box[
  *Understanding the Position-Time Graph:*
  - Car A's line has *positive slope* ($+40$) — moving in positive $x$ direction
  - Car B's line has *negative slope* ($-60$) — moving in negative $x$ direction
  - The *intersection* shows when and where they meet
  - Car A travels $80$ miles, Car B travels $120$ miles (ratio $2:3$ matches speed ratio $40:60$)
]

#pagebreak()

= Part 3: Work Problems

== The Work Formula

#info-box[
  *Work Rate Concept:*

  If someone can complete a job in $T$ hours, their rate is $1\/T$ of the job per hour.

  *Combined Work Formula:*
  $ 1/T_1 + 1/T_2 = 1/T_"total" $

  Where $T_1$, $T_2$ are individual times and $T_"total"$ is combined time.
]

#example-box[
  *Machine A completes a job in 6 hours. Machine B completes the same job in 4 hours. How long to complete the job together?*

  Rate A $= 1\/6$ job per hour\
  Rate B $= 1\/4$ job per hour\
  Combined rate $= 1\/6 + 1\/4 = 2\/12 + 3\/12 = 5\/12$ job per hour

  Time $= 1 \/ (5\/12) = 12\/5 = 2.4$ hours (or 2 hours 24 minutes)
]

== Work with Different Scenarios

#example-box[
  *10 workers can complete a project in 12 days. How many days for 15 workers?*

  Total work $= 10 "workers" times 12 "days" = 120$ worker-days\
  With 15 workers: $120 \/ 15 = 8$ days
]

#pagebreak()

= Part 4: Mixture Problems

== Concentration Mixtures

#info-box[
  *Mixture Equation:*

  Amount of substance #sub[1] + Amount of substance #sub[2] = Amount in final mixture

  For concentrations:
  $ (C_1 times V_1) + (C_2 times V_2) = (C_f times V_"total") $
]

#example-box[
  *How many liters of 20% acid solution must be mixed with 30 liters of 50% acid solution to create a 30% acid solution?*

  Let $x$ = liters of 20% solution

  Acid from 20% solution: $0.20x$\
  Acid from 50% solution: $0.50(30) = 15$\
  Total acid in mixture: $0.30(x + 30)$

  Equation: $0.20x + 15 = 0.30(x + 30)$\
  $0.20x + 15 = 0.30x + 9$\
  $6 = 0.10x$\
  $x = 60$ liters
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Beaker 1 - 20% solution
    rect((-4.5, 0), (-2.5, 2), stroke: 1pt)
    rect((-4.5, 0), (-2.5, 1.2), fill: blue.lighten(80%), stroke: none)
    content((-3.5, 0.6), text(size: 9pt, fill: blue)[20%])
    content((-3.5, -0.4), text(size: 8pt)[$x$ L])

    // Plus sign
    content((-1.5, 1), text(size: 16pt, weight: "bold")[$+$])

    // Beaker 2 - 50% solution
    rect((-0.5, 0), (1.5, 2), stroke: 1pt)
    rect((-0.5, 0), (1.5, 1.6), fill: red.lighten(70%), stroke: none)
    content((0.5, 0.8), text(size: 9pt, fill: red)[50%])
    content((0.5, -0.4), text(size: 8pt)[30 L])

    // Equals sign
    content((2.5, 1), text(size: 16pt, weight: "bold")[$=$])

    // Result beaker - 30% solution
    rect((3.5, 0), (6, 2.5), stroke: 1pt)
    rect((3.5, 0), (6, 1.8), fill: purple.lighten(70%), stroke: none)
    content((4.75, 0.9), text(size: 9pt, fill: purple)[30%])
    content((4.75, -0.4), text(size: 8pt)[$(x + 30)$ L])
  })
]

== Price Mixtures

#example-box[
  *A store mixes coffee at \$8/lb with coffee at \$12/lb to create a 20 lb blend worth \$9.50/lb. How much of each?*

  Let $x$ = pounds of \$8 coffee\
  Then $(20 - x)$ = pounds of \$12 coffee

  Total value: $8x + 12(20 - x) = 9.50(20)$\
  $8x + 240 - 12x = 190$\
  $-4x = -50$\
  $x = 12.5$ lb of \$8 coffee\
  $20 - 12.5 = 7.5$ lb of \$12 coffee
]

#pagebreak()

= Part 5: Age Problems

== Setting Up Age Problems

#info-box[
  *Age Problem Strategy:*
  1. Define variables for CURRENT ages
  2. Express past/future ages in terms of current ages
  3. Translate the problem conditions into equations
]

#example-box[
  *John is now 3 times as old as Mary. In 10 years, John will be twice as old as Mary. How old is John now?*

  Let Mary's current age $= m$\
  John's current age $= 3m$

  In 10 years:
  - Mary will be: $m + 10$
  - John will be: $3m + 10$

  Condition: John's age in 10 years $= 2 times$ Mary's age in 10 years\
  $3m + 10 = 2(m + 10)$\
  $3m + 10 = 2m + 20$\
  $m = 10$

  John's current age $= 3m = 30$ years
]

#warning-box[
  *Age Problem Traps:*
  - "Years ago" means SUBTRACT from current age
  - "Years from now" means ADD to current age
  - Make sure the relationship makes sense (no negative ages!)
]

#pagebreak()

= Part 6: Other Word Problem Types

== Profit and Revenue

#info-box[
  *Key Formulas:*
  - Revenue $= "Price" times "Quantity"$
  - Profit $= "Revenue" - "Cost"$
  - Profit Margin $= "Profit" \/ "Revenue"$ (as percentage)
]

== Sequences and Patterns

#example-box[
  *The sum of 5 consecutive integers is 85. What is the largest integer?*

  Let the integers be: $n, n+1, n+2, n+3, n+4$

  Sum: $n + (n+1) + (n+2) + (n+3) + (n+4) = 85$\
  $5n + 10 = 85$\
  $5n = 75$\
  $n = 15$

  Largest integer $= n + 4 = 19$

  *Shortcut:* For consecutive integers, the average equals the middle number.\
  $85 div 5 = 17$ (middle number), so integers are 15, 16, 17, 18, 19
]

== Interest Problems

#info-box[
  *Simple Interest:* $I = P times r times t$
  - $I$ = Interest earned
  - $P$ = Principal (initial amount)
  - $r$ = Rate (as decimal)
  - $t$ = Time (in years)

  *Compound Interest:* $A = P(1 + r)^t$
  - $A$ = Final amount
]

#pagebreak()

= Part 7: GMAT Strategies for Word Problems

== Strategy Selection

#strategy-box[
  *When to Use Each Approach:*

  *Algebra:* When relationships are complex or involve multiple unknowns

  *Backsolving:* When answer choices are specific numbers and can be tested

  *Number Picking:* When answer choices contain variables or percentages
]

== Common Word Problem Shortcuts

#tip-box[
  *Time-Saving Patterns:*

  - Consecutive integer sum: Average $=$ Middle value
  - Equal distance at different speeds: Use harmonic mean for average speed
  - Work problems: Rate $= 1\/"Time"$, then add rates
  - Same direction pursuit: Relative speed $=$ difference of speeds
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Prioritize:*
1. Translation skills (phrases to equations)
2. Rate problems ($D = R times T$)
3. Basic work problems
4. Setting up equations from word descriptions

*Question Time:* 5-6 questions covering rate and basic work problems

== Lesson B Focus (Deep Dive)

*Prioritize:*
1. Mixture problems (concentration and price)
2. Age problems
3. Complex work scenarios
4. Strategy selection (when to backsolve vs. set up equations)

*Review errors from Training #1, focusing on:*
- Translation errors
- Setting up equations incorrectly
- Average speed mistakes

== Lesson C Focus (Assessment Prep)

*Brief review of:*
- Any patterns from Training #2 errors
- Quick recognition of problem types
- Strategy selection practice

*Assessment:* 20 questions, 40 minutes

== Common Student Difficulties

1. Translating "less than" in the wrong order
2. Averaging speeds instead of using total distance/total time
3. Forgetting to add rates in work problems (not times)
4. Setting up mixture equations with wrong concentrations
5. Confusing past and future in age problems

#warning-box[
  *Tutor Tip:* Have students draw diagrams for rate problems. Visual representation helps catch setup errors.
]
