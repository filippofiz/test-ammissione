// AI Question Generator for GMAT Data Insights
// Uses Claude API to automatically generate questions

class AIQuestionGenerator {
  constructor() {
    // Don't access config here - it might not be loaded yet
    // Access it when actually needed (lazy loading)
  }

  // Main generation function
  async generateQuestion(questionType, difficulty = 'medium', statusCallback = null) {
    // Check config at generation time (not in constructor)
    if (!window.AI_CONFIG?.USE_EDGE_FUNCTION) {
      throw new Error('Config not loaded. Please refresh the page.');
    }

    const prompt = await this.buildPrompt(questionType, difficulty);

    try {
      const response = await this.callClaudeAPI(prompt, 0, 3, statusCallback);
      const questionData = this.parseResponse(response, questionType);
      return questionData;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }

  // Generate question with custom user instructions
  async generateQuestionWithInstructions(questionType, difficulty, userInstructions, currentQuestionData) {
    // Check config at generation time
    if (!window.AI_CONFIG?.USE_EDGE_FUNCTION) {
      throw new Error('Config not loaded. Please refresh the page.');
    }

    // Build base prompt
    const basePrompt = await this.buildPrompt(questionType, difficulty);

    // Add custom instructions section
    const customPrompt = `${basePrompt}

═══════════════════════════════════════════════════════════
🎯 CUSTOM INSTRUCTIONS FROM USER
═══════════════════════════════════════════════════════════

The user reviewed the previous question and provided the following feedback/instructions:

"${userInstructions}"

**CURRENT QUESTION THAT NEEDS IMPROVEMENT:**
\`\`\`json
${JSON.stringify(currentQuestionData, null, 2)}
\`\`\`

**YOUR TASK:**
1. Analyze the user's feedback carefully
2. Identify what specific issue they're pointing out
3. Generate a NEW question that addresses their concerns
4. Keep the same difficulty level (${difficulty}) and question type (${this.getTypeName(questionType)})
5. Make sure the new question is DIFFERENT from the current one (don't just fix minor details)

**EXAMPLES OF HOW TO INTERPRET FEEDBACK:**
- "Answer is too obvious" → Make the reasoning more complex, add distractors
- "Calculation error" → Check all math, ensure numbers work correctly
- "Make it harder" → Use more complex scenarios, multi-step reasoning
- "Too wordy" → Be more concise while maintaining clarity
- "Unrealistic data" → Use realistic business/analytical scenarios with proper numbers

Generate a completely new question following all format specifications above.`;

    try {
      const response = await this.callClaudeAPI(customPrompt);
      const questionData = this.parseResponse(response, questionType);
      return questionData;
    } catch (error) {
      console.error('AI Generation Error with custom instructions:', error);
      throw error;
    }
  }

  // Build detailed prompt for each question type with few-shot examples
  async buildPrompt(questionType, difficulty) {
    // Get approved examples for few-shot learning
    const examples = await window.AIReviewSystem?.getApprovedExamples(questionType, difficulty, 3) || [];
    const rejectionPatterns = await window.AIReviewSystem?.getRejectionPatterns(questionType) || [];

    const difficultyDescription =
      difficulty === 'hard' ? 'challenging (700+ level)' :
      difficulty === 'easy' ? 'easier (500-600 level)' :
      'medium difficulty (600-700 level)';

    const baseContext = `You are an expert GMAT test question writer specializing in Data Insights questions. Create a ${difficultyDescription} question that:

- Tests real business/analytical scenarios
- Uses realistic data and numbers
- Requires multi-step reasoning
- Follows official GMAT Data Insights format exactly
- Is grammatically perfect and professionally written`;

    // Add few-shot examples if available
    let examplesSection = '';
    if (examples.length > 0) {
      examplesSection = `\n\n**LEARN FROM THESE APPROVED HIGH-QUALITY EXAMPLES:**\n\n`;
      examples.forEach((ex, idx) => {
        const jsonData = ex.corrected_json || ex.generated_json;
        examplesSection += `Example ${idx + 1} (⭐ ${ex.rating}/5 rating):\n\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\`\n\n`;
      });
    }

    // Add common mistakes to avoid
    let avoidSection = '';
    if (rejectionPatterns.length > 0) {
      avoidSection = `\n**COMMON MISTAKES TO AVOID:**\n`;
      rejectionPatterns.slice(0, 5).forEach((reason, idx) => {
        avoidSection += `${idx + 1}. ${reason}\n`;
      });
      avoidSection += '\n';
    }

    const typePrompts = {
      DS: `${baseContext}${examplesSection}${avoidSection}

═══════════════════════════════════════════════════════════
📊 DATA SUFFICIENCY (DS) - COMPLETE SPECIFICATIONS
═══════════════════════════════════════════════════════════

**PROBLEM STATEMENT (40-100 words, optimal: 60-75):**
- Structure: Context setup (20-30 words) + Specific question (10-20 words)
- Allowed question types:
  ✓ "What is the value of X?"
  ✓ "Is Y greater than Z?"
  ✓ "What is the ratio of A to B?"
  ✓ "How many [items] are there?"
- FORBIDDEN: "Can you determine", "Is it possible", "Do we have enough information"

**STATEMENT SPECIFICATIONS:**
- Statement (1): 15-40 words (optimal: 20-25)
- Statement (2): 15-40 words (optimal: 20-25)
- MUST be independent (Statement 2 cannot reference Statement 1)
- Cannot directly answer the question
- Use different approaches/angles to the problem
- If Statement 1 gives range, Statement 2 must use different constraint type

**NUMBER SPECIFICATIONS:**

**🚫 FORBIDDEN NUMBERS (NEVER USE THESE):**
- Round numbers: 10, 20, 25, 50, 100, 200, 500, 1000
- Even hundreds: 200, 300, 400, 600, 800
- Round percentages: 10%, 20%, 25%, 50%, 75%, 100%
- Round money: $100, $500, $1,000, $5,000, $10,000

**✅ REQUIRED NUMBERS (ALWAYS USE THESE):**
- Employee counts: 12, 18, 23, 27, 34, 48, 67, 73, 87, 156, 234
- Project/task counts: 126, 156, 234, 387, 456, 512, 678, 789, 923
- Team sizes: 12, 15, 18, 21, 24, 27, 36, 42, 48, 54, 63, 72

**💰 REQUIRED DECIMAL FORMATS:**
- Money: ALWAYS include cents ($76,320.50 not $76,320)
  * Examples: $2,345.60, $47,890.75, $156,234.80, $1,485,000.00
  * Even amounts MUST show .00 (e.g., $2,055,000.00 not $2,055,000)
- Percentages: ONE decimal place (23.4% not 23% or 23.45%)
  * Examples: 13.7%, 17.2%, 23.8%, 28.4%, 32.6%, 37.9%, 42.3%
  * Exception: Exact values like 33.3% (for 1/3) are acceptable
- Hourly rates: Always include cents ($87.50 not $87)
  * Examples: $47.25, $73.50, $95.75, $134.00, $165.80

**CRITICAL MATHEMATICAL VALIDATION RULES:**

1. **Percentage Increase Rule:**
   - When using "X% more than," ensure the calculation yields whole numbers
   - Example: "50% more" (multiply by 1.5) - only use if original is even number
   - Example: "100% more" (multiply by 2) - always safe
   - Safe percentages: 25% (×1.25), 50% (×1.5), 100% (×2), 200% (×3)
   - ❌ AVOID: 73%, 37%, 83%, 42% unless you've pre-verified the exact math
   - ✅ BETTER: Use absolute differences instead of percentages when possible

2. **Division Check Rule:**
   - Before creating the question, verify: Total ÷ Per-unit = Whole number
   - 234 ÷ 18 = 13 ✓ (Good)
   - 234 ÷ 1.73 = 135.26... ✗ (Bad - fractional result)
   - 156 ÷ 12 = 13 ✓ (Good)
   - 234 × 42% = 98.28... ✗ (Bad - fractional people)

3. **Statement 2 Independence Rule:**
   - Statement 2 must provide a COMPLETELY DIFFERENT path to the answer
   - Don't just restate Statement 1 in a complex way
   - Don't use percentages/ratios in Statement 2 if Statement 1 uses them
   - ✅ Good: Statement 1 uses subtraction, Statement 2 uses multiplication
   - ❌ Bad: Both statements use percentages of the same total

4. **Whole Number Verification:**
   - All intermediate calculations must yield whole numbers
   - If dividing people into groups, verify group sizes are whole numbers
   - If using rates (tasks per person), verify both rate and total are compatible
   - Example: 156 employees, 48 in Marketing → 156-48=108 remaining ✓
   - Example: 234 tasks, 42% high-priority → 234×0.42=98.28 ✗ (fractional tasks)

**MANDATORY VERIFICATION STEP (MUST DO BEFORE OUTPUTTING):**
After generating the question but BEFORE outputting JSON:
1. ✅ Solve using Statement 1 alone - record the answer (must be whole number)
2. ✅ Solve using Statement 2 alone - record the answer (must be whole number)
3. ✅ Verify both calculations produce whole numbers at EVERY step
4. ✅ Verify the answer choice (A/B/C/D/E) matches the sufficiency pattern
5. ✅ Verify total equals sum of parts
6. ❌ If ANY check fails, REGENERATE with different numbers immediately

**WORKING EXAMPLES:**

✅ **Good Example:**
Problem: "A software team completed 156 code updates in March. How many developers were on the team?"
Statement 1: "Each developer completed exactly 12 updates."
Statement 2: "The team had 7 senior developers who completed 84 updates total, and junior developers who completed the rest."
Math: (1) 156÷12=13 developers ✓  (2) 156-84=72, assume equal work, we need total count... actually this needs more info ✗

✅ **Actually Working Example:**
Problem: "A software team of 13 developers completed code updates in March. What was the total number of updates completed?"
Statement 1: "Each developer completed exactly 12 updates."
Statement 2: "The team completed 156 updates total in March."
Math: (1) 13×12=156 ✓  (2) Directly gives 156 ✓  Answer: D (each alone sufficient)

❌ **Bad Example:**
Problem: "TechCorp completed 234 tasks. How many developers worked on the project?"
Statement 1: "High-priority tasks were 42% of total, with 73.50 bonus each."
Math: 234×0.42=98.28 tasks ✗ FRACTIONAL TASKS - INVALID!

**SAFE NUMBER COMBINATIONS:**
- Use totals that divide evenly by common factors (2, 3, 4, 5, 6, 8, 10, 12)
- 156 = 12×13, 2×78, 3×52, 4×39, 6×26 (many factors, SAFE)
- 234 = 2×117, 3×78, 6×39, 9×26, 13×18 (many factors, SAFE)
- 157 = prime number (limited factors, RISKY unless using ×1 or ×157)

**PRE-GENERATION CHECKLIST:**
Before outputting JSON, verify:
☐ All divisions yield whole numbers
☐ All percentage calculations yield whole numbers
☐ Both statements independently lead to valid answers
☐ No fractional people, items, tasks, or other discrete units
☐ Answer choice correctly reflects which statements are sufficient
☐ Math verified THREE TIMES by actually calculating

**WHAT A PROPER MEDIUM DS SHOULD LOOK LIKE:**

✅ **Perfect Medium Example:**

Problem (65 words):
"TechCorp's software development team completed projects worth $3.87 million in Q3 2023, with each developer contributing an average of $258,000 in project value. The team consists of senior developers earning $165,000 annually and junior developers earning $95,000 annually. If the total annual salary budget for the team is $1.74 million, how many junior developers are on the team?"

Statement 1 (23 words):
"The ratio of senior developers to junior developers is 3:2, and senior developers completed 60% of the total project value."

Statement 2 (19 words):
"There are 15 total developers on the team, and the average team salary is $116,000 per year."

Answer: C (Both together needed)

Math Verification:
- Statement 1 alone: Gives ratio 3:2 but not total count → INSUFFICIENT
- Statement 2 alone: Total = 15, avg salary = $116k → Can solve: 15×$116k=$1.74M ✓, but need to find juniors. If S+J=15 and 165S+95J=1740, solve: S=9, J=6 → SUFFICIENT (Answer should be B!)
- Wait, let me recalculate Statement 2: 165S + 95J = 1740 (in thousands), S+J=15, so 165S+95(15-S)=1740, 165S+1425-95S=1740, 70S=315, S=4.5 ✗ FRACTIONAL!
- This example has a math error - needs fixing before using!

**LENGTH ENFORCEMENT (STRICTLY REQUIRED):**
- Problem: MINIMUM 55 words, MAXIMUM 100 words
  * Must include: business context (15-25 words) + specific constraints (20-30 words) + clear question (10-20 words)
  * Add realistic details that matter for solving
- Statement 1: MINIMUM 18 words, MAXIMUM 40 words
  * Must add qualifying information, not just state one fact
  * Should include 2-3 pieces of related information
- Statement 2: MINIMUM 18 words, MAXIMUM 40 words
  * Must approach problem from DIFFERENT angle than Statement 1
  * Should provide alternative path to solution

**COMPLEXITY REQUIREMENTS FOR MEDIUM:**
Must require 2-3 step reasoning involving at least ONE of:
- ✅ Ratio/proportion PLUS another constraint (e.g., 3:2 ratio + total budget)
- ✅ Percentage of a subset (e.g., 60% of senior developers' output)
- ✅ Weighted averages (e.g., different salaries with team average)
- ✅ Multiple time periods (e.g., Q3 results + annual budget)
- ✅ Mix of different unit types (money + count + percentage)

**STATEMENT CONSTRUCTION RULES:**
- Statements must approach problem from DIFFERENT angles:
  * Statement 1: Ratio/percentage approach
  * Statement 2: Total/average approach
  OR
  * Statement 1: Subset information
  * Statement 2: Whole group information
- At least one statement should seem insufficient at first glance
- Include one "almost sufficient" statement (missing exactly one piece)
- For answer D (both sufficient): Each statement must independently provide enough info
- For answer C (both together): Neither alone works, but combined they create solvable system

**BANNED PATTERNS FOR MEDIUM (DO NOT USE THESE):**
❌ Simple division only (e.g., "156 total ÷ 12 per unit")
❌ Direct substitution with no reasoning
❌ Single-step percentage calculations
❌ Both statements giving same information in different words
❌ Statement that directly answers the question
❌ Trivial combinations (e.g., S1 gives X, S2 gives Y, answer = X+Y)

**🚨 AVOID THESE DS TRAPS (CRITICAL):**

**Trap 1: Redundant Statements**
❌ BAD: Both statements saying essentially the same thing
- Example: Statement 1: "The ratio of seniors to juniors is 3:2"
           Statement 2: "For every 3 senior employees, there are 2 junior employees"
- WHY BAD: These are identical information, just rephrased

**Trap 2: Statement 2 Just Rephrasing Statement 1**
❌ BAD: Statement 2 provides no new information
- Example: Statement 1: "Senior developers earn $165,000 annually"
           Statement 2: "The annual salary for each senior developer is $165,000"
- WHY BAD: Same data, no new angle or constraint

**Trap 3: Using Same Numbers in Both Statements**
❌ BAD: Both statements reference identical numerical values
- Example: Statement 1: "There are 15 total developers and ratio is 3:2"
           Statement 2: "The team has 15 people total"
- WHY BAD: Reuses "15" making statements feel redundant

**✅ CORRECT APPROACH:**
- Statement 1: Uses one set of constraints (ratio + salary difference)
- Statement 2: Uses completely different constraints (total payroll + average)
- Different numbers, different angles, different paths to solution
- Each statement independently sufficient OR neither alone sufficient (never redundant)

**REQUIRED PATTERNS FOR MEDIUM:**
✅ Multi-step reasoning (2-3 steps minimum)
✅ System of equations (for answer C)
✅ Conditional logic (if X, then Y, therefore Z)
✅ Subset/superset relationships
✅ Cross-verification between statements

═══════════════════════════════════════════════════════════
🎲 MANDATORY VARIETY REQUIREMENTS (AVOID REPETITION!)
═══════════════════════════════════════════════════════════

**COMPANY NAME POOL (randomly select one - DO NOT repeat same company consecutively):**
TechCorp, DataSoft, GlobalTech, FinanceHub, MarketPro, CloudNet,
InfoSys, PrimeLogic, NexGen Solutions, Vertex Industries, ApexData,
BlueSky Analytics, Quantum Dynamics, MegaCorp, FusionTech,
StellarWorks, Pinnacle Group, OmniCore, TrueNorth Consulting,
BrightPath Solutions, Synergy Systems, Alpha Dynamics, CoreLogic,
Meridian Tech, Horizon Partners, Catalyst Group, Summit Solutions,
Innovate Labs, Pioneer Systems, EagleView Corp

**SCENARIO ROTATION (must cycle through - track which you've used):**
1. **Technology:** developers, analysts, engineers, QA testers, DevOps specialists
2. **Consulting:** consultants, associates, partners, managers, strategists
3. **Manufacturing:** operators, supervisors, engineers, technicians, quality inspectors
4. **Healthcare:** nurses, doctors, technicians, administrators, pharmacists
5. **Finance:** traders, analysts, advisors, associates, portfolio managers
6. **Retail:** associates, managers, buyers, planners, merchandisers
7. **Marketing:** strategists, copywriters, designers, analysts, brand managers
8. **Education:** teachers, professors, administrators, counselors, coordinators
9. **Logistics:** drivers, dispatchers, warehouse staff, coordinators, planners
10. **Construction:** contractors, architects, project managers, workers, estimators
11. **Legal:** attorneys, paralegals, associates, partners, legal assistants
12. **Real Estate:** agents, brokers, property managers, appraisers, analysts
13. **Energy:** engineers, technicians, operators, safety officers, analysts
14. **Hospitality:** managers, staff, chefs, coordinators, event planners
15. **Research:** scientists, lab technicians, research assistants, analysts

**ROLE NAMES POOL (vary within each scenario):**
Junior roles: junior [role], associate [role], entry-level [role], [role] I
Senior roles: senior [role], lead [role], principal [role], [role] III
Premium roles: chief [role], director of [role], VP of [role], head [role]

**SALARY/RATE RANGES (randomly select - ensure varied across questions):**
Junior hourly rates: $47, $52, $58, $63, $67, $73, $78, $84, $89, $92, $96
Senior hourly rates: $87, $93, $98, $104, $112, $118, $126, $134, $142, $148, $156
Premium hourly rates: $165, $178, $187, $196, $208, $217, $234, $248, $267, $284
Annual salaries (×2000 hours): $94K, $104K, $116K, $126K, $134K, $146K, $156K, $178K, $196K, $224K, $248K, $284K

**EMPLOYEE COUNT RANGES (randomly select based on scenario scale):**
Small teams: 12, 14, 15, 18, 21, 24
Medium teams: 27, 32, 36, 42, 45, 48
Large teams: 54, 63, 72, 84, 96, 108

**FINANCIAL AMOUNTS (use these patterns - vary magnitude):**
Revenue: $1.23M, $2.34M, $3.87M, $4.56M, $6.23M, $7.89M, $9.45M, $12.67M, $15.42M, $18.76M
Budgets: $234K, $387K, $456K, $678K, $892K, $1.23M, $1.87M, $2.34M, $3.12M
Project values: $47,890, $58,234, $67,456, $78,923, $89,234, $126,450, $187,320, $234,780
Costs/expenses: $12,340, $23,450, $34,567, $45,678, $67,890, $89,123, $134,560

**PERCENTAGES (avoid round numbers like 50%, 25%, 75%):**
Growth rates: 13%, 17%, 23%, 28%, 32%, 37%, 42%, 48%, 53%, 58%, 63%, 68%
Margins: 12.5%, 18.3%, 22.7%, 27.4%, 31.8%, 36.2%, 42.8%, 47.3%, 52.6%
Efficiency/productivity: 73%, 78%, 83%, 87%, 92%, 94%, 96%
Distribution splits: 38%-62%, 42%-58%, 45%-55%, 35%-65%, 32%-68%

**RATIOS (vary complexity - don't always use 3:2):**
Simple ratios: 2:1, 3:1, 4:1, 5:2, 7:3, 9:4
Medium ratios: 3:2, 5:3, 7:4, 8:5, 9:5
Complex ratios: 11:7, 13:8, 17:11, 5:4:3 (three groups)

**TIME PERIODS (rotate through different formats):**
Quarters: Q1 2023, Q2 2023, Q3 2023, Q4 2023, Q1 2024, Q2 2024
Half-years: H1 2023, H2 2023, H1 2024, H2 2024
Fiscal years: FY 2023, FY 2024, fiscal year 2023-2024
Month ranges: January-March 2024, April-June 2023, July-September 2024
Weeks: Week 12, Week 23, Week 47, first quarter, final quarter

**METRICS/KPIs TO VARY:**
- Payroll/salary budget
- Project completion rate
- Revenue per employee
- Labor cost percentage
- Productivity metrics
- Bonus/incentive amounts
- Overtime hours/costs
- Utilization rate
- Billable hours ratio

**PROBLEM TEMPLATES (randomly combine elements):**

Template 1 (Team composition):
"[Company] employs [number] [role_plural] consisting of [role1_plural] earning [rate1] and [role2_plural] earning [rate2]. [Question about count/cost/ratio]"

Template 2 (Department metrics):
"The [department] at [Company] has [metric] of [value] for [time_period]. [Additional constraint]. [Question]"

Template 3 (Project/Achievement):
"[Company]'s [division] completed [number] [projects/tasks] worth [amount] in [time_period]. [Cost/rate details]. [Question]"

Template 4 (Financial analysis):
"A [industry] firm's [team] has [financial_metric] of [amount], with [role1_plural] and [role2_plural] contributing differently. [Question]"

Template 5 (Change scenario):
"[Company] has [current_state]. If [change_description], the [metric] would [increase/decrease] by [amount]. [Question]"

**GENERATION PROTOCOL (MANDATORY):**

Before generating each question:
1. ✅ Randomly select company (different from last 2 questions)
2. ✅ Randomly select scenario (cycle through, don't repeat within 5 questions)
3. ✅ Randomly select salary/rate pair (ensure compatibility with chosen scenario)
4. ✅ Randomly select team size (appropriate for scenario scale)
5. ✅ Randomly select time period
6. ✅ Randomly select ratio/percentage (vary complexity)
7. ✅ Choose different answer choice than last question (don't always use D)
8. ✅ Verify all numbers produce whole number solutions
9. ✅ Mix up statement types (don't always use ratio+total pattern)

**VARIETY CHECKLIST:**
☐ Company name different from previous question?
☐ Scenario/industry different from previous 2 questions?
☐ Salary rates vary by at least $15/hour from previous?
☐ Team size in different range (small/medium/large) than previous?
☐ Time period uses different format than previous?
☐ Answer choice (A/B/C/D/E) varies from previous question?
☐ Statement 1 uses different approach than previous question?
☐ Numbers are non-round and verify to whole numbers?

**EXAMPLE VARIATIONS (showing diversity):**

❌ **Repetitive (avoid this):**
Q1: "DataSoft employs 15 analysts earning $87 and $63..."
Q2: "DataSoft has 18 developers earning $94 and $67..."
Q3: "DataSoft's team of 21 engineers earning $102 and $73..."

✅ **Good Variety (do this):**
Q1: "BlueSky Analytics employs 15 data analysts, with senior analysts earning $104/hour and junior analysts earning $67/hour in Q3 2023. How many junior analysts are on the team?"

Q2: "The manufacturing floor at Vertex Industries has 24 production operators working in H1 2024. Line supervisors earn $87/hour while floor operators earn $58/hour. If the weekly labor budget is $28,416, how many floor operators are employed?"

Q3: "MegaCorp's legal department completed 234 billable hours worth $47,890 in April-June 2024. Senior paralegals billed at $134/hour and junior paralegals at $92/hour. What was the ratio of senior to junior paralegals?"

**TOPIC ROTATION:**
- Business context: 30%
- Mathematical/Statistical: 25%
- Finance/Investment: 25%
- Operations/Production: 20%

**DIFFICULTY CALIBRATION (${difficulty}):**
${difficulty === 'medium' ? `
**DIFFICULTY ENFORCEMENT FOR TRUE MEDIUM (600-700 GMAT):**

**📊 ANSWER DISTRIBUTION (For variety across 8 DS questions):**
- 2-3 questions: Answer A (Statement 1 alone sufficient)
- 2-3 questions: Answer B (Statement 2 alone sufficient)
- 2-3 questions: Answer D (Each alone sufficient)
- 0 questions: Answer C or E (NEVER for medium difficulty)

**VARIETY RULE:** Don't generate the same answer choice consecutively!
- If last question was Answer D, next should be A or B
- Track answer distribution to maintain balance
- Aim for roughly equal distribution of A, B, and D across a set of questions

Statement 1 Requirements:
- Must require 2+ calculation steps minimum
- Must require setting up at least one equation or relationship
- ❌ BANNED: Simple ratios with total given (e.g., "3:2 ratio and 15 total")
- ❌ BANNED: Direct percentages of totals (e.g., "40% are senior developers")
- ✅ BETTER: "Senior developers completed 2.5 times the project value per person compared to junior developers"
- ✅ BETTER: "The combined salary of all senior developers exceeds the combined salary of all junior developers by $684,000"
- Cannot be solved in under 30 seconds by a competent test-taker

Statement 2 Requirements:
- Must create a different system/approach than Statement 1
- Should seem insufficient at first glance (requires deeper analysis)
- Must require multiple substitutions or equation manipulations
- ❌ BANNED: Direct answers (e.g., "There are 6 junior developers")
- ❌ BANNED: Simple totals with unit rates (e.g., "15 total developers, each junior earns $95k")
- ✅ BETTER: "If 3 junior developers were promoted to senior, the average team salary would increase by $18,000"
- ✅ BETTER: "The ratio of total senior salaries to total junior salaries is 9:5, and there are fewer than 12 developers total"

Mathematical Complexity Requirements (BOTH Statements):
- Require setting up algebraic equations (not just arithmetic)
- Need 3-4 mathematical operations to reach solution
- Should involve:
  * Variable substitution (solving for x in terms of y, then substituting)
  * System of equations (two unknowns, two equations)
  * Multi-step inference (A implies B, B implies C, therefore C)
  * Weighted calculations (averages, per-unit comparisons)

**VALIDATION CHECKLIST (MUST PASS ALL):**
□ Can Statement 1 be solved in under 30 seconds? → If YES, question is TOO EASY, regenerate
□ Can Statement 2 be solved in under 30 seconds? → If YES, question is TOO EASY, regenerate
□ Does Statement 1 require setting up an equation? → If NO, TOO EASY
□ Does Statement 2 require setting up an equation? → If NO, TOO EASY
□ Are there 3+ mathematical operations needed for each statement? → If NO, TOO EASY
□ Do both statements approach the problem differently? → If NO, poorly constructed
□ Would a test-taker need to write down equations to solve? → If NO, TOO EASY

**Example of TRUE MEDIUM Complexity:**

Problem: "A development team has senior and junior developers. How many junior developers are on the team?"

❌ TOO EASY Statement 1: "The ratio is 3:2 and there are 15 developers total"
(Solution: 3x+2x=15, 5x=15, x=3, juniors=6 → only 2 steps, too fast)

✅ GOOD Statement 1: "The combined annual salary of all senior developers exceeds the combined salary of all junior developers by $420,000, and senior developers earn $70,000 more per year than junior developers"
(Solution: Let S=seniors, J=juniors, s=senior salary, j=junior salary. Given: S×s - J×j = 420000 and s-j=70000. This alone is insufficient without another constraint, but shows proper complexity)

❌ TOO EASY Statement 2: "There are 12 developers total and juniors earn $95,000"
(Too direct, doesn't create interesting problem)

✅ GOOD Statement 2: "If 2 junior developers were promoted to senior developers, the total annual payroll would increase by $140,000, and the current average salary is $116,000"
(Solution: Requires calculating current payroll, new payroll after promotion, setting up equation with promotion salary change)

Target solving time: 90-120 seconds per statement
` : `
**DIFFICULTY ENFORCEMENT FOR TRUE HARD (700+ GMAT):**

**🔥 MATHEMATICAL COMPLEXITY (Required Elements):**
- 3-5 calculation steps MINIMUM (vs 2-3 for medium)
- Multi-layered equations requiring substitution
- Percentage of percentage calculations
- Weighted averages with 3+ components
- Compound calculations (growth on growth)
- Non-obvious number relationships

**NUMBER SELECTION FOR HARD:**
- Use primes: 137, 173, 239, 317, 419, 457, 503, 571, 617, 673
- Fractions that don't simplify: 7/13, 11/17, 13/19, 17/23, 19/29
- Percentages with decimals: 23.7%, 41.3%, 67.8%, 73.2%, 84.6%
- Numbers that create close distractors: 234/236, 1,178/1,187, 2,345/2,354

**📊 ANSWER DISTRIBUTION FOR HARD (8 DS questions):**
- 3 questions: Answer C (both together sufficient) — PRIMARY ANSWER
- 2-3 questions: Answer E (both together insufficient)
- 2-3 questions: Answer A (statement 1 alone)
- 0-1 questions: Answer B (statement 2 alone)
- 0 questions: Answer D (too straightforward for hard) — NEVER USE

**Focus on "neither alone but both together" (Answer C) and "even together insufficient" (Answer E) scenarios**

**COGNITIVE LOAD INCREASES:**

Information Overload:
- Add 20-30% more data than needed
- Include relevant-looking red herrings
- Mix units (thousands/millions, hours/days, quarterly/annually)
- Present data in different formats

Time Pressure Elements:
- Target solve time: 2.5-3.5 minutes
- Cannot use shortcuts
- Require careful reading of constraints
- Multiple verification steps needed

**STATEMENT/QUESTION COMPLEXITY:**

Language Complexity (Required):
- Use compound conditionals: "If X and not Y, then..."
- Nested relationships: "The ratio of A to B equals the ratio of C to D"
- Inverse relationships: "varies inversely with the square of..."
- Percentage changes: "30% more than 20% less than..."

Hidden Requirements:
- Constraints mentioned only once
- Implications rather than direct statements
- Need to infer missing information
- Recognize what's NOT explicitly said

**🚨 TRAP PATTERNS FOR HARD (MUST INCLUDE):**

Common Traps to Include:
- Percentage vs. percentage points confusion
- Average of averages fallacy
- Assuming equal weights when not stated
- Correlation implying causation
- Sample size ignored
- Reversal errors (profit/loss, increase/decrease)

Near-Miss Distractors:
- Correct method, arithmetic error: ±1
- Forgot one step: 80% of correct answer
- Used wrong operation: reciprocal or negative
- Mixed units: off by factor of 1000

**SCENARIO DEPTH:**

Multi-Variable Scenarios (Required):
- 4+ interacting variables
- Conditional constraints: "If revenue > $10M, then margin must exceed..."
- Time-dependent changes: "Starting in Q3, rates increased..."
- Cascading effects: "Which triggers a secondary adjustment..."

Real-World Complexity:
- Industry-specific terminology (ROI, EBITDA, capacity utilization)
- Regulatory constraints (minimum requirements, caps)
- Seasonal adjustments
- Currency conversions
- Tax implications

**HARD DIFFICULTY CHECKLIST (Before Marking as Hard):**
☑ Cannot solve any part in <30 seconds?
☑ Requires 3+ distinct insights?
☑ Has 2+ trap opportunities?
☑ Distractors within 10% of correct answer?
☑ Multiple valid approaches (but same answer)?
☑ Would fool 60%+ of test takers?
☑ Requires checking work?
☑ Easy to make careless errors?

**DS HARD SPECIFICS:**

Statement 1 Design:
- Seems sufficient but missing subtle element
- Example: "Ratio is 13:11 and if 3 promoted, weekly cost increases $2,340"
- Trap: Gives ratio AND change, but no anchor (total count or one group's count)
- Still INSUFFICIENT without knowing scale

Statement 2 Design:
- Complex relationship requiring algebra
- Example: "Average salary is 23.7% higher than it would be if ratio of seniors to juniors were 5:7 instead of current ratio, and total payroll is $2,347,890"
- Requires: backwards calculation, system of equations, multiple steps

Together (Answer C):
- Non-obvious how they combine
- Need to recognize Statement 1 provides ratio, Statement 2 provides scale
- Combine to solve system of equations

Together Insufficient (Answer E):
- Both statements combined still missing one crucial piece
- Example: Both give constraints but create underdetermined system
- Or: Both give information but about wrong variables

**VALIDATION FOR HARD:**

Final Checks:
☑ Would an average student get this wrong? (60%+ error rate expected)
☑ Does it require GMAT-specific reasoning?
☑ Are shortcuts blocked?
☑ Multiple ways to make errors?
☑ Confidence trap (seems easier than it is)?
☑ Tests 2+ concepts simultaneously?
☑ Time pressure significant?

**EXAMPLE TRANSFORMATION (Medium → Hard):**

Medium Version:
"Company has 15 employees with 3:2 ratio of senior to junior. Seniors earn $165k, juniors earn $95k. How many junior employees?"
(Too direct, ratio + total given, easy calculation)

Hard Version:
"A consulting firm's project division has senior and junior consultants whose combined annual base salaries total $2,347,890. The ratio of senior consultants to junior consultants is such that if 3 junior consultants were promoted to senior level (increasing each promoted consultant's salary from $134,700 to $217,500), the total annual payroll would increase by exactly $248,400, and the new ratio would be 17:11. Currently, senior consultants earn 61.5% more than junior consultants. How many junior consultants are currently employed?"

This HARD version adds:
- Complex ratio relationship (current vs. after promotion)
- Multiple salary figures with decimals
- Conditional change scenario
- Percentage relationship between salaries
- Large total with specific amount
- Multiple interacting variables
- Non-obvious path to solution
- 4-5 step solution required

Target solving time: 2.5-3.5 minutes
`}

**SUFFICIENCY LOGIC RULES (CRITICAL - AVOID COMMON MISTAKES):**

**🚨 CRITICAL RATIO RULE - MUST FOLLOW:**

**Statement with ONLY ratio + ANY change/promotion/difference is STILL INSUFFICIENT**
**You need: ratio + TOTAL COUNT or ratio + ONE ACTUAL COUNT**

❌ **NOT Sufficient (missing total or anchor):**
- "The ratio of seniors to juniors is 3:2"
- "The ratio is 3:2 and if 4 employees were promoted, the ratio would be 5:3"
- "The ratio is 3:2 and the salary difference between groups is $420,000"
- "The ratio is 13:11 and promoting 1 person changes weekly cost by $2,340"
- "Senior developers earn 1.5 times what junior developers earn"
- "The percentage of seniors is 60%" (without total count)
- "The ratio is 7:5 and if 3 juniors became seniors, average salary would increase by $8,500"

**WHY THESE ARE INSUFFICIENT:**
- Ratio 13:11 could be: 13+11=24 total, OR 26+22=48 total, OR 39+33=72 total, etc.
- Knowing a change in cost/salary still doesn't give the scale
- Need an ANCHOR: total count OR one group's actual count

✅ **IS Sufficient (has total or anchor):**
- "The ratio is 3:2 and the total team size is 20"
- "The ratio is 3:2 and there are 12 senior developers"
- "Total payroll is $2,055,000 and average salary is $137,000" (can derive total count)
- "60% of the 25-person team are seniors" (gives both percentage AND total)
- "The team has 15 members and the ratio of seniors to juniors is 3:2"

**WHY THIS MATTERS:**
- Ratio alone: Could be 3:2 (15 total), 6:4 (10 total), 9:6 (15 total), 30:20 (50 total)...
- Question asks "How many juniors?" → CANNOT answer without knowing scale
- Statement must provide BOTH ratio AND scale (total, one group count, or derivable total)

**TESTING PROTOCOL (MANDATORY):**

After creating each statement, ask yourself:
1. "Can I determine the EXACT count without knowing the total?"
   - If NO → Statement is INSUFFICIENT
2. "Does this statement provide a ratio/percentage AND a scale?"
   - If NO → Statement is INSUFFICIENT for count questions
3. "If I solve this, do I get ONE specific number or multiple possibilities?"
   - If MULTIPLE → Statement is INSUFFICIENT

**COMMON TRAP TO AVOID:**
Statement: "The ratio is 3:2 and senior salaries total $915,000 while junior salaries total $570,000"
This seems sufficient but is actually:
- Given: S×$165k = $915k → S = 5.545... ✗ FRACTIONAL (if salaries are $165k each)
- OR: Given different salary interpretation... still needs verification
- VERIFY: Does this yield whole number counts? If not, regenerate!

**ANSWER VALIDATION:**
- Choice A: Statement (1) ALONE sufficient → Show calculation works with (1), fails with (2)
- Choice B: Statement (2) ALONE sufficient → Show calculation works with (2), fails with (1)
- Choice C: BOTH TOGETHER sufficient → Neither alone works, both together solve
- Choice D: EACH ALONE sufficient → Both (1) and (2) independently solve
- Choice E: TOGETHER insufficient → Even combined, cannot solve

**EXPLANATION REQUIREMENTS:**
- Length: 40-80 words
- Include: Why correct answer works (25-40 words) + Why others fail (15-40 words)
- Tone: Instructional, not conversational
- Example: "Statement (1) is sufficient because it provides [X], allowing us to calculate [Y]. Statement (2) alone cannot determine [Z] without [W]..."

**IMAGE SPECIFICATIONS:**
- Use image_url for geometry/graphs ONLY (15% of questions)
- If used: Descriptive filename like "triangle_abc_angles.png"
- If not needed: set to null

**VALIDATION CHECKLIST:**
☐ All calculations verified (run twice)
☐ Exactly one correct answer
☐ Numbers follow specification (no round numbers)
☐ Word counts within limits (40-100 for problem)
☐ Statements are independent
☐ Explanation complete and clear

═══════════════════════════════════════════════════════════
🚨 MANDATORY PRE-OUTPUT VERIFICATION PROTOCOL 🚨
═══════════════════════════════════════════════════════════

⚠️  **WORK BACKWARDS! Never generate random numbers hoping they'll work!** ⚠️

**STEP 1: Choose a complete solution FIRST (reverse engineering)**

Pick specific whole number values that answer the question:
- Example: "I need to find number of junior developers"
- Solution: Let me choose 12 total developers = 7 senior + 5 junior
- Calculate ALL derived values from this solution:
  * Total payroll: 7×$165,000 + 5×$95,000 = $1,155,000 + $475,000 = $1,630,000
  * Salary difference: $1,155,000 - $475,000 = $680,000
  * Ratio: 7:5
  * Average salary: $1,630,000 ÷ 12 = $135,833.33... ✗ FRACTIONAL!
- If ANY calculation produces decimals, choose different numbers and recalculate

**Try again:**
- Solution: 15 total = 9 senior + 6 junior
- Total payroll: 9×$165,000 + 6×$95,000 = $1,485,000 + $570,000 = $2,055,000
- Salary difference: $1,485,000 - $570,000 = $915,000
- Ratio: 9:6 = 3:2 (simplifies nicely)
- Average salary: $2,055,000 ÷ 15 = $137,000 ✓ WHOLE NUMBER!
- **ALL calculations are whole numbers ✓ THIS IS MY SOLUTION**

**STEP 2: Build statements using ONLY the verified values**

Now create statements that lead to this exact solution:

Statement 1 option: "The ratio of senior to junior developers is 3:2, and the total team size is 15"
- Verification: 3x + 2x = 15 → 5x = 15 → x = 3 → seniors = 9, juniors = 6 ✓

Statement 2 option: "The combined salary of senior developers exceeds the combined salary of junior developers by $915,000, and each senior earns $165,000 while each junior earns $95,000"
- Verification: 165S - 95J = 915, need another constraint from problem context
- Wait, this alone is insufficient! Need to also use total team size or another constraint.

**Revise Statement 2:** "The total annual payroll is $2,055,000, and the average developer salary is $137,000"
- Verification: Payroll = $2,055,000 → need to find J
- From problem: seniors earn $165k, juniors $95k
- We need total developers: $2,055,000 ÷ $137,000 = 15 developers
- Then: 165S + 95J = 2,055 and S + J = 15
- Substitute: 165S + 95(15-S) = 2,055 → 165S + 1,425 - 95S = 2,055 → 70S = 630 → S = 9
- Therefore J = 15 - 9 = 6 ✓ MATCHES SOLUTION!

**STEP 3: Verify BOTH paths independently lead to the SAME answer**

Path 1 (Statement 1): 3:2 ratio with 15 total → 9 senior, 6 junior ✓
Path 2 (Statement 2): $2,055k payroll, $137k average → 9 senior, 6 junior ✓
Both paths give IDENTICAL answer: **6 junior developers** ✓

**STEP 4: Confirm answer choice matches sufficiency**
- Statement 1 alone: SUFFICIENT (gives 6 juniors)
- Statement 2 alone: SUFFICIENT (gives 6 juniors)
- Answer choice: **D** (each alone sufficient) ✓

**STEP 5: Complete MANDATORY verification checklist**

**VERIFICATION CHECKLIST - MUST COMPLETE BEFORE OUTPUTTING:**
☑ Math verified for Statement 1? → [your answer] ✓
☑ Math verified for Statement 2? → [your answer] ✓
☑ Both give same answer? → Yes ✓
☑ All whole numbers? → Yes ✓
☑ Answer choice matches pattern? → [A/B/C/D/E] ✓
☑ Problem statement 55-100 words? → [count] words ✓
☑ Statement 1 is 18-40 words? → [count] words ✓
☑ Statement 2 is 18-40 words? → [count] words ✓

**DIFFICULTY CHECK (for Medium questions):**
☐ Statement 1 requires 2+ calculation steps? → [Yes/No]
☐ Statement 2 requires 2+ calculation steps? → [Yes/No]
☐ Statement 1 requires setting up equation? → [Yes/No]
☐ Statement 2 requires setting up equation? → [Yes/No]
☐ Both statements non-obvious (can't solve in <30 sec)? → [Yes/No]
☐ Statements approach problem from different angles? → [Yes/No]
☐ Would test-taker need to write equations? → [Yes/No]

**IF ANY DIFFICULTY CHECK = NO → Question is TOO EASY, needs improvement!**

═══════════════════════════════════════════════════════════
🏆 WINNING FORMULA FOR MEDIUM DS (USE THESE PATTERNS) 🏆
═══════════════════════════════════════════════════════════

**1. ADD "CHANGE SCENARIOS" (highly effective for medium):**
✅ "If 3 junior developers were promoted to senior..."
✅ "If the team added 2 more analysts earning the average salary..."
✅ "If 4 high-priority tasks were reclassified as standard..."
✅ "Had the company hired 5 fewer employees..."
✅ "If the hourly rate for all juniors increased by $12..."

These force multi-step thinking:
- Calculate current state
- Model the change
- Compare new vs. old
- Solve for unknown

**2. COMBINE DIFFERENT METRIC TYPES (in same statement):**
✅ Total payroll + average salary + team count
✅ Ratio of seniors to juniors + salary difference + total budget
✅ Percentage distribution + absolute counts + per-unit rates
✅ Time periods (weekly + annual) + cost metrics + headcount

Example: "The total annual payroll is $2,055,000, the average developer salary is $137,000, and the ratio of senior to junior salaries is 3:2"
→ This combines: total, average, ratio (3 different metric types)

**3. REQUIRE 2+ DISTINCT INSIGHTS PER STATEMENT:**

❌ Single insight: "There are 15 developers total"
✅ Two insights: "The total team size is 15, and the average salary exceeds $130,000"
✅ Two insights: "Senior developers represent 60% of the team, and they earn $70,000 more annually than juniors"
✅ Two insights: "If 2 juniors were promoted, the payroll would increase by $140,000, and the new average salary would be $142,000"

Each insight should contribute to solvability - not redundant information.

**4. VERIFY MATH AT EVERY STEP (show your work):**

When designing Statement 2:
"If 3 juniors promoted to senior, weekly cost increases by $684"

Verify:
- Current: 9 senior @ $73/hr, 6 junior @ $48/hr
- Change: 9→12 senior, 6→3 junior
- Calculation: 3 × ($73-$48) × 40 hours = 3 × $25 × 40 = $3,000 per week
- Wait, I said $684... let me recalculate!
- $684 ÷ 40 hours = $17.10 per hour difference... that doesn't match $73-$48=$25
- ✗ MATH ERROR - regenerate with correct numbers

**PATTERN LIBRARY FOR MEDIUM (use these proven structures):**

Pattern A: Change scenario + metric combination
"If X employees were [promoted/removed/added], the [total/average/ratio] would [increase/decrease] by Y"

Pattern B: Comparison across groups
"Group A's combined [salary/output/cost] exceeds Group B's by $X, and [another constraint about rates/sizes/ratios]"

Pattern C: Weighted average scenario
"The [weekly/annual] cost is Y% [higher/lower] than it would be if all [employees/tasks/units] were [paid/valued at] the average rate"

Pattern D: Multi-period with constraints
"In Q3, the team completed X projects worth $Y total, with each [role/category] contributing different amounts, and [constraint about distribution/ratios]"

═══════════════════════════════════════════════════════════

**Example of insufficient complexity:**
❌ Statement 2: "There are 12 analysts total and seniors earn $73 per hour"
→ This is too direct, only 1 step: 12 total - seniors = juniors

**Suggested improvement for true medium:**
✅ Statement 2: "The team's weekly labor cost is 23% higher than it would be if all employees were paid the average of the two hourly rates, and the total team size is 18"
→ This requires:
  * Understanding weighted averages
  * Setting up equation: actual_cost = 1.23 × (average_rate × 18 × 40_hours)
  * Solving system with hourly rates
  * 3+ calculation steps

**STEP 6: ONLY NOW output the JSON (after ALL checks pass)**

═══════════════════════════════════════════════════════════

**COMPLETE EXAMPLE OF CORRECT WORKFLOW:**

❌ WRONG APPROACH:
"Let me write a question about 234 tasks with 42% high-priority..."
*writes question*
*tries to verify* → 234×0.42 = 98.28 ✗ FAILS!

✅ CORRECT APPROACH:
"I want a question about task distribution.
STEP 1: Choose solution first:
- Total tasks: 250 (divisible by many numbers)
- High-priority: 105 (42% would be 250×0.42=105 ✓)
- Standard: 145 (250-105=145 ✓)
- Price high: $73 each → 105×$73 = $7,665 ✓
- Price standard: $48 each → 145×$48 = $6,960 ✓
- Total value: $7,665 + $6,960 = $14,625 ✓
ALL WHOLE NUMBERS ✓

STEP 2: Build statements from these values:
Statement 1: '42% of tasks are high-priority at $73 each, standard tasks are $48 each'
Statement 2: 'Total project value is $14,625, with 105 high-priority tasks'

STEP 3: Verify both paths:
Path 1: 250×0.42=105 high, 145 standard → value = $7,665+$6,960=$14,625 ✓
Path 2: If 105 high at $73 = $7,665, then $14,625-$7,665=$6,960 for standard
        $6,960÷$48 = 145 standard tasks, total = 250 ✓

STEP 4: Answer = D (both sufficient independently) ✓

NOW I can output!"

═══════════════════════════════════════════════════════════

**🚨 ABSOLUTE REQUIREMENTS - NO EXCEPTIONS:**

1. ✅ Choose your final answer FIRST (e.g., "6 junior developers")
2. ✅ Calculate ALL related values from that answer
3. ✅ Verify every single calculation produces WHOLE NUMBERS
4. ✅ If any decimal appears, choose different numbers and restart
5. ✅ Build statements ONLY using the verified values
6. ✅ Test both statement paths independently
7. ✅ Confirm both paths give IDENTICAL answers
8. ❌ DO NOT output JSON until ALL steps above pass

**NEVER START WITH THE STATEMENTS - START WITH THE SOLUTION!**

═══════════════════════════════════════════════════════════

**RESPONSE FORMAT (JSON only):**
\`\`\`json
{
  "problem": "Clear question asking for specific value or yes/no",
  "statement1": "First piece of information",
  "statement2": "Second piece of information",
  "correct_answer": "A/B/C/D/E",
  "explanation": "Brief explanation of why this answer is correct",
  "image_url": null,
  "answer_choices": {
    "A": "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "B": "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "C": "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "D": "EACH statement ALONE is sufficient.",
    "E": "Statements (1) and (2) TOGETHER are NOT sufficient."
  }
}
\`\`\``,

      GI: `${baseContext}${examplesSection}${avoidSection}

═══════════════════════════════════════════════════════════
📈 GRAPHICS INTERPRETATION (GI) - COMPLETE SPECIFICATIONS
═══════════════════════════════════════════════════════════

**📋 GI GENERATION INSTRUCTIONS**

**1. MATHEMATICAL VALIDATION**

Pre-Generation Requirements:
STEP 1: Create your data table FIRST (12-20 data points)
STEP 2: Calculate ALL derived values (averages, trends, correlations)
STEP 3: Verify calculations yield clean numbers
STEP 4: Write blanks that test these verified values
STEP 5: Create 4 options where only 1 is mathematically correct

Chart Data Rules:
- Line graphs: 3-4 lines, 8-12 time periods
- Scatter plots: 30-50 points with clear trend line
- Bar charts: 5-7 categories, 2-3 data series
- Pie charts: 5-7 segments (no segment <3% or >45%)

**2. BLANK SPECIFICATIONS**

Statement Structure:
- Total length: 45-75 words
- EXACTLY 2 blanks: [BLANK1] and [BLANK2]
- Blank placement: Never first/last 3 words
- Context before blanks: 10-20 words minimum

Blank Types Required:
BLANK1 (analytical):
- Specific values from chart
- Calculations (differences, ratios)
- Trend identifiers (highest, lowest, median)

BLANK2 (interpretive):
- Correlation descriptions
- Pattern analysis
- Percentage changes
- Relationship comparisons

**3. DROPDOWN OPTIONS**

Requirements per blank:
- EXACTLY 4 options
- Length: 3-8 words each
- 1 correct, 3 plausible distractors
- Include units where applicable

Option Types:
Numerical: Include units ($2.4 million, 23.4%, Q3 2024)
Descriptive: (steadily increasing, cyclical pattern, weak correlation)
Comparative: (twice as large, 30% higher, inversely proportional)

**4. VARIETY REQUIREMENTS**

Chart Contexts (rotate):
- Revenue/Sales trends over quarters
- Market share distribution
- Customer satisfaction metrics
- Production efficiency analysis
- Cost vs benefit correlations
- Geographic performance data
- Employee productivity metrics

Companies/Industries:
- Tech: CloudAnalytics, DataVision Systems
- Retail: GlobalMart, PrimeRetail Group
- Finance: CapitalTrends, InvestCore
- Manufacturing: ProducTech, Efficiency Works

Time Periods:
- Quarters: Q1 2023 - Q4 2024
- Months: Jan-Dec 2024
- Years: 2020-2024
- Custom: Week 1-12, Phase 1-6

**5. DIFFICULTY CALIBRATION (${difficulty}):**
${difficulty === 'medium' ? `
Medium Difficulty (600-700 GMAT):
- BLANK1: Requires 1-2 calculations
- BLANK2: Requires trend analysis
- Cannot solve by just reading labels
- Must understand relationships

Required Complexity:
✅ At least one blank requires calculation
✅ At least one blank requires interpretation
✅ Options include close distractors (+/- 10%)
✅ Time to solve: 90-120 seconds
` : `
Hard Difficulty (700+ GMAT):
- BLANK1: Requires 2-3 calculations or interpolation
- BLANK2: Requires subtle correlation/causation analysis
- Must calculate rates of change
- Identify inflection points
- Compare trends across multiple series

Required Complexity:
✅ Both blanks require calculations
✅ Need to interpolate between data points
✅ Options within 5-8% of correct answer
✅ Include reverse relationships as distractors
✅ Mix absolute and relative measures
✅ Time to solve: 2.5-3 minutes
`}

**6. CONTEXT PARAGRAPH**

Requirements:
- Length: 40-60 words
- Must include: chart type, scope, units
- Technical detail: (e.g., "adjusted for seasonality")
- No interpretation - just description

Template:
"The [chart type] shows [what metric] for [scope/companies]
over [time period]. [Technical detail about scale/units].
[Additional context about data source or methodology]."

**7. MANDATORY VERIFICATION**

Before output:
☑ Chart data table created?
☑ All calculations verified?
☑ BLANK1 requires analysis (not just reading)?
☑ BLANK2 requires interpretation?
☑ Each blank has exactly 4 options?
☑ Options include plausible distractors?
☑ Context paragraph 40-60 words?
☑ Statement 45-75 words?
☑ Can be solved in 90-120 seconds (medium) or 2.5-3 min (hard)?

**8. OUTPUT FORMAT**

**CHART GENERATION (REQUIRED):**
- Generate complete chart configuration data
- AI will provide data, system will render the chart automatically
- Chart types: "line", "bar", "pie", "scatter"
- All data must be mathematically accurate and support the blanks

**CRITICAL: OUTPUT MUST BE VALID JSON**
- Ensure ALL commas are present between properties and array elements
- No trailing commas after last item
- All property names in double quotes
- Verify JSON syntax is correct

**RESPONSE FORMAT (JSON only):**
\`\`\`json
{
  "chart_config": {
    "type": "line",
    "title": "Quarterly Revenue by Product Line",
    "x_axis_label": "Quarter",
    "y_axis_label": "Revenue ($ millions)",
    "labels": ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    "datasets": [
      {
        "label": "Product Line A",
        "data": [23.4, 27.8, 31.2, 28.9, 34.5, 38.7, 42.3, 39.7],
        "color": "#3b82f6"
      },
      {
        "label": "Product Line B",
        "data": [18.7, 21.3, 19.8, 23.5, 26.2, 29.4, 31.8, 28.6],
        "color": "#10b981"
      },
      {
        "label": "Product Line C",
        "data": [15.2, 17.8, 16.3, 19.7, 21.4, 23.8, 25.6, 24.2],
        "color": "#f59e0b"
      }
    ]
  },
  "context_text": "The line graph shows quarterly revenue for CloudAnalytics' three product lines from Q1 2023 to Q4 2024, measured in millions of dollars. All values are adjusted for inflation to 2024 dollars.",
  "statement_text": "Between Q2 2023 and Q4 2024, revenue for Product Line A increased by [BLANK1], and the overall trend pattern is best described as [BLANK2].",
  "blank1_options": ["34.2%", "42.7%", "51.3%", "58.6%"],
  "blank1_correct": "42.7%",
  "blank2_options": ["steadily increasing", "cyclical with peaks", "exponential growth", "volatile with upward trend"],
  "blank2_correct": "cyclical with peaks"
}
\`\`\`

**CHART TYPE SPECIFICATIONS:**

**Line Chart:**
- Use for: trends over time, comparisons across series
- labels: Array of time periods (8-12 points)
- datasets: 2-4 lines with different colors
- data: Arrays of numbers matching labels length

**Bar Chart:**
- Use for: categorical comparisons, grouped data
- labels: Array of categories (5-8 categories)
- datasets: 1-3 data series with different colors
- data: Arrays of numbers matching labels length

**Pie Chart:**
- Use for: percentage distributions, market share
- labels: Array of category names (5-7 segments)
- datasets: Single dataset only
- data: Array of percentages that sum to 100
- colors: Array of colors (one per segment)

**Scatter Plot:**
- Use for: correlations, relationships between variables
- labels: Not used (x-y coordinate pairs)
- datasets: 1-2 point sets
- data: Array of {x: number, y: number} objects (30-50 points)

**COLOR PALETTE (use these):**
- Blue: "#3b82f6"
- Green: "#10b981"
- Orange: "#f59e0b"
- Red: "#ef4444"
- Purple: "#8b5cf6"
- Cyan: "#06b6d4"
- Pink: "#ec4899"`,

      TA: `${baseContext}${examplesSection}${avoidSection}

═══════════════════════════════════════════════════════════
📊 TABLE ANALYSIS (TA) - COMPLETE SPECIFICATIONS
═══════════════════════════════════════════════════════════

**📋 TA GENERATION INSTRUCTIONS**

**1. TABLE CONSTRUCTION**

Data Requirements:
- Rows: 6-8 (never less than 5)
- Columns: 6-8 (optimal 7)
- First column: Category names
- Mix of data types required

Column Types (must have all):
- 1 text column (company/product names)
- 2 numeric columns (integers)
- 2 decimal columns (1-2 decimals)
- 1 percentage column (include %)
- 1 currency column (include $)
- 1 growth/change column (+/- values)

**2. MATHEMATICAL VALIDATION**

Pre-Generation:
STEP 1: Create complete data table
STEP 2: Sort by each column mentally
STEP 3: Calculate all comparisons
STEP 4: Write statements based on verified calculations
STEP 5: Ensure exactly 1 true, 2 false OR 2 true, 1 false

Data Rules:
- No missing values
- Use realistic business numbers
- Include negative values where logical
- Percentages as "23.4%" not "0.234"
- Large numbers with commas: 1,234,567

**3. STATEMENT REQUIREMENTS**

Exactly 3 statements:
- Length: 15-25 words each
- Complexity mix required:
  * 1 requiring sorting
  * 1 requiring calculation
  * 1 requiring correlation analysis

Statement Types:
TYPE A: Direct comparison after sorting
TYPE B: Calculation across multiple cells
TYPE C: Correlation between columns

Truth Distribution:
- Version 1: T, T, F
- Version 2: T, F, F
- Version 3: F, T, T
(Never all true or all false)

**4. VARIETY REQUIREMENTS**

Table Topics (rotate):
- Quarterly performance metrics
- Regional sales data
- Department productivity
- Financial ratios
- Market share analysis
- Customer satisfaction scores
- Supply chain metrics
- Employee statistics

Industries:
- Technology, Finance, Retail, Healthcare
- Manufacturing, Energy, Real Estate
- Consulting, Education, Logistics

**5. DIFFICULTY CALIBRATION (${difficulty}):**
${difficulty === 'medium' ? `
Medium (600-700 GMAT):
- At least 1 statement needs 2+ sorts
- At least 1 statement needs calculation
- Include percentage calculations
- Use non-obvious correlations
- Close numbers as distractors

Complexity Requirements:
✅ Can't answer by checking single cell
✅ Need to compare 3+ values
✅ Requires understanding ratios/percentages
✅ Solution time: 90-120 seconds
` : `
Hard (700+ GMAT):
- 2 true, 1 false (harder to verify)
- Statements requiring 3+ sorts
- Hidden correlations
- Weighted averages across categories
- Statements about top/bottom quartiles
- Correlation ≠ causation traps

Complexity Requirements:
✅ Multiple sortings required
✅ Multi-step calculations needed
✅ Edge cases present
✅ Subtle distinctions
✅ Solution time: 2.5-3 minutes
`}

**6. TABLE FORMATTING**

Headers:
- Title case, no abbreviations
- Clear units in headers or cells
- Consistent formatting

Data Formatting:
- Currency: $1,234.56
- Percentages: 23.4%
- Decimals: Consistent precision
- Negatives: -12.3 not (12.3)

**7. MANDATORY VERIFICATION**

☑ Table has 6-8 rows, 6-8 columns?
☑ All required column types present?
☑ Statements exactly 15-25 words?
☑ Truth values verified?
☑ At least 1 statement requires sorting?
☑ At least 1 statement requires calculation?
☑ No single-cell answers?
☑ Realistic business data?

**8. OUTPUT FORMAT**

**COLUMN TITLE CUSTOMIZATION:**
- statement_column_title: Customizable (not always "Statement")
- answer_col1_title: Customizable (not always "True") - Examples: "Yes", "Correct", "Supported"
- answer_col2_title: Customizable (not always "False") - Examples: "No", "Incorrect", "Not Supported"

**RESPONSE FORMAT (JSON only):**
\`\`\`json
{
  "table_title": "Q3 2024 Regional Performance Metrics",
  "statement_column_title": "Statement",
  "answer_col1_title": "True",
  "answer_col2_title": "False",
  "column_headers": ["Region", "Revenue ($M)", "Growth %", "Efficiency", "Cost/Unit", "Satisfaction", "Margin %"],
  "table_data": [
    ["Northeast", "23.4", "12.3%", "0.87", "$124", "8.7", "22.1%"],
    ["Southeast", "19.8", "8.7%", "0.92", "$118", "9.1", "24.3%"],
    ["Midwest", "27.1", "15.2%", "0.84", "$132", "8.4", "19.7%"],
    ["Southwest", "21.5", "10.8%", "0.89", "$121", "8.9", "23.5%"],
    ["West", "31.2", "18.4%", "0.91", "$115", "9.3", "25.8%"],
    ["Northwest", "18.3", "7.2%", "0.86", "$127", "8.5", "21.4%"]
  ],
  "statements": [
    {"text": "The Southeast region has the highest efficiency score and satisfaction rating.", "is_true": false},
    {"text": "Regions with growth above 10% all have margins exceeding 20%.", "is_true": true},
    {"text": "Cost per unit inversely correlates with efficiency scores across all regions.", "is_true": true}
  ]
}
\`\`\``,

      TPA: `${baseContext}${examplesSection}${avoidSection}

═══════════════════════════════════════════════════════════
🔗 TWO-PART ANALYSIS (TPA) - COMPLETE SPECIFICATIONS
═══════════════════════════════════════════════════════════

**📋 TPA GENERATION INSTRUCTIONS**

**1. SCENARIO CONSTRUCTION**

Requirements:
- Length: 80-120 words
- Multiple constraints that interact
- Clear selection criteria for each column
- Budget/resource limitation
- Timeline consideration
- Quality requirements

Scenario Components:
1. Context setup (20-30 words)
2. Column 1 requirements (20-30 words)
3. Column 2 requirements (20-30 words)
4. Shared constraints (20-30 words)

**2. OPTION SPECIFICATIONS**

5 Options Required:
- Length: 15-30 words each
- Format: "Name: attribute1, attribute2, attribute3, attribute4"
- Include quantitative + qualitative attributes
- Some options qualify for both columns
- Some qualify for neither (but still assigned)

Attribute Types:
- Qualification (certification, degree)
- Availability (time, schedule)
- Cost (hourly rate, fixed price)
- Performance metric (score, rating)
- Constraint (location, capacity)

**3. CRITICAL ASSIGNMENT RULE**

EVERY option MUST be assigned:
- Options qualifying for role 1 → col1
- Options qualifying for role 2 → col2
- Options qualifying for both → assign to best fit
- Options qualifying for neither → assign to closest match
- NEVER leave empty assignments

**ASSIGNMENT RULES:**
- Qualified for Column 1 ONLY → "col1"
- Qualified for Column 2 ONLY → "col2"
- Qualified for NEITHER → "" (empty string)

**4. VARIETY REQUIREMENTS**

Scenario Types (rotate):
- Staffing: team leader + specialist
- Investment: growth stock + value stock
- Vendor: supplier A + supplier B
- Project: strategy A + strategy B
- Location: primary site + backup site
- Partnership: technical + marketing
- Equipment: production + quality control

Industries/Contexts:
- Consulting, Finance, Technology
- Healthcare, Manufacturing, Retail
- Education, Logistics, Real Estate

**5. DIFFICULTY CALIBRATION (${difficulty}):**
${difficulty === 'medium' ? `
Medium (600-700 GMAT):
- 2-3 options qualify per column
- Overlapping qualifications
- Budget optimization required
- Multiple constraints interact
- Not immediately obvious

Complexity Elements:
✅ Trade-offs between criteria
✅ Budget/resource constraints
✅ Qualification requirements
✅ Availability constraints
✅ Performance thresholds
` : `
Hard (700+ GMAT):
- Only 1-2 options qualify per column
- Multiple constraints eliminate most options
- Optimal solution not obvious
- 8+ constraints to juggle
- Optimization beyond simple matching
- Trade-offs with no perfect solution
- Time/cost/quality triangle

Complexity Elements:
✅ Very restrictive criteria
✅ Edge case qualifications
✅ Complex budget calculations
✅ Multiple trade-offs
✅ Careful elimination required
`}

**6. MATHEMATICAL VALIDATION**

Verification Steps:
STEP 1: List all requirements
STEP 2: Check each option against requirements
STEP 3: Determine qualifying options
STEP 4: Verify budget calculations
STEP 5: Confirm optimal selections

Budget Checks:
- Individual costs within limits
- Combined costs within total budget
- Cost-benefit optimization

**7. MANDATORY VERIFICATION**

☑ Scenario 80-120 words?
☑ Exactly 5 options?
☑ Each option 15-30 words?
☑ ALL options assigned to col1 or col2?
☑ Clear selection criteria?
☑ Budget/constraints realistic?
☑ Multiple qualifying options per column?
☑ Requires analysis (not obvious)?

**8. OUTPUT FORMAT**

**COLUMN TITLES:**
- column1_title: Role-specific, 8-15 characters
- column2_title: Role-specific, 8-15 characters
- statement_title: Describes options, 8-15 characters
- Examples: "Team Leader" / "Specialist", "Growth Stock" / "Value Stock"

**RESPONSE FORMAT (JSON only):**
\`\`\`json
{
  "scenario": "GlobalTech needs to select a project manager and technical lead for a $3.2M software implementation project that must be completed within 18 weeks. The project manager must have PMP certification, at least 6 years of experience, and be available immediately. The technical lead requires strong cloud architecture expertise, availability for at least 20 hours per week, and must work within a combined budget of $156,000 for both positions over the project duration.",
  "statement_title": "Candidate",
  "column1_title": "Project Manager",
  "column2_title": "Technical Lead",
  "shared_options": [
    "Sarah Chen: PMP certified, 8 years experience, $165/hour, available immediately, cloud architecture expert",
    "Michael Torres: MBA only, 6 years experience, $142/hour, available in 2 weeks, database specialist",
    "Jennifer Park: Agile certified, 10 years experience, $178/hour, part-time only, cloud expert",
    "David Kumar: PMP certified, 5 years experience, $134/hour, available immediately, limited cloud experience",
    "Lisa Johnson: Technical background, 7 years management, $156/hour, available immediately, cloud architecture expert"
  ],
  "correct_answers": {
    "Sarah Chen: PMP certified, 8 years experience, $165/hour, available immediately, cloud architecture expert": "col1",
    "Michael Torres: MBA only, 6 years experience, $142/hour, available in 2 weeks, database specialist": "",
    "Jennifer Park: Agile certified, 10 years experience, $178/hour, part-time only, cloud expert": "",
    "David Kumar: PMP certified, 5 years experience, $134/hour, available immediately, limited cloud experience": "",
    "Lisa Johnson: Technical background, 7 years management, $156/hour, available immediately, cloud architecture expert": "col2"
  }
}
\`\`\``,

      MSR: `${baseContext}${examplesSection}${avoidSection}

═══════════════════════════════════════════════════════════
📑 MULTI-SOURCE REASONING (MSR) - COMPLETE SPECIFICATIONS
═══════════════════════════════════════════════════════════

**📋 MSR GENERATION INSTRUCTIONS**

**1. SOURCE CONSTRUCTION**

3 Sources Required:
SOURCE 1: Business memo/email (150-200 words)
SOURCE 2: Data table (5-6 rows × 5-7 columns)
SOURCE 3: Analysis report OR second table (120-150 words)

Source Relationships:
- Each adds unique information
- Some contradictions/qualifications
- Together enable complex analysis
- No source alone sufficient

**2. SOURCE SPECIFICATIONS**

Source 1 (Memo):
- Header: TO/FROM/DATE/SUBJECT
- 3-4 paragraphs
- 5-8 specific numbers
- 2-3 constraints/conditions
- 1-2 forward-looking statements

Example header:
TO: Board of Directors
FROM: VP Operations
DATE: March 15, 2024
RE: Q1 Performance Summary

Source 2 (Table):
- Relates to but extends Source 1
- Mixed data types
- Historical + projected data
- Clear headers with units

Source 3 (Report):
- Different perspective
- Market context or competitive analysis
- Challenges assumptions from Source 1
- Additional constraints/considerations

**3. QUESTION REQUIREMENTS**

⚠️ CRITICAL: MSR has EXACTLY 1 QUESTION in the "questions" array
- Use "questions": [ {...} ] format (array with one question object)
- Question type: Can be ANY type (multiple choice OR two-column evaluation)
- Choose the most appropriate format for the scenario
- Must require synthesizing multiple sources

Question Complexity:
- Requires synthesizing ALL 3 sources
- Cannot be answered from single source
- Must involve cross-referencing between sources

**4. QUESTION SPECIFICATIONS**

Option A - Multiple Choice Question:
- 1 question text (20-40 words)
- 5 answer choices (A, B, C, D, E)
- Question must require information from at least 2 sources
- Wrong answers based on common misinterpretations
- Each choice 10-25 words
- Example: "Based on all three sources, which of the following can be concluded?"

Option B - Two-Column Question:
- Exactly 3 statements
- Column titles: Choose ONE of:
  * "Supported" / "Not Supported" (for factual claims)
  * "True" / "False" (for logical statements)
  * "Inferable" / "Not Inferable" (for conclusions)
  * "Yes" / "No" (for questions)
- Each statement 15-30 words
- Mix of answers (not all True, not all False)
- Each statement requires different source combination:
  * Statement 1: Uses Sources 1 + 2
  * Statement 2: Uses Sources 2 + 3
  * Statement 3: Uses all 3 sources

Question Quality (Both Types):
- Not obvious from single source
- Requires careful cross-referencing
- May involve calculations or inferences
- Test understanding of contradictions between sources

**5. MATHEMATICAL VALIDATION**

Pre-Generation:
STEP 1: Create complete data set
STEP 2: Calculate all derived values
STEP 3: Verify cross-source calculations
STEP 4: Check for contradictions
STEP 5: Ensure questions answerable

Calculation Requirements:
- All math must work precisely
- Use realistic business numbers
- Percentages and ratios clean
- Growth rates consistent

**6. VARIETY REQUIREMENTS**

Scenario Types:
- Product launch analysis
- Market expansion decision
- Budget allocation review
- Performance evaluation
- Strategic planning
- Risk assessment
- Operational efficiency

Industries:
- Technology, Finance, Retail
- Healthcare, Manufacturing
- Consulting, Energy, Real Estate

**7. DIFFICULTY CALIBRATION (${difficulty}):**
${difficulty === 'easy' ? `
Easy (500-600 GMAT):
- THE SINGLE QUESTION (in questions array) is straightforward
- Most statements/options answerable with 2 sources
- Minimal conflicting information
- Direct data interpretation (less inference)

Complexity Elements:
✅ Clear source relationships
✅ Straightforward calculations
✅ Obvious data connections
✅ Limited contradictions
✅ Direct comparisons
` : difficulty === 'medium' ? `
Medium (600-700 GMAT):
- THE SINGLE QUESTION (in questions array) requires careful analysis
- No statement/option answerable from 1 source
- Requires comparing/combining data
- Include conflicting information
- Time pressure (2.5 min per question)

Complexity Elements:
✅ Cross-source synthesis
✅ Handling contradictions
✅ Multi-step calculations
✅ Inference required
✅ Time-based comparisons
` : `
Hard (700+ GMAT):
- THE SINGLE QUESTION (in questions array) must use all 3 sources
- If two-column: Statement 1 requires 2 sources, Statement 2 uses all 3 with calculation, Statement 3 includes contradiction
- If multiple choice: Each wrong answer based on single-source reasoning, correct answer requires all 3
- Source 3 contradicts or qualifies Source 1/2

Complexity Elements:
✅ Sources deliberately contradict
✅ Key information buried in Source 3
✅ Must recognize unstated assumptions
✅ Calculation spans all sources
✅ Hidden implications
✅ Requires 3-4 insights
`}

**8. MANDATORY VERIFICATION**

☑ Source 1: 150-200 words?
☑ Source 2: Complete table?
☑ Source 3: 120-150 words?
☑ "questions" array contains EXACTLY 1 question object?
☑ Question format chosen appropriately (multiple choice OR two-column)?
☑ Question requires synthesizing 2+ sources?
☑ Math verified across sources?
☑ Question is answerable from the sources?
☑ Realistic business scenario?

**9. OUTPUT FORMAT**

**IMAGE/CHART OPTION:**
- Source 2 can be chart instead of table (30% of questions)
- If chart: Use image_url with descriptive name
- Chart types: bar, line, pie (matching data complexity)

**RESPONSE FORMAT (JSON only):**

NOTE: The example below shows a two-column question in a "questions" array with one item.
For multiple choice format, use:
"questions": [
  {
    "text": "...",
    "question_type": "multiple_choice",
    "options": {"a": "...", "b": "...", "c": "...", "d": "...", "e": "..."},
    "correct_answer": "a"
  }
]

\`\`\`json
{
  "sources": [
    {
      "tab_name": "Executive Memo",
      "content_type": "text",
      "content": "TO: Board of Directors\\nFROM: Sarah Mitchell, CFO\\nDATE: March 15, 2024\\nSUBJECT: Q1 2024 Performance Review\\n\\nOur Q1 2024 performance shows mixed results across divisions. The Technology division generated $23.4 million in revenue, representing 12.3% growth year-over-year, with a headcount of 234 employees and a healthy margin of 34.5%. Healthcare division contributed $18.7 million with 8.9% growth, employing 187 staff members and achieving a 28.3% margin.\\n\\nThe Finance division, our newest unit, produced $12.5 million in revenue with 15.7% growth, staffed by 123 employees with a 22.1% margin. Combined divisional performance exceeded our internal targets, though market conditions remain challenging with increased competition in the technology sector.\\n\\nWe anticipate continued growth in Q2, particularly in Healthcare and Finance divisions, while Technology faces headwinds from new market entrants. Board approval is sought for expansion plans in the Healthcare division."
    },
    {
      "tab_name": "Financial Data",
      "content_type": "table",
      "table_headers": ["Division", "Revenue ($M)", "Growth %", "Margin %", "Headcount", "Revenue/Employee", "Target Margin %"],
      "table_data": [
        ["Technology", "23.4", "12.3%", "34.5%", "234", "$100,000", "32.0%"],
        ["Healthcare", "18.7", "8.9%", "28.3%", "187", "$100,000", "26.0%"],
        ["Finance", "12.5", "15.7%", "22.1%", "123", "$101,626", "24.0%"],
        ["Retail", "15.2", "6.4%", "18.7%", "156", "$97,436", "20.0%"],
        ["Services", "9.8", "4.2%", "15.3%", "98", "$100,000", "16.0%"]
      ]
    },
    {
      "tab_name": "Market Analysis",
      "content_type": "text",
      "content": "Industry Analysis - Q1 2024\\n\\nMarket conditions have shifted significantly from the executive memo's optimistic outlook. Independent analysis reveals that the technology sector actually grew at 18.7% industry-wide, suggesting our Technology division is underperforming relative to market growth. The 12.3% growth cited represents slower-than-market expansion.\\n\\nConversely, Healthcare sector industry growth averaged only 6.2%, meaning our Healthcare division's 8.9% growth significantly outperformed the market. This contradicts the memo's characterization of Technology as the strongest performer.\\n\\nFinance sector competitors averaged 11.3% growth, indicating our Finance division's 15.7% represents genuine market leadership. Our analysis suggests prioritizing Healthcare expansion may yield better risk-adjusted returns than the memo's Technology focus, given current market dynamics and competitive positioning."
    }
  ],
  "questions": [
    {
      "text": "For each statement, indicate whether it is supported by the information in the three sources.",
      "question_type": "two_column",
      "column1_title": "Supported",
      "column2_title": "Not Supported",
      "statements": [
        "Technology division exceeded its target margin for Q1 2024",
        "All divisions with growth rates above 10% also exceeded revenue-per-employee of $100,000",
        "The executive memo's strategic recommendation aligns with the market analysis findings"
      ],
      "correct_answers": {
        "Technology division exceeded its target margin for Q1 2024": "col1",
        "All divisions with growth rates above 10% also exceeded revenue-per-employee of $100,000": "col2",
        "The executive memo's strategic recommendation aligns with the market analysis findings": "col2"
      }
    }
  ]
}
\`\`\``
    };

    // Add general specifications for all types
    const generalSpecs = `

═══════════════════════════════════════════════════════════
🌍 GENERAL SPECIFICATIONS (ALL QUESTION TYPES)
═══════════════════════════════════════════════════════════

**LANGUAGE REQUIREMENTS:**
- Register: Business formal (professional, academic tone)
- NO contractions: Use "cannot" not "can't", "will not" not "won't"
- NO colloquialisms or idioms: Avoid "in the ballpark", "rule of thumb"
- Voice: Active voice preferred (70% active, 30% passive)
- Tense: Present tense for current states, past tense for historical data
- Example: "The company reports revenue of..." not "The company's reporting revenue of..."

**FORBIDDEN ELEMENTS:**
❌ Personal pronouns (I, you, we, our, your)
❌ Hypothetical scenarios ("Suppose that", "Imagine if", "What if")
❌ Ambiguous terms (several, many, few, some, a lot, various)
❌ Exact duplicates of official GMAT prep material
❌ References to real companies (Google, Apple, Microsoft, Amazon)
❌ Cultural/regional specific knowledge (US holidays, local customs)
❌ Outdated technology references (floppy disks, pagers, dial-up)

**CONTEXT REALISM:**

Business Names to Use:
✅ TechCorp, DataSoft, GlobalTech, Innovate Inc, Apex Solutions
✅ MegaCorp, PrimeData, FutureTech, Synergy Systems, Vertex Group
✅ NexGen Solutions, Quantum Industries, Alpha Dynamics
❌ Do NOT use real company names

Dates/Timeframes:
✅ Fiscal quarters (Q1-Q4 2023, Q2 2024)
✅ Months and years (March 2024, January-June 2023)
✅ Year ranges (2020-2024, FY2023-FY2024)
❌ Avoid specific dates unless timeline-critical (March 15 only if needed)
✅ All dates within 2020-2025 range

Currency:
✅ Default: USD ($) - always specify if using other currency
✅ If EUR/GBP used: State explicitly ("€2,345", "£1,789")
✅ Exchange rates must be realistic: 1 EUR = $1.08-1.12, 1 GBP = $1.25-1.30
✅ Always use commas for thousands: $1,234.56 not $1234.56

**QUALITY CHECKS (CRITICAL):**

Calculation Verification:
☐ Run ALL calculations THREE times to verify accuracy
☐ Check that correct answer is definitively correct
☐ Verify all wrong answers are definitively wrong
☐ For percentages: Verify they sum to 100% where applicable
☐ For ratios: Simplify to lowest terms (3:2 not 6:4)
☐ For currency: Round to cents, never sub-cent ($12.75 not $12.753)

Ambiguity Elimination:
☐ Only ONE answer can be correct (never multiple valid answers)
☐ If two answers seem right, revise question or data
☐ All distractors must be clearly wrong (even if close)
☐ No "partially true" statements (only fully true or fully false)
☐ Avoid "approximately" or "about" in questions (be precise)

Testing Requirements:
☐ Question solvable in 2.0-2.5 minutes (not more, not less)
☐ Required work involves 3-5 steps maximum
☐ No calculator-impossible computations (e.g., cube root of 7-digit number)
☐ Answer must be definitively determinable (no judgment calls)

**COMMON ERRORS TO AVOID:**

NEVER:
❌ Use the same number twice in different contexts within one question
❌ Create questions where partial information gives the answer
❌ Make statements that are "technically true but misleading"
❌ Include irrelevant data that doesn't affect any answer
❌ Use numbers that are too perfect (exactly 50%, exactly 100, etc.)
❌ Create scenarios that require real-world knowledge beyond the given data
❌ Write questions where careful reading doesn't matter

ALWAYS:
✅ Provide ALL information needed to solve the question
✅ Make correct answer provably correct with given data
✅ Ensure wrong answers are wrong for clear, verifiable reasons
✅ Use realistic but non-round numbers (follow number specifications)
✅ Write clear, unambiguous sentences (one interpretation only)

**FINAL VALIDATION BEFORE SUBMITTING:**

Before finalizing your response, verify:
☐ ALL calculations are correct (verified 3 times)
☐ EXACTLY one correct answer exists
☐ ALL required JSON fields are present and correctly formatted
☐ Numbers follow specifications (no round numbers like 10, 20, 50, 100)
☐ Word counts are within specified limits for all text fields
☐ Difficulty matches requested level (medium vs hard)
☐ No forbidden elements present (contractions, pronouns, etc.)
☐ Business names are fictional (not real companies)
☐ Dates are within 2020-2025 range
☐ Language is formal and professional throughout
☐ Question is solvable in 2.0-2.5 minutes
☐ JSON is valid and complete (test with JSON validator if possible)

═══════════════════════════════════════════════════════════
NOW CREATE THE QUESTION FOLLOWING ALL SPECIFICATIONS ABOVE
═══════════════════════════════════════════════════════════`;

    // Combine type-specific prompt with general specifications
    const fullPrompt = (typePrompts[questionType] || typePrompts.DS) + generalSpecs;

    return fullPrompt;
  }

  // Call Claude API via Supabase Edge Function (to avoid CORS) with retry logic
  async callClaudeAPI(prompt, retryCount = 0, maxRetries = 3, statusCallback = null) {
    // Get config values at runtime
    const edgeFunctionUrl = window.AI_CONFIG?.EDGE_FUNCTION_URL || 'https://elrwpaezjnemmiegkyin.supabase.co/functions/v1/claude-proxy';
    const supabaseKey = window.AI_CONFIG?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI';
    const model = window.AI_CONFIG?.MODEL || 'claude-3-5-sonnet-20241022';
    const maxTokens = window.AI_CONFIG?.MAX_TOKENS || 4000;
    const temperature = window.AI_CONFIG?.TEMPERATURE || 0.8;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          model: model,
          max_tokens: maxTokens,
          temperature: temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText;
        throw new Error(`API Error: ${errorMsg}`);
      }

      const data = await response.json();
      return data.content[0].text;

    } catch (error) {
      // Retry logic: retry up to maxRetries times with exponential backoff
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000); // 1s, 2s, 4s, max 8s
        const retryMsg = `⚠️ API error - retrying (${retryCount + 1}/${maxRetries})...`;

        console.warn(`⚠️ API call failed (attempt ${retryCount + 1}/${maxRetries + 1}): ${error.message}`);
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);

        // Update UI if callback provided
        if (statusCallback) {
          statusCallback(retryMsg);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Recursive retry
        return this.callClaudeAPI(prompt, retryCount + 1, maxRetries, statusCallback);
      }

      // All retries exhausted
      console.error(`❌ API call failed after ${maxRetries + 1} attempts`);
      throw error;
    }
  }

  // Parse Claude's response and extract JSON
  parseResponse(response, questionType) {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response;

    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // No markdown blocks - try to extract JSON object directly
      // Find first { and last matching }
      const firstBrace = response.indexOf('{');
      if (firstBrace !== -1) {
        let depth = 0;
        let lastBrace = -1;
        for (let i = firstBrace; i < response.length; i++) {
          if (response[i] === '{') depth++;
          if (response[i] === '}') {
            depth--;
            if (depth === 0) {
              lastBrace = i;
              break;
            }
          }
        }
        if (lastBrace !== -1) {
          jsonText = response.substring(firstBrace, lastBrace + 1);
        }
      }
    }

    try {
      const parsed = JSON.parse(jsonText.trim());

      // Fix MSR format: convert old "question" (singular) to "questions" (array) if needed
      if (questionType === 'MSR' && parsed.question && !parsed.questions) {
        console.warn('⚠️ Converting old MSR format (singular "question") to new format (array "questions")');
        parsed.questions = [parsed.question];
        delete parsed.question;
      }

      return parsed;
    } catch (error) {
      console.warn('Initial JSON parse failed, attempting repair...', error.message);

      // Attempt to repair common JSON errors
      let repairedJson = jsonText.trim();

      // Fix 1: Add missing commas before property names (common AI error)
      // Pattern: ]\s*"\w+" should be ],\s*"\w+"
      repairedJson = repairedJson.replace(/\]\s*\n\s*"/g, '],\n  "');

      // Fix 2: Add missing commas after closing braces of objects
      repairedJson = repairedJson.replace(/\}\s*\n\s*"/g, '},\n  "');

      // Fix 3: Add missing commas after string values
      repairedJson = repairedJson.replace(/"\s*\n\s*"/g, '",\n  "');

      try {
        const parsed = JSON.parse(repairedJson);
        console.log('✅ JSON repair successful!');

        // Fix MSR format: convert old "question" (singular) to "questions" (array) if needed
        if (questionType === 'MSR' && parsed.question && !parsed.questions) {
          console.warn('⚠️ Converting old MSR format (singular "question") to new format (array "questions")');
          parsed.questions = [parsed.question];
          delete parsed.question;
        }

        return parsed;
      } catch (repairError) {
        console.error('Failed to parse JSON even after repair:', repairedJson);
        throw new Error('Failed to parse AI response as JSON: ' + repairError.message);
      }
    }
  }

  // Create UI for AI generation
  createGenerateButton(questionType, onGenerate) {
    const container = document.createElement('div');
    container.className = 'ai-generate-container';
    container.style.cssText = `
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    `;

    container.innerHTML = `
      <div style="color: white; margin-bottom: 1rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600;">
          🤖 AI Question Generator
        </h3>
        <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
          Let Claude create a professional ${this.getTypeName(questionType)} question for you
        </p>
      </div>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <div style="flex: 1;">
          <label style="display: block; color: white; font-size: 0.85rem; margin-bottom: 0.5rem; font-weight: 500;">
            Difficulty Level:
          </label>
          <select id="ai-difficulty-select" style="
            width: 100%;
            padding: 0.6rem;
            border: none;
            border-radius: 6px;
            font-size: 0.95rem;
            background: white;
            color: #374151;
            cursor: pointer;
            font-weight: 500;
          ">
            <option value="medium">📊 Medium (600-700 GMAT)</option>
            <option value="hard">🔥 Hard (700+ GMAT)</option>
          </select>
        </div>

        <button id="ai-generate-btn" style="
          padding: 0.75rem 2rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          white-space: nowrap;
          margin-top: 1.5rem;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';">
          ✨ Generate Question
        </button>
      </div>

      <div id="ai-status" style="
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(255,255,255,0.2);
        border-radius: 6px;
        color: white;
        font-size: 0.9rem;
        display: none;
      "></div>
    `;

    const generateBtn = container.querySelector('#ai-generate-btn');
    const difficultySelect = container.querySelector('#ai-difficulty-select');
    const statusDiv = container.querySelector('#ai-status');

    // Recursive generation function - regenerates on rejection
    const generateAndReview = async (difficulty) => {
      generateBtn.disabled = true;
      generateBtn.textContent = '⏳ Generating...';
      statusDiv.style.display = 'block';
      statusDiv.textContent = '🤖 Claude is creating your question...';

      try {
        const questionData = await this.generateQuestion(questionType, difficulty);
        statusDiv.textContent = '✅ Question generated! Opening review...';
        statusDiv.style.background = 'rgba(16, 185, 129, 0.3)';

        // Show review modal before populating form
        setTimeout(() => {
          if (window.AIReviewSystem) {
            window.AIReviewSystem.showReviewModal(
              questionType,
              difficulty,
              questionData,
              (approvedData) => {
                // Approved - populate form
                onGenerate(approvedData);
                statusDiv.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.textContent = '✨ Generate Question';
              },
              async () => {
                // Rejected - automatically regenerate
                statusDiv.textContent = '🔄 Rejected. Generating new question...';
                statusDiv.style.background = 'rgba(245, 158, 11, 0.3)';

                // Wait 1 second, then regenerate
                await new Promise(resolve => setTimeout(resolve, 1000));
                await generateAndReview(difficulty); // Recursive call
              }
            );
          } else {
            // Fallback if review system not loaded
            onGenerate(questionData);
            statusDiv.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate Question';
          }
        }, 500);
      } catch (error) {
        statusDiv.textContent = `❌ Error: ${error.message}`;
        statusDiv.style.background = 'rgba(239, 68, 68, 0.3)';
        console.error('Generation error:', error);
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate Question';
      }
    };

    generateBtn.addEventListener('click', () => {
      const difficulty = difficultySelect.value;
      generateAndReview(difficulty);
    });

    return container;
  }

  getTypeName(type) {
    const names = {
      DS: 'Data Sufficiency',
      GI: 'Graphics Interpretation',
      TA: 'Table Analysis',
      TPA: 'Two-Part Analysis',
      MSR: 'Multi-Source Reasoning'
    };
    return names[type] || type;
  }

  // Create batch generation modal
  showBatchGeneratorModal() {
    const overlay = document.createElement('div');
    overlay.className = 'batch-generator-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 30000;
      animation: fadeIn 0.2s;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 700px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    const questionTypesList = [];

    const renderQuestionTypesList = () => {
      const listHtml = questionTypesList.map((type, i) => `
        <div style="display: flex; gap: 1rem; align-items: center; padding: 0.75rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.5rem;">
          <span style="font-weight: 600; color: #374151; min-width: 80px;">Question ${i + 1}:</span>
          <select class="question-type-select" data-index="${i}" style="flex: 1; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.9rem;">
            <option value="DS" ${type === 'DS' ? 'selected' : ''}>📊 Data Sufficiency</option>
            <option value="GI" ${type === 'GI' ? 'selected' : ''}>📈 Graphics Interpretation</option>
            <option value="TA" ${type === 'TA' ? 'selected' : ''}>📋 Table Analysis</option>
            <option value="TPA" ${type === 'TPA' ? 'selected' : ''}>🔄 Two-Part Analysis</option>
            <option value="MSR" ${type === 'MSR' ? 'selected' : ''}>📑 Multi-Source Reasoning</option>
          </select>
        </div>
      `).join('');
      return listHtml;
    };

    const updateQuestionsList = () => {
      const container = modal.querySelector('#questions-types-list');
      if (container) {
        container.innerHTML = renderQuestionTypesList();

        // Add event listeners to dropdowns
        modal.querySelectorAll('.question-type-select').forEach(select => {
          select.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            questionTypesList[index] = e.target.value;
          });
        });
      }
    };

    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎯</div>
        <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
          Mixed Batch Generator
        </h2>
        <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
          Specify how many questions of each type to generate
        </p>
      </div>

      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 1rem; font-weight: 700; color: #374151; font-size: 1.1rem;">
          📊 Specify Quantities by Difficulty:
        </label>

        <!-- Easy Difficulty Section -->
        <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; border: 2px solid #10b981;">
          <h3 style="margin: 0 0 1rem 0; color: #065f46; font-size: 1rem; font-weight: 700;">
            🟢 Easy (500-600 GMAT)
          </h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #065f46; margin-bottom: 0.25rem;">📊 DS</label>
              <input type="number" class="qty-input" data-difficulty="easy" data-type="DS" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #10b981; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #065f46; margin-bottom: 0.25rem;">📈 GI</label>
              <input type="number" class="qty-input" data-difficulty="easy" data-type="GI" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #10b981; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #065f46; margin-bottom: 0.25rem;">📋 TA</label>
              <input type="number" class="qty-input" data-difficulty="easy" data-type="TA" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #10b981; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #065f46; margin-bottom: 0.25rem;">🔄 TPA</label>
              <input type="number" class="qty-input" data-difficulty="easy" data-type="TPA" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #10b981; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #065f46; margin-bottom: 0.25rem;">📑 MSR</label>
              <input type="number" class="qty-input" data-difficulty="easy" data-type="MSR" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #10b981; border-radius: 6px; font-size: 0.9rem;">
            </div>
          </div>
        </div>

        <!-- Medium Difficulty Section -->
        <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 12px; border: 2px solid #3b82f6;">
          <h3 style="margin: 0 0 1rem 0; color: #1e40af; font-size: 1rem; font-weight: 700;">
            🔵 Medium (600-700 GMAT)
          </h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #1e40af; margin-bottom: 0.25rem;">📊 DS</label>
              <input type="number" class="qty-input" data-difficulty="medium" data-type="DS" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #3b82f6; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #1e40af; margin-bottom: 0.25rem;">📈 GI</label>
              <input type="number" class="qty-input" data-difficulty="medium" data-type="GI" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #3b82f6; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #1e40af; margin-bottom: 0.25rem;">📋 TA</label>
              <input type="number" class="qty-input" data-difficulty="medium" data-type="TA" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #3b82f6; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #1e40af; margin-bottom: 0.25rem;">🔄 TPA</label>
              <input type="number" class="qty-input" data-difficulty="medium" data-type="TPA" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #3b82f6; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #1e40af; margin-bottom: 0.25rem;">📑 MSR</label>
              <input type="number" class="qty-input" data-difficulty="medium" data-type="MSR" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #3b82f6; border-radius: 6px; font-size: 0.9rem;">
            </div>
          </div>
        </div>

        <!-- Hard Difficulty Section -->
        <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #fee2e2, #fecaca); border-radius: 12px; border: 2px solid #ef4444;">
          <h3 style="margin: 0 0 1rem 0; color: #991b1b; font-size: 1rem; font-weight: 700;">
            🔴 Hard (700+ GMAT)
          </h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; color: #991b1b; margin-bottom: 0.25rem;">📊 DS</label>
              <input type="number" class="qty-input" data-difficulty="hard" data-type="DS" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #ef4444; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #991b1b; margin-bottom: 0.25rem;">📈 GI</label>
              <input type="number" class="qty-input" data-difficulty="hard" data-type="GI" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #ef4444; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #991b1b; margin-bottom: 0.25rem;">📋 TA</label>
              <input type="number" class="qty-input" data-difficulty="hard" data-type="TA" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #ef4444; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #991b1b; margin-bottom: 0.25rem;">🔄 TPA</label>
              <input type="number" class="qty-input" data-difficulty="hard" data-type="TPA" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #ef4444; border-radius: 6px; font-size: 0.9rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; color: #991b1b; margin-bottom: 0.25rem;">📑 MSR</label>
              <input type="number" class="qty-input" data-difficulty="hard" data-type="MSR" value="0" min="0" max="10" style="width: 100%; padding: 0.5rem; border: 1px solid #ef4444; border-radius: 6px; font-size: 0.9rem;">
            </div>
          </div>
        </div>

        <div style="padding: 1.25rem; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; border: 2px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0; color: #1e40af; font-size: 1rem; font-weight: 700;">
                📊 Total Questions: <span id="total-questions-count">0</span>
              </p>
              <p style="margin: 0.25rem 0 0 0; color: #1e40af; font-size: 0.85rem;">
                Maximum: 30 questions per batch
              </p>
            </div>
            <div id="total-warning" style="display: none; color: #dc2626; font-weight: 600; font-size: 0.9rem;">
              ⚠️ Exceeds maximum!
            </div>
          </div>
        </div>
      </div>

      <div id="batch-progress-container" style="display: none; margin-bottom: 1.5rem;">
        <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: #374151;" id="batch-progress-text">Generating questions...</span>
          <span style="font-weight: 600; color: #667eea;" id="batch-progress-percent">0%</span>
        </div>
        <div style="background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden;">
          <div id="batch-progress-bar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; transition: width 0.3s;"></div>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #6b7280;" id="batch-status-text"></p>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="batch-cancel-btn" style="
          padding: 0.875rem 2rem;
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
        ">
          Cancel
        </button>
        <button id="batch-start-btn" style="
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
        ">
          🚀 Start Generating
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cancelBtn = modal.querySelector('#batch-cancel-btn');
    const startBtn = modal.querySelector('#batch-start-btn');
    const totalCount = modal.querySelector('#total-questions-count');
    const totalWarning = modal.querySelector('#total-warning');

    // Get all quantity inputs
    const qtyInputs = modal.querySelectorAll('.qty-input');

    // Update total count when any quantity changes
    const updateTotalCount = () => {
      let total = 0;
      qtyInputs.forEach(input => {
        total += parseInt(input.value || 0);
      });
      totalCount.textContent = total;

      if (total > 30) {
        totalCount.style.color = '#dc2626';
        totalWarning.style.display = 'block';
      } else {
        totalCount.style.color = '#1e40af';
        totalWarning.style.display = 'none';
      }
    };

    qtyInputs.forEach(input => {
      input.addEventListener('input', updateTotalCount);
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    startBtn.addEventListener('click', async () => {
      // Build question types list with difficulty from all inputs
      const questionsConfig = [];
      qtyInputs.forEach(input => {
        const difficulty = input.dataset.difficulty;
        const type = input.dataset.type;
        const qty = parseInt(input.value || 0);

        for (let i = 0; i < qty; i++) {
          questionsConfig.push({ type, difficulty });
        }
      });

      if (questionsConfig.length === 0) {
        alert('Please specify at least one question to generate!');
        return;
      }

      if (questionsConfig.length > 30) {
        alert('Maximum 30 questions per batch. Please reduce the quantities.');
        return;
      }

      await this.startMixedBatchGeneration(overlay, modal, questionsConfig);
    });
  }

  // Mixed batch generation logic with progress tracking
  async startMixedBatchGeneration(overlay, modal, questionsConfig) {
    const progressContainer = modal.querySelector('#batch-progress-container');
    const progressBar = modal.querySelector('#batch-progress-bar');
    const progressPercent = modal.querySelector('#batch-progress-percent');
    const progressText = modal.querySelector('#batch-progress-text');
    const statusText = modal.querySelector('#batch-status-text');
    const startBtn = modal.querySelector('#batch-start-btn');
    const cancelBtn = modal.querySelector('#batch-cancel-btn');

    // Disable inputs
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';

    // Disable all quantity inputs
    modal.querySelectorAll('.qty-input').forEach(input => {
      input.disabled = true;
    });

    progressContainer.style.display = 'block';

    const generatedQuestions = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < questionsConfig.length; i++) {
      const { type, difficulty } = questionsConfig[i];
      const currentNum = i + 1;
      const percent = Math.round((currentNum / questionsConfig.length) * 100);

      progressText.textContent = `Generating question ${currentNum} of ${questionsConfig.length}...`;
      progressPercent.textContent = `${percent}%`;
      progressBar.style.width = `${percent}%`;
      statusText.textContent = `✨ ${this.getTypeName(type)} - ${difficulty.toUpperCase()} difficulty`;

      try {
        const questionData = await this.generateQuestion(type, difficulty, (retryMsg) => {
          statusText.textContent = retryMsg;
        });
        generatedQuestions.push({
          type: type,
          difficulty: difficulty,
          data: questionData,
          approved: null,
          rating: 0,
          feedback: '',
          chatHistory: []
        });
        successCount++;
        statusText.textContent = `✅ Question ${currentNum} generated successfully!`;
      } catch (error) {
        console.error(`Failed to generate question ${currentNum}:`, error);
        failCount++;
        statusText.textContent = `❌ Question ${currentNum} failed. Continuing...`;
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    }

    progressText.textContent = 'Generation complete!';
    progressPercent.textContent = '100%';
    progressBar.style.width = '100%';
    statusText.textContent = `✅ ${successCount} questions generated, ${failCount} failed`;

    // Wait a moment, then show batch review
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.body.removeChild(overlay);

    if (generatedQuestions.length > 0) {
      this.showBatchReviewModal(generatedQuestions);
    } else {
      alert('❌ Failed to generate any questions. Please try again.');
    }
  }

  // Batch generation logic with progress tracking (single type)
  async startBatchGeneration(overlay, modal, questionType, difficulty, quantity) {
    const progressContainer = modal.querySelector('#batch-progress-container');
    const progressBar = modal.querySelector('#batch-progress-bar');
    const progressPercent = modal.querySelector('#batch-progress-percent');
    const progressText = modal.querySelector('#batch-progress-text');
    const statusText = modal.querySelector('#batch-status-text');
    const startBtn = modal.querySelector('#batch-start-btn');
    const cancelBtn = modal.querySelector('#batch-cancel-btn');

    // Disable inputs
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';
    modal.querySelector('#batch-type-select').disabled = true;
    modal.querySelector('#batch-difficulty-select').disabled = true;
    modal.querySelector('#batch-quantity-input').disabled = true;

    progressContainer.style.display = 'block';

    const generatedQuestions = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < quantity; i++) {
      const currentNum = i + 1;
      const percent = Math.round((currentNum / quantity) * 100);

      progressText.textContent = `Generating question ${currentNum} of ${quantity}...`;
      progressPercent.textContent = `${percent}%`;
      progressBar.style.width = `${percent}%`;
      statusText.textContent = `✨ ${this.getTypeName(questionType)} - ${difficulty} difficulty`;

      try {
        const questionData = await this.generateQuestion(questionType, difficulty, (retryMsg) => {
          statusText.textContent = retryMsg;
        });
        generatedQuestions.push({
          type: questionType,
          difficulty: difficulty,
          data: questionData,
          approved: null,
          rating: 0,
          feedback: '',
          chatHistory: []
        });
        successCount++;
        statusText.textContent = `✅ Question ${currentNum} generated successfully!`;
      } catch (error) {
        console.error(`Failed to generate question ${currentNum}:`, error);
        failCount++;
        statusText.textContent = `❌ Question ${currentNum} failed. Continuing...`;
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    }

    progressText.textContent = 'Generation complete!';
    progressPercent.textContent = '100%';
    progressBar.style.width = '100%';
    statusText.textContent = `✅ ${successCount} questions generated, ${failCount} failed`;

    // Wait a moment, then show batch review
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.body.removeChild(overlay);

    if (generatedQuestions.length > 0) {
      this.showBatchReviewModal(generatedQuestions);
    } else {
      alert('❌ Failed to generate any questions. Please try again.');
    }
  }

  // Batch review modal
  showBatchReviewModal(questions) {
    const overlay = document.createElement('div');
    overlay.className = 'batch-review-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 30000;
      animation: fadeIn 0.2s;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      max-width: 1200px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    let currentQuestionIndex = 0;

    const renderQuestionsList = () => {
      const questionsListHtml = questions.map((q, i) => {
        const statusIcon = q.approved === true ? '✅' : q.approved === false ? '❌' : '⏺️';
        const statusColor = q.approved === true ? '#10b981' : q.approved === false ? '#ef4444' : '#6b7280';
        const stars = '⭐'.repeat(q.rating);

        return `
          <div onclick="window.batchReviewSelectQuestion(${i})" style="
            padding: 1rem;
            background: ${i === currentQuestionIndex ? '#eff6ff' : 'white'};
            border: 2px solid ${i === currentQuestionIndex ? '#3b82f6' : '#e5e7eb'};
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 0.5rem;
            transition: all 0.2s;
          " onmouseover="if(${i} !== ${currentQuestionIndex}) this.style.background='#f9fafb'"
             onmouseout="if(${i} !== ${currentQuestionIndex}) this.style.background='white'">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 600; color: #374151;">Question ${i + 1}</span>
                <span style="margin-left: 0.5rem; font-size: 0.85rem; color: #6b7280;">${this.getTypeName(q.type)} - ${q.difficulty}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.85rem;">${stars || 'No rating'}</span>
                <span style="font-size: 1.25rem; color: ${statusColor};">${statusIcon}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return questionsListHtml;
    };

    const renderCurrentQuestion = () => {
      const q = questions[currentQuestionIndex];
      return window.AIReviewSystem.renderQuestionPreview(q.type, q.data);
    };

    const updateModal = () => {
      const questionsListContainer = modal.querySelector('#questions-list-container');
      const currentQuestionContainer = modal.querySelector('#current-question-container');
      const ratingStars = modal.querySelectorAll('#batch-rating span');
      const approveBtn = modal.querySelector('#batch-approve-btn');
      const rejectBtn = modal.querySelector('#batch-reject-btn');
      const feedbackText = modal.querySelector('#batch-feedback-text');
      const aiChatHistory = modal.querySelector('#ai-chat-history');
      const aiChatInput = modal.querySelector('#ai-chat-input');

      questionsListContainer.innerHTML = renderQuestionsList();
      currentQuestionContainer.innerHTML = renderCurrentQuestion();

      const currentQuestion = questions[currentQuestionIndex];

      // Update star rating
      ratingStars.forEach((star, i) => {
        star.style.color = i < currentQuestion.rating ? '#f59e0b' : '#d1d5db';
      });

      // Update feedback textarea
      feedbackText.value = currentQuestion.feedback || '';

      // Update chat history
      aiChatInput.value = '';
      if (currentQuestion.chatHistory && currentQuestion.chatHistory.length > 0) {
        aiChatHistory.style.display = 'block';
        aiChatHistory.innerHTML = currentQuestion.chatHistory.map(msg => {
          const isUser = msg.role === 'user';
          const bgColor = isUser ? '#f3f4f6' : (msg.message.includes('Error') || msg.message.includes('Failed') ? '#fee2e2' : '#d1fae5');
          const textColor = isUser ? '#374151' : (msg.message.includes('Error') || msg.message.includes('Failed') ? '#7f1d1d' : '#374151');
          const labelColor = isUser ? '#1e40af' : (msg.message.includes('Error') || msg.message.includes('Failed') ? '#dc2626' : '#059669');
          const label = isUser ? 'You:' : '🤖 AI:';

          return `
            <div style="margin-bottom: 0.5rem;">
              <div style="font-weight: 600; color: ${labelColor}; font-size: 0.85rem;">${label}</div>
              <div style="color: ${textColor}; font-size: 0.9rem; padding: 0.5rem; background: ${bgColor}; border-radius: 6px; margin-top: 0.25rem;">
                ${msg.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </div>
            </div>
          `;
        }).join('');
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
      } else {
        aiChatHistory.style.display = 'none';
        aiChatHistory.innerHTML = '';
      }

      // Update approve/reject button states
      if (currentQuestion.approved === true) {
        approveBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        approveBtn.style.opacity = '1';
        rejectBtn.style.background = '#f3f4f6';
        rejectBtn.style.color = '#6b7280';
      } else if (currentQuestion.approved === false) {
        rejectBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        rejectBtn.style.opacity = '1';
        approveBtn.style.background = '#f3f4f6';
        approveBtn.style.color = '#6b7280';
      } else {
        approveBtn.style.background = '#f3f4f6';
        approveBtn.style.color = '#6b7280';
        rejectBtn.style.background = '#f3f4f6';
        rejectBtn.style.color = '#6b7280';
      }

      // Render chart if GI question
      if (currentQuestion.type === 'GI' && currentQuestion.data.chart_config) {
        setTimeout(() => {
          if (window.AIReviewSystem && window.AIReviewSystem.renderChartInReview) {
            window.AIReviewSystem.renderChartInReview(currentQuestion.data.chart_config);
          }
        }, 100);
      }
    };

    window.batchReviewSelectQuestion = (index) => {
      currentQuestionIndex = index;
      updateModal();
    };

    const approvedCount = () => questions.filter(q => q.approved === true).length;

    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📝</div>
        <h2 style="margin: 0; color: #1f2937; font-size: 1.75rem; font-weight: 700;">
          Batch Review - ${questions.length} Questions
        </h2>
        <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.95rem;">
          Review and approve questions before saving or exporting to PDF
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Questions List -->
        <div>
          <h3 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; font-weight: 600;">Questions</h3>
          <div id="questions-list-container"></div>
        </div>

        <!-- Current Question Preview -->
        <div>
          <h3 style="margin: 0 0 1rem 0; color: #374151; font-size: 1.1rem; font-weight: 600;">Preview</h3>
          <div id="current-question-container" style="
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border-radius: 12px;
            padding: 2rem;
            min-height: 400px;
            max-height: 500px;
            overflow-y: auto;
          "></div>

          <!-- Rating & Actions -->
          <div style="margin-top: 1.5rem; padding: 1.5rem; background: #f9fafb; border-radius: 12px;">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">
                Rate Quality:
              </label>
              <div id="batch-rating" style="display: flex; gap: 0.5rem; font-size: 2rem; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `<span data-rating="${i}" style="color: #d1d5db; transition: color 0.2s;">⭐</span>`).join('')}
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">
                Feedback / Comments (Optional):
              </label>
              <textarea id="batch-feedback-text" rows="3" style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.95rem;
                resize: vertical;
              " placeholder="What needs improvement? What was wrong? (helps AI learn)"></textarea>
            </div>

            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
              <button id="batch-reject-btn" style="
                flex: 1;
                padding: 0.875rem;
                background: #f3f4f6;
                color: #6b7280;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
              ">
                ❌ Reject
              </button>
              <button id="batch-approve-btn" style="
                flex: 1;
                padding: 0.875rem;
                background: #f3f4f6;
                color: #6b7280;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
              ">
                ✅ Approve
              </button>
            </div>

            <!-- AI Chat for Smart Regeneration -->
            <div style="margin-bottom: 1rem; padding: 1rem; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 10px; border: 2px solid #3b82f6;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.25rem;">🤖</span>
                <label style="font-weight: 700; color: #1e40af; margin: 0;">
                  AI Assistant - Smart Regeneration
                </label>
              </div>
              <p style="margin: 0 0 0.75rem 0; color: #1e40af; font-size: 0.85rem; line-height: 1.4;">
                Tell the AI what's wrong or what to improve. It will regenerate the question based on your instructions.
              </p>

              <!-- Chat History -->
              <div id="ai-chat-history" style="
                max-height: 150px;
                overflow-y: auto;
                margin-bottom: 0.75rem;
                padding: 0.75rem;
                background: white;
                border-radius: 8px;
                display: none;
              "></div>

              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="ai-chat-input" placeholder="e.g., 'Answer is too obvious' or 'Make it harder' or 'Fix calculation error'" style="
                  flex: 1;
                  padding: 0.75rem;
                  border: 2px solid #3b82f6;
                  border-radius: 8px;
                  font-size: 0.95rem;
                " />
                <button id="ai-chat-send-btn" style="
                  padding: 0.75rem 1.5rem;
                  background: linear-gradient(135deg, #3b82f6, #2563eb);
                  color: white;
                  border: none;
                  border-radius: 8px;
                  font-weight: 700;
                  cursor: pointer;
                  white-space: nowrap;
                  transition: all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'"
                   onmouseout="this.style.transform='translateY(0)'">
                  🚀 Generate
                </button>
              </div>
            </div>

            <button id="batch-regenerate-btn" style="
              width: 100%;
              padding: 0.875rem;
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: white;
              border: none;
              border-radius: 10px;
              font-weight: 700;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.2s;
            ">
              🔄 Quick Regenerate (Same Difficulty)
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 1.5rem; display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-weight: 600; color: #374151;" id="approved-count-text">
            Approved: <span style="color: #10b981;">0</span> / ${questions.length}
          </span>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button id="batch-close-btn" style="
            padding: 0.875rem 2rem;
            background: white;
            color: #374151;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
          ">
            Close
          </button>
          <button id="batch-export-pdf-btn" style="
            padding: 0.875rem 2rem;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
          ">
            📄 Export to PDF
          </button>
          <button id="batch-save-approved-btn" style="
            padding: 0.875rem 2rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
          ">
            💾 Save Approved Questions
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Initial render
    updateModal();

    // Event listeners
    const ratingStars = modal.querySelectorAll('#batch-rating span');
    ratingStars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        questions[currentQuestionIndex].rating = rating;
        updateModal();
      });
    });

    const approveBtn = modal.querySelector('#batch-approve-btn');
    const rejectBtn = modal.querySelector('#batch-reject-btn');
    const regenerateBtn = modal.querySelector('#batch-regenerate-btn');
    const feedbackText = modal.querySelector('#batch-feedback-text');
    const aiChatInput = modal.querySelector('#ai-chat-input');
    const aiChatSendBtn = modal.querySelector('#ai-chat-send-btn');
    const aiChatHistory = modal.querySelector('#ai-chat-history');

    // Initialize chat history for each question
    if (!questions[currentQuestionIndex].chatHistory) {
      questions[currentQuestionIndex].chatHistory = [];
    }

    // Feedback textarea listener
    feedbackText.addEventListener('input', () => {
      questions[currentQuestionIndex].feedback = feedbackText.value;
    });

    approveBtn.addEventListener('click', () => {
      questions[currentQuestionIndex].approved = true;
      updateModal();
      modal.querySelector('#approved-count-text').innerHTML =
        `Approved: <span style="color: #10b981;">${approvedCount()}</span> / ${questions.length}`;
    });

    rejectBtn.addEventListener('click', () => {
      questions[currentQuestionIndex].approved = false;
      updateModal();
      modal.querySelector('#approved-count-text').innerHTML =
        `Approved: <span style="color: #10b981;">${approvedCount()}</span> / ${questions.length}`;
    });

    regenerateBtn.addEventListener('click', async () => {
      const currentQ = questions[currentQuestionIndex];

      if (!confirm(`Regenerate this ${this.getTypeName(currentQ.type)} question?\n\nThis will replace the current question with a new one at ${currentQ.difficulty} difficulty.`)) {
        return;
      }

      regenerateBtn.disabled = true;
      regenerateBtn.textContent = '⏳ Regenerating...';
      regenerateBtn.style.opacity = '0.5';

      try {
        const newQuestionData = await this.generateQuestion(currentQ.type, currentQ.difficulty);

        // Replace question data, keep rating and approval status reset
        questions[currentQuestionIndex] = {
          type: currentQ.type,
          difficulty: currentQ.difficulty,
          data: newQuestionData,
          approved: null,
          rating: 0,
          feedback: '',
          chatHistory: currentQ.chatHistory || []
        };

        updateModal();
        alert('✅ Question regenerated successfully!');
      } catch (error) {
        console.error('Failed to regenerate question:', error);
        alert('❌ Failed to regenerate question. Please try again.');
      } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.textContent = '🔄 Quick Regenerate (Same Difficulty)';
        regenerateBtn.style.opacity = '1';
      }
    });

    // AI Chat regeneration with instructions
    const handleAIChatRegeneration = async () => {
      const userMessage = aiChatInput.value.trim();

      if (!userMessage) {
        alert('⚠️ Please enter instructions for the AI');
        return;
      }

      const currentQ = questions[currentQuestionIndex];

      // Add user message to chat history
      if (!currentQ.chatHistory) {
        currentQ.chatHistory = [];
      }
      currentQ.chatHistory.push({
        role: 'user',
        message: userMessage,
        timestamp: new Date().toISOString()
      });

      // Update chat history display
      aiChatHistory.style.display = 'block';
      aiChatHistory.innerHTML += `
        <div style="margin-bottom: 0.5rem;">
          <div style="font-weight: 600; color: #1e40af; font-size: 0.85rem;">You:</div>
          <div style="color: #374151; font-size: 0.9rem; padding: 0.5rem; background: #f3f4f6; border-radius: 6px; margin-top: 0.25rem;">
            ${userMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
        </div>
      `;
      aiChatHistory.scrollTop = aiChatHistory.scrollHeight;

      // Clear input and disable button
      aiChatInput.value = '';
      aiChatSendBtn.disabled = true;
      aiChatSendBtn.textContent = '⏳ Generating...';
      aiChatSendBtn.style.opacity = '0.5';

      try {
        // Generate new question with AI instructions
        const newQuestionData = await this.generateQuestionWithInstructions(
          currentQ.type,
          currentQ.difficulty,
          userMessage,
          currentQ.data
        );

        // Add AI response to chat history
        currentQ.chatHistory.push({
          role: 'ai',
          message: 'Question regenerated based on your instructions',
          timestamp: new Date().toISOString()
        });

        aiChatHistory.innerHTML += `
          <div style="margin-bottom: 0.5rem;">
            <div style="font-weight: 600; color: #059669; font-size: 0.85rem;">🤖 AI:</div>
            <div style="color: #374151; font-size: 0.9rem; padding: 0.5rem; background: #d1fae5; border-radius: 6px; margin-top: 0.25rem;">
              ✅ Question regenerated based on your instructions!
            </div>
          </div>
        `;
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;

        // Replace question data
        questions[currentQuestionIndex] = {
          type: currentQ.type,
          difficulty: currentQ.difficulty,
          data: newQuestionData,
          approved: null,
          rating: 0,
          feedback: currentQ.feedback || '',
          chatHistory: currentQ.chatHistory
        };

        updateModal();
      } catch (error) {
        console.error('Failed to regenerate with AI instructions:', error);

        currentQ.chatHistory.push({
          role: 'ai',
          message: 'Error: ' + error.message,
          timestamp: new Date().toISOString()
        });

        aiChatHistory.innerHTML += `
          <div style="margin-bottom: 0.5rem;">
            <div style="font-weight: 600; color: #dc2626; font-size: 0.85rem;">🤖 AI:</div>
            <div style="color: #7f1d1d; font-size: 0.9rem; padding: 0.5rem; background: #fee2e2; border-radius: 6px; margin-top: 0.25rem;">
              ❌ Failed to regenerate. ${error.message}
            </div>
          </div>
        `;
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
      } finally {
        aiChatSendBtn.disabled = false;
        aiChatSendBtn.textContent = '🚀 Generate';
        aiChatSendBtn.style.opacity = '1';
      }
    };

    aiChatSendBtn.addEventListener('click', handleAIChatRegeneration);

    aiChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAIChatRegeneration();
      }
    });

    modal.querySelector('#batch-close-btn').addEventListener('click', () => {
      delete window.batchReviewSelectQuestion;
      document.body.removeChild(overlay);
    });

    modal.querySelector('#batch-export-pdf-btn').addEventListener('click', () => {
      this.exportBatchToPDF(questions);
    });

    modal.querySelector('#batch-save-approved-btn').addEventListener('click', async () => {
      const approved = questions.filter(q => q.approved === true);
      if (approved.length === 0) {
        alert('No questions approved! Please approve at least one question.');
        return;
      }

      const saveBtn = modal.querySelector('#batch-save-approved-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = '⏳ Saving...';
      saveBtn.style.opacity = '0.5';

      try {
        await this.saveApprovedQuestionsToDatabase(approved);
        alert(`✅ Successfully saved ${approved.length} approved questions to database!`);
        delete window.batchReviewSelectQuestion;
        document.body.removeChild(overlay);
      } catch (error) {
        console.error('Error saving questions:', error);
        alert('❌ Error saving questions. Check console for details.');
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save Approved Questions';
        saveBtn.style.opacity = '1';
      }
    });
  }

  // Export batch to PDF
  async exportBatchToPDF(questions) {
    if (typeof jspdf === 'undefined') {
      alert('⚠️ jsPDF library not loaded. Please refresh the page.');
      return;
    }

    if (typeof html2canvas === 'undefined') {
      alert('⚠️ html2canvas library not loaded. Please refresh the page.');
      return;
    }

    // Show progress alert
    const progressDiv = document.createElement('div');
    progressDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
      z-index: 99999;
      text-align: center;
    `;
    progressDiv.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
      <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.5rem;">Generating PDF...</h3>
      <p id="pdf-progress-text" style="color: #6b7280; font-size: 1rem;">Processing question 0 of ${questions.length}</p>
    `;
    document.body.appendChild(progressDiv);

    try {
      const { jsPDF } = jspdf;
      const doc = new jsPDF();

      // Title page
      doc.setFontSize(24);
      doc.text('GMAT Data Insights Questions', 105, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
      doc.text(`Total Questions: ${questions.length}`, 105, 55, { align: 'center' });
      const approvedCount = questions.filter(q => q.approved === true).length;
      const rejectedCount = questions.filter(q => q.approved === false).length;
      doc.text(`Approved: ${approvedCount} | Rejected: ${rejectedCount} | Pending: ${questions.length - approvedCount - rejectedCount}`, 105, 65, { align: 'center' });

      // Create temporary container for rendering questions
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        padding: 2rem;
      `;
      document.body.appendChild(tempContainer);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const progressText = document.getElementById('pdf-progress-text');
        if (progressText) {
          progressText.textContent = `Processing question ${i + 1} of ${questions.length}`;
        }

        try {
          doc.addPage();

          // Validate question data
          if (!q || !q.type || !q.data) {
            console.error(`Invalid question data at index ${i}:`, q);
            errorCount++;
            continue;
          }

          // Validate AIReviewSystem exists
          if (!window.AIReviewSystem || typeof window.AIReviewSystem.renderQuestionPreview !== 'function') {
            console.error('AIReviewSystem not available');
            throw new Error('AIReviewSystem not loaded');
          }

          // Build complete question card with header in temporary container
          const statusText = q.approved === true ? '✅ APPROVED' : q.approved === false ? '❌ REJECTED' : '⏺️ PENDING';
          const statusColor = q.approved === true ? '#10b981' : q.approved === false ? '#ef4444' : '#6b7280';
          const ratingText = q.rating > 0 ? `${'⭐'.repeat(q.rating)}${'☆'.repeat(5 - q.rating)}` : 'No rating';

          // Escape feedback to prevent HTML injection
          const safeFeedback = q.feedback ? q.feedback.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

          tempContainer.innerHTML = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 3px solid #e5e7eb;">
                <h1 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 2rem; font-weight: 700;">
                  Question ${i + 1}: ${this.getTypeName(q.type)}
                </h1>
                <div style="display: flex; justify-content: center; gap: 1.5rem; align-items: center; margin-top: 0.75rem;">
                  <span style="color: ${statusColor}; font-weight: 600; font-size: 1rem;">${statusText}</span>
                  <span style="color: #f59e0b; font-size: 1rem;">${ratingText}</span>
                  <span style="color: #6b7280; font-weight: 500; font-size: 1rem;">Difficulty: ${q.difficulty.toUpperCase()}</span>
                </div>
              </div>

              <!-- Question Content -->
              <div style="background: linear-gradient(135deg, #f9fafb, #ffffff); border-radius: 12px; padding: 1.5rem;">
                ${window.AIReviewSystem.renderQuestionPreview(q.type, q.data)}
              </div>

              ${q.feedback ? `
                <!-- Feedback -->
                <div style="margin-top: 1.5rem; padding: 1rem; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px;">
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 0.5rem;">📝 Feedback:</div>
                  <div style="color: #78350f; font-size: 0.95rem; line-height: 1.5;">${safeFeedback}</div>
                </div>
              ` : ''}
            </div>
          `;

          // Wait for DOM to render
          await new Promise(resolve => setTimeout(resolve, 100));

          // Render chart if needed (for GI questions)
          if (q.type === 'GI' && q.data.chart_config) {
            try {
              await new Promise(resolve => setTimeout(resolve, 300));
              if (window.AIReviewSystem && typeof window.AIReviewSystem.renderChartInReview === 'function') {
                window.AIReviewSystem.renderChartInReview(q.data.chart_config);
                await new Promise(resolve => setTimeout(resolve, 1200)); // Wait for chart rendering
              }
            } catch (chartError) {
              console.error('Chart rendering failed:', chartError);
              // Continue without chart
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for rendering
          }

          // Validate container has content
          if (!tempContainer.innerHTML || tempContainer.innerHTML.trim() === '') {
            console.error('Empty container for question:', i);
            errorCount++;
            continue;
          }

          // Capture screenshot with html2canvas
          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: false,
            imageTimeout: 15000,
            removeContainer: false
          });

          // Validate canvas
          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.error('Invalid canvas for question:', i);
            errorCount++;
            continue;
          }

          const imgData = canvas.toDataURL('image/png');

          // Validate image data
          if (!imgData || !imgData.startsWith('data:image/png')) {
            console.error('Invalid image data for question:', i);
            errorCount++;
            continue;
          }

          const imgWidth = 190; // Full page width
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if image fits on page, otherwise scale down
          const maxHeight = 277; // A4 page height minus margins
          let finalWidth = imgWidth;
          let finalHeight = imgHeight;

          if (imgHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = (canvas.width * maxHeight) / canvas.height;
          }

          // Center the image on page
          const xPos = (210 - finalWidth) / 2; // A4 width is 210mm
          const yPos = 10;

          // Add image to PDF
          doc.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);

          successCount++;
          console.log(`✅ Question ${i + 1} rendered successfully`);
        } catch (questionError) {
          errorCount++;
          console.error(`Failed to render question ${i + 1}:`, questionError);

          // Add error page
          doc.setFontSize(16);
          doc.setTextColor(220, 38, 38);
          doc.text(`Error rendering Question ${i + 1}`, 105, 100, { align: 'center' });
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(`${this.getTypeName(q.type)} - ${q.difficulty}`, 105, 110, { align: 'center' });
          doc.text('Please check console for details', 105, 120, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      }

      // Clean up temporary container
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      if (document.body.contains(progressDiv)) {
        document.body.removeChild(progressDiv);
      }

      // Save PDF
      const filename = `GMAT_Questions_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

      // Show summary
      const summaryMessage = errorCount > 0
        ? `✅ PDF exported successfully!\n\n📄 ${filename}\n\n✅ ${successCount} questions rendered successfully\n❌ ${errorCount} questions had errors\n\nCheck console for error details.`
        : `✅ PDF exported successfully!\n\n📄 ${filename}\n\n${successCount} questions rendered perfectly!`;

      alert(summaryMessage);
    } catch (error) {
      console.error('PDF export failed:', error);

      // Clean up any remaining elements
      const tempContainerCleanup = document.querySelector('div[style*="top: -9999px"]');
      if (tempContainerCleanup && document.body.contains(tempContainerCleanup)) {
        document.body.removeChild(tempContainerCleanup);
      }

      const progressDivCleanup = document.getElementById('pdf-progress-text')?.closest('div');
      if (progressDivCleanup && document.body.contains(progressDivCleanup)) {
        document.body.removeChild(progressDivCleanup);
      }

      alert('❌ Failed to export PDF. Please check console for details and try again.');
    }
  }

  // Save approved questions to database
  async saveApprovedQuestionsToDatabase(approvedQuestions) {
    if (!approvedQuestions || approvedQuestions.length === 0) {
      alert('⚠️ No approved questions to save.');
      return;
    }

    // Get the excelFormInstance
    const excelForm = window.excelFormBancaDati;
    if (!excelForm || !excelForm.tableData) {
      alert('⚠️ Excel form not initialized. Please open the question creator first.');
      return;
    }

    // Find first available empty rows
    const emptyRowIndices = [];
    for (let i = 0; i < excelForm.tableData.length; i++) {
      const row = excelForm.tableData[i];
      // Check if row has no DI question data
      if (!row.di_question_type) {
        emptyRowIndices.push(i);
      }
      // Stop when we have enough empty rows
      if (emptyRowIndices.length >= approvedQuestions.length) {
        break;
      }
    }

    // If we don't have enough empty rows, add new rows
    if (emptyRowIndices.length < approvedQuestions.length) {
      const rowsNeeded = approvedQuestions.length - emptyRowIndices.length;
      for (let i = 0; i < rowsNeeded; i++) {
        excelForm.addRow();
        emptyRowIndices.push(excelForm.tableData.length - 1);
      }
    }

    // Save each approved question to sequential rows
    let savedCount = 0;
    for (let i = 0; i < approvedQuestions.length; i++) {
      const question = approvedQuestions[i];
      const rowIndex = emptyRowIndices[i];

      try {
        // Save the question type and data
        excelForm.updateCell(rowIndex, 'di_question_type', question.type);
        excelForm.updateCell(rowIndex, 'di_question_data', question.data);

        // Save GMAT_section to "Data Insights" for all DI questions
        excelForm.updateCell(rowIndex, 'GMAT_section', 'Data Insights');

        // Save argomento to "Data Insights" for all DI questions
        excelForm.updateCell(rowIndex, 'argomento', 'Data Insights');

        // Save difficulty if available
        if (question.difficulty) {
          excelForm.updateCell(rowIndex, 'GMAT_question_difficulty', question.difficulty);
        }

        // Log the saved data for debugging
        console.log(`✅ Saved question ${i + 1} to row ${rowIndex + 1}:`, {
          type: question.type,
          difficulty: question.difficulty,
          GMAT_section: excelForm.tableData[rowIndex].GMAT_section,
          argomento: excelForm.tableData[rowIndex].argomento,
          hasData: !!question.data,
          rowData: excelForm.tableData[rowIndex]
        });

        // Save to AI learning system (Supabase) if feedback/rating exists
        if (window.AIReviewSystem && (question.rating > 0 || question.feedback)) {
          await window.AIReviewSystem.handleApproval(
            question.type,
            question.difficulty,
            question.data,
            question.rating || 0,
            question.feedback || ''
          );
        }

        // Update the UI for this row
        this.updateSavedRowUI(rowIndex, question.type, excelForm);

        // Update argomento UI field (it displays GMAT_section value for GMAT tests)
        const argomentoInput = document.getElementById(`argomento-${rowIndex}`);
        if (argomentoInput) {
          argomentoInput.value = 'Data Insights';
        }

        savedCount++;
      } catch (error) {
        console.error(`Failed to save question ${i + 1}:`, error);
      }
    }

    console.log(`✅ Successfully saved ${savedCount} out of ${approvedQuestions.length} questions`);
    alert(`✅ Successfully saved ${savedCount} approved questions to rows ${emptyRowIndices[0] + 1} to ${emptyRowIndices[savedCount - 1] + 1}!`);
  }

  // Update UI after saving a row
  updateSavedRowUI(rowIndex, typeCode, excelForm) {
    const typeNames = {
      'DS': 'Data Sufficiency',
      'GI': 'Graphics Interpretation',
      'TA': 'Table Analysis',
      'TPA': 'Two-Part Analysis',
      'MSR': 'Multi-Source Reasoning'
    };

    // Update DI type input
    const typeInput = document.getElementById(`di-type-input-${rowIndex}`);
    if (typeInput) {
      typeInput.value = typeCode;
    }

    // Update DI button
    const diBtn = document.getElementById(`di-btn-${rowIndex}`);
    if (diBtn) {
      diBtn.textContent = `✏️ Edit ${typeNames[typeCode]} Question`;
      diBtn.style.background = 'linear-gradient(135deg, #0ea5e9, #06b6d4)';
      diBtn.style.borderColor = '#0ea5e9';
    }

    // Disable standard question fields
    const questionTextarea = document.getElementById(`question-textarea-${rowIndex}`);
    if (questionTextarea) {
      questionTextarea.disabled = true;
      questionTextarea.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
      questionTextarea.style.color = '#9ca3af';
      questionTextarea.style.border = '2px dashed #d1d5db';
      questionTextarea.style.cursor = 'not-allowed';
      questionTextarea.value = '🔒 DI Question - Use button above to edit';
    }

    const correctInput = document.getElementById(`correct-input-${rowIndex}`);
    if (correctInput) {
      correctInput.disabled = true;
      correctInput.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
      correctInput.style.color = '#9ca3af';
      correctInput.style.border = '2px dashed #d1d5db';
      correctInput.style.cursor = 'not-allowed';
      correctInput.value = '🔒';
    }

    ['a', 'b', 'c', 'd', 'e'].forEach(letter => {
      const optionTextarea = document.getElementById(`option-${letter}-textarea-${rowIndex}`);
      if (optionTextarea) {
        optionTextarea.disabled = true;
        optionTextarea.style.background = 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f6 20px)';
        optionTextarea.style.color = '#9ca3af';
        optionTextarea.style.border = '2px dashed #d1d5db';
        optionTextarea.style.cursor = 'not-allowed';
        optionTextarea.value = '🔒 DI Question';
      }
    });
  }
}

// Initialize global instance
window.AIQuestionGenerator = new AIQuestionGenerator();
