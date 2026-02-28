"""
add_line_offsets.py

Step 1: For every passage constant in passages_OG.ts that has a `lines:` array,
        compute a `lineOffsets` field (1-based line number → char offset in content)
        and insert it right after the `lines:` array in the TS source.

Step 2: For every question in the three RC question files that already has
        `passage_text: PASSAGE_XXX.content`, add (if missing):
            passage_line_offsets: PASSAGE_XXX.lineOffsets,
        right after the passage_text line.

Usage:
  py admission-platform-v2/GMAT/scripts/add_line_offsets.py
"""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
VR_DIR = SCRIPT_DIR.parent / "sources" / "questions" / "VR"
PASSAGES_TS = VR_DIR / "passages_OG.ts"

RC_FILES = [
    VR_DIR / "verbal_reasoning_OG_RC_easy.ts",
    VR_DIR / "verbal_reasoning_OG_RC_medium.ts",
    VR_DIR / "verbal_reasoning_OG_RC_hard.ts",
]


# ---------------------------------------------------------------------------
# Step 1 — patch passages_OG.ts: add lineOffsets after each lines: [...]
# ---------------------------------------------------------------------------

def compute_line_offsets(lines: list[str]) -> dict[int, int]:
    """
    Given the lines[] array (which may contain "" for blank/paragraph-break lines),
    compute the character offset within the joined content string where each
    **numbered** line starts. Blank lines ("") are skipped for numbering purposes.

    The content is reconstructed the same way append_new_passages.py does it:
      paragraphs separated by "\\n\\n", words within a paragraph separated by " ".
    But for the offset mapping we need absolute char positions in the final string.
    """
    # Reconstruct paragraphs
    paragraphs: list[list[str]] = []
    para: list[str] = []
    for ln in lines:
        if ln == "":
            if para:
                paragraphs.append(para)
                para = []
        else:
            para.append(ln)
    if para:
        paragraphs.append(para)

    # Build the content string (same as passage .content field)
    content_parts = [" ".join(p) for p in paragraphs]
    content = "\n\n".join(content_parts)

    # Now walk through lines[] again, tracking char offsets in `content`
    line_offsets: dict[int, int] = {}
    line_number = 0
    char_pos = 0
    para_idx = 0
    line_in_para = 0  # which line within current paragraph

    # Flatten paragraphs for sequential processing
    flat: list[tuple[int, str]] = []  # (para_idx, line_text)
    for pi, p in enumerate(paragraphs):
        for li, lt in enumerate(p):
            flat.append((pi, lt))

    # Compute cumulative char offsets of each paragraph start in content
    para_starts: list[int] = []
    pos = 0
    for pi, p in enumerate(paragraphs):
        para_starts.append(pos)
        para_content = " ".join(p)
        pos += len(para_content)
        if pi < len(paragraphs) - 1:
            pos += 2  # "\n\n"

    # Now for each (non-blank) line in lines[], compute its offset
    line_number = 0
    line_in_para_idx = 0  # index within flat
    char_in_para = 0  # current char offset within paragraph

    pi_cur = -1
    char_in_para = 0

    for pi, lt in flat:
        if pi != pi_cur:
            # New paragraph
            pi_cur = pi
            char_in_para = 0

        line_number += 1
        abs_offset = para_starts[pi] + char_in_para
        line_offsets[line_number] = abs_offset

        # Advance char_in_para: line text + space (except last line in para)
        char_in_para += len(lt)
        para = paragraphs[pi]
        line_idx_in_para = sum(1 for (p2, _) in flat[:flat.index((pi, lt))] if p2 == pi)
        if line_idx_in_para < len(para) - 1:
            char_in_para += 1  # space between words on same line when joined

    return line_offsets


def patch_passages_ts() -> dict[str, list[str]]:
    """
    Reads passages_OG.ts, finds every passage const with a `lines:` array,
    computes lineOffsets, and inserts `lineOffsets: {...},` right after the
    closing `]` of the lines array.

    Returns a dict: const_name -> lines[] for use in step 2.
    """
    src = PASSAGES_TS.read_text(encoding="utf-8")
    updated = src

    # Match each passage const block
    # Pattern: export const PASSAGE_XXX = { ... };
    const_pattern = re.compile(
        r'(export const (PASSAGE_\w+) = \{)(.*?)(^\};)',
        re.DOTALL | re.MULTILINE,
    )

    const_lines_map: dict[str, list[str]] = {}  # const_name -> lines[]
    patches: list[tuple[int, int, str]] = []     # (start, end, replacement)

    for m in const_pattern.finditer(src):
        const_name = m.group(2)
        block = m.group(0)
        block_start = m.start()
        block_end = m.end()

        # Check if lineOffsets already present
        if "lineOffsets:" in block:
            # Still extract lines for step 2
            lines_m = re.search(r'lines:\s*(\[.*?\])\s*,', block, re.DOTALL)
            if lines_m:
                lines_json = lines_m.group(1)
                try:
                    lines_arr = json.loads(lines_json)
                    const_lines_map[const_name] = lines_arr
                except json.JSONDecodeError:
                    pass
            continue

        # Find lines: [...] in the block
        lines_m = re.search(r'(lines:\s*)(\[.*?\])(\s*,?\s*\n)', block, re.DOTALL)
        if not lines_m:
            continue

        lines_json = lines_m.group(2)
        try:
            lines_arr = json.loads(lines_json)
        except json.JSONDecodeError as e:
            print(f"  WARNING: could not parse lines[] for {const_name}: {e}")
            continue

        const_lines_map[const_name] = lines_arr

        # Compute offsets
        offsets = compute_line_offsets(lines_arr)
        offsets_json = json.dumps(offsets)

        # Insert lineOffsets after the closing ] of lines array
        lines_end = block_start + lines_m.start() + lines_m.end()
        lines_end_in_block = lines_m.end()

        # Build the insertion string
        insertion = f"  lineOffsets: {offsets_json},\n"

        patches.append((block_start + lines_m.end(), insertion))
        print(f"  {const_name}: {len(offsets)} line offsets computed")

    # Apply patches in reverse order to preserve offsets
    patches.sort(key=lambda x: x[0], reverse=True)
    for insert_pos, insertion in patches:
        updated = updated[:insert_pos] + insertion + updated[insert_pos:]

    if patches:
        PASSAGES_TS.write_text(updated, encoding="utf-8")
        print(f"\nPatched {len(patches)} passage constants in passages_OG.ts")
    else:
        print("No passages needed lineOffsets update")

    return const_lines_map


# ---------------------------------------------------------------------------
# Step 2 — patch RC question files: add passage_line_offsets
# ---------------------------------------------------------------------------

def patch_rc_files() -> None:
    """
    For each RC question file, find all occurrences of:
        passage_text: PASSAGE_XXX.content,
    and add (if not already present):
        passage_line_offsets: PASSAGE_XXX.lineOffsets,
    right after.
    """
    # Pattern matches passage_text: PASSAGE_XXX.content,
    pt_pattern = re.compile(
        r'([ \t]*passage_text:\s*(PASSAGE_\w+)\.content,\n)'
    )

    for rc_file in RC_FILES:
        if not rc_file.exists():
            print(f"  Not found: {rc_file}")
            continue

        src = rc_file.read_text(encoding="utf-8")
        count = 0

        def replacer(m: re.Match) -> str:
            nonlocal count
            full_line = m.group(1)
            const_name = m.group(2)
            indent = re.match(r'([ \t]*)', full_line).group(1)
            new_line = f"{indent}passage_line_offsets: {const_name}.lineOffsets,\n"

            # Check if the next line already has passage_line_offsets
            # (we'll do a post-pass check instead)
            count += 1
            return full_line + new_line

        updated = pt_pattern.sub(replacer, src)

        # Remove any duplicates that were already there before we ran
        # (pattern: passage_line_offsets: ... followed immediately by passage_line_offsets: ...)
        dup_pattern = re.compile(
            r'([ \t]*passage_line_offsets:\s*\w+\.lineOffsets,\n)'
            r'([ \t]*passage_line_offsets:\s*\w+\.lineOffsets,\n)'
        )
        updated = dup_pattern.sub(r'\1', updated)

        if updated != src:
            rc_file.write_text(updated, encoding="utf-8")
            print(f"  {rc_file.name}: {count} passage_line_offsets lines added")
        else:
            print(f"  {rc_file.name}: no changes needed")


def main():
    print("=" * 60)
    print("Step 1: Add lineOffsets to passage constants")
    print("=" * 60)
    const_lines_map = patch_passages_ts()

    print()
    print("=" * 60)
    print("Step 2: Add passage_line_offsets to RC question files")
    print("=" * 60)
    patch_rc_files()

    print()
    print("=" * 60)
    print("Done.")
    print("=" * 60)


if __name__ == "__main__":
    main()
