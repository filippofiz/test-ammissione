#!/usr/bin/env python3
"""
GMAT Screenshot Extractor
=========================
Uses Claude Vision API to extract structured question data from GMAT practice
platform screenshots and outputs JSON ready for TypeScript conversion.

Usage:
    # Extract QR questions
    python extract_screenshots.py --section QR \
        --screenshots-dir "GMAT/sources/official/GMAT Practice QR Online/screenshots" \
        --output "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json"

    # Extract DI questions
    python extract_screenshots.py --section DI \
        --screenshots-dir "GMAT/sources/official/GMAT Practice DI Online/screenshots" \
        --output "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json"

    # Dry run (print result only, no file writes)
    python extract_screenshots.py --section QR ... --dry-run

    # Single question (for testing)
    python extract_screenshots.py --section QR ... --only 4GM116

    # Show pipeline status across all known screenshots
    python extract_screenshots.py --status \
        --screenshots-dir "GMAT/sources/official/GMAT Practice QR Online/screenshots" \
        --output "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json"

Requirements:
    pip install python-dotenv requests
    # Credentials are read from admission-platform-v2/.env automatically:
    #   VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    # No Anthropic key needed locally — the edge function holds it.
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
# Prompts
# ---------------------------------------------------------------------------

QR_SYSTEM_PROMPT = """\
You are an expert GMAT question extractor. You will receive one or more screenshots \
from the official GMAT practice platform showing a Quantitative Reasoning question. \
When multiple images are provided they belong to the same question (e.g. a wide question \
split across two screen captures).

Extract the question data and return ONLY valid JSON — no markdown fences, no prose.

Rules:
- Use LaTeX delimited by $...$ for ALL mathematical expressions (fractions, exponents, \
  variables, subscripts, equations, square roots, etc.). Example: $\\frac{1}{200}$, $x^2$, $\\sqrt{3}$.
- Number formatting rules (apply to ALL text fields):
  - Use a regular hyphen - instead of en-dash (–) or em-dash (—).
  - Wrap dollar amounts in LaTeX: $91.25 → $\\$$91.25$, $1,200 → $\\$$1{,}200$.
  - Wrap percentages in LaTeX: 12% → $12\\%$, 15.6% → $15.6\\%$.
  - Wrap bare standalone numbers in LaTeX: "30 passengers" → "$30$ passengers". \
    Exception: do NOT wrap 4-digit years (1900–2099), time expressions (e.g. 3:00), \
    or ordinals (1st, 2nd, 3rd), or numbers that are part of a word/code.
- Identify the correct answer from the green checkmark on an answer option OR from the \
  sentence "The correct answer is X." in the explanation section.
- `categories`: read the bold header at the top of the explanation section (e.g. "Arithmetic \
  Probability"). Split it into a structured array: the first element is the broad GMAT topic, \
  subsequent elements are sub-topics. Use the canonical list below. If no header is visible, \
  infer categories from the question content.
  Broad topics: Arithmetic, Algebra, Geometry, Statistics, Probability, Word Problems, Number Properties
  Sub-topics (examples): Percents, Fractions, Rate problems, Work problem, Sets, Probability, \
  Ratios, Operations with integers, Operations on rational numbers, Linear systems, \
  Second-degree equations, Inequalities, Applied problems, Coordinate geometry, \
  Solid geometry, Plane geometry, Estimation, Sequences, Functions, Exponents
  Examples of correct output:
    "Arithmetic Probability" → ["Arithmetic", "Probability"]
    "Algebra First-degree equations" → ["Algebra", "First-degree equations"]
    "Arithmetic Rate problems Work problem" → ["Arithmetic", "Rate problems", "Work problem"]
    "Arithmetic Percents" → ["Arithmetic", "Percents"]
    "Algebra Sets Probability" → ["Algebra", "Sets", "Probability"]
- Set `needs_manual_review` to true if any field is uncertain or the image is unclear.
- `has_table` / `has_chart` / `has_image` refer to content in the QUESTION itself \
  (not the explanation). Images that are purely decorative do not count.

Return exactly this JSON shape:
{
  "gmat_id": "<e.g. 4GM184>",
  "question_text": "<full question text with LaTeX>",
  "options": {
    "a": "<option A text with LaTeX>",
    "b": "<option B text>",
    "c": "<option C text>",
    "d": "<option D text>",
    "e": "<option E text>"
  },
  "correct_answer": "<single lowercase letter: a|b|c|d|e>",
  "explanation": "<full explanation text>",
  "categories": ["<broad topic>", "<sub-topic>"],
  "has_table": false,
  "has_chart": false,
  "has_image": false,
  "needs_manual_review": false
}
"""

DI_SYSTEM_PROMPT = """\
You are an expert GMAT question extractor. You will receive one or more screenshots \
from the official GMAT practice platform showing a Data Insights question. \
When multiple images are provided they belong to the same question (tabs, scrolled views, etc.).

First identify the DI subtype:
- DS  = Data Sufficiency (problem + two statements + A-E options)
- TPA = Two-Part Analysis (two-column selection grid)
- TA  = Table Analysis (sortable table + Yes/No statements)
- GI  = Graphics Interpretation (chart/graph + fill-in-the-blank statement)
- MSR = Multi-Source Reasoning (tabbed sources + sub-questions)

Extract the question data and return ONLY valid JSON — no markdown fences, no prose.

Rules:
- Use LaTeX $...$ for ALL mathematical expressions.
- Number formatting rules (apply to ALL text fields):
  - Use a regular hyphen - instead of en-dash (–) or em-dash (—).
  - Wrap dollar amounts in LaTeX: $91.25 → $\\$$91.25$, $1,200 → $\\$$1{,}200$.
  - Wrap percentages in LaTeX: 12% → $12\\%$, 15.6% → $15.6\\%$.
  - Wrap bare standalone numbers in LaTeX: "30 rows" → "$30$ rows". \
    Exception: do NOT wrap 4-digit years (1900–2099), time expressions (e.g. 3:00), \
    or ordinals (1st, 2nd, 3rd), or numbers that are part of a word/code.
- Identify correct answers from green checkmarks OR "The correct answer is X" text.
- Set `needs_manual_review` to true if any field is uncertain or the image is unclear.

Return exactly ONE of these JSON shapes depending on the subtype:

DS:
{
  "di_type": "DS",
  "gmat_id": "<e.g. 8GM204>",
  "problem": "<problem statement>",
  "statement1": "<(1) statement text>",
  "statement2": "<(2) statement text>",
  "correct_answer": "<A|B|C|D|E>",
  "explanation": "<full explanation text>",
  "needs_manual_review": false
}

TPA:
{
  "di_type": "TPA",
  "gmat_id": "<e.g. 8GM193>",
  "scenario": "<passage/scenario text>",
  "column1_title": "<e.g. Most Strengthen>",
  "column2_title": "<e.g. Most Weaken>",
  "shared_options": ["<option text>", "..."],
  "correct_col1": "<exact option text for column 1>",
  "correct_col2": "<exact option text for column 2>",
  "explanation": "<full explanation text>",
  "needs_manual_review": false
}

TA:
{
  "di_type": "TA",
  "gmat_id": "<e.g. 8GM127>",
  "table_title": "<title above the table>",
  "stimulus_text": "<instruction paragraph above the table, e.g. 'For each of the following...'>",
  "column_headers": ["<header1>", "<header2>", "..."],
  "table_data": [["<row1col1>", "<row1col2>", "..."], ["<row2col1>", "..."]],
  "statements": [
    {"text": "<statement text>", "is_true": true},
    {"text": "<statement text>", "is_true": false}
  ],
  "answer_col1_title": "<e.g. Yes>",
  "answer_col2_title": "<e.g. No>",
  "statement_column_title": "<e.g. Statement>",
  "explanation": "<full explanation>",
  "needs_manual_review": false
}

GI:
{
  "di_type": "GI",
  "gmat_id": "<e.g. 8GM147>",
  "context_text": "<background/scenario text above the chart>",
  "statement_text": "<the fill-in sentence using [BLANK1] and [BLANK2] as placeholders>",
  "blank1_options": ["<opt1>", "<opt2>", "..."],
  "blank1_correct": "<correct option text for blank 1>",
  "blank2_options": ["<opt1>", "<opt2>", "..."],
  "blank2_correct": "<correct option text for blank 2>",
  "chart_title": "<title of the chart or empty string>",
  "chart_type": "<bar|line|scatter|pie|other>",
  "chart_description": "<detailed prose description of the chart: axes, scale, data series, approximate values at key points>",
  "chart_data_points": "<JSON-serialisable object with extracted numeric data if readable, else null>",
  "explanation": "<full explanation>",
  "needs_manual_review": false
}

MSR:
{
  "di_type": "MSR",
  "gmat_id": "<e.g. 8GM169>",
  "sources": [
    {"tab_name": "<tab label>", "content": "<full text content of this tab>"}
  ],
  "questions": [
    {
      "text": "<sub-question text>",
      "options": {"a": "...", "b": "...", "c": "...", "d": "...", "e": "..."},
      "correct_answer": "<a|b|c|d|e or Yes/No if boolean>"
    }
  ],
  "explanation": "<full explanation>",
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


def parse_screenshot_filename(stem: str) -> tuple[str, str | None]:
    """
    Parse a screenshot filename stem into (gmat_id, difficulty).

    Supported formats:
      4GM116               → ('4GM116', None)
      4GM134_medium        → ('4GM134', 'medium')
      4GM126_hard          → ('4GM126', 'hard')
      4GM154_medium_a      → ('4GM154', 'medium')   ← multi-part
      4GM154_medium_b      → ('4GM154', 'medium')   ← same group
      8GM127_a             → ('8GM127', None)        ← old DI format, no difficulty
      8GM127_b             → ('8GM127', None)
    """
    DIFFICULTIES = {"easy", "medium", "hard"}
    parts = stem.split("_")

    gmat_id = parts[0]
    difficulty: str | None = None

    # Walk remaining parts: collect difficulty if found, ignore single-letter part suffixes
    for part in parts[1:]:
        if part in DIFFICULTIES:
            difficulty = part
        # single lowercase letter = multi-part suffix (_a, _b, _c) — skip
        # anything else is unexpected but we just ignore it

    return gmat_id, difficulty


def group_screenshots(screenshots_dir: Path) -> dict[str, tuple[list[Path], str | None]]:
    """
    Group PNG files by their base GMAT ID.

    Returns a dict mapping gmat_id → (sorted list of Paths, difficulty | None).

    Examples:
      '4GM116.png'           → '4GM116': ([...], None)
      '4GM134_medium.png'    → '4GM134': ([...], 'medium')
      '4GM154_medium_a.png'
      '4GM154_medium_b.png'  → '4GM154': ([..._a, ..._b], 'medium')
      '8GM127_a.png'
      '8GM127_b.png'         → '8GM127': ([..._a, ..._b], None)
    """
    groups: dict[str, list[Path]] = defaultdict(list)
    difficulties: dict[str, str | None] = {}

    for p in sorted(screenshots_dir.glob("*.png")):
        gmat_id, difficulty = parse_screenshot_filename(p.stem)
        groups[gmat_id].append(p)
        # Keep difficulty if found (consistent across parts of the same question)
        if difficulty is not None:
            difficulties[gmat_id] = difficulty
        elif gmat_id not in difficulties:
            difficulties[gmat_id] = None

    return {
        k: (sorted(v), difficulties.get(k))
        for k, v in sorted(groups.items())
    }


def parse_claude_json(raw: str, gmat_id: str) -> dict | None:
    """Extract JSON from Claude response, stripping any accidental markdown fences."""
    raw = raw.strip()
    # Remove markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"  [WARN] JSON parse error for {gmat_id}: {e}")
        return None


def call_edge_function(supabase_url: str, service_key: str, section: str, images: list[Path]) -> tuple[str, dict]:
    """
    Call the extract-from-screenshot Supabase edge function.
    Returns (response_text, usage_dict).
    The edge function holds the Claude API key — no local key needed.
    """
    endpoint = f"{supabase_url.rstrip('/')}/functions/v1/extract-from-screenshot"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {service_key}",
    }
    payload = {
        "section": section,
        "images": [image_to_base64(p) for p in images],
    }

    for attempt in range(3):
        try:
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=120)
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
    section: str,
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
        print("  Both keys are already present in admission-platform-v2/.env")
        sys.exit(1)

    # Load existing extracted questions (keyed by gmat_id) for idempotency
    existing_questions: list[dict] = load_json(output_path) if not dry_run else []
    existing_ids = {q["gmat_id"] for q in existing_questions}

    manifest = load_manifest()
    groups = group_screenshots(screenshots_dir)

    if only:
        if only not in groups:
            print(f"ERROR: Screenshot group '{only}' not found in {screenshots_dir}")
            print(f"  Available: {', '.join(groups.keys())}")
            sys.exit(1)
        groups = {only: groups[only]}

    total_input = 0
    total_output = 0
    extracted_count = 0
    skipped_count = 0
    failed_ids = []

    print(f"\n{'='*60}")
    print(f"  Section: {section} | Via: extract-from-screenshot edge function")
    print(f"  Screenshots dir: {screenshots_dir}")
    print(f"  Output: {output_path}")
    print(f"  Questions found: {len(groups)} | Already extracted: {len(existing_ids)}")
    print(f"  Dry run: {dry_run}")
    print(f"{'='*60}\n")

    for gmat_id, (image_paths, difficulty) in groups.items():
        if gmat_id in existing_ids:
            print(f"  [SKIP] {gmat_id} (already extracted)")
            skipped_count += 1
            continue

        filenames = [p.name for p in image_paths]
        diff_label = f" [{difficulty}]" if difficulty else ""
        print(f"  [EXTRACT] {gmat_id}{diff_label} ({len(image_paths)} image(s): {filenames})")

        try:
            raw_response, usage = call_edge_function(supabase_url, service_key, section, image_paths)
            total_input += usage["input_tokens"]
            total_output += usage["output_tokens"]

            parsed = parse_claude_json(raw_response, gmat_id)

            if parsed is None:
                # Save raw response for manual recovery
                failed_dir = output_path.parent / "failed"
                failed_dir.mkdir(parents=True, exist_ok=True)
                (failed_dir / f"{gmat_id}.txt").write_text(raw_response, encoding="utf-8")
                parsed = {
                    "gmat_id": gmat_id,
                    "needs_manual_review": True,
                    "_error": "JSON parse failed — see extracted/failed/ for raw response",
                }
                failed_ids.append(gmat_id)
            else:
                # Ensure gmat_id is consistent
                parsed["gmat_id"] = gmat_id
                # Inject difficulty from filename if not already set by Claude
                if difficulty and not parsed.get("difficulty"):
                    parsed["difficulty"] = difficulty

            if dry_run:
                print(f"    [DRY RUN] Would write:")
                print(json.dumps(parsed, indent=4, ensure_ascii=False))
            else:
                existing_questions.append(parsed)
                save_json(output_path, existing_questions)

                # Update manifest
                now = datetime.now(timezone.utc).isoformat()
                entry = manifest["entries"].get(gmat_id, {})
                entry.update({
                    "gmat_id": gmat_id,
                    "section": section,
                    "difficulty": parsed.get("difficulty") or difficulty,
                    "di_type": parsed.get("di_type"),
                    "source_screenshots": filenames,
                    "extracted_at": now,
                    "question_id": None,          # filled by generate_pqo_typescript.py
                    "typescript_file": None,
                    "typescript_generated_at": None,
                    "image_reconstructed": False,
                    "image_uploaded": False,
                    "imported_to_db": False,
                    "imported_at": None,
                    "db_row_id": None,
                    "needs_manual_review": parsed.get("needs_manual_review", False),
                })
                manifest["entries"][gmat_id] = entry
                save_manifest(manifest)

            extracted_count += 1
            review_flag = " [NEEDS REVIEW]" if parsed.get("needs_manual_review") else ""
            cost_str = format_cost(usage["input_tokens"], usage["output_tokens"])
            print(f"    OK | tokens in={usage['input_tokens']} out={usage['output_tokens']} cost~{cost_str}{review_flag}")

        except Exception as e:
            print(f"    [ERROR] {gmat_id}: {e}")
            failed_ids.append(gmat_id)

        # Polite delay between API calls
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
# Status display
# ---------------------------------------------------------------------------

def show_status(screenshots_dir: Path, output_path: Path) -> None:
    groups = group_screenshots(screenshots_dir)
    extracted: list[dict] = load_json(output_path) if output_path.exists() else []
    extracted_ids = {q["gmat_id"] for q in extracted}
    manifest = load_manifest()

    needs_review = [q["gmat_id"] for q in extracted if q.get("needs_manual_review")]
    imported = [e["gmat_id"] for e in manifest["entries"].values() if e.get("imported_to_db")]
    ts_generated = [e["gmat_id"] for e in manifest["entries"].values() if e.get("typescript_generated_at")]
    img_reconstructed = [e["gmat_id"] for e in manifest["entries"].values() if e.get("image_reconstructed")]

    total = len(groups)
    print(f"\n{'='*60}")
    print(f"  Pipeline Status — {screenshots_dir.name}")
    print(f"{'='*60}")
    print(f"  Screenshots found :  {total}")
    print(f"  Extracted          :  {len(extracted_ids)}/{total}")
    print(f"  Needs manual review:  {len(needs_review)}")
    print(f"  TypeScript generated: {len(ts_generated)}/{total}")
    print(f"  GI images rebuilt  :  {len(img_reconstructed)}")
    print(f"  Imported to DB     :  {len(imported)}/{total}")

    pending = [gid for gid in groups if gid not in extracted_ids]
    if pending:
        print(f"\n  Pending extraction ({len(pending)}): {', '.join(pending)}")
    if needs_review:
        print(f"\n  Needs review: {', '.join(needs_review)}")
    print(f"{'='*60}\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Extract GMAT questions from screenshots using Claude Vision API."
    )
    parser.add_argument(
        "--section",
        choices=["QR", "DI"],
        help="Section to extract (QR or DI). Required unless --status.",
    )
    parser.add_argument(
        "--screenshots-dir",
        type=Path,
        help="Directory containing the screenshot PNG files.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Path to the output JSON file (created/appended).",
    )
    parser.add_argument(
        "--only",
        metavar="GMAT_ID",
        help="Extract only a single question group by its base GMAT ID (e.g. 4GM116).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print extracted JSON to stdout only. Do not write any files.",
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Show pipeline status for the given screenshots dir and output file.",
    )

    args = parser.parse_args()

    if args.status:
        if not args.screenshots_dir or not args.output:
            parser.error("--status requires --screenshots-dir and --output")
        show_status(args.screenshots_dir, args.output)
        return

    if not args.section:
        parser.error("--section is required")
    if not args.screenshots_dir:
        parser.error("--screenshots-dir is required")
    if not args.output:
        parser.error("--output is required")

    if not args.screenshots_dir.exists():
        print(f"ERROR: Screenshots directory not found: {args.screenshots_dir}")
        sys.exit(1)

    extract_questions(
        section=args.section,
        screenshots_dir=args.screenshots_dir,
        output_path=args.output,
        only=args.only,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
