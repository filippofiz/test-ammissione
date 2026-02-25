#!/usr/bin/env python3
"""
GMAT Extracted JSON Formatting Fixer
======================================
Applies post-processing rules to all string fields in extracted questions.json.

Rules (applied only to text OUTSIDE existing LaTeX $...$ blocks):

  1. En-dash / em-dash  -> regular hyphen -
     U+2013 (en) and U+2014 (em) replaced with -

  2. Dollar amounts  -> LaTeX
     $30          ->  $\\$30$
     $91.25       ->  $\\$91.25$
     $1,200       ->  $\\$1{,}200$

  3. Percentages  -> LaTeX
     12%          ->  $12\\%$
     15.6%        ->  $15.6\\%$

  4. Bare standalone numbers  -> LaTeX
     30 passengers  ->  $30$ passengers
     Skips: 4-digit years (1900-2099), times (H:MM), ordinals (1st, 2nd),
     numbers adjacent to letters, and numbers already inside $...$

Pipeline order (important for correctness):
  a. dashes (no LaTeX involved)
  b. dollar amounts (raw $N -> LaTeX; must run before LaTeX tokeniser)
  c. percentages (raw N% -> LaTeX; runs after tokeniser protects new blocks)
  d. bare numbers (runs last; tokeniser now protects $ and $ blocks)

Usage:
    python fix_formatting.py \\
        --input "GMAT/sources/official/GMAT Practice QR Online/extracted/questions.json"

    # Dry-run (preview only)
    python fix_formatting.py --input ... --dry-run

    # Fix one question only (for testing)
    python fix_formatting.py --input ... --only 4GM116 --dry-run
"""

import argparse
import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# LaTeX tokeniser
# Identifies $...$ blocks that contain genuine math (not bare dollar amounts).
# A genuine LaTeX block: starts with $, ends with $, contains backslash, ^, _,
# {, }, or is a single word/digit sequence without prose spaces.
# We rely on the pipeline order: dollar amounts are converted to $\$...$
# BEFORE the tokeniser is used for percents/bare-numbers, so by that point
# the only remaining bare $ are the LaTeX delimiters.
# ---------------------------------------------------------------------------

LATEX_RE = re.compile(
    r'\$'                        # opening $
    r'(?:'
    r'(?:\\.|[^$\n])'            # content: escaped char OR any non-$ non-newline
    r')*?'                       # lazy
    r'\$'                        # closing $
)


def split_latex(text: str) -> list[tuple[bool, str]]:
    """
    Split text into [(is_latex, segment), ...] pairs.
    is_latex=True means the segment is inside $...$, do not transform it.
    """
    parts: list[tuple[bool, str]] = []
    last = 0
    for m in LATEX_RE.finditer(text):
        if m.start() > last:
            parts.append((False, text[last:m.start()]))
        parts.append((True, m.group()))
        last = m.end()
    if last < len(text):
        parts.append((False, text[last:]))
    return parts


def apply_to_plain(text: str, fn) -> str:
    """Apply fn only to non-LaTeX segments, return reassembled string."""
    return ''.join(
        seg if is_latex else fn(seg)
        for is_latex, seg in split_latex(text)
    )


# ---------------------------------------------------------------------------
# Step 1 — dashes (no LaTeX interaction needed)
# ---------------------------------------------------------------------------

def fix_dashes(text: str) -> str:
    return text.replace('\u2013', '-').replace('\u2014', '-')


# ---------------------------------------------------------------------------
# Step 2 — dollar amounts
# Must run BEFORE the LaTeX tokeniser is used for subsequent steps,
# because bare "$30" would confuse the $...$ tokeniser.
# Strategy: scan for $ followed by a number, convert to $\$...$,
# being careful not to touch $ that are already LaTeX delimiters.
#
# A bare dollar amount is: $ immediately followed by digit(s)/comma/dot
# A LaTeX $ is: $ followed by a letter, backslash, or another $.
# ---------------------------------------------------------------------------

def _fix_dollars_segment(seg: str) -> str:
    """
    Convert bare dollar amounts to LaTeX within a plain-text segment.
    Since this runs only on non-LaTeX segments, we don't need to worry about
    existing $...$ blocks — they've already been extracted by split_latex.
    """
    def repl(m):
        amount = m.group(1)
        latex_amount = amount.replace(',', '{,}')
        return r'$\$' + latex_amount + r'$'

    # Match $ followed by digit-starting number; not followed by ^_{  (math operators)
    return re.sub(
        r'(?<![\\$])\$(\d[\d,]*(?:\.\d+)?)(?![_^{])',
        repl,
        seg,
    )


def fix_dollars(text: str) -> str:
    """Apply dollar-amount fix only to non-LaTeX segments."""
    return apply_to_plain(text, _fix_dollars_segment)


# ---------------------------------------------------------------------------
# Step 3 — percentages (runs after LaTeX tokeniser is reliable)
# ---------------------------------------------------------------------------

def _fix_percents_segment(seg: str) -> str:
    return re.sub(r'(\d+\.?\d*)%', r'$\1\\%$', seg)


def fix_percents(text: str) -> str:
    return apply_to_plain(text, _fix_percents_segment)


# ---------------------------------------------------------------------------
# Step 4 — bare numbers
# ---------------------------------------------------------------------------

NUMBER_RE = re.compile(
    r'(?<![A-Za-z\d\\$.,:/])'   # not preceded by letter/digit/special (/ added)
    r'(-?)'                      # optional leading minus
    r'(\d{1,3}(?:,\d{3})*|\d+)' # integer with optional thousands groups
    r'(\.\d+)?'                  # optional decimal
    r'(?![A-Za-z\d,.:%$\\/])'   # not followed by letter/digit/special (/ added)
)


def _fix_bare_numbers_segment(seg: str) -> str:
    def repl(m):
        sign = m.group(1)
        integer_part = m.group(2)
        decimal_part = m.group(3) or ''

        # Skip years (1900-2099)
        if re.fullmatch(r'(19|20)\d{2}', integer_part):
            return m.group()

        # Skip ordinals — won't reach here because digits followed by
        # st/nd/rd/th are excluded by the (?![A-Za-z]) lookahead already.

        latex_int = integer_part.replace(',', '{,}')
        latex_num = sign + latex_int + decimal_part
        return f'${latex_num}$'

    return NUMBER_RE.sub(repl, seg)


def fix_bare_numbers(text: str) -> str:
    return apply_to_plain(text, _fix_bare_numbers_segment)


# ---------------------------------------------------------------------------
# Master fix_text
# ---------------------------------------------------------------------------

def fix_text(text: str) -> str:
    text = fix_dashes(text)       # step 1: dashes
    text = fix_dollars(text)      # step 2: dollars (before tokeniser)
    text = fix_percents(text)     # step 3: percentages
    text = fix_bare_numbers(text) # step 4: bare numbers
    return text


# ---------------------------------------------------------------------------
# Recursive field fixer
# ---------------------------------------------------------------------------

SKIP_FIELDS = {
    'gmat_id', 'di_type', 'correct_answer', 'needs_manual_review',
    'has_table', 'has_chart', 'has_image', 'is_true', 'difficulty',
    'question_type', 'tab_name', 'content_type',
    # GI blank options and correct values are matched by string equality — keep plain
    'blank1_options', 'blank2_options', 'blank1_correct', 'blank2_correct',
}


def fix_value(val, field_name: str = ''):
    if field_name in SKIP_FIELDS:
        return val
    if isinstance(val, str):
        return fix_text(val)
    if isinstance(val, list):
        return [fix_value(item, field_name) for item in val]
    if isinstance(val, dict):
        return {k: fix_value(v, k) for k, v in val.items()}
    return val


def fix_question(q: dict) -> dict:
    return {k: fix_value(v, k) for k, v in q.items()}


# ---------------------------------------------------------------------------
# Diff display
# ---------------------------------------------------------------------------

def _flatten(obj, prefix='') -> dict[str, str]:
    result = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            key = f'{prefix}.{k}' if prefix else k
            result.update(_flatten(v, key))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            result.update(_flatten(v, f'{prefix}[{i}]'))
    else:
        result[prefix] = str(obj)
    return result


def show_diff(original: dict, fixed: dict, gmat_id: str):
    orig_flat = _flatten(original)
    fixed_flat = _flatten(fixed)
    changed = [
        (k, orig_flat.get(k, ''), fixed_flat.get(k, ''))
        for k in fixed_flat
        if orig_flat.get(k) != fixed_flat.get(k)
    ]
    if not changed:
        print(f'  {gmat_id}: no changes')
        return
    print(f'  {gmat_id}: {len(changed)} field(s) changed')
    for key, before, after in changed[:12]:
        b = before[:110].replace('\n', '\\n')
        a = after[:110].replace('\n', '\\n')
        print(f'    [{key}]')
        print(f'      BEFORE: {b}')
        print(f'      AFTER : {a}')
    if len(changed) > 12:
        print(f'    ... ({len(changed) - 12} more)')


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def run(input_path: Path, only: str | None, dry_run: bool):
    with open(input_path, encoding='utf-8') as f:
        questions: list[dict] = json.load(f)

    targets = [q for q in questions if q.get('gmat_id') == only] if only else questions
    if only and not targets:
        print(f'ERROR: {only} not found in {input_path}')
        sys.exit(1)

    print(f'\nProcessing {len(targets)} question(s) in {input_path}')
    print(f'Dry run: {dry_run}\n')

    fixed_by_id: dict[str, dict] = {}
    changed_count = 0
    for q in targets:
        fixed = fix_question(q)
        gid = q['gmat_id']
        fixed_by_id[gid] = fixed
        if json.dumps(q, ensure_ascii=False) != json.dumps(fixed, ensure_ascii=False):
            changed_count += 1
        show_diff(q, fixed, gid)

    print(f'\nSummary: {changed_count}/{len(targets)} questions modified')

    if dry_run:
        print('[DRY RUN] No files written.')
        return

    updated = [fixed_by_id.get(q['gmat_id'], q) for q in questions]
    with open(input_path, 'w', encoding='utf-8') as f:
        json.dump(updated, f, ensure_ascii=False, indent=2)
    print(f'Written: {input_path}')


def main():
    parser = argparse.ArgumentParser(
        description='Fix formatting in extracted GMAT questions JSON.'
    )
    parser.add_argument('--input', type=Path, required=True,
                        help='Path to extracted questions.json')
    parser.add_argument('--only', metavar='GMAT_ID',
                        help='Fix only one question (for testing)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without writing')
    args = parser.parse_args()

    if not args.input.exists():
        print(f'ERROR: {args.input} not found')
        sys.exit(1)

    run(args.input, args.only, args.dry_run)


if __name__ == '__main__':
    main()
