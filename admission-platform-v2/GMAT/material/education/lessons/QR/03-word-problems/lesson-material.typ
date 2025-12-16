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

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Lesson Overview

*Topic:* Word Problems\
*Section:* Quantitative Reasoning\
*Lesson Sequence:* QR-03 (Third of 5 QR topics)\
*Total Sessions:* 3 lessons (A, B, C)

== Learning Objectives

By the end of this topic, students should be able to:

1. Translate word problems into algebraic equations
2. Apply rate formulas (Distance $=$ Rate $times$ Time, Work $=$ Rate $times$ Time)
3. Solve work problems involving combined rates
4. Handle mixture problems with concentrations and quantities
5. Set up and solve age problems
6. Recognize word problem patterns and select efficient strategies

== GMAT Relevance

Word problems appear in approximately 20-25% of QR questions. They combine reading comprehension with mathematical reasoning, testing both skills simultaneously. Unlike pure computation questions, word problems require you to first *understand* what is being asked, then *translate* the English description into mathematical relationships, and finally *solve* the resulting equations.

Many test-takers find word problems challenging not because the underlying mathematics is difficult, but because the translation step requires careful attention to language. A single misread word, confusing "less than" with "is less than" for example, can lead to an incorrect equation and a wrong answer. The good news is that word problems follow recognizable patterns, and once you learn to identify these patterns, the translation process becomes much more systematic.

#pagebreak()

= Translation Skills

Word problems are fundamentally about *translation*: converting a verbal description into mathematical language. This is both an art and a science. The "science" consists of learning the standard phrases and their mathematical equivalents. The "art" lies in reading carefully, identifying the key relationships, and choosing the most efficient approach to represent the problem mathematically.

Before diving into specific problem types, we must first master this translation skill. Every word problem, regardless of its category, begins with the same fundamental challenge: understanding what the words mean mathematically.

== Key Translation Phrases

Certain English phrases appear repeatedly in word problems, and each has a standard mathematical interpretation. The table below summarizes the most common translations:

#align(center)[
  #uptoten-table(
    columns: 2,
    header: ("English Phrase", "Mathematical Translation"),
    "is, was, will be, equals", $=$,
    "more than, greater than, increased by", $+$,
    "less than, fewer than, decreased by", $-$,
    "times, of, product", $times$,
    "divided by, per, ratio, quotient", $div$,
    "what, how many, a number", [$x$ (variable)],
    "twice, double", $2x$,
    "half of", [$x div 2$ or $0.5x$],
    "the sum of $a$ and $b$", $a + b$,
    "the difference of $a$ and $b$", $a - b$,
    "the product of $a$ and $b$", $a times b$,
  )
]

While this table provides a useful reference, memorizing it is not enough. The real skill lies in recognizing these phrases within the context of a sentence and understanding how they combine to form equations.

#warning-box[
  *Common Trap: "Less Than" Order*

  The phrase "less than" reverses the order of the operands compared to how it's spoken. This is one of the most frequent sources of errors in word problems.

  - "5 less than $x$" means $x - 5$ (NOT $5 - x$)
  - "3 less than twice a number" means $2x - 3$

  Think of it this way: if you have $x$ and you take away 5, you have $x - 5$. The phrase "5 less than $x$" describes what remains after removing 5 from $x$.
]

== Understanding "Of" in Mathematics

The word "of" is deceptively simple but critically important. In mathematical contexts, *"of" almost always means multiplication*. This usage stems from the idea that "a fraction of something" or "a percentage of something" represents a part of the whole, which we calculate by multiplying.

#example-box[
  *Common uses of "of":*

  - "Half of 20" means $1/2 times 20 = 10$
  - "25% of 80" means $0.25 times 80 = 20$
  - "Three-fourths of $x$" means $3/4 times x$
  - "Twice the sum of $a$ and $b$" means $2 times (a + b)$
]

This interpretation of "of" is especially important in percentage problems and in phrases like "the product of," where "of" signals that multiplication connects the quantities that follow.

== Setting Up Equations: A Systematic Approach

Translating a word problem is not just about converting individual phrases: it's about building a complete mathematical model of the situation described. The following framework provides a systematic approach that works for virtually any word problem.

#strategy-box[
  *Word Problem Framework:*

  1. *Read the entire problem first:* Resist the urge to start calculating immediately. Read through the problem completely to understand the overall situation.

  2. *Identify what you're solving for:* What is the question actually asking? This will typically become your variable or what you express your answer in terms of.

  3. *Assign variables to unknowns:* Choose clear, meaningful variable names. If the problem asks for "John's age," you might use $j$ for John's current age.

  4. *Translate relationships into equations:* Convert each sentence or phrase that describes a mathematical relationship into an equation or expression.

  5. *Solve the equation(s):* Apply appropriate algebraic techniques.

  6. *Check: Does your answer make sense?* Verify that your answer is reasonable in context. Negative ages, fractional people, or speeds faster than light should prompt you to recheck your work.
]

Let us apply this framework to a straightforward example to see how each step works in practice.

#example-box(breakable: true)[
  *"Three more than twice a number is 17. What is the number?"*

  *Step 1: Read and understand.* We have some unknown number, and when we double it and add 3, we get 17.

  *Step 2: Identify what we're solving for.* The unknown number.

  *Step 3: Assign a variable.* Let $x =$ the unknown number.

  *Step 4: Translate to an equation*
  - "twice a number" $arrow.r 2x$
  - "three more than twice a number" $arrow.r 2x + 3$
  - "is 17" $arrow.r = 17$

  Complete equation: $2x + 3 = 17$

  *Step 5: Solve*
  $ 2x + 3 = 17 $
  $ 2x = 14 $
  $ x = 7 $

  *Step 6: Check.* Twice 7 is 14, and 3 more than 14 is 17. #sym.checkmark
]

#tip-box[
  *Reading Strategically:* On the GMAT, you often don't need to understand every detail of a word problem, you need to understand the *mathematical relationships*. Train yourself to identify:
  - What quantities are given?
  - What quantity is unknown?
  - What relationship connects them?

  Everything else is often just context or distraction.
]

#pagebreak()

= Rate Problems

Rate problems are among the most common word problems on the GMAT. They describe situations involving motion, speed, distance, and time, scenarios we encounter in everyday life when driving, traveling, or planning journeys. The key to mastering rate problems lies in understanding the fundamental relationship between distance, rate (speed), and time, and knowing how to apply this relationship in various contexts.

== The Rate Formula

The foundation of all rate problems is a single, elegant equation that connects three quantities: distance, rate, and time. This relationship is intuitive when you think about it: if you travel at a constant speed, the distance you cover depends on how fast you're going and how long you travel.

#info-box[
  *Fundamental Rate Equation:*

  $ "Distance" = "Rate" times "Time" $

  Using variables: $D = R times T$

  This equation can be rearranged to solve for any of the three quantities:
  - $D = R times T$ #h(1em) (Distance equals Rate times Time)
  - $R = D div T$ #h(1em) (Rate equals Distance divided by Time)
  - $T = D div R$ #h(1em) (Time equals Distance divided by Rate)
]

*Why does this formula work?* Consider what "rate" or "speed" actually means. When we say a car travels at 60 miles per hour, we mean it covers 60 miles in one hour. The word "per" signals division: miles *per* hour means miles *divided by* hours. So rate is defined as $R = D div T$, and rearranging gives us $D = R times T$.

The triangle diagram below provides a visual tool for remembering these relationships. To find any quantity, cover it with your finger: the remaining two quantities show how to calculate it.

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
    content((3.5, h * 0.35), text(size: 9pt)[Cover $R$: $R = D div T$])
    content((3.5, h * 0.0), text(size: 9pt)[Cover $T$: $T = D div R$])
  })
]

#tip-box[
  *Unit Consistency:* Always ensure your units are compatible. If speed is in miles per hour, time must be in hours and distance in miles. If you're given time in minutes, convert to hours (divide by 60) before applying the formula.
]

== Average Speed

One of the most common traps in rate problems involves calculating average speed. Many students instinctively want to average the speeds, but this approach is almost always wrong.

#warning-box[
  *Average Speed Trap:*

  Average speed is *NOT* the arithmetic average of speeds!

  $ "Average Speed" = "Total Distance" div "Total Time" $

  You cannot simply add speeds and divide by two unless the *time* spent at each speed is equal (which is rarely the case).
]

*Why doesn't averaging speeds work?* The key insight is that speed and time have an inverse relationship. When you travel faster, you spend less time on that portion of the journey. When you travel slower, you spend more time. Since you spend more time at the slower speed, it has a greater influence on your overall average.

#example-box(breakable: true)[
  *A car travels 60 miles at 30 mph, then 60 miles at 60 mph. What is the average speed for the entire trip?*

  *Wrong approach:* Average the two speeds.
  $ (30 + 60) div 2 = 45 "mph" $ #text(fill: red)[#sym.crossmark]

  *Correct approach:* Use total distance divided by total time.

  First, find the time for each leg:
  - Time for first 60 miles at 30 mph: $T_1 = 60 div 30 = 2$ hours
  - Time for second 60 miles at 60 mph: $T_2 = 60 div 60 = 1$ hour

  Now calculate the average:
  - Total distance: $60 + 60 = 120$ miles
  - Total time: $2 + 1 = 3$ hours
  - Average speed: $120 div 3 = 40$ mph #sym.checkmark

  Notice that 40 mph is closer to 30 mph than to 60 mph. This makes sense because the car spent *twice as long* traveling at 30 mph as it did at 60 mph.
]

#info-box[
  *Harmonic Mean Shortcut:* When equal *distances* are traveled at two different speeds $v_1$ and $v_2$, the average speed is the *harmonic mean*:

  $ "Average Speed" = frac(2 v_1 v_2, v_1 + v_2) $

  For the example above: $frac(2 times 30 times 60, 30 + 60) = frac(3600, 90) = 40$ mph
]

== Relative Speed

When two objects are moving, their *relative speed* describes how quickly the distance between them is changing. This concept is essential for problems involving pursuit, meeting points, or objects moving toward or away from each other.

#info-box[
  *Relative Speed Rules:*

  - *Objects moving in OPPOSITE directions* (toward or away from each other):
    $ "Relative Speed" = S_1 + S_2 $
    The distance between them changes at the sum of their speeds.

  - *Objects moving in the SAME direction:*
    $ "Relative Speed" = |S_1 - S_2| $
    The distance between them changes at the difference of their speeds.
]

*Intuition for relative speed:* Imagine you're in a car traveling at 60 mph, and another car passes you going 70 mph in the same direction. From your perspective, that car is pulling away at only 10 mph, the difference in speeds. But if a car is coming toward you at 70 mph while you're going 60 mph, you're approaching each other at 130 mph, the sum of speeds.

#example-box(breakable: true)[
  *Two cars are 200 miles apart. One travels at 40 mph, the other at 60 mph. How long until they meet if traveling toward each other?*

  *Method 1: Combined Speed (Quick Method)*

  Since the cars are moving toward each other, the distance between them shrinks at their combined speed:
  $ "Combined speed" = 40 + 60 = 100 "mph" $

  The time to close the 200-mile gap:
  $ T = D div R = 200 div 100 = 2 "hours" $

  *Method 2: Position-Time Equations (Algebraic Method)*

  Set up a coordinate system with Car A starting at position $s = 0$ at time $t = 0$.

  Write position equations for each car:
  - Car A (moving right at 40 mph): $s_A (t) = 40t$
  - Car B (starting at 200, moving left at 60 mph): $s_B (t) = 200 - 60t$

  The cars meet when their positions are equal:
  $ s_A (t) = s_B (t) $
  $ 40t = 200 - 60t $
  $ 100t = 200 $
  $ t = 2 "hours" $

  The meeting position: $s_A (2) = 40 times 2 = 80$ miles from Car A's starting point.
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

  The graph above is a powerful visualization tool for rate problems. Here's how to read it:

  - *Slope = Speed:* Car A's line has positive slope ($+40$), indicating movement in the positive direction at 40 mph. Car B's line has negative slope ($-60$), indicating movement in the negative direction at 60 mph.

  - *Intersection = Meeting Point:* The point where the two lines cross tells us both *when* (read the $t$-coordinate) and *where* (read the $s$-coordinate) the cars meet.

  - *Distance Traveled:* The vertical change from each car's starting position to the meeting point shows how far each traveled. Car A went from 0 to 80 (traveled 80 miles), while Car B went from 200 to 80 (traveled 120 miles). Note that the ratio $80:120 = 2:3$ matches the inverse of their speed ratio: the faster car covers more ground in the same time.
]

#strategy-box[
  *Rate Problem Strategy Summary:*

  1. *Identify the type:* Is this a simple rate problem, average speed problem, or relative speed problem?

  2. *Draw a diagram:* Sketch the situation, marking starting positions, directions, and speeds.

  3. *Choose your method:*
     - For simple problems: Use $D = R times T$ directly
     - For average speed: Calculate total distance and total time separately
     - For meeting/pursuit: Use relative speed or set up position equations

  4. *Check units:* Ensure all quantities use compatible units before calculating.

  5. *Verify reasonableness:* Does your answer make physical sense?
]

#pagebreak()

= Work Problems

Work problems are close cousins of rate problems, but instead of distance, we're measuring how much of a task gets completed. These problems typically involve people or machines working together (or separately) to complete a job. The key insight is that *work rates add, but completion times do not*.

This distinction trips up many students. If Alice can paint a room in 3 hours and Bob can paint it in 6 hours, they won't finish in $3 + 6 = 9$ hours working together, that would mean they're slower together than Alice alone! Instead, we need to think in terms of rates: how much of the job each person completes per unit of time.

== Understanding Work Rate

The fundamental concept in work problems is the *work rate*, the fraction of a job completed per unit of time. If a worker can complete an entire job in $T$ hours, then in one hour they complete $1 div T$ of the job. This is their hourly rate.

#info-box[
  *Work Rate Concept:*

  If someone can complete a job in $T$ hours, their work rate is:

  $ "Rate" = frac(1, T) " of the job per hour" $

  The relationship between work, rate, and time mirrors the distance formula:

  $ "Work" = "Rate" times "Time" $

  For a complete job, Work $= 1$ (the whole job), so:
  $ 1 = "Rate" times "Time" $
]

*Why does this make sense?* Think of the "job" as one unit of work. If a painter can finish the job in 4 hours, then each hour she completes $1/4$ of the job. After 4 hours, she's completed $1/4 + 1/4 + 1/4 + 1/4 = 4/4 = 1$ whole job.

== Combined Work: Adding Rates

When multiple workers or machines work together on the same job, their rates add. This is the key principle that makes work problems solvable.

#info-box[
  *Combined Work Formula:*

  When workers with rates $R_1$ and $R_2$ work together:

  $ "Combined Rate" = R_1 + R_2 = 1/T_1 + 1/T_2 $

  The time to complete the job together:

  $ T_"combined" = frac(1, R_1 + R_2) = frac(1, 1/T_1 + 1/T_2) $

  This can also be written as:
  $ frac(1, T_1) + frac(1, T_2) = frac(1, T_"combined") $
]

#example-box(breakable: true)[
  *Machine A completes a job in 6 hours. Machine B completes the same job in 4 hours. How long to complete the job together?*

  *Step 1: Find individual rates*
  - Rate of Machine A $= 1/6$ job per hour
  - Rate of Machine B $= 1/4$ job per hour

  *Step 2: Add the rates*
  $ "Combined rate" = 1/6 + 1/4 $

  To add these fractions, find a common denominator (12):
  $ "Combined rate" = 2/12 + 3/12 = 5/12 " job per hour" $

  *Step 3: Find the time*
  $ T = frac(1, "Rate") = frac(1, 5\/12) = 12/5 = 2.4 " hours" $

  This is 2 hours and 24 minutes.

  *Verification:* Working for 2.4 hours, Machine A completes $1/6 times 2.4 = 0.4$ of the job, and Machine B completes $1/4 times 2.4 = 0.6$ of the job. Together: $0.4 + 0.6 = 1$ complete job. #sym.checkmark
]

#tip-box[
  *Shortcut Formula:* For two workers with times $T_1$ and $T_2$, the combined time is:

  $ T_"combined" = frac(T_1 times T_2, T_1 + T_2) $

  For the example above: $frac(6 times 4, 6 + 4) = frac(24, 10) = 2.4$ hours

  This is the same harmonic mean pattern we saw with average speed!
]

== Work with Multiple Workers

Some problems involve groups of identical workers, where the total amount of work is measured in "worker-hours" or "worker-days." The key insight is that *total work = number of workers $times$ time*.

#info-box[
  *Worker-Time Relationship:*

  For identical workers doing the same job:
  $ "Total Work" = "Number of Workers" times "Time" $

  This quantity (total work) remains constant regardless of how many workers you have; only the time changes.
]

#example-box(breakable: true)[
  *10 workers can complete a project in 12 days. How many days would 15 workers need?*

  *Step 1: Calculate total work required*
  $ "Total work" = 10 " workers" times 12 " days" = 120 " worker-days" $

  *Step 2: Find time for 15 workers*
  $ "Time" = frac("Total work", "Number of workers") = frac(120, 15) = 8 " days" $

  *Alternative approach using inverse proportionality:*

  Workers and time are inversely proportional (more workers = less time), so:
  $ frac(W_1, W_2) = frac(T_2, T_1) $
  $ frac(10, 15) = frac(T_2, 12) $
  $ T_2 = 12 times frac(10, 15) = 8 " days" $
]

== Opposing Work: Workers Who Undo Progress

Some work problems involve entities that work against each other, for example a pipe filling a tank while another pipe drains it.

#example-box(breakable: true)[
  *Pipe A can fill a tank in 6 hours. Pipe B can drain the full tank in 9 hours. If both pipes are open, how long to fill the empty tank?*

  *Step 1: Determine rates (with signs)*
  - Pipe A fills at rate $+1/6$ tank per hour
  - Pipe B drains at rate $-1/9$ tank per hour (negative because it removes water)

  *Step 2: Find net rate*
  $ "Net rate" = 1/6 - 1/9 = 3/18 - 2/18 = 1/18 " tank per hour" $

  *Step 3: Find time to fill*
  $ T = frac(1, 1\/18) = 18 " hours" $
]

#warning-box[
  *Common Work Problem Mistakes:*

  - *Adding times instead of rates:* If A takes 3 hours and B takes 6 hours, together they do NOT take 9 hours!

  - *Forgetting to invert:* After finding the combined rate, remember to take its reciprocal to get time.

  - *Sign errors in opposing work:* When one worker undoes another's progress, subtract rates.
]

#strategy-box[
  *Work Problem Strategy:*

  1. *Convert times to rates:* Rate $= 1 div "Time"$

  2. *Add (or subtract) rates:* Combine rates based on whether workers help or oppose each other

  3. *Convert back to time:* Time $= 1 div "Combined Rate"$

  4. *For worker-groups:* Use Total Work $=$ Workers $times$ Time
]

#pagebreak()

= Mixture Problems

Mixture problems involve combining two or more substances (solutions, alloys, or products) to create a final mixture with specific properties. These problems appear frequently on the GMAT and follow a consistent logical structure based on a simple but powerful principle: *what goes in must equal what comes out*.

The key insight is that when you mix substances, the total amount of any component (such as acid in a solution, or value in a price mixture) is conserved. If you pour 10 grams of salt into a container, and then add 5 more grams, you have exactly 15 grams of salt, regardless of how much water is involved. This conservation principle is the foundation of all mixture problems.

== The Mixture Principle

Every mixture problem is built on the same fundamental equation: the amount of the "key component" before mixing equals the amount after mixing.

#info-box[
  *The Conservation Equation:*

  $ "Amount in Solution 1" + "Amount in Solution 2" = "Amount in Final Mixture" $

  For concentration problems, "amount" means the actual quantity of the substance (not the percentage):

  $ C_1 times V_1 + C_2 times V_2 = C_f times V_f $

  Where:
  - $C_1, C_2$ = concentrations of the original solutions (as decimals)
  - $V_1, V_2$ = volumes of the original solutions
  - $C_f$ = concentration of the final mixture
  - $V_f = V_1 + V_2$ = total volume of the final mixture
]

*Why does this work?* Consider a concrete example: if you have 100 mL of a 30% acid solution, you have $0.30 times 100 = 30$ mL of actual acid. If you add this to 200 mL of a 60% acid solution (which contains $0.60 times 200 = 120$ mL of acid), your final mixture contains $30 + 120 = 150$ mL of acid in $100 + 200 = 300$ mL total, a $150 div 300 = 50%$ solution.

== Concentration Mixtures

Concentration mixture problems typically ask you to find one of four quantities: the amount of solution 1, the amount of solution 2, the concentration of one solution, or the final concentration. The approach is always the same: set up the conservation equation and solve.

#example-box(breakable: true)[
  *How many liters of 20% acid solution must be mixed with 30 liters of 50% acid solution to create a 30% acid solution?*

  *Step 1: Identify what we know and what we need*
  - Solution 1: 20% acid, unknown volume (call it $x$)
  - Solution 2: 50% acid, 30 liters
  - Final mixture: 30% acid, total volume $(x + 30)$ liters

  *Step 2: Calculate the amount of acid in each*
  - Acid from 20% solution: $0.20 times x = 0.20x$ liters
  - Acid from 50% solution: $0.50 times 30 = 15$ liters
  - Acid in final mixture: $0.30 times (x + 30)$ liters

  *Step 3: Set up and solve the conservation equation*
  $ 0.20x + 15 = 0.30(x + 30) $
  $ 0.20x + 15 = 0.30x + 9 $
  $ 15 - 9 = 0.30x - 0.20x $
  $ 6 = 0.10x $
  $ x = 60 " liters" $

  *Step 4: Verify*
  - Acid from 60 L of 20% solution: $0.20 times 60 = 12$ L
  - Acid from 30 L of 50% solution: $0.50 times 30 = 15$ L
  - Total acid: $12 + 15 = 27$ L in $60 + 30 = 90$ L total
  - Final concentration: $27 div 90 = 0.30 = 30%$ #sym.checkmark
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

#tip-box[
  *Intuition Check:* The final concentration (30%) is between the two original concentrations (20% and 50%). This must always be true: you cannot create a mixture stronger than your strongest component or weaker than your weakest. If your answer violates this principle, you've made an error.

  Also notice: 30% is closer to 20% than to 50%, which means we need *more* of the 20% solution than the 50% solution. Indeed, we need 60 L vs 30 L, twice as much of the weaker solution.
]

== Price Mixtures

Price mixture problems follow the exact same logic as concentration problems, but instead of tracking the amount of a substance, we track *total value*. The principle remains: total value before mixing equals total value after mixing.

#info-box[
  *Price Mixture Equation:*

  $ ("Price"_1 times "Quantity"_1) + ("Price"_2 times "Quantity"_2) = "Price"_f times "Quantity"_"total" $

  The "amount" being conserved is monetary value, not a physical substance.
]

#example-box(breakable: true)[
  *A store mixes coffee at \$8/lb with coffee at \$12/lb to create a 20 lb blend worth \$9.50/lb. How much of each type of coffee is used?*

  *Step 1: Define variables*
  - Let $x$ = pounds of \$8 coffee
  - Then $(20 - x)$ = pounds of \$12 coffee (since total is 20 lb)

  *Step 2: Calculate values*
  - Value of \$8 coffee: $8x$ dollars
  - Value of \$12 coffee: $12(20 - x)$ dollars
  - Value of final blend: $9.50 times 20 = 190$ dollars

  *Step 3: Set up and solve*
  $ 8x + 12(20 - x) = 190 $
  $ 8x + 240 - 12x = 190 $
  $ -4x = -50 $
  $ x = 12.5 " lb of \\$8 coffee" $
  $ 20 - 12.5 = 7.5 " lb of \\$12 coffee" $

  *Step 4: Verify*
  - Value: $8(12.5) + 12(7.5) = 100 + 90 = 190$ dollars
  - Per pound: $190 div 20 = 9.50$ dollars/lb #sym.checkmark
]

#warning-box[
  *Common Mixture Problem Mistakes:*

  - *Using percentages directly:* Remember that 30% means 0.30 in calculations. Don't write $30 times x$ when you mean $0.30 times x$.

  - *Forgetting the total volume changes:* When mixing $x$ liters with 30 liters, the total is $(x + 30)$ liters, not just $x$ or 30.

  - *Setting up the wrong equation:* The equation must balance the *amount of the key component*, not the percentages or volumes directly.
]

#strategy-box[
  *Mixture Problem Strategy:*

  1. *Identify the "key component":* What quantity is being conserved? (acid, salt, value, etc.)

  2. *Express amounts in each solution:* Amount $=$ Concentration $times$ Volume (or Price $times$ Quantity)

  3. *Write the conservation equation:* Amount in + Amount in $=$ Amount in final

  4. *Solve for the unknown*

  5. *Check reasonableness:* Is the final concentration/price between the original values?
]

#pagebreak()

= Age Problems

Age problems describe relationships between people's ages at different points in time: now, in the past, or in the future. While these problems can seem confusing at first (with ages changing and multiple time periods to track), they follow a simple underlying structure once you understand the key insight: *everyone ages at the same rate*.

This means that if John is currently 10 years older than Mary, he will *always* be 10 years older than Mary, whether we look at their ages 5 years ago, right now, or 20 years in the future. The age *difference* between two people never changes, only their individual ages change as time passes.

== The Time-Age Relationship

The foundation of age problems is understanding how ages relate across different time periods:

#info-box[
  *Age Across Time:*

  If a person's *current* age is $x$, then:
  - Their age $n$ years *ago* was: $x - n$
  - Their age $n$ years *from now* will be: $x + n$

  Time moves the same for everyone, so if we're looking at "5 years ago," we subtract 5 from *everyone's* current age.
]

#align(center)[
  #cetz.canvas({
    import cetz.draw: *

    // Timeline
    line((-5, 0), (5, 0), stroke: 1.5pt, mark: (end: ">"))

    // Time markers
    line((-3, -0.2), (-3, 0.2), stroke: 1.5pt)
    line((0, -0.2), (0, 0.2), stroke: 1.5pt)
    line((3, -0.2), (3, 0.2), stroke: 1.5pt)

    // Labels below
    content((-3, -0.6), text(size: 9pt)[Past])
    content((0, -0.6), text(size: 9pt, weight: "bold")[Now])
    content((3, -0.6), text(size: 9pt)[Future])

    // Time descriptions
    content((-3, -1.1), text(size: 8pt, fill: gray)[$n$ years ago])
    content((3, -1.1), text(size: 8pt, fill: gray)[$n$ years from now])

    // Age expressions above
    content((-3, 0.8), text(size: 9pt, fill: blue)[$x - n$])
    content((0, 0.8), text(size: 9pt, fill: blue, weight: "bold")[$x$])
    content((3, 0.8), text(size: 9pt, fill: blue)[$x + n$])

    // Arrows showing time passage
    line((-2.5, 0.5), (-0.5, 0.5), stroke: (paint: gray, dash: "dashed"), mark: (end: ">"))
    line((0.5, 0.5), (2.5, 0.5), stroke: (paint: gray, dash: "dashed"), mark: (end: ">"))

    content((-1.5, 0.9), text(size: 7pt, fill: gray)[$+n$])
    content((1.5, 0.9), text(size: 7pt, fill: gray)[$+n$])
  })
]

== Setting Up Age Problems

The key to solving age problems is to establish a clear reference point, usually the *present*, and express all ages in terms of that reference.

#strategy-box[
  *Age Problem Strategy:*

  1. *Define variables for CURRENT ages:* Always start with the present. Choose one person's current age as your primary variable.

  2. *Express other current ages:* Use the given relationships to write other people's current ages in terms of your variable.

  3. *Write expressions for past/future ages:* Add or subtract the appropriate number of years from each current age.

  4. *Translate the time-shifted condition into an equation:* The problem will give you a relationship that holds at some other point in time.

  5. *Solve and verify:* Check that all ages are positive and that the relationships make sense.
]

#example-box(breakable: true)[
  *John is now 3 times as old as Mary. In 10 years, John will be twice as old as Mary. How old is John now?*

  *Step 1: Define variables for current ages*

  Let Mary's current age $= m$

  *Step 2: Express other current ages using given relationships*

  "John is now 3 times as old as Mary" $arrow.r$ John's current age $= 3m$

  *Step 3: Write expressions for future ages (10 years from now)*
  - Mary's age in 10 years: $m + 10$
  - John's age in 10 years: $3m + 10$

  *Step 4: Translate the future condition into an equation*

  "In 10 years, John will be twice as old as Mary":
  $ 3m + 10 = 2(m + 10) $

  *Step 5: Solve*
  $ 3m + 10 = 2m + 20 $
  $ 3m - 2m = 20 - 10 $
  $ m = 10 $

  Mary is currently 10 years old, so John is $3 times 10 = 30$ years old.

  *Verification:*
  - Now: John is 30, Mary is 10. Is John 3 times Mary's age? $30 = 3 times 10$ #sym.checkmark
  - In 10 years: John is 40, Mary is 20. Is John twice Mary's age? $40 = 2 times 20$ #sym.checkmark
]

== Age Problems with Past Time

Problems can also reference the past. The same principles apply: just subtract years instead of adding them.

#example-box(breakable: true)[
  *Five years ago, a father was 4 times as old as his son. Now, the father is 3 times as old as his son. How old is the son now?*

  *Step 1: Define current ages*

  Let the son's current age $= s$

  "The father is 3 times as old as his son (now)" $arrow.r$ Father's current age $= 3s$

  *Step 2: Write expressions for past ages (5 years ago)*
  - Son's age 5 years ago: $s - 5$
  - Father's age 5 years ago: $3s - 5$

  *Step 3: Translate the past condition*

  "Five years ago, the father was 4 times as old as his son":
  $ 3s - 5 = 4(s - 5) $

  *Step 4: Solve*
  $ 3s - 5 = 4s - 20 $
  $ -5 + 20 = 4s - 3s $
  $ 15 = s $

  The son is currently *15 years old* (and the father is $3 times 15 = 45$).

  *Verification:*
  - Now: Father is 45, son is 15. Ratio: $45 div 15 = 3$ #sym.checkmark
  - 5 years ago: Father was 40, son was 10. Ratio: $40 div 10 = 4$ #sym.checkmark
]

#warning-box[
  *Common Age Problem Traps:*

  - *Confusing past and future:* "Years ago" means *subtract* from current age, "years from now" means *add*.

  - *Setting up the wrong equation:* Make sure you're comparing ages at the *same* point in time. If the problem says "in 5 years," both ages in your equation should be the "in 5 years" versions.

  - *Impossible ages:* If your solution gives a negative age, you've made an error. Ages must be non-negative, and past ages must be less than current ages.

  - *Forgetting to answer the right question:* The problem might ask for one person's age, but your variable represents another person. Make sure to calculate what's actually being asked.
]

#tip-box[
  *The Age Difference Insight:*

  The difference between two people's ages *never changes*. If John is currently 20 years older than Mary, he was 20 years older than her when they were children, and he'll be 20 years older when they're elderly.

  This can be useful for checking your work: calculate the age difference at each time point in your solution, it should be the same.
]

#pagebreak()

= Other Word Problem Types

Beyond the core categories we've covered, the GMAT includes several other word problem types that appear with some regularity. While these don't warrant their own dedicated chapters, understanding their basic structures will help you recognize and solve them quickly.

== Profit and Revenue

Business-related word problems deal with costs, revenues, and profits. These problems are straightforward once you understand the relationships between the key quantities.

#info-box[
  *Key Formulas:*

  - *Revenue* $=$ Price $times$ Quantity sold
  - *Cost* $=$ Fixed costs $+$ Variable costs
  - *Profit* $=$ Revenue $-$ Cost
  - *Profit Margin* $=$ Profit $div$ Revenue (expressed as a percentage)
  - *Markup* $=$ Selling Price $-$ Cost Price
  - *Markup Percentage* $=$ Markup $div$ Cost Price $times$ 100%
]

#example-box(breakable: true)[
  *A store buys items at \$40 each and sells them at \$60 each. If the store sells 150 items and has fixed costs of \$1,500, what is the profit?*

  *Step 1: Calculate Revenue*
  $ "Revenue" = 60 times 150 = 9000 " dollars" $

  *Step 2: Calculate Total Cost*
  - Variable cost: $40 times 150 = 6000$ dollars
  - Fixed costs: $1500$ dollars
  - Total cost: $6000 + 1500 = 7500$ dollars

  *Step 3: Calculate Profit*
  $ "Profit" = 9000 - 7500 = 1500 " dollars" $
]

#warning-box[
  *Profit vs. Revenue:* Don't confuse these terms. Revenue is the total money received from sales; profit is what remains after subtracting costs. A business can have high revenue but low (or negative) profit if costs are high.
]

== Sequences and Patterns

Sequence problems involve sets of numbers that follow a specific pattern, most commonly consecutive integers or arithmetic sequences.

#info-box[
  *Consecutive Integers:*

  - *Consecutive integers:* $n, n+1, n+2, n+3, ...$
  - *Consecutive even integers:* $n, n+2, n+4, n+6, ...$ (where $n$ is even)
  - *Consecutive odd integers:* $n, n+2, n+4, n+6, ...$ (where $n$ is odd)

  *Key Insight:* For any set of consecutive integers, the *average equals the middle value* (or the average of the two middle values if there's an even count).
]

#example-box(breakable: true)[
  *The sum of 5 consecutive integers is 85. What is the largest integer?*

  *Algebraic Method:*

  Let the integers be: $n, n+1, n+2, n+3, n+4$

  $ n + (n+1) + (n+2) + (n+3) + (n+4) = 85 $
  $ 5n + 10 = 85 $
  $ 5n = 75 $
  $ n = 15 $

  The integers are 15, 16, 17, 18, 19, so the largest is *19*.

  *Shortcut Method:*

  For 5 consecutive integers, the average equals the middle (3rd) number:
  $ "Average" = 85 div 5 = 17 $

  So the middle number is 17, and the integers are 15, 16, *17*, 18, 19.
]

#tip-box[
  *The Shortcut Explained:* In any arithmetic sequence (including consecutive integers), the sum equals the average times the count, and the average equals the middle value. So:

  $ "Sum" = "Average" times "Count" = "Middle Value" times "Count" $

  This means you can find the middle value directly: Middle $=$ Sum $div$ Count.
]

== Interest Problems

Interest problems involve money growing over time. The GMAT tests both simple and compound interest.

#info-box[
  *Simple Interest:*

  $ I = P times r times t $

  Where:
  - $I$ = Interest earned
  - $P$ = Principal (initial amount)
  - $r$ = Annual interest rate (as a decimal)
  - $t$ = Time (in years)

  The total amount after $t$ years: $A = P + I = P(1 + r t)$

  *Compound Interest:*

  $ A = P(1 + r)^t $

  Where $A$ is the final amount after $t$ years of annual compounding.

  For compounding $n$ times per year: $A = P(1 + r/n)^(n t)$
]

*The difference between simple and compound interest:* With simple interest, you earn interest only on the original principal. With compound interest, you earn interest on both the principal and previously accumulated interest, your money grows faster because "interest earns interest."

#example-box(breakable: true)[
  *\$1,000 is invested at 5% annual interest. What is the difference between the amount after 2 years with compound interest versus simple interest?*

  *Simple Interest:*
  $ I = 1000 times 0.05 times 2 = 100 " dollars" $
  $ A_"simple" = 1000 + 100 = 1100 " dollars" $

  *Compound Interest:*
  $ A_"compound" = 1000 times (1 + 0.05)^2 = 1000 times 1.1025 = 1102.50 " dollars" $

  *Difference:* $1102.50 - 1100 = 2.50$ dollars

  The extra \$2.50 comes from earning interest on the first year's interest (\$50 $times$ 0.05 = \$2.50).
]

== Digit Problems

Digit problems involve the place value structure of numbers. They require understanding how a number's value relates to its individual digits.

#info-box[
  *Place Value Representation:*

  A two-digit number with tens digit $t$ and units digit $u$ has value:
  $ 10t + u $

  A three-digit number with digits $h$, $t$, $u$ (hundreds, tens, units) has value:
  $ 100h + 10t + u $

  *Reversing a two-digit number:* If the original is $10t + u$, the reversed number is $10u + t$.
]

#example-box(breakable: true)[
  *A two-digit number is 7 times the sum of its digits. If 27 is subtracted from the number, the digits are reversed. Find the number.*

  Let the tens digit $= t$ and units digit $= u$.

  The number's value is $10t + u$.

  *Condition 1:* "The number is 7 times the sum of its digits"
  $ 10t + u = 7(t + u) $
  $ 10t + u = 7t + 7u $
  $ 3t = 6u $
  $ t = 2u $

  *Condition 2:* "If 27 is subtracted, the digits are reversed"
  $ (10t + u) - 27 = 10u + t $
  $ 9t - 9u = 27 $
  $ t - u = 3 $

  *Solve the system:* Substitute $t = 2u$ into $t - u = 3$:
  $ 2u - u = 3 $
  $ u = 3 $, so $t = 6$

  The number is *63*.

  *Verify:* Sum of digits $= 6 + 3 = 9$, and $7 times 9 = 63$ #sym.checkmark. Also, $63 - 27 = 36$ (reversed) #sym.checkmark.
]

#pagebreak()

= GMAT Strategies for Word Problems

On the GMAT, time is precious. While setting up and solving equations algebraically is always a valid approach, it's not always the fastest. Skilled test-takers recognize when alternative strategies, like backsolving or picking numbers, can save valuable time. This section covers strategic approaches that complement the algebraic methods we've discussed throughout this lesson.

== Strategy Selection

The first step in any word problem is deciding *how* to solve it. Three main approaches are available, and choosing the right one can mean the difference between a 30-second solution and a 3-minute struggle.

#strategy-box[
  *When to Use Each Approach:*

  *Algebra (Setting Up Equations):*
  - When relationships are complex or involve multiple unknowns
  - When you need to find an expression (not a specific number)
  - When the problem involves variables in the answer choices
  - Default approach when unsure

  *Backsolving (Testing Answer Choices):*
  - When answer choices are specific, "nice" numbers
  - When the problem asks for a single unknown value
  - When setting up the equation seems complicated
  - Start with choice (B) or (C), the middle values

  *Number Picking (Plugging In Values):*
  - When answer choices contain variables or percentages
  - When the problem says "what fraction" or "what percent"
  - When relationships are given but no specific values
  - Pick easy numbers: 100 for percentages, small integers for variables
]

== Backsolving: Working Backwards

Backsolving means testing the answer choices to see which one satisfies the problem conditions. This is often faster than setting up equations, especially when the algebraic setup would be messy.

#example-box(breakable: true)[
  *A number is doubled, then 5 is added. The result is 3 times the original number minus 7. What is the original number?*

  *Answer choices:* (A) 8 #h(1em) (B) 10 #h(1em) (C) 12 #h(1em) (D) 14 #h(1em) (E) 16

  *Backsolving approach:* Start with (C) = 12

  - Double it: $12 times 2 = 24$
  - Add 5: $24 + 5 = 29$
  - Check: Is this equal to $3 times 12 - 7 = 36 - 7 = 29$? *Yes!* #sym.checkmark

  The answer is (C) 12, found in seconds without setting up an equation.

  *For comparison, the algebraic approach:*
  $ 2x + 5 = 3x - 7 $
  $ 5 + 7 = 3x - 2x $
  $ x = 12 $
]

#tip-box[
  *Backsolving Strategy:*

  - Start with choice (B) or (C): if it's too big, try smaller; if too small, try larger
  - Eliminate as you go: if (C) is too small, eliminate (A) and (B) as well
  - Works best when calculations are straightforward
]

== Number Picking: Making Abstract Problems Concrete

When a problem involves variables or percentages without specific values, picking concrete numbers can make the problem much easier to work with.

#example-box(breakable: true)[
  *If a price is increased by 20% and then decreased by 20%, the final price is what percent of the original price?*

  *Number Picking approach:* Let the original price = \$100 (easy number for percentages)

  - After 20% increase: $100 + 20 = 120$ dollars
  - After 20% decrease: $120 - 0.20 times 120 = 120 - 24 = 96$ dollars
  - Final as percent of original: $96/100 = 96%$

  The answer is *96%* of the original price.

  *Why this works:* The specific starting value doesn't matter, the percentage relationship is the same regardless of what number we pick. By using 100, we make the arithmetic trivial.
]

#warning-box[
  *Number Picking Pitfall:*

  When picking numbers, avoid:
  - 0 or 1 (can make different expressions look equal)
  - Numbers that appear in the problem
  - Numbers that make the problem trivial

  Good picks: 2, 3, 5, 10, 100
]

== Common Word Problem Shortcuts

Beyond strategic approaches, certain problem types have shortcuts that can save significant time. These patterns appear frequently enough that memorizing them pays dividends.

#tip-box[
  *Time-Saving Patterns:*

  *Rate Problems:*
  - Equal distances at speeds $v_1$ and $v_2$: Average speed $= frac(2 v_1 v_2, v_1 + v_2)$
  - Objects moving toward each other: Add speeds
  - Objects moving same direction: Subtract speeds

  *Work Problems:*
  - Two workers with times $T_1$ and $T_2$: Combined time $= frac(T_1 times T_2, T_1 + T_2)$

  *Sequences:*
  - Sum of consecutive integers: Average $=$ Middle value
  - Count of integers from $a$ to $b$: $b - a + 1$

  *Mixtures:*
  - Final concentration is always between the original concentrations
  - Closer to the concentration you use more of
]

== Recognizing Problem Types Quickly

Speed on the GMAT comes from rapid pattern recognition. Train yourself to identify problem types from key phrases:

#info-box[
  *Problem Type Recognition:*

  - "miles per hour," "travels," "speed" $arrow.r$ *Rate problem*
  - "completes a job in," "working together" $arrow.r$ *Work problem*
  - "% solution," "mixture," "blend" $arrow.r$ *Mixture problem*
  - "years ago," "times as old" $arrow.r$ *Age problem*
  - "consecutive integers," "sum of numbers" $arrow.r$ *Sequence problem*
  - "profit," "revenue," "sells for" $arrow.r$ *Business problem*
]

#pagebreak()

= Teaching Notes for Tutors

== Lesson A Focus (Introduction)

*Primary Learning Objectives:*
1. Translation skills: converting English phrases to mathematical expressions
2. Rate problems: mastering $D = R times T$ and its rearrangements
3. Basic work problems: understanding that rates add, not times
4. Building confidence with the word problem framework

*Teaching Approach:*
- Start with simple translation exercises before full word problems
- Use diagrams extensively for rate problems
- Have students verbalize their thought process

*Question Time:* 5-6 questions covering rate and basic work problems

== Lesson B Focus (Deep Dive)

*Primary Learning Objectives:*
1. Mixture problems: both concentration and price varieties
2. Age problems: setting up equations across time periods
3. Complex work scenarios: opposing work, multiple workers
4. Strategy selection: when to use backsolving vs. algebra

*Review Focus (from Training #1):*
- Translation errors (especially "less than" order)
- Equation setup mistakes
- Average speed trap (using arithmetic mean instead of total distance/total time)

*Teaching Approach:*
- Emphasize the conservation principle in mixture problems
- Use timeline diagrams for age problems
- Practice strategy selection with timed drills

== Lesson C Focus (Assessment Prep)

*Primary Learning Objectives:*
1. Rapid problem type recognition
2. Efficient strategy selection
3. Time management across mixed problem sets

*Review Focus (from Training #2):*
- Address any recurring error patterns
- Reinforce shortcuts and quick-recognition techniques
- Build test-day confidence

*Assessment:* 20 questions, 40 minutes (average 2 minutes per question)

== Common Student Difficulties

The following errors appear repeatedly. Watch for these patterns and address them proactively:

1. *Translating "less than" backwards:* Students write "5 less than $x$" as $5 - x$ instead of $x - 5$

2. *Averaging speeds arithmetically:* Students add speeds and divide by 2 instead of using total distance $div$ total time

3. *Adding times instead of rates in work problems:* If A takes 3 hours and B takes 6 hours, students say they'll take 9 hours together (should be 2 hours)

4. *Using percentages instead of decimals in mixture equations:* Writing $30x$ instead of $0.30x$ for a 30% solution

5. *Confusing past and future in age problems:* Subtracting when they should add, or vice versa

6. *Forgetting to answer the actual question:* Solving for the wrong variable and submitting it as the answer

#warning-box[
  *Tutor Tips:*

  - Have students *draw diagrams* for rate problems, as visual representation catches setup errors
  - For mixture problems, have students *calculate the actual amount* of substance at each step, not just track percentages
  - In age problems, insist students *verify their answer* at multiple time points
  - Encourage *estimation before calculation*: does the answer seem reasonable?
]
