#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Program",
  subtitle: "Cycles Required Matrix",
  level: "Program Planning Reference",
  intro: "This document provides a visual reference for determining the number of cycles required based on starting score and target score, with difficulty indicators.",
  logo: "/Logo.png"
)

= Cycles Required Matrix

The following table shows the number of cycles required based on starting score and target score. Colors indicate the difficulty of achieving the target:

#v(0.5cm)

#let green = rgb("#c8e6c9")    // Easy - Already achieved or 1 cycle
#let yellow = rgb("#fff9c4")   // Moderate - 1-2 cycles
#let orange = rgb("#ffe0b2")   // Challenging - 2 cycles
#let red = rgb("#ffcdd2")      // Very Challenging - 3 cycles
#let gray = rgb("#e0e0e0")     // Already achieved

#figure(
  table(
    columns: (auto, 1fr, 1fr, 1fr, 1fr),
    inset: 10pt,
    align: center,
    stroke: 0.5pt,

    // Header row
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Starting Score]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Target 555]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Target 605]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Target 665]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Target 715+]),

    // Below 505
    table.cell(fill: rgb("#e3f2fd"), text(weight: "bold")[Below 505]),
    table.cell(fill: green)[1 (F)],
    table.cell(fill: yellow)[1 (F)],
    table.cell(fill: orange)[2 (F→D)],
    table.cell(fill: red)[3 (F→D→E)],

    // 505-554
    table.cell(fill: rgb("#e3f2fd"), text(weight: "bold")[505-554]),
    table.cell(fill: green)[1 (F)],
    table.cell(fill: green)[1 (F)],
    table.cell(fill: orange)[2 (F→D)],
    table.cell(fill: red)[3 (F→D→E)],

    // 555-604
    table.cell(fill: rgb("#e3f2fd"), text(weight: "bold")[555-604]),
    table.cell(fill: gray)[—],
    table.cell(fill: green)[1 (F)],
    table.cell(fill: yellow)[2 (F→D)],
    table.cell(fill: red)[3 (F→D→E)],

    // 605-659
    table.cell(fill: rgb("#e3f2fd"), text(weight: "bold")[605-659]),
    table.cell(fill: gray)[—],
    table.cell(fill: gray)[—],
    table.cell(fill: green)[1 (D)],
    table.cell(fill: orange)[2 (D→E)],

    // 660-699
    table.cell(fill: rgb("#e3f2fd"), text(weight: "bold")[660-699]),
    table.cell(fill: gray)[—],
    table.cell(fill: gray)[—],
    table.cell(fill: gray)[—],
    table.cell(fill: green)[1 (E)],

    // 700+
    table.cell(fill: rgb("#e3f2fd"), text(weight: "bold")[700+]),
    table.cell(fill: gray)[—],
    table.cell(fill: gray)[—],
    table.cell(fill: gray)[—],
    table.cell(fill: yellow)[Custom\*],
  ),
  caption: [Cycles Required Matrix]
)

#v(0.5cm)

*Legend:*
- *F* = Foundation cycle (4 lessons/topic)
- *D* = Development cycle (3 lessons/topic)
- *E* = Excellence cycle (2 lessons/topic)
- *—* = Target already achieved

#v(0.3cm)

*Color Legend:*
#table(
  columns: (auto, 1fr),
  inset: 8pt,
  stroke: 0.5pt,
  table.cell(fill: green)[Green], [Easy to achieve - 1 cycle, standard progression],
  table.cell(fill: yellow)[Yellow], [Moderate - 1-2 cycles, requires consistent effort],
  table.cell(fill: orange)[Orange], [Challenging - 2 cycles, significant commitment required],
  table.cell(fill: red)[Red], [Very Challenging - 3 cycles, long-term commitment (10-15 months)],
  table.cell(fill: gray)[Gray], [Already achieved or N/A],
)

#v(0.5cm)

*\*Custom:* Students scoring 700+ may need targeted Excellence cycle work on specific weak areas only.

#pagebreak()

= Estimated Duration by Path

#figure(
  table(
    columns: (2fr, auto, auto, auto, auto, auto),
    inset: 10pt,
    align: center,
    stroke: 0.5pt,

    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Path]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Cycles]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Tutor Hours]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Autonomous]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Total]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Duration]),

    table.cell(fill: green)[Foundation only], [1], [72h], [30h], [~102h], [4-6 months],
    table.cell(fill: green)[Development only], [1], [54h], [35h], [~89h], [3-4.5 months],
    table.cell(fill: green)[Excellence only], [1], [36h], [40h], [~76h], [2-3 months],
    table.cell(fill: yellow)[Foundation → Development], [2], [126h], [65h], [~191h], [7-10 months],
    table.cell(fill: yellow)[Development → Excellence], [2], [90h], [75h], [~165h], [5-7.5 months],
    table.cell(fill: red)[Foundation → Dev → Excellence], [3], [162h], [105h], [~267h], [10-15 months],
  ),
  caption: [Estimated Duration by Path]
)

#pagebreak()

= Unrealistic Score Improvements

The following scenarios are considered *unrealistic* and students should be counseled on setting appropriate expectations:

#figure(
  table(
    columns: (2fr, auto, 1fr),
    inset: 10pt,
    align: (left, center, center),
    stroke: 0.5pt,

    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Scenario]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Improvement]),
    table.cell(fill: rgb("#1565c0"), text(white, weight: "bold")[Assessment]),

    table.cell(fill: red)[Below 505 → 715+ in < 6 months], [+210+ pts], [Unrealistic],
    table.cell(fill: red)[505-554 → 715+ in < 8 months], [+160+ pts], [Unrealistic],
    table.cell(fill: orange)[Any starting point → 750+], [Variable], [Exceptional only],
    table.cell(fill: red)[Below 505 → 665+ in 1 cycle], [+160+ pts], [Requires 2 cycles min],
    table.cell(fill: red)[555-604 → 715+ in 1 cycle], [+110+ pts], [Requires 2-3 cycles],
  ),
  caption: [Unrealistic Score Improvement Scenarios]
)

#v(1cm)

#info-box[
  *Note:* The UpToTen GMAT program is designed for steady, sustainable progress through each cycle. Students requesting unrealistic improvements should be counseled on setting appropriate expectations and understanding the time commitment required.
]
