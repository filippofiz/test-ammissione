"""
extract_rc_line_offsets.py

Extracts the exact character-offset positions of each printed line for every
Reading Comprehension passage from the official GMAT PDF files.

The output is saved to:
  admission-platform-v2/GMAT/scripts/rc_line_offsets.json

Format:
  {
    "RC-OG-PASSAGE-001": {
      "1": 0,
      "2": 68,
      "3": 134,
      ...
    },
    ...
  }

Usage:
  pip install pdfplumber
  python admission-platform-v2/GMAT/scripts/extract_rc_line_offsets.py

Requirements:
  - pdfplumber >= 0.10

How it works:
  1. Opens each question PDF.
  2. For every page, uses pdfplumber's word-level bounding boxes to group
     words into visual lines (by y-coordinate, within a small tolerance).
  3. Reconstructs each visual line's text by joining words in x-order.
  4. For each known passage (loaded from the extracted JSON batch files),
     tries to match each reconstructed visual line against the passage text
     using a sliding substring search that tolerates small OCR differences.
  5. Records the character offset within the plain-text passage string where
     that printed line starts.
  6. Writes rc_line_offsets.json.
"""

import json
import os
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber is not installed. Run:  pip install pdfplumber")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths — adjust if you run this from a different working directory
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent  # admission-platform-v2/GMAT

PDF_DIR = (
    BASE_DIR
    / "sources"
    / "official"
    / "GMAT Official Guide 2025-2026 (Complete)"
    / "VR (Complete)"
    / "Reading Comprehension (Complete)"
)

EXTRACTED_DIR = PDF_DIR / "extracted"

OUTPUT_FILE = SCRIPT_DIR / "rc_line_offsets.json"

# Question PDFs (passages appear here, not in the answer explanation PDFs)
PDF_FILES = [
    PDF_DIR / f"VR_raw_questions_{i}.pdf" for i in range(1, 9)
]

# Extracted JSON batch files — each contains a "passages" array
BATCH_FILES = [
    EXTRACTED_DIR / "questions_batch_1.json",
    EXTRACTED_DIR / "questions_batch_2a_part1.json",
    EXTRACTED_DIR / "questions_batch_2a_part2.json",
    EXTRACTED_DIR / "questions_batch_2a_part3.json",
    EXTRACTED_DIR / "questions_batch_2b.json",
    EXTRACTED_DIR / "questions_batch_3.json",
    EXTRACTED_DIR / "questions_batch_4.json",
]

# ---------------------------------------------------------------------------
# Step 1: Load all passage texts from the extracted JSON files
# ---------------------------------------------------------------------------

def load_passages() -> dict[str, str]:
    """Return {passage_id: plain_text} for all unique passages."""
    passages: dict[str, str] = {}
    for batch_file in BATCH_FILES:
        if not batch_file.exists():
            print(f"  ⚠  Batch file not found: {batch_file.name}")
            continue
        with open(batch_file, encoding="utf-8") as f:
            data = json.load(f)
        for p in data.get("passages", []):
            pid = p.get("passage_id", "")
            text = p.get("passage_text", "").strip()
            if pid and text and pid not in passages:
                passages[pid] = text
    print(f"✅  Loaded {len(passages)} unique passages from batch files")
    return passages


# ---------------------------------------------------------------------------
# Step 2: Extract visual lines from a PDF page
# ---------------------------------------------------------------------------

# Tolerance in PDF points for grouping words onto the same visual line.
# Two words are on the same line if |y0_a - y0_b| < Y_TOLERANCE.
Y_TOLERANCE = 3.0

# The typical left margin x-coordinate of passage text columns.
# Words whose x0 is < MIN_TEXT_X are likely page numbers or headers — skip.
MIN_TEXT_X = 40.0

# Maximum x coordinate: ignore footnotes / headers on the right margin
MAX_TEXT_X = 600.0


def extract_visual_lines(page) -> list[str]:
    """
    Given a pdfplumber Page object, return a list of text strings,
    one per visual line, in top-to-bottom order.
    Words within each line are joined in left-to-right order.
    """
    words = page.extract_words(
        x_tolerance=3,
        y_tolerance=Y_TOLERANCE,
        keep_blank_chars=False,
        use_text_flow=False,
        extra_attrs=["size"],
    )
    if not words:
        return []

    # Filter out very-small text (footnotes, page numbers typically < 8pt)
    words = [w for w in words if float(w.get("size", 10)) >= 7.5]

    # Filter by x range
    words = [w for w in words if MIN_TEXT_X <= float(w["x0"]) <= MAX_TEXT_X]

    if not words:
        return []

    # Group by y0 within Y_TOLERANCE using a simple sweep
    # Sort by top (y0) then by x0
    words.sort(key=lambda w: (float(w["top"]), float(w["x0"])))

    lines: list[list[str]] = []
    current_y: float = float(words[0]["top"])
    current_line: list[str] = []

    for w in words:
        w_y = float(w["top"])
        if abs(w_y - current_y) <= Y_TOLERANCE:
            current_line.append(w["text"])
        else:
            if current_line:
                lines.append(current_line)
            current_line = [w["text"]]
            current_y = w_y

    if current_line:
        lines.append(current_line)

    return [" ".join(ln) for ln in lines]


# ---------------------------------------------------------------------------
# Step 3: Fuzzy matching — find where a visual line starts in the passage text
# ---------------------------------------------------------------------------

def normalise(text: str) -> str:
    """Collapse whitespace and lower-case for fuzzy matching."""
    return re.sub(r"\s+", " ", text).strip().lower()


def find_line_offset(
    passage: str,
    visual_line: str,
    search_from: int = 0,
    min_match_ratio: float = 0.72,
) -> Optional[int]:
    """
    Search for `visual_line` (a PDF-extracted text fragment) within `passage`,
    starting the search at `search_from`.

    Returns the character offset in `passage` where the match starts,
    or None if no sufficiently good match is found.

    Strategy:
      - Take the first N words of the visual line (up to 8).
      - Search forward in the passage text for any substring whose
        similarity ratio to those words is >= min_match_ratio.
      - Use a sliding window of ≈ len(query) characters.
    """
    norm_line = normalise(visual_line)
    words = norm_line.split()
    # Use first min(8, len(words)) words as the query probe
    probe_words = words[: min(8, len(words))]
    if not probe_words:
        return None
    probe = " ".join(probe_words)
    probe_len = len(probe)

    norm_passage = normalise(passage)
    passage_lower = passage.lower()

    # Fast exact sub-string search first
    idx = norm_passage.find(probe, search_from)
    if idx != -1:
        # Map normalised index back to original passage offset
        return _map_norm_to_orig(passage, idx)

    # Fuzzy sliding-window search within a reasonable lookahead
    window = probe_len + 20  # allow for small differences
    lookahead = min(len(norm_passage), search_from + 2000)

    best_ratio = 0.0
    best_pos: Optional[int] = None

    pos = search_from
    while pos < lookahead - probe_len:
        candidate = norm_passage[pos : pos + window]
        ratio = SequenceMatcher(None, probe, candidate[: probe_len]).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_pos = pos
        pos += max(1, probe_len // 4)

    if best_ratio >= min_match_ratio and best_pos is not None:
        return _map_norm_to_orig(passage, best_pos)

    return None


def _map_norm_to_orig(passage: str, norm_idx: int) -> int:
    """
    Very rough mapping: since normalise() only collapses whitespace,
    the character positions are approximately equal for non-whitespace chars.
    We walk `norm_idx` non-space characters into the original passage.
    """
    count = 0
    for i, ch in enumerate(passage):
        if count >= norm_idx:
            return i
        if not ch.isspace() or (i > 0 and not passage[i - 1].isspace()):
            count += 1
    return len(passage)


# ---------------------------------------------------------------------------
# Step 4: For each passage, walk all PDF pages and map line numbers
# ---------------------------------------------------------------------------

def extract_line_offsets_for_passage(
    passage_id: str,
    passage_text: str,
    all_visual_lines_by_pdf: dict[str, list[list[str]]],
) -> dict[int, int]:
    """
    Given the plain text of a passage and a dict of { pdf_filename: [page_lines] },
    return { line_number: char_offset } for that passage.

    We search every PDF page's lines for contiguous runs that match the
    start of the passage, then continue line-by-line through the whole passage.
    """
    # We search for where the passage begins in the PDF.
    # The passage title or first sentence is our anchor.
    first_sentence_words = normalise(passage_text).split()[:12]
    anchor = " ".join(first_sentence_words)

    line_offsets: dict[int, int] = {}
    passage_search_pos = 0  # how far into the passage we've matched so far
    line_number = 0

    found_start = False

    for pdf_name, pages_lines in all_visual_lines_by_pdf.items():
        if found_start:
            break
        for page_idx, page_lines in enumerate(pages_lines):
            if found_start:
                break
            # Look for the anchor in this page
            for li, line_text in enumerate(page_lines):
                norm_lt = normalise(line_text)
                # Check if anchor starts somewhere in this line
                if SequenceMatcher(
                    None, anchor, norm_lt[: len(anchor)]
                ).ratio() >= 0.70 or anchor[:30] in norm_lt:
                    # Found the passage start — begin mapping from here
                    found_start = True
                    # Now map this line and all subsequent lines
                    remaining_lines = page_lines[li:]
                    remaining_pages = pages_lines[page_idx + 1 :]
                    line_number = 0
                    passage_search_pos = 0

                    def process_lines(lines_iter):
                        nonlocal line_number, passage_search_pos
                        for lt in lines_iter:
                            if passage_search_pos >= len(passage_text):
                                return True  # done
                            offset = find_line_offset(
                                passage_text, lt, passage_search_pos
                            )
                            if offset is not None:
                                line_number += 1
                                line_offsets[line_number] = offset
                                # Advance search position past this match
                                passage_search_pos = offset + max(
                                    1, len(normalise(lt)) // 2
                                )
                            # If no match, we may have hit a question line or
                            # page break — just continue
                        return False

                    done = process_lines(remaining_lines)
                    if not done:
                        # Continue on subsequent pages of this PDF
                        for next_page_lines in remaining_pages:
                            if process_lines(next_page_lines):
                                break
                    break  # stop searching this PDF for the anchor

    if not found_start:
        print(f"    ⚠  Could not locate passage {passage_id} in any PDF")
    elif not line_offsets:
        print(f"    ⚠  Located passage {passage_id} but mapped 0 lines")
    else:
        print(
            f"    ✅  {passage_id}: mapped {len(line_offsets)} lines "
            f"(offset range 0–{max(line_offsets.values())})"
        )

    return line_offsets


# ---------------------------------------------------------------------------
# Step 5: Main orchestration
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  extract_rc_line_offsets.py")
    print("=" * 60)

    # -- Load passage texts --
    passages = load_passages()
    if not passages:
        print("ERROR: No passages found in batch files. Aborting.")
        sys.exit(1)

    # -- Extract visual lines from every PDF --
    print("\n📄  Extracting visual lines from PDFs...")
    all_visual_lines: dict[str, list[list[str]]] = {}  # pdf_name -> [page_lines]

    for pdf_path in PDF_FILES:
        if not pdf_path.exists():
            print(f"  ⚠  PDF not found: {pdf_path.name}")
            continue
        print(f"  Opening {pdf_path.name}...")
        try:
            with pdfplumber.open(str(pdf_path)) as pdf:
                pages_lines: list[list[str]] = []
                for page in pdf.pages:
                    lines = extract_visual_lines(page)
                    pages_lines.append(lines)
                all_visual_lines[pdf_path.name] = pages_lines
                total_lines = sum(len(pl) for pl in pages_lines)
                print(
                    f"    {len(pdf.pages)} pages, {total_lines} visual lines extracted"
                )
        except Exception as e:
            print(f"  ❌  Error reading {pdf_path.name}: {e}")

    if not all_visual_lines:
        print("ERROR: Could not read any PDF. Check that pdfplumber is installed.")
        sys.exit(1)

    # -- Map line offsets for each passage --
    print("\n🔍  Mapping line offsets per passage...")
    result: dict[str, dict[str, int]] = {}

    for passage_id, passage_text in sorted(passages.items()):
        print(f"\n  [{passage_id}]")
        offsets = extract_line_offsets_for_passage(
            passage_id, passage_text, all_visual_lines
        )
        if offsets:
            # Store as string keys for JSON compatibility
            result[passage_id] = {str(k): v for k, v in sorted(offsets.items())}

    # -- Write output --
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\n✅  Output written to: {OUTPUT_FILE}")
    print(f"    {len(result)} passages mapped")

    # Summary
    print("\nSummary:")
    for pid, offsets in result.items():
        n = len(offsets)
        if n == 0:
            print(f"  ⚠  {pid}: 0 lines — needs manual review")
        else:
            print(f"  ✅  {pid}: {n} lines")

    print("\n" + "=" * 60)
    print("  Done. Review rc_line_offsets.json, then run the integration step.")
    print("=" * 60)


if __name__ == "__main__":
    main()
