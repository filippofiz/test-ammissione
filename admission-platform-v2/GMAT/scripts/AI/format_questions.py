"""
Stage 2: Raw OCR Text → Structured GMAT Markdown → Append to Extraction File
Reads raw_question_text/*.md, detects section/type/category, formats, and appends to the
correct {Section} - Text Extraction.md in the docs folder.

Usage:
  python format_questions.py [--only <id>] [--dry-run] [--status]
                             [--force-section DI|QR|VR]
                             [--raw-dir PATH] [--docs-dir PATH]
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent
GMAT_DIR = SCRIPT_DIR.parent.parent  # scripts/AI/ → scripts/ → GMAT/
DOCS_DIR = GMAT_DIR / "sources" / "official" / "GMAT Online Question Bank" / "docs"
DEFAULT_RAW_DIR = DOCS_DIR / "raw_question_text"
FORMAT_LOG_FILE = DOCS_DIR / "format_log.json"

SECTION_FILES = {
    "DI": DOCS_DIR / "DI - Text Extraction.md",
    "QR": DOCS_DIR / "QR - Text Extraction.md",
    "VR": DOCS_DIR / "VR - Text Extraction.md",
}

# ---------------------------------------------------------------------------
# Section / type detection heuristics
# ---------------------------------------------------------------------------

def detect_section_and_type(text: str) -> tuple[str | None, str | None, str]:
    """
    Returns (section, type_abbrev, confidence) where confidence is 'high'|'low'.
    All detection is case-insensitive.
    """
    t = text.lower()

    # --- Data Insights ---
    # MSR: Multiple source tabs / passages — check FIRST (combined text can be very long,
    # which would otherwise trigger the RC word-count heuristic)
    if re.search(r"<!-- image:.*_source_tab|<!-- image:.*_question", text) or \
       re.search(r"passage\s+[12]|tab\s+[12]|source\s+[12]|email\s+[12]", t):
        return "DI", "MSR", "high"

    # TPA: Two-column selection table — check before RC (has long preamble text)
    if re.search(r"select\s+one\s+in\s+each\s+column|two.part|two part analysis|make only two selections.*one in each column", t):
        return "DI", "TPA", "high"

    # GI: drop-down / blank N selectors
    if re.search(r"blank\s+[12]|drop.?down|select.*option.*accurate|select.*option.*most accurate", t):
        return "DI", "GI", "high"

    # DS: Data Sufficiency — two numbered statements + sufficiency language
    if re.search(r"\(\s*1\s*\).*\(\s*2\s*\)", t, re.DOTALL) and re.search(
        r"sufficient|alone sufficient|together sufficient|statement.*alone|both statements", t
    ):
        return "DI", "DS", "high"

    # TA: Yes/No statements + table
    if re.search(r"select\s+(yes|no)\b|for\s+each.*statement.*select", t) and "|" in text:
        return "DI", "TA", "high"

    # --- Verbal Reasoning ---
    # RC: Long passage (200+ words before first question indicator)
    passage_match = re.split(r"which of the following|according to|the author|the passage", t)
    if len(passage_match[0].split()) >= 200:
        return "VR", "RC", "high"

    # CR: Short argument with (A)–(E) choices
    if re.search(r"\(\s*[ae]\s*\)", t) and re.search(
        r"argument|conclusion|assumption|weaken|strengthen|inference|evaluate|bold", t
    ):
        return "VR", "CR", "high"

    # --- Quantitative Reasoning ---
    # PS: math stem + (A)–(E) numerical choices
    if re.search(r"\(\s*[ae]\s*\)", t) and re.search(r"\$|\d+\s*/\s*\d+|percent|equation|solve", t):
        return "QR", "PS", "high"

    return None, None, "low"


# ---------------------------------------------------------------------------
# Category detection
# ---------------------------------------------------------------------------

# The four GMAT Official Guide categories, written in CAPS in the explanation.
VALID_CATEGORIES = {"Recognize", "Evaluate", "Apply", "Infer"}

def detect_category(text: str) -> str:
    """
    Extract the category from the OCR text.
    The category appears as the first ALL-CAPS word on its own line in the
    explanation section, e.g. "RECOGNIZE", "EVALUATE", "APPLY", "INFER".
    Returns the title-cased name (e.g. "Recognize") or "[TO BE ADDED]".
    """
    # Look for a line that is solely one of the category words (case-insensitive)
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.upper() in {c.upper() for c in VALID_CATEGORIES}:
            # Return the canonical title-case form
            for cat in VALID_CATEGORIES:
                if stripped.upper() == cat.upper():
                    return cat
    return "[TO BE ADDED]"


# ---------------------------------------------------------------------------
# Markdown extraction helpers
# ---------------------------------------------------------------------------

def extract_raw_ocr_body(raw_text: str) -> str:
    """Strip the metadata comment header and inline image comments from raw OCR files."""
    lines = raw_text.splitlines()
    body_lines = []
    in_header = True
    for line in lines:
        stripped = line.strip()
        # Skip the file-level header comments at the top
        if in_header and stripped.startswith("<!--") and stripped.endswith("-->"):
            continue
        else:
            in_header = False
        # Strip inline per-image comments (e.g. <!-- image: 100441_source_tab1.png -->)
        if re.match(r"<!--\s*image:\s*.+\s*-->", stripped):
            continue
        body_lines.append(line)
    return "\n".join(body_lines).strip()


def extract_table(text: str) -> str | None:
    """Extract the first markdown table found in text."""
    lines = text.splitlines()
    table_lines = []
    in_table = False
    for line in lines:
        if "|" in line:
            in_table = True
            table_lines.append(line)
        elif in_table:
            break
    if len(table_lines) >= 2:
        return "\n".join(table_lines)
    return None


def extract_statements(text: str) -> str | None:
    """Extract Yes/No statements from TA questions."""
    pattern = re.compile(
        r"(for\s+each.*?statement.*?select.*?(?:yes|no).*?[\.\:]\s*\n)((?:.+\n?)+)",
        re.IGNORECASE,
    )
    m = pattern.search(text)
    if m:
        lines = [l.strip() for l in m.group(2).splitlines() if l.strip()]
        return "\n".join(
            f"- {l}" for l in lines
            if not l.lower().startswith("yes") and not l.lower().startswith("no")
        )
    return None


def extract_options(text: str) -> str | None:
    """Extract answer choices (A)–(E) from CR/PS questions."""
    pattern = re.compile(r"^\s*\(?([A-E])\)?\s+.+", re.MULTILINE)
    matches = pattern.findall(text)
    if len(matches) >= 3:
        lines = pattern.finditer(text)
        return "\n".join(
            f"- ({m.group(1)}) {m.group(0).strip().lstrip('(ABCDE). ')}" for m in lines
        )
    return None


def extract_blank_options(text: str, blank_num: int) -> str | None:
    """Extract options for Blank N from GI questions."""
    pattern = re.compile(
        rf"options?\s+for\s+blank\s+{blank_num}\s*[:\-]?\s*\n((?:\s*[-•]\s*.+\n?)+)",
        re.IGNORECASE,
    )
    m = pattern.search(text)
    if m:
        return m.group(0).strip()
    return None


# ---------------------------------------------------------------------------
# Formatting templates per question type
# ---------------------------------------------------------------------------

def format_gi(qid: str, body: str, category: str) -> str:
    blank1 = extract_blank_options(body, 1) or "[TO BE ADDED]"
    blank2 = extract_blank_options(body, 2) or "[TO BE ADDED]"

    stem_match = re.split(r"options?\s+for\s+blank", body, flags=re.IGNORECASE)
    question = stem_match[0].strip() if stem_match else body.strip()

    return f"""# Question Code : {qid}
# Section : Data Insights
# Question Type: Graphics Interpretation (GI)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: [TO BE ADDED BY USER]
*Question*:
{question}

*{blank1}*

*{blank2}*

*Answers*:
Blank 1: [TO BE ADDED]
Blank 2: [TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_ta(qid: str, body: str, category: str) -> str:
    table = extract_table(body) or "[TO BE ADDED]"
    statements = extract_statements(body) or "[TO BE ADDED]"

    context_match = re.split(r"\|", body, maxsplit=1)
    context = context_match[0].strip() if context_match else "[TO BE ADDED]"

    return f"""# Question Code : {qid}
# Section : Data Insights
# Question Type: Table Analysis (TA)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Context*:
{context}

*Table*:
{table}

*Statements*:
For each of the following statements, select **Yes** if the statement is true based on the information provided. Otherwise select **No**.
{statements}

*Answers*:
[TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_tpa(qid: str, body: str, category: str) -> str:
    stem_lines = []
    for line in body.splitlines():
        if "|" in line or re.search(r"○|select one", line, re.IGNORECASE):
            break
        stem_lines.append(line)
    question = "\n".join(stem_lines).strip() or body.strip()

    table = extract_table(body) or "[TO BE ADDED]"

    return f"""# Question Code : {qid}
# Section : Data Insights
# Question Type: Two-Part Analysis (TPA)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Question*:
{question}

{table}

*Answers*:
- **Column 1 selection**: [TO BE ADDED]
- **Column 2 selection**: [TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_msr(qid: str, body: str, category: str) -> str:
    return f"""# Question Code : {qid}
# Section : Data Insights
# Question Type: Multi-Source Reasoning (MSR)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Context*:
{body.strip()}

*Statements*:
[TO BE ADDED]

*Answers*:
[TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_ds(qid: str, body: str, category: str) -> str:
    # Match "(1)" and "(2)" only at the start of a line to avoid splitting on answer choices
    parts = re.split(r"(?m)^\s*\(\s*[12]\s*\)\s*", body)
    # Drop everything from "Statement (1) ALONE..." onward (answer choices block)
    clean_parts = []
    for part in parts:
        if re.search(r"statement\s*\(1\)\s*alone", part, re.IGNORECASE):
            break
        clean_parts.append(part)
    stem = clean_parts[0].strip() if clean_parts else body.strip()
    # Remove trailing "Statement" word that sometimes leaks from the answer choices block
    stem = re.sub(r"\n+Statement\s*$", "", stem, flags=re.IGNORECASE).strip()
    stmt1 = clean_parts[1].strip() if len(clean_parts) > 1 else "[TO BE ADDED]"
    stmt2 = clean_parts[2].strip() if len(clean_parts) > 2 else "[TO BE ADDED]"
    # Strip explanation / answer block from stmt2 if it bleeds in
    stmt2 = re.split(r"\n(?:Statement\s*\(1\)\s*ALONE|BOTH\s*statements|EACH\s*statement)", stmt2, flags=re.IGNORECASE)[0].strip()

    return f"""# Question Code : {qid}
# Section : Data Insights
# Question Type: Data Sufficiency (DS)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Question*:
{stem}

*(1)* {stmt1}

*(2)* {stmt2}

*Answer choices*:
- (A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.
- (B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.
- (C) BOTH statements TOGETHER are sufficient, but NEITHER statement alone is sufficient.
- (D) EACH statement ALONE is sufficient.
- (E) Statements (1) and (2) TOGETHER are NOT sufficient.

*Answers*:
[TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_cr(qid: str, body: str, category: str) -> str:
    options = extract_options(body) or "[TO BE ADDED]"
    stem = re.sub(r"^\s*\(?[A-E]\)?\s+.+$", "", body, flags=re.MULTILINE).strip()

    return f"""# Question Code : {qid}
# Section : Verbal Reasoning
# Question Type: Critical Reasoning (CR)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Question*:
{stem}

*Options*:
{options}

*Answers*: [TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_rc(qid: str, body: str, category: str) -> str:
    split_pattern = re.compile(
        r"(?=which of the following|according to the passage|the author|the passage suggests|it can be inferred)",
        re.IGNORECASE,
    )
    parts = split_pattern.split(body, maxsplit=1)
    passage = parts[0].strip()
    question_block = parts[1].strip() if len(parts) > 1 else "[TO BE ADDED]"

    return f"""# Question Code : {qid}
# Section : Verbal Reasoning
# Question Type: Reading Comprehension (RC)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Context*:
{passage}

*Question*:
{question_block}

*Answers*: [TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_ps(qid: str, body: str, category: str) -> str:
    options = extract_options(body) or "[TO BE ADDED]"
    stem = re.sub(r"^\s*\(?[A-E]\)?\s+.+$", "", body, flags=re.MULTILINE).strip()

    return f"""# Question Code : {qid}
# Section : Quantitative Reasoning
# Question Type: Problem Solving (PS)
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Question*:
{stem}

*Options*:
{options}

*Answers*: [TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


def format_unknown(qid: str, body: str, category: str) -> str:
    return f"""# Question Code : {qid}
# Section : [TO BE ADDED — section unclear]
# Question Type: [TO BE ADDED — type unclear]
# Difficulty: Not given from official source
# Category: {category}
*Image source*: null
*Raw OCR body*:
{body.strip()}

*Answers*: [TO BE ADDED]

*Explanation*:
**{category}**
[TO BE ADDED]
"""


FORMATTERS = {
    "GI": format_gi,
    "TA": format_ta,
    "TPA": format_tpa,
    "MSR": format_msr,
    "DS": format_ds,
    "CR": format_cr,
    "RC": format_rc,
    "PS": format_ps,
}

# ---------------------------------------------------------------------------
# Log helpers
# ---------------------------------------------------------------------------

def load_log(log_file: Path) -> list:
    if log_file.exists():
        return json.loads(log_file.read_text(encoding="utf-8"))
    return []


def save_log(log_file: Path, entries: list):
    log_file.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")


# ---------------------------------------------------------------------------
# Core formatting
# ---------------------------------------------------------------------------

def format_question(
    raw_file: Path,
    docs_dir: Path,
    force_section: str | None,
    dry_run: bool,
) -> dict:
    content = raw_file.read_text(encoding="utf-8")

    if "<!-- formatted -->" in content:
        return {}

    question_id = raw_file.stem
    body = extract_raw_ocr_body(content)
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")

    section, qtype, confidence = detect_section_and_type(body)
    category = detect_category(body)
    # DS questions show the math topic (e.g. "Algebra Ratios"), not the GMAT category word.
    # DS always maps to Evaluate by convention.
    if category == "[TO BE ADDED]" and qtype == "DS":
        category = "Evaluate"

    if force_section:
        section = force_section
        confidence = "high"

    needs_review = confidence == "low" or section is None or qtype is None
    appended_to = None

    if dry_run:
        section_label = section or "UNKNOWN"
        type_label = qtype or "UNKNOWN"
        flag = " [REVIEW — type unclear]" if needs_review else ""
        print(f"  [DRY-RUN] {question_id} -> {section_label}/{type_label} | category={category}{flag}")
        return {}

    if section is None or qtype is None:
        formatter = format_unknown
        target_file = SECTION_FILES["DI"]
        appended_to = "DI - Text Extraction.md (REVIEW)"
    else:
        formatter = FORMATTERS.get(qtype, format_unknown)
        target_file = SECTION_FILES[section]
        appended_to = target_file.name

    formatted_block = formatter(question_id, body, category)

    with open(target_file, "a", encoding="utf-8") as f:
        f.write("\n" + formatted_block)

    raw_file.write_text(
        content.rstrip() + "\n<!-- formatted -->\n",
        encoding="utf-8",
    )

    flag = " [REVIEW]" if needs_review else ""
    section_label = section or "UNKNOWN"
    type_label = qtype or "UNKNOWN"
    print(f"  [OK] {question_id} -> {section_label}/{type_label} | category={category} -> {appended_to}{flag}")

    return {
        "question_id": question_id,
        "detected_section": section,
        "detected_type": qtype,
        "detected_category": category,
        "confidence": confidence,
        "appended_to": appended_to,
        "formatted_at": timestamp,
        "status": "success",
        "needs_review": needs_review,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Stage 2: Format raw OCR text into GMAT markdown.")
    parser.add_argument("--only", metavar="ID", help="Process only this question ID.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would be formatted without writing files.")
    parser.add_argument("--status", action="store_true",
                        help="Print format log summary and exit.")
    parser.add_argument("--force-section", choices=["DI", "QR", "VR"],
                        help="Override section detection for all processed questions.")
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR,
                        help="Directory containing raw OCR .md files.")
    parser.add_argument("--docs-dir", type=Path, default=DOCS_DIR,
                        help="Directory containing the extraction .md files.")
    args = parser.parse_args()

    if args.status:
        log = load_log(FORMAT_LOG_FILE)
        if not log:
            print("No format log found.")
            return
        ok = sum(1 for e in log if not e.get("needs_review"))
        review = sum(1 for e in log if e.get("needs_review"))
        print(f"Format log: {len(log)} total | {ok} OK | {review} needs review")
        for e in log:
            flag = " [REVIEW]" if e.get("needs_review") else ""
            cat = e.get("detected_category", "?")
            print(f"  {e['question_id']} -> {e.get('detected_section')}/{e.get('detected_type')} | cat={cat} -> {e.get('appended_to')}{flag}")
        return

    if not args.raw_dir.exists():
        print(f"Raw dir not found: {args.raw_dir}")
        sys.exit(1)

    raw_files = sorted(args.raw_dir.glob("*.md"))
    if args.only:
        raw_files = [f for f in raw_files if f.stem == args.only]
        if not raw_files:
            print(f"Question ID '{args.only}' not found in raw_question_text/")
            sys.exit(1)

    pending = [
        f for f in raw_files
        if "<!-- formatted -->" not in f.read_text(encoding="utf-8")
    ]
    skipped = len(raw_files) - len(pending)
    if skipped:
        print(f"Skipping {skipped} already-formatted question(s).")

    if not pending:
        print("Nothing to do.")
        return

    print(f"Formatting {len(pending)} question(s)...\n")

    log = load_log(FORMAT_LOG_FILE)
    new_entries = []

    for raw_file in pending:
        entry = format_question(raw_file, args.docs_dir, args.force_section, args.dry_run)
        if entry:
            new_entries.append(entry)

    if new_entries and not args.dry_run:
        log.extend(new_entries)
        save_log(FORMAT_LOG_FILE, log)
        ok = sum(1 for e in new_entries if not e.get("needs_review"))
        review = sum(1 for e in new_entries if e.get("needs_review"))
        print(f"\nDone: {ok} OK | {review} needs review")
        print(f"Log saved to {FORMAT_LOG_FILE}")


if __name__ == "__main__":
    main()
