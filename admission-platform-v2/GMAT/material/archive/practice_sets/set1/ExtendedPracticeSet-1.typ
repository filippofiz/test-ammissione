#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [_GMAT Extended Practice Set 1_],
        [
          #figure(
            image("../../../Logo.png", width: 2cm)
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
  leading: 0.7em,
)

// UpToTen Brand Colors - Define early so they can be used everywhere
#let uptoten-blue = rgb("#021d49")
#let uptoten-green = rgb("#4caf50")
#let uptoten-orange = rgb("#ffb606")
#let light-bg = rgb("#f8f9fa")
#let border-color = rgb("#e0e0e0")

#set heading(
  numbering: "1.",
)

#show heading.where(level: 1): it => {
  v(1em)
  block(
    width: 100%,
    fill: gradient.linear(uptoten-blue, uptoten-blue.lighten(20%)),
    inset: (x: 1.2em, y: 0.8em),
    radius: 4pt,
    text(size: 18pt, weight: "bold", fill: white)[#it.body]
  )
  v(0.8em)
}

#show heading.where(level: 2): it => {
  v(0.8em)
  text(size: 13pt, weight: "bold", fill: uptoten-blue)[#it.body]
  v(0.5em)
  line(length: 30%, stroke: 1.5pt + uptoten-green)
  v(0.6em)
}

#set list(
  marker: text(fill: uptoten-green)[■],
  indent: 1em,
  body-indent: 0.5em,
  spacing: 0.8em,
)

// Custom question box styling
#let question-box(number, body) = {
  block(
    width: 100%,
    fill: light-bg,
    stroke: (left: 3pt + uptoten-green),
    inset: (left: 1em, right: 1em, top: 0.8em, bottom: 0.8em),
    radius: (right: 4pt),
    breakable: false,
    [
      #text(weight: "bold", size: 11.5pt, fill: uptoten-blue)[
        Question #number
      ]
      #v(0.6em)
      #body
    ]
  )
  v(1.2em)
}

// Answer choice styling
#let answer-choice(letter, text-content) = {
  box(
    inset: (left: 0.3em),
    [
      #text(weight: "semibold", fill: uptoten-blue)[(#letter)]
      #h(0.5em)
      #text-content
    ]
  )
}

// Title page
#align(center)[
  #v(2.5cm)
  #figure(
    image("../../../Logo.png", width: 7cm)
  )
  #v(1.5em)
  #text(size: 32pt, weight: "bold", fill: uptoten-blue)[GMAT]
  #v(0.3em)
  #text(size: 26pt, weight: "bold", fill: uptoten-blue)[Extended Practice Set 1]
  #v(1.2em)
  #line(length: 60%, stroke: 3pt + uptoten-green)
  #v(1.5em)
  #block(
    width: 85%,
    inset: (x: 1.5em, y: 1.2em),
    fill: light-bg,
    radius: 6pt,
    stroke: 1pt + border-color,
    [
      #set text(size: 10.5pt)
      #set par(leading: 0.8em)
      This practice set contains *100 multiple-choice problem solving questions* divided into *4 sections of 25 questions* each.

      #v(0.5em)

      The questions cover fundamental GMAT Quantitative topics including Value, Order, and Factors; Algebra, Equalities, and Inequalities; Rates, Ratios, and Percents; and Word Problems. Questions within each section progress from easier to more challenging.

      #v(0.5em)

      #text(fill: uptoten-orange, weight: "semibold")[Note:] Please take care that there might be errors in the questions. If you find any, feel free to report them.
    ]
  )
  #v(3cm)
  #text(size: 10pt, fill: gray.darken(20%))[
    Via G. Frua 21/6, Milano \
    #link("https://www.uptoten.it")[www.uptoten.it]
  ]
]

#pagebreak()

= Instructions

This Extended Practice Set contains *100 problem solving questions* designed to help you prepare for the GMAT Quantitative Reasoning section. Each question has five answer choices labeled *(A) through (E)*. Select the best answer for each question.

== Structure

- *Section 1 (Questions 1-25):* Fundamental arithmetic, algebra, and basic problem solving
- *Section 2 (Questions 26-50):* Rates, ratios, percents, and applications
- *Section 3 (Questions 51-75):* Functions, graphing, and advanced algebra
- *Section 4 (Questions 76-100):* Mixed word problems and applications

== Time Recommendation

Allow approximately *2-3 minutes per question* (with a total of *3-5 hours*). You may divide this into four *50-75 minute* sessions, one for each section.

== Topics Covered

This practice set focuses on:
- *Value, Order, and Factors:* integers, primes, exponents, absolute value
- *Algebra and Equations:* linear equations, quadratics, systems, inequalities
- *Rates, Ratios, and Percents:* proportions, percent change, interest
- *Functions and Graphing:* coordinate plane, slopes, function notation
- *Word Problems:* distance, work, mixture, multi-step problems

// == Answer Key

// Complete solutions with answer letters only are provided at the end of the practice set.

#pagebreak()

#block(
  width: 100%,
  fill: uptoten-blue,
  inset: (x: 1.5em, y: 1em),
  radius: 4pt,
  [
    #text(size: 16pt, weight: "bold", fill: white)[
      Section 1: Questions 1-25
    ]
  ]
)

#v(1.5em)

#question-box("1")[
  If $x$ and $y$ are positive integers such that $x^2 + y^2 = 25$ and $x > y$, what is $x - y$?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [4]) \
  #answer-choice("E", [5])
]

#question-box("2")[
  If $n$ is a positive integer and the sum of all positive divisors of $n$ equals 12, which of the following could be $n$?

  #v(0.4em)
  #answer-choice("A", [5]) \
  #answer-choice("B", [8]) \
  #answer-choice("C", [9]) \
  #answer-choice("D", [11]) \
  #answer-choice("E", [12])
]

#question-box("3")[
  For how many positive integer values of $x$ is $(x - 3)(x - 5)(x - 7) < 0$?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [4]) \
  #answer-choice("E", [Infinitely many])
]

#question-box("4")[
  If $|x - 5| + |x + 2| = 10$ and $x < 0$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [$-3.5$]) \
  #answer-choice("B", [$-3$]) \
  #answer-choice("C", [$-2.5$]) \
  #answer-choice("D", [$-2$]) \
  #answer-choice("E", [$-1.5$])
]

#question-box("5")[
  If $2^a = 3$ and $2^b = 5$, what is $2^(2a+b)$ in terms of numbers?

  #v(0.4em)
  #answer-choice("A", [30]) \
  #answer-choice("B", [45]) \
  #answer-choice("C", [60]) \
  #answer-choice("D", [75]) \
  #answer-choice("E", [90])
]

#question-box("6")[
  If $p$ and $q$ are prime numbers greater than 2, which of the following must be even?

  #v(0.4em)
  #answer-choice("A", [$p + q$]) \
  #answer-choice("B", [$p times q$]) \
  #answer-choice("C", [$p - q$]) \
  #answer-choice("D", [$p^2 + q^2$]) \
  #answer-choice("E", [$p^2 - q^2$])
]

#question-box("7")[
  If $x$ and $y$ are integers, $x > y > 0$, and $x^2 - y^2 = 77$, what is the value of $x + y$?

  #v(0.4em)
  #answer-choice("A", [7]) \
  #answer-choice("B", [11]) \
  #answer-choice("C", [13]) \
  #answer-choice("D", [39]) \
  #answer-choice("E", [77])
]

#question-box("8")[
  What is the greatest prime factor of $12^2 - 8^2$?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [5]) \
  #answer-choice("D", [7]) \
  #answer-choice("E", [11])
]

#question-box("9")[
  If $n$ is the smallest positive integer such that $3n$ is a perfect square and $2n$ is a perfect cube, what is the value of $n$?

  #v(0.4em)
  #answer-choice("A", [12]) \
  #answer-choice("B", [24]) \
  #answer-choice("C", [72]) \
  #answer-choice("D", [108]) \
  #answer-choice("E", [216])
]

#question-box("10")[
  If $3^x times 9^y = 3^(10)$, what is $x + 2y$?

  #v(0.4em)
  #answer-choice("A", [5]) \
  #answer-choice("B", [8]) \
  #answer-choice("C", [10]) \
  #answer-choice("D", [12]) \
  #answer-choice("E", [15])
]

#question-box("11")[
  For how many positive integers $n$ is $n^2 - 7n + 12$ a prime number?

  #v(0.4em)
  #answer-choice("A", [One]) \
  #answer-choice("B", [Two]) \
  #answer-choice("C", [Three]) \
  #answer-choice("D", [Four]) \
  #answer-choice("E", [More than four])
]

#question-box("12")[
  If $a$ and $b$ are positive integers and $(a + b)^2 - (a - b)^2 = 84$, what is the value of $a times b$?

  #v(0.4em)
  #answer-choice("A", [12]) \
  #answer-choice("B", [21]) \
  #answer-choice("C", [28]) \
  #answer-choice("D", [42]) \
  #answer-choice("E", [84])
]

#question-box("13")[
  If $x$ is a positive integer less than 100, for how many values of $x$ is $x/6$ an integer and $x/15$ also an integer?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [5]) \
  #answer-choice("E", [6])
]

#question-box("14")[
  If $x^3 - y^3 = 91$ and $x - y = 1$, what is the value of $x^2 + x y + y^2$?

  #v(0.4em)
  #answer-choice("A", [13]) \
  #answer-choice("B", [49]) \
  #answer-choice("C", [81]) \
  #answer-choice("D", [91]) \
  #answer-choice("E", [121])
]

#question-box("15")[
  How many positive integers less than 50 have exactly 3 positive divisors?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [5]) \
  #answer-choice("E", [6])
]

#question-box("16")[
  If $16^x = 8^(x+2)$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [4]) \
  #answer-choice("C", [6]) \
  #answer-choice("D", [8]) \
  #answer-choice("E", [10])
]

#question-box("17")[
  If $x$ and $y$ are positive integers, $x + y = 18$, and the least common multiple of $x$ and $y$ is 77, what is the value of $x times y$?

  #v(0.4em)
  #answer-choice("A", [55]) \
  #answer-choice("B", [65]) \
  #answer-choice("C", [77]) \
  #answer-choice("D", [81]) \
  #answer-choice("E", [143])
]

#question-box("18")[
  If $|2x + 3| = |2x - 5|$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [$-4$]) \
  #answer-choice("B", [$-3/2$]) \
  #answer-choice("C", [$0$]) \
  #answer-choice("D", [$1/2$]) \
  #answer-choice("E", [$5/2$])
]

#question-box("19")[
  If $n$ is a positive integer and $(n!)/(n-2)! = 90$, what is the value of $n$?

  #v(0.4em)
  #answer-choice("A", [6]) \
  #answer-choice("B", [8]) \
  #answer-choice("C", [9]) \
  #answer-choice("D", [10]) \
  #answer-choice("E", [12])
]

#question-box("20")[
  If $sqrt(x + sqrt(x + sqrt(x + ...))) = 5$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [5]) \
  #answer-choice("B", [10]) \
  #answer-choice("C", [15]) \
  #answer-choice("D", [20]) \
  #answer-choice("E", [25])
]

#question-box("21")[
  If $a$, $b$, and $c$ are distinct positive integers less than 10, and $a^3 + b^3 = c^3 - 1$, what is the value of $a + b + c$?

  #v(0.4em)
  #answer-choice("A", [15]) \
  #answer-choice("B", [17]) \
  #answer-choice("C", [18]) \
  #answer-choice("D", [19]) \
  #answer-choice("E", [No such values exist])
]

#question-box("22")[
  If $x$ is a positive integer and $x^2 + x$ is divisible by 6, which of the following must be true?

  #v(0.4em)
  #answer-choice("A", [$x$ is even]) \
  #answer-choice("B", [$x$ is odd]) \
  #answer-choice("C", [$x$ is divisible by 3]) \
  #answer-choice("D", [$x$ is divisible by 6]) \
  #answer-choice("E", [Either $x$ or $x + 1$ is divisible by 6])
]

#question-box("23")[
  For how many integer values of $k$ does the equation $x^2 + k x + 16 = 0$ have integer solutions?

  #v(0.4em)
  #answer-choice("A", [3]) \
  #answer-choice("B", [5]) \
  #answer-choice("C", [7]) \
  #answer-choice("D", [9]) \
  #answer-choice("E", [10])
]

#question-box("24")[
  If $a$ and $b$ are positive integers such that $a^2 - b^2 = 15$, how many different values of $a$ are possible?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [4]) \
  #answer-choice("E", [5])
]

#question-box("25")[
  If $3^(x+1) + 3^(x+1) + 3^(x+1) = 3^(2023)$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [2020]) \
  #answer-choice("B", [2021]) \
  #answer-choice("C", [2022]) \
  #answer-choice("D", [2023]) \
  #answer-choice("E", [2024])
]#pagebreak()

#block(
  width: 100%,
  fill: uptoten-blue,
  inset: (x: 1.5em, y: 1em),
  radius: 4pt,
  [
    #text(size: 16pt, weight: "bold", fill: white)[
      Section 2: Questions 26-50
    ]
  ]
)

#v(1.5em)

#question-box("26")[
  A store offers successive discounts of 20% and 15% on an item. What single discount is equivalent to these two successive discounts?

  #v(0.4em)
  #answer-choice("A", [30%]) \
  #answer-choice("B", [32%]) \
  #answer-choice("C", [33%]) \
  #answer-choice("D", [35%]) \
  #answer-choice("E", [38%])
]

#question-box("27")[
  If the ratio of $x$ to $y$ is 3:4 and the ratio of $y$ to $z$ is 5:6, what is the ratio of $x$ to $z$?

  #v(0.4em)
  #answer-choice("A", [$3:6$]) \
  #answer-choice("B", [$5:8$]) \
  #answer-choice("C", [$15:24$]) \
  #answer-choice("D", [$5:7$]) \
  #answer-choice("E", [$18:20$])
]

#question-box("28")[
  A trader mixes rice costing \$6 per kg with rice costing \$4 per kg in the ratio 2:3. At what price per kg should he sell the mixture to make a 25% profit?

  #v(0.4em)
  #answer-choice("A", [\$5.00]) \
  #answer-choice("B", [\$5.50]) \
  #answer-choice("C", [\$5.75]) \
  #answer-choice("D", [\$6.00]) \
  #answer-choice("E", [\$6.25])
]

#question-box("29")[
  The population of a town increases by 10% annually. If the current population is 50,000, what will be the population after 2 years?

  #v(0.4em)
  #answer-choice("A", [55,000]) \
  #answer-choice("B", [58,000]) \
  #answer-choice("C", [60,000]) \
  #answer-choice("D", [60,500]) \
  #answer-choice("E", [61,050])
]

#question-box("30")[
  A cyclist travels from point A to point B at 12 km/h and returns at 18 km/h. What is his average speed for the entire journey?

  #v(0.4em)
  #answer-choice("A", [13.5 km/h]) \
  #answer-choice("B", [14.0 km/h]) \
  #answer-choice("C", [14.4 km/h]) \
  #answer-choice("D", [15.0 km/h]) \
  #answer-choice("E", [15.5 km/h])
]

#question-box("31")[
  If $a:b = 2:5$ and $b:c = 3:7$, and $a + b + c = 94$, what is the value of $c$?

  #v(0.4em)
  #answer-choice("A", [28]) \
  #answer-choice("B", [35]) \
  #answer-choice("C", [42]) \
  #answer-choice("D", [49]) \
  #answer-choice("E", [56])
]

#question-box("32")[
  A merchant marks up an item by 50% above cost and then offers a discount of 20% on the marked price. What is the merchant's overall profit percentage?

  #v(0.4em)
  #answer-choice("A", [10%]) \
  #answer-choice("B", [15%]) \
  #answer-choice("C", [20%]) \
  #answer-choice("D", [25%]) \
  #answer-choice("E", [30%])
]

#question-box("33")[
  A solution contains alcohol and water in the ratio 2:3. If 10 liters of alcohol and 5 liters of water are added, the new ratio becomes 3:4. What was the original quantity of the solution?

  #v(0.4em)
  #answer-choice("A", [15 liters]) \
  #answer-choice("B", [20 liters]) \
  #answer-choice("C", [25 liters]) \
  #answer-choice("D", [30 liters]) \
  #answer-choice("E", [35 liters])
]

#question-box("34")[
  If $x/5 = y/7 = z/11$, and $x + z = 96$, what is the value of $y$?

  #v(0.4em)
  #answer-choice("A", [21]) \
  #answer-choice("B", [28]) \
  #answer-choice("C", [35]) \
  #answer-choice("D", [42]) \
  #answer-choice("E", [49])
]

#question-box("35")[
  Train A leaves station P at 9 AM traveling toward station Q at 60 km/h. Train B leaves station Q at 10 AM traveling toward station P at 90 km/h. If the distance between P and Q is 450 km, at what time will the trains meet?

  #v(0.4em)
  #answer-choice("A", [11:12 AM]) \
  #answer-choice("B", [11:35 AM]) \
  #answer-choice("C", [12:00 PM]) \
  #answer-choice("D", [12:36 PM]) \
  #answer-choice("E", [1:44 PM])
]

#question-box("36")[
  Working alone, machine A can complete a job in 8 hours, machine B in 12 hours, and machine C in 24 hours. If all three machines work together for 2 hours, what fraction of the job remains?

  #v(0.4em)
  #answer-choice("A", [$1/4$]) \
  #answer-choice("B", [$1/3$]) \
  #answer-choice("C", [$5/12$]) \
  #answer-choice("D", [$1/2$]) \
  #answer-choice("E", [$7/12$])
]

#question-box("37")[
  A container has 80 liters of milk. A milkman removes 10 liters and replaces it with water. He repeats this process one more time. What is the final ratio of milk to water in the container?

  #v(0.4em)
  #answer-choice("A", [$49:31$]) \
  #answer-choice("B", [$7:4$]) \
  #answer-choice("C", [$60:20$]) \
  #answer-choice("D", [$3:1$]) \
  #answer-choice("E", [$16:9$])
]

#question-box("38")[
  If the price of an article is increased by 25% and then decreased by 20%, the final price is \$60. What was the original price?

  #v(0.4em)
  #answer-choice("A", [\$50]) \
  #answer-choice("B", [\$55]) \
  #answer-choice("C", [\$60]) \
  #answer-choice("D", [\$65]) \
  #answer-choice("E", [\$70])
]

#question-box("39")[
  An investment of \$8,000 grows to \$9,261 in 2 years with annual compound interest. What is the annual interest rate?

  #v(0.4em)
  #answer-choice("A", [6%]) \
  #answer-choice("B", [7%]) \
  #answer-choice("C", [7.5%]) \
  #answer-choice("D", [8%]) \
  #answer-choice("E", [10%])
]

#question-box("40")[
  In a class, the ratio of boys to girls is 5:7. If 4 boys leave and 4 girls join, the ratio becomes 1:2. How many students were originally in the class?

  #v(0.4em)
  #answer-choice("A", [36]) \
  #answer-choice("B", [48]) \
  #answer-choice("C", [60]) \
  #answer-choice("D", [72]) \
  #answer-choice("E", [84])
]

#question-box("41")[
  A sum of money is divided among A, B, and C in the ratio 2:3:5. If C receives \$400 more than B, what is the total sum of money?

  #v(0.4em)
  #answer-choice("A", [\$2,000]) \
  #answer-choice("B", [\$2,500]) \
  #answer-choice("C", [\$3,000]) \
  #answer-choice("D", [\$3,500]) \
  #answer-choice("E", [\$4,000])
]

#question-box("42")[
  A shopkeeper marks an article at a price that would give him 30% profit. However, he gives a discount and gains only 17%. What percentage discount did he give?

  #v(0.4em)
  #answer-choice("A", [8%]) \
  #answer-choice("B", [10%]) \
  #answer-choice("C", [12%]) \
  #answer-choice("D", [13%]) \
  #answer-choice("E", [15%])
]

#question-box("43")[
  If $x$ varies inversely as $y^2$ and $x = 8$ when $y = 2$, what is the value of $x$ when $y = 4$?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [16]) \
  #answer-choice("E", [32])
]

#question-box("44")[
  A car depreciates by 20% in the first year and by 15% of its value at the beginning of the second year. If its value after 2 years is \$27,200, what was its original value?

  #v(0.4em)
  #answer-choice("A", [\$36,000]) \
  #answer-choice("B", [\$38,000]) \
  #answer-choice("C", [\$40,000]) \
  #answer-choice("D", [\$42,000]) \
  #answer-choice("E", [\$45,000])
]

#question-box("45")[
  Workers A, B, and C can complete a job in 8, 12, and 24 days respectively. They start working together, but A leaves after 2 days and B leaves 1 day before the job is completed. In how many days is the job completed? (choose the closest answer)

  #v(0.4em)
  #answer-choice("A", [4 days and 12 hours]) \
  #answer-choice("B", [5 days and 20 hours]) \
  #answer-choice("C", [6 days and 12 hours]) \
  #answer-choice("D", [8 days and 10 hours]) \
  #answer-choice("E", [9 days and 6 hours])
]

#question-box("46")[
  If $a/b = 2/3$ and $b/c = 4/5$, what is $(a + b)/(b + c)$?

  #v(0.4em)
  #answer-choice("A", [$2/3$]) \
  #answer-choice("B", [$20/27$]) \
  #answer-choice("C", [$5/6$]) \
  #answer-choice("D", [$7/9$]) \
  #answer-choice("E", [$8/9$])
]

#question-box("47")[
  A sum of money invested at compound interest doubles in 4 years. In how many years will it become 8 times the original amount?

  #v(0.4em)
  #answer-choice("A", [8 years]) \
  #answer-choice("B", [10 years]) \
  #answer-choice("C", [12 years]) \
  #answer-choice("D", [16 years]) \
  #answer-choice("E", [20 years])
]

#question-box("48")[
  Two pipes A and B can fill a tank in 12 and 18 minutes respectively. A third pipe C can empty the full tank in 9 minutes. If all three pipes are opened simultaneously, in how many minutes will the tank be filled?

  #v(0.4em)
  #answer-choice("A", [24 minutes]) \
  #answer-choice("B", [30 minutes]) \
  #answer-choice("C", [36 minutes]) \
  #answer-choice("D", [42 minutes]) \
  #answer-choice("E", [The tank will never be filled])
]

#question-box("49")[
  A car travels from City X to City Y at an average speed of 60 km/h and returns at 40 km/h. If the total travel time is 10 hours, what is the distance between the two cities?

  #v(0.4em)
  #answer-choice("A", [200 km]) \
  #answer-choice("B", [220 km]) \
  #answer-choice("C", [240 km]) \
  #answer-choice("D", [260 km]) \
  #answer-choice("E", [280 km])
]

#question-box("50")[
  A chemist has a 30% acid solution and a 70% acid solution. How many liters of each should be mixed to obtain 20 liters of a 50% acid solution?

  #v(0.4em)
  #answer-choice("A", [10 liters each]) \
  #answer-choice("B", [8 liters of 30% and 12 liters of 70%]) \
  #answer-choice("C", [12 liters of 30% and 8 liters of 70%]) \
  #answer-choice("D", [6 liters of 30% and 14 liters of 70%]) \
  #answer-choice("E", [14 liters of 30% and 6 liters of 70%])
]#pagebreak()

#block(
  width: 100%,
  fill: uptoten-blue,
  inset: (x: 1.5em, y: 1em),
  radius: 4pt,
  [
    #text(size: 16pt, weight: "bold", fill: white)[
      Section 3: Questions 51-75
    ]
  ]
)

#v(1.5em)

#question-box("51")[
  If the line $y = m x + b$ passes through points $(2, 5)$ and $(6, -3)$, what is the value of $b$?

  #v(0.4em)
  #answer-choice("A", [7]) \
  #answer-choice("B", [9]) \
  #answer-choice("C", [11]) \
  #answer-choice("D", [13]) \
  #answer-choice("E", [15])
]

#question-box("52")[
  For what value(s) of $k$ does the line $y = 2x + k$ intersect the parabola $y = x^2 - 4x + 7$ at exactly one point?

  #v(0.4em)
  #answer-choice("A", [1 only]) \
  #answer-choice("B", [3 only]) \
  #answer-choice("C", [$-2$ only]) \
  #answer-choice("D", [1 and $-2$]) \
  #answer-choice("E", [-1 and $2$])
]

#question-box("53")[
  If $|x - 2| + |x - 6| = 8$, how many integer values of $x$ satisfy the equation?

  #v(0.4em)
  #answer-choice("A", [3]) \
  #answer-choice("B", [5]) \
  #answer-choice("C", [7]) \
  #answer-choice("D", [9]) \
  #answer-choice("E", [Infinitely many])
]

#question-box("54")[
  If $f(x) = x^2 - 2x$ and $g(x) = 3x - 4$, for what values of $x$ does $f(x) = g(x)$?

  #v(0.4em)
  #answer-choice("A", [$x = 4$ and $x = 1$]) \
  #answer-choice("B", [$x = -1$ and $x = 1$]) \
  #answer-choice("C", [$x = -1$ and $x = -2$]) \
  #answer-choice("D", [$x = 1$ and $x = 2$]) \
  #answer-choice("E", [$x = -2$ and $x = 4$])
]

#question-box("55")[
  If $4^x - 4^(x-1) = 48$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [4]) \
  #answer-choice("E", [5])
]

#question-box("56")[
  The line $a x + b y = 12$ passes through the points $(1, 8)$ and $(3, 0)$. What is the value of $a + b$?

  #v(0.4em)
  #answer-choice("A", [3]) \
  #answer-choice("B", [5]) \
  #answer-choice("C", [8]) \
  #answer-choice("D", [10]) \
  #answer-choice("E", [12])
]

#question-box("57")[
  If $x^4 - 13x^2 + 36 = 0$, what is the sum of all possible values of $x$?

  #v(0.4em)
  #answer-choice("A", [$-6$]) \
  #answer-choice("B", [0]) \
  #answer-choice("C", [6]) \
  #answer-choice("D", [13]) \
  #answer-choice("E", [36])
]

#question-box("58")[
  For what values of $x$ is $x^2 - 5x + 6 < 0$?

  #v(0.4em)
  #answer-choice("A", [$x < 2$ or $x > 3$]) \
  #answer-choice("B", [$2 < x < 3$]) \
  #answer-choice("C", [$x < -3$ or $x > -2$]) \
  #answer-choice("D", [$-3 < x < -2$]) \
  #answer-choice("E", [$x < 1$ or $x > 6$])
]

#question-box("59")[
  If $f(x) = 2x - 1$ and $f(f(x)) = 10$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [2.25]) \
  #answer-choice("B", [2.5]) \
  #answer-choice("C", [2.75]) \
  #answer-choice("D", [3.25]) \
  #answer-choice("E", [3.5])
]

#question-box("60")[
  If $x^2 + k x + 9 = (x + p)^2$ for all values of $x$, what is the value of $k + p$?

  #v(0.4em)
  #answer-choice("A", [$-3$]) \
  #answer-choice("B", [0]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [6]) \
  #answer-choice("E", [9])
]

#question-box("61")[
  The graph of $y = a x^2 + b x + c$ has its vertex at $(2, -3)$ and passes through the point $(0, 1)$. What is the value of $a$?

  #v(0.4em)
  #answer-choice("A", [$-1$]) \
  #answer-choice("B", [$1/2$]) \
  #answer-choice("C", [1]) \
  #answer-choice("D", [$3/2$]) \
  #answer-choice("E", [2])
]

#question-box("62")[
  If the roots of $x^2 + p x + q = 0$ are 3 and $-5$, what is the value of $p - q$?

  #v(0.4em)
  #answer-choice("A", [$-17$]) \
  #answer-choice("B", [$-13$]) \
  #answer-choice("C", [2]) \
  #answer-choice("D", [13]) \
  #answer-choice("E", [17])
]

#question-box("63")[
  If $sqrt(2x + 6) + sqrt(x - 1) = 6$ and $x > 1$, what is the value of $x$?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [5]) \
  #answer-choice("E", [6])
]

#question-box("64")[
  Two lines $2x + 3y = 12$ and $3x - k y = 8$ are perpendicular. What is the value of $k$?

  #v(0.4em)
  #answer-choice("A", [$-2$]) \
  #answer-choice("B", [$-1$]) \
  #answer-choice("C", [1]) \
  #answer-choice("D", [2]) \
  #answer-choice("E", [4])
]

#question-box("65")[
  If $x$ satisfies $x^2 - 7|x| + 12 = 0$, how many distinct values of $x$ are possible?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [4]) \
  #answer-choice("E", [Infinitely many])
]

#question-box("66")[
  If the parabola $y = x^2 + b x + c$ has its minimum value at $x = 3$ and this minimum value is 5, what is $c$?

  #v(0.4em)
  #answer-choice("A", [$-4$]) \
  #answer-choice("B", [5]) \
  #answer-choice("C", [9]) \
  #answer-choice("D", [11]) \
  #answer-choice("E", [14])
]

#question-box("67")[
  For how many integer values of $x$ is $|x - 2| + |x + 1| <= 7$?

  #v(0.4em)
  #answer-choice("A", [5]) \
  #answer-choice("B", [7]) \
  #answer-choice("C", [9]) \
  #answer-choice("D", [11]) \
  #answer-choice("E", [Infinitely many])
]

#question-box("68")[
  If $x + y = 8$ and $x^2 - y^2 = 32$, what is the value of $x - y$?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [5]) \
  #answer-choice("E", [6])
]

#question-box("69")[
  If $f(x) = (x^2 - 9)/(x - 3)$ for $x != 3$, what value should be assigned to $f(3)$ to make $f$ continuous at $x = 3$?

  #v(0.4em)
  #answer-choice("A", [0]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [6]) \
  #answer-choice("D", [9]) \
  #answer-choice("E", [Undefined])
]

#question-box("70")[
  If the discriminant of the quadratic equation $a x^2 + 12x + c = 0$ is 0 and $a = 2$, what is the value of $c$?

  #v(0.4em)
  #answer-choice("A", [6]) \
  #answer-choice("B", [12]) \
  #answer-choice("C", [18]) \
  #answer-choice("D", [24]) \
  #answer-choice("E", [36])
]

#question-box("71")[
  Points $A(1, 2)$, $B(4, 6)$, and $C(7, y)$ are collinear. What is the value of $y$?

  #v(0.4em)
  #answer-choice("A", [8]) \
  #answer-choice("B", [9]) \
  #answer-choice("C", [10]) \
  #answer-choice("D", [11]) \
  #answer-choice("E", [12])
]

#question-box("72")[
  If $9^x - 3^x = 6$, what is the value of $3^x$?

  #v(0.4em)
  #answer-choice("A", [1]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [$-2$ or 3]) \
  #answer-choice("E", [$-1$ or 3])
]

#question-box("73")[
  Lines $L_1$ and $L_2$ are parallel. If the slope of $L_1$ is $(a - 2)/(3)$ and the slope of $L_2$ is $(3a + 1)/(6)$, what is the value of $a$?

  #v(0.4em)
  #answer-choice("A", [$-5$]) \
  #answer-choice("B", [$-3$]) \
  #answer-choice("C", [1]) \
  #answer-choice("D", [3]) \
  #answer-choice("E", [5])
]

#question-box("74")[
  If $f(x) = a x^2 + b x + c$ and $f(0) = 3$, $f(1) = 6$, and $f(-1) = 4$, what is the value of $a + b + c$?

  #v(0.4em)
  #answer-choice("A", [3]) \
  #answer-choice("B", [4]) \
  #answer-choice("C", [5]) \
  #answer-choice("D", [6]) \
  #answer-choice("E", [7])
]

#question-box("75")[
  If $(x - 2)$ is a factor of $x^3 - a x^2 + b x - 12$ and the remainder when this polynomial is divided by $(x - 1)$ is $-9$, what is the value of $a$?

  #v(0.4em)
  #answer-choice("A", [0]) \
  #answer-choice("B", [1]) \
  #answer-choice("C", [3]) \
  #answer-choice("D", [4]) \
  #answer-choice("E", [7])
]#pagebreak()

#block(
  width: 100%,
  fill: uptoten-blue,
  inset: (x: 1.5em, y: 1em),
  radius: 4pt,
  [
    #text(size: 16pt, weight: "bold", fill: white)[
      Section 4: Questions 76-100
    ]
  ]
)

#v(1.5em)

#question-box("76")[
  A rectangular field is 50 meters longer than it is wide. If the perimeter is 380 meters, what is the area of the field in square meters?

  #v(0.4em)
  #answer-choice("A", [7,200]) \
  #answer-choice("B", [7,500]) \
  #answer-choice("C", [8,400]) \
  #answer-choice("D", [9,000]) \
  #answer-choice("E", [9,600])
]

#question-box("77")[
  A square and a rectangle have equal areas. If the rectangle has dimensions 9 cm by 16 cm, what is the perimeter of the square in cm?

  #v(0.4em)
  #answer-choice("A", [24]) \
  #answer-choice("B", [36]) \
  #answer-choice("C", [40]) \
  #answer-choice("D", [48]) \
  #answer-choice("E", [50])
]

#question-box("78")[
  John purchased apples at \$3 per kg and oranges at \$5 per kg. He spent a total of \$47 and bought 11 kg of fruit in all. How many kg of apples did he buy?

  #v(0.4em)
  #answer-choice("A", [4]) \
  #answer-choice("B", [5]) \
  #answer-choice("C", [6]) \
  #answer-choice("D", [7]) \
  #answer-choice("E", [8])
]

#question-box("79")[
  The sum of the ages of a father and son is 56 years. Four years ago, the father was 5 times as old as the son. What is the present age of the father?

  #v(0.4em)
  #answer-choice("A", [36]) \
  #answer-choice("B", [40]) \
  #answer-choice("C", [44]) \
  #answer-choice("D", [48]) \
  #answer-choice("E", [52])
]

#question-box("80")[
  A positive integer $n$ when divided by 7 leaves a remainder of 3, and when divided by 11 leaves a remainder of 5. What is the smallest possible value of $n$?

  #v(0.4em)
  #answer-choice("A", [38]) \
  #answer-choice("B", [52]) \
  #answer-choice("C", [59]) \
  #answer-choice("D", [73]) \
  #answer-choice("E", [80])
]

#question-box("81")[
  The sum of four consecutive odd integers is 112. What is the product of the smallest and largest of these integers?

  #v(0.4em)
  #answer-choice("A", [675]) \
  #answer-choice("B", [693]) \
  #answer-choice("C", [728]) \
  #answer-choice("D", [755]) \
  #answer-choice("E", [775])
]

#question-box("82")[
  A cistern has two inlet pipes A and B that can fill it in 12 and 15 hours respectively, and an outlet pipe C that can empty it in 10 hours. If all three pipes are opened when the cistern is empty, how long will it take to fill the cistern?

  #v(0.4em)
  #answer-choice("A", [20 hours]) \
  #answer-choice("B", [30 hours]) \
  #answer-choice("C", [40 hours]) \
  #answer-choice("D", [50 hours]) \
  #answer-choice("E", [The cistern will never fill])
]

#question-box("83")[
  A bookseller sells books at a 10% discount on the marked price and still makes a 35% profit. If his cost price for a book is \$90, what is the marked price?

  #v(0.4em)
  #answer-choice("A", [\$120]) \
  #answer-choice("B", [\$125]) \
  #answer-choice("C", [\$130]) \
  #answer-choice("D", [\$135]) \
  #answer-choice("E", [\$140])
]

#question-box("84")[
  A rectangular box has dimensions in the ratio 2:3:5, and its total surface area is 558 square cm. What is the volume of the box in cubic cm?

  #v(0.4em)
  #answer-choice("A", [540]) \
  #answer-choice("B", [648]) \
  #answer-choice("C", [750]) \
  #answer-choice("D", [810]) \
  #answer-choice("E", [900])
]

#question-box("85")[
  Two numbers are in the ratio 3:5. If 9 is added to each number, the ratio becomes 6:7. What is the larger of the two original numbers?

  #v(0.4em)
  #answer-choice("A", [2]) \
  #answer-choice("B", [3]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [5]) \
  #answer-choice("E", [6])
]

#question-box("86")[
  A merchant has 120 liters of a 40% alcohol solution. How many liters of pure alcohol must be added to make it a 50% alcohol solution?

  #v(0.4em)
  #answer-choice("A", [12]) \
  #answer-choice("B", [15]) \
  #answer-choice("C", [18]) \
  #answer-choice("D", [20]) \
  #answer-choice("E", [24])
]

#question-box("87")[
  The average of five consecutive integers is $n$. If the smallest integer is removed, what is the average of the remaining four integers?

  #v(0.4em)
  #answer-choice("A", [$n - 1$]) \
  #answer-choice("B", [$n$]) \
  #answer-choice("C", [$n + 1$]) \
  #answer-choice("D", [$n + 1/2$]) \
  #answer-choice("E", [$n + 2$])
]

#question-box("88")[
  A circular track has a circumference of 440 meters. If two runners start at the same point and run in opposite directions at speeds of 6 m/s and 5 m/s, after how many seconds will they meet for the first time?

  #v(0.4em)
  #answer-choice("A", [30]) \
  #answer-choice("B", [35]) \
  #answer-choice("C", [40]) \
  #answer-choice("D", [44]) \
  #answer-choice("E", [50])
]

#question-box("89")[
  A man invested a total of \$15,000 in two schemes A and B at 10% and 12% simple annual interest respectively. If the total interest after one year is \$1,680, how much did he invest in scheme B?

  #v(0.4em)
  #answer-choice("A", [\$6,000]) \
  #answer-choice("B", [\$7,000]) \
  #answer-choice("C", [\$8,000]) \
  #answer-choice("D", [\$9,000]) \
  #answer-choice("E", [\$10,000])
]

#question-box("90")[
  In a class of 60 students, the ratio of boys to girls is 7:5. If 15 new girls join the class, what will be the new ratio of boys to girls?

  #v(0.4em)
  #answer-choice("A", [7:6]) \
  #answer-choice("B", [7:7]) \
  #answer-choice("C", [7:8]) \
  #answer-choice("D", [7:9]) \
  #answer-choice("E", [7:10])
]

#question-box("91")[
  A boat travels 30 km upstream in 6 hours and returns downstream in 3 hours. What is the speed of the stream in km/h?

  #v(0.4em)
  #answer-choice("A", [1.5]) \
  #answer-choice("B", [2]) \
  #answer-choice("C", [2.5]) \
  #answer-choice("D", [3]) \
  #answer-choice("E", [3.5])
]

#question-box("92")[
  A taxi charges \$4 for the first kilometer and \$2.50 for each additional kilometer. If a passenger paid \$41.50 for a trip, how many kilometers was the trip?

  #v(0.4em)
  #answer-choice("A", [12]) \
  #answer-choice("B", [14]) \
  #answer-choice("C", [15]) \
  #answer-choice("D", [16]) \
  #answer-choice("E", [18])
]

#question-box("93")[
  In a factory, machine X produces 120 units in 5 hours and machine Y produces 180 units in 6 hours. Working together, how many units can they produce in 4 hours?

  #v(0.4em)
  #answer-choice("A", [192]) \
  #answer-choice("B", [210]) \
  #answer-choice("C", [216]) \
  #answer-choice("D", [240]) \
  #answer-choice("E", [264])
]

#question-box("94")[
  The average of $x$, $y$, and $z$ is 18. If $x$ is 3 more than $y$ and $z$ is 6 less than $y$, what is the value of $y$?

  #v(0.4em)
  #answer-choice("A", [15]) \
  #answer-choice("B", [17]) \
  #answer-choice("C", [18]) \
  #answer-choice("D", [19]) \
  #answer-choice("E", [21])
]

#question-box("95")[
  A rectangular garden is surrounded by a 2-meter-wide path on all sides. If the garden measures 20 meters by 30 meters, what is the area of the path in square meters?

  #v(0.4em)
  #answer-choice("A", [208]) \
  #answer-choice("B", [216]) \
  #answer-choice("C", [224]) \
  #answer-choice("D", [232]) \
  #answer-choice("E", [240])
]

#question-box("96")[
  A student needs an average of 85% on four tests to earn a B grade. If his scores on the first three tests are 78%, 82%, and 88%, what is the minimum score he needs on the fourth test?

  #v(0.4em)
  #answer-choice("A", [90%]) \
  #answer-choice("B", [92%]) \
  #answer-choice("C", [94%]) \
  #answer-choice("D", [96%]) \
  #answer-choice("E", [98%])
]

#question-box("97")[
  A clock shows the correct time at noon. If it loses 15 minutes every hour, what time will it show when the actual time is 8:00 PM on the same day?

  #v(0.4em)
  #answer-choice("A", [4:00 PM]) \
  #answer-choice("B", [5:00 PM]) \
  #answer-choice("C", [6:00 PM]) \
  #answer-choice("D", [6:30 PM]) \
  #answer-choice("E", [7:00 PM])
]

#question-box("98")[
  A sum of \$900 is divided among A, B, and C in the ratio 2:3:4. If B gives \$30 to A and \$20 to C, what is the new ratio of their shares?

  #v(0.4em)
  #answer-choice("A", [21:23:38]) \
  #answer-choice("B", [22:24:40]) \
  #answer-choice("C", [23:25:42]) \
  #answer-choice("D", [24:26:44]) \
  #answer-choice("E", [25:27:46])
]

#question-box("99")[
  A container is filled with a 60-liter mixture of milk and water in the ratio 7:5. How many liters of water should be added to make the ratio 7:8?

  #v(0.4em)
  #answer-choice("A", [8]) \
  #answer-choice("B", [10]) \
  #answer-choice("C", [12]) \
  #answer-choice("D", [15]) \
  #answer-choice("E", [18])
]

#question-box("100")[
  Two cyclists start from the same point and travel in opposite directions. One cyclist travels at 15 km/h and the other at 20 km/h. After how many hours will they be 140 km apart?

  #v(0.4em)
  #answer-choice("A", [3]) \
  #answer-choice("B", [3.5]) \
  #answer-choice("C", [4]) \
  #answer-choice("D", [4.5]) \
  #answer-choice("E", [5])
]

// #pagebreak()

// = Answer Key

// The following are the correct answers for each question in this practice set. Review your responses and identify areas where you need additional practice.

// == Section 1 (Questions 1-25)

// #table(
//   columns: 5,
//   stroke: none,
//   align: left,
//   column-gutter: 1.5em,
//   row-gutter: 0.5em,
//   [1. A], [2. D], [3. C], [4. A], [5. B],
//   [6. A], [7. B], [8. C], [9. D], [10. C],
//   [11. A], [12. B], [13. B], [14. D], [15. C],
//   [16. C], [17. C], [18. D], [19. D], [20. D],
//   [21. E], [22. E], [23. B], [24. B], [25. C]
// )

// == Section 2 (Questions 26-50)

// #table(
//   columns: 5,
//   stroke: none,
//   align: left,
//   column-gutter: 1.5em,
//   row-gutter: 0.5em,
//   [26. B], [27. B], [28. D], [29. D], [30. C],
//   [31. E], [32. C], [33. C], [34. D], [35. D],
//   [36. D], [37. A], [38. C], [39. C], [40. B],
//   [41. A], [42. B], [43. B], [44. C], [45. C],
//   [46. B], [47. C], [48. C], [49. C], [50. A]
// )

// == Section 3 (Questions 51-75)

// #table(
//   columns: 5,
//   stroke: none,
//   align: left,
//   column-gutter: 1.5em,
//   row-gutter: 0.5em,
//   [51. B], [52. C], [53. D], [54. A], [55. C],
//   [56. B], [57. B], [58. B], [59. D], [60. E],
//   [61. C], [62. E], [63. D], [64. D], [65. D],
//   [66. E], [67. B], [68. C], [69. C], [70. C],
//   [71. C], [72. C], [73. A], [74. D], [75. A]
// )

// == Section 4 (Questions 76-100)

// #table(
//   columns: 5,
//   stroke: none,
//   align: left,
//   column-gutter: 1.5em,
//   row-gutter: 0.5em,
//   [76. C], [77. D], [78. A], [79. C], [80. A],
//   [81. E], [82. A], [83. D], [84. D], [85. D],
//   [86. E], [87. D], [88. C], [89. D], [90. C],
//   [91. C], [92. D], [93. C], [94. D], [95. B],
//   [96. B], [97. C], [98. C], [99. D], [100. C]
// )