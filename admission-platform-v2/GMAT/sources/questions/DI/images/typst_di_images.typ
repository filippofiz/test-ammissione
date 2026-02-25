#import "@preview/cetz:0.4.2"
#import "@preview/cetz-plot:0.1.3": chart

#set page(width: auto, height: auto, margin: 1cm)

#let data = (
  ([Others],       62),
  ([Tomato Blast], 14),
  ([Pep-Peroni],   11),
  ([NiceSpice],     8),
  ([VegCheese],     5),
)

#align(center)[
  #text(weight: "bold", size: 12pt)[Revenue Share of Most Popular Pizzas]
  #v(0.5cm)
  #cetz.canvas({
    let colors = gradient.linear(
      rgb("#4e79a7"),
      rgb("#e15759"),
      rgb("#f28e2b"),
      rgb("#76b7b2"),
      rgb("#59a14f"),
    )

    chart.piechart(
      data,
      value-key: 1,
      label-key: 0,
      radius: 4.5,
      stroke: white + 1.5pt,
      slice-style: colors,
      inner-label: (
        content: (value, label) => text(fill: white, weight: "bold", size: 9pt)[#value%],
        radius: 130%,
      ),
      outer-label: (
        content: (value, label) => text(size: 8.5pt)[#label],
        radius: 120%,
      ),
    )
  })
]
