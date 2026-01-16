#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Word Problems",
  level: "Hard / Very Hard Problem Modeling",
  intro: "Challenging exercises focused on modeling complex word problems. These problems require careful translation of verbal descriptions into mathematical equations, multi-step reasoning, and systematic solution approaches. Work through the questions first, then check the detailed solutions.",
  logo: "/Logo.png"
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Part I: Exercises

Work through each problem carefully. Focus on setting up the problem correctly before attempting to solve it. These problems are designed to challenge your problem-modeling skills at a high level.

#warning-box[
  *Difficulty Level:* Hard to Very Hard

  These problems require:
  - Careful translation of words into mathematical expressions
  - Multiple variables and equations working together
  - Strategic organization of complex information
  - Systematic case analysis and constraint handling
]

#pagebreak()

== Section A: Advanced Rate Problems

=== Exercise A1: Multi-Leg Journey with Variable Speeds

A car travels from City A to City B. For the first third of the distance, it travels at 60 km/h. For the second third, it travels at 80 km/h. For the final third, it travels at 120 km/h.

*Questions:*
+ Set up expressions for the time taken for each segment in terms of the total distance $D$.
+ Calculate the total time for the journey in terms of $D$.
+ Find the average speed for the entire journey. Explain why this differs from the arithmetic mean of the three speeds.
+ If the total distance is 360 km and the car had instead traveled at a constant speed equal to the arithmetic mean of the three speeds, would it have arrived earlier or later? By how much?

#v(4cm)

=== Exercise A2: Pursuit and Meeting Problems

Two trains leave stations A and B simultaneously, heading toward each other. Train 1 travels at 80 km/h and Train 2 at 100 km/h. The distance between stations is 450 km.

*Questions:*
+ Model the position of each train as a function of time $t$ hours after departure.
+ At what time and at what location do the trains meet?
+ A bird starts at Train 1 and flies back and forth between the trains at 150 km/h until the trains meet. Without calculating each leg of the bird's journey, find the total distance the bird travels.
+ If Train 1 departs 30 minutes before Train 2, at what position do they meet?

#v(4cm)

=== Exercise A3: Round-Trip Average Speed

A cyclist rides uphill at 12 km/h and returns downhill on the same path at 36 km/h.

*Questions:*
+ Prove that the average speed for the round trip is 18 km/h, regardless of the distance. Derive this using the harmonic mean formula.
+ Derive a general formula for the average round-trip speed given uphill speed $u$ and downhill speed $d$: show that the result is $frac(2 u d, u + d)$.
+ The cyclist can alternatively take a flat route at 20 km/h. If the hilly route is 25% shorter (one way), which route is faster for a round trip?
+ Generalize: for what percentage difference in route length would the two options take exactly the same time?

#v(4cm)

#pagebreak()

=== Exercise A4: Stream and Current Problems

A boat can travel 30 km downstream in the same time it takes to travel 18 km upstream.

*Questions:*
+ Let $b$ be the boat's speed in still water and $c$ be the current speed. Set up an equation relating these quantities to the given information.
+ Solve for the ratio $b : c$.
+ If the boat takes 2 hours to travel 48 km downstream, find the exact values of $b$ and $c$.
+ How long would it take the boat to travel 80 km upstream and return downstream to its starting point?

#v(4cm)

=== Exercise A5: Circular Track Problems

Two runners start at the same point on a 400-meter circular track. Runner A runs clockwise at 5 m/s, and Runner B runs counterclockwise at 3 m/s.

*Questions:*
+ How long until they first meet again at the starting point? (LCM approach)
+ How long until they first meet anywhere on the track? (Relative speed approach)
+ How many times do they meet (excluding the start) in the first 10 minutes?
+ If Runner A stops after 4 minutes, at what position on the track is Runner A, and how long after Runner A stops until Runner B reaches that position?

#v(4cm)

#pagebreak()

== Section B: Advanced Work Problems

=== Exercise B1: Multiple Workers with Variable Rates

Worker A can complete a job in 10 days. Worker B can complete it in 15 days. Worker C can complete it in 30 days.

*Questions:*
+ Express each worker's daily rate as a fraction of the job.
+ If all three work together, how many days does the job take? Set up and solve the equation.
+ If A and B work together for 3 days, then B and C complete the remaining work, how many total days does the job take?
+ Is it possible to design a schedule where each worker works exactly 5 days and the job is completed exactly? Prove your answer algebraically.

#v(4cm)

=== Exercise B2: Work with Efficiency Changes

Machine A produces 120 widgets per hour. Machine B produces 80 widgets per hour. However, Machine A requires 15 minutes of maintenance every hour, while Machine B operates continuously.

*Questions:*
+ Calculate the effective hourly production rate for each machine.
+ If both machines operate for a standard 8-hour shift, how many total widgets are produced?
+ After 4 hours of operation, Machine B's efficiency drops by 25%. How many widgets does Machine B produce in the full 8-hour shift?
+ A rush order requires 1,400 widgets. If both machines start simultaneously (with Machine B's efficiency drop after 4 hours still applying), how long until the order is complete?

#v(4cm)

#pagebreak()

=== Exercise B3: Pipes and Tanks

A tank has two inlet pipes and one outlet drain. Pipe A can fill the empty tank in 4 hours. Pipe B can fill it in 6 hours. The drain can empty a full tank in 8 hours.

*Questions:*
+ Express each pipe's rate (positive for filling, negative for draining) as a fraction of the tank per hour.
+ If all three are open simultaneously, how long does it take to fill an empty tank?
+ The tank is initially $1/3$ full. Pipe A and the drain are both opened. After 2 hours, Pipe B is also opened. How long from the start until the tank is completely full?
+ Starting with an empty tank and all three open, after how many hours should the drain be closed so that the tank fills at exactly $t = 6$ hours?

#v(4cm)

=== Exercise B4: Work Rate Ratios

Two workers, X and Y, work on a project. X works at three times the rate of Y.

*Questions:*
+ If they complete the job together in 6 days, find each worker's individual completion time.
+ After 2 days of working together, X leaves. How many additional days does Y need to finish alone?
+ Starting over: X works alone for the first $k$ days, then Y joins and they finish together. If the total time is 10 days, find $k$.
+ Generalize: if X works at $n$ times the rate of Y, and together they complete the job in $T$ days, express each worker's individual completion time in terms of $n$ and $T$.

#v(4cm)

#pagebreak()

== Section C: Mixture Problems

=== Exercise C1: Multi-Component Solutions

A chemist has three solutions: Solution A with 15% acid, Solution B with 40% acid, and Solution C with 75% acid.

*Questions:*
+ To create 100 mL of a 35% acid solution using only A and B, how many mL of each are needed?
+ Is it possible to create a 35% acid solution using equal volumes of all three solutions? Calculate the resulting concentration.
+ The chemist needs 300 mL of exactly 50% acid using A, B, and C. If the volume of C used equals the volume of A used, how much of each solution is needed?
+ What is the complete range of acid concentrations achievable using mixtures of A and C only? Prove your answer.

#v(4cm)

=== Exercise C2: Repeated Replacement

A 200-liter tank contains a 60% alcohol solution.

*Questions:*
+ If 40 liters are removed and replaced with pure water, what is the new alcohol concentration?
+ If this process (remove 40L, replace with water) is repeated a second time, what is the concentration?
+ Derive a formula for the concentration after $n$ such operations.
+ How many complete operations are needed to reduce the concentration to below 20%?

#v(4cm)

#pagebreak()

=== Exercise C3: Alloy and Mixture Value Problems

A jeweler has two gold alloys: Alloy X is 50% gold, and Alloy Y is 80% gold.

*Questions:*
+ How much of each alloy is needed to create 500 grams of a 70% gold alloy?
+ If the jeweler has only 150 grams of Alloy Y available, what is the maximum amount of 70% gold alloy that can be created?
+ The jeweler melts some 70% gold alloy with pure gold. How much pure gold must be added to 400 grams of 70% gold alloy to create an 85% gold alloy?
+ Prove that any concentration strictly between 50% and 100% can be achieved using Alloy X and pure gold, but concentrations at or below 50% cannot be achieved by adding pure gold to Alloy X.

#v(4cm)

=== Exercise C4: Pricing and Mixture Economics

A merchant mixes three types of coffee: Type A at \$8/kg, Type B at \$14/kg, and Type C at \$24/kg.

*Questions:*
+ If 4 kg of A, 5 kg of B, and 1 kg of C are mixed, what is the cost per kg of the mixture?
+ The merchant wants to create a 15 kg mixture worth \$16/kg using only A and C. How much of each type is needed?
+ What is the range of possible prices per kg for any mixture using only A and B?
+ The merchant has unlimited A and C, but only 3 kg of B. For a 12 kg mixture, what is the range of achievable prices per kg?

#v(4cm)

#pagebreak()

== Section D: Age Problems

=== Exercise D1: Multiple Time References

Currently, Maria is four times as old as her daughter Elena. In 16 years, Maria will be twice as old as Elena.

*Questions:*
+ Set up a system of equations using Maria's current age $M$ and Elena's current age $E$.
+ Solve for their current ages.
+ How many years ago was Maria seven times as old as Elena?
+ In how many years will the sum of their ages first exceed 100?

#v(4cm)

=== Exercise D2: Age Ratios

Three siblings have ages that are currently in the ratio 1 : 2 : 4. The sum of the squares of their ages is 336.

*Questions:*
+ Express each sibling's age in terms of a common variable $k$.
+ Set up and solve an equation to find each sibling's current age.
+ In how many years will their ages be in the ratio 2 : 3 : 5?
+ Is there any future time when their ages will be in the ratio 3 : 4 : 5? Prove or disprove algebraically.

#v(4cm)

#pagebreak()

=== Exercise D3: Past and Future Conditions

Five years ago, a father was 7 times as old as his son. Five years from now, the father will be 3 times as old as his son.

*Questions:*
+ Let $F$ and $S$ be the current ages. Set up two equations from the given conditions.
+ Solve for the current ages of the father and son.
+ At what age was the father exactly 5 times as old as his son?
+ Prove that there is no age at which the father was exactly 10 times as old as his son (assuming both have been alive since birth).

#v(4cm)

=== Exercise D4: Combined Age Conditions

The sum of the ages of a grandfather, father, and son is 120 years. The grandfather is twice as old as the father. Ten years ago, the grandfather was three times as old as the father was then.

*Questions:*
+ Let $G$, $F$, and $S$ be the current ages. Set up three equations.
+ Solve for all three ages.
+ What was the son's age when the father was the same age as the son is now?
+ In how many years will the sum of the father's and son's ages equal the grandfather's age at that time?

#v(4cm)

#pagebreak()

== Section E: Complex Multi-Step Problems

=== Exercise E1: Distance with Multiple Travelers

Alice and Bob start from the same point and walk in the same direction. Alice walks at 4 km/h. Bob starts 30 minutes later and walks at 6 km/h.

*Questions:*
+ At what time after Alice starts does Bob catch up to her?
+ How far from the starting point does this occur?
+ If Charlie starts at the same time as Alice but walks in the opposite direction at 5 km/h, how far apart are Bob and Charlie when Bob catches Alice?
+ At what time after Alice starts are Alice and Charlie exactly 20 km apart?

#v(4cm)

=== Exercise E2: Work with Changing Team Composition

A project requires a certain amount of work. Person A working alone can complete it in 20 days. Person B working alone can complete it in 30 days.

*Questions:*
+ A starts the project alone. After 8 days, A is joined by B. How many total days does the project take?
+ In the same scenario, what fraction of the work does each person complete?
+ Redesign: A and B start together, but after some number of days $d$, A leaves and B finishes alone. If the total project time is 15 days, find $d$.
+ What value of $d$ (where A works alone first, then B joins) minimizes the total project time while ensuring each person does at least 25% of the work?

#v(4cm)

#pagebreak()

=== Exercise E3: Mixture with Constraints

A container initially holds 100 liters of a 30% salt solution. A second container holds a 70% salt solution.

*Questions:*
+ How much solution must be transferred from the second container to the first to create a 45% salt solution in the first container?
+ After this transfer, what is the total volume in the first container?
+ Instead, suppose we want the first container to have exactly 50% salt concentration but must maintain exactly 100 liters total volume. How much solution must be removed from the first container and replaced with solution from the second?
+ Generalize: starting with $V$ liters of $c_1$% solution, derive a formula for the amount of $c_2$% solution (where $c_2 > c_1$) needed to achieve target concentration $c_t$%.

#v(4cm)

=== Exercise E4: Rate Problem with Delays

A train travels from Station A to Station B, a distance of 300 km. Due to a signal problem, the train stops for 20 minutes after traveling 100 km, then resumes at its original speed.

*Questions:*
+ If the train's speed is 80 km/h, what is the total travel time from A to B?
+ The train was supposed to arrive at B exactly 4 hours after leaving A. What constant speed would have been required (without the delay) to arrive on time?
+ With the 20-minute delay after 100 km, what speed would the train need on the remaining 200 km segment to still arrive at the originally scheduled time (4 hours after departure)?
+ If the train increases its speed by 25% for the final 200 km segment (after the delay), what original speed $v$ results in a total travel time of exactly 4 hours?

#v(4cm)

#pagebreak()

= Part II: Solutions

== Section A Solutions: Advanced Rate Problems

=== Solution A1: Multi-Leg Journey with Variable Speeds

Let the total distance be $D$ km.

*Question 1:* Time for each segment in terms of $D$:
- First third at 60 km/h: $t_1 = (D\/3) / 60 = D/180$ hours
- Second third at 80 km/h: $t_2 = (D\/3) / 80 = D/240$ hours
- Final third at 120 km/h: $t_3 = (D\/3) / 120 = D/360$ hours

*Question 2:* Total time:
$T = D/180 + D/240 + D/360$

Finding a common denominator (720):
$T = (4D)/720 + (3D)/720 + (2D)/720 = (9D)/720 = D/80$ hours

*Question 3:* Average speed:
$ "Average speed" = "Total distance" / "Total time" = D / (D\/80) = 80 " km/h" $

The arithmetic mean of 60, 80, and 120 is $(60 + 80 + 120)/3 approx 86.67$ km/h.

The average speed (80 km/h) is less than the arithmetic mean because the car spends *more time* at slower speeds and *less time* at faster speeds. Since each segment covers equal distance, slower segments take longer. The average speed is actually the *harmonic mean* of the three speeds.

*Question 4:* For $D = 360$ km:
- At variable speeds: time = $360/80 = 4.5$ hours
- At constant 86.67 km/h: time = $360/86.67 approx 4.15$ hours
- Difference: $4.5 - 4.15 = 0.35$ hours $approx$ 21 minutes

#highlight-box[
  *Answer:* The car would arrive 21 minutes *earlier* at constant speed equal to the arithmetic mean.
]

#pagebreak()

=== Solution A2: Pursuit and Meeting Problems

*Question 1:* Position functions (using Station A as origin, $t$ in hours):
- Train 1: $x_1(t) = 80t$ km from Station A
- Train 2: $x_2(t) = 450 - 100t$ km from Station A

*Question 2:* Meeting time and location:
$80t = 450 - 100t$
$180t = 450$
$t = 2.5$ hours

Position: $x = 80 times 2.5 = 200$ km from Station A.

#highlight-box[
  *Answer:* The trains meet after 2.5 hours, at a point 200 km from Station A.
]

*Question 3:* Bird's total distance:

#strategy-box[
  *Key Insight:* The bird flies continuously at 150 km/h for the entire time until the trains meet. We don't need to track each back-and-forth leg!
]

Since the trains meet after 2.5 hours, the bird flies for 2.5 hours at 150 km/h:
$ "Distance" = 150 times 2.5 = 375 " km" $

#highlight-box[
  *Answer:* The bird travels 375 km.
]

*Question 4:* With Train 1 departing 30 minutes early:
After time $t$ (measured from Train 1's departure):
- Train 1 position: $80t$
- Train 2 position (starts at $t = 0.5$): $450 - 100(t - 0.5)$ for $t >= 0.5$

At meeting: $80t = 450 - 100(t - 0.5) = 450 - 100t + 50 = 500 - 100t$
$180t = 500$
$t = 500/180 = 25/9 approx 2.78$ hours

Position: $80 times 25/9 = 2000/9 approx 222.2$ km from Station A.

#highlight-box[
  *Answer:* They meet approximately 222.2 km from Station A.
]

#pagebreak()

=== Solution A3: Round-Trip Average Speed

*Question 1:* Proof using harmonic mean:

Let the one-way distance be $d$ km.
- Time uphill: $d/12$ hours
- Time downhill: $d/36$ hours
- Total distance: $2d$ km
- Total time: $d/12 + d/36 = (3d + d)/36 = (4d)/36 = d/9$ hours

$ "Average speed" = (2d) / (d\/9) = 18 " km/h" $

This is independent of $d$, confirming the average is always 18 km/h.

*Question 2:* General formula:
$ "Average speed" = (2d) / (d/u + d/d) = (2d) / ((d(u + d))/(u d)) = (2 u d) / (u + d) $

This is the harmonic mean of $u$ and $d$.

*Question 3:* Comparing routes:

Let the hilly route one-way distance = $d$. Then the flat route distance = $d / 0.75 = (4d)/3$.

Hilly round trip time: $(2d)/18 = d/9$ hours

Flat round trip time: $(2 times (4d)/3) / 20 = ((8d)/3) / 20 = (8d)/60 = (2d)/15$ hours

Comparing: $d/9$ vs $(2d)/15$
$= (5d)/45$ vs $(6d)/45$

Since $(5d)/45 < (6d)/45$, the hilly route is faster.

#highlight-box[
  *Answer:* The hilly route is faster (by $(d)/45$ hours).
]

*Question 4:* For equal times:
$(2d)/18 = (2 times k d)/20$ where flat = $k times$ hilly distance
$d/9 = (k d)/10$
$10 = 9k$
$k = 10/9 approx 1.111$

The flat route would need to be $10/9 - 1 = 1/9 approx 11.1%$ longer for equal times.

#highlight-box[
  *Answer:* The routes take equal time when the flat route is about 11.1% longer.
]

#pagebreak()

=== Solution A4: Stream and Current Problems

*Question 1:* Setting up the equation:

Downstream speed = $b + c$, upstream speed = $b - c$.
Same time for different distances:
$ 30/(b + c) = 18/(b - c) $

*Question 2:* Solving for ratio:
$30(b - c) = 18(b + c)$
$30b - 30c = 18b + 18c$
$12b = 48c$
$b/c = 4$

#highlight-box[
  *Answer:* $b : c = 4 : 1$
]

*Question 3:* Finding exact values:
Downstream: $48/(b + c) = 2$ hours, so $b + c = 24$ km/h.
With $b = 4c$: $4c + c = 24$, giving $c = 4.8$ km/h and $b = 19.2$ km/h.

#highlight-box[
  *Answer:* Boat speed = 19.2 km/h, current speed = 4.8 km/h.
]

*Question 4:* Round trip of 80 km each way:
- Upstream (80 km): $80/(19.2 - 4.8) = 80/14.4 = 50/9$ hours
- Downstream (80 km): $80/(19.2 + 4.8) = 80/24 = 10/3$ hours
- Total: $50/9 + 10/3 = 50/9 + 30/9 = 80/9 approx 8.89$ hours

#highlight-box[
  *Answer:* The round trip takes $80/9 approx 8.89$ hours (8 hours 53 minutes).
]

#pagebreak()

=== Solution A5: Circular Track Problems

*Question 1:* Meeting at the starting point:

Runner A completes one lap in $400/5 = 80$ seconds.
Runner B completes one lap in $400/3 approx 133.33$ seconds.

LCM of 80 and $400/3$: Since $400/3 = 133.overline(3)$, we compute LCM$(80, 400/3)$.

Converting: LCM$(240/3, 400/3) = $ LCM$(240, 400)/3 = 1200/3 = 400$ seconds.

#highlight-box[
  *Answer:* They first meet at the starting point after 400 seconds (6 min 40 sec).
]

*Question 2:* First meeting anywhere:

Since they run in opposite directions, their relative speed is $5 + 3 = 8$ m/s.
Time to cover one lap at relative speed: $400/8 = 50$ seconds.

#highlight-box[
  *Answer:* They first meet after 50 seconds.
]

*Question 3:* Meetings in 10 minutes:

10 minutes = 600 seconds.
They meet every 50 seconds.
Number of meetings: $600/50 = 12$ meetings.

#highlight-box[
  *Answer:* They meet 12 times in the first 10 minutes.
]

*Question 4:* Runner A stops after 4 minutes (240 seconds):

A's position: $5 times 240 = 1200$ m = $1200 mod 400 = 0$ m (back at start!).

Actually, $1200 / 400 = 3$ complete laps, so A is at the starting point.

B's position after 240s: $3 times 240 = 720$ m counterclockwise = $720 mod 400 = 320$ m counterclockwise from start = 80 m clockwise from start.

B needs to travel: $400 - 80 = 320$ m more counterclockwise to reach start.
Time: $320/3 approx 106.67$ seconds.

#highlight-box[
  *Answer:* A is at the starting point. B reaches A approximately 107 seconds after A stops.
]

#pagebreak()

== Section B Solutions: Advanced Work Problems

=== Solution B1: Multiple Workers with Variable Rates

*Question 1:* Daily rates:
- A: $1/10$ of job per day
- B: $1/15$ of job per day
- C: $1/30$ of job per day

*Question 2:* All three together:
Combined rate = $1/10 + 1/15 + 1/30$

LCM of 10, 15, 30 is 30:
$= 3/30 + 2/30 + 1/30 = 6/30 = 1/5$ of job per day

Time = 5 days.

#highlight-box[
  *Answer:* Working together, the job takes 5 days.
]

*Question 3:* A and B work 3 days, then B and C finish:

Work done by A and B in 3 days: $3(1/10 + 1/15) = 3(3/30 + 2/30) = 3(5/30) = 15/30 = 1/2$

Remaining work: $1/2$

B and C's combined rate: $1/15 + 1/30 = 2/30 + 1/30 = 3/30 = 1/10$ per day

Time for remaining: $(1\/2)/(1\/10) = 5$ days

Total: $3 + 5 = 8$ days.

#highlight-box[
  *Answer:* The job takes 8 days total.
]

*Question 4:* Each works exactly 5 days:

Total work done: $5 times 1/10 + 5 times 1/15 + 5 times 1/30 = 5(1/10 + 1/15 + 1/30) = 5 times 1/5 = 1$

Yes, exactly 1 complete job!

#highlight-box[
  *Answer:* Yes, it is possible. If each worker works exactly 5 days (in any arrangement that totals 15 work-days), the job will be completed exactly.
]

#pagebreak()

=== Solution B2: Work with Efficiency Changes

*Question 1:* Effective hourly rates:

Machine A works 45 min/hour (15 min maintenance), so:
$"Effective rate"_A = 120 times (45/60) = 120 times 0.75 = 90$ widgets/hour

Machine B works continuously: 80 widgets/hour.

*Question 2:* 8-hour shift production:

Machine A: $8 times 90 = 720$ widgets
Machine B: $8 times 80 = 640$ widgets
Total: $720 + 640 = 1,360$ widgets

#highlight-box[
  *Answer:* 1,360 widgets are produced in an 8-hour shift.
]

*Question 3:* Machine B with efficiency drop:

First 4 hours: $4 times 80 = 320$ widgets
Next 4 hours at 75% efficiency: $4 times 60 = 240$ widgets
Total for B: $320 + 240 = 560$ widgets

#highlight-box[
  *Answer:* Machine B produces 560 widgets in the 8-hour shift.
]

*Question 4:* Time for 1,400 widgets:

For the first 4 hours:
- Combined rate: $90 + 80 = 170$ widgets/hour
- Production: $4 times 170 = 680$ widgets
- Remaining: $1400 - 680 = 720$ widgets

After 4 hours:
- Combined rate: $90 + 60 = 150$ widgets/hour
- Time for 720 widgets: $720/150 = 4.8$ hours

Total time: $4 + 4.8 = 8.8$ hours

#highlight-box[
  *Answer:* The order is complete after 8.8 hours (8 hours 48 minutes).
]

#pagebreak()

=== Solution B3: Pipes and Tanks

*Question 1:* Hourly rates:
- Pipe A: $+1/4$ tank/hour (fills)
- Pipe B: $+1/6$ tank/hour (fills)
- Drain: $-1/8$ tank/hour (empties)

*Question 2:* All three open, starting empty:

Net rate = $1/4 + 1/6 - 1/8$

LCM of 4, 6, 8 is 24:
$= 6/24 + 4/24 - 3/24 = 7/24$ tank/hour

Time to fill: $1 / (7\/24) = 24/7 approx 3.43$ hours

#highlight-box[
  *Answer:* The tank fills in $24/7 approx 3.43$ hours (about 3 hours 26 minutes).
]

*Question 3:* Tank starts $1/3$ full; A and drain open for 2 hours, then B joins:

First 2 hours (A and drain only):
Rate = $1/4 - 1/8 = 2/8 - 1/8 = 1/8$ tank/hour
Added in 2 hours: $2 times 1/8 = 1/4$ tank
Tank level after 2 hours: $1/3 + 1/4 = 4/12 + 3/12 = 7/12$

Remaining to fill: $1 - 7/12 = 5/12$

After B joins (all three open):
Rate = $7/24$ tank/hour (from Question 2)
Time: $(5\/12)/(7\/24) = (5/12) times (24/7) = 10/7$ hours

Total time: $2 + 10/7 = 24/7 approx 3.43$ hours

#highlight-box[
  *Answer:* The tank is full after $24/7 approx 3.43$ hours from the start.
]

*Question 4:* Close drain at time $t_0$ so tank fills at exactly $t = 6$ hours:

For $0 <= t <= t_0$: rate = $7/24$, fill = $(7 t_0)/24$
For $t_0 < t <= 6$: rate = $1/4 + 1/6 = 5/12$, fill = $(5/12)(6 - t_0)$

Total: $(7 t_0)/24 + (5/12)(6 - t_0) = 1$

$(7 t_0)/24 + (30 - 5 t_0)/12 = 1$
$(7 t_0)/24 + (60 - 10 t_0)/24 = 1$
$(7 t_0 + 60 - 10 t_0)/24 = 1$
$(60 - 3 t_0)/24 = 1$
$60 - 3 t_0 = 24$
$t_0 = 12$ hours

But this exceeds 6 hours! This means the tank fills before 6 hours even with the drain always open. The drain should remain open the entire time; closing it earlier would only speed up filling.

#highlight-box[
  *Answer:* The tank fills in $24/7 < 6$ hours with drain always open, so closing the drain is not necessary (or possible within the 6-hour window).
]

#pagebreak()

== Section C Solutions: Mixture Problems

=== Solution C1: Multi-Component Solutions

*Question 1:* A and B for 35% solution:

Let $x$ mL of A and $(100-x)$ mL of B.
$0.15x + 0.40(100-x) = 0.35(100)$
$0.15x + 40 - 0.40x = 35$
$-0.25x = -5$
$x = 20$ mL of A, $80$ mL of B

#highlight-box[
  *Answer:* 20 mL of Solution A and 80 mL of Solution B.
]

*Question 2:* Equal volumes of all three:

Each = $100/3$ mL (total 100 mL)
Concentration = $(0.15 + 0.40 + 0.75)/3 = 1.30/3 approx 0.433 = 43.3%$

This is greater than 35%, so equal volumes cannot achieve 35%.

#highlight-box[
  *Answer:* No. Equal volumes produce 43.3% concentration, not 35%.
]

*Question 3:* 300 mL at 50% with volume of A = volume of C:

Let A = C = $x$ mL, B = $(300 - 2x)$ mL.
$0.15x + 0.40(300 - 2x) + 0.75x = 0.50(300)$
$0.15x + 120 - 0.80x + 0.75x = 150$
$0.10x + 120 = 150$
$0.10x = 30$
$x = 300$

But this gives B = $300 - 600 = -300$, which is impossible!

The constraint that A = C is incompatible with achieving 50%. We need to reconsider.

Average of A and C: $(15 + 75)/2 = 45%$. Adding B (40%) can only lower this toward 40%, never reach 50%.

#highlight-box[
  *Answer:* This is impossible. Equal volumes of A and C average 45%, and adding B (40%) cannot raise the concentration to 50%.
]

*Question 4:* Range using A and C only:

Minimum: 15% (pure A)
Maximum: 75% (pure C)
All values in between are achievable by linear combination.

#highlight-box[
  *Answer:* Any concentration in the interval [15%, 75%] is achievable.
]

#pagebreak()

=== Solution C2: Repeated Replacement

*Question 1:* First replacement:

Initial: 200 L at 60% = 120 L alcohol
Remove 40 L of 60% solution: remove $40 times 0.60 = 24$ L alcohol
Remaining alcohol: $120 - 24 = 96$ L
Add 40 L water: total volume returns to 200 L
New concentration: $96/200 = 48%$

#highlight-box[
  *Answer:* The concentration is 48% after the first replacement.
]

*Question 2:* Second replacement:

After first: 200 L at 48% = 96 L alcohol
Remove 40 L of 48% solution: remove $40 times 0.48 = 19.2$ L alcohol
Remaining: $96 - 19.2 = 76.8$ L alcohol
New concentration: $76.8/200 = 38.4%$

#highlight-box[
  *Answer:* The concentration is 38.4% after the second replacement.
]

*Question 3:* Formula after $n$ operations:

Each operation retains $(200-40)/200 = 160/200 = 0.8$ of the alcohol.
After $n$ operations: concentration = $60% times (0.8)^n$

#highlight-box[
  *Answer:* $C_n = 60 times (0.8)^n$ percent
]

*Question 4:* Operations to reach below 20%:

$60 times (0.8)^n < 20$
$(0.8)^n < 1/3$

Taking logarithms: $n > log(1\/3) / log(0.8) = log(3) / log(1.25) approx 1.099/0.223 approx 4.9$

So $n >= 5$ operations.

Check: $60 times (0.8)^5 = 60 times 0.32768 approx 19.66% < 20%$ ✓

#highlight-box[
  *Answer:* 5 operations are needed.
]

#pagebreak()

== Section D Solutions: Age Problems

=== Solution D1: Multiple Time References

*Question 1:* System of equations:

Let $M$ = Maria's current age, $E$ = Elena's current age.
- Currently: $M = 4E$
- In 16 years: $M + 16 = 2(E + 16)$

*Question 2:* Solving:

From equation 2: $M + 16 = 2E + 32$, so $M = 2E + 16$
Substituting into equation 1: $4E = 2E + 16$
$2E = 16$
$E = 8$, $M = 32$

#highlight-box[
  *Answer:* Maria is 32 years old; Elena is 8 years old.
]

*Question 3:* When was Maria 7 times Elena's age?

$32 - x = 7(8 - x)$
$32 - x = 56 - 7x$
$6x = 24$
$x = 4$ years ago

#highlight-box[
  *Answer:* 4 years ago (when Maria was 28 and Elena was 4).
]

*Question 4:* When will sum exceed 100?

$(32 + y) + (8 + y) > 100$
$40 + 2y > 100$
$y > 30$

The sum first exceeds 100 after 31 years (when sum = 102).

#highlight-box[
  *Answer:* In 31 years, the sum of their ages will first exceed 100.
]

#pagebreak()

=== Solution D2: Age Ratios

*Question 1:* Expressing ages:

Let ages be $k$, $2k$, and $4k$ (ratio 1:2:4).

*Question 2:* Solving:

$k^2 + (2k)^2 + (4k)^2 = 336$
$k^2 + 4k^2 + 16k^2 = 336$
$21k^2 = 336$
$k^2 = 16$
$k = 4$

Ages: 4, 8, 16 years.

#highlight-box[
  *Answer:* The siblings are 4, 8, and 16 years old.
]

*Question 3:* When will ratio be 2:3:5?

$(4+y) : (8+y) : (16+y) = 2 : 3 : 5$

From first two terms: $(4+y)/2 = (8+y)/3$
$3(4+y) = 2(8+y)$
$12 + 3y = 16 + 2y$
$y = 4$

Check third term: $(16+4)/5 = 20/5 = 4$ ✓
And $(8+4)/3 = 12/3 = 4$ ✓

#highlight-box[
  *Answer:* In 4 years, their ages (8, 12, 20) will be in ratio 2:3:5.
]

*Question 4:* Can ratio be 3:4:5?

$(4+y) : (8+y) : (16+y) = 3 : 4 : 5$

From first two: $(4+y)/3 = (8+y)/4$
$4(4+y) = 3(8+y)$
$16 + 4y = 24 + 3y$
$y = 8$

Check: Ages would be 12, 16, 24.
Ratio: 12:16:24 = 3:4:6 (not 3:4:5!)

The third term doesn't match because $24/5 = 4.8 <= 4$.

#highlight-box[
  *Answer:* No. The ratio 3:4:5 is impossible (when the first two match 3:4, the third gives 3:4:6).
]

#pagebreak()

=== Solution D3: Past and Future Conditions

*Question 1:* Setting up equations:

Let $F$ = father's current age, $S$ = son's current age.
- Five years ago: $F - 5 = 7(S - 5)$
- Five years from now: $F + 5 = 3(S + 5)$

*Question 2:* Solving:

From equation 1: $F = 7S - 35 + 5 = 7S - 30$
From equation 2: $F = 3S + 15 - 5 = 3S + 10$

Setting equal: $7S - 30 = 3S + 10$
$4S = 40$
$S = 10$, $F = 40$

#highlight-box[
  *Answer:* The father is 40 years old; the son is 10 years old.
]

*Question 3:* When was father 5 times son's age?

$40 - x = 5(10 - x)$
$40 - x = 50 - 5x$
$4x = 10$
$x = 2.5$ years ago

Father was 37.5, son was 7.5.

#highlight-box[
  *Answer:* 2.5 years ago, when the father was 37.5 and son was 7.5 years old.
]

*Question 4:* Could father ever be 10 times son's age?

$40 - x = 10(10 - x)$
$40 - x = 100 - 10x$
$9x = 60$
$x = 20/3 approx 6.67$ years ago

Check: Son's age then: $10 - 20/3 = 10/3 approx 3.33$ years old (positive, so valid!)
Father's age: $40 - 20/3 = 100/3 approx 33.33$ years old

Verification: $33.33 = 10 times 3.33$ ✓

The statement in the problem is incorrect! The father WAS 10 times the son's age.

#highlight-box[
  *Answer:* Actually, the father WAS 10 times the son's age, approximately 6.67 years ago (when son was 3.33 and father was 33.33 years old).
]

#pagebreak()

=== Solution D4: Combined Age Conditions

*Question 1:* Three equations:

Let $G$ = grandfather, $F$ = father, $S$ = son.
- Sum: $G + F + S = 120$
- Ratio: $G = 2F$
- Past condition: $G - 10 = 3(F - 10)$

*Question 2:* Solving:

From equation 3: $G - 10 = 3F - 30$, so $G = 3F - 20$
From equation 2: $G = 2F$

Setting equal: $2F = 3F - 20$
$F = 20$

Wait, this gives $G = 40$, but then $G - 10 = 30$ and $3(F - 10) = 3(10) = 30$ ✓

From equation 1: $40 + 20 + S = 120$, so $S = 60$

But $S = 60 > F = 20$? A son older than father is impossible!

Let me recheck... The problem may have an inconsistency, or we interpret it differently.

Actually, with $G = 40$, $F = 20$, a 20-year-old father with a 60-year-old son is indeed impossible.

The problem as stated has no realistic solution.

#highlight-box[
  *Answer:* The given conditions are inconsistent (they imply $G = 40$, $F = 20$, $S = 60$, where the son is older than the father). The problem has no valid real-world solution.
]

*Questions 3 and 4:* Cannot be answered due to inconsistent premises.

