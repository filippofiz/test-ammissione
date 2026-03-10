/**
 * MarkdownTheoryRenderer — Smart slide-quality theory renderer
 *
 * Detects content patterns and renders them as visually distinct components:
 * - Definition paragraphs (**Term** (value): description) → colored cards
 * - Key-value list items (- **Term**: desc) → card grid
 * - Display math → gradient formula spotlight
 * - Tables → styled with gradient headers
 * - Blockquotes → labeled callout boxes
 * - Regular paragraphs → clean typography
 */

import React, { useMemo, memo } from 'react';
import { MathJax } from 'better-react-mathjax';

interface Props {
  children: string;
  className?: string;
}

// Color palette for cycling through definition cards
const CARD_COLORS = [
  { border: 'border-l-blue-500', bg: 'bg-blue-50/50', badge: 'bg-blue-100 text-blue-800', accent: 'text-blue-700' },
  { border: 'border-l-purple-500', bg: 'bg-purple-50/50', badge: 'bg-purple-100 text-purple-800', accent: 'text-purple-700' },
  { border: 'border-l-emerald-500', bg: 'bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-800', accent: 'text-emerald-700' },
  { border: 'border-l-amber-500', bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-800', accent: 'text-amber-700' },
  { border: 'border-l-rose-500', bg: 'bg-rose-50/50', badge: 'bg-rose-100 text-rose-800', accent: 'text-rose-700' },
  { border: 'border-l-cyan-500', bg: 'bg-cyan-50/50', badge: 'bg-cyan-100 text-cyan-800', accent: 'text-cyan-700' },
  { border: 'border-l-orange-500', bg: 'bg-orange-50/50', badge: 'bg-orange-100 text-orange-800', accent: 'text-orange-700' },
  { border: 'border-l-indigo-500', bg: 'bg-indigo-50/50', badge: 'bg-indigo-100 text-indigo-800', accent: 'text-indigo-700' },
];

// ─── Math segment splitter ───────────────────────────────────────────────────

function splitMathSegments(text: string): { type: 'text' | 'math-inline' | 'math-display'; content: string }[] {
  const segments: { type: 'text' | 'math-inline' | 'math-display'; content: string }[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const isDisplay = match[0].startsWith('$$');
    segments.push({ type: isDisplay ? 'math-display' : 'math-inline', content: match[0] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

// ─── Inline formatting ──────────────────────────────────────────────────────

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(
        <strong key={key++} className="font-semibold text-gray-900">{match[2]}</strong>
      );
    } else if (match[3]) {
      parts.push(<em key={key++} className="italic">{match[3]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return parts;
}

// ─── Rich line (mixed text + math + formatting) ─────────────────────────────

function RichLine({ text }: { text: string }) {
  const segments = splitMathSegments(text);
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'math-display') {
          return <MathJax key={i} dynamic>{seg.content}</MathJax>;
        }
        if (seg.type === 'math-inline') {
          return <MathJax key={i} dynamic inline>{seg.content}</MathJax>;
        }
        return <React.Fragment key={i}>{renderInlineFormatting(seg.content)}</React.Fragment>;
      })}
    </>
  );
}

// ─── Render rich text but strip the leading **bold** term (already shown as header) ─
function RichLineBody({ text }: { text: string }) {
  // Remove leading **...**  and optional (parenthetical) and colon/space
  const stripped = text
    .replace(/^\*\*[^*]+\*\*/, '')        // remove **term**
    .replace(/^\s*\([^)]*\)\s*/, '')       // remove (value)
    .replace(/^\s*[:—–-]\s*/, '')          // remove separator
    .trim();
  if (!stripped) return null;
  return <RichLine text={stripped} />;
}

// ─── Detect if a paragraph is a definition: starts with **Term** ────────────

function parseDefinitionLine(text: string): { term: string; parenthetical: string; body: string } | null {
  // Match: **Some Term** (optional parenthetical) optional-separator rest of text
  const m = text.match(/^\*\*([^*]+)\*\*\s*(?:\(([^)]*)\))?\s*[:—–-]?\s*(.*)/);
  if (!m) return null;
  return { term: m[1], parenthetical: m[2] || '', body: m[3] || '' };
}

// ─── Detect if a list item has a bold key: **Key**: description ─────────────

function parseKeyValueItem(text: string): { key: string; value: string } | null {
  const m = text.match(/^\*\*([^*]+)\*\*\s*[:—–-]\s*(.*)/);
  if (!m) return null;
  return { key: m[1], value: m[2] };
}

// ─── Main renderer ───────────────────────────────────────────────────────────

export const MarkdownTheoryRenderer: React.FC<Props> = memo(({ children, className = '' }) => {
  const elements = useMemo(() => {
    if (!children || typeof children !== 'string') return null;

    const lines = children.split('\n');
    const result: React.ReactNode[] = [];
    let i = 0;
    let cardColorIdx = 0;

    const nextColor = () => {
      const c = CARD_COLORS[cardColorIdx % CARD_COLORS.length];
      cardColorIdx++;
      return c;
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) { i++; continue; }

      // ─── Horizontal rule (---) ─────────────────────────────────────
      if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
        result.push(
          <div key={result.length} className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>
        );
        i++;
        continue;
      }

      // ─── ### Sub-heading ───────────────────────────────────────────
      if (trimmed.startsWith('### ')) {
        const c = nextColor();
        result.push(
          <div key={result.length} className="mt-6 mb-3 flex items-center gap-2.5">
            <div className={`w-1 h-6 rounded-full ${c.border.replace('border-l-', 'bg-')}`} />
            <h4 className="text-[15px] font-bold text-gray-900">
              <RichLine text={trimmed.slice(4)} />
            </h4>
          </div>
        );
        i++;
        continue;
      }

      // ─── ## Main heading — section title ───────────────────────────
      if (trimmed.startsWith('## ')) {
        result.push(
          <div key={result.length} className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
              <RichLine text={trimmed.slice(3)} />
            </h3>
            <div className="mt-1.5 h-0.5 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400" />
          </div>
        );
        i++;
        cardColorIdx = 0; // reset color cycle per section
        continue;
      }

      // ─── # Top heading ────────────────────────────────────────────
      if (trimmed.startsWith('# ')) {
        result.push(
          <div key={result.length} className="mb-5 pb-3 border-b-2 border-indigo-100">
            <h2 className="text-xl font-bold text-gray-900">
              <RichLine text={trimmed.slice(2)} />
            </h2>
          </div>
        );
        i++;
        continue;
      }

      // ─── Display math block ───────────────────────────────────────
      if (trimmed.startsWith('$$')) {
        let mathContent = trimmed;
        if (!trimmed.endsWith('$$') || trimmed === '$$') {
          i++;
          while (i < lines.length) {
            mathContent += '\n' + lines[i];
            if (lines[i].trim().endsWith('$$')) { i++; break; }
            i++;
          }
        } else {
          i++;
        }
        result.push(
          <div key={result.length} className="my-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-indigo-100/80 text-center">
            <MathJax dynamic>{mathContent}</MathJax>
          </div>
        );
        continue;
      }

      // ─── Blockquote (> ) — callout box ────────────────────────────
      if (trimmed.startsWith('> ')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quoteLines.push(lines[i].trim().slice(2));
          i++;
        }
        const joined = quoteLines.join(' ').toLowerCase();
        const isNota = joined.startsWith('nota') || joined.startsWith('ricorda') || joined.startsWith('attenzione');
        result.push(
          <div
            key={result.length}
            className={`my-4 rounded-xl overflow-hidden ${
              isNota
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase flex items-center gap-2 ${
              isNota ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <span>{isNota ? '\u26A0' : '\u2139'}</span>
              <span>{isNota ? 'Nota Bene' : 'Approfondimento'}</span>
            </div>
            <div className="px-4 py-3 text-sm leading-relaxed">
              {quoteLines.map((ql, qi) => (
                <React.Fragment key={qi}>
                  {qi > 0 && <br />}
                  <span className={isNota ? 'text-amber-900' : 'text-blue-900'}>
                    <RichLine text={ql} />
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        );
        continue;
      }

      // ─── Table ─────────────────────────────────────────────────────
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        const parseRow = (row: string) =>
          row.split('|').slice(1, -1).map(cell => cell.trim());
        const rows = tableLines.filter(l => !/^\|[\s\-:|]+\|$/.test(l));
        if (rows.length > 0) {
          const header = parseRow(rows[0]);
          const body = rows.slice(1).map(parseRow);
          result.push(
            <div key={result.length} className="my-4 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-500">
                    {header.map((cell, ci) => (
                      <th key={ci} className="px-4 py-2.5 text-left font-semibold text-white text-xs tracking-wider uppercase">
                        <RichLine text={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-gray-700 text-[14px] border-t border-gray-100">
                          <RichLine text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // ─── Unordered list ───────────────────────────────────────────
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          items.push(lines[i].trim().slice(2));
          i++;
        }

        // Check if items are key-value (**Key**: value) → render as mini-cards
        const kvItems = items.map(parseKeyValueItem);
        const allKV = kvItems.every(kv => kv !== null);

        if (allKV && kvItems.length > 0) {
          result.push(
            <div key={result.length} className="my-3 space-y-2">
              {kvItems.map((kv, ii) => {
                const c = CARD_COLORS[ii % CARD_COLORS.length];
                return (
                  <div key={ii} className={`flex items-start gap-3 p-3 rounded-lg border-l-[3px] ${c.border} ${c.bg}`}>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap ${c.badge}`}>
                      {kv!.key}
                    </span>
                    <span className="flex-1 text-[14px] text-gray-700 leading-relaxed">
                      <RichLine text={kv!.value} />
                    </span>
                  </div>
                );
              })}
            </div>
          );
        } else {
          // Regular bullet list
          result.push(
            <ul key={result.length} className="my-3 space-y-1.5 ml-1">
              {items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="flex-1 text-gray-700"><RichLine text={item} /></span>
                </li>
              ))}
            </ul>
          );
        }
        continue;
      }

      // ─── Ordered list ─────────────────────────────────────────────
      const olMatch = trimmed.match(/^(\d+)[.)]\s/);
      if (olMatch) {
        const items: string[] = [];
        while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+[.)]\s/, ''));
          i++;
        }
        result.push(
          <ol key={result.length} className="my-3 space-y-2 ml-1">
            {items.map((item, ii) => (
              <li key={ii} className="flex items-start gap-3 text-[15px] leading-relaxed">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{ii + 1}</span>
                </span>
                <span className="flex-1 text-gray-700 pt-0.5"><RichLine text={item} /></span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // ─── Definition paragraph: **Term** (optional): rest ──────────
      const def = parseDefinitionLine(trimmed);
      if (def) {
        const c = nextColor();
        result.push(
          <div key={result.length} className={`my-3 rounded-xl border-l-[3px] ${c.border} ${c.bg} p-4`}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`font-bold text-[15px] ${c.accent}`}>{def.term}</span>
              {def.parenthetical && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.badge}`}>
                  {def.parenthetical}
                </span>
              )}
            </div>
            {def.body && (
              <p className="text-[14px] leading-relaxed text-gray-700 mt-1">
                <RichLine text={def.body} />
              </p>
            )}
          </div>
        );
        i++;
        continue;
      }

      // ─── Regular paragraph ────────────────────────────────────────
      result.push(
        <p key={result.length} className="text-[15px] leading-[1.8] text-gray-700 my-2">
          <RichLine text={trimmed} />
        </p>
      );
      i++;
    }

    return result;
  }, [children]);

  return <div className={`theory-content ${className}`}>{elements}</div>;
});

MarkdownTheoryRenderer.displayName = 'MarkdownTheoryRenderer';
