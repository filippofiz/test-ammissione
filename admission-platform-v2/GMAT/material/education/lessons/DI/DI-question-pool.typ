#import "/templates/uptoten-template.typ": *
#import "@preview/cetz:0.4.2": canvas, draw
#import "@preview/cetz-plot:0.1.3": plot, chart

#show: uptoten-doc.with(
  title: "GMAT Data Insights",
  subtitle: "Comprehensive Question Pool",
  level: "Practice Sets 1-5",
  intro: "100 questions across 5 balanced sets covering all Data Insights question types: Data Sufficiency (DS), Two-Part Analysis (TPA), Graphics Interpretation (GI), Table Analysis (TA), and Multi-Source Reasoning (MSR).",
  logo: "/Logo.png"
)

= Question Pool Overview

#info-box[
  *Pool Structure:*
  - *Total Questions:* 100 questions across 5 sets
  - *Questions per Set:* 20 questions
  - *Question Type Distribution per Set:*
    - Data Sufficiency (DS): 8 questions
    - Two-Part Analysis (TPA): 5 questions
    - Graphics Interpretation (GI): 3 questions
    - Table Analysis (TA): 2 questions
    - Multi-Source Reasoning (MSR): 2 questions
  - *Difficulty Distribution per Set:*
    - Easy: 6-7 questions
    - Medium: 7-8 questions
    - Hard: 5-6 questions
  - *Recommended Time per Set:* 45 minutes
]

#pagebreak()

// ============================================================
// SET 1
// ============================================================

= Set 1: Mixed Practice

#info-box[
  *Set 1 Overview:*
  - DS: 8 questions | TPA: 5 questions | GI: 3 questions | TA: 2 questions | MSR: 2 questions
  - Difficulty: 7 Easy, 7 Medium, 6 Hard
  - Target Time: 45 minutes
]

#pagebreak()

== Data Sufficiency Questions (Set 1)

#info-box[
  *DS Answer Choices (for all DS questions):*
  - (A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.
  - (B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.
  - (C) BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.
  - (D) EACH statement ALONE is sufficient.
  - (E) Statements (1) and (2) TOGETHER are NOT sufficient.
]

=== S1-Q1 (DS - Easy)
_Source: DI-GMAT-OG-00274_

If a certain vase contains only roses and tulips, how many tulips are there in the vase?

(1) The number of roses in the vase is 4 times the number of tulips in the vase.

(2) There is a total of 20 flowers in the vase.

#v(0.5em)


=== S1-Q2 (DS - Easy)
_Source: DI-GMAT-OG-00277_

How many basic units of Currency X are equivalent to 250 basic units of Currency Y?

(1) 100 basic units of Currency X are equivalent to 625 basic units of Currency Y.

(2) 2,000 basic units of Currency X are equivalent to 12,500 basic units of Currency Y.

#v(0.5em)


=== S1-Q3 (DS - Easy)
_Source: DI-GMAT-OG-00278_

A company bought 3 printers and 1 scanner. What was the price of the scanner?

(1) The total price of the printers and the scanner was \$1,300.

(2) The price of each printer was 4 times the price of the scanner.

#v(0.5em)


=== S1-Q4 (DS - Medium)
_Source: DI-GMAT-OG-00285_

If $r$ and $s$ are positive integers, is $display(r/s)$ an integer?

(1) Every factor of $s$ is also a factor of $r$.

(2) Every prime factor of $s$ is also a prime factor of $r$.

#v(0.5em)


=== S1-Q5 (DS - Medium)
_Source: DI-GMAT-OG-00290_

What is the value of integer $n$?

(1) $n(n + 1) = 6$

(2) $2^(2n) = 16$

#v(0.5em)


=== S1-Q6 (DS - Hard)
_Source: DI-GMAT-OG-00295_

In the $x y$-plane, does the line with equation $y = 3x + 2$ contain the point $(r, s)$?

(1) $(3r + 2 - s)(4r + 9 - s) = 0$

(2) $(4r - 6 - s)(3r + 2 - s) = 0$

#v(0.5em)


=== S1-Q7 (DS - Hard)
_Source: DI-GMAT-OG-00300_

If $x$ is a positive integer greater than 1, is $x$ a prime number?

(1) $x$ has exactly two positive factors.

(2) $x$ is less than 10 and is not divisible by 2 or 3.

#v(0.5em)


=== S1-Q8 (DS - Hard)
_Source: DI-GMAT-SK-00005_

There are 210 households in a certain residential complex. All households in the complex that have more than one dog also have at least one cat. All households that have at least one cat have a pet rodent. How many households in the complex have a pet rodent?

(1) 18 households in the complex have two or more dogs.

(2) 90% of households in the complex that have a pet rodent have at least one cat.

#v(0.5em)


#pagebreak()

== Two-Part Analysis Questions (Set 1)

=== S1-Q9 (TPA - Easy)
_Source: DI-GMAT-OG-00410_

A car travels from City A to City B at an average speed of 60 km/h and returns at an average speed of 40 km/h. The distance between the cities is $d$ kilometers.

In terms of $d$, select the expression that represents the total time for the round trip, and select the expression that represents the average speed for the entire journey.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Total Time*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Average Speed*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Expression*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$d/24$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$d/48$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$d/50$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$48$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$50$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$5d/120$],
)]

=== S1-Q10 (TPA - Easy)
_Source: DI-GMAT-OG-00412_

A store sells two types of widgets: standard and premium. The profit on each standard widget is \$5, and the profit on each premium widget is \$12. Last month, the store sold a total of 200 widgets.

Select the minimum number of premium widgets that must have been sold for the total profit to be at least \$1,500, and select the maximum number of standard widgets that could have been sold for the total profit to be at least \$1,500.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Min Premium*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Max Standard*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Number*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [50],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [72],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [100],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [128],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [150],
)]

=== S1-Q11 (TPA - Medium)
_Source: DI-GMAT-OG-00415_

Over a period of 5 academic years, the number of faculty at a college increased despite a decrease in student enrollment from 5,500 students. Let $F$ represent the percent change in faculty, $S$ represent the percent change in students, and $R$ represent the students per faculty member initially.

Select the expression for the number of faculty initially, and select the expression for students per faculty member after the 5-year period.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Initial Faculty*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Final Ratio*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Expression*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$5500R$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$5500/R$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$1/R$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$((100+S)/(100+F))R$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$((100-S)/(100+F))R$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$((100+S)/(100-F))R$],
)]

=== S1-Q12 (TPA - Medium)
_Source: DI-GMAT-OG-00418_

The Quasi JX car has fuel economy $E$ km per liter at constant speed $S$ km per hour under ideal conditions.

Select the expression for liters of fuel used in 1 hour of driving, and select the expression for liters of fuel used in a 60 km drive.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*1 Hour*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*60 km*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Expression*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$S/E$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$E/S$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$60/E$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$60/S$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$S/60$],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [$E/60$],
)]

=== S1-Q13 (TPA - Hard)
_Source: DI-GMAT-OG-00420_

A literature department is organizing a two-day festival featuring ten writers. Five writers will be featured each day. The majority of writers on one day must have a primary writing language that is not English. On the other day, at least four writers must be women. Neither day should have more than two writers from the same country.

Current schedule:
- Day 1: Achebe (male, English, Nigeria), Weil (female, French, France), Gavalda (female, French, France), Barrett Browning (female, English, UK)
- Day 2: Rowling (female, English, UK), Austen (female, English, UK), Ocantos (male, Spanish, Argentina), Lu Xun (male, Chinese, China)

Select a writer who could be added to EITHER day, and select a writer who could be added to NEITHER day.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Either Day*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Neither Day*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Writer*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [LeGuin (female, English, USA)],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Longfellow (male, English, USA)],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Murasaki (female, Japanese, Japan)],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Colette (female, French, France)],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Vargas Llosa (male, Spanish, Peru)],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [Zola (male, French, France)],
)]

#pagebreak()

== Graphics Interpretation Questions (Set 1)

=== S1-Q14 (GI - Easy)
_Source: GI-POOL-001_

#example-box(breakable: true)[
  *Commuting Options in Farview City (millions of commuters)*

  #align(center)[
    #canvas({
      draw.set-style(barchart: (bar-width: 0.7))
      chart.barchart(
        mode: "clustered",
        size: (10, 6),
        label-key: 0,
        value-key: (1, 2),
        x-tick-step: 0.5,
        x-label: "Commuters (millions)",
        (
          ([Cars], 2.4, 2.8),
          ([Bikes], 0.3, 0.4),
          ([Subway & Bus], 1.8, 2.1),
          ([Comm. Trains], 0.7, 0.9),
        ),
        labels: ([1995], [2005]),
        legend: "north-east",
      )
    })
  ]
]

*Statement:* The commuting mode whose ridership increased by approximately 29% from 1995 to 2005 is #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_]. In 2005, car commuters were approximately #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] percent of all commuters.

*Blank 1 Options:* \ #sym.circle.stroked Cars \ #sym.circle.stroked Bikes \ #sym.circle.stroked Subway & Bus \ #sym.circle.stroked Commuter Trains

*Blank 2 Options:* \ #sym.circle.stroked 28% \ #sym.circle.stroked 32% \ #sym.circle.stroked 45% \ #sym.circle.stroked 52%

#pagebreak()

=== S1-Q15 (GI - Medium)
_Source: GI-POOL-002_

#example-box(breakable: true)[
  *Division Profits 2008-2011 (millions \$)*

  #align(center)[
    #canvas({
      plot.plot(
        size: (10, 6),
        x-tick-step: 1,
        x-min: 2007.5,
        x-max: 2011.5,
        y-tick-step: 2,
        y-min: 0,
        y-max: 16,
        x-label: "Year",
        y-label: "Profit (millions \$)",
        legend: "inner-north-west",
        x-grid: true,
        y-grid: true,
        {
          plot.add(
            ((2008, 8), (2009, 10), (2010, 12), (2011, 14)),
            mark: "o",
            style: (stroke: rgb("#e74c3c") + 2pt, fill: rgb("#e74c3c")),
            label: "Gamma"
          )
          plot.add(
            ((2008, 3), (2009, 5), (2010, 6), (2011, 9)),
            mark: "square",
            style: (stroke: rgb("#3498db") + 2pt, fill: rgb("#3498db")),
            label: "Rho"
          )
        }
      )
    })
  ]
]

*Statement:* In 2010 and 2011 combined, Rho division accounted for #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] percent of the company's total profits from both divisions. From 2008 to 2011, Rho division's profits increased by #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] percent.

*Blank 1 Options:* \ #sym.circle.stroked 26.8% \ #sym.circle.stroked 36.6% \ #sym.circle.stroked 42.4% \ #sym.circle.stroked 57.6%

*Blank 2 Options:* \ #sym.circle.stroked 100% \ #sym.circle.stroked 150% \ #sym.circle.stroked 200% \ #sym.circle.stroked 300%

#pagebreak()

=== S1-Q16 (GI - Hard)
_Source: GI-POOL-003_

#example-box(breakable: true)[
  *US Cities: Population vs. Land Area*

  _Bubble size represents GDP of metropolitan region_

  #align(center)[
    #canvas(length: 1cm, {
      import draw: *

      // Chart dimensions
      let width = 10
      let height = 7
      let x-max = 750
      let y-max = 9

      // Helper to convert data to canvas coordinates
      let to-canvas(x, y) = (x / x-max * width, y / y-max * height)

      // Draw axes
      line((0, 0), (width, 0), stroke: 0.5pt)
      line((0, 0), (0, height), stroke: 0.5pt)

      // X-axis ticks and labels
      for x in range(0, 8) {
        let xpos = x * width / 7
        line((xpos, 0), (xpos, -0.1), stroke: 0.5pt)
        content((xpos, -0.4), text(size: 8pt)[#(x * 100)])
      }
      content((width / 2, -0.9), text(size: 9pt)[Land Area (sq mi)])

      // Y-axis ticks and labels
      for y in range(0, 10) {
        let ypos = y * height / 9
        line((0, ypos), (-0.1, ypos), stroke: 0.5pt)
        content((-0.4, ypos), text(size: 8pt)[#y])
      }
      content((-0.9, height / 2), angle: 90deg, text(size: 9pt)[Population (millions)])

      // City bubbles (x, y, radius based on GDP, color, label)
      let cities = (
        (300, 8.3, 0.55, rgb("#3498db"), "NYC"),      // Largest GDP
        (470, 4.0, 0.45, rgb("#e74c3c"), "LA"),       // 2nd largest
        (230, 2.7, 0.38, rgb("#2ecc71"), "CHI"),      // 3rd
        (670, 2.3, 0.30, rgb("#9b59b6"), "HOU"),      // 4th
        (140, 1.6, 0.26, rgb("#f39c12"), "PHI"),      // 5th
        (380, 1.3, 0.30, rgb("#1abc9c"), "DAL"),      // 6th
        (130, 0.5, 0.18, rgb("#e67e22"), "ATL"),      // Smallest
        (90, 0.7, 0.26, rgb("#34495e"), "BOS"),       // 7th
      )

      for (x, y, r, col, name) in cities {
        let (cx, cy) = to-canvas(x, y)
        circle((cx, cy), radius: r, fill: col.lighten(60%), stroke: col + 1.5pt)
        content((cx, cy), text(size: 7pt, weight: "bold")[#name])
      }
    })
  ]
]

*Statement:* Among the eight cities shown, #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] is the city with the lowest population density. According to this graph, the population of a city is #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] with the size of the GDP of its metropolitan region.

*Blank 1 Options:* \ #sym.circle.stroked Atlanta \ #sym.circle.stroked Houston \ #sym.circle.stroked Dallas \ #sym.circle.stroked Boston

*Blank 2 Options:* \ #sym.circle.stroked positively correlated \ #sym.circle.stroked negatively correlated \ #sym.circle.stroked not correlated

#pagebreak()

== Table Analysis Questions (Set 1)

=== S1-Q17 (TA - Medium)
_Source: TA-POOL-001_

#example-box(breakable: true)[
  The table shows tertiary education data for selected countries:

  #table(
    columns: 3,
    stroke: 0.5pt + gray,
    inset: 6pt,
    align: (left, center, center),
    table.cell(fill: rgb("#3498db").lighten(80%))[*Country*],
    table.cell(fill: rgb("#3498db").lighten(80%))[*% of pop. over 20 in tertiary ed.*],
    table.cell(fill: rgb("#3498db").lighten(80%))[*Public spending per student (\$)*],
    [Sweden], [42%], [53.50],
    [Finland], [38%], [48.20],
    [Denmark], [35%], [51.00],
    [Norway], [32%], [49.80],
    [Australia], [28%], [42.30],
    [UK], [25%], [38.50],
    [Germany], [22%], [45.60],
    [France], [18%], [36.20],
    [Italy], [15%], [28.40],
    [Spain], [12%], [31.50],
  )
]

For each statement, select *Yes* if it can be inferred, or *No* if it cannot.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [No country with more than 25% of people over 20 in tertiary programs spends more than \$53.50 per student.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Every country with more than 30% enrollment spends at least \$48 per student.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [The median spending per student for these 10 countries is between \$40 and \$45.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
)]

#pagebreak()

=== S1-Q18 (TA - Hard)
_Source: TA-POOL-007_

#example-box(breakable: true)[
  The table shows quarterly revenue data for five regional offices of a consulting firm (in \$millions):

  #align(center)[
    #table(
      columns: 6,
      stroke: 0.5pt + gray,
      inset: 5pt,
      align: center,
      table.cell(fill: rgb("#3498db").lighten(80%))[*Office*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Q1*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Q2*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Q3*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Q4*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Total*],
      [Boston], [4.2], [5.1], [4.8], [6.3], [20.4],
      [Chicago], [3.8], [4.2], [5.5], [5.8], [19.3],
      [Denver], [2.1], [2.8], [3.2], [3.6], [11.7],
      [Miami], [3.5], [4.0], [3.8], [4.5], [15.8],
      [Seattle], [2.9], [3.3], [4.1], [4.8], [15.1],
    )
  ]

  Note: Each office has a different number of consultants. Boston has the most consultants and Denver has the fewest.
]

For each statement, select *Must be true* or *Need not be true*.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Must be true*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Need not be true*],
  [Boston had the highest revenue per consultant in Q4.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Denver had the lowest revenue per consultant for the year.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Every office had higher revenue in Q4 than in Q1.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
)]

#pagebreak()

== Multi-Source Reasoning Questions (Set 1)

=== S1-Q19 & S1-Q20 (MSR - Medium)
_Source: MSR-POOL-001_

#example-box(breakable: true)[
  *Tab 1 — Email from Administrator*

  From: Sarah Chen, Project Administrator\
  To: Research Team\
  Subject: Marketing Survey Response Rate\
  Date: March 15

  Team, we need 700 completed surveys for statistical significance. Our budget allows \$15 per completed survey, with \$12,000 allocated for respondent compensation. Please update me on current status.

  *Tab 2 — Email from Coordinator*

  From: Marcus Webb, Project Coordinator\
  To: Sarah Chen\
  Date: March 16

  Sarah, as of this morning we have 350 completed surveys. Based on current rates, we project 50 additional responses per day. We have 10 days until the planned close date. Note that response rates typically decline in final days.

  *Tab 3 — Budget Summary*

  #align(center)[
    #table(
      columns: 2,
      stroke: 0.5pt + gray,
      inset: 6pt,
      align: (left, right),
      table.cell(fill: rgb("#3498db").lighten(80%))[*Item*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Amount*],
      [Total Budget], [\$15,000],
      [Platform Fees], [\$2,000],
      [Respondent Compensation], [\$12,000],
      [Contingency Fund], [\$1,000],
    )
  ]

  Note: We have agreed to try not to exceed the allocated budget.
]

*S1-Q19:* For each statement, select *Yes* or *No*.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [The survey has currently received enough responses to meet the target.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Based on projections, the survey will definitely reach 700 responses before close.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [It is possible the project will need to exceed the compensation budget.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
)]

*S1-Q20:* Based on the information provided, what is the maximum number of surveys that can be completed within the allocated respondent compensation budget?

#sym.circle.stroked.big 700 \ #sym.circle.stroked.big 750 \ #sym.circle.stroked.big 800 \ #sym.circle.stroked.big 850  \ #sym.circle.stroked.big 1000

#pagebreak()

// ============================================================
// SET 1 ANSWER KEY
// ============================================================

// = Set 1: Answer Key

// #warning-box[
//   *Complete all questions before reviewing answers!*
// ]

// == DS Answers (Set 1)

// #align(center)[#table(
//   columns: 4,
//   stroke: 0.5pt + gray,
//   inset: 8pt,
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Q*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Answer*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Difficulty*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Key Insight*],
//   [S1-Q1], [C], [Easy], [Ratio 4:1 + total 20 → tulips = 4],
//   [S1-Q2], [D], [Easy], [Each gives exchange rate to find 250Y in X],
//   [S1-Q3], [C], [Easy], [3P + S = 1300 and P = 4S → 13S = 1300 → S = 100],
//   [S1-Q4], [A], [Medium], [Statement 1 ensures divisibility; Statement 2 is insufficient],
//   [S1-Q5], [D], [Medium], [Both give n = 2],
//   [S1-Q6], [C], [Hard], [Need both to ensure (r,s) satisfies y = 3x + 2],
//   [S1-Q7], [A], [Hard], [Statement 1 is definition of prime; Statement 2 allows 5 or 7],
//   [S1-Q8], [E], [Hard], [Neither statement alone nor together determines rodent count],
// )]

// == TPA Answers (Set 1)

// - *S1-Q9:* Total Time = $5d/120$, Average Speed = $48$
// - *S1-Q10:* Min Premium = 72, Max Standard = 128
// - *S1-Q11:* Initial Faculty = $5500/R$, Final Ratio = $((100+S)/(100+F))R$
// - *S1-Q12:* 1 Hour = $S/E$, 60 km = $60/E$
// - *S1-Q13:* Either Day = Murasaki, Neither Day = Longfellow

// == GI Answers (Set 1)

// - *S1-Q14:* Blank 1 = Commuter Trains (0.7→0.9 = 28.6%), Blank 2 = 45% (2.8/6.2)
// - *S1-Q15:* Blank 1 = 36.6% (15/41), Blank 2 = 200% ((9-3)/3)
// - *S1-Q16:* Blank 1 = Houston (lowest density), Blank 2 = positively correlated

// == TA Answers (Set 1)

// - *S1-Q17:* Yes, Yes, Yes
// - *S1-Q18:* Need not be true, Need not be true, Must be true (all offices increased Q1→Q4)

// == MSR Answers (Set 1)

// - *S1-Q19:* No, No, Yes
// - *S1-Q20:* 800 (\$12,000 ÷ \$15 = 800)

// #pagebreak()

// ============================================================
// SET 2
// ============================================================

= Set 2: Mixed Practice

#info-box[
  *Set 2 Overview:*
  - DS: 8 questions | TPA: 5 questions | GI: 3 questions | TA: 2 questions | MSR: 2 questions
  - Difficulty: 7 Easy, 7 Medium, 6 Hard
  - Target Time: 45 minutes
]

#pagebreak()

== Data Sufficiency Questions (Set 2)

=== S2-Q1 (DS - Easy)
_Source: DI-GMAT-OG-00310_

What is the value of $x$?

(1) $x + 1 = 2$

(2) $(x + 1)^2 = 4$

#v(0.5em)


=== S2-Q2 (DS - Easy)
_Source: DI-GMAT-OG-00315_

Is the integer $n$ odd?

(1) $n$ is divisible by 3.

(2) $n$ is divisible by 5.

#v(0.5em)


=== S2-Q3 (DS - Easy)
_Source: DI-GMAT-OG-00320_

If $x$ and $y$ are positive integers, what is the value of $x + y$?

(1) $x y = 6$

(2) $x < y$

#v(0.5em)


=== S2-Q4 (DS - Medium)
_Source: DI-GMAT-OG-00325_

If $a$ and $b$ are integers, is $a + b$ divisible by 7?

(1) $a$ is divisible by 7.

(2) $b$ is divisible by 7.

#v(0.5em)


=== S2-Q5 (DS - Medium)
_Source: DI-GMAT-OG-00330_

A group of 8 machines produces widgets. What is the average number of widgets produced per machine?

(1) The total number of widgets produced is 320.

(2) The machines produced widgets at the same rate.

#v(0.5em)


=== S2-Q6 (DS - Medium)
_Source: DI-GMAT-OG-00335_

Is $x > y$?

(1) $x = y + 2$

(2) $x/2 = y/2 + 1$

#v(0.5em)


=== S2-Q7 (DS - Hard)
_Source: DI-GMAT-OG-00340_

If $x$, $y$, and $z$ are positive numbers, is $x > y > z$?

(1) $x z > y z$

(2) $y/x < 1$

#v(0.5em)


=== S2-Q8 (DS - Hard)
_Source: DI-GMAT-OG-00345_

In a certain sequence, each term after the first is found by multiplying the previous term by a constant. If the 3rd term is 24 and the 6th term is 192, what is the 1st term?

(1) The 4th term is 48.

(2) The common ratio is positive.

#v(0.5em)


#pagebreak()

== Two-Part Analysis Questions (Set 2)

=== S2-Q9 (TPA - Easy)
_Source: DI-GMAT-PQ-00114_

A store's revenue from selling $n$ items at price $p$ each is $R = n p$. If the store sells 150 items and wants revenue of at least \$3,000:

Select the minimum price per item, and select the actual revenue if items are sold at \$25 each.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Min Price*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Revenue at \$25*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Value*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$15],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$20],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$25],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$3,000],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$3,750],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$4,500],
)]

=== S2-Q10 (TPA - Easy)
_Source: DI-GMAT-PQ-00116_

A tank contains 200 liters of a 30% salt solution. Pure water is added to dilute the solution.

Select the amount of water needed to create a 20% solution, and select the final volume of the 20% solution.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Water Added*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Final Volume*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Liters*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [50],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [100],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [200],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [250],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [300],
)]

=== S2-Q11 (TPA - Medium)
_Source: DI-GMAT-PQ-00120_

Two trains leave stations 480 km apart, traveling toward each other. Train A travels at 80 km/h and Train B at 60 km/h.

Select the time until they meet, and select the distance traveled by Train A when they meet.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Time*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Distance (A)*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Value*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [2.5 hours],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [3 hours],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [3.43 hours],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [200 km],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [240 km],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [274 km],
)]

=== S2-Q12 (TPA - Medium)
_Source: DI-GMAT-PQ-00125_

A company's profit function is $P(x) = -2x^2 + 120x - 1000$, where $x$ is units sold in thousands.

Select the number of units that maximizes profit, and select the maximum profit.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Units (thousands)*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Max Profit*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Value*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [20],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [30],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [60],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$600],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$800],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [\$1,000],
)]

=== S2-Q13 (TPA - Hard)
_Source: DI-GMAT-PQ-00130_

A committee of 5 must be formed from 6 men and 4 women. The committee must have at least 2 women.

Select the number of committees with exactly 2 women, and select the number of committees with at least 2 women.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 8pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Exactly 2 Women*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*At Least 2 Women*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Number*],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [60],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [120],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [186],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [246],
  [#sym.circle.stroked.big], [#sym.circle.stroked.big], [252],
)]

#pagebreak()

== Graphics Interpretation Questions (Set 2)

=== S2-Q14 (GI - Easy)
_Source: GI-POOL-004_

#example-box(breakable: true)[
  *Goliath Corporation's 2010 Revenue Distribution*

  Total revenue: \$500 million

  #align(center)[
    #canvas({
      chart.piechart(
        (45, 25, 20, 10),
        radius: 2.5,
        slice-style: (rgb("#3498db"), rgb("#e74c3c"), rgb("#2ecc71"), rgb("#9b59b6")),
        outer-label: (content: "%", radius: 120%),

      )
    })
    #v(5pt)
    #text(size: 9pt)[
      #box(fill: rgb("#3498db"), width: 10pt, height: 10pt) Grocery (45%)
      #h(8pt)
      #box(fill: rgb("#e74c3c"), width: 10pt, height: 10pt) Foreign Exports (25%)
      #h(8pt)
      #box(fill: rgb("#2ecc71"), width: 10pt, height: 10pt) Gov. Contracts (20%)
      #h(8pt)
      #box(fill: rgb("#9b59b6"), width: 10pt, height: 10pt) Online (10%)
    ]
  ]

  _Grocery breakdown by region:_ Northeast 30%, Midwest 40%, South 20%, West 10%
]

*Statement:* The revenue from foreign exports is #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] the revenue from grocery stores in the Northeast. Revenue from government contracts would have to increase by approximately #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] to equal revenue from grocery sales in the Midwest.

*Blank 1 Options:* \ #sym.circle.stroked greater than \ #sym.circle.stroked less than \ #sym.circle.stroked equal to

*Blank 2 Options:* \ #sym.circle.stroked 50% \ #sym.circle.stroked 80% \ #sym.circle.stroked 101% \ #sym.circle.stroked 125%

#pagebreak()

=== S2-Q15 (GI - Medium)
_Source: GI-POOL-005_

#example-box(breakable: true)[
  *Apex Appliance Monthly Data (2011-2012)*

  #align(center)[
    #canvas({
      plot.plot(
        size: (10, 6),
        x-tick-step: 10,
        x-min: 35,
        x-max: 105,
        y-tick-step: 1,
        y-min: 2,
        y-max: 9,
        x-label: "Monthly Visitors (thousands)",
        y-label: "Sales Revenue (millions \$)",
        legend: "inner-south-east",
        x-grid: true,
        y-grid: true,
        {
          // Q4 months (Oct-Dec) - higher visitors and sales
          plot.add(
            ((85, 5.5), (88, 6.2), (92, 7.0), (95, 7.5), (98, 7.8), (100, 8.0)),
            mark: "o",
            mark-size: 0.15,
            style: (stroke: none, fill: rgb("#e74c3c")),
            label: "Q4 months"
          )
          // Non-Q4 months - lower visitors and sales
          plot.add(
            ((42, 3.2), (45, 3.5), (48, 3.8), (50, 4.0), (52, 4.2), (55, 4.5),
             (58, 4.7), (60, 4.9), (62, 5.0), (64, 5.2), (66, 5.4), (68, 5.5),
             (70, 5.6), (72, 5.7), (73, 5.8), (74, 5.9), (75, 6.0), (44, 3.4)),
            mark: "square",
            mark-size: 0.12,
            style: (stroke: none, fill: rgb("#3498db")),
            label: "Other months"
          )
        }
      )
    })
  ]
]

*Statement:* During this two-year period, Apex had #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] non-fourth-quarter month(s) with higher sales revenue than the fourth-quarter month with the lowest sales. In the month with the highest sales yield (revenue per visitor), Apex earned approximately #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] in revenue.

*Blank 1 Options:* \ #sym.circle.stroked 0 \ #sym.circle.stroked 1 \ #sym.circle.stroked 2 \ #sym.circle.stroked 3

*Blank 2 Options:* \ #sym.circle.stroked \$5.5 million \ #sym.circle.stroked \$6.5 million \ #sym.circle.stroked \$7.5 million \ #sym.circle.stroked \$8.0 million

#pagebreak()

=== S2-Q16 (GI - Hard)
_Source: GI-POOL-006_

#example-box(breakable: true)[
  *Academic Competition Results by Round*

  #align(center)[
    #canvas({
      draw.set-style(barchart: (bar-width: 0.7))
      chart.barchart(
        mode: "stacked",
        size: (10, 5),
        label-key: 0,
        value-key: (1, 2, 3),
        x-tick-step: 20,
        x-label: "Percentage",
        (
          ([Round 1], 20, 40, 40),
          ([Round 2], 20, 50, 30),
          ([Round 3], 40, 40, 20),
        ),
        labels: ([Win], [Place], [Lose]),
        legend: "north-east",
      )
    })
  ]

  _Only those who Win or Place advance to the next round._
  _Commendations are awarded for each Win or Place._
]

*Statement:* If 100,000 participants start, #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] of them would win the entire competition. Exactly #box(stroke: 0.5pt, inset: 4pt)[\_\_\_\_] % of participants who start acquire exactly two commendations.

*Blank 1 Options:* \ #sym.circle.stroked 800 \ #sym.circle.stroked 2,400 \ #sym.circle.stroked 4,800 \ #sym.circle.stroked 8,000

*Blank 2 Options:* \ #sym.circle.stroked 14.4% \ #sym.circle.stroked 21.6% \ #sym.circle.stroked 28.8% \ #sym.circle.stroked 36.0%

#pagebreak()

== Table Analysis Questions (Set 2)

=== S2-Q17 (TA - Easy)
_Source: TA-POOL-003_

#example-box(breakable: true)[
  Brazilian agricultural products in 2009:

  #table(
    columns: 5,
    stroke: 0.5pt + gray,
    inset: 5pt,
    align: (left, center, center, center, center),
    table.cell(fill: rgb("#3498db").lighten(80%))[*Commodity*],
    table.cell(fill: rgb("#3498db").lighten(80%))[*Prod. Share*],
    table.cell(fill: rgb("#3498db").lighten(80%))[*Prod. Rank*],
    table.cell(fill: rgb("#3498db").lighten(80%))[*Export Share*],
    table.cell(fill: rgb("#3498db").lighten(80%))[*Export Rank*],
    [Coffee], [40%], [1], [32%], [1],
    [Orange juice], [56%], [1], [82%], [1],
    [Sugar], [21%], [1], [44%], [1],
    [Soybeans], [27%], [2], [40%], [2],
    [Beef], [16%], [2], [22%], [1],
    [Chickens], [15%], [3], [38%], [1],
    [Corn], [8%], [4], [10%], [2],
    [Cotton], [5%], [5], [10%], [4],
    [Pork], [4%], [4], [12%], [4],
  )
]

For each statement, select *Yes* or *No*.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [Brazil ranks first in both production and exports for exactly 3 commodities.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [For every commodity where Brazil ranks first in exports, Brazil produces at least 15% of world supply.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [The median export share for these commodities is between 20% and 30%.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
)]

=== S2-Q18 (TA - Medium)
_Source: TA-POOL-008_

#example-box(breakable: true)[
  Product sales data for an electronics retailer (units sold by category):

  #align(center)[
    #table(
      columns: 5,
      stroke: 0.5pt + gray,
      inset: 5pt,
      align: center,
      table.cell(fill: rgb("#3498db").lighten(80%))[*Product*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Jan*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Feb*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Mar*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Avg Price*],
      [Laptops], [120], [145], [132], [\$850],
      [Tablets], [85], [92], [110], [\$420],
      [Phones], [210], [195], [240], [\$680],
      [Monitors], [65], [78], [71], [\$320],
      [Accessories], [340], [285], [310], [\$45],
    )
  ]

  Note: Revenue = Units × Price
]

For each statement, select *Yes* if it can be determined or *No* if it cannot.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [The category with highest Q1 revenue was Phones.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Total Q1 revenue from all categories exceeded \$500,000.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Tablets had the largest percentage increase in units from Jan to Mar.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
)]

#pagebreak()

== Multi-Source Reasoning Questions (Set 2)

=== S2-Q19 & S2-Q20 (MSR - Hard)
_Source: MSR-POOL-005_

#example-box(breakable: true)[
  *Tab 1 — Greenhouse Gas Reduction Policy*

  The city council is evaluating proposals to reduce greenhouse gas emissions. Each proposal has an implementation cost, estimated annual savings, and projected emission reduction. A proposal must achieve at least 15% emission reduction to qualify for federal matching funds.

  *Tab 2 — Proposal Details*

  #align(center)[
    #table(
      columns: 4,
      stroke: 0.5pt + gray,
      inset: 5pt,
      align: center,
      table.cell(fill: rgb("#3498db").lighten(80%))[*Proposal*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Cost (M)*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Annual Savings*],
      table.cell(fill: rgb("#3498db").lighten(80%))[*Emission Cut*],
      [Solar Panel Initiative], [\$12], [\$2.1M], [18%],
      [Public Transit Expansion], [\$25], [\$4.5M], [22%],
      [Building Efficiency], [\$8], [\$1.8M], [12%],
      [Electric Fleet Conversion], [\$15], [\$2.8M], [16%],
      [Bike Infrastructure], [\$5], [\$0.6M], [8%],
    )
  ]

  *Tab 3 — Budget Constraints*

  The city has \$30 million available. Federal matching would cover 50% of qualifying projects' costs. The council prefers projects with payback periods under 6 years (Payback = Cost / Annual Savings).
]

*S2-Q19:* For each statement, select *Yes* or *No*.

#align(center)[#table(
  columns: 3,
  stroke: 0.5pt + gray,
  inset: 10pt,
  table.cell(fill: rgb("#3498db").lighten(90%))[*Statement*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*Yes*],
  table.cell(fill: rgb("#3498db").lighten(90%))[*No*],
  [Building Efficiency qualifies for federal matching funds.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [The city can afford all three qualifying proposals without federal help.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
  [Public Transit Expansion has the shortest payback period of the qualifying proposals.], [#sym.circle.stroked.big], [#sym.circle.stroked.big],
)]

*S2-Q20:* If the city chooses only proposals that qualify for federal matching and have payback periods under 6 years, what is the maximum emission reduction achievable?

#sym.circle.stroked.big 18% \ #sym.circle.stroked.big 34% \ #sym.circle.stroked.big 40% \ #sym.circle.stroked.big 56%

// #pagebreak()

// ============================================================
// SET 2 ANSWER KEY
// ============================================================

// = Set 2: Answer Key

// == DS Answers (Set 2)

// #align(center)[#table(
//   columns: 4,
//   stroke: 0.5pt + gray,
//   inset: 8pt,
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Q*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Answer*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Difficulty*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Key Insight*],
//   [S2-Q1], [A], [Easy], [Statement 1 gives x=1; Statement 2 gives x=1 or x=-3],
//   [S2-Q2], [E], [Easy], [Neither divisibility by 3 nor 5 determines odd/even],
//   [S2-Q3], [C], [Easy], [xy=6 gives (1,6), (2,3), (3,2), (6,1); with $x < y$, only (2,3)],
//   [S2-Q4], [C], [Medium], [Need both a and b divisible by 7 for a+b to be divisible],
//   [S2-Q5], [A], [Medium], [Statement 1: 320/8=40; Statement 2 gives no total],
//   [S2-Q6], [D], [Medium], [Both statements give x = y + 2, so x > y],
//   [S2-Q7], [E], [Hard], [Can determine x>y but not y>z],
//   [S2-Q8], [B], [Hard], [Need positive ratio to determine unique first term],
// )]

// == TPA Answers (Set 2)

// - *S2-Q9:* Min Price = \$20, Revenue at \$25 = \$3,750
// - *S2-Q10:* Water Added = 100, Final Volume = 300
// - *S2-Q11:* Time = 3.43 hours, Distance (A) = 274 km
// - *S2-Q12:* Units = 30 (thousands), Max Profit = \$800
// - *S2-Q13:* Exactly 2 Women = 120, At Least 2 Women = 186

// == GI Answers (Set 2)

// - *S2-Q14:* Blank 1 = greater than (25% > 13.5%), Blank 2 = 80%
// - *S2-Q15:* Blank 1 = 3, Blank 2 = \$7.5 million
// - *S2-Q16:* Blank 1 = 4,800, Blank 2 = 21.6%

// == TA Answers (Set 2)

// - *S2-Q17:* Yes (Coffee, OJ, Sugar), No (Chickens 15%), No (median is 22%)
// - *S2-Q18:* Yes (Phones: 210×680+195×680+240×680 = \$438,900), Yes (\$522,525 total), Yes (Tablets: 29.4%)

// == MSR Answers (Set 2)

// - *S2-Q19:* No (12% < 15%), No (Solar+Transit+Electric = \$52M > \$30M), Yes (Transit: 5.6 yrs)
// - *S2-Q20:* 56% (Solar 18% + Transit 22% + Electric 16%)

// #pagebreak()

// ============================================================
// SETS 3-5: PLACEHOLDER STRUCTURE
// ============================================================

// = Sets 3-5: Additional Practice

// #info-box[
//   *Note:* Sets 3-5 follow the same structure as Sets 1-2:
//   - Each set contains 20 questions
//   - Distribution: 8 DS, 5 TPA, 3 GI, 2 TA, 2 MSR
//   - Difficulty: ~7 Easy, ~7 Medium, ~6 Hard per set

//   *Question Sources:*
//   - DS questions from: DI-GMAT-OG (Official Guide), DI-GMAT-PQ (Practice Questions)
//   - TPA questions from: DI-GMAT-OG-TPA, DI-GMAT-PQ-TPA
//   - GI/TA/MSR questions from: DI-GMAT-PT1, DI-GMAT-SK, and supplemental pool
// ]

// #pagebreak()

// = Set 3: Quick Reference

// == Question List

// #align(center)[#table(
//   columns: 5,
//   stroke: 0.5pt + gray,
//   inset: 6pt,
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Q\#*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Type*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Difficulty*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Source*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Answer*],
//   [S3-Q1], [DS], [Easy], [DI-GMAT-OG-00350], [D],
//   [S3-Q2], [DS], [Easy], [DI-GMAT-OG-00355], [A],
//   [S3-Q3], [DS], [Medium], [DI-GMAT-OG-00360], [C],
//   [S3-Q4], [DS], [Medium], [DI-GMAT-OG-00365], [B],
//   [S3-Q5], [DS], [Medium], [DI-GMAT-OG-00370], [E],
//   [S3-Q6], [DS], [Hard], [DI-GMAT-OG-00375], [C],
//   [S3-Q7], [DS], [Hard], [DI-GMAT-OG-00380], [A],
//   [S3-Q8], [DS], [Hard], [DI-GMAT-OG-00385], [D],
//   [S3-Q9], [TPA], [Easy], [DI-GMAT-PQ-00135], [See key],
//   [S3-Q10], [TPA], [Easy], [DI-GMAT-PQ-00140], [See key],
//   [S3-Q11], [TPA], [Medium], [DI-GMAT-PQ-00145], [See key],
//   [S3-Q12], [TPA], [Medium], [DI-GMAT-PQ-00150], [See key],
//   [S3-Q13], [TPA], [Hard], [DI-GMAT-PQ-00155], [See key],
//   [S3-Q14], [GI], [Easy], [GI-POOL-007], [See key],
//   [S3-Q15], [GI], [Medium], [GI-POOL-008], [See key],
//   [S3-Q16], [GI], [Hard], [GI-POOL-009], [See key],
//   [S3-Q17], [TA], [Medium], [TA-POOL-005], [See key],
//   [S3-Q18], [TA], [Hard], [TA-POOL-006], [See key],
//   [S3-Q19], [MSR], [Medium], [MSR-POOL-003], [See key],
//   [S3-Q20], [MSR], [Hard], [MSR-POOL-004], [See key],
// )]

// #pagebreak()

// = Set 4: Quick Reference

// == Question List

// #align(center)[#table(
//   columns: 5,
//   stroke: 0.5pt + gray,
//   inset: 6pt,
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Q\#*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Type*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Difficulty*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Source*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Answer*],
//   [S4-Q1], [DS], [Easy], [DI-GMAT-OG-00390], [B],
//   [S4-Q2], [DS], [Easy], [DI-GMAT-OG-00395], [D],
//   [S4-Q3], [DS], [Medium], [DI-GMAT-PQ-01020], [C],
//   [S4-Q4], [DS], [Medium], [DI-GMAT-PQ-01025], [A],
//   [S4-Q5], [DS], [Medium], [DI-GMAT-PQ-01030], [E],
//   [S4-Q6], [DS], [Hard], [DI-GMAT-PQ-01035], [B],
//   [S4-Q7], [DS], [Hard], [DI-GMAT-PQ-01040], [C],
//   [S4-Q8], [DS], [Hard], [DI-GMAT-PQ-01045], [A],
//   [S4-Q9], [TPA], [Easy], [DI-GMAT-OG-00425], [See key],
//   [S4-Q10], [TPA], [Easy], [DI-GMAT-OG-00428], [See key],
//   [S4-Q11], [TPA], [Medium], [DI-GMAT-OG-00430], [See key],
//   [S4-Q12], [TPA], [Medium], [DI-GMAT-OG-00432], [See key],
//   [S4-Q13], [TPA], [Hard], [DI-GMAT-OG-00435], [See key],
//   [S4-Q14], [GI], [Easy], [DI-GMAT-PT1-00013], [See key],
//   [S4-Q15], [GI], [Medium], [DI-GMAT-PT1-00014], [See key],
//   [S4-Q16], [GI], [Hard], [DI-GMAT-PT1-00015], [See key],
//   [S4-Q17], [TA], [Medium], [DI-GMAT-PT1-00003], [See key],
//   [S4-Q18], [TA], [Hard], [DI-GMAT-PT1-00010], [See key],
//   [S4-Q19], [MSR], [Medium], [DI-GMAT-SK-00013], [See key],
//   [S4-Q20], [MSR], [Hard], [DI-GMAT-SK-00016], [See key],
// )]

// #pagebreak()

// = Set 5: Quick Reference

// == Question List

// #align(center)[#table(
//   columns: 5,
//   stroke: 0.5pt + gray,
//   inset: 6pt,
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Q\#*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Type*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Difficulty*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Source*],
//   table.cell(fill: rgb("#3498db").lighten(90%))[*Answer*],
//   [S5-Q1], [DS], [Easy], [DI-GMAT-PQ-01050], [A],
//   [S5-Q2], [DS], [Easy], [DI-GMAT-PQ-01055], [D],
//   [S5-Q3], [DS], [Medium], [DI-GMAT-PQ-01060], [B],
//   [S5-Q4], [DS], [Medium], [DI-GMAT-PQ-01065], [C],
//   [S5-Q5], [DS], [Medium], [DI-GMAT-PQ-01070], [E],
//   [S5-Q6], [DS], [Hard], [DI-GMAT-PQ-01075], [A],
//   [S5-Q7], [DS], [Hard], [DI-GMAT-PQ-01080], [D],
//   [S5-Q8], [DS], [Hard], [DI-GMAT-PQ-01085], [C],
//   [S5-Q9], [TPA], [Easy], [DI-GMAT-PQ-00160], [See key],
//   [S5-Q10], [TPA], [Easy], [DI-GMAT-PQ-00165], [See key],
//   [S5-Q11], [TPA], [Medium], [DI-GMAT-PQ-00170], [See key],
//   [S5-Q12], [TPA], [Medium], [DI-GMAT-SK-00011], [See key],
//   [S5-Q13], [TPA], [Hard], [DI-GMAT-SK-00012], [See key],
//   [S5-Q14], [GI], [Easy], [GI-POOL-010], [See key],
//   [S5-Q15], [GI], [Medium], [GI-POOL-011], [See key],
//   [S5-Q16], [GI], [Hard], [GI-POOL-012], [See key],
//   [S5-Q17], [TA], [Medium], [DI-GMAT-SK-00019], [See key],
//   [S5-Q18], [TA], [Hard], [DI-GMAT-SK-00022], [See key],
//   [S5-Q19], [MSR], [Medium], [DI-GMAT-SK-00014], [See key],
//   [S5-Q20], [MSR], [Hard], [DI-GMAT-SK-00017], [See key],
// )]

// #pagebreak()

// = Overall Statistics

// #info-box[
//   *Question Pool Summary:*

//   *By Question Type (100 questions total):*
//   - Data Sufficiency: 40 questions (40%)
//   - Two-Part Analysis: 25 questions (25%)
//   - Graphics Interpretation: 15 questions (15%)
//   - Table Analysis: 10 questions (10%)
//   - Multi-Source Reasoning: 10 questions (10%)

//   *By Difficulty (100 questions total):*
//   - Easy: 33-35 questions (~34%)
//   - Medium: 33-35 questions (~34%)
//   - Hard: 30-32 questions (~32%)

//   *Sources Used:*
//   - Official Guide (OG): DS and TPA questions
//   - Practice Questions (PQ): DS and TPA questions
//   - Practice Test 1 (PT1): Mixed question types
//   - Supplemental (SK): MSR and TA questions
//   - Custom Pool: Additional GI, TA, MSR questions
// ]

// = Question Type Distribution by Set

// #align(center)[#table(
//   columns: 7,
//   stroke: 0.5pt + gray,
//   inset: 8pt,
//   align: center,
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Set*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*DS*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*TPA*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*GI*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*TA*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*MSR*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Total*],
//   [Set 1], [8], [5], [3], [2], [2], [20],
//   [Set 2], [8], [5], [3], [2], [2], [20],
//   [Set 3], [8], [5], [3], [2], [2], [20],
//   [Set 4], [8], [5], [3], [2], [2], [20],
//   [Set 5], [8], [5], [3], [2], [2], [20],
//   [*Total*], [*40*], [*25*], [*15*], [*10*], [*10*], [*100*],
// )]

// = Difficulty Distribution by Set

// #align(center)[#table(
//   columns: 5,
//   stroke: 0.5pt + gray,
//   inset: 8pt,
//   align: center,
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Set*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Easy*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Medium*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Hard*],
//   table.cell(fill: rgb("#3498db").lighten(80%))[*Total*],
//   [Set 1], [7], [7], [6], [20],
//   [Set 2], [7], [7], [6], [20],
//   [Set 3], [6], [8], [6], [20],
//   [Set 4], [7], [7], [6], [20],
//   [Set 5], [7], [6], [7], [20],
//   [*Total*], [*34*], [*35*], [*31*], [*100*],
// )]
