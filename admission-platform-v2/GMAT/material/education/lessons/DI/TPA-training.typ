#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Two-Part Analysis",
  level: "Training Exercises",
  intro: "Practice exercises covering Two-Part Analysis (TPA) question types. Complete after DI-04 lesson.",
  logo: "/Logo.png"
)

= Training Overview

#info-box[
  *Session Details:*
  - *Total Questions:* 5 TPA questions (10 individual selections)
  - *Recommended Time:* 12-15 minutes
  - *Topics Covered:*
    - Mathematical TPA: Rate/time, algebraic relationships
    - Logical TPA: Strengthen/weaken, cause-effect
    - Constraint-based TPA: Scheduling, conditions
  - *Complete After:* DI-04 (Two-Part Analysis) lesson
]

#pagebreak()

= Two-Part Analysis Questions

#info-box[
  *TPA Question Format Reminder:*
  - Each question has a scenario and a table with two columns
  - Select ONE option for each column from the SAME set of options
  - Both selections are scored independently
  - Target time: 2-2.5 minutes per question
]

== Question 1: Train Distance Problem
_Source: DI-GMAT-OG-00410_

#example-box(breakable: true)[
  Trains M and N are traveling west on parallel tracks. At exactly noon, the front of Train M, which is traveling at a constant speed of 80 kilometers per hour (km/h), is at the rail crossing at Location X, and the front of Train N, which is traveling at a constant speed of 65 km/h, is 30 km west of the rail crossing at Location X. The trains continue traveling at their respective speeds until the front of Train M and the front of Train N are simultaneously at the rail crossing at Location Y.

  In the table, identify the number of kilometers that the front of Train M has traveled between noon and 12:45 p.m. and the number of kilometers that the front of Train N has traveled between noon and 1:00 p.m.

  #v(0.5em)
  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Timeline visualization
      content((5, 3.5), text(size: 9pt, weight: "bold")[Train Journey Visualization])

      // Train M line
      line((0, 2), (10, 2), stroke: rgb("#3498db") + 2pt)
      content((-0.5, 2), text(size: 8pt)[M])
      content((0, 1.6), text(size: 7pt)[Noon])
      content((0, 2.4), text(size: 7pt)[Location X])

      // Speed label for M
      content((5, 2.4), text(size: 7pt, fill: rgb("#3498db"))[80 km/h])

      // Train N line (starts 30km ahead)
      line((3, 1), (10, 1), stroke: rgb("#e74c3c") + 2pt)
      content((-0.5, 1), text(size: 8pt)[N])
      content((3, 0.6), text(size: 7pt)[30 km west])

      // Speed label for N
      content((6.5, 0.6), text(size: 7pt, fill: rgb("#e74c3c"))[65 km/h])

      // Arrows showing direction
      line((8, 2), (9.5, 2), stroke: rgb("#3498db") + 1.5pt, mark: (end: ">"))
      line((8, 1), (9.5, 1), stroke: rgb("#e74c3c") + 1.5pt, mark: (end: ">"))

      content((10.5, 1.5), text(size: 7pt)[West])
    })
  ]
]

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  align: center,
  table.cell(fill: rgb("#3498db").lighten(80%))[*Front of Train M\ (noon to 12:45 p.m.)*],
  table.cell(fill: rgb("#e74c3c").lighten(80%))[*Front of Train N\ (noon to 1:00 p.m.)*],
  table.cell(fill: gray.lighten(80%))[*Option (km)*],
  [○], [○], [55],
  [○], [○], [60],
  [○], [○], [65],
  [○], [○], [70],
  [○], [○], [75],
)

#v(0.5em)
*Your Answers:*
- Train M (noon to 12:45 p.m.): \_\_\_\_\_\_\_\_ km
- Train N (noon to 1:00 p.m.): \_\_\_\_\_\_\_\_ km

#pagebreak()

== Question 2: Automobile Test Track
_Source: DI-GMAT-OG-00412_

#example-box(breakable: true)[
  A portion of an automobile test track is divided into Segment A, Segment B, and Segment C, in that order. In a performance test on a car, the car traveled Segment A at a constant speed of 140 kilometers per hour (km/h). Immediately after this, the car rapidly slowed on Segment B and then traveled on Segment C at a constant speed of 70 km/h. The length of Segment C is 3 times the length of Segment A, and it took a total of 42 minutes for the car to travel both Segments A and C.

  In the table, select the length of Segment A, in kilometers, and select the length of Segment C, in kilometers. Make only two selections, one in each column.

  #v(0.5em)
  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Track visualization
      content((5, 3), text(size: 9pt, weight: "bold")[Test Track Layout])

      // Segment A
      rect((0, 1.5), (2, 2.5), fill: rgb("#3498db").lighten(70%), stroke: rgb("#3498db") + 1pt)
      content((1, 2), text(size: 8pt, weight: "bold")[A])
      content((1, 1.2), text(size: 7pt)[140 km/h])

      // Segment B (transition)
      rect((2, 1.5), (3, 2.5), fill: gray.lighten(70%), stroke: gray + 1pt)
      content((2.5, 2), text(size: 8pt)[B])
      content((2.5, 1.2), text(size: 6pt)[slow])

      // Segment C (3x length of A)
      rect((3, 1.5), (9, 2.5), fill: rgb("#e74c3c").lighten(70%), stroke: rgb("#e74c3c") + 1pt)
      content((6, 2), text(size: 8pt, weight: "bold")[C = 3 × A])
      content((6, 1.2), text(size: 7pt)[70 km/h])

      // Arrow showing direction
      line((0, 0.8), (9, 0.8), stroke: 1pt, mark: (end: ">"))
      content((4.5, 0.5), text(size: 7pt)[Direction of travel])

      // Time constraint
      rect((0, -0.3), (9, 0.2), fill: rgb("#f1c40f").lighten(70%), stroke: none)
      content((4.5, -0.05), text(size: 7pt)[Total time for A + C = 42 minutes])
    })
  ]
]

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  align: center,
  table.cell(fill: rgb("#3498db").lighten(80%))[*Length of Segment A\ (kilometers)*],
  table.cell(fill: rgb("#e74c3c").lighten(80%))[*Length of Segment C\ (kilometers)*],
  table.cell(fill: gray.lighten(80%))[*Option*],
  [○], [○], [8],
  [○], [○], [14],
  [○], [○], [24],
  [○], [○], [42],
  [○], [○], [72],
  [○], [○], [126],
)

#v(0.5em)
*Your Answers:*
- Length of Segment A: \_\_\_\_\_\_\_\_ km
- Length of Segment C: \_\_\_\_\_\_\_\_ km

#pagebreak()

== Question 3: Probability Problem - Swan and Heron
_Source: DI-GMAT-OG-00423_

#example-box(breakable: true)[
  For a randomly selected day, the probability that a visitor to a certain pond will see at least one swan is 0.35. The probability that a visitor to that pond on a randomly selected day will see at least one heron is 0.2. Furthermore, seeing a swan and seeing a heron are independent of each other.

  Based on the information provided, select *Both swan and heron* for the probability that a visitor to the pond will see both at least one swan and at least one heron on any given day, and select *Neither swan nor heron* for the probability that a visitor to the pond will see neither a swan nor a heron on any given day. Make only two selections, one in each column.

  #v(0.5em)
  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Probability visualization
      content((4, 3.5), text(size: 9pt, weight: "bold")[Probability Information])

      // Swan probability
      rect((0, 2), (3, 2.8), fill: rgb("#3498db").lighten(70%), stroke: rgb("#3498db") + 1pt, radius: 3pt)
      content((1.5, 2.4), text(size: 8pt)[P(Swan) = 0.35])

      // Heron probability
      rect((5, 2), (8, 2.8), fill: rgb("#27ae60").lighten(70%), stroke: rgb("#27ae60") + 1pt, radius: 3pt)
      content((6.5, 2.4), text(size: 8pt)[P(Heron) = 0.2])

      // Independence note
      rect((1.5, 0.8), (6.5, 1.5), fill: rgb("#f1c40f").lighten(70%), stroke: rgb("#f39c12") + 1pt, radius: 3pt)
      content((4, 1.15), text(size: 8pt, weight: "bold")[Events are INDEPENDENT])
    })
  ]

  #v(0.5em)
  *Key formulas for independent events:*
  - P(A and B) = P(A) × P(B)
  - P(not A) = 1 - P(A)
]

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  align: center,
  table.cell(fill: rgb("#3498db").lighten(80%))[*Both swan and heron*],
  table.cell(fill: rgb("#27ae60").lighten(80%))[*Neither swan nor heron*],
  table.cell(fill: gray.lighten(80%))[*Probability*],
  [○], [○], [0.02],
  [○], [○], [0.07],
  [○], [○], [0.48],
  [○], [○], [0.52],
  [○], [○], [0.70],
)

#v(0.5em)
*Your Answers:*
- Both swan and heron: \_\_\_\_\_\_\_\_
- Neither swan nor heron: \_\_\_\_\_\_\_\_

#pagebreak()

== Question 4: Cause and Effect - Coral Reefs
_Source: DI-GMAT-OG-00419_

#example-box(breakable: true)[
  *Naturalist:* The decline of coral reefs has various causes. One contributing factor is predation on coral by organisms such as the crown-of-thorns sea star, whose preferred food source is coral polyps. Human fishing practices have decreased the sea star's predators, such as the harlequin shrimp. It is also possible that runoff containing nutrients for phytoplankton has resulted in larger phytoplankton blooms: the crown-of-thorns sea star gladly eats phytoplankton.

  Indicate which cause-and-effect sequence would most likely, according to the naturalist, result in coral reef decline. Make only two selections, one in each column.

  #v(0.5em)
  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Causal chain visualization
      content((5, 4), text(size: 9pt, weight: "bold")[Causal Relationships])

      // Phytoplankton box
      rect((0, 2.5), (3, 3.3), fill: rgb("#27ae60").lighten(70%), stroke: rgb("#27ae60") + 1pt, radius: 3pt)
      content((1.5, 2.9), text(size: 7pt)[Phytoplankton])

      // Arrow
      line((3, 2.9), (4.5, 2.9), stroke: 1.5pt, mark: (end: ">"))
      content((3.75, 3.2), text(size: 6pt)[feeds])

      // Sea star box
      rect((4.5, 2.5), (7.5, 3.3), fill: rgb("#e74c3c").lighten(70%), stroke: rgb("#e74c3c") + 1pt, radius: 3pt)
      content((6, 2.9), text(size: 7pt)[Crown-of-thorns])

      // Arrow
      line((7.5, 2.9), (9, 2.9), stroke: 1.5pt, mark: (end: ">"))
      content((8.25, 3.2), text(size: 6pt)[eats])

      // Coral box
      rect((9, 2.5), (11, 3.3), fill: rgb("#3498db").lighten(70%), stroke: rgb("#3498db") + 1pt, radius: 3pt)
      content((10, 2.9), text(size: 7pt)[Coral])

      // Decline indicator
      line((10, 2.5), (10, 1.8), stroke: rgb("#e74c3c") + 1.5pt, mark: (end: ">"))
      content((10, 1.5), text(size: 7pt, fill: rgb("#e74c3c"))[Decline])

      // Question marks for cause/effect
      rect((0.5, 0.8), (3.5, 1.4), fill: rgb("#f1c40f").lighten(70%), stroke: rgb("#f39c12") + 1pt, radius: 3pt)
      content((2, 1.1), text(size: 7pt)[CAUSE = ?])

      rect((5, 0.8), (8, 1.4), fill: rgb("#9b59b6").lighten(70%), stroke: rgb("#9b59b6") + 1pt, radius: 3pt)
      content((6.5, 1.1), text(size: 7pt)[EFFECT = ?])
    })
  ]
]

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  align: center,
  table.cell(fill: rgb("#f1c40f").lighten(80%))[*Cause*],
  table.cell(fill: rgb("#9b59b6").lighten(80%))[*Effect*],
  table.cell(fill: gray.lighten(80%))[*Sequence Element*],
  [○], [○], [An increase in phytoplankton],
  [○], [○], [A decrease in phytoplankton],
  [○], [○], [An increase in crown-of-thorns sea stars],
  [○], [○], [A decrease in crown-of-thorns sea stars],
  [○], [○], [An increase in harlequin shrimp],
)

#v(0.5em)
*Your Answers:*
- Cause: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
- Effect: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

#pagebreak()

== Question 5: Scheduling Constraints
_Source: DI-GMAT-OG-00427_

#example-box(breakable: true)[
  Martine is scheduling five contractors (Contractors A through E) to do various tasks during Monday through Friday of the upcoming week. For each day, exactly one contractor will be scheduled to work, and each contractor's task will be completed on the day for which that contractor is scheduled. The scheduling must conform to the following constraints:

  - Contractor A must be scheduled to work on Monday.
  - Contractor B must be scheduled to work exactly two days after Contractor A.
  - Contractor E must be scheduled to work exactly three days after Contractor C.

  *Statement:* Given the constraints, Martine must schedule Contractor B to work on \_\_\_1\_\_\_ and Contractor D to work on \_\_\_2\_\_\_.

  Select for 1 and for 2 the options that complete the statement so that it is accurate based on the information provided. Make only two selections, one in each column.

  #v(0.5em)
  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Week calendar visualization
      content((5, 3.5), text(size: 9pt, weight: "bold")[Week Schedule])

      let days = ("Mon", "Tue", "Wed", "Thu", "Fri")
      for (i, day) in days.enumerate() {
        let x = i * 2
        rect((x, 1.5), (x + 1.8, 2.5), fill: if i == 0 { rgb("#3498db").lighten(70%) } else { gray.lighten(80%) }, stroke: 0.5pt + gray, radius: 2pt)
        content((x + 0.9, 2.3), text(size: 8pt, weight: "bold")[#day])
        if i == 0 {
          content((x + 0.9, 1.8), text(size: 9pt, fill: rgb("#3498db"))[A])
        } else {
          content((x + 0.9, 1.8), text(size: 9pt)[?])
        }
      }

      // Constraints visualization
      content((5, 0.8), text(size: 7pt)[A → Mon #h(1em) | #h(1em) B = A + 2 days #h(1em) | #h(1em) E = C + 3 days])
    })
  ]
]

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  align: center,
  table.cell(fill: rgb("#3498db").lighten(80%))[*1 (Contractor B)*],
  table.cell(fill: rgb("#e74c3c").lighten(80%))[*2 (Contractor D)*],
  table.cell(fill: gray.lighten(80%))[*Day*],
  [○], [○], [Monday],
  [○], [○], [Tuesday],
  [○], [○], [Wednesday],
  [○], [○], [Thursday],
  [○], [○], [Friday],
)

#v(0.5em)
*Your Answers:*
- Contractor B works on: \_\_\_\_\_\_\_\_\_\_\_\_\_\_
- Contractor D works on: \_\_\_\_\_\_\_\_\_\_\_\_\_\_

#pagebreak()

= Answer Key & Explanations

#warning-box[
  *Complete all questions before reviewing answers!*

  Record your answers and time before checking.
]

== Question Answers

=== Question 1: Train Distance Problem
*Correct Answers:* Train M = *60 km*, Train N = *65 km*

#tip-box[
  *Explanation:*
  - Train M travels at 80 km/h for 45 minutes (= 0.75 hours)
  - Distance = Speed × Time = 80 × 0.75 = *60 km*

  - Train N travels at 65 km/h for 1 hour (= 1 hour)
  - Distance = Speed × Time = 65 × 1 = *65 km*
]

=== Question 2: Automobile Test Track
*Correct Answers:* Segment A = *14 km*, Segment C = *42 km*

#tip-box[
  *Explanation:*
  Let the length of Segment A = $x$ km. Then Segment C = $3x$ km.

  - Time for A: $x / 140$ hours
  - Time for C: $3x / 70$ hours
  - Total time: 42 minutes = 0.7 hours

  $x/140 + 3x/70 = 0.7$

  $x/140 + 6x/140 = 0.7$

  $7x/140 = 0.7$

  $x = 14$ km

  Therefore: A = 14 km, C = 3 × 14 = 42 km
]

=== Question 3: Probability - Swan and Heron
*Correct Answers:* Both = *0.07*, Neither = *0.52*

#tip-box[
  *Explanation:*
  Since events are independent:

  *P(Both swan AND heron):*
  $P("Swan") times P("Heron") = 0.35 times 0.2 = 0.07$

  *P(Neither swan NOR heron):*
  $P("No swan") times P("No heron") = (1 - 0.35) times (1 - 0.2)$
  $= 0.65 times 0.8 = 0.52$
]

=== Question 4: Cause and Effect - Coral Reefs
*Correct Answers:* Cause = *An increase in phytoplankton*, Effect = *An increase in crown-of-thorns sea stars*

#tip-box[
  *Explanation:*
  The passage states:
  1. Crown-of-thorns sea stars eat coral (causing decline)
  2. Sea stars also eat phytoplankton
  3. More nutrients → more phytoplankton blooms

  Therefore, the causal chain leading to coral decline is:
  - *CAUSE:* An increase in phytoplankton
  - *EFFECT:* An increase in crown-of-thorns sea stars (which then eat coral)
]

=== Question 5: Scheduling Constraints
*Correct Answers:* Contractor B = *Wednesday*, Contractor D = *Thursday*

#tip-box[
  *Explanation:*
  Given constraints:
  1. A = Monday (fixed)
  2. B = A + 2 days = Monday + 2 = *Wednesday*
  3. E = C + 3 days

  For constraint 3: C must be on Mon or Tue (so E fits within the week)
  - Since A is on Monday, C must be on *Tuesday*
  - Therefore E = Tuesday + 3 = *Friday*

  Remaining: D must be on the only open day = *Thursday*

  Final schedule: A=Mon, C=Tue, B=Wed, D=Thu, E=Fri
]

#pagebreak()

= Results Tracking

#info-box[
  *Record Your Performance:*

  *TPA Questions:*
  - Question 1: Col 1 #checkbox Correct  Col 2 #checkbox Correct
  - Question 2: Col 1 #checkbox Correct  Col 2 #checkbox Correct
  - Question 3: Col 1 #checkbox Correct  Col 2 #checkbox Correct
  - Question 4: Col 1 #checkbox Correct  Col 2 #checkbox Correct
  - Question 5: Col 1 #checkbox Correct  Col 2 #checkbox Correct

  *Total Score:* \_\_\_ / 10 selections | *Percentage:* \_\_\_%

  *Time Used:* \_\_\_ minutes (Target: 12-15 minutes)
]

= Self-Assessment

#strategy-box[
  *Reflect on Your Performance:*

  1. Which TPA type felt more challenging?
     - #checkbox Mathematical (rate/time, algebra)
     - #checkbox Logical (cause-effect, arguments)
     - #checkbox Constraint-based (scheduling, conditions)

  2. Did you identify the relationship between the two parts before solving?

  3. Did you solve the more constrained part first?

  4. Areas for improvement:
     - #checkbox Setting up equations correctly
     - #checkbox Understanding probability with independent events
     - #checkbox Tracking multiple constraints simultaneously
     - #checkbox Time management
]
