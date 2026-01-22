# GMAT Question Generation via AI Fine-Tuning
## Strategic Proposal for UpToTen Test Platform

---

# Executive Summary

## The Challenge

Our GMAT preparation platform currently has **1,342 questions** extracted from official sources. However, our 3-cycle preparation model requires approximately **1,172 unique questions per student per cycle**.

| Metric | Value |
|--------|-------|
| Current Questions | 1,342 |
| Questions per Cycle | ~1,172 |
| Gap for 3 students × 3 cycles | ~5,000-7,000 questions |

## The Proposed Solution

**Fine-tune OpenAI's GPT-4o model** to generate original GMAT-style questions that match our platform's format and quality standards.

### Key Benefits
- **Cost-Effective**: ~$50 in AI costs for 2,500+ questions
- **Fast**: 2-4 weeks to fill the question gap
- **Scalable**: Can generate thousands more as needed
- **Format-Compatible**: Questions integrate directly with existing platform

---

# Current State Analysis

## Question Distribution

| Section | Available | Per Cycle Need | Status |
|---------|-----------|----------------|--------|
| **Quantitative Reasoning** | 582 | 469 | Sufficient for 1 cycle |
| **Verbal Reasoning** | 383 | 311 | Sufficient for 1 cycle |
| **Data Insights** | 377 | 392 | Slight shortage |
| **Total** | 1,342 | 1,172 | Gap grows with scale |

## Question Types Currently Supported

**Quantitative Reasoning (QR)**
- Multiple choice (5 options)
- Mathematical problem solving
- Categories: Arithmetic, Algebra, Probability, Statistics, etc.

**Data Insights (DI)**
- Data Sufficiency (DS)
- Two-Part Analysis (TPA)
- Graphics Interpretation (GI)
- Table Analysis (TA)
- Multi-Source Reasoning (MSR)

**Verbal Reasoning (VR)**
- Critical Reasoning (CR)
- Reading Comprehension (RC)

---

# What is AI Fine-Tuning?

## Definition

Fine-tuning adapts a pre-trained AI model to a specific task by training it on examples of desired outputs. Unlike simple prompting, fine-tuning **modifies the model's behavior** to consistently produce outputs matching your specifications.

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Your Existing  │ ───▶ │   Fine-Tuning   │ ───▶ │ Specialized GMAT│
│   Questions     │      │    Process      │      │ Question Model  │
│  (150-300)      │      │   (2-4 hours)   │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Fine-Tuning vs. Alternatives

| Approach | Quality | Cost | Consistency | Speed |
|----------|---------|------|-------------|-------|
| **Fine-Tuning** | High | Low | Excellent | Fast after setup |
| Few-Shot Prompting | Medium | Medium | Variable | Immediate |
| Manual Creation | Highest | Very High | Excellent | Very Slow |

---

# Technical Approach

## 1. Training Data Preparation

We will convert 150-300 of our highest-quality existing questions into the training format required by OpenAI.

**Input (Our Current Format):**
```typescript
{
  id: "QR-GMAT-OG__-00001",
  section: "Quantitative Reasoning",
  difficulty: "medium",
  questionData: {
    question_text: "What is the probability...",
    options: { a: "0.25", b: "0.50", ... }
  },
  answers: { correct_answer: "b" },
  explanation: "The probability is calculated by..."
}
```

**Output (OpenAI Training Format):**
```json
{
  "messages": [
    {"role": "system", "content": "You are a GMAT question expert..."},
    {"role": "user", "content": "Generate a medium QR probability question"},
    {"role": "assistant", "content": "[Full question, options, answer, explanation]"}
  ]
}
```

## 2. Model Selection

**Recommended: GPT-4o (gpt-4o-2024-08-06)**
- Best reasoning capabilities for complex questions
- Excellent mathematical accuracy
- Strong explanation generation

**Alternative: GPT-4o-mini**
- Lower cost for simpler questions
- 90% of quality at 10% of cost

## 3. Generation Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Generate   │───▶│  Automated   │───▶│   Expert     │───▶│   Import     │
│   Question   │    │  Validation  │    │   Review     │    │  to Platform │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Reject /   │
                    │  Regenerate  │
                    └──────────────┘
```

---

# Implementation Plan

## Timeline: 4 Weeks

### Week 1: Foundation
| Task | Effort | Output |
|------|--------|--------|
| Select 150 best training questions | 4 hours | Curated question set |
| Build export/conversion scripts | 8 hours | Automation tools |
| Set up OpenAI fine-tuning | 2 hours | Trained model |
| Pilot: Generate 50 questions | 1 hour | Quality validation |

### Week 2: Pilot & Iteration
| Task | Effort | Output |
|------|--------|--------|
| Expert review of pilot questions | 4 hours | Quality assessment |
| Refine training data if needed | 4 hours | Improved model |
| Generate first batch (500 questions) | 2 hours | Draft questions |
| Begin expert review process | Ongoing | Validated questions |

### Week 3: Scale Generation
| Task | Effort | Output |
|------|--------|--------|
| Generate remaining 2,000 questions | 4 hours | Full question set |
| Expert review (200-400/day target) | 20 hours | Validated questions |
| Fix/reject/regenerate as needed | Ongoing | Clean question set |

### Week 4: Integration
| Task | Effort | Output |
|------|--------|--------|
| Convert to platform format | 4 hours | TypeScript files |
| Database import | 2 hours | Questions in system |
| Platform testing | 4 hours | Verified display |
| Documentation | 2 hours | Process guide |

---

# Cost Analysis

## AI Costs (One-Time + Generation)

| Component | Calculation | Cost |
|-----------|-------------|------|
| **Training** | 125K tokens × 3 epochs × $25/1M | ~$9 |
| **Generation** (2,500 questions) | 550K tokens × $15/1M | ~$8 |
| **Re-training** (if needed) | Same as training | ~$9 |
| **Buffer/Testing** | 10% contingency | ~$4 |
| **Total AI Cost** | | **~$30-50** |

## Human Effort

| Role | Hours | Purpose |
|------|-------|---------|
| Developer | 20-30 hours | Scripts, integration |
| GMAT Expert | 25-35 hours | Training selection, review |
| **Total Human Effort** | **45-65 hours** | |

## Comparison: Manual vs. AI-Assisted

| Approach | Questions | Time | Cost* |
|----------|-----------|------|-------|
| Manual Creation | 2,500 | 500+ hours | €25,000+ |
| AI + Expert Review | 2,500 | 65 hours | ~€3,500 |
| **Savings** | | **87% less time** | **86% less cost** |

*Assuming €50/hour for expert time

---

# Quality Assurance

## Automated Checks

1. **Format Validation**
   - Correct JSON structure
   - All required fields present
   - 5 answer options (a-e)

2. **Mathematical Validation**
   - Verify calculations are solvable
   - Check answer correctness (for QR)
   - Validate logical consistency

3. **Duplication Check**
   - Compare against existing questions
   - Flag similar questions for review

## Expert Review Process

Each generated question is reviewed for:
- [ ] Mathematical/logical correctness
- [ ] Clear, unambiguous wording
- [ ] Appropriate difficulty level
- [ ] Realistic GMAT-style scenario
- [ ] Quality explanation

**Review Metrics Target:**
- 80%+ pass rate on first review
- <5% with mathematical errors
- <10% requiring major rewrites

---

# Risk Assessment

## Risk 1: Quality Concerns

**Risk**: AI-generated questions may have errors or not match GMAT standards.

**Mitigation**:
- 100% expert review for initial batches
- Pilot with 50 questions before scaling
- Track student performance on AI vs. official questions
- Reject/regenerate below-threshold questions

**Residual Risk**: Low (with proper review process)

## Risk 2: Copyright/Legal

**Risk**: Questions may resemble copyrighted GMAT materials.

**Mitigation**:
- Train on format/structure, not specific content
- Expert review checks for similarity
- Significantly modify all questions
- Mark questions as AI-generated (AI__ prefix)
- Consider legal review before commercial expansion

**Residual Risk**: Low-Medium (recommend legal consultation)

## Risk 3: Difficulty Calibration

**Risk**: Questions may not match intended difficulty levels.

**Mitigation**:
- Include difficulty labels in training
- Expert calibration during review
- Track actual student performance
- Adjust/recategorize based on data

**Residual Risk**: Low (self-correcting with data)

---

# Expected Outcomes

## Quantitative Results

| Metric | Target |
|--------|--------|
| Questions Generated | 2,500+ |
| Pass Expert Review | >80% |
| Mathematical Errors | <5% |
| Time to Completion | 4 weeks |
| AI Cost | <€50 |

## Qualitative Benefits

1. **Scalability**: Can generate more questions on demand
2. **Consistency**: Uniform format across all questions
3. **Speed**: 2,500 questions in 4 weeks vs. months manually
4. **Documentation**: Process documented for future use
5. **Innovation**: Demonstrates AI capability for education

---

# Alternatives Considered

## Option A: Purchase Additional Questions

- **Source**: Third-party GMAT prep materials
- **Cost**: €5,000-15,000 for 2,000+ questions
- **Pros**: Proven quality
- **Cons**: Licensing restrictions, format conversion needed, ongoing costs

## Option B: Manual Question Creation

- **Effort**: 500+ hours of expert time
- **Cost**: €25,000+ at €50/hour
- **Pros**: Maximum quality control
- **Cons**: Prohibitively slow and expensive

## Option C: Partner with Test Prep Company

- **Arrangement**: Content partnership
- **Cost**: Revenue share or licensing fee
- **Pros**: Proven questions, no development
- **Cons**: Dependency, less flexibility, brand dilution

## Recommendation

**AI Fine-Tuning (Option D)** offers the best balance of:
- Speed (4 weeks)
- Cost (~€3,500 total)
- Quality (with expert review)
- Scalability (generate more as needed)
- Independence (own the output)

---

# Decision Points

## Required Approvals

1. **Budget Approval**: €50 AI costs + 65 hours expert time
2. **Resource Allocation**: Developer + GMAT Expert availability
3. **Timeline Commitment**: 4-week project window
4. **Quality Standards**: Define acceptable pass rate

## Go/No-Go Criteria

| Checkpoint | Decision Point | Criteria |
|------------|---------------|----------|
| Day 5 | Pilot Review | >70% questions pass review |
| Week 2 | Scale Decision | <10% error rate in batch 1 |
| Week 3 | Continue/Pause | On track for 80% pass rate |
| Week 4 | Launch Approval | 2,000+ validated questions |

---

# Next Steps

## If Approved

1. **Day 1**: Kick-off meeting, assign roles
2. **Day 1-2**: Select training questions, set up OpenAI account
3. **Day 3-5**: Build scripts, run first fine-tuning
4. **Day 5**: Pilot review - Go/No-Go decision
5. **Week 2+**: Scale according to plan

## Resources Needed

- [ ] 1 Developer (20-30 hours over 4 weeks)
- [ ] 1-2 GMAT Experts (25-35 hours over 4 weeks)
- [ ] OpenAI API account with payment method
- [ ] Approval for ~€50 AI costs

---

# Appendix A: Technical Details

## OpenAI Fine-Tuning API

```python
# Training data upload
client.files.create(
    file=open("gmat_training.jsonl", "rb"),
    purpose="fine-tune"
)

# Create fine-tuning job
client.fine_tuning.jobs.create(
    training_file="file-xxx",
    model="gpt-4o-2024-08-06",
    hyperparameters={"n_epochs": 3}
)

# Use fine-tuned model
response = client.chat.completions.create(
    model="ft:gpt-4o-2024-08-06:your-org:gmat:xxx",
    messages=[
        {"role": "system", "content": "Generate GMAT question..."},
        {"role": "user", "content": "Create a medium QR probability question"}
    ]
)
```

## Question ID Convention

AI-generated questions will use the existing ID system:
```
QR-GMAT-AI__-00001
│  │    │    │
│  │    │    └── Unique number
│  │    └────── Source: AI-generated
│  └─────────── Test type: GMAT
└────────────── Section: QR/VR/DI
```

---

# Appendix B: Sample Generated Question

## Input Prompt
```
Generate a MEDIUM difficulty Quantitative Reasoning
question about Probability.
```

## Expected Output
```
**Question:**
A bag contains 5 red marbles, 3 blue marbles, and 2 green
marbles. If two marbles are drawn at random without
replacement, what is the probability that both marbles
are the same color?

**Options:**
(a) 1/9
(b) 7/45
(c) 14/45
(d) 28/90
(e) 1/3

**Correct Answer:** (c)

**Explanation:**
Total marbles = 10
Total ways to choose 2 = C(10,2) = 45

Same color combinations:
- Both red: C(5,2) = 10
- Both blue: C(3,2) = 3
- Both green: C(2,2) = 1

Total same color = 10 + 3 + 1 = 14

Probability = 14/45

**Categories:** Probability, Combinations
```

---

# Appendix C: References

## OpenAI Documentation
- Fine-tuning Guide: platform.openai.com/docs/guides/fine-tuning
- Pricing: openai.com/api/pricing
- Best Practices: platform.openai.com/docs/guides/fine-tuning-best-practices

## GMAT Official Resources
- GMAT Official Guide 2025-2026
- GMAT Practice Questions (mba.com)
- GMAC Question Format Specifications

---

# Contact

**Prepared by**: UpToTen Technical Team
**Date**: January 2026
**Version**: 1.0

---

*This document is intended for internal planning purposes. Implementation details may be adjusted based on pilot results and stakeholder feedback.*