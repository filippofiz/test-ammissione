#!/usr/bin/env python3
"""
GMAT GI Chart Reconstructor
============================
For each GI (Graphics Interpretation) question extracted by extract_screenshots.py,
this script calls Claude Vision via the reconstruct-gi-chart Supabase edge function
to generate a faithful Python matplotlib reproduction of the original chart.

The generated Python code is executed locally in a subprocess to produce a PNG file
saved to GMAT/sources/questions/DI/images/.

TA (Table Analysis) questions do NOT need reconstruction — their tables render natively
from the columnHeaders / tableData arrays in TAQuestion.tsx.

Usage:
    # Reconstruct all GI charts from extracted DI questions
    python reconstruct_di_images.py \\
        --input "GMAT/sources/official/GMAT Practice DI Online/extracted/questions.json" \\
        --screenshots-dir "GMAT/sources/official/GMAT Practice DI Online/screenshots" \\
        --output-dir "GMAT/sources/questions/DI/images" \\
        --id-prefix "DI-GMAT-PQO_"

    # Test a single question (dry-run: prints Python code, does not execute)
    python reconstruct_di_images.py ... --only 8GM147 --dry-run

    # Show reconstruction status
    python reconstruct_di_images.py ... --status

Requirements:
    pip install python-dotenv requests matplotlib numpy pandas
    # Credentials read from admission-platform-v2/.env automatically:
    #   VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
"""

import argparse
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import requests

# Auto-load .env from the repo root
_env_path = Path(__file__).parent.parent.parent / ".env"
if _env_path.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(_env_path)
    except ImportError:
        pass

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Cost per million tokens (claude-opus-4-5 pricing)
INPUT_COST_PER_M = 15.0
OUTPUT_COST_PER_M = 75.0

MANIFEST_PATH = Path(__file__).parent / "manifest.json"

# ---------------------------------------------------------------------------
# Shared helpers (mirrors extract_screenshots.py)
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


def parse_screenshot_filename(stem: str) -> str:
    """Return the base GMAT ID from a screenshot filename stem."""
    DIFFICULTIES = {"easy", "medium", "hard"}
    parts = stem.split("_")
    return parts[0]


def find_screenshots_for(gmat_id: str, screenshots_dir: Path) -> list[Path]:
    """
    Return sorted list of PNG files belonging to a given GMAT ID.
    Handles single-file and multi-part (_a, _b, _c) naming conventions.
    """
    matches = []
    for p in screenshots_dir.glob("*.png"):
        if parse_screenshot_filename(p.stem) == gmat_id:
            matches.append(p)
    return sorted(matches)


def format_cost(input_tokens: int, output_tokens: int) -> str:
    cost = (input_tokens / 1_000_000 * INPUT_COST_PER_M) + (output_tokens / 1_000_000 * OUTPUT_COST_PER_M)
    return f"${cost:.4f}"


# ---------------------------------------------------------------------------
# Edge function call
# ---------------------------------------------------------------------------

def call_reconstruct_function(
    supabase_url: str,
    service_key: str,
    screenshots: list[Path],
    chart_title: str,
    chart_type: str,
    chart_description: str,
    chart_data_points,
) -> tuple[str, dict]:
    """
    Call the reconstruct-gi-chart Supabase edge function.
    Returns (python_code, usage_dict).
    """
    endpoint = f"{supabase_url.rstrip('/')}/functions/v1/reconstruct-gi-chart"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {service_key}",
    }
    payload = {
        "images": [image_to_base64(p) for p in screenshots],
        "chart_title": chart_title or "",
        "chart_type": chart_type or "unknown",
        "chart_description": chart_description or "",
        "chart_data_points": chart_data_points,
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
            python_code = data.get("python_code", "")
            usage = data.get("usage", {"input_tokens": 0, "output_tokens": 0})
            return python_code, usage
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


# ---------------------------------------------------------------------------
# Python code execution
# ---------------------------------------------------------------------------

def strip_code_fences(code: str) -> str:
    """Remove accidental markdown code fences from Claude output."""
    code = code.strip()
    code = re.sub(r"^```(?:python)?\s*\n?", "", code)
    code = re.sub(r"\n?```\s*$", "", code)
    return code.strip()


def ensure_save_line(code: str) -> str:
    """
    Guarantee the generated code ends with the correct save call.
    If plt.savefig is missing or uses a different filename, inject/fix it.
    """
    if "plt.savefig" not in code:
        code = code.rstrip()
        code += "\nplt.savefig('output.png', dpi=150, bbox_inches='tight', facecolor='white')\nplt.close()\n"
    else:
        # Normalise the filename to 'output.png'
        code = re.sub(
            r"plt\.savefig\(['\"].*?['\"]",
            "plt.savefig('output.png'",
            code,
        )
    # Remove any plt.show() calls that would hang
    code = re.sub(r"plt\.show\(\)\s*", "", code)
    return code


def execute_python_code(python_code: str, gmat_id: str) -> Path | None:
    """
    Execute the matplotlib Python code in a temp directory.
    Returns the path to the generated output.png, or None on failure.
    """
    code = strip_code_fences(python_code)
    code = ensure_save_line(code)

    with tempfile.TemporaryDirectory(prefix=f"gi_chart_{gmat_id}_") as tmpdir:
        script_path = Path(tmpdir) / "generate_chart.py"
        output_path = Path(tmpdir) / "output.png"
        script_path.write_text(code, encoding="utf-8")

        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=tmpdir,
            capture_output=True,
            text=True,
            timeout=60,
        )

        if result.returncode != 0:
            print(f"  [EXEC ERROR] Python exited with code {result.returncode}")
            if result.stderr:
                # Print first 20 lines of stderr
                stderr_lines = result.stderr.strip().splitlines()
                for line in stderr_lines[:20]:
                    print(f"    {line}")
                if len(stderr_lines) > 20:
                    print(f"    ... ({len(stderr_lines) - 20} more lines)")
            return None

        if not output_path.exists():
            print(f"  [EXEC ERROR] Script ran but output.png was not created")
            return None

        # Copy output.png out of the temp dir before it's deleted
        result_path = Path(tempfile.gettempdir()) / f"gi_chart_{gmat_id}.png"
        shutil.copy2(output_path, result_path)
        return result_path


# ---------------------------------------------------------------------------
# Core reconstruction
# ---------------------------------------------------------------------------

def reconstruct_gi_charts(
    input_path: Path,
    screenshots_dir: Path,
    output_dir: Path,
    id_prefix: str,
    only: str | None = None,
    dry_run: bool = False,
) -> None:
    supabase_url = os.environ.get("VITE_SUPABASE_URL", "").strip()
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if not supabase_url or not service_key:
        print("ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
        print(f"  Looking for .env at: {_env_path}")
        sys.exit(1)

    questions: list[dict] = load_json(input_path)
    if not questions:
        print(f"ERROR: No questions found in {input_path}")
        sys.exit(1)

    # Filter to GI questions only
    gi_questions = [q for q in questions if q.get("di_type") == "GI"]

    if only:
        gi_questions = [q for q in gi_questions if q["gmat_id"] == only]
        if not gi_questions:
            print(f"ERROR: GI question '{only}' not found in {input_path}")
            all_gi = [q["gmat_id"] for q in questions if q.get("di_type") == "GI"]
            print(f"  Available GI questions: {', '.join(all_gi) or 'none'}")
            sys.exit(1)

    manifest = load_manifest()
    output_dir.mkdir(parents=True, exist_ok=True)

    total_input = 0
    total_output = 0
    success_count = 0
    skipped_count = 0
    failed_ids = []

    print(f"\n{'='*60}")
    print(f"  GI Chart Reconstruction")
    print(f"  Input: {input_path}")
    print(f"  Screenshots: {screenshots_dir}")
    print(f"  Output dir: {output_dir}")
    print(f"  ID prefix: {id_prefix}")
    print(f"  GI questions found: {len(gi_questions)}")
    print(f"  Dry run: {dry_run}")
    print(f"{'='*60}\n")

    for q in gi_questions:
        gmat_id = q["gmat_id"]

        # Determine the output filename — use question_id from manifest if available
        entry = manifest["entries"].get(gmat_id, {})
        question_id = entry.get("question_id")

        # Build output PNG filename: DI-GMAT-PQO_-XXXXX.png or fallback to gmat_id
        if question_id:
            out_filename = f"{question_id}.png"
        else:
            out_filename = f"{id_prefix}-{gmat_id}.png"
        out_path = output_dir / out_filename

        # Skip if already reconstructed
        if not dry_run and out_path.exists():
            print(f"  [SKIP] {gmat_id} — {out_filename} already exists")
            skipped_count += 1
            continue

        # Find source screenshots
        screenshots = find_screenshots_for(gmat_id, screenshots_dir)
        if not screenshots:
            print(f"  [WARN] {gmat_id} — no screenshots found in {screenshots_dir}, skipping")
            failed_ids.append(gmat_id)
            continue

        print(f"  [RECONSTRUCT] {gmat_id} ({len(screenshots)} screenshot(s)) → {out_filename}")

        try:
            python_code, usage = call_reconstruct_function(
                supabase_url=supabase_url,
                service_key=service_key,
                screenshots=screenshots,
                chart_title=q.get("chart_title", ""),
                chart_type=q.get("chart_type", "unknown"),
                chart_description=q.get("chart_description", ""),
                chart_data_points=q.get("chart_data_points"),
            )
            total_input += usage["input_tokens"]
            total_output += usage["output_tokens"]

            cost_str = format_cost(usage["input_tokens"], usage["output_tokens"])
            print(f"    Code generated | tokens in={usage['input_tokens']} out={usage['output_tokens']} cost~{cost_str}")

            if dry_run:
                print(f"    [DRY RUN] Generated Python code ({len(python_code)} chars):")
                code_preview = strip_code_fences(python_code)
                for line in code_preview.splitlines()[:30]:
                    print(f"      {line}")
                if code_preview.count("\n") > 30:
                    print(f"      ... (truncated)")
                success_count += 1
                continue

            # Save the generated Python code for reference
            code_dir = output_dir / "code"
            code_dir.mkdir(exist_ok=True)
            code_file = code_dir / f"{gmat_id}_chart.py"
            code_file.write_text(strip_code_fences(python_code), encoding="utf-8")
            print(f"    Python code saved to {code_file.name}")

            # Execute the Python code
            print(f"    Executing matplotlib code...")
            tmp_png = execute_python_code(python_code, gmat_id)

            if tmp_png is None:
                print(f"    [ERROR] Chart generation failed for {gmat_id}")
                failed_ids.append(gmat_id)
                continue

            # Move generated PNG to final output location
            shutil.move(str(tmp_png), str(out_path))
            print(f"    PNG saved: {out_path}")

            # Update manifest
            now = datetime.now(timezone.utc).isoformat()
            if gmat_id not in manifest["entries"]:
                manifest["entries"][gmat_id] = {"gmat_id": gmat_id}
            manifest["entries"][gmat_id]["image_reconstructed"] = True
            manifest["entries"][gmat_id]["image_reconstructed_at"] = now
            manifest["entries"][gmat_id]["image_filename"] = out_filename
            save_manifest(manifest)

            success_count += 1
            print(f"    OK")

        except Exception as e:
            print(f"    [ERROR] {gmat_id}: {e}")
            failed_ids.append(gmat_id)

        if not dry_run:
            time.sleep(1.0)

    print(f"\n{'='*60}")
    print(f"  Done.")
    print(f"  Reconstructed: {success_count} | Skipped: {skipped_count} | Failed: {len(failed_ids)}")
    print(f"  Total tokens: in={total_input} out={total_output}")
    print(f"  Estimated cost: {format_cost(total_input, total_output)}")
    if failed_ids:
        print(f"  Failed IDs: {', '.join(failed_ids)}")
    print(f"{'='*60}\n")


# ---------------------------------------------------------------------------
# Status display
# ---------------------------------------------------------------------------

def show_status(input_path: Path, output_dir: Path) -> None:
    questions: list[dict] = load_json(input_path) if input_path.exists() else []
    gi_questions = [q for q in questions if q.get("di_type") == "GI"]
    manifest = load_manifest()

    reconstructed = [
        gid for gid, e in manifest["entries"].items()
        if e.get("image_reconstructed")
    ]

    print(f"\n{'='*60}")
    print(f"  GI Reconstruction Status")
    print(f"{'='*60}")
    print(f"  GI questions extracted : {len(gi_questions)}")
    print(f"  Charts reconstructed   : {len(reconstructed)}")

    pending = [q["gmat_id"] for q in gi_questions
               if q["gmat_id"] not in reconstructed]
    if pending:
        print(f"\n  Pending reconstruction ({len(pending)}): {', '.join(pending)}")
    print(f"{'='*60}\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Reconstruct GI chart images for GMAT Data Insights questions."
    )
    parser.add_argument(
        "--input",
        type=Path,
        required=True,
        help="Path to extracted questions JSON (output of extract_screenshots.py).",
    )
    parser.add_argument(
        "--screenshots-dir",
        type=Path,
        help="Directory containing original DI screenshot PNG files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory where reconstructed PNG files will be saved.",
    )
    parser.add_argument(
        "--id-prefix",
        default="DI-GMAT-PQO_",
        help="Prefix for output PNG filename when question_id is not yet in manifest (default: DI-GMAT-PQO_).",
    )
    parser.add_argument(
        "--only",
        metavar="GMAT_ID",
        help="Process only a single GI question by GMAT ID (e.g. 8GM147).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Generate and print Python code but do not execute or write files.",
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Show reconstruction status without processing any questions.",
    )

    args = parser.parse_args()

    if not args.input.exists():
        print(f"ERROR: Input file not found: {args.input}")
        sys.exit(1)

    if args.status:
        show_status(args.input, args.output_dir or Path("."))
        return

    if not args.screenshots_dir:
        parser.error("--screenshots-dir is required")
    if not args.output_dir:
        parser.error("--output-dir is required")

    if not args.screenshots_dir.exists():
        print(f"ERROR: Screenshots directory not found: {args.screenshots_dir}")
        sys.exit(1)

    reconstruct_gi_charts(
        input_path=args.input,
        screenshots_dir=args.screenshots_dir,
        output_dir=args.output_dir,
        id_prefix=args.id_prefix,
        only=args.only,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
