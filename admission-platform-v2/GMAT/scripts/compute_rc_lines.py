"""
compute_rc_lines.py

1. Resolves passage ID collisions across batch files by assigning unique IDs
   based on passage content (first 40 chars hash → deterministic suffix).
2. Wraps each unique passage at WRAP_WIDTH chars to produce explicit line arrays.
3. Maps all question line-number references to the new line numbering.
4. Outputs:
     rc_passages.json       — all unique passages with their canonical ID, lines[], line_offsets
     rc_questions.json      — all questions with corrected passage_id + updated line refs
     passages_ts_patch.txt  — TypeScript snippet to paste into passages_OG.ts for new passages

Usage:
  py admission-platform-v2/GMAT/scripts/compute_rc_lines.py
"""

import hashlib
import json
import re
import textwrap
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent  # GMAT/

EXTRACTED_DIR = (
    BASE_DIR
    / "sources"
    / "official"
    / "GMAT Official Guide 2025-2026 (Complete)"
    / "VR (Complete)"
    / "Reading Comprehension (Complete)"
    / "extracted"
)

OUTPUT_PASSAGES = SCRIPT_DIR / "rc_passages.json"
OUTPUT_QUESTIONS = SCRIPT_DIR / "rc_questions.json"
OUTPUT_TS_PATCH = SCRIPT_DIR / "passages_ts_patch.txt"

WRAP_WIDTH = 65

# ---------------------------------------------------------------------------
# Manual overrides for line references that cannot be auto-detected
# (no quoted anchor phrase in question text).
# Format: { question_number: (new_line_start, new_line_end_or_None) }
# new_line_end is only set if original was a range reference (lines X-Y)
# ---------------------------------------------------------------------------
MANUAL_OVERRIDES: dict[int, tuple[int, int | None]] = {
    473: (19, None),   # PASSAGE-003: "study" re land-tenure measurement → line 19 (Researchers also measured)
    474: (1, None),    # PASSAGE-003: "proposal mentioned in line 1" → stays line 1
    478: (6, None),    # PASSAGE-004: "environmentalists" → line 6 (blame this impasse on environmentalists)
    484: (4, None),    # PASSAGE-006: "scholars" contend banks played minor role → line 4 (same)
    489: (5, None),    # PASSAGE-007: "advice" = experts' advice → line 5
    491: (17, None),   # PASSAGE-007: "new research referred to" → line 17 (However, new research)
    492: (6, None),    # PASSAGE-008: research about lower-ranked executives → line 6 (same)
    500: (32, None),   # PASSAGE-010/500: rhinoceroses and elephants → line 32
    501: (14, 19),     # PASSAGE-010/500: author's argument about cub-carrying → lines 14-19 (same)
    510: (10, 17),     # PASSAGE-509: criteria for water rights → lines 10-17
    511: (10, 17),     # PASSAGE-509: same criteria → lines 10-17
    512: (32, 33),     # PASSAGE-509: "pragmatic approach" → lines 32-33
    535: (28, None),   # PASSAGE-002-B2: Hallam / ice ages → line 28
    548: (20, 22),     # PASSAGE-005-B2: economic indicators → lines 20-22
    551: (9, 14),      # PASSAGE-002-B3: large plant statement → lines 9-14
    558: (23, 25),     # PASSAGE-004-B3: taller people → lines 23-25
    570: (14, 17),     # PASSAGE-007-B2: SPEW contention → lines 14-17
    572: (7, None),    # PASSAGE-008-B2: Robert Filmer → line 7
    573: (1, None),    # PASSAGE-008-B2: seventeenth-century English women → line 1
    579: (5, None),    # PASSAGE-009-B2: gender ideology → line 5
    582: (5, 6),       # PASSAGE-010-B2: environmentalists → lines 5-6 (same)
    586: (35, 38),     # PASSAGE-010-B2: sentence in lines 35-38 (same)
    589: (24, None),   # PASSAGE-403: last sentence (only 24 lines) → line 24
    595: (8, None),    # PASSAGE-405: scholars → line 8 (same)
    597: (21, None),   # PASSAGE-405: scholars referred to → line 21 (same)
    598: (14, 15),     # PASSAGE-405: argument referred to → lines 14-15 (same)
    600: (12, None),   # PASSAGE-406: scholars → line 12 (same)
    602: (12, None),   # PASSAGE-406: scholars → line 12 (same)
    606: (12, None),   # PASSAGE-401: five asteroids → line 12 (same)
    607: (16, None),   # PASSAGE-401: conclusion → line 16 (same)
}

# Existing passage IDs already in passages_OG.ts (batch_1 + 2a + 4)
# These keep their IDs. Anything that collides gets a new derived ID.
KNOWN_PASSAGE_IDS = {
    # batch_1
    "RC-OG-PASSAGE-001", "RC-OG-PASSAGE-002", "RC-OG-PASSAGE-003",
    "RC-OG-PASSAGE-004", "RC-OG-PASSAGE-005", "RC-OG-PASSAGE-006",
    "RC-OG-PASSAGE-007", "RC-OG-PASSAGE-008", "RC-OG-PASSAGE-009",
    "RC-OG-PASSAGE-010",
    # batch_4
    "RC-OG-PASSAGE-401", "RC-OG-PASSAGE-402", "RC-OG-PASSAGE-403",
    "RC-OG-PASSAGE-404", "RC-OG-PASSAGE-405", "RC-OG-PASSAGE-406",
    # batch_2a
    "RC-OG-PASSAGE-500", "RC-OG-PASSAGE-505", "RC-OG-PASSAGE-509",
    "RC-OG-PASSAGE-515", "RC-OG-PASSAGE-517", "RC-OG-PASSAGE-522",
}

# Passage topics from existing passages_OG.ts
KNOWN_TOPICS = {
    "RC-OG-PASSAGE-001": "science",
    "RC-OG-PASSAGE-002": "business",
    "RC-OG-PASSAGE-003": "social science",
    "RC-OG-PASSAGE-004": "economics",
    "RC-OG-PASSAGE-005": "science",
    "RC-OG-PASSAGE-006": "history",
    "RC-OG-PASSAGE-007": "business",
    "RC-OG-PASSAGE-008": "business",
    "RC-OG-PASSAGE-009": "history",
    "RC-OG-PASSAGE-010": "science",
    "RC-OG-PASSAGE-401": "science",
    "RC-OG-PASSAGE-402": "science",
    "RC-OG-PASSAGE-403": "science",
    "RC-OG-PASSAGE-404": "science",
    "RC-OG-PASSAGE-405": "history",
    "RC-OG-PASSAGE-406": "history",
    "RC-OG-PASSAGE-500": "science",
    "RC-OG-PASSAGE-505": "science",
    "RC-OG-PASSAGE-509": "legal",
    "RC-OG-PASSAGE-515": "history",
    "RC-OG-PASSAGE-517": "business",
    "RC-OG-PASSAGE-522": "science",
}

# ---------------------------------------------------------------------------
# Step 1: Load all passages, detect collisions, assign unique IDs
# ---------------------------------------------------------------------------

def content_key(text: str) -> str:
    """Short hash of first 80 chars of passage text for deduplication."""
    return hashlib.md5(text[:80].encode()).hexdigest()[:8]


def load_all_passages() -> tuple[dict[str, dict], dict[str, str]]:
    """
    Returns:
      canonical: { canonical_id → { text, topic, source_batch } }
      remap:     { (orig_id, content_key) → canonical_id }
    """
    # First pass: collect (orig_id, text) per batch
    raw: list[tuple[str, str, str, str]] = []  # (orig_id, text, topic, batch_name)
    for bf in sorted(EXTRACTED_DIR.glob("questions_batch*.json")):
        with open(bf, encoding="utf-8") as f:
            data = json.load(f)
        for p in data.get("passages", []):
            raw.append((p["passage_id"], p["passage_text"], p.get("topic", ""), bf.name))

    # Dedup by content
    seen_content: dict[str, str] = {}   # content_key → canonical_id
    canonical: dict[str, dict] = {}
    remap: dict[tuple, str] = {}        # (orig_id, ck) → canonical_id

    # Counter for new IDs
    new_id_counter: dict[str, int] = {}  # base_id → next suffix

    for orig_id, text, topic, batch in raw:
        ck = content_key(text)
        key = (orig_id, ck)

        if key in remap:
            continue  # already processed this exact passage

        if ck in seen_content:
            # Same content seen before (exact dup) — reuse canonical id
            remap[key] = seen_content[ck]
            continue

        # New content — determine canonical ID
        if orig_id in KNOWN_PASSAGE_IDS:
            # Check if orig_id is already taken by a different content
            if orig_id not in canonical:
                # First occurrence of this ID → it IS the canonical
                can_id = orig_id
            else:
                # Collision — orig_id already used for different text
                base = orig_id
                suffix = new_id_counter.get(base, 2)
                new_id_counter[base] = suffix + 1
                can_id = f"{base}-B{suffix}"
        else:
            can_id = orig_id

        canonical[can_id] = {
            "text": text,
            "topic": topic or KNOWN_TOPICS.get(orig_id, ""),
            "source_batch": batch,
            "orig_id": orig_id,
        }
        seen_content[ck] = can_id
        remap[key] = can_id

    return canonical, remap, seen_content


# ---------------------------------------------------------------------------
# Step 2: Wrap passages into line arrays
# ---------------------------------------------------------------------------

def wrap_passage(text: str, width: int = WRAP_WIDTH) -> list[str]:
    paragraphs = re.split(r"\n\n+", text.strip())
    lines: list[str] = []
    for i, para in enumerate(paragraphs):
        para = re.sub(r"\s+", " ", para).strip()
        wrapped = textwrap.wrap(para, width=width, break_long_words=False, break_on_hyphens=False)
        if i > 0 and lines:
            lines.append("")  # blank line between paragraphs
        lines.extend(wrapped)
    return lines


def compute_line_offsets(lines: list[str]) -> dict[str, int]:
    offsets: dict[str, int] = {}
    pos = 0
    for i, line in enumerate(lines):
        offsets[str(i + 1)] = pos
        pos += len(line) + 1
    return offsets


# ---------------------------------------------------------------------------
# Step 3: Remap line references in question texts
# ---------------------------------------------------------------------------

LINE_REF_RE = re.compile(
    r"(lines?\s+(\d+)(?:\s*[-\u2013]\s*(\d+))?)",
    re.IGNORECASE,
)

QUOTE_RE = re.compile(
    r'[\"\u201c\u2018\u00ab]([^\"\u201d\u2019\u00bb]{4,80})[\"\u201d\u2019\u00bb]'
)


def find_phrase_in_lines(phrase: str, lines: list[str]) -> int | None:
    probe = re.sub(r"\s+", " ", phrase).lower().strip()
    for i, line in enumerate(lines):
        if probe in re.sub(r"\s+", " ", line).lower():
            return i + 1
    # Try shorter probe
    for length in [20, 15, 10]:
        p = probe[:length]
        if len(p) >= 6:
            for i, line in enumerate(lines):
                if p in re.sub(r"\s+", " ", line).lower():
                    return i + 1
    return None


def find_anchor_phrase(qt: str, ref_match: re.Match) -> str | None:
    ref_pos = ref_match.start()
    quotes = list(QUOTE_RE.finditer(qt))
    if not quotes:
        return None
    best = min(quotes, key=lambda m: abs(m.start() - ref_pos))
    if abs(best.start() - ref_pos) > 250:
        return None
    return best.group(1).strip()


def remap_line_refs(question_text: str, lines: list[str], question_number: int = 0) -> tuple[str, list[dict]]:
    remappings: list[dict] = []
    updated = question_text
    matches = list(LINE_REF_RE.finditer(question_text))

    for m in reversed(matches):
        old_start = int(m.group(2))
        old_end = int(m.group(3)) if m.group(3) else None

        anchor = find_anchor_phrase(question_text, m)
        new_line = find_phrase_in_lines(anchor, lines) if anchor else None
        new_end_override = None

        # Apply manual override if available
        if question_number in MANUAL_OVERRIDES:
            ovr_start, ovr_end = MANUAL_OVERRIDES[question_number]
            new_line = ovr_start
            new_end_override = ovr_end

        if new_line is None:
            remappings.append({"old": m.group(0), "new": None, "anchor": anchor, "status": "not_found"})
            continue

        if old_end is not None or new_end_override is not None:
            if new_end_override is not None:
                new_end = new_end_override
            else:
                range_len = old_end - old_start
                new_end = new_line + range_len
            sep = re.search(r"(\s*[-\u2013]\s*)", m.group(0))
            sep_str = sep.group(1) if sep else "-"
            new_ref = f"lines {new_line}{sep_str}{new_end}"
        else:
            prefix_m = re.match(r"(lines?)\s+", m.group(0), re.IGNORECASE)
            prefix = prefix_m.group(1) if prefix_m else "line"
            new_ref = f"{prefix} {new_line}"

        updated = updated[: m.start()] + new_ref + updated[m.end():]
        remappings.append({
            "old": m.group(0), "new": new_ref,
            "anchor": anchor, "old_line": old_start, "new_line": new_line,
            "status": "ok",
        })

    return updated, remappings


# ---------------------------------------------------------------------------
# Step 4: Generate TypeScript snippet for new passages
# ---------------------------------------------------------------------------

def passage_to_ts(can_id: str, info: dict, lines: list[str]) -> str:
    """Generate a TypeScript PASSAGE_XXX constant snippet for a new (non-existing) passage."""
    const_name = can_id.replace("RC-OG-PASSAGE-", "PASSAGE_").replace("-", "_")
    topic = info.get("topic", "")
    # Reconstruct content string from lines
    content = ""
    i = 0
    while i < len(lines):
        if lines[i] == "":
            content += "\n\n"
            i += 1
        else:
            content += lines[i]
            i += 1
            while i < len(lines) and lines[i] != "":
                content += " " + lines[i]
                i += 1

    content = content.strip()
    # Escape backticks for template literal
    content_escaped = content.replace("`", "\\`").replace("${", "\\${")

    ts = f"""
export const {const_name} = {{
  id: "{can_id}",
  title: "",  // TODO: add passage title
  content: `{content_escaped}`,
  topic: "{topic}",
  lines: {json.dumps(lines, ensure_ascii=False)},
}};
"""
    return ts


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  compute_rc_lines.py")
    print("=" * 60)

    # -- Load passages --
    canonical, remap, seen_content = load_all_passages()
    print(f"\nUnique passages found: {len(canonical)}")
    existing = [k for k in canonical if k in KNOWN_PASSAGE_IDS]
    new_passages = [k for k in canonical if k not in KNOWN_PASSAGE_IDS]
    print(f"  Known (already in passages_OG.ts): {len(existing)}")
    print(f"  New (need to be added):             {len(new_passages)}")
    if new_passages:
        for nk in sorted(new_passages):
            orig = canonical[nk]["orig_id"]
            batch = canonical[nk]["source_batch"]
            print(f"    {nk}  (orig: {orig}, from {batch})  {canonical[nk]['text'][:60]}")

    # -- Build line arrays --
    print("\nWrapping passages...")
    passage_lines: dict[str, list[str]] = {}
    passage_offsets: dict[str, dict[str, int]] = {}
    for can_id, info in sorted(canonical.items()):
        lines = wrap_passage(info["text"], WRAP_WIDTH)
        offsets = compute_line_offsets(lines)
        passage_lines[can_id] = lines
        passage_offsets[can_id] = offsets
        print(f"  {can_id}: {len(lines)} lines")

    # -- Build output passages structure --
    passages_out = {}
    for can_id in sorted(canonical.keys()):
        passages_out[can_id] = {
            "orig_id": canonical[can_id]["orig_id"],
            "topic": canonical[can_id]["topic"],
            "source_batch": canonical[can_id]["source_batch"],
            "text": canonical[can_id]["text"],
            "lines": passage_lines[can_id],
            "line_offsets": passage_offsets[can_id],
        }

    with open(OUTPUT_PASSAGES, "w", encoding="utf-8") as f:
        json.dump(passages_out, f, indent=2, ensure_ascii=False)
    print(f"\nWritten: {OUTPUT_PASSAGES}")

    # -- Load and process questions --
    print("\nProcessing questions...")
    all_questions = []
    for bf in sorted(EXTRACTED_DIR.glob("questions_batch*.json")):
        with open(bf, encoding="utf-8") as f:
            data = json.load(f)
        for q in data.get("questions", []):
            q["_source_batch"] = bf.name
            all_questions.append(q)

    print(f"  Total questions: {len(all_questions)}")

    # Remap passage IDs and line references
    updated_questions = []
    issues = []

    for q in all_questions:
        orig_pid = q.get("passage_id", "")
        text = q.get("passage_text", "")
        qt = (q.get("question_text", "") or "").strip()
        qn = q.get("question_number", "?")

        # Find canonical passage ID for this question
        # Use (orig_pid, content_key_of_passage_text_if_available) or just orig_pid
        # We need to match by content — look up via the passage text from the batch
        # For questions we don't have passage_text directly, use orig_pid + batch to find
        ck_lookup = None
        batch_name = q.get("_source_batch", "")
        # Find the passage text from the batch
        for bf in EXTRACTED_DIR.glob("questions_batch*.json"):
            if bf.name != batch_name:
                continue
            with open(bf, encoding="utf-8") as f:
                bdata = json.load(f)
            for p in bdata.get("passages", []):
                if p["passage_id"] == orig_pid:
                    ck_lookup = content_key(p["passage_text"])
                    break
            break

        can_pid = remap.get((orig_pid, ck_lookup), orig_pid) if ck_lookup else orig_pid

        # Remap line refs
        new_qt = qt
        remappings = []
        if LINE_REF_RE.search(qt) and can_pid in passage_lines:
            new_qt, remappings = remap_line_refs(qt, passage_lines[can_pid], question_number=qn if isinstance(qn, int) else 0)
            for r in remappings:
                if r["status"] == "ok":
                    print(f"  Q{qn} [{can_pid}]: {r['old']} → {r['new']}")
                else:
                    issues.append({"qn": qn, "pid": can_pid, **r})
                    print(f"  Q{qn} [{can_pid}]: WARNING — could not remap {r['old']}  anchor={r.get('anchor')}")

        updated_questions.append({
            **{k: v for k, v in q.items() if k != "_source_batch"},
            "passage_id": can_pid,
            "question_text_updated": new_qt,
            "remappings": remappings,
        })

    with open(OUTPUT_QUESTIONS, "w", encoding="utf-8") as f:
        json.dump(updated_questions, f, indent=2, ensure_ascii=False)
    print(f"\nWritten: {OUTPUT_QUESTIONS}")

    # -- Generate TS patch for new passages --
    ts_blocks = ["// NEW PASSAGES TO ADD TO passages_OG.ts\n"]
    for can_id in sorted(new_passages):
        ts_blocks.append(passage_to_ts(can_id, canonical[can_id], passage_lines[can_id]))

    with open(OUTPUT_TS_PATCH, "w", encoding="utf-8") as f:
        f.write("\n".join(ts_blocks))
    print(f"Written: {OUTPUT_TS_PATCH}")

    # -- Summary --
    if issues:
        print(f"\nISSUES ({len(issues)} refs could not be remapped — need manual review):")
        for iss in issues:
            print(f"  Q{iss['qn']} [{iss['pid']}]: {iss['old']}  anchor={iss.get('anchor')}")
    else:
        print("\nAll line references successfully remapped.")

    print("\n" + "=" * 60)
    print("  Done.")
    print("=" * 60)


if __name__ == "__main__":
    main()
