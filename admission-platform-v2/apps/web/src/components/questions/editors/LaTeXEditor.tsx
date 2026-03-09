/**
 * LaTeXEditor
 * CodeMirror 6 editor with LaTeX syntax highlighting via ViewPlugin decorations.
 * Uses regex-based inline marks — no lezer/HighlightStyle dependency chain.
 *
 * Token colours (light theme):
 *  $...$  $$...$$  \[...\]  \(...\)  → amber-700  (math delimiters + content)
 *  \command                          → blue-700   (LaTeX commands)
 *  { }                              → violet-700  (braces)
 *  standalone numbers               → red-600    (numbers outside math too)
 *  **bold**                         → bold
 *  *italic*                         → italic gray
 */

import CodeMirror, {
  EditorView,
  Decoration,
  ViewPlugin,
  ViewUpdate,
  RangeSetBuilder,
} from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import type { DecorationSet } from '@uiw/react-codemirror';
import type { Extension } from '@codemirror/state';

// ── CSS classes injected once via EditorView.theme ────────────────────────────

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: '14px',
    fontFamily: "'CaskaydiaCove Nerd Font', 'Cascadia Code', Consolas, monospace",
  },
  '.cm-content': {
    padding: '12px 14px',
    lineHeight: '1.75',
    caretColor: '#111827',
  },
  '.cm-focused':     { outline: 'none' },
  '.cm-cursor':      { borderLeftColor: '#111827 !important' },
  // Selection rendered as an inline mark decoration (tok-sel) so it sits
  // in the content layer — above syntax-highlight spans, always visible.
  '.tok-sel':        { backgroundColor: '#bfdbfe', borderRadius: '2px' },
  '.cm-activeLine':  { backgroundColor: '#f9fafb' },
  '.cm-gutters':     { display: 'none' },
  '.cm-placeholder': { color: '#9ca3af', fontStyle: 'italic' },

  // Token colours — applied via mark decorations below
  '.tok-math':    { color: '#b45309', fontWeight: 'bold' },  // $ delimiters & math body
  '.tok-cmd':     { color: '#1d4ed8' },                      // \commands
  '.tok-brace':   { color: '#7c3aed' },                      // { }
  '.tok-num':     { color: '#dc2626' },                      // numbers
  '.tok-bold':    { fontWeight: '700' },
  '.tok-italic':  { fontStyle: 'italic', color: '#374151' },
});

// ── Mark decorations ──────────────────────────────────────────────────────────

const mathMark  = Decoration.mark({ class: 'tok-math'  });
const cmdMark   = Decoration.mark({ class: 'tok-cmd'   });
const braceMark = Decoration.mark({ class: 'tok-brace' });
const numMark   = Decoration.mark({ class: 'tok-num'   });
const boldMark  = Decoration.mark({ class: 'tok-bold'  });
const italicMark= Decoration.mark({ class: 'tok-italic'});
const selMark   = Decoration.mark({ class: 'tok-sel'   });

// ── Selection plugin ──────────────────────────────────────────────────────────
// Renders selections as inline mark decorations (content layer) so they're
// always visible above syntax-highlight spans.

function buildSelectionDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const sel = view.state.selection;
  const ranges = [...sel.ranges].filter(r => !r.empty).sort((a, b) => a.from - b.from);
  for (const r of ranges) {
    builder.add(r.from, r.to, selMark);
  }
  return builder.finish();
}

const selectionPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = buildSelectionDecorations(view); }
    update(update: ViewUpdate) {
      if (update.selectionSet || update.docChanged || update.viewportChanged) {
        this.decorations = buildSelectionDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

// Math content: any character OR an escape sequence (\$ \\ etc.), but not an
// unescaped closing delimiter.
// Inline $...$: body = (\\. | [^$\n])+ — handles \$ inside math
// Display $$...$$: body = (\\.|[^$\n])+  (allow $ only if not $$)
const TOKEN_RULES: [RegExp, typeof mathMark][] = [
  // Display math:  $$...$$  (must come before inline $ rule)
  [/(\$\$(?:\\.|[^$\n])*?\$\$)/g,  mathMark],
  // Display math:  \[...\]
  [/(\\\[(?:\\.|[\s\S])*?\\\])/g,  mathMark],
  // Inline math:  $...$  — body allows \$ and any non-$ non-newline char
  // Negative lookbehind/ahead ensures we don't match $$ again
  [/(?<!\$)(\$(?!\$)(?:\\.|[^$\n])+?\$)(?!\$)/g, mathMark],
  // Inline math:  \(...\)
  [/(\\\((?:\\.|[^)\n])*?\\\))/g,  mathMark],
  // LaTeX commands: \word  (after math rules so \[ \( are already consumed)
  [/(\\[a-zA-Z]+)/g,               cmdMark],
  // Escaped special chars: \$ \\ \{ \} — colour as command so they don't
  // confuse the brace/number rules
  [/(\\[${\\])/g,                  cmdMark],
  // Braces
  [/([{}])/g,                      braceMark],
  // Numbers (integer or decimal, optionally signed, not inside a word)
  [/(?<![a-zA-Z\d])(-?\d+(?:[.,]\d+)*)/g, numMark],
  // Markdown **bold**
  [/(\*\*(?:[^*\n]|\*(?!\*))+?\*\*)/g,      boldMark],
  // Markdown *italic* (not **)
  [/(?<!\*)(\*(?!\*)(?:[^*\n])+?\*)(?!\*)/g, italicMark],
];

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const collected: { from: number; to: number; deco: typeof mathMark }[] = [];

  for (const { from, to } of view.visibleRanges) {
    const text = view.state.sliceDoc(from, to);
    for (const [re, deco] of TOKEN_RULES) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const start = from + m.index;
        const end   = from + m.index + m[0].length;
        collected.push({ from: start, to: end, deco });
      }
    }
  }

  // Sort by from position, then by to (longest first) for same start
  collected.sort((a, b) => a.from - b.from || b.to - a.to);

  // Add non-overlapping decorations
  let cursor = -1;
  for (const { from, to, deco } of collected) {
    if (from >= cursor) {
      builder.add(from, to, deco);
      cursor = to;
    }
  }

  return builder.finish();
}

const latexPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: any) { this.decorations = buildDecorations(view); }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

// ── Extensions ────────────────────────────────────────────────────────────────

const extensions: Extension[] = [
  markdown(),
  latexPlugin,
  selectionPlugin,
  editorTheme,
  EditorView.lineWrapping,
];

// ── Component ─────────────────────────────────────────────────────────────────

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function LaTeXEditor({
  value,
  onChange,
  placeholder,
  minHeight = '120px',
  className = '',
}: LaTeXEditorProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-colors ${className}`}
      style={{ minHeight }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers:               false,
          foldGutter:                false,
          dropCursor:                false,
          allowMultipleSelections:   false,
          indentOnInput:             false,
          syntaxHighlighting:        false,
          drawSelection:             false,
          bracketMatching:           false,
          closeBrackets:             false,
          autocompletion:            false,
          rectangularSelection:      false,
          crosshairCursor:           false,
          highlightActiveLine:       true,
          highlightSelectionMatches: false,
          closeBracketsKeymap:       false,
          searchKeymap:              false,
          foldKeymap:                false,
          completionKeymap:          false,
          lintKeymap:                false,
        }}
        style={{ minHeight }}
      />
    </div>
  );
}
