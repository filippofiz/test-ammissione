#import "@preview/cetz:0.4.2": canvas, draw
#import calc: *

#canvas({
  import draw: *

  let center = (4, 3)
  let outer-radius = 2.5
  let inner-radius = 1.8
  let circle-radius = 0.35

  // Draw the outer circle
  circle(center, radius: outer-radius, stroke: 1.5pt)

  // Draw arrow pointing to position 1 (top)
  line((4, 7), (4, 5.6), mark: (end: ">"), stroke: 1pt)

  // Calculate positions for 8 circles around the perimeter
  // Starting from top (1) and going clockwise
  let positions = (
    (0, 1),    // 1 - top
    (45, 2),   // 2 - top-right
    (90, 3),   // 3 - right
    (135, 4),  // 4 - bottom-right
    (180, 5),  // 5 - bottom
    (225, 6),  // 6 - bottom-left
    (270, 7),  // 7 - left
    (315, 8),  // 8 - top-left
  )

  for (angle, num) in positions {
    // Convert angle to radians and calculate position
    let rad = angle * calc.pi / 180
    let x = center.at(0) + inner-radius * calc.sin(rad)
    let y = center.at(1) + inner-radius * calc.cos(rad)

    // Draw small circle
    circle((x, y), radius: circle-radius, stroke: 1pt)

    // Draw number inside circle
    content((x, y), [#num])
  }
})
