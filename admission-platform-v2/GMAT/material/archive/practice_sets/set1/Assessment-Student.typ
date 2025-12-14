#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Practice Assessment - Student Version_],
        [
          #figure(
            image("../../Logo.png", width: 2cm)
          )
        ]
      )
      line(length: 100%, stroke: 0.5pt + rgb("#4caf50"))
    }
  },
  numbering: "1",
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 {
      align(center)[
        #line(length: 100%, stroke: 0.5pt + rgb("#4caf50"))
        #v(0.3em)
        #text(size: 9pt, fill: rgb("#021d49"))[
          Page #page-num | UpToTen - Learn Stem More
        ]
      ]
    }
  }
)

#set text(
  font: "Arial",
  size: 11pt,
  lang: "en",
)

#set par(
  justify: true,
  leading: 0.65em,
)

#set heading(numbering: "1.")

// UpToTen Brand Colors
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")

// Title page
#align(center)[
  #v(2cm)
  #figure(
    image("../../Logo.png", width: 7cm)
  )
  #v(1em)
  #text(size: 28pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.1em)
  #text(size: 24pt, weight: "bold", fill: uptoten-blue)[Practice Assessment]
  #v(0.5em)
  #text(size: 16pt, fill: uptoten-green)[Student Version]
  #v(0.3em)
  #text(size: 14pt, fill: uptoten-blue)[Extended Practice Set 1]
  #v(1em)
  #line(length: 60%, stroke: 2pt + uptoten-green)
  #v(1.5em)
  #text(size: 11pt)[
    This practice assessment contains *18 questions*.\
    \
    *Recommended Time:* 1 hour 30 minutes
  ]
  #v(2.5cm)
  #text(size: 10pt, fill: gray)[
    Via G. Frua 21/6, Milano | www.uptoten.it
  ]
]

#pagebreak()

= Practice Questions

== Question 1

If $x$ and $y$ are positive integers such that $x^2 + y^2 = 13$ and $x < y$, what is $x + y$?

#v(0.5em)
(A) 3 \
(B) 4 \
(C) 5 \
(D) 6 \
(E) 7

#v(3cm)

== Question 2

What is the greatest prime factor of $84$?

#v(0.5em)
(A) 2 \
(B) 3 \
(C) 5 \
(D) 7 \
(E) 11

#v(3cm)

== Question 3

A shirt originally priced at \$60 is first marked up by 25%, then marked down by 20%. What is the final price?

#v(0.5em)
(A) \$57 \
(B) \$60 \
(C) \$63 \
(D) \$66 \
(E) \$72

#pagebreak()

== Question 4

If $2^a = 5$ and $2^b = 7$, what is $2^(a+2b)$ in terms of numbers?

#v(0.5em)
(A) 175 \
(B) 245 \
(C) 280 \
(D) 315 \
(E) 350

#v(3cm)

== Question 5

If $a:b = 4:5$ and $b:c = 3:7$, what is the ratio of $a$ to $c$?

#v(0.5em)
(A) $4:7$ \
(B) $7:12$ \
(C) $12:35$ \
(D) $15:28$ \
(E) $20:21$

#v(3cm)

== Question 6

How many positive integers less than 80 are divisible by both 4 and 6?

#v(0.5em)
(A) 4 \
(B) 5 \
(C) 6 \
(D) 7 \
(E) 8

#pagebreak()

== Question 7

A car travels 180 km at a constant speed. If the speed had been 15 km/h faster, the journey would have taken 1 hour less. What was the original speed in km/h?

#v(0.5em)
(A) 30 \
(B) 36 \
(C) 45 \
(D) 60 \
(E) 90

#v(3cm)

== Question 8

Two pipes can fill a tank in 10 hours and 15 hours respectively. Both pipes are opened together, but after 3 hours the faster pipe is closed. How many more hours will it take to fill the tank?

#v(0.5em)
(A) 6 hours \
(B) 6.5 hours \
(C) 7 hours \
(D) 7.5 hours \
(E) 8 hours

#v(3cm)

== Question 9

If $sqrt(2x - sqrt(2x - sqrt(2x - ...))) = 3$, what is the value of $x$?

#v(0.5em)
(A) 3 \
(B) 4.5 \
(C) 6 \
(D) 7.5 \
(E) 9

#pagebreak()

== Question 10

A merchant mixes nuts costing \$8 per kg with nuts costing \$12 per kg in a ratio of 3:2. What is the cost per kg of the mixture?

#v(0.5em)
(A) \$9.20 \
(B) \$9.40 \
(C) \$9.60 \
(D) \$9.80 \
(E) \$10.00

#v(3cm)

== Question 11

If $f(x) = 2x + 3$ and $f(f(x)) = 17$, what is the value of $x$?

#v(0.5em)
(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

#v(3cm)

== Question 12

Machine X can produce 80 units in 5 hours and machine Y can produce 120 units in 6 hours. If both machines work together for 3 hours, how many units will be produced?

#v(0.5em)
(A) 96 \
(B) 108 \
(C) 120 \
(D) 128 \
(E) 140

#pagebreak()

== Question 13

If $x + y = 10$ and $x^2 - y^2 = 40$, what is the value of $x - y$?

#v(0.5em)
(A) 2 \
(B) 3 \
(C) 4 \
(D) 5 \
(E) 6

#v(3cm)

== Question 14

If $x$ satisfies $|x - 3| + |x + 4| < 11$, how many integer values of $x$ are possible?

#v(0.5em)
(A) 3 \
(B) 5 \
(C) 7 \
(D) 9 \
(E) 11

#v(3cm)

== Question 15

If $4^(x+1) - 4^(x-1) = 60$, what is the value of $x$?

#v(0.5em)
(A) 1 \
(B) 2 \
(C) 3 \
(D) 4 \
(E) 5

#pagebreak()

== Question 16

A cylinder has a radius of $r$ cm and a height of $h$ cm. If the radius is increased by 50% and the height is decreased by 20%, by what percent does the volume change?

#v(0.5em)
(A) Increases by 50% \
(B) Increases by 60% \
(C) Increases by 70% \
(D) Increases by 80% \
(E) Increases by 90%

#v(3cm)

== Question 17

If $x^2 + k x + 25 = (x + p)^2$ for all values of $x$, what is the value of $|k|$?

#v(0.5em)
(A) 3 \
(B) 5 \
(C) 8 \
(D) 10 \
(E) 25

#v(3cm)

== Question 18

The average of five consecutive even integers is 22. If the smallest and largest integers are removed, what is the average of the remaining three integers?

#v(0.5em)
(A) 20 \
(B) 21 \
(C) 22 \
(D) 23 \
(E) 24

