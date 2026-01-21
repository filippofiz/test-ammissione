#!/usr/bin/env python3
"""
Convert DS questions JSON to TypeScript format.
Follows the pattern from data_insights_OG_DS.ts
Merges questions with explanations from separate files.
"""

import json
from pathlib import Path


def escape_ts_string(s: str) -> str:
    """Escape special characters for TypeScript string literals."""
    if s is None:
        return ""
    # Escape backslashes first, then quotes
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    # Keep newlines as \n for readability
    s = s.replace("\n", "\\n")
    return s


def map_difficulty(difficulty_str: str) -> tuple:
    """Map difficulty string to (difficulty, difficultyLevel)."""
    mapping = {
        "easy": ("easy", 2),
        "medium": ("medium", 3),
        "hard": ("hard", 4),
    }
    return mapping.get(difficulty_str, ("medium", 3))


def generate_ds_question(q: dict, explanation: str) -> str:
    """Generate TypeScript code for a single DS question."""

    q_num = q["question_number"]

    # Generate ID: DI-GMAT-PQ-XXXXX (PQ for Practice Questions)
    # Use offset to avoid collision with TPA questions (which start at 114)
    # DS questions are 1-113, so we can use the same numbering scheme
    q_id = f"DI-GMAT-PQ-{1000 + q_num:05d}"

    # Get values
    problem = escape_ts_string(q["problem"])
    statement1 = escape_ts_string(q["statement1"])
    statement2 = escape_ts_string(q["statement2"])
    correct_answer = q["correct_answer"]
    explanation_escaped = escape_ts_string(explanation)

    # Get difficulty
    difficulty_str = q.get("difficulty", "medium")
    difficulty, difficulty_level = map_difficulty(difficulty_str)

    # Handle chart_config if present (for questions with graphs)
    chart_config_str = ""
    if "chart_config" in q and q["chart_config"]:
        # For now, we'll skip chart_config since it's complex
        # The DS questions with charts can be handled separately if needed
        chart_config_str = ""

    return f'''  {{
    id: "{q_id}",
    question_number: {q_num},
    section: "Data Insights",
    difficulty: "{difficulty}",
    difficultyLevel: {difficulty_level},
    questionData: {{
      di_type: "DS",
      problem: "{problem}",
      statement1: "{statement1}",
      statement2: "{statement2}",
      answer_choices: {{
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      }},
      correct_answer: "{correct_answer}",
      explanation: "{explanation_escaped}",
    }} as DSQuestionData,
    answers: generateDSAnswers("{correct_answer}"),
    categories: ["Data Sufficiency"],
  }}'''


def main():
    # Paths
    script_dir = Path(__file__).parent
    questions_path = script_dir.parent / "extracted" / "ds_questions.json"
    explanations_path = script_dir.parent / "extracted" / "ds_explanations.json"
    output_path = script_dir.parent.parent.parent / "questions" / "DI" / "data_insights_PQ_DS.ts"

    # Load questions
    with open(questions_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} DS questions")

    # Load explanations
    with open(explanations_path, "r", encoding="utf-8") as f:
        explanations_list = json.load(f)

    print(f"Loaded {len(explanations_list)} DS explanations")

    # Create explanation lookup by question number
    explanations = {}
    for exp in explanations_list:
        explanations[exp["question_number"]] = exp.get("explanation", "")

    # Generate TypeScript
    ts_questions = []
    for q in questions:
        q_num = q["question_number"]
        explanation = explanations.get(q_num, "")
        ts_questions.append(generate_ds_question(q, explanation))

    # Build complete TypeScript file
    ts_content = '''import {
  DataInsightsQuestion,
  DSQuestionData,
  generateDSAnswers,
} from "../types";

export const dataInsightsPQ_DS: DataInsightsQuestion[] = [
'''

    ts_content += ",\n".join(ts_questions)
    ts_content += "\n];\n"

    # Write output
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"Generated TypeScript file: {output_path}")
    print(f"Total questions: {len(questions)}")


if __name__ == "__main__":
    main()
