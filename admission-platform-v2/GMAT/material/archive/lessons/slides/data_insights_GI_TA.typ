#import "@preview/slydst:0.1.5": *
#import "@preview/cetz:0.3.2"
#import "@preview/cetz-plot:0.1.1"

// UpToTen Brand Colors
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

#show: slides.with(
  title: "GMAT Data Insights",
  subtitle: "Graphics Interpretation & Table Analysis",
  date: none,
  authors: ("UpToTen - Learn STEM More",),
  layout: "medium",
  ratio: 16/9,
  title-color: uptoten-blue,
)

// Custom styling
#set text(font: "Arial", size: 12pt)
#set par(justify: true, leading: 0.8em)
#set list(spacing: 0.8em)
#set enum(spacing: 0.8em)

// Custom box styles
#let info-box(content) = box(
  fill: uptoten-blue.lighten(90%),
  inset: 12pt,
  radius: 6pt,
  width: 100%,
  [#set text(size: 12pt)
   #content]
)

#let tip-box(content) = box(
  fill: uptoten-green.lighten(85%),
  inset: 12pt,
  radius: 6pt,
  width: 100%,
  [#set text(size: 12pt)
   #content]
)

#let warning-box(content) = box(
  fill: uptoten-orange.lighten(85%),
  inset: 12pt,
  radius: 6pt,
  width: 100%,
  [#set text(size: 12pt)
   #content]
)

#let question-box(content, difficulty: "medium") = {
  let fill-color = if difficulty == "easy" { rgb("#e8f5e9") } else if difficulty == "hard" { rgb("#ffebee") } else { rgb("#fff3e0") }
  box(
    fill: fill-color,
    inset: 12pt,
    radius: 6pt,
    width: 100%,
    stroke: 1pt + gray,
    [#set text(size: 12pt)
     #content]
  )
}

// Helper function for bar chart - cleaner style matching reference
#let simple-barchart(data, width: 10, height: 5, bar-color: uptoten-blue, show-grid: true, y-label: none) = {
  cetz.canvas(length: 0.7cm, {
    import cetz.draw: *

    let n = data.len()
    let max-val = calc.max(..data.map(d => d.at(1)))
    // Round up max-val to nice number for axis
    let axis-max = calc.ceil(max-val / 10) * 10
    if axis-max < max-val { axis-max = axis-max + 10 }
    let bar-width = 0.5
    let spacing = width / n

    // Draw horizontal gridlines (lighter, more subtle)
    if show-grid {
      for i in range(1, 6) {
        let y = i * height / 5
        line((0, y), (width, y), stroke: 0.4pt + gray.lighten(50%))
      }
    }

    // Draw axes (clean school-book style)
    line((0, 0), (width, 0), stroke: 1pt + black)
    line((0, 0), (0, height), stroke: 1pt + black)

    // Draw bars and labels
    for (i, item) in data.enumerate() {
      let (label, value) = item
      let bar-height = (value / axis-max) * height
      let x = i * spacing + spacing / 2

      // Bar with solid fill and subtle stroke
      rect(
        (x - bar-width / 2, 0),
        (x + bar-width / 2, bar-height),
        fill: bar-color,
        stroke: 0.5pt + bar-color.darken(30%)
      )

      // Label below bar
      content((x, -0.3), text(size: 6pt)[#label])

      // Value on top of bar
      content((x, bar-height + 0.2), text(size: 5pt, fill: gray.darken(20%))[#value])
    }

    // Y-axis labels and tick marks
    for i in range(0, 6) {
      let y = i * height / 5
      let val = int(i * axis-max / 5)
      content((-0.4, y), text(size: 6pt)[#val], anchor: "east")
      line((-0.08, y), (0, y), stroke: 0.5pt + black)
    }

    // Y-axis label if provided
    if y-label != none {
      group({
        translate((-0.9, height / 2))
        rotate(90deg)
        content((0, 0), text(size: 7pt, weight: "medium")[#y-label])
      })
    }
  })
}

// Helper function for line chart using cetz-plot for professional appearance
#let simple-linechart(data, width: 10, height: 5, x-min: 0, x-max: 100, y-min: 0, y-max: 100, line-color: uptoten-blue, x-label: "", y-label: "", show-grid: true, show-area: false) = {
  cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (width * 0.6, height * 0.6),
      x-label: x-label,
      y-label: y-label,
      x-min: x-min,
      x-max: x-max,
      y-min: y-min,
      y-max: y-max,
      x-tick-step: (x-max - x-min) / 5,
      y-tick-step: (y-max - y-min) / 5,
      axis-style: "school-book",
      {
        // Main line with markers
        plot.add(
          data,
          mark: "o",
          mark-size: 0.12,
          style: (stroke: line-color + 2pt),
          mark-style: (fill: white, stroke: line-color + 1.5pt)
        )
      }
    )
  })
}

// Helper function for scatter plot with trend line using cetz-plot
#let scatter-plot(data, width: 10, height: 5, x-min: 0, x-max: 12, y-min: 50, y-max: 100, point-color: uptoten-blue, trend-fn: none, x-label: "", y-label: "", show-grid: true) = {
  cetz.canvas({
    import cetz.draw: *
    import cetz-plot: *

    plot.plot(
      size: (width * 0.6, height * 0.6),
      x-label: x-label,
      y-label: y-label,
      x-min: x-min,
      x-max: x-max,
      y-min: y-min,
      y-max: y-max,
      x-tick-step: 2,
      y-tick-step: 10,
      axis-style: "school-book",
      {
        // Scatter points
        plot.add(
          data,
          mark: "o",
          mark-size: 0.1,
          style: (stroke: none),
          mark-style: (fill: point-color, stroke: point-color.darken(20%) + 1pt)
        )
        // Trend line if provided
        if trend-fn != none {
          plot.add(
            ((x-min + 0.5, trend-fn(x-min + 0.5)), (x-max - 0.5, trend-fn(x-max - 0.5))),
            style: (stroke: (paint: red.darken(10%), dash: "dashed", thickness: 1.5pt))
          )
        }
      }
    )
  })
}

= Graphics Interpretation

== GI Question 1 (Easy)

#v(0.1fr)

#question-box(difficulty: "easy")[
  *Number of Vehicles Entering and Exiting an Intersection by Direction*

  #align(center)[
    #simple-barchart(
      (
        ("N→E", 65), ("N→S", 80), ("N→W", 70),
        ("E→N", 45), ("E→S", 40), ("E→W", 55),
        ("S→N", 95), ("S→E", 85), ("S→W", 65),
        ("W→N", 25), ("W→E", 85), ("W→S", 20),
      ),
      width: 11,
      height: 3.8,
      y-label: [Vehicles],
    )
  ]
]

#v(1fr)

== GI Question 1 - Statement

#v(0.3fr)

#info-box[
  A study was conducted to determine how many vehicles passed through a busy intersection during various times of day and what trajectories they took.
]

#v(0.3fr)

Complete the following statement using the dropdown options:

#v(0.2fr)

#warning-box[
  During the hour, the greatest number of vehicles entered the intersection from the *[BLANK1]*, and among those vehicles entering from that direction, the greatest number exited to the *[BLANK2]*.
]

#v(0.2fr)

*Options for BLANK1:* north, east, south, west

*Options for BLANK2:* north, east, south, west

#v(1fr)

== GI Question 1 - Solution

#v(0.2fr)

*Step 1: Find which direction had the most vehicles entering*

#set text(size: 11pt)
- From North: 65 + 80 + 70 = *215 vehicles*
- From East: 45 + 40 + 55 = *140 vehicles*
- From South: 95 + 85 + 65 = *245 vehicles* ← Maximum
- From West: 25 + 85 + 20 = *130 vehicles*
#set text(size: 12pt)

#v(0.2fr)

*Step 2: Among vehicles from South, which exit had the most?*

- South → North: *95 vehicles* ← Maximum
- South → East: 85 vehicles
- South → West: 65 vehicles

#v(0.2fr)

#tip-box[
  *Answer:* BLANK1 = *south*, BLANK2 = *north*
]

#v(1fr)

== GI Question 2 (Easy)

#v(0.1fr)

#question-box(difficulty: "easy")[
  *Temperature Deviations from the Daily Expected High Temperature*

  #align(center)[
    #simple-barchart(
      (
        ("-12°F", 2), ("-8°F", 12), ("-4°F", 18), ("0°F", 34),
        ("+4°F", 16), ("+8°F", 15), ("+12°F", 3),
      ),
      width: 9,
      height: 3.8,
      bar-color: uptoten-orange,
      y-label: [Days],
    )
  ]

  #set text(size: 10pt)
  Each class includes deviations from $(T-2)$°F to $(T+2)$°F. Total: 100 days.
]

#v(1fr)

== GI Question 2 - Statement

#v(0.3fr)

#info-box[
  - "More than $x$°F *less than seasonal*" = deviation < $-2 - x$
  - "More than $x$°F *greater than seasonal*" = deviation > $+2 + x$
]

#v(0.3fr)

#warning-box[
  For a randomly selected day in this 100-day period, the probability that the high temperature was more than 4°F less than seasonal is *[BLANK1]* and the probability that the high temperature was more than 8°F less than seasonal is *[BLANK2]*.
]

#v(0.2fr)

*Options:* 0.02, 0.12, 0.14, 0.32, 0.34

#v(1fr)

== GI Question 2 - Solution

#v(0.2fr)

*Understanding "less than seasonal":*
- The class centered at 0 has left endpoint = $-2$°F
- "More than 4°F less than seasonal" means deviation < $-2 - 4 = -6$°F
- "More than 8°F less than seasonal" means deviation < $-2 - 8 = -10$°F

#v(0.2fr)

*Calculating probabilities:*

- Days with deviation < $-6$°F: Classes centered at $-8$ and $-12$
  - Count: $12 + 2 = 14$ days → P = $14/100 = *0.14*$

- Days with deviation < $-10$°F: Only class centered at $-12$
  - Count: $2$ days → P = $2/100 = *0.02*$

#v(0.2fr)

#tip-box[
  *Answer:* BLANK1 = *0.14*, BLANK2 = *0.02*
]

#v(1fr)

== GI Question 3 (Hard)

#v(0.1fr)

#question-box(difficulty: "hard")[
  *Total World Credit Market Debt (TWCMD)*

  #align(center)[
    #simple-linechart(
      ((1972, 3), (1977, 5), (1982, 8), (1987, 12), (1992, 18), (1997, 25), (2002, 35), (2007, 45)),
      width: 10,
      height: 4.2,
      x-min: 1970,
      x-max: 2010,
      y-min: 0,
      y-max: 50,
      x-label: "Year",
      y-label: "US$ (trillions)",
    )
  ]

  #set text(size: 10pt)
  The data is modeled by: $y = N dot 2^(k(t - 1972))$ where $N$, $k$ are positive constants.
]

#v(1fr)

== GI Question 3 - Statement

#v(0.3fr)

#info-box[
  The equation $y = N dot 2^(k(t - 1972))$ models the Total World Credit Market Debt.

  At $t = 1972$: $y = N dot 2^0 = N$, so $N$ = TWCMD value in 1972.
]

#v(0.3fr)

#warning-box[
  The constant $N$ is approximately equal to *[BLANK1]*.

  If the model continues to be accurate beyond 2007, the TWCMD will equal approximately double the 2007 value in the year *[BLANK2]*.
]

#v(0.2fr)

*Options for BLANK1:* 1, 2, 3, 4, 5

*Options for BLANK2:* 2012, 2014, 2016, 2018, 2020

#v(1fr)

== GI Question 3 - Solution

#v(0.2fr)

*Finding N:*

From the graph, at $t = 1972$: TWCMD ≈ 3 trillion

Since $y = N dot 2^(k(1972-1972)) = N dot 2^0 = N$ → *N ≈ 3*

#v(0.2fr)

*Finding doubling time:*

From the graph: TWCMD roughly doubles every 9 years
- 1972: ~3 → 1981: ~6 → 1990: ~12 → 1999: ~24 → 2008: ~48

At 2007: ~45 trillion. Double would be ~90 trillion.

Adding ~9 years: 2007 + 9 = *2016*

#v(0.2fr)

#tip-box[
  *Answer:* BLANK1 = *3*, BLANK2 = *2016*
]

#v(1fr)

== GI Question 4 (Medium) - Scatter Plot

#v(0.1fr)

#question-box(difficulty: "medium")[
  *Relationship Between Study Hours and Test Scores*

  #align(center)[
    #scatter-plot(
      ((1, 55), (2, 62), (2.5, 58), (3, 65), (4, 70), (4.5, 68),
       (5, 72), (5.5, 75), (6, 78), (7, 82), (7.5, 80), (8, 85),
       (9, 88), (9.5, 86), (10, 92), (11, 95)),
      width: 10,
      height: 4.2,
      x-min: 0,
      x-max: 12,
      y-min: 50,
      y-max: 100,
      point-color: uptoten-green,
      trend-fn: x => 54 + 3.8 * x,
      x-label: "Hours Studied",
      y-label: "Test Score",
    )
  ]

  #set text(size: 10pt)
  The dashed line represents the best-fit linear regression: $y = 54 + 3.8x$
]

#v(1fr)

== GI Question 4 - Statement

#v(0.3fr)

#info-box[
  A study examined the relationship between hours spent studying and test scores for 16 students. The best-fit line has equation: $y = 54 + 3.8x$
]

#v(0.3fr)

#warning-box[
  The correlation between study hours and test score is *[BLANK1]*. According to the regression equation, a student who studies for 6 hours would be predicted to score approximately *[BLANK2]*.
]

#v(0.2fr)

*Options for BLANK1:* strong negative, weak negative, no correlation, weak positive, strong positive

*Options for BLANK2:* 65, 72, 77, 82, 88

#v(1fr)

== GI Question 4 - Solution

#v(0.2fr)

*Determining correlation:*

Looking at the scatter plot:
- As study hours increase, test scores generally increase
- Points cluster closely around the trend line
- This indicates a *strong positive* correlation

#v(0.2fr)

*Calculating predicted score:*

Using the regression equation $y = 54 + 3.8x$ with $x = 6$:

$y = 54 + 3.8(6) = 54 + 22.8 = 76.8 approx *77*$

#v(0.2fr)

#tip-box[
  *Answer:* BLANK1 = *strong positive*, BLANK2 = *77*
]

#v(1fr)

= Table Analysis

== TA Question 1 (Medium)

#v(0.2fr)

#question-box(difficulty: "medium")[
  *Top 10 Songs Ranked During Week W*

  #set text(size: 9pt)
  #table(
    columns: (auto, auto, auto, auto, auto),
    align: center,
    stroke: 0.5pt + gray,
    inset: 4pt,
    fill: (col, row) => if row == 0 { uptoten-blue.lighten(85%) } else { white },
    [*Rank*], [*Song*], [*Prev. Week*], [*Weeks Top 20*], [*Peak*],
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

#v(1fr)

== TA Question 1 - Statements

#v(0.3fr)

For each statement, indicate whether it *Can be answered* or *Cannot be answered* based solely on the information in the table.

#v(0.3fr)

#warning-box[
  *Statement 1:* How many of the top 5 songs for Week W had a higher rank for Week W than they did for the previous week?

  *Statement 2:* How many of the top 10 songs for Week W were not among the top 10 in the previous week?

  *Statement 3:* How many of the top 10 songs for the week immediately prior to Week W have ever been at ranking 1?
]

#v(1fr)

== TA Question 1 - Solution

#v(0.2fr)

#set text(size: 11pt)
*Statement 1: Cannot be answered*
- A "higher rank" means a lower number (1 is better than 2)
- Song C: Rank 3 now, was 6 → improved
- But we don't know the full previous week's rankings

*Statement 2: Can be answered*
- Looking at "Previous week" column for songs not in top 10:
- Song F: n/a (new), Song I: was 12, Song J: was 13
- *Answer: 3 songs* were not in top 10 last week

*Statement 3: Cannot be answered*
- We only know the top 10 songs for *Week W*
- We don't have the complete list from the previous week
#set text(size: 12pt)

#v(0.2fr)

#tip-box[
  *Answers:* Stmt 1: Cannot | Stmt 2: Can | Stmt 3: Cannot
]

#v(1fr)

== TA Question 2 (Medium)

#v(0.2fr)

#question-box(difficulty: "medium")[
  *Airline Flight Delays by Time Range (Percent of Flights)*

  #set text(size: 9pt)
  #table(
    columns: (auto, auto, auto, auto, auto, auto, auto),
    align: center,
    stroke: 0.5pt + gray,
    inset: 4pt,
    fill: (col, row) => if row == 0 { uptoten-blue.lighten(85%) } else { white },
    [*Airline*], [*1-15*], [*16-30*], [*31-45*], [*46-60*], [*>60*], [*Total*],
    [1], [8.5%], [6.5%], [5.8%], [2.1%], [1.6%], [24.5%],
    [2], [9.2%], [6.9%], [4.9%], [2.4%], [2.8%], [26.2%],
    [3], [7.5%], [7.1%], [4.5%], [2.2%], [1.7%], [23.0%],
    [4], [6.3%], [4.8%], [5.0%], [1.7%], [2.5%], [20.3%],
    [5], [8.8%], [5.9%], [7.1%], [1.9%], [1.2%], [24.9%],
  )
  Time ranges in minutes.
]

#v(1fr)

== TA Question 2 - Statements

#v(0.3fr)

For each statement, indicate whether it *Must be true* or *Need not be true*.

#v(0.3fr)

#warning-box[
  *Statement 1:* Airline 2 had the greatest number of flights last year that were delayed by 1 to 15 minutes.

  *Statement 2:* Airline 5 had the least number of flights last year that were delayed by more than 60 minutes.

  *Statement 3:* Airline 3 did NOT have the least number of total delayed flights last year.
]

#v(0.3fr)

#info-box[
  *Key insight:* The table shows *percentages*, not absolute numbers!
]

#v(1fr)

== TA Question 2 - Solution

#v(0.2fr)

#set text(size: 11pt)
*Statement 1: Need not be true*
- Airline 2 has 9.2% of its flights delayed 1-15 min (highest %)
- But if Airline 2 had fewer total flights, it could have fewer delayed flights
- Example: 9.2% of 1,000 = 92, but 8.5% of 2,000 = 170

*Statement 2: Need not be true*
- Airline 5 has 1.2% (lowest percentage for >60 min delays)
- But we don't know total flights per airline
- Another airline with fewer flights could have fewer actual delays

*Statement 3: Need not be true*
- Same reasoning - percentages don't tell us absolute numbers
#set text(size: 12pt)

#v(0.2fr)

#tip-box[
  *Answers:* All three statements *Need not be true*
]

#v(1fr)

== TA Question 3 (Medium)

#v(0.2fr)

#question-box(difficulty: "medium")[
  *Brazilian Agricultural Products in 2009*

  #set text(size: 9pt)
  #table(
    columns: (auto, auto, auto, auto, auto),
    align: (left, center, center, center, center),
    stroke: 0.5pt + gray,
    inset: 4pt,
    fill: (col, row) => if row == 0 { uptoten-blue.lighten(85%) } else { white },
    [*Commodity*], [*Prod %*], [*Prod Rk*], [*Exp %*], [*Exp Rk*],
    [Beef], [16%], [2], [22%], [1],
    [Chickens], [15%], [3], [38%], [1],
    [Coffee], [40%], [1], [32%], [1],
    [Corn], [8%], [4], [10%], [2],
    [Cotton], [5%], [5], [10%], [4],
    [Orange juice], [56%], [1], [82%], [1],
    [Pork], [4%], [4], [12%], [4],
    [Soybeans], [27%], [2], [40%], [2],
    [Sugar], [21%], [1], [44%], [1],
  )
]

#v(1fr)

== TA Question 3 - Statements

#v(0.3fr)

For each statement, indicate *Yes* (inferable from data) or *No*.

#v(0.3fr)

#warning-box[
  *Stmt 1:* No individual country produces more than one-fourth of the world's sugar.

  *Stmt 2:* There are countries that export a greater percent of their coffee crops than does Brazil.

  *Stmt 3:* Of the commodities for which Brazil ranks first in world exports, Brazil produces more than 20% of the world's supply.

  *Stmt 4:* If Brazil produces more than 20% of the world's supply of a commodity, it must be the world's top exporter of that commodity.
]

#v(1fr)

== TA Question 3 - Solution

#v(0.2fr)

#set text(size: 10pt)
*Statement 1: No*
- Brazil produces 21% of world's sugar (rank 1)
- We don't know about other countries - one could produce >25%

*Statement 2: No*
- Brazil ranks #1 in coffee exports with 32% *world share*
- The statement asks about % of *their own* crops exported - we can't determine this

*Statement 3: No*
- Brazil ranks #1 in exports for: Beef, Chickens, Coffee, Orange juice, Sugar
- Production shares: Beef 16%, Chickens 15%, Coffee 40%, OJ 56%, Sugar 21%
- Chickens (15%) and Beef (16%) are NOT more than 20%

*Statement 4: No*
- Soybeans: Brazil produces 27% (>20%) but ranks #2 in exports
#set text(size: 12pt)

#v(0.2fr)

#tip-box[
  *Answers:* All four statements are *No*
]

#v(1fr)

== TA Question 4 (Medium)

#v(0.2fr)

#question-box(difficulty: "medium")[
  *Percentage of Population Visiting Cultural Institutions (Single Year)*

  #set text(size: 9pt)
  #table(
    columns: (auto, auto, auto, auto, auto),
    align: (left, center, center, center, center),
    stroke: 0.5pt + gray,
    inset: 4pt,
    fill: (col, row) => if row == 0 { uptoten-blue.lighten(85%) } else { white },
    [*Country*], [*Library*], [*Zoo*], [*Nat. Hist.*], [*Sci/Tech*],
    [Russia], [15%], [8%], [5%], [2%],
    [Brazil], [25%], [28%], [7%], [4%],
    [EU], [35%], [27%], [20%], [18%],
    [South Korea], [35%], [37%], [30%], [10%],
    [China], [41%], [51%], [13%], [19%],
    [Japan], [48%], [45%], [20%], [12%],
    [US], [65%], [48%], [27%], [26%],
  )
]

#v(1fr)

== TA Question 4 - Context

#v(0.3fr)

#info-box[
  The data shows that Russia has the *lowest percentage* for visiting natural history museums (5%) among all countries listed.

  *Question:* Which statements, if true, would help explain why a smaller percentage of Russia's population visits natural history museums?
]

#v(0.3fr)

For each statement, indicate whether it *Would help explain* or *Would not help explain* the observation.

#v(1fr)

== TA Question 4 - Statements

#v(0.3fr)

#warning-box[
  *Stmt 1:* The proportion of Brazil's population that lives within close proximity to at least one museum is larger than that of Russia.

  *Stmt 2:* Of the countries in the table, Russia has the fewest natural history museums per capita.

  *Stmt 3:* Of the countries in the table, the three that spend the most money to promote their natural history museums are also those in which science is most highly valued.

  *Stmt 4:* Science and technology museums are less popular than other cultural institutions in the majority of the countries in the table.
]

#v(1fr)

== TA Question 4 - Solution

#v(0.2fr)

#set text(size: 11pt)
*Statement 1: Would help explain*
- If fewer Russians live near museums, fewer would visit
- This could explain Russia's low visitation rate

*Statement 2: Would help explain*
- Fewer museums per capita = less accessibility
- This directly explains why a smaller percentage visits

*Statement 3: Would NOT help explain*
- This talks about promotion spending and valuing science
- It doesn't directly address why Russia specifically has low rates

*Statement 4: Would help explain*
- Shows a general pattern of lower museum popularity
- Consistent with Russia's low rates across museum types
#set text(size: 12pt)

#v(0.2fr)

#tip-box[
  *Answers:* Stmt 1: Would help | Stmt 2: Would help | Stmt 3: Would NOT | Stmt 4: Would help
]

#v(1fr)

= Key Strategies

== Graphics Interpretation Tips

#v(0.3fr)

#grid(
  columns: (1fr, 1fr),
  gutter: 20pt,
  [
    *Reading the Graph:*
    - Carefully read axis labels and units
    - Note the scale (linear vs. log)
    - Identify trends and patterns
    - Look for outliers
  ],
  [
    *Answering Questions:*
    - Read the statement completely first
    - Identify what each blank asks for
    - Calculate systematically
    - Verify your answer makes sense
  ]
)

#v(0.3fr)

#tip-box[
  For dropdown questions, eliminate obviously wrong options first, then verify your choice with calculations.
]

#v(1fr)

== Table Analysis Tips

#v(0.3fr)

#grid(
  columns: (1fr, 1fr),
  gutter: 20pt,
  [
    *Common Traps:*
    - Confusing percentages with counts
    - Assuming data not in the table
    - Missing "n/a" or missing values
    - Not reading column headers carefully
  ],
  [
    *Key Questions to Ask:*
    - Absolute or relative values?
    - Do I have all the data I need?
    - What assumptions am I making?
    - Can I find a counterexample?
  ]
)

#v(0.3fr)

#warning-box[
  *Critical Rule:* If a statement requires information not provided in the table, it usually *cannot* be determined or *need not be true*.
]

#v(1fr)

== Summary

#v(0.3fr)

#info-box[
  *Graphics Interpretation (GI):*
  - Fill-in-the-blank format with dropdowns
  - Requires reading and interpreting visual data
  - Focus on calculations and data extraction

  *Table Analysis (TA):*
  - True/False or Yes/No format for multiple statements
  - Tests ability to analyze sortable tables
  - Be careful about what the data actually shows vs. what you assume
]

#v(0.3fr)

#tip-box[
  *Practice Strategy:* Work through each question type systematically. For GI, focus on accurate calculations. For TA, always check if the data actually supports the statement.
]

#v(1fr)
