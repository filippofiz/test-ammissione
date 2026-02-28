"""Append 14 new passage constants to passages_OG.ts."""
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PASSAGES_TS = SCRIPT_DIR.parent / "sources" / "questions" / "VR" / "passages_OG.ts"
rc_passages = json.loads((SCRIPT_DIR / "rc_passages.json").read_text(encoding="utf-8"))

NEW_IDS = [
    "RC-OG-PASSAGE-001-B2",
    "RC-OG-PASSAGE-002-B2",
    "RC-OG-PASSAGE-002-B3",
    "RC-OG-PASSAGE-003-B2",
    "RC-OG-PASSAGE-003-B3",
    "RC-OG-PASSAGE-004-B2",
    "RC-OG-PASSAGE-004-B3",
    "RC-OG-PASSAGE-005-B2",
    "RC-OG-PASSAGE-005-B3",
    "RC-OG-PASSAGE-006-B2",
    "RC-OG-PASSAGE-007-B2",
    "RC-OG-PASSAGE-008-B2",
    "RC-OG-PASSAGE-009-B2",
    "RC-OG-PASSAGE-010-B2",
]

TITLES = {
    "RC-OG-PASSAGE-001-B2": "Linda Kerber and Women in the American Revolution",
    "RC-OG-PASSAGE-002-B2": "Continental Drift and Plate Tectonics",
    "RC-OG-PASSAGE-002-B3": "Environmental Regulations and Corporate Competition",
    "RC-OG-PASSAGE-003-B2": "Manufacturing Scale Economics",
    "RC-OG-PASSAGE-003-B3": "Corporate Mergers and Acquisitions Studies",
    "RC-OG-PASSAGE-004-B2": "Resin, Amber, and Fossil Preservation",
    "RC-OG-PASSAGE-004-B3": "Timucua of Florida: Gender and Social Structure",
    "RC-OG-PASSAGE-005-B2": "Latin America and the Great Depression",
    "RC-OG-PASSAGE-005-B3": "Labor Relations and Industrial Unions in the US",
    "RC-OG-PASSAGE-006-B2": "Salmon Habitat and Straying Behavior",
    "RC-OG-PASSAGE-007-B2": "Thalidomide and the Drug Approval Process",
    "RC-OG-PASSAGE-008-B2": "Royalist Women and Early English Feminism",
    "RC-OG-PASSAGE-009-B2": "CIO Industrial Unions and Racial Integration",
    "RC-OG-PASSAGE-010-B2": "Amphibian Population Declines",
}

src = PASSAGES_TS.read_text(encoding="utf-8")
blocks = []

for pid in NEW_IDS:
    p = rc_passages.get(pid, {})
    lines = p.get("lines", [])
    topic = p.get("topic", "")

    if not lines:
        print(f"  WARNING: no lines for {pid}")
        continue

    m = re.match(r"RC-OG-PASSAGE-(\d+)(-B\d+)", pid)
    if not m:
        print(f"  Skipping {pid} (no match)")
        continue
    num = m.group(1)
    suffix = m.group(2).lstrip("-")   # B2, B3
    const_name = f"PASSAGE_{suffix}_{num}"

    if const_name in src:
        print(f"  {const_name} already exists, skipping")
        continue

    # Reconstruct content paragraphs from lines
    content_parts: list[str] = []
    para: list[str] = []
    for line in lines:
        if line == "":
            if para:
                content_parts.append(" ".join(para))
                para = []
        else:
            para.append(line)
    if para:
        content_parts.append(" ".join(para))
    content = "\n\n".join(content_parts)
    # Escape for TypeScript template literal
    content_escaped = content.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

    lines_json = json.dumps(lines, ensure_ascii=False)
    title = TITLES.get(pid, "")

    block = (
        f"\nexport const {const_name} = {{\n"
        f'  id: "{pid}",\n'
        f'  title: "{title}",\n'
        f"  content: `{content_escaped}`,\n"
        f'  topic: "{topic}",\n'
        f"  lines: {lines_json},\n"
        f"}};\n"
    )
    blocks.append(block)
    print(f"  Appended {const_name} ({len(lines)} lines)")

if blocks:
    src = src.rstrip() + "\n" + "".join(blocks)
    PASSAGES_TS.write_text(src, encoding="utf-8")
    print(f"\nWritten {len(blocks)} new passages to passages_OG.ts")
else:
    print("No new passages to append")
