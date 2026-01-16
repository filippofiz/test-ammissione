#import "/templates/uptoten-template.typ": *

#show: uptoten-doc.with(
  title: "GMAT Quantitative Reasoning",
  subtitle: "Statistics & Probability",
  level: "Hard / Very Hard Problem Modeling",
  intro: "Challenging exercises focused on modeling complex statistics and probability problems. These problems require deep understanding of statistical measures, counting principles, and probability theory. Work through the questions first, then check the detailed solutions.",
  logo: "/Logo.png"
)

#outline(title: "Table of Contents", indent: auto, depth: 2)

#pagebreak()

= Part I: Exercises

Work through each problem carefully. Focus on setting up the problem correctly before attempting to solve it. These problems are designed to challenge your problem-modeling skills at a high level.

#warning-box[
  *Difficulty Level:* Hard to Very Hard

  These problems require:
  - Deep understanding of statistical measures and their properties
  - Creative application of counting principles
  - Multi-step probability reasoning
  - Integration of multiple concepts within single problems
]

#pagebreak()

== Section A: Advanced Mean and Weighted Average Problems

=== Exercise A1: Mean Manipulation

A set of 10 numbers has a mean of 15. A new number is added to the set, and the mean increases to 16.

*Questions:*
+ What is the value of the new number?
+ If instead two numbers are added and the mean becomes 17, and one of the added numbers is 25, what is the other added number?
+ The original 10 numbers are all positive integers. If the median of the original set is 14, what is the maximum possible value of the largest number in the set?
+ Prove that if all 10 original numbers are distinct positive integers with median 14, the maximum value of any single number is 69.

#v(4cm)

=== Exercise A2: Weighted Average Constraints

In a class, 40% of students scored an average of 70 on an exam, and the remaining 60% scored an average of 85.

*Questions:*
+ Calculate the overall class average.
+ If the class has 50 students, and all scores are integers between 0 and 100, what is the minimum number of students who scored exactly 100?
+ A new student joins the class and scores 92. What is the new class average?
+ If the teacher decides to add 5 bonus points to every student's score (capped at 100), what is the new class average? Assume no original score exceeded 95.

#v(4cm)

=== Exercise A3: Mean of Combined Sets

Set A has 5 elements with mean 20. Set B has 8 elements with mean 35.

*Questions:*
+ What is the mean of the combined set $A union B$?
+ One element is removed from Set A and added to Set B. The mean of the new Set A is 18. What was the removed element, and what is the new mean of Set B?
+ If all elements of Set A are increased by 10 and all elements of Set B are decreased by 5, what is the mean of the new combined set?
+ The standard deviation of Set A is 4. After adding 10 to each element, what is the new standard deviation?

#v(4cm)

#pagebreak()

=== Exercise A4: Mean Reconstruction

The mean of $n$ consecutive integers is 24.

*Questions:*
+ If $n$ is odd, express the integers in terms of $n$ and find the smallest and largest.
+ If $n$ is even, explain why the mean must fall between two consecutive integers and determine what values are possible for the smallest integer.
+ Find all possible values of $n$ if all the consecutive integers are positive and their product is divisible by 10.
+ If $n = 7$, what is the sum of the squares of these integers?

#v(4cm)

== Section B: Median and Mode Analysis

=== Exercise B1: Median Properties

A set of 11 distinct positive integers has a median of 20.

*Questions:*
+ What is the minimum possible sum of all 11 integers?
+ What is the minimum possible mean of the set?
+ If the mean equals the median (both equal 20), what is the minimum possible range of the set?
+ If the largest number is 50 and the smallest is 5, and all integers are distinct, what is the maximum possible value of the second-largest integer?

#v(4cm)

=== Exercise B2: Changing the Median

A set contains the values: 12, 15, 18, 21, 24, 27, 30.

*Questions:*
+ What is the current median?
+ If a single value $x$ is added to the set, for what range of $x$ values does the median remain unchanged?
+ For what values of $x$ does the new median equal 20?
+ If instead one value is removed, which values can be removed without changing the median?

#v(4cm)

#pagebreak()

=== Exercise B3: Mode and Distribution

A dataset has exactly one mode, which is 25. The dataset contains 12 values, all positive integers.

*Questions:*
+ What is the minimum number of times 25 must appear in the dataset?
+ If 25 appears exactly 3 times and the mean is 22, what is the sum of the other 9 values?
+ If the median is also 25 and all values are between 10 and 40 inclusive, construct one possible dataset.
+ Prove that if the mode is unique and appears $k$ times, then $k >= 2$ and the dataset must have at least $2k - 1$ elements if all other values are distinct.

#v(4cm)

== Section C: Standard Deviation and Variance

=== Exercise C1: Standard Deviation Properties

A dataset has 5 values: 10, 12, 14, 16, 18.

*Questions:*
+ Calculate the mean and variance of this dataset.
+ Calculate the standard deviation.
+ If every value is multiplied by 3, what happens to the mean, variance, and standard deviation?
+ If 7 is added to every value, what happens to the mean, variance, and standard deviation?

#v(4cm)

=== Exercise C2: Comparing Distributions

Dataset X: {2, 4, 6, 8, 10}
Dataset Y: {4, 5, 6, 7, 8}

*Questions:*
+ Without calculating, which dataset has a larger standard deviation? Explain your reasoning.
+ Calculate the variance of each dataset to verify your answer.
+ If Dataset X is transformed by the function $f(x) = 2x - 3$, what is the new standard deviation?
+ Create a third dataset Z with 5 elements that has the same mean as X but a smaller standard deviation.

#v(4cm)

#pagebreak()

=== Exercise C3: Standard Deviation Constraints

A dataset of 6 numbers has a mean of 50 and a standard deviation of 10.

*Questions:*
+ What is the sum of all 6 numbers?
+ What is the sum of the squared deviations from the mean?
+ If five of the numbers are 40, 45, 50, 55, and 60, what is the sixth number? Verify that the standard deviation is indeed 10.
+ Is it possible for all 6 numbers to be distinct integers? If so, provide an example; if not, explain why.

#v(4cm)

== Section D: Counting Principles

=== Exercise D1: Advanced Permutations

*Questions:*
+ How many ways can 8 people be arranged in a row if two specific people must sit next to each other?
+ How many ways can 8 people be arranged in a row if two specific people must NOT sit next to each other?
+ How many ways can 8 people be seated around a circular table?
+ How many distinguishable arrangements are there of the letters in "MISSISSIPPI"?

#v(4cm)

=== Exercise D2: Combinations with Constraints

A committee of 5 people is to be formed from a group of 6 men and 4 women.

*Questions:*
+ How many different committees can be formed with no restrictions?
+ How many committees have exactly 3 men and 2 women?
+ How many committees have at least one woman?
+ How many committees have more men than women?

#v(4cm)

#pagebreak()

=== Exercise D3: Counting Paths and Arrangements

*Questions:*
+ On a grid, how many shortest paths are there from point (0,0) to point (5,3), moving only right or up?
+ How many of these paths pass through the point (2,1)?
+ In how many ways can 10 identical balls be distributed into 4 distinct boxes?
+ In how many ways can 10 distinct balls be distributed into 4 distinct boxes if each box must contain at least one ball?

#v(4cm)

=== Exercise D4: The Inclusion-Exclusion Principle

In a group of 100 students:
- 60 study Mathematics
- 50 study Physics
- 40 study Chemistry
- 30 study both Mathematics and Physics
- 25 study both Physics and Chemistry
- 20 study both Mathematics and Chemistry
- 10 study all three subjects

*Questions:*
+ How many students study at least one of the three subjects?
+ How many students study exactly one subject?
+ How many students study exactly two subjects?
+ How many students study none of the three subjects?

#v(4cm)

#pagebreak()

== Section E: Probability

=== Exercise E1: Basic and Conditional Probability

A bag contains 5 red balls, 4 blue balls, and 3 green balls. Two balls are drawn without replacement.

*Questions:*
+ What is the probability that both balls are red?
+ What is the probability that the balls are of different colors?
+ Given that the first ball drawn is red, what is the probability that the second ball is blue?
+ What is the probability that at least one ball is green?

#v(4cm)

=== Exercise E2: Independent Events

A fair coin is flipped 5 times.

*Questions:*
+ What is the probability of getting exactly 3 heads?
+ What is the probability of getting at least 3 heads?
+ What is the probability that the first head appears on the third flip?
+ What is the probability of getting more heads than tails?

#v(4cm)

=== Exercise E3: The Complement Rule

Three students independently attempt to solve a problem. Their individual probabilities of success are 0.6, 0.7, and 0.8.

*Questions:*
+ What is the probability that all three solve the problem?
+ What is the probability that none of them solve the problem?
+ What is the probability that at least one solves the problem?
+ What is the probability that exactly two of them solve the problem?

#v(4cm)

#pagebreak()

=== Exercise E4: Geometric and Conditional Probability

A fair die is rolled repeatedly until a 6 appears.

*Questions:*
+ What is the probability that the first 6 appears on the third roll?
+ What is the probability that it takes more than 3 rolls to get a 6?
+ Given that the first two rolls were not 6s, what is the probability that the third roll is a 6?
+ What is the expected number of rolls needed to get a 6?

#v(4cm)

=== Exercise E5: Probability with Constraints

A password consists of 4 characters. Each character can be a digit (0-9) or a letter (A-Z, case-insensitive, 26 letters).

*Questions:*
+ How many possible passwords are there?
+ What is the probability that a randomly generated password contains no digits?
+ What is the probability that a randomly generated password has all distinct characters?
+ What is the probability that a randomly generated password contains at least one digit and at least one letter?

#v(4cm)

#pagebreak()

== Section F: Expected Value and Advanced Probability

=== Exercise F1: Expected Value Calculations

A game costs \$5 to play. You roll a fair die: if you roll a 6, you win \$20; if you roll an even number (2 or 4), you win \$10; otherwise, you win nothing.

*Questions:*
+ What is the expected payout (before subtracting the cost)?
+ What is the expected net gain or loss per game?
+ How much should the game cost to be fair (expected net gain = 0)?
+ If you play 100 games, what is your expected total profit or loss?

#v(4cm)

=== Exercise F2: Conditional Expected Value

A box contains 3 red balls worth \$10 each, 5 blue balls worth \$5 each, and 2 gold balls worth \$50 each. You draw one ball at random.

*Questions:*
+ What is the expected value of a single draw?
+ If you draw a ball and it's not gold, what is the expected value of drawing a second ball (without replacement)?
+ If you can draw two balls (without replacement), what is the expected total value?
+ You are offered \$15 to not play. Should you take the offer or draw one ball? Explain.

#v(4cm)

=== Exercise F3: Probability Distribution Analysis

A random variable X takes values 1, 2, 3, 4, 5 with probabilities 0.1, 0.2, 0.3, 0.25, 0.15 respectively.

*Questions:*
+ Verify that this is a valid probability distribution.
+ Calculate E(X), the expected value.
+ Calculate E(X²).
+ Calculate Var(X) = E(X²) - [E(X)]² and the standard deviation.

#v(4cm)

#pagebreak()

= Part II: Solutions

== Section A Solutions: Advanced Mean and Weighted Average Problems

=== Solution A1: Mean Manipulation

*Question 1:* Finding the new number:

Original sum = $10 times 15 = 150$
New sum with 11 numbers = $11 times 16 = 176$
New number = $176 - 150 = 26$

#highlight-box[
  *Answer:* The new number is 26.
]

*Question 2:* Two numbers added, mean becomes 17:

New sum with 12 numbers = $12 times 17 = 204$
Sum of two added numbers = $204 - 150 = 54$
If one number is 25, the other is $54 - 25 = 29$

#highlight-box[
  *Answer:* The other added number is 29.
]

*Question 3:* Maximum largest number with median 14:

For a set of 10 numbers, the median is the average of the 5th and 6th values when sorted.
For median = 14, we need $(x_5 + x_6)/2 = 14$.

To maximize the largest number, we minimize all other numbers:
- Positions 1-5: Use smallest possible values: 1, 2, 3, 4, 14 (5th value must be ≤ 14)
- Position 6: Must satisfy $(14 + x_6)/2 = 14$, so $x_6 = 14$
- Positions 7-9: Use 15, 16, 17

Sum of positions 1-9: $1 + 2 + 3 + 4 + 14 + 14 + 15 + 16 + 17 = 86$
Sum must equal 150, so largest = $150 - 86 = 64$

Wait, let me reconsider. For median exactly 14, we can have $x_5 = x_6 = 14$.
Positions 1-4: 1, 2, 3, 4 (sum = 10)
Positions 5-6: 14, 14 (sum = 28)
Positions 7-9: 15, 16, 17 (sum = 48)
Position 10: $150 - 10 - 28 - 48 = 64$

#highlight-box[
  *Answer:* The maximum largest number is 64.
]

*Question 4:* With all 10 distinct:

If all values must be distinct, then $x_5 < 14 < x_6$ or $x_5 = 13, x_6 = 15$ for median 14.
Minimum values for positions 1-5: 1, 2, 3, 4, 13 (sum = 23)
Minimum for position 6: 15
Minimum for positions 7-9: 16, 17, 18 (sum = 51)
Total minimum: $23 + 15 + 51 = 89$
Maximum for position 10: $150 - 89 = 61$

Actually we can do better by adjusting: $x_5 = 14, x_6 = 14$ isn't allowed.
If $x_5 = 13, x_6 = 15$: median = $(13+15)/2 = 14$ ✓

#highlight-box[
  *Answer:* With distinct integers and median 14, the maximum largest value is 61.
]

#pagebreak()

=== Solution A2: Weighted Average Constraints

*Question 1:* Overall class average:

$ "Average" = 0.40 times 70 + 0.60 times 85 = 28 + 51 = 79 $

#highlight-box[
  *Answer:* The class average is 79.
]

*Question 2:* Minimum students scoring 100:

40% of 50 = 20 students averaged 70, sum $= 20 times 70 = 1400$
60% of 50 = 30 students averaged 85, sum $= 30 times 85 = 2550$
Total sum $= 3950$

For the 30 students averaging 85: if 29 score 84 and 1 scores $85 times 30 - 29 times 84 = 2550 - 2436 = 114$...
But scores cap at 100, so this approach needs refinement.

Maximum sum for 30 students if none score 100: $30 times 99 = 2970 > 2550$, so it is possible for none to score 100.

Thus, the minimum number scoring exactly 100 is 0.

#highlight-box[
  *Answer:* The minimum number of students scoring exactly 100 is 0.
]

*Question 3:* New student scores 92:

Original sum $= 3950$, original count $= 50$
New sum $= 3950 + 92 = 4042$
New count $= 51$
New average $= 4042 / 51 approx 79.25$

#highlight-box[
  *Answer:* The new class average is approximately 79.25.
]

*Question 4:* Adding 5 bonus points (no score exceeded 95):

Since no score exceeds 95, adding 5 points doesn't hit the cap of 100 for any student.
Each score increases by 5, so the mean increases by 5.
New average = $79 + 5 = 84$

#highlight-box[
  *Answer:* The new class average is 84.
]

#pagebreak()

=== Solution A3: Mean of Combined Sets

*Question 1:* Combined mean:

Sum of A $= 5 times 20 = 100$
Sum of B $= 8 times 35 = 280$
Combined sum $= 380$
Combined count $= 13$
Combined mean $= 380 / 13 approx 29.23$

#highlight-box[
  *Answer:* The mean of the combined set is $380/13 approx 29.23$.
]

*Question 2:* Element moved from A to B:

New Set A has 4 elements with mean 18, so new sum $= 72$.
Removed element $= 100 - 72 = 28$

New Set B has 9 elements with sum $= 280 + 28 = 308$
New mean of B $= 308/9 approx 34.22$

#highlight-box[
  *Answer:* The removed element is 28. The new mean of Set B is $308/9 approx 34.22$.
]

*Question 3:* Transformed sets:

New sum of A $= 100 + 5 times 10 = 150$
New sum of B $= 280 - 8 times 5 = 240$
New combined sum $= 390$
New combined mean $= 390/13 = 30$

#highlight-box[
  *Answer:* The new combined mean is 30.
]

*Question 4:* Standard deviation after adding constant:

Adding a constant to every value shifts the entire distribution but does not change the spread. The standard deviation remains unchanged.

#highlight-box[
  *Answer:* The standard deviation remains 4.
]

#pagebreak()

== Section B Solutions: Median and Mode Analysis

=== Solution B1: Median Properties

*Question 1:* Minimum sum:

For median = 20 in a set of 11 distinct positive integers, the 6th value (when sorted) is 20.
To minimize sum:
- Positions 1-5: 1, 2, 3, 4, 5 (smallest distinct positive integers < 20)

Wait, they must be less than 20 and distinct. Minimum: 1, 2, 3, 4, 5.
- Position 6: 20
- Positions 7-11: 21, 22, 23, 24, 25 (smallest distinct integers > 20)

Sum = $(1+2+3+4+5) + 20 + (21+22+23+24+25) = 15 + 20 + 115 = 150$

#highlight-box[
  *Answer:* The minimum possible sum is 150.
]

*Question 2:* Minimum mean:

Minimum sum is 150, so minimum mean = $150/11 approx 13.64$

#highlight-box[
  *Answer:* The minimum possible mean is $150/11 approx 13.64$.
]

*Question 3:* Minimum range when mean = median = 20:

Sum = $11 times 20 = 220$

To minimize range with distinct integers and median 20:
We want values as close to 20 as possible.
Try: 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
Sum = $15 + 16 + 17 + 18 + 19 + 20 + 21 + 22 + 23 + 24 + 25 = 220$ ✓

Range $= 25 - 15 = 10$

#highlight-box[
  *Answer:* The minimum possible range is 10.
]

*Question 4:* Maximum second-largest with largest = 50, smallest = 5:

Median = 20, so 6th value = 20.
To maximize the second-largest (position 10):
- Position 1: 5 (given)
- Positions 2-5: 6, 7, 8, 9 (minimize)
- Position 6: 20
- Positions 7-10: maximize 10th while keeping distinct
- Position 11: 50 (given)

Positions 7-9: 21, 22, 23 (minimum values > 20)
Sum so far: $5 + 6 + 7 + 8 + 9 + 20 + 21 + 22 + 23 + 50 = 171$
But we need mean = 20, sum = 220.

Hmm, the problem doesn't specify mean = 20. Let me reread.

The problem only specifies median = 20. So we can have any sum.
To maximize position 10: use minimum for 2-5, 7-9.
Position 10 can be any value from 24 to 49 (must be > 23 and < 50).

#highlight-box[
  *Answer:* The maximum second-largest integer is 49.
]

#pagebreak()

=== Solution B2: Changing the Median

Set: {12, 15, 18, 21, 24, 27, 30} (7 values, sorted)

*Question 1:* Current median:

With 7 values, median = 4th value = 21.

#highlight-box[
  *Answer:* The current median is 21.
]

*Question 2:* Range of $x$ for unchanged median:

With 8 values, median = average of 4th and 5th values.
Current 4th = 21, current 5th = 24.

If $x <= 21$: new sorted positions shift. 4th and 5th become 18 and 21, or 21 and 21, etc.
If $x >= 24$: 4th and 5th become 21 and 24.

For median = 21: need $(x_4 + x_5)/2 = 21$, so $x_4 + x_5 = 42$.

If $18 <= x <= 21$: sorted is ..., 18, x, 21, 24, ... The 4th and 5th are 21 and 24. Median = 22.5.
If $x = 21$: sorted is 12, 15, 18, 21, 21, 24, 27, 30. Median = $(21+21)/2 = 21$. ✓

For $21 <= x <= 24$: 4th = 21, 5th = x or 24.
If $x = 21$: median = 21.
If $21 < x < 24$: median = $(21 + x)/2$ which is between 21 and 22.5.
If $x = 24$: median = $(21+24)/2 = 22.5$.

So only $x = 21$ keeps median at exactly 21.

#highlight-box[
  *Answer:* Only $x = 21$ keeps the median unchanged at 21.
]

*Question 3:* $x$ for median = 20:

Need $(x_4 + x_5)/2 = 20$, so $x_4 + x_5 = 40$.

If $x < 18$: sorted is x, 12, 15, 18, 21, 24, 27, 30. 4th & 5th = 18, 21. Sum = 39 ≠ 40.
If $x = 19$: sorted is 12, 15, 18, 19, 21, 24, 27, 30. 4th & 5th = 19, 21. Sum = 40. ✓

#highlight-box[
  *Answer:* $x = 19$ gives median = 20.
]

*Question 4:* Which value can be removed without changing median:

Removing leaves 6 values. Median = average of 3rd and 4th.
Original: 12, 15, 18, 21, 24, 27, 30.
Current median = 21.

Remove 12: {15, 18, 21, 24, 27, 30}. Median = $(21+24)/2 = 22.5$. Changed.
Remove 15: {12, 18, 21, 24, 27, 30}. Median = $(21+24)/2 = 22.5$. Changed.
Remove 18: {12, 15, 21, 24, 27, 30}. Median = $(21+24)/2 = 22.5$. Changed.
Remove 21: {12, 15, 18, 24, 27, 30}. Median = $(18+24)/2 = 21$. ✓

#highlight-box[
  *Answer:* Only removing 21 keeps the median at 21.
]

#pagebreak()

== Section C Solutions: Standard Deviation and Variance

=== Solution C1: Standard Deviation Properties

Dataset: 10, 12, 14, 16, 18

*Question 1:* Mean and variance:

Mean = $(10 + 12 + 14 + 16 + 18)/5 = 70/5 = 14$

Deviations: $-4, -2, 0, 2, 4$
Squared deviations: $16, 4, 0, 4, 16$
Sum of squared deviations $= 40$
Variance $= 40/5 = 8$

#highlight-box[
  *Answer:* Mean = 14, Variance = 8.
]

*Question 2:* Standard deviation:

$sigma = sqrt(8) = 2sqrt(2) approx 2.83$

#highlight-box[
  *Answer:* Standard deviation $approx 2.83$.
]

*Question 3:* Multiplying by 3:

New values: 30, 36, 42, 48, 54
New mean = $14 times 3 = 42$
New variance = $8 times 3^2 = 72$
New standard deviation = $2sqrt(2) times 3 = 6sqrt(2) approx 8.49$

#highlight-box[
  *Answer:* Mean is multiplied by 3 (becomes 42). Variance is multiplied by 9 (becomes 72). Standard deviation is multiplied by 3 (becomes $approx 8.49$).
]

*Question 4:* Adding 7 to each value:

New values: 17, 19, 21, 23, 25
New mean = $14 + 7 = 21$
Variance and standard deviation are unchanged (adding a constant shifts all values equally).

#highlight-box[
  *Answer:* Mean increases by 7 (becomes 21). Variance and standard deviation remain unchanged.
]

#pagebreak()

== Section D Solutions: Counting Principles

=== Solution D1: Advanced Permutations

*Question 1:* 8 people, two must sit together:

Treat the two people as a single unit. We now have 7 "units" to arrange: $7!$ ways.
The two people within their unit can be arranged in $2!$ ways.
Total $= 7! times 2 = 5040 times 2 = 10080$

#highlight-box[
  *Answer:* 10,080 arrangements.
]

*Question 2:* Two must NOT sit together:

Total arrangements $= 8! = 40320$
Arrangements where they sit together $= 10080$ (from Q1)
Arrangements where they do not sit together $= 40320 - 10080 = 30240$

#highlight-box[
  *Answer:* 30,240 arrangements.
]

*Question 3:* Circular arrangement of 8 people:

In circular arrangements, we fix one person's position to avoid counting rotations.
Number of arrangements $= (8-1)! = 7! = 5040$

#highlight-box[
  *Answer:* 5,040 arrangements.
]

*Question 4:* Arrangements of "MISSISSIPPI":

Letters: M(1), I(4), S(4), P(2). Total $= 11$ letters.
Arrangements $= frac(11!, 1! times 4! times 4! times 2!) = frac(39916800, 1 times 24 times 24 times 2) = frac(39916800, 1152) = 34650$

#highlight-box[
  *Answer:* 34,650 distinguishable arrangements.
]

#pagebreak()

=== Solution D2: Combinations with Constraints

Committee of 5 from 6 men and 4 women.

*Question 1:* No restrictions:

$binom(10, 5) = frac(10!, 5! times 5!) = 252$

#highlight-box[
  *Answer:* 252 committees.
]

*Question 2:* Exactly 3 men and 2 women:

$binom(6, 3) times binom(4, 2) = 20 times 6 = 120$

#highlight-box[
  *Answer:* 120 committees.
]

*Question 3:* At least one woman:

Total $-$ (no women) $= 252 - binom(6, 5) = 252 - 6 = 246$

#highlight-box[
  *Answer:* 246 committees.
]

*Question 4:* More men than women:

Possible compositions: (5M, 0W), (4M, 1W), (3M, 2W)

$binom(6,5)binom(4,0) + binom(6,4)binom(4,1) + binom(6,3)binom(4,2)$
$= 6 times 1 + 15 times 4 + 20 times 6$
$= 6 + 60 + 120 = 186$

#highlight-box[
  *Answer:* 186 committees.
]

#pagebreak()

=== Solution D4: The Inclusion-Exclusion Principle

Let M = Math, P = Physics, C = Chemistry.

*Question 1:* At least one subject:

$|M union P union C| = |M| + |P| + |C| - |M inter P| - |P inter C| - |M inter C| + |M inter P inter C|$
$= 60 + 50 + 40 - 30 - 25 - 20 + 10 = 85$

#highlight-box[
  *Answer:* 85 students study at least one subject.
]

*Question 2:* Exactly one subject:

Only M = $|M| - |M inter P| - |M inter C| + |M inter P inter C| = 60 - 30 - 20 + 10 = 20$
Only P = $|P| - |M inter P| - |P inter C| + |M inter P inter C| = 50 - 30 - 25 + 10 = 5$
Only C = $|C| - |M inter C| - |P inter C| + |M inter P inter C| = 40 - 20 - 25 + 10 = 5$

Total $= 20 + 5 + 5 = 30$

#highlight-box[
  *Answer:* 30 students study exactly one subject.
]

*Question 3:* Exactly two subjects:

M and P only = $|M inter P| - |M inter P inter C| = 30 - 10 = 20$
P and C only = $|P inter C| - |M inter P inter C| = 25 - 10 = 15$
M and C only = $|M inter C| - |M inter P inter C| = 20 - 10 = 10$

Total $= 20 + 15 + 10 = 45$

#highlight-box[
  *Answer:* 45 students study exactly two subjects.
]

*Question 4:* None of the three:

$100 - 85 = 15$

#highlight-box[
  *Answer:* 15 students study none of the three subjects.
]

#pagebreak()

== Section E Solutions: Probability

=== Solution E1: Basic and Conditional Probability

Bag: 5 red, 4 blue, 3 green (12 total).

*Question 1:* Both red:

$P("both red") = frac(5, 12) times frac(4, 11) = frac(20, 132) = frac(5, 33)$

#highlight-box[
  *Answer:* $5/33 approx 0.152$.
]

*Question 2:* Different colors:

$P("same color") = frac(5 times 4 + 4 times 3 + 3 times 2, 12 times 11) = frac(20 + 12 + 6, 132) = frac(38, 132) = frac(19, 66)$

$P("different") = 1 - frac(19, 66) = frac(47, 66)$

#highlight-box[
  *Answer:* $47/66 approx 0.712$.
]

*Question 3:* Second is blue given first is red:

$P("2nd blue" | "1st red") = frac(4, 11)$

#highlight-box[
  *Answer:* $4/11 approx 0.364$.
]

*Question 4:* At least one green:

$P("no green") = frac(9, 12) times frac(8, 11) = frac(72, 132) = frac(6, 11)$

$P("at least one green") = 1 - frac(6, 11) = frac(5, 11)$

#highlight-box[
  *Answer:* $5/11 approx 0.455$.
]

#pagebreak()

=== Solution E2: Independent Events

5 fair coin flips.

*Question 1:* Exactly 3 heads:

$P = binom(5,3) times (1/2)^5 = 10 times 1/32 = 10/32 = 5/16$

#highlight-box[
  *Answer:* $5/16 = 0.3125$.
]

*Question 2:* At least 3 heads:

$P = binom(5,3)/32 + binom(5,4)/32 + binom(5,5)/32 = (10 + 5 + 1)/32 = 16/32 = 1/2$

#highlight-box[
  *Answer:* $1/2 = 0.5$.
]

*Question 3:* First head on third flip:

Need: T, T, H
$P = (1/2)(1/2)(1/2) = 1/8$

#highlight-box[
  *Answer:* $1/8 = 0.125$.
]

*Question 4:* More heads than tails:

Need 3, 4, or 5 heads (same as "at least 3 heads").

#highlight-box[
  *Answer:* $1/2 = 0.5$.
]

#pagebreak()

=== Solution E3: The Complement Rule

Success probabilities: 0.6, 0.7, 0.8.

*Question 1:* All three succeed:

$P = 0.6 times 0.7 times 0.8 = 0.336$

#highlight-box[
  *Answer:* 0.336.
]

*Question 2:* None succeed:

$P = 0.4 times 0.3 times 0.2 = 0.024$

#highlight-box[
  *Answer:* 0.024.
]

*Question 3:* At least one succeeds:

$P = 1 - 0.024 = 0.976$

#highlight-box[
  *Answer:* 0.976.
]

*Question 4:* Exactly two succeed:

Three cases:
- 1 & 2 succeed, 3 fails: $0.6 times 0.7 times 0.2 = 0.084$
- 1 & 3 succeed, 2 fails: $0.6 times 0.3 times 0.8 = 0.144$
- 2 & 3 succeed, 1 fails: $0.4 times 0.7 times 0.8 = 0.224$

Total = $0.084 + 0.144 + 0.224 = 0.452$

#highlight-box[
  *Answer:* 0.452.
]

#pagebreak()

== Section F Solutions: Expected Value

=== Solution F1: Expected Value Calculations

Game: costs \$5. Roll 6: win \$20. Roll 2 or 4: win \$10. Otherwise: \$0.

*Question 1:* Expected payout:

$E = (1/6)(20) + (2/6)(10) + (3/6)(0) = 20/6 + 20/6 = 40/6 = 20/3 approx 6.67$

#highlight-box[
  *Answer:* Expected payout is $\$20/3 approx \$6.67$.
]

*Question 2:* Expected net gain:

$E = 20/3 - 5 = 20/3 - 15/3 = 5/3 approx 1.67$

#highlight-box[
  *Answer:* Expected net gain is $\$5/3 approx \$1.67$ per game.
]

*Question 3:* Fair game cost:

Fair means expected net gain = 0, so cost = expected payout = $\$20/3 approx \$6.67$.

#highlight-box[
  *Answer:* The game should cost $\$20/3 approx \$6.67$ to be fair.
]

*Question 4:* 100 games:

Expected profit = $100 times 5/3 = 500/3 approx \$166.67$

#highlight-box[
  *Answer:* Expected profit from 100 games is approximately \$166.67.
]

