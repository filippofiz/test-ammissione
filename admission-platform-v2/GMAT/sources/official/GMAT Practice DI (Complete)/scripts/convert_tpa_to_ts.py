#!/usr/bin/env python3
"""
Convert TPA questions JSON to TypeScript format.
Follows the pattern from data_insights_OG_TPA.ts
"""

import json
import re
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


def format_shared_options(options: list) -> str:
    """Format shared_options array as TypeScript."""
    formatted = []
    for opt in options:
        formatted.append(f'"{escape_ts_string(opt)}"')
    return "[" + ", ".join(formatted) + "]"


def format_explanation(explanation) -> str:
    """Extract explanation text from explanation object or string."""
    if isinstance(explanation, str):
        return explanation
    elif isinstance(explanation, dict):
        # Combine explanations from the object
        parts = []
        if "general_explanation" in explanation:
            parts.append(explanation["general_explanation"])
        if "col1_explanation" in explanation:
            parts.append(f"Column 1: {explanation['col1_explanation']}")
        if "col2_explanation" in explanation:
            parts.append(f"Column 2: {explanation['col2_explanation']}")
        return " ".join(parts)
    return ""


def generate_tpa_question(q: dict, idx: int) -> str:
    """Generate TypeScript code for a single TPA question."""

    # Question number is from JSON
    q_num = q["question_number"]

    # Generate ID: DI-GMAT-PQ-XXXXX (PQ for Practice Questions)
    q_id = f"DI-GMAT-PQ-{q_num:05d}"

    # Get values
    scenario = escape_ts_string(q["scenario"])
    col1_title = escape_ts_string(q["column1_title"])
    col2_title = escape_ts_string(q["column2_title"])
    col1_answer = escape_ts_string(q["correct_answers"]["col1"])
    col2_answer = escape_ts_string(q["correct_answers"]["col2"])

    # Statement title - clean it up
    statement_title = q.get("statement_title", "Option")
    if "Make only" in statement_title:
        statement_title = "Option"
    statement_title = escape_ts_string(statement_title)

    # Explanation
    explanation = format_explanation(q.get("explanation", ""))
    explanation = escape_ts_string(explanation)

    # Format shared options
    shared_options = format_shared_options(q["shared_options"])

    # Determine difficulty (default to medium since Practice Questions are generally harder)
    difficulty = "medium"
    difficulty_level = 3

    return f'''  {{
    id: "{q_id}",
    question_number: {q_num},
    section: "Data Insights",
    difficulty: "{difficulty}",
    difficultyLevel: {difficulty_level},
    questionData: {{
      di_type: "TPA",
      scenario: "{scenario}",
      column1_title: "{col1_title}",
      column2_title: "{col2_title}",
      shared_options: {shared_options},
      correct_answers: {{
        col1: "{col1_answer}",
        col2: "{col2_answer}",
      }},
      statement_title: "{statement_title}",
      explanation: "{explanation}",
    }} as TPAQuestionData,
    answers: generateTPAAnswers("{col1_answer}", "{col2_answer}"),
    categories: ["Two-Part Analysis"],
  }}'''


def main():
    # Paths
    script_dir = Path(__file__).parent
    json_path = script_dir.parent / "extracted" / "tpa_questions.json"
    output_path = script_dir.parent.parent.parent / "questions" / "DI" / "data_insights_PQ_TPA.ts"

    # Load JSON
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} TPA questions")

    # Generate TypeScript
    ts_questions = []
    for idx, q in enumerate(questions):
        ts_questions.append(generate_tpa_question(q, idx))

    # Build complete TypeScript file
    ts_content = '''import {
  DataInsightsQuestion,
  TPAQuestionData,
  generateTPAAnswers,
} from "../types";

export const dataInsightsPQ_TPA: DataInsightsQuestion[] = [
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
