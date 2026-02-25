#!/usr/bin/env python3
"""
GMAT Online Question Bank (OQBK) Extractor
===========================================
Uses Claude Vision API to extract GI and TA questions from the
"GMAT Online Question Bank" screenshot pool (Data Insights GI - TA Custom Pool).

Screenshot layout in the source directory:
  XXXXXX_difficulty_a.png   ← question/statements screen
  XXXXXX_difficulty_b.png   ← explanation screen
  charts/original/XXXXXX.png  ← isolated chart image (GI questions only)
  tables/original/XXXXXX.png  ← isolated table image (TA questions only)

For GI questions, both the question screenshot AND the isolated chart image
are passed to Claude for accurate data extraction.
For TA questions, the table screenshot is also passed to Claude for accurate
table data extraction.

Output:
  GMAT/sources/official/GMAT Online Question Bank/extracted/questions.json

Usage:
    # Extract all GI and TA questions
    python extract_oqbk.py \\
        --screenshots-dir "admission-platform-v2/GMAT/sources/official/GMAT Online Question Bank/screenshots/Data Insights GI - TA Custom Pool" \\
        --output "admission-platform-v2/GMAT/sources/official/GMAT Online Question Bank/extracted/questions.json"

    # Dry run (print result, no file writes)
    python extract_oqbk.py ... --dry-run

    # Single question (for testing)
    python extract_oqbk.py ... --only 100311
"""

import argparse
import base64
import json
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import requests

# Auto-load .env from the repo root (admission-platform-v2/.env)
_env_path = Path(__file__).parent.parent.parent / ".env"
if _env_path.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(_env_path)
    except ImportError:
        pass  # dotenv not installed — rely on env vars being set manually

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Cost per million tokens (claude-opus-4-5 pricing)
INPUT_COST_PER_M = 15.0
OUTPUT_COST_PER_M = 75.0

MANIFEST_PATH = Path(__file__).parent / "manifest.json"

# ---------------------------------------------------------------------------
# Prompts (same DI prompt as extract_screenshots.py with extra image context)
# ---------------------------------------------------------------------------

OQBK_GI_SYSTEM_PROMPT = """\
You are an expert GMAT question extractor. You will receive screenshots from the official
GMAT Online Question Bank showing a Graphics Interpretation (GI) Data Insights question.

The images provided are (in order):
  1. Question screenshot: shows the context text, fill-in-the-blank statement, dropdown options,
     and the answer (green checkmarks or "The correct answer is" text in the explanation).
  2. Explanation screenshot: shows the full explanation.
  3. Isolated chart image: a clean, high-quality crop of just the chart/graph.

Use ALL images together to extract the full question data accurately.

Extract the question data and return ONLY valid JSON — no markdown fences, no prose.

Rules:
- Use LaTeX $...$ for ALL mathematical expressions.
- Number formatting rules (apply to ALL text fields):
  - Use a regular hyphen - instead of en-dash (–) or em-dash (—).
  - Wrap dollar amounts in LaTeX: $91.25 → $\\$$91.25$, $1,200 → $\\$$1{,}200$.
  - Wrap percentages in LaTeX: 12% → $12\\%$, 15.6% → $15.6\\%$.
  - Wrap bare standalone numbers in LaTeX: "30 rows" → "$30$ rows".
    Exception: do NOT wrap 4-digit years (1900–2099), time expressions (e.g. 3:00),
    or ordinals (1st, 2nd, 3rd), or numbers that are part of a word/code.
- Identify correct answers from green checkmarks OR "The correct answer is X" text.
- The statement_text must use [BLANK1] and [BLANK2] as placeholders for the dropdown blanks.
- blank1_options and blank2_options: list ALL options visible in the dropdown (not just the correct one).
- chart_description: detailed prose description of the chart using the isolated chart image —
  describe axes, scale, units, data series, legend, and approximate values at key points.
- chart_data_points: extract numeric data from the chart as a JSON object (e.g. {"2010": 45, "2015": 62}).
  If values are not precisely readable, provide best estimates.
- Set needs_manual_review to true if any field is uncertain.

Return exactly this JSON shape:
{
  "di_type": "GI",
  "gmat_id": "<numeric ID e.g. 100311>",
  "context_text": "<background/scenario text above the chart>",
  "statement_text": "<the fill-in sentence using [BLANK1] and [BLANK2] as placeholders>",
  "blank1_options": ["<opt1>", "<opt2>", "..."],
  "blank1_correct": "<correct option text for blank 1>",
  "blank2_options": ["<opt1>", "<opt2>", "..."],
  "blank2_correct": "<correct option text for blank 2>",
  "chart_title": "<title of the chart or empty string>",
  "chart_type": "<bar|line|scatter|pie|bubble|other>",
  "chart_description": "<detailed prose description of the chart from the isolated chart image>",
  "chart_data_points": "<JSON-serialisable object with extracted numeric data, or null>",
  "explanation": "<full explanation text>",
  "needs_manual_review": false
}
"""

OQBK_TA_SYSTEM_PROMPT = """\
You are an expert GMAT question extractor. You will receive screenshots from the official
GMAT Online Question Bank showing a Table Analysis (TA) Data Insights question.

The images provided are (in order):
  1. Question screenshot: shows the stimulus text, statements, and correct answers
     (green checkmarks or "The correct answer is" text in the explanation).
  2. Explanation screenshot: shows the full explanation.
  3. Isolated table image: a clean, high-quality crop of just the data table.

Use ALL images together to extract the full question data accurately.
Pay special attention to the isolated table image for precise column headers and all table rows.

Extract the question data and return ONLY valid JSON — no markdown fences, no prose.

Rules:
- Use LaTeX $...$ for ALL mathematical expressions.
- Number formatting rules (apply to ALL text fields):
  - Use a regular hyphen - instead of en-dash (–) or em-dash (—).
  - Wrap dollar amounts in LaTeX: $91.25 → $\\$$91.25$, $1,200 → $\\$$1{,}200$.
  - Wrap percentages in LaTeX: 12% → $12\\%$, 15.6% → $15.6\\%$.
  - Wrap bare standalone numbers in LaTeX: "30 rows" → "$30$ rows".
    Exception: do NOT wrap 4-digit years (1900–2099), time expressions (e.g. 3:00),
    or ordinals (1st, 2nd, 3rd), or numbers that are part of a word/code.
- Identify correct answers from green checkmarks OR "The correct answer is" text in the explanation.
- table_data: extract ALL rows from the table (use the isolated table image for accuracy).
  Each row is an array of cell values matching the column_headers order.
- statements: extract ALL statements from the question; set is_true based on the correct answer.
- Set needs_manual_review to true if any field is uncertain or if the table is hard to read.

Return exactly this JSON shape:
{
  "di_type": "TA",
  "gmat_id": "<numeric ID e.g. 100312>",
  "table_title": "<title above the table, or empty string>",
  "stimulus_text": "<instruction paragraph, e.g. 'The table shows...' and 'For each of the following...'>",
  "column_headers": ["<header1>", "<header2>", "..."],
  "table_data": [["<row1col1>", "<row1col2>", "..."], ["<row2col1>", "..."]],
  "statements": [
    {"text": "<statement text>", "is_true": true},
    {"text": "<statement text>", "is_true": false}
  ],
  "answer_col1_title": "<e.g. Yes>",
  "answer_col2_title": "<e.g. No>",
  "statement_column_title": "<e.g. Statement>",
  "explanation": "<full explanation text>",
  "needs_manual_review": false
}
"""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_json(path: Path) -> list | dict:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"version": 1, "entries": {}}


def save_manifest(manifest: dict) -> None:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)


def image_to_base64(path: Path) -> str:
    with open(path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")


def parse_oqbk_filename(stem: str) -> tuple[str, str | None]:
    """
    Parse an OQBK screenshot filename stem into (question_id, difficulty).

    Supported formats:
      100311_hard_a   → ('100311', 'hard')
      100311_hard_b   → ('100311', 'hard')
      100312_easy_a   → ('100312', 'easy')
      100356_medium_a → ('100356', 'medium')
    """
    DIFFICULTIES = {"easy", "medium", "hard"}
    parts = stem.split("_")

    question_id = parts[0]
    difficulty: str | None = None

    for part in parts[1:]:
        if part in DIFFICULTIES:
            difficulty = part
        # single lowercase letter = multi-part suffix (_a, _b) — skip

    return question_id, difficulty


def group_screenshots(screenshots_dir: Path) -> dict[str, tuple[list[Path], str | None]]:
    """
    Group PNG files in the root of screenshots_dir by their numeric question ID.
    Ignores subdirectories (charts/, tables/).

    Returns a dict mapping question_id → (sorted list of question screenshot Paths, difficulty | None).
    """
    groups: dict[str, list[Path]] = defaultdict(list)
    difficulties: dict[str, str | None] = {}

    # Only look at files directly in screenshots_dir (not subdirs)
    for p in sorted(screenshots_dir.glob("*.png")):
        if not p.is_file():
            continue
        question_id, difficulty = parse_oqbk_filename(p.stem)
        groups[question_id].append(p)
        if difficulty is not None:
            difficulties[question_id] = difficulty
        elif question_id not in difficulties:
            difficulties[question_id] = None

    return {
        k: (sorted(v), difficulties.get(k))
        for k, v in sorted(groups.items())
    }


def detect_di_type(question_id: str, screenshots_dir: Path) -> str:
    """Detect GI or TA based on which pre-isolated image subdirectory has the question."""
    chart_path = screenshots_dir / "charts" / "original" / f"{question_id}.png"
    table_path = screenshots_dir / "tables" / "original" / f"{question_id}.png"
    if chart_path.exists():
        return "GI"
    if table_path.exists():
        return "TA"
    # Fallback: try to detect from filename or return unknown
    return "UNKNOWN"


def parse_claude_json(raw: str, question_id: str) -> dict | None:
    """Extract JSON from Claude response, stripping any accidental markdown fences."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"  [WARN] JSON parse error for {question_id}: {e}")
        return None


def call_edge_function_custom(
    supabase_url: str,
    service_key: str,
    section: str,
    images: list[Path],
    system_prompt: str,
) -> tuple[str, dict]:
    """
    Call the extract-from-screenshot Supabase edge function with a custom system prompt.
    The edge function accepts an optional 'system_prompt' override field.
    Returns (response_text, usage_dict).
    """
    endpoint = f"{supabase_url.rstrip('/')}/functions/v1/extract-from-screenshot"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {service_key}",
    }
    payload = {
        "section": section,
        "images": [image_to_base64(p) for p in images],
        "system_prompt": system_prompt,
    }

    for attempt in range(3):
        try:
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=180)
            if resp.status_code == 429:
                wait = 2 ** (attempt + 2)
                print(f"  [RATE LIMIT] Waiting {wait}s before retry...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("raw_text", "")
            usage = data.get("usage", {"input_tokens": 0, "output_tokens": 0})
            return raw_text, usage
        except requests.HTTPError as e:
            if attempt == 2:
                raise RuntimeError(f"Edge function error: {e} — {resp.text}") from e
            print(f"  [HTTP ERROR] {e}. Retrying in 5s...")
            time.sleep(5)
        except requests.RequestException as e:
            if attempt == 2:
                raise RuntimeError(f"Request failed: {e}") from e
            print(f"  [REQUEST ERROR] {e}. Retrying in 5s...")
            time.sleep(5)

    raise RuntimeError("All retries exhausted")


def format_cost(input_tokens: int, output_tokens: int) -> str:
    cost = (input_tokens / 1_000_000 * INPUT_COST_PER_M) + (output_tokens / 1_000_000 * OUTPUT_COST_PER_M)
    return f"${cost:.4f}"


# ---------------------------------------------------------------------------
# Core extraction
# ---------------------------------------------------------------------------

def extract_questions(
    screenshots_dir: Path,
    output_path: Path,
    only: str | None = None,
    dry_run: bool = False,
) -> None:
    supabase_url = os.environ.get("VITE_SUPABASE_URL", "").strip()
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if not supabase_url or not service_key:
        print("ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
        print(f"  Looking for .env at: {_env_path}")
        sys.exit(1)

    # Load existing extracted questions for idempotency
    existing_questions: list[dict] = load_json(output_path) if not dry_run else []
    existing_ids = {q["gmat_id"] for q in existing_questions}

    manifest = load_manifest()
    groups = group_screenshots(screenshots_dir)

    if only:
        if only not in groups:
            print(f"ERROR: Question group '{only}' not found in {screenshots_dir}")
            print(f"  Available: {', '.join(groups.keys())}")
            sys.exit(1)
        groups = {only: groups[only]}

    total_input = 0
    total_output = 0
    extracted_count = 0
    skipped_count = 0
    failed_ids = []

    print(f"\n{'='*60}")
    print(f"  Source: GMAT Online Question Bank (OQBK)")
    print(f"  Screenshots dir: {screenshots_dir}")
    print(f"  Output: {output_path}")
    print(f"  Questions found: {len(groups)} | Already extracted: {len(existing_ids)}")
    print(f"  Dry run: {dry_run}")
    print(f"{'='*60}\n")

    for question_id, (image_paths, difficulty) in groups.items():
        if question_id in existing_ids:
            print(f"  [SKIP] {question_id} (already extracted)")
            skipped_count += 1
            continue

        # Detect question type from pre-isolated image subdirectories
        di_type = detect_di_type(question_id, screenshots_dir)
        if di_type == "UNKNOWN":
            print(f"  [SKIP] {question_id} — cannot determine GI or TA (no chart/table image found)")
            failed_ids.append(question_id)
            continue

        # Build image list: question screenshots + pre-isolated chart/table
        all_images = list(image_paths)  # sorted _a, _b screenshots
        if di_type == "GI":
            chart_path = screenshots_dir / "charts" / "original" / f"{question_id}.png"
            if chart_path.exists():
                all_images.append(chart_path)
                print(f"    + chart: {chart_path.name}")
            system_prompt = OQBK_GI_SYSTEM_PROMPT
        else:  # TA
            table_path = screenshots_dir / "tables" / "original" / f"{question_id}.png"
            if table_path.exists():
                all_images.append(table_path)
                print(f"    + table: {table_path.name}")
            system_prompt = OQBK_TA_SYSTEM_PROMPT

        filenames = [p.name for p in image_paths]
        diff_label = f" [{difficulty}]" if difficulty else ""
        print(f"  [EXTRACT] {question_id} [{di_type}]{diff_label} ({len(image_paths)} screenshots + 1 {di_type.lower()} image)")

        try:
            raw_response, usage = call_edge_function_custom(
                supabase_url, service_key, "DI", all_images, system_prompt
            )
            total_input += usage["input_tokens"]
            total_output += usage["output_tokens"]

            parsed = parse_claude_json(raw_response, question_id)

            if parsed is None:
                failed_dir = output_path.parent / "failed"
                failed_dir.mkdir(parents=True, exist_ok=True)
                (failed_dir / f"{question_id}.txt").write_text(raw_response, encoding="utf-8")
                parsed = {
                    "gmat_id": question_id,
                    "di_type": di_type,
                    "needs_manual_review": True,
                    "_error": "JSON parse failed — see extracted/failed/ for raw response",
                }
                failed_ids.append(question_id)
            else:
                # Always override gmat_id with the filename-derived ID
                parsed["gmat_id"] = question_id
                # Inject difficulty from filename if not set by Claude
                if difficulty and not parsed.get("difficulty"):
                    parsed["difficulty"] = difficulty

            if dry_run:
                print(f"    [DRY RUN] Would write:")
                print(json.dumps(parsed, indent=4, ensure_ascii=True))
            else:
                existing_questions.append(parsed)
                save_json(output_path, existing_questions)

                # Update manifest
                now = datetime.now(timezone.utc).isoformat()
                entry = manifest["entries"].get(question_id, {})
                entry.update({
                    "gmat_id": question_id,
                    "section": "DI",
                    "source": "OQBK",
                    "difficulty": parsed.get("difficulty") or difficulty,
                    "di_type": di_type,
                    "source_screenshots": filenames,
                    "extracted_at": now,
                    "question_id": None,
                    "typescript_file": None,
                    "typescript_generated_at": None,
                    "image_reconstructed": False,
                    "image_uploaded": False,
                    "imported_to_db": False,
                    "imported_at": None,
                    "db_row_id": None,
                    "needs_manual_review": parsed.get("needs_manual_review", False),
                })
                manifest["entries"][question_id] = entry
                save_manifest(manifest)

            extracted_count += 1
            review_flag = " [NEEDS REVIEW]" if parsed.get("needs_manual_review") else ""
            cost_str = format_cost(usage["input_tokens"], usage["output_tokens"])
            print(f"    OK | tokens in={usage['input_tokens']} out={usage['output_tokens']} cost~{cost_str}{review_flag}")

        except Exception as e:
            print(f"    [ERROR] {question_id}: {e}")
            failed_ids.append(question_id)

        if not dry_run:
            time.sleep(1.0)

    print(f"\n{'='*60}")
    print(f"  Done.")
    print(f"  Extracted: {extracted_count} | Skipped: {skipped_count} | Failed: {len(failed_ids)}")
    print(f"  Total tokens: in={total_input} out={total_output}")
    print(f"  Estimated cost: {format_cost(total_input, total_output)}")
    if failed_ids:
        print(f"  Failed IDs: {', '.join(failed_ids)}")
    print(f"{'='*60}\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Extract GMAT Online Question Bank GI/TA questions from screenshots."
    )
    parser.add_argument(
        "--screenshots-dir",
        type=Path,
        required=True,
        help="Path to the 'Data Insights GI - TA Custom Pool' screenshots directory.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Path to the output JSON file (created/appended).",
    )
    parser.add_argument(
        "--only",
        metavar="QUESTION_ID",
        help="Extract only a single question by its numeric ID (e.g. 100311).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print extracted JSON to stdout only. Do not write any files.",
    )

    args = parser.parse_args()

    if not args.screenshots_dir.exists():
        print(f"ERROR: Screenshots directory not found: {args.screenshots_dir}")
        sys.exit(1)

    extract_questions(
        screenshots_dir=args.screenshots_dir,
        output_path=args.output,
        only=args.only,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
