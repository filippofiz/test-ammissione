#!/usr/bin/env python3
"""
GMAT PQO TypeScript Generator
==============================
Reads the extracted JSON produced by extract_screenshots.py and generates
TypeScript source files for all PQO questions, one file per section/subtype.

Output files created:
  QR:
    GMAT/sources/questions/QR/quantitative_reasoning_PQO.ts
      → export: quantitativeReasoningQuestionsPQO
  DI (one file per subtype):
    GMAT/sources/questions/DI/data_insights_PQO_DS.ts
      → export: dataInsightsPQO_DS
    GMAT/sources/questions/DI/data_insights_PQO_TPA.ts
      → export: dataInsightsPQO_TPA
    GMAT/sources/questions/DI/data_insights_PQO_GI.ts
      → export: dataInsightsPQO_GI
    GMAT/sources/questions/DI/data_insights_PQO_TA.ts
      → export: dataInsightsPQO_TA
    GMAT/sources/questions/DI/data_insights_PQO_MSR.ts
      → export: dataInsightsPQO_MSR

ID format:
  QR → QR-GMAT-PQO_-00001, QR-GMAT-PQO_-00002, ...
  DI → DI-GMAT-PQO_-00001, DI-GMAT-PQO_-00002, ... (shared counter across all DI subtypes)

Usage:
    # Generate QR TypeScript
    python generate_pqo_typescript.py --section QR \\
        --input "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json"

    # Generate all DI TypeScript files
    python generate_pqo_typescript.py --section DI \\
        --input "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json"

    # Both at once (pass both --input args)
    python generate_pqo_typescript.py --section QR \\
        --input "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json" \\
        --di-input "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json"

    # Dry-run (print to stdout instead of writing files)
    python generate_pqo_typescript.py --section QR --input ... --dry-run
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
QR_OUT_DIR = SOURCES_DIR / "QR"
DI_OUT_DIR = SOURCES_DIR / "DI"
MANIFEST_PATH = SCRIPTS_DIR / "manifest.json"

# ---------------------------------------------------------------------------
# Helpers
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
    # Escape backslashes first, then double quotes
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    # Replace literal newlines with \n
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "")
    return f'"{s}"'


def ts_string_array(arr: list[str]) -> str:
    """Render a Python list of strings as a TypeScript array literal."""
    items = ", ".join(ts_string(x) for x in arr)
    return f"[{items}]"


def difficulty_level(diff: str | None) -> str:
    mapping = {"easy": "2", "medium": "3", "hard": "4"}
    return mapping.get(diff or "", "3")


def format_id(section: str, counter: int) -> str:
    return f"{section}-GMAT-PQO_-{counter:05d}"


def ts_null_or_string(val: str | None) -> str:
    if val is None:
        return "null"
    return ts_string(val)


def ts_categories(cats: list) -> str:
    if not cats:
        return "[]"
    return ts_string_array([str(c) for c in cats])


def render_table_row(row: list[str]) -> str:
    items = ", ".join(ts_string(cell) for cell in row)
    return f"        [{items}]"


# ---------------------------------------------------------------------------
# QR TypeScript generator
# ---------------------------------------------------------------------------

QR_HEADER = '''\
import {{
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
}} from "../types";

// GMAT Practice Questions Online (PQO) - Quantitative Reasoning
// Generated on {date} by generate_pqo_typescript.py
// Source: GMAT Practice QR Online screenshots
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const quantitativeReasoningQuestionsPQO: QuantitativeReasoningQuestion[] = [
'''

QR_FOOTER = "];\n"


def generate_qr_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    qtext = q.get("question_text", "")
    options = q.get("options", {})
    correct = q.get("correct_answer", "a").lower()
    explanation = q.get("explanation", "")
    categories = q.get("categories", [])

    lines = [
    f"  {{",
    f"    id: {ts_string(question_id)},",
    f"    question_number: {question_number},",
    f"    section: \"Quantitative Reasoning\",",
    f"    difficulty: \"{diff}\",",
    f"    difficultyLevel: {diff_level},",
    f"    questionData: {{",
    f"      question_text: {ts_string(qtext)},",
    f"      options: {{",
    f"        a: {ts_string(options.get('a', ''))},",
    f"        b: {ts_string(options.get('b', ''))},",
    f"        c: {ts_string(options.get('c', ''))},",
    f"        d: {ts_string(options.get('d', ''))},",
    f"        e: {ts_string(options.get('e', ''))},",
    f"      }},",
    f"      image_url: null,",
    f"      image_options: null,",
    f"    }} as QRQuestionData,",
    f"    answers: generateMCAnswers(\"{correct}\"),",
    f"    explanation: {ts_string(explanation)},",
    f"    categories: {ts_categories(categories)},",
    f"  }},"
    ]
    return "\n".join(lines)


def build_qr_file(questions: list[dict], manifest: dict, dry_run: bool) -> str:
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    content = QR_HEADER.format(date=date)

    counter = 1
    for q in questions:
        gmat_id = q.get("gmat_id", "UNKNOWN")
        question_id = format_id("QR", counter)

        # Update manifest
        if not dry_run:
            entry = manifest["entries"].get(gmat_id, {"gmat_id": gmat_id})
            entry["question_id"] = question_id
            entry["typescript_file"] = "quantitative_reasoning_PQO.ts"
            entry["typescript_generated_at"] = datetime.now(timezone.utc).isoformat()
            manifest["entries"][gmat_id] = entry

        content += generate_qr_question(q, question_id, counter) + "\n"
        counter += 1

    content += QR_FOOTER
    return content


# ---------------------------------------------------------------------------
# DI TypeScript generators
# ---------------------------------------------------------------------------

DI_HEADER_DS = '''\
import {{
  DataInsightsQuestion,
  DSQuestionData,
  generateDSAnswers,
}} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Data Sufficiency
// Generated on {date} by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_DS: DataInsightsQuestion[] = [
'''

DI_HEADER_TPA = '''\
import {{
  DataInsightsQuestion,
  TPAQuestionData,
  generateTPAAnswers,
}} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Two-Part Analysis
// Generated on {date} by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_TPA: DataInsightsQuestion[] = [
'''

DI_HEADER_GI = '''\
import {{
  DataInsightsQuestion,
  GIQuestionData,
  generateGIAnswers,
}} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Graphics Interpretation
// Generated on {date} by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate
// NOTE: image_url is initially null; run upload-di-images.mjs to populate.

export const dataInsightsPQO_GI: DataInsightsQuestion[] = [
'''

DI_HEADER_TA = '''\
import {{
  DataInsightsQuestion,
  TAQuestionData,
  generateTAAnswers,
}} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Table Analysis
// Generated on {date} by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_TA: DataInsightsQuestion[] = [
'''

DI_HEADER_MSR = '''\
import {{
  DataInsightsQuestion,
  MSRQuestionData,
  generateMSRAnswers,
}} from "../types";

// GMAT Practice Questions Online (PQO) - Data Insights: Multi-Source Reasoning
// Generated on {date} by generate_pqo_typescript.py
// DO NOT EDIT MANUALLY — re-run generate_pqo_typescript.py to regenerate

export const dataInsightsPQO_MSR: DataInsightsQuestion[] = [
'''

DI_FOOTER = "];\n"

DS_ANSWER_CHOICES = """\
      answer_choices: {
        A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
        B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
        C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
        D: "EACH statement ALONE is sufficient.",
        E: "Statements (1) and (2) TOGETHER are NOT sufficient.",
      },"""


def generate_ds_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    correct = q.get("correct_answer", "A").upper()
    explanation = q.get("explanation", "")

    lines = [
    f"  {{",
    f"    id: {ts_string(question_id)},",
    f"    question_number: {question_number},",
    f"    section: \"Data Insights\",",
    f"    difficulty: \"{diff}\",",
    f"    difficultyLevel: {diff_level},",
    f"    questionData: {{",
    f"      di_type: \"DS\",",
    f"      problem: {ts_string(q.get('problem', ''))},",
    f"      statement1: {ts_string(q.get('statement1', ''))},",
    f"      statement2: {ts_string(q.get('statement2', ''))},",
    DS_ANSWER_CHOICES,
    f"      correct_answer: \"{correct}\",",
    f"      explanation: {ts_string(explanation)},",
    f"    }} as DSQuestionData,",
    f"    answers: generateDSAnswers(\"{correct}\"),",
    f"    categories: [\"Data Sufficiency\"],",
    f"  }},"
    ]
    return "\n".join(lines)


def generate_tpa_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    explanation = q.get("explanation", "")
    correct_col1 = q.get("correct_col1", "")
    correct_col2 = q.get("correct_col2", "")
    shared_options = q.get("shared_options", [])

    opts_lines = "\n".join(f"        {ts_string(opt)}," for opt in shared_options)

    lines = [
    f"  {{",
    f"    id: {ts_string(question_id)},",
    f"    question_number: {question_number},",
    f"    section: \"Data Insights\",",
    f"    difficulty: \"{diff}\",",
    f"    difficultyLevel: {diff_level},",
    f"    questionData: {{",
    f"      di_type: \"TPA\",",
    f"      scenario: {ts_string(q.get('scenario', ''))},",
    f"      column1_title: {ts_string(q.get('column1_title', ''))},",
    f"      column2_title: {ts_string(q.get('column2_title', ''))},",
    f"      shared_options: [",
    opts_lines,
    f"      ],",
    f"      correct_answers: {{",
    f"        col1: {ts_string(correct_col1)},",
    f"        col2: {ts_string(correct_col2)},",
    f"      }},",
    f"      statement_title: \"Select one from each column.\",",
    f"      explanation: {ts_string(explanation)},",
    f"    }} as TPAQuestionData,",
    f"    answers: generateTPAAnswers({ts_string(correct_col1)}, {ts_string(correct_col2)}),",
    f"    categories: [\"Two-Part Analysis\"],",
    f"  }},"
    ]
    return "\n".join(lines)


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
    # GI chart_config is not set — image_url takes priority in GIQuestion.tsx
    f"    }} as unknown as GIQuestionData,",
    f"    answers: generateGIAnswers({ts_string(blank1_correct)}, {ts_string(blank2_correct)}),",
    f"    categories: [\"Graphics Interpretation\"],",
    f"  }},"
    ]
    return "\n".join(lines)


def generate_ta_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    explanation = q.get("explanation", "")
    statements = q.get("statements", [])
    col_headers = q.get("column_headers", [])
    table_data = q.get("table_data", [])

    # Build correct_answer map: stmt0 → col1 if is_true else col2
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

    # Render column headers
    headers_str = ts_string_array(col_headers)

    # Render table data (2D array)
    if table_data:
        rows = ",\n".join(render_table_row(row) for row in table_data)
        table_data_str = f"[\n{rows},\n      ]"
    else:
        table_data_str = "[]"

    # Render statements
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


def generate_msr_question(q: dict, question_id: str, question_number: int) -> str:
    diff = q.get("difficulty") or "medium"
    diff_level = difficulty_level(diff)
    explanation = q.get("explanation", "")
    sources = q.get("sources", [])
    sub_questions = q.get("questions", [])

    # Build sources block
    source_lines = []
    for src in sources:
        tab = src.get("tab_name", "")
        content = src.get("content", "")
        source_lines.append(
            f"    {{ tab_name: {ts_string(tab)}, content_type: \"text\", content: {ts_string(content)} }}"
        )
    sources_str = "[\n" + ",\n".join(source_lines) + "\n  ]"

    # Build sub-questions block + collect correct answers
    sq_lines = []
    correct_answers = []
    for sq in sub_questions:
        sq_text = sq.get("text", "")
        sq_options = sq.get("options", {})
        sq_correct = str(sq.get("correct_answer", "a")).lower()
        correct_answers.append(sq_correct)

        opts_lines = []
        for k in ["a", "b", "c", "d", "e"]:
            if k in sq_options:
                opts_lines.append(f"          {k}: {ts_string(sq_options[k])}")
        opts_str = "{\n" + ",\n".join(opts_lines) + "\n        }"

        sq_lines.append(
            f"    {{\n"
            f"      text: {ts_string(sq_text)},\n"
            f"      options: {opts_str},\n"
            f"      question_type: \"multiple_choice\",\n"
            f"      correct_answer: \"{sq_correct}\"\n"
            f"    }}"
        )
    questions_str = "[\n" + ",\n".join(sq_lines) + "\n  ]"

    correct_answers_str = "[" + ", ".join(f'"{a}"' for a in correct_answers) + "]"

    lines = [
    f"  {{",
    f"    id: {ts_string(question_id)},",
    f"    question_number: {question_number},",
    f"    section: \"Data Insights\",",
    f"    difficulty: \"{diff}\",",
    f"    difficultyLevel: {diff_level},",
    f"    questionData: {{",
    f"      di_type: \"MSR\",",
    f"      sources: {sources_str},",
    f"      questions: {questions_str},",
    f"      explanation: {ts_string(explanation)},",
    f"    }} as MSRQuestionData,",
    f"    answers: generateMSRAnswers({correct_answers_str}),",
    f"    categories: [\"Multi-Source Reasoning\"],",
    f"  }},"
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Build DI files
# ---------------------------------------------------------------------------

def build_di_files(
    questions: list[dict],
    manifest: dict,
    dry_run: bool,
) -> dict[str, str]:
    """
    Returns a dict mapping output filename → TypeScript content.
    Also updates manifest entries with question_id and typescript_file.
    """
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Group by di_type
    by_type: dict[str, list[dict]] = {"DS": [], "TPA": [], "GI": [], "TA": [], "MSR": []}
    for q in questions:
        di_type = q.get("di_type", "").upper()
        if di_type in by_type:
            by_type[di_type].append(q)
        else:
            print(f"  [WARN] Unknown di_type '{di_type}' for {q.get('gmat_id')} — skipping")

    result: dict[str, str] = {}

    # Shared DI counter across all subtypes
    di_counter = 1

    generators = [
        ("DS",  "data_insights_PQO_DS.ts",  "dataInsightsPQO_DS",  DI_HEADER_DS,  generate_ds_question),
        ("TPA", "data_insights_PQO_TPA.ts", "dataInsightsPQO_TPA", DI_HEADER_TPA, generate_tpa_question),
        ("GI",  "data_insights_PQO_GI.ts",  "dataInsightsPQO_GI",  DI_HEADER_GI,  generate_gi_question),
        ("TA",  "data_insights_PQO_TA.ts",  "dataInsightsPQO_TA",  DI_HEADER_TA,  generate_ta_question),
        ("MSR", "data_insights_PQO_MSR.ts", "dataInsightsPQO_MSR", DI_HEADER_MSR, generate_msr_question),
    ]

    for di_type, filename, export_name, header_template, gen_fn in generators:
        qs = by_type[di_type]
        if not qs:
            print(f"  [INFO] No {di_type} questions found — skipping {filename}")
            continue

        content = header_template.format(date=date)
        for q in qs:
            gmat_id = q.get("gmat_id", "UNKNOWN")
            question_id = format_id("DI", di_counter)

            if not dry_run:
                entry = manifest["entries"].get(gmat_id, {"gmat_id": gmat_id})
                entry["question_id"] = question_id
                entry["typescript_file"] = filename
                entry["typescript_generated_at"] = datetime.now(timezone.utc).isoformat()
                manifest["entries"][gmat_id] = entry

            content += gen_fn(q, question_id, di_counter) + "\n"
            di_counter += 1

        content += DI_FOOTER
        result[filename] = content

    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate TypeScript source files for GMAT PQO questions."
    )
    parser.add_argument(
        "--section",
        choices=["QR", "DI", "both"],
        required=True,
        help="Which section to generate TypeScript for (QR, DI, or both).",
    )
    parser.add_argument(
        "--input",
        type=Path,
        help="Path to extracted QR questions JSON (required for QR or both).",
    )
    parser.add_argument(
        "--di-input",
        type=Path,
        dest="di_input",
        help="Path to extracted DI questions JSON (required for DI or both). "
             "If --section DI, can also use --input instead.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print TypeScript content to stdout instead of writing files.",
    )

    args = parser.parse_args()

    # Resolve DI input path
    di_input_path: Path | None = args.di_input
    if args.section in ("DI",) and di_input_path is None and args.input is not None:
        di_input_path = args.input  # --input can serve double duty for DI

    manifest = load_manifest()
    now_str = datetime.now(timezone.utc).isoformat()

    if args.section in ("QR", "both"):
        if args.input is None:
            parser.error("--input is required for QR generation")
        qr_questions = load_json(args.input)
        print(f"\nGenerating QR TypeScript from {len(qr_questions)} questions...")

        ts_content = build_qr_file(qr_questions, manifest, args.dry_run)

        if args.dry_run:
            print("\n" + "=" * 60)
            print("  [DRY RUN] quantitative_reasoning_PQO.ts")
            print("=" * 60)
            # Print first 60 lines only
            lines = ts_content.splitlines()
            for line in lines[:60]:
                print(line)
            if len(lines) > 60:
                print(f"  ... ({len(lines) - 60} more lines)")
        else:
            out_path = QR_OUT_DIR / "quantitative_reasoning_PQO.ts"
            QR_OUT_DIR.mkdir(parents=True, exist_ok=True)
            out_path.write_text(ts_content, encoding="utf-8")
            print(f"  Written: {out_path}")

    if args.section in ("DI", "both"):
        if di_input_path is None:
            parser.error("--di-input (or --input when --section DI) is required for DI generation")
        di_questions = load_json(di_input_path)
        print(f"\nGenerating DI TypeScript from {len(di_questions)} questions...")

        di_files = build_di_files(di_questions, manifest, args.dry_run)

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
