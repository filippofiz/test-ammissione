#!/usr/bin/env python3
"""
GMAT OQBK TypeScript Generator
================================
Reads the extracted JSON produced by extract_oqbk.py and generates
TypeScript source files for OQBK (Online Question Bank) GI and TA questions.

Output files created:
  DI:
    GMAT/sources/questions/DI/data_insights_OQBK_GI.ts  → dataInsightsOQBK_GI
    GMAT/sources/questions/DI/data_insights_OQBK_TA.ts  → dataInsightsOQBK_TA

ID format: DI-GMAT-OQBK-00001, DI-GMAT-OQBK-00002, ...

Note: GI image_url is initially null; run upload-di-images.mjs to populate.

Usage:
    python generate_oqbk_typescript.py \\
        --input "admission-platform-v2/GMAT/sources/official/GMAT Online Question Bank/extracted/questions.json"

    # Dry-run (print to stdout instead of writing files)
    python generate_oqbk_typescript.py --input ... --dry-run
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPTS_DIR = Path(__file__).parent
SOURCES_DIR = SCRIPTS_DIR.parent / "sources" / "questions"
DI_OUT_DIR = SOURCES_DIR / "DI"
MANIFEST_PATH = SCRIPTS_DIR / "manifest.json"

# ---------------------------------------------------------------------------
# Helpers (mirrors generate_pqo_typescript.py)
# ---------------------------------------------------------------------------

def load_json(path: Path) -> list:
    if not path.exists():
        print(f"ERROR: File not found: {path}")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"version": 1, "entries": {}}


def save_manifest(manifest: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


def ts_string(s: str) -> str:
    """Escape a Python string for use as a TypeScript string literal."""
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "")
    return f'"{s}"'


def ts_string_array(arr: list[str]) -> str:
    items = ", ".join(ts_string(x) for x in arr)
    return f"[{items}]"


def difficulty_level(diff: str | None) -> str:
    mapping = {"easy": "2", "medium": "3", "hard": "4"}
    return mapping.get(diff or "", "3")


def format_id(counter: int) -> str:
    return f"DI-GMAT-OQBK-{counter:05d}"


def render_table_row(row: list[str]) -> str:
    items = ", ".join(ts_string(cell) for cell in row)
    return f"        [{items}]"


# ---------------------------------------------------------------------------
# GI TypeScript generator
# ---------------------------------------------------------------------------

DI_HEADER_GI = '''\
import {{
  DataInsightsQuestion,
  GIQuestionData,
  generateGIAnswers,
}} from "../types";

// GMAT Online Question Bank (OQBK) - Data Insights: Graphics Interpretation
// Generated on {date} by generate_oqbk_typescript.py
// Source: GMAT Online Question Bank screenshots (Data Insights GI - TA Custom Pool)
// DO NOT EDIT MANUALLY — re-run generate_oqbk_typescript.py to regenerate
// NOTE: image_url is initially null; run upload-di-images.mjs to populate.

export const dataInsightsOQBK_GI: DataInsightsQuestion[] = [
'''

DI_FOOTER = "];\n"


def generate_gi_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    explanation = q.get("explanation", "")
    blank1_correct = q.get("blank1_correct", "")
    blank2_correct = q.get("blank2_correct", "")
    blank1_options = q.get("blank1_options", [])
    blank2_options = q.get("blank2_options", [])
    context_text = q.get("context_text", "")
    statement_text = q.get("statement_text", "")

    lines = [
    f"  {{",
    f"    id: {ts_string(question_id)},",
    f"    question_number: {question_number},",
    f"    section: \"Data Insights\",",
    f"    difficulty: \"{diff}\",",
    f"    difficultyLevel: {diff_level},",
    f"    questionData: {{",
    f"      di_type: \"GI\",",
    f"      // image_url populated after upload-di-images step",
    f"      image_url: null,",
    f"      context_text: {ts_string(context_text)},",
    f"      statement_text: {ts_string(statement_text)},",
    f"      blank1_options: {ts_string_array(blank1_options)},",
    f"      blank1_correct: {ts_string(blank1_correct)},",
    f"      blank2_options: {ts_string_array(blank2_options)},",
    f"      blank2_correct: {ts_string(blank2_correct)},",
    f"      explanation: {ts_string(explanation)},",
    f"    }} as unknown as GIQuestionData,",
    f"    answers: generateGIAnswers({ts_string(blank1_correct)}, {ts_string(blank2_correct)}),",
    f"    categories: [\"Graphics Interpretation\"],",
    f"  }},"
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# TA TypeScript generator
# ---------------------------------------------------------------------------

DI_HEADER_TA = '''\
import {{
  DataInsightsQuestion,
  TAQuestionData,
  generateTAAnswers,
}} from "../types";

// GMAT Online Question Bank (OQBK) - Data Insights: Table Analysis
// Generated on {date} by generate_oqbk_typescript.py
// Source: GMAT Online Question Bank screenshots (Data Insights GI - TA Custom Pool)
// DO NOT EDIT MANUALLY — re-run generate_oqbk_typescript.py to regenerate

export const dataInsightsOQBK_TA: DataInsightsQuestion[] = [
'''


def generate_ta_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    explanation = q.get("explanation", "")
    statements = q.get("statements", [])
    col_headers = q.get("column_headers", [])
    table_data = q.get("table_data", [])

    # Build correct_answer map
    correct_answer_parts = []
    for i, stmt in enumerate(statements):
        col = "col1" if stmt.get("is_true", False) else "col2"
        correct_answer_parts.append(f"        stmt{i}: \"{col}\"")
    correct_answer_block = "{\n" + ",\n".join(correct_answer_parts) + "\n      }"

    # Build generateTAAnswers argument
    ta_args_parts = []
    for i, stmt in enumerate(statements):
        col = "col1" if stmt.get("is_true", False) else "col2"
        ta_args_parts.append(f"      stmt{i}: \"{col}\"")
    ta_args = "{\n" + ",\n".join(ta_args_parts) + "\n    }"

    headers_str = ts_string_array(col_headers)

    if table_data:
        rows = ",\n".join(render_table_row(row) for row in table_data)
        table_data_str = f"[\n{rows},\n      ]"
    else:
        table_data_str = "[]"

    stmt_lines = []
    for stmt in statements:
        text = stmt.get("text", "")
        is_true = "true" if stmt.get("is_true", False) else "false"
        stmt_lines.append(f"        {{ text: {ts_string(text)}, is_true: {is_true} }}")
    stmts_str = "[\n" + ",\n".join(stmt_lines) + ",\n      ]"

    answer_col1 = q.get("answer_col1_title", "Yes")
    answer_col2 = q.get("answer_col2_title", "No")
    stmt_col_title = q.get("statement_column_title", "Statement")

    lines = [
    f"  {{",
    f"    id: {ts_string(question_id)},",
    f"    question_number: {question_number},",
    f"    section: \"Data Insights\",",
    f"    difficulty: \"{diff}\",",
    f"    difficultyLevel: {diff_level},",
    f"    questionData: {{",
    f"      di_type: \"TA\",",
    f"      table_title: {ts_string(q.get('table_title', ''))},",
    f"      stimulus_text: {ts_string(q.get('stimulus_text', ''))},",
    f"      column_headers: {headers_str},",
    f"      table_data: {table_data_str},",
    f"      statements: {stmts_str},",
    f"      correct_answer: {correct_answer_block},",
    f"      answer_col1_title: {ts_string(answer_col1)},",
    f"      answer_col2_title: {ts_string(answer_col2)},",
    f"      statement_column_title: {ts_string(stmt_col_title)},",
    f"      explanation: {ts_string(explanation)},",
    f"    }} as TAQuestionData,",
    f"    answers: generateTAAnswers({ta_args}),",
    f"    categories: [\"Table Analysis\"],",
    f"  }},"
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Build files
# ---------------------------------------------------------------------------

def build_files(
    questions: list[dict],
    manifest: dict,
    dry_run: bool,
) -> dict[str, str]:
    """Returns a dict mapping output filename → TypeScript content."""
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Group by di_type
    gi_questions = [q for q in questions if q.get("di_type", "").upper() == "GI"]
    ta_questions = [q for q in questions if q.get("di_type", "").upper() == "TA"]

    print(f"  GI questions: {len(gi_questions)}")
    print(f"  TA questions: {len(ta_questions)}")

    result: dict[str, str] = {}
    counter = 1

    # GI file
    if gi_questions:
        content = DI_HEADER_GI.format(date=date)
        for q in gi_questions:
            gmat_id = q.get("gmat_id", "UNKNOWN")
            question_id = format_id(counter)

            if not dry_run:
                entry = manifest["entries"].get(gmat_id, {"gmat_id": gmat_id})
                entry["question_id"] = question_id
                entry["typescript_file"] = "data_insights_OQBK_GI.ts"
                entry["typescript_generated_at"] = datetime.now(timezone.utc).isoformat()
                manifest["entries"][gmat_id] = entry

            content += generate_gi_question(q, question_id, counter) + "\n"
            counter += 1

        content += DI_FOOTER
        result["data_insights_OQBK_GI.ts"] = content

    # TA file
    if ta_questions:
        content = DI_HEADER_TA.format(date=date)
        for q in ta_questions:
            gmat_id = q.get("gmat_id", "UNKNOWN")
            question_id = format_id(counter)

            if not dry_run:
                entry = manifest["entries"].get(gmat_id, {"gmat_id": gmat_id})
                entry["question_id"] = question_id
                entry["typescript_file"] = "data_insights_OQBK_TA.ts"
                entry["typescript_generated_at"] = datetime.now(timezone.utc).isoformat()
                manifest["entries"][gmat_id] = entry

            content += generate_ta_question(q, question_id, counter) + "\n"
            counter += 1

        content += DI_FOOTER
        result["data_insights_OQBK_TA.ts"] = content

    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate TypeScript source files for GMAT OQBK GI/TA questions."
    )
    parser.add_argument(
        "--input",
        type=Path,
        required=True,
        help="Path to extracted OQBK questions JSON.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print TypeScript content to stdout instead of writing files.",
    )

    args = parser.parse_args()

    questions = load_json(args.input)
    print(f"\nLoaded {len(questions)} questions from {args.input}\n")

    manifest = load_manifest()
    di_files = build_files(questions, manifest, args.dry_run)

    for filename, ts_content in di_files.items():
        if args.dry_run:
            print("\n" + "=" * 60)
            print(f"  [DRY RUN] {filename}")
            print("=" * 60)
            lines = ts_content.splitlines()
            for line in lines[:60]:
                print(line)
            if len(lines) > 60:
                print(f"  ... ({len(lines) - 60} more lines)")
        else:
            out_path = DI_OUT_DIR / filename
            DI_OUT_DIR.mkdir(parents=True, exist_ok=True)
            out_path.write_text(ts_content, encoding="utf-8")
            print(f"  Written: {out_path}")

    if not args.dry_run:
        save_manifest(manifest)
        print(f"\nManifest updated: {MANIFEST_PATH}")

    print("\nDone.")


if __name__ == "__main__":
    main()
