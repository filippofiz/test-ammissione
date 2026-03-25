"""
Stage 1: Image → Raw OCR Text
Scans raw_question_images/ for new images, runs GLM-OCR, writes results to raw_question_text/.

Usage:
  python extract_questions.py [--backend transformers|ollama] [--only <id>]
                              [--dry-run] [--status]
                              [--images-dir PATH] [--output-dir PATH]
                              [--ollama-host URL]
"""

import argparse
import base64
import json
import re
import sys
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths (relative to this script's location)
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent
GMAT_DIR = SCRIPT_DIR.parent.parent  # scripts/AI/ → scripts/ → GMAT/
DOCS_DIR = GMAT_DIR / "sources" / "official" / "GMAT Online Question Bank" / "docs"
DEFAULT_IMAGES_DIR = DOCS_DIR / "raw_question_images"
DEFAULT_OUTPUT_DIR = DOCS_DIR / "raw_question_text"
LOG_FILE = DOCS_DIR / "extraction_log.json"

OCR_PROMPT = (
    "Extract all text from this image verbatim.\n"
    "- Render all math as LaTeX: inline $formula$, display $$formula$$\n"
    "- Render all tables as GitHub-flavored markdown tables\n"
    "- Preserve answer choice labels (A, B, C, D, E) exactly\n"
    "- Do NOT summarize or infer — extract only what is visible\n"
    "- Do NOT describe or extract any charts or graphs — skip them entirely\n"
)

# ---------------------------------------------------------------------------
# Backend: Ollama
# ---------------------------------------------------------------------------

def ping_ollama(host: str) -> bool:
    import socket
    import urllib.request
    try:
        req = urllib.request.Request(f"{host}/api/tags")
        with urllib.request.urlopen(req, timeout=0.5):
            return True
    except Exception:
        return False


def ocr_ollama(image_path: Path, host: str) -> str:
    import urllib.request
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    payload = json.dumps({
        "model": "glm-ocr",
        "prompt": OCR_PROMPT,
        "images": [b64],
        "stream": False,
    }).encode()
    req = urllib.request.Request(
        f"{host}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read())
    return data.get("response", "")


# ---------------------------------------------------------------------------
# Backend: Transformers
# ---------------------------------------------------------------------------

_transformers_model = None
_transformers_processor = None

def load_transformers_model():
    global _transformers_model, _transformers_processor
    if _transformers_model is not None:
        return
    print("Loading GLM-OCR model via transformers (first run downloads ~1.8GB)...")
    import torch
    from transformers import AutoProcessor, AutoModelForImageTextToText
    MODEL_ID = "zai-org/GLM-OCR"
    _transformers_processor = AutoProcessor.from_pretrained(MODEL_ID, trust_remote_code=True)
    _transformers_model = AutoModelForImageTextToText.from_pretrained(
        MODEL_ID,
        dtype=torch.float32,
        trust_remote_code=True,
    )
    _transformers_model.eval()
    print("Model loaded.")


def ocr_transformers(image_path: Path) -> str:
    load_transformers_model()
    from PIL import Image
    image = Image.open(image_path).convert("RGB")
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": OCR_PROMPT},
            ],
        }
    ]
    import torch
    inputs = _transformers_processor.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_dict=True,
        return_tensors="pt",
    )
    with torch.no_grad():
        generated_ids = _transformers_model.generate(**inputs, max_new_tokens=8192)
    output = _transformers_processor.decode(
        generated_ids[0][inputs["input_ids"].shape[1]:],
        skip_special_tokens=True,
    )
    return output.strip()


# ---------------------------------------------------------------------------
# Image grouping
# Supported naming patterns (all grouped by the leading numeric ID):
#   100472.png                  → single image, id=100472
#   100441_a.png                → multi-image suffix letter, id=100441
#   100441_question1.png        → MSR question tab, id=100441
#   100441_question2.png        → MSR question tab, id=100441
#   100441_source_tab1.png      → MSR source tab, id=100441
#   100441_source_tab2.png      → MSR source tab, id=100441
# ---------------------------------------------------------------------------

def group_images(images_dir: Path) -> dict[str, list[Path]]:
    """Returns {question_id: [sorted list of image paths]}."""
    groups: dict[str, list[Path]] = {}
    for p in sorted(images_dir.iterdir()):
        if p.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
            continue
        # Extract leading numeric ID; anything after an underscore is a suffix
        m = re.match(r"^(\d+)(?:_.+)?$", p.stem)
        if not m:
            print(f"  [SKIP] Unrecognised filename: {p.name}")
            continue
        qid = m.group(1)
        groups.setdefault(qid, []).append(p)
    return groups


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_ocr_output(text: str) -> tuple[bool, str]:
    """Returns (needs_review, reason). needs_review=True means flag for manual check."""
    if len(text.strip()) < 50:
        return True, "OCR output too short (< 50 chars)"
    dollar_count = text.count("$") - text.count("$$") * 2
    if dollar_count % 2 != 0:
        return True, "Mismatched LaTeX $ delimiters"
    return False, ""


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
# Core extraction
# ---------------------------------------------------------------------------

def extract_question(
    question_id: str,
    image_paths: list[Path],
    output_dir: Path,
    backend: str,
    ollama_host: str,
    dry_run: bool,
) -> dict:
    output_file = output_dir / f"{question_id}.md"
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")

    if dry_run:
        print(f"  [DRY-RUN] Would OCR {len(image_paths)} image(s) -> {output_file.name}")
        return {}

    parts = []
    for img in image_paths:
        print(f"  OCR-ing {img.name} via {backend}...", end=" ", flush=True)
        try:
            if backend == "ollama":
                text = ocr_ollama(img, ollama_host)
            else:
                text = ocr_transformers(img)
            print("done.")
            parts.append(f"<!-- image: {img.name} -->\n{text}")
        except Exception as e:
            print(f"ERROR: {e}")
            entry = {
                "question_id": question_id,
                "source_images": [p.name for p in image_paths],
                "backend": backend,
                "extracted_at": timestamp,
                "status": "error",
                "raw_file": str(output_file.relative_to(output_dir.parent)),
                "needs_review": True,
                "error": str(e),
            }
            return entry

    combined_text = "\n\n".join(parts)
    needs_review, review_reason = validate_ocr_output(combined_text)

    source_names = ", ".join(p.name for p in image_paths)
    header = (
        f"<!-- GLM-OCR raw extraction -->\n"
        f"<!-- source: {source_names} -->\n"
        f"<!-- extracted_at: {timestamp} -->\n"
        f"<!-- backend: {backend} -->\n"
        + (f"<!-- needs_review: {review_reason} -->\n" if needs_review else "")
    )
    output_file.write_text(header + "\n" + combined_text, encoding="utf-8")

    status_icon = "[REVIEW]" if needs_review else "[OK]"
    review_note = f" ({review_reason})" if needs_review else ""
    print(f"  {status_icon} {question_id} -> {output_file.name}{review_note}")

    return {
        "question_id": question_id,
        "source_images": [p.name for p in image_paths],
        "backend": backend,
        "extracted_at": timestamp,
        "status": "success",
        "raw_file": output_file.name,
        "needs_review": needs_review,
        "error": review_reason if needs_review else None,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Stage 1: OCR GMAT question images.")
    parser.add_argument("--backend", choices=["transformers", "ollama"],
                        help="OCR backend. Auto-detects if omitted.")
    parser.add_argument("--ollama-host", default="http://localhost:11434",
                        help="Ollama server URL (default: http://localhost:11434)")
    parser.add_argument("--only", metavar="ID", help="Process only this question ID.")
    parser.add_argument("--dry-run", action="store_true",
                        help="List what would be processed without writing files.")
    parser.add_argument("--status", action="store_true",
                        help="Print extraction log summary and exit.")
    parser.add_argument("--images-dir", type=Path, default=DEFAULT_IMAGES_DIR,
                        help="Directory containing input images.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR,
                        help="Directory for raw OCR output files.")
    args = parser.parse_args()

    # --status mode
    if args.status:
        log = load_log(LOG_FILE)
        if not log:
            print("No extraction log found.")
            return
        ok = sum(1 for e in log if e.get("status") == "success" and not e.get("needs_review"))
        review = sum(1 for e in log if e.get("needs_review"))
        errors = sum(1 for e in log if e.get("status") == "error")
        print(f"Extraction log: {len(log)} total | {ok} OK | {review} needs review | {errors} errors")
        for e in log:
            flag = " [REVIEW]" if e.get("needs_review") else ""
            flag = " [ERROR]" if e.get("status") == "error" else flag
            print(f"  {e['question_id']}{flag}")
        return

    # Resolve backend
    backend = args.backend
    if backend is None:
        backend = "ollama" if ping_ollama(args.ollama_host) else "transformers"
        print(f"Auto-detected backend: {backend}")

    # Validate dirs
    if not args.images_dir.exists():
        print(f"Images directory not found: {args.images_dir}")
        sys.exit(1)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    # Group images
    groups = group_images(args.images_dir)
    if not groups:
        print("No images found in", args.images_dir)
        return

    if args.only:
        if args.only not in groups:
            print(f"Question ID '{args.only}' not found in images directory.")
            sys.exit(1)
        groups = {args.only: groups[args.only]}

    # Filter already-extracted
    pending = {
        qid: paths
        for qid, paths in groups.items()
        if not (args.output_dir / f"{qid}.md").exists()
    }
    skipped = len(groups) - len(pending)
    if skipped:
        print(f"Skipping {skipped} already-extracted question(s).")

    if not pending:
        print("Nothing to do.")
        return

    print(f"Processing {len(pending)} question(s) with backend={backend}...\n")

    log = load_log(LOG_FILE)
    new_entries = []

    for qid, paths in pending.items():
        entry = extract_question(qid, paths, args.output_dir, backend, args.ollama_host, args.dry_run)
        if entry:
            new_entries.append(entry)

    if new_entries and not args.dry_run:
        log.extend(new_entries)
        save_log(LOG_FILE, log)
        ok = sum(1 for e in new_entries if e.get("status") == "success" and not e.get("needs_review"))
        review = sum(1 for e in new_entries if e.get("needs_review"))
        errors = sum(1 for e in new_entries if e.get("status") == "error")
        print(f"\nDone: {ok} OK | {review} needs review | {errors} errors")
        print(f"Log saved to {LOG_FILE}")


if __name__ == "__main__":
    main()
