"""
patch_rc_questions.py

Patches the three RC question TypeScript files to:
1. Update passage_id references to use the new canonical IDs (for questions
   whose passages were in batch_2b or batch_3 with colliding IDs).
2. Update question_text fields with corrected line numbers.
3. Update passage_text references to use the correct PASSAGE_XXX constant.

Usage:
  py admission-platform-v2/GMAT/scripts/patch_rc_questions.py
"""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
VR_DIR = SCRIPT_DIR.parent / "sources" / "questions" / "VR"

RC_FILES = [
    VR_DIR / "verbal_reasoning_OG_RC_easy.ts",
    VR_DIR / "verbal_reasoning_OG_RC_medium.ts",
    VR_DIR / "verbal_reasoning_OG_RC_hard.ts",
]

# Load the updated questions from rc_questions.json
rc_questions_path = SCRIPT_DIR / "rc_questions.json"
all_questions = json.loads(rc_questions_path.read_text(encoding="utf-8"))

# Build lookup: question_number -> { new_passage_id, question_text_updated }
q_lookup: dict[int, dict] = {}
for q in all_questions:
    qn = q.get("question_number")
    if qn:
        q_lookup[qn] = q


# Map canonical passage ID -> TypeScript constant name
def pid_to_const(pid: str) -> str:
    """
    RC-OG-PASSAGE-001      -> PASSAGE_001
    RC-OG-PASSAGE-401      -> PASSAGE_011  (as defined in passages_OG.ts)
    RC-OG-PASSAGE-001-B2   -> PASSAGE_B2_001
    etc.
    """
    # Special mappings for existing passages (their const names don't follow the ID pattern)
    KNOWN = {
        "RC-OG-PASSAGE-001": "PASSAGE_001",
        "RC-OG-PASSAGE-002": "PASSAGE_002",
        "RC-OG-PASSAGE-003": "PASSAGE_003",
        "RC-OG-PASSAGE-004": "PASSAGE_004",
        "RC-OG-PASSAGE-005": "PASSAGE_005",
        "RC-OG-PASSAGE-006": "PASSAGE_006",
        "RC-OG-PASSAGE-007": "PASSAGE_007",
        "RC-OG-PASSAGE-008": "PASSAGE_008",
        "RC-OG-PASSAGE-009": "PASSAGE_009",
        "RC-OG-PASSAGE-010": "PASSAGE_010",
        "RC-OG-PASSAGE-401": "PASSAGE_011",
        "RC-OG-PASSAGE-402": "PASSAGE_012",
        "RC-OG-PASSAGE-403": "PASSAGE_013",
        "RC-OG-PASSAGE-404": "PASSAGE_014",
        "RC-OG-PASSAGE-405": "PASSAGE_015",
        "RC-OG-PASSAGE-406": "PASSAGE_016",
        "RC-OG-PASSAGE-505": "PASSAGE_017",
        "RC-OG-PASSAGE-509": "PASSAGE_018",
        "RC-OG-PASSAGE-515": "PASSAGE_019",
        "RC-OG-PASSAGE-517": "PASSAGE_020",
        "RC-OG-PASSAGE-522": "PASSAGE_021",
        # PASSAGE-500 is the same content as PASSAGE-010
        "RC-OG-PASSAGE-500": "PASSAGE_010",
    }
    if pid in KNOWN:
        return KNOWN[pid]

    # New passages: RC-OG-PASSAGE-NNN-BX -> PASSAGE_BX_NNN
    m = re.match(r"RC-OG-PASSAGE-(\d+)(-B\d+)", pid)
    if m:
        num = m.group(1)
        suffix = m.group(2).lstrip("-")
        return f"PASSAGE_{suffix}_{num}"

    return pid  # fallback


def escape_ts_string(s: str) -> str:
    """Escape a string for use inside a TypeScript double-quoted string."""
    return s.replace("\\", "\\\\").replace('"', '\\"')


def patch_file(filepath: Path) -> None:
    print(f"\n{'='*60}")
    print(f"Patching: {filepath.name}")
    print(f"{'='*60}")

    src = filepath.read_text(encoding="utf-8")
    updated = src
    fixes_qt = 0
    fixes_pid = 0

    # Find all question blocks by scanning for id: "VR-GMAT-OG__-NNNNN"
    id_pattern = re.compile(r'id:\s*"VR-GMAT-OG__-(\d{5})"')

    # Build list of (question_number, position) in source
    positions = []
    for m in id_pattern.finditer(updated):
        qn = int(m.group(1))
        positions.append((qn, m.start(), m.end()))

    # For each question block, determine its extent as from its id: position to
    # just before the next id: position (or end of array)
    # Work in reverse to keep offsets valid
    for i in range(len(positions) - 1, -1, -1):
        qn, start, end = positions[i]
        block_end = positions[i + 1][1] if i + 1 < len(positions) else len(updated)
        block = updated[start:block_end]

        info = q_lookup.get(qn)
        if not info:
            continue

        new_pid = info.get("passage_id", "")
        new_qt = info.get("question_text_updated", "")

        # --- Patch question_text ---
        orig_qt = info.get("question_text", "")
        if new_qt and new_qt != orig_qt:
            # Find the question_text field in this block
            qt_pattern = re.compile(
                r'(question_text:\s*")([^"]*?)(")',
                re.DOTALL,
            )
            new_block = qt_pattern.sub(
                lambda m: m.group(1) + escape_ts_string(new_qt) + m.group(3),
                block,
                count=1,
            )
            if new_block != block:
                updated = updated[:start] + new_block + updated[start + len(block):]
                block = new_block  # refresh for next patch
                fixes_qt += 1
                print(f"  Q{qn}: question_text updated (line refs)")

        # --- Patch passage_id and passage_text ---
        if new_pid:
            new_const = pid_to_const(new_pid)

            # Patch passage_id: "RC-OG-PASSAGE-XXX" -> new_pid
            pid_pattern = re.compile(
                r'(passage_id:\s*)([A-Z_]+\.id|"[^"]*")',
            )
            orig_pid_in_block = None
            pm = pid_pattern.search(block)
            if pm:
                orig_pid_in_block = pm.group(2)
                new_pid_val = f'{new_const}.id'
                if orig_pid_in_block != new_pid_val:
                    new_block = pid_pattern.sub(
                        lambda m: m.group(1) + new_pid_val,
                        block,
                        count=1,
                    )
                    if new_block != block:
                        updated = updated[:start] + new_block + updated[start + len(block):]
                        block = new_block
                        fixes_pid += 1
                        print(f"  Q{qn}: passage_id -> {new_const}.id")

            # Patch passage_text: PASSAGE_XXX.content -> new_const.content
            pt_pattern = re.compile(
                r'(passage_text:\s*)([A-Z_]+\.content)',
            )
            pt_match = pt_pattern.search(block)
            if pt_match:
                orig_pt_const = pt_match.group(2)
                new_pt_val = f"{new_const}.content"
                if orig_pt_const != new_pt_val:
                    new_block = pt_pattern.sub(
                        lambda m: m.group(1) + new_pt_val,
                        block,
                        count=1,
                    )
                    if new_block != block:
                        updated = updated[:start] + new_block + updated[start + len(block):]
                        block = new_block
                        print(f"  Q{qn}: passage_text -> {new_const}.content")

    filepath.write_text(updated, encoding="utf-8")
    print(f"\n  Done. {fixes_qt} question_text updates, {fixes_pid} passage_id updates.")


def main():
    for rc_file in RC_FILES:
        if not rc_file.exists():
            print(f"  File not found: {rc_file}")
            continue
        patch_file(rc_file)

    print("\n" + "=" * 60)
    print("  All RC files patched.")
    print("=" * 60)


if __name__ == "__main__":
    main()
