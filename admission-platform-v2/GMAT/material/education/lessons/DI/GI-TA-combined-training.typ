#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.3.2"

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Graphics Interpretation & Table Analysis",
  level: "Training Exercises",
  intro: "Practice exercises covering Graphics Interpretation (GI) and Table Analysis (TA) question types. Complete after DI-02 and DI-03 lessons.",
  logo: "/Logo.png"
)

= Training Overview

#info-box[
  *Session Details:*
  - *Total Questions:* 8 (3 GI + 2 TA = approximately 20 individual evaluations)
  - *Recommended Time:* 20-25 minutes
  - *Topics Covered:*
    - Graphics Interpretation: Line graphs, bar charts, histograms
    - Table Analysis: True/False statement evaluation, sorting strategies
  - *Complete After:* DI-02 (Graphics Interpretation) and DI-03 (Table Analysis) lessons
]

#pagebreak()

= Part 1: Graphics Interpretation Questions

#info-box[
  *GI Question Format Reminder:*
  - Each question presents a graphic (chart, graph, or visual display)
  - Fill in blanks by selecting from dropdown options
  - Each blank is scored independently
  - Target time: 2-2.5 minutes per question
]

== Question 1: Line Graph - Credit Market Debt
_Source: DI-GMAT-PT1-00013_

#example-box(breakable: true)[
  A line graph showing Total World Credit Market Debt from 1972 to 2007. The y-axis shows US\$ (trillions) from 5 to 45, and the x-axis shows years from 1972 to 2007 in 5-year intervals. The curve shows exponential growth, starting around 3 trillion in 1972 and reaching approximately 45 trillion by 2007.

  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      let data = ((1972, 3), (1977, 5), (1982, 8), (1987, 12), (1992, 18), (1997, 25), (2002, 35), (2007, 45))

      // Scale: x from 0 to 10 represents 1972-2007, y from 0 to 5 represents 0-50 trillion
      let x_scale = 10 / 35  // 35 years
      let y_scale = 5 / 50   // 50 trillion max

      // Grid lines (horizontal) - every 5 trillion (denser)
      for i in range(0, 11) {
        let y = i * 0.5
        line((0, y), (10, y), stroke: gray.lighten(50%) + 0.5pt)
      }

      // Grid lines (vertical) - every 2.5 years (denser)
      for i in range(0, 15) {
        let x = i * (10 / 14)
        line((x, 0), (x, 5), stroke: gray.lighten(50%) + 0.5pt)
      }

      // Axes
      line((0, 0), (10, 0), stroke: black + 1pt)
      line((0, 0), (0, 5), stroke: black + 1pt)

      // Y-axis labels
      for i in range(0, 6) {
        let val = i * 10
        content((-0.5, i), text(size: 7pt)[#val])
      }
      content((-1.2, 2.5), text(size: 7pt)[US\$ (trillions)])

      // X-axis labels
      let years = (1972, 1977, 1982, 1987, 1992, 1997, 2002, 2007)
      for (i, year) in years.enumerate() {
        let x = i * (10 / 7)
        content((x, -0.3), text(size: 7pt)[#year])
      }
      content((5, -0.8), text(size: 8pt)[Year])

      // Plot the line
      let points = ()
      for (i, (year, value)) in data.enumerate() {
        let x = i * (10 / 7)
        let y = value * y_scale
        points.push((x, y))
      }

      // Draw line connecting points
      for i in range(0, points.len() - 1) {
        line(points.at(i), points.at(i + 1), stroke: rgb("#3498db") + 2pt)
      }

      // Draw markers
      for pt in points {
        circle(pt, radius: 0.12, fill: rgb("#3498db"), stroke: rgb("#2980b9") + 1pt)
      }
    })
  ]

  *Context:* For the years 1972-2007, Total World Credit Market Debt (TWCMD), as measured in trillions of US dollars, is accurately modeled by the equation $y = N dot 2^(k(t - 1972))$, whose graph is given. Here, $N$ and $k$ are positive constants and $t$ denotes the year.
]

*Statement:* The constant $N$ is approximately equal to #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_]. If the model continues to be accurate beyond 2007, the TWCMD will equal approximately double the 2007 value in the year #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_].

*Blank 1 Options:* #h(1em) ○ 1 #h(1em) ○ 2 #h(1em) ○ 3 #h(1em) ○ 4 #h(1em) ○ 5

*Blank 2 Options:* #h(1em) ○ 2012 #h(1em) ○ 2014 #h(1em) ○ 2016 #h(1em) ○ 2018 #h(1em) ○ 2020

#pagebreak()

== Question 2: Bar Chart - Traffic Intersection
_Source: DI-GMAT-PT1-00014_

#example-box(breakable: true)[
  A horizontal bar chart showing "Number of Vehicles Entering and Exiting an Intersection by Direction". The chart has 12 bars representing different trajectory combinations.

  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      // Bar chart data - horizontal bars
      let data = (
        ("north→east", 65),
        ("north→south", 80),
        ("north→west", 70),
        ("east→north", 45),
        ("east→south", 40),
        ("east→west", 55),
        ("south→north", 95),
        ("south→east", 85),
        ("south→west", 65),
        ("west→north", 25),
        ("west→east", 85),
        ("west→south", 20),
      )

      let bar_height = 0.4
      let max_val = 100

      // Grid lines (vertical) - every 10 vehicles (denser)
      for i in range(0, 11) {
        let x = i
        line((x, 0), (x, 6), stroke: gray.lighten(50%) + 0.5pt)
      }

      // Grid lines (horizontal) - for each bar row
      for i in range(0, 13) {
        let y = i * 0.5
        line((0, y), (10, y), stroke: gray.lighten(50%) + 0.5pt)
      }

      // Axes
      line((0, 0), (10, 0), stroke: black + 1pt)
      line((0, 0), (0, 6), stroke: black + 1pt)

      // X-axis labels
      for i in range(0, 6) {
        let x = i * 2
        let val = i * 20
        content((x, -0.3), text(size: 7pt)[#val])
      }
      content((5, -0.8), text(size: 8pt)[Number of vehicles])

      // Bars
      for (i, (label, value)) in data.enumerate() {
        let y = 5.5 - i * 0.45
        let width = value / 10
        rect((0, y), (width, y + bar_height), fill: rgb("#3498db"), stroke: none)
        content((-0.2, y + bar_height/2 + 0.02), text(size: 8pt)[#label], anchor: "east")
      }
    })
  ]

  *Context:* In order to better control traffic at a certain busy intersection, a study was conducted to determine how many vehicles passed through the intersection during various times of day and what trajectories they took.
]

*Statement:* During the hour, the greatest number of vehicles entered the intersection from the #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_], and among those vehicles entering the intersection from that direction, the greatest number of vehicles exited the intersection to the #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_].

*Blank 1 Options:* #h(1em) ○ north #h(1em) ○ east #h(1em) ○ south #h(1em) ○ west

*Blank 2 Options:* #h(1em) ○ north #h(1em) ○ east #h(1em) ○ south #h(1em) ○ west

#pagebreak()

== Question 3: Histogram - Temperature Deviations
_Source: DI-GMAT-PT1-00015_

#example-box(breakable: true)[
  A histogram showing "Temperature Deviations from the Daily Expected High Temperature". The x-axis shows "center of deviation class (degrees F)" from -16 to 16, and the y-axis shows "number of deviations" from 0 to 40.

  #align(center)[
    #cetz.canvas({
      import cetz.draw: *

      let data = ((-12, 2), (-8, 12), (-4, 18), (0, 34), (4, 16), (8, 15), (12, 3))
      let bar_width = 0.7
      let scale = 8 / 40  // Scale to fit

      // Grid lines (horizontal) - every 5 count (denser)
      for i in range(0, 9) {
        let y = i * 0.5
        line((-0.5, y), (7, y), stroke: gray.lighten(50%) + 0.5pt)
      }

      // Grid lines (vertical) - between each bar and at edges
      for i in range(0, 15) {
        let x = i * 0.5 - 0.5
        line((x, 0), (x, 4), stroke: gray.lighten(50%) + 0.5pt)
      }

      // Axes
      line((-0.5, 0), (7, 0), stroke: black + 1pt)
      line((-0.5, 0), (-0.5, 4), stroke: black + 1pt)

      // Y-axis labels
      for i in range(0, 5) {
        let y = i
        let val = i * 10
        content((-1, y), text(size: 7pt)[#val])
      }
      // Y-axis label
      content((-1.8, 2), text(size: 7pt)[Count])

      // X-axis labels and bars with height labels
      for (i, (center, count)) in data.enumerate() {
        let x = i
        let height = count / 10
        rect((x - bar_width/2, 0), (x + bar_width/2, height), fill: rgb("#3498db"), stroke: rgb("#2980b9") + 0.5pt)
        content((x, -0.3), text(size: 7pt)[#center])
        // Height label above each bar
        content((x, height + 0.15), text(size: 6pt, weight: "bold")[#count])
      }
      content((3, -0.8), text(size: 8pt)[Center of deviation class (°F)])
    })
  ]

  *Context:* For a given city, the graph represents the daily deviation, in degrees Fahrenheit (°F), of the high temperature from the expected high temperature for each day in a 100-day period. Data is grouped into disjoint classes of deviations: for each value of T marked on the horizontal axis, the class centered at T includes all observed deviations greater than or equal to (T - 2)°F but less than (T + 2)°F. A given day's high temperature is x°F *less than seasonal* if it is x°F less than the left endpoint of the class centered at 0, and the high temperature is x°F *greater than seasonal* if it is x°F greater than the right endpoint of the class centered at 0.
]

*Statement:* For a randomly selected day in this 100-day period, the probability that the high temperature was more than 4°F less than seasonal is #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] and the probability that the high temperature was more than 8°F less than seasonal is #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_].

*Blank 1 Options:* #h(1em) ○ 0.02 #h(1em) ○ 0.12 #h(1em) ○ 0.14 #h(1em) ○ 0.32 #h(1em) ○ 0.34

*Blank 2 Options:* #h(1em) ○ 0.02 #h(1em) ○ 0.12 #h(1em) ○ 0.14 #h(1em) ○ 0.32 #h(1em) ○ 0.34

#pagebreak()

= Part 2: Table Analysis Questions

#info-box[
  *TA Question Format Reminder:*
  - Each question presents a sortable data table
  - Evaluate True/False (or similar) statements about the data
  - You can mentally sort by any column to find answers efficiently
  - Each statement is scored independently
  - Target time: 2.5-3 minutes per question
]

== Question 4: Song Rankings Table
_Source: DI-GMAT-PT1-00003_

#example-box(breakable: true)[
  For a certain radio station in India, the table shows the songs ranked among the top 10 during Week W. The rankings are determined by the number of listener requests for each song, with rank 1 being the most requested, rank 2 the second-most requested, and so on. *Lesser numbers constitute higher rankings.* The table also gives, as of Week W, each song's rank for the previous week, the number of weeks it has been among the top 20, and its peak rank (the highest ranking it has achieved). In the column for Previous week's rank, "n/a" indicates that the song was not ranked in the week immediately prior to Week W.

  #align(center)[
    #table(
      columns: 5,
      stroke: 0.5pt + gray,
      inset: 8pt,
      align: center,
      table.cell(fill: rgb("#3498db").lighten(80%))[*Week W rank*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Song*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Previous week's rank*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Weeks in top 20*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Peak rank*],
      [1], [A], [1], [4], [1],
      [2], [B], [2], [10], [1],
      [3], [C], [6], [3], [3],
      [4], [D], [4], [6], [4],
      [5], [E], [3], [11], [1],
      [6], [F], [n/a], [1], [6],
      [7], [G], [5], [9], [3],
      [8], [H], [10], [3], [8],
      [9], [I], [12], [5], [9],
      [10], [J], [13], [2], [10],
    )
  ]
]

For each of the following questions, select *Can be answered* if the question can be answered from the table, or *Cannot be answered* if it cannot.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Question*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Can be answered*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Cannot be answered*],
  [How many of the top 5 songs for Week W had a higher rank for Week W than they did for the previous week?], [○], [○],
  [How many of the top 10 songs for Week W were not among the top 10 in the previous week?], [○], [○],
  [How many of the top 10 songs for the week immediately prior to Week W have ever been at ranking 1?], [○], [○],
)

#pagebreak()

== Question 5: Airline Flight Delays Table
_Source: DI-GMAT-PT1-00010_

#example-box(breakable: true)[
  For each of 5 airlines (Airlines 1 through 5), the table shows the percent of flights offered by that airline last year that were delayed by certain ranges of time to the nearest minute and the total percent of flights offered by that airline last year that were delayed. *The airlines are numbered from greatest total number of flights offered last year (Airline 1) to least total number of flights offered last year (Airline 5).*

  #align(center)[
    #table(
      columns: 7,
      stroke: 0.5pt + gray,
      inset: 6pt,
      align: center,
      table.cell(fill: rgb("#3498db").lighten(80%))[*Airline*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*1-15 min*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*16-30 min*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*31-45 min*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*46-60 min*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*>60 min*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Total delays*],
      [1], [8.5%], [6.5%], [5.8%], [2.1%], [1.6%], [24.5%],
      [2], [9.2%], [6.9%], [4.9%], [2.4%], [2.8%], [26.2%],
      [3], [7.5%], [7.1%], [4.5%], [2.2%], [1.7%], [23.0%],
      [4], [6.3%], [4.8%], [5.0%], [1.7%], [2.5%], [20.3%],
      [5], [8.8%], [5.9%], [7.1%], [1.9%], [1.2%], [24.9%],
    )
  ]
]

For each of the following statements, select *Must be true* if it must be true based on the information provided, or *Need not be true* if it need not be true.

#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Must be true*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Need not be true*],
  [Airline 2 had the greatest number of flights last year that were delayed by 1 to 15 minutes, to the nearest minute.], [○], [○],
  [Airline 5 had the least number of flights last year that were delayed by more than 60 minutes, to the nearest minute.], [○], [○],
  [Airline 3 did NOT have the least number of total delayed flights last year.], [○], [○],
)

#pagebreak()

= Answer Key & Explanations

#warning-box[
  *Complete all questions before reviewing answers!*

  Record your answers and time before checking.
]

== GI Question Answers

=== Question 1: Credit Market Debt
*Correct Answers:* Blank 1 = *3*, Blank 2 = *2016*

#tip-box[
  *Explanation:*
  - For Blank 1: At $t = 1972$, the equation gives $y = N dot 2^0 = N$. From the graph, TWCMD in 1972 ≈ 3 trillion, so $N ≈ 3$.
  - For Blank 2: In 2007, TWCMD ≈ 45 trillion. Double that is 90 trillion. We need to find when $y = 90$. From 1972 to 2007 (35 years), the value grew from 3 to 45 (multiplied by 15). Since the model is exponential with base 2, we can calculate the doubling period. From the graph, roughly every 9 years the value doubles. So 2007 + 9 = 2016.
]

=== Question 2: Traffic Intersection
*Correct Answers:* Blank 1 = *south*, Blank 2 = *north*

#tip-box[
  *Explanation:*
  - From the south: 95 + 85 + 65 = 245 vehicles (highest total)
  - From the north: 65 + 80 + 70 = 215 vehicles
  - From the east: 45 + 40 + 55 = 140 vehicles
  - From the west: 25 + 85 + 20 = 130 vehicles

  Among vehicles from the south:
  - south→north: 95 (highest)
  - south→east: 85
  - south→west: 65
]

=== Question 3: Temperature Deviations
*Correct Answers:* Blank 1 = *0.14*, Blank 2 = *0.02*

#tip-box[
  *Explanation:*
  - "More than 4°F less than seasonal" means deviations in classes centered at -8 and -12 (left of -6 boundary): 12 + 2 = 14 days → P = 14/100 = 0.14
  - "More than 8°F less than seasonal" means deviations in class centered at -12 only (left of -10 boundary): 2 days → P = 2/100 = 0.02
]

== TA Question Answers

=== Question 4: Song Rankings
*Correct Answers:*
- Statement 1: *Cannot be answered*
- Statement 2: *Can be answered*
- Statement 3: *Cannot be answered*

#tip-box[
  *Explanation:*
  - Statement 1: To know if a song has a "higher rank" (smaller number) in Week W than previous week, we need to compare. Song A: 1→1 (same), Song B: 2→2 (same), Song C: 3←6 (improved), Song D: 4→4 (same), Song E: 5←3 (worsened). However, "higher rank" is ambiguous in the question context - *Cannot be answered* definitively.
  - Statement 2: Songs not in top 10 previously: F (n/a), I (was 12), J (was 13) = 3 songs. *Can be answered.*
  - Statement 3: We know the top 10 for Week W, but for the previous week, songs like F weren't ranked, and we don't know the full previous week's top 10. *Cannot be answered.*
]

=== Question 5: Airline Flight Delays
*Correct Answers:*
- Statement 1: *Need not be true*
- Statement 2: *Must be true*
- Statement 3: *Need not be true*

#tip-box[
  *Explanation:*
  - Statement 1: Airline 2 has the highest percentage (9.2%) for 1-15 min delays, but Airline 1 has more total flights. Since 8.5% of more flights could exceed 9.2% of fewer flights, we cannot determine which had more actual delayed flights. *Need not be true.*
  - Statement 2: Airline 5 has the lowest percentage (1.2%) AND the fewest total flights. Lowest percentage × fewest flights = definitely the least absolute number. *Must be true.*
  - Statement 3: Airline 3 has 23.0% total delays (not the lowest percentage - that's Airline 4 at 20.3%). But Airline 3 has more total flights than Airlines 4 and 5. We cannot determine the actual counts. *Need not be true.*
]
