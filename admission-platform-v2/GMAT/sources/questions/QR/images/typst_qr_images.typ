#import "@preview/cetz:0.3.2"

#align(center)[
  #cetz.canvas(length: 0.6cm, {
    import cetz.draw: *

    // Number line from -9 to 9
    line((-10, 0), (10, 0), mark: (start: "<", end: ">"), stroke: 1pt)

    // Tick marks and labels
    for i in range(-9, 10) {
      line((i, -0.15), (i, 0.15), stroke: 0.5pt)
      content((i, -0.5), text(size: 8pt)[$#i$])
    }

    // x label
    content((10.5, 0), text(size: 10pt)[$x$])

    // Solution region (line from -8 to 4)
    line((-8, 0), (4, 0), stroke: 2.5pt)

    // Filled circles at -8 and 4 (included endpoints)
    circle((-8, 0), radius: 0.12, fill: black, stroke: 1.5pt)
    circle((4, 0), radius: 0.12, fill: black, stroke: 1.5pt)
  })
]
