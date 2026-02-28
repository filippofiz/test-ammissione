import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXProps {
  children: string;
  className?: string;
}

// Placeholder for escaped dollar signs - used during parsing
const ESCAPED_DOLLAR_PLACEHOLDER = '\u0000ESCAPED_DOLLAR\u0000';

// Render a plain-text string with **bold** and *italic* markdown formatting applied.
// Returns an array of React nodes (strings, <strong>, <em>).
const renderWithMarkdown = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*))/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[0].startsWith('**') || match[0].startsWith('__')) {
      const inner = match[2] ?? match[3];
      nodes.push(<strong key={nodes.length}>{inner}</strong>);
    } else {
      nodes.push(<em key={nodes.length}>{match[4]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
};

// Helper to restore escaped dollar placeholders back to $
const restoreEscapedDollars = (text: string): string => {
  return text.replace(new RegExp(ESCAPED_DOLLAR_PLACEHOLDER, 'g'), '$');
};

// Helper to check if a line is part of a markdown table
const isTableLine = (line: string): boolean => {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
};

// Helper to parse and render markdown-style tables
const parseMarkdownTable = (tableLines: string[], startKey: number): { node: React.ReactNode; nextKey: number } => {
  // Filter out separator line (contains only |, -, and spaces)
  const dataLines = tableLines.filter(line => !line.match(/^\|[\s\-:|]+\|$/));

  if (dataLines.length < 1) return { node: null, nextKey: startKey };

  let key = startKey;

  // Parse header
  const headerCells = dataLines[0]
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);

  // Parse body rows
  const bodyRows = dataLines.slice(1).map(line =>
    line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  );

  const tableNode = (
    <table key={key++} className="border-collapse border border-gray-300 my-3 mx-auto">
      <thead>
        <tr className="bg-gray-100">
          {headerCells.map((cell, i) => (
            <th key={i} className="border border-gray-300 px-4 py-2 text-left font-semibold">
              {renderWithMarkdown(restoreEscapedDollars(cell))}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                {renderWithMarkdown(restoreEscapedDollars(cell))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return { node: tableNode, nextKey: key };
};

// Helper to render plain text with newlines preserved as <br /> elements
// Also detects and renders markdown tables
const renderTextWithLineBreaks = (text: string, startKey: number): { nodes: React.ReactNode[]; nextKey: number } => {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = startKey;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this starts a markdown table
    if (isTableLine(line)) {
      // Collect all consecutive table lines
      const tableLines: string[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      // Render the table
      const { node: tableNode, nextKey } = parseMarkdownTable(tableLines, key);
      if (tableNode) {
        nodes.push(tableNode);
        key = nextKey;
      }
    } else {
      // Regular line
      if (nodes.length > 0) {
        nodes.push(<br key={`br-${key++}`} />);
      }
      if (line) {
        // Restore any escaped dollar placeholders back to $, then apply markdown formatting
        const restoredLine = restoreEscapedDollars(line);
        nodes.push(<React.Fragment key={key++}>{renderWithMarkdown(restoredLine)}</React.Fragment>);
      }
      i++;
    }
  }

  return { nodes, nextKey: key };
};

/**
 * LaTeX component that renders mathematical notation using KaTeX
 *
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * - Plain text (no LaTeX)
 * - Newlines preserved as <br /> elements
 * - Markdown-style tables (|...|)
 * - Escaped dollar signs (\$) for currency
 *
 * Example usage:
 * <LaTeX>This is $x^2 + y^2 = z^2$ inline math</LaTeX>
 * <LaTeX>$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$</LaTeX>
 * <LaTeX>The price is \$9.00</LaTeX>
 */
export const LaTeX: React.FC<LaTeXProps> = ({ children, className = '' }) => {
  // Handle null/undefined children
  if (!children) {
    return <span className={className}></span>;
  }

  // Preprocess: Use placeholder for escaped dollars to prevent them being treated as LaTeX
  // \$ or \\$ → placeholder (will be converted back to $ after parsing)
  // The double backslash (\\$) occurs when JSON-escaped strings are stored in the database
  // \9.00 or \\9.00 → $9.00 (malformed currency missing $)
  let processedText = children
    .replace(/\\\\?\$/g, ESCAPED_DOLLAR_PLACEHOLDER)  // \$ or \\$ → placeholder (restored later)
    .replace(/\\\\?([\d,]+(?:\.\d+)?)/g, '$$$$1'); // \9.00 or \\9.00 → $9.00 (need $$ because it's a replacement string)

  // Quick optimization: if no LaTeX delimiters, just return plain text with line breaks
  if (!processedText.includes('$') && !processedText.includes('\\[')) {
    const { nodes } = renderTextWithLineBreaks(processedText, 0);
    return <span className={className}>{nodes}</span>;
  }

  // Parse the text to find LaTeX expressions
  const parseLatex = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;
    let iterations = 0;
    const maxIterations = 1000; // Safety limit

    while (remaining.length > 0 && iterations < maxIterations) {
      iterations++;

      // Look for display math ($$...$$ or \[...\])
      const displayMatch = remaining.match(/^\$\$([\s\S]+?)\$\$/) || remaining.match(/^\\\[([\s\S]*?)\\\]/);
      if (displayMatch) {
        parts.push(<BlockMath key={key++} math={displayMatch[1]} />);
        remaining = remaining.slice(displayMatch[0].length);
        continue;
      }

      // Check for standalone currency FIRST: $number with optional suffix (M, K, B, million, etc.)
      // Examples: $4.8M, $185,000, $9.00, $1.5K, $4.32
      // Only match if followed by whitespace, punctuation, or end of string (not LaTeX operators)
      // BUT: Skip currency check if there's a closing $ nearby with math operators (to handle $1.5 < x < 5.5$)
      const nextDollarPos = remaining.indexOf('$', 1);
      const possibleMathContent = nextDollarPos !== -1 && nextDollarPos < 100
        ? remaining.substring(1, nextDollarPos)
        : null;
      const looksLikeMath = possibleMathContent && /[<>=\\^_{}a-zA-Z]/.test(possibleMathContent);

      if (!looksLikeMath) {
        // Check for currency - but NOT if followed by another $ (which would make it $...$)
        const currencyMatch = remaining.match(/^\$([\d,]+(?:\.\d+)?(?:[MKBmkb]|million|thousand|billion)?)(?=\s|[.,;:!?)]|$)(?!\$)/);
        if (currencyMatch) {
          // This is a standalone currency amount, render as plain text
          parts.push(<span key={key++}>{restoreEscapedDollars(currencyMatch[0])}</span>);
          remaining = remaining.slice(currencyMatch[0].length);
          continue;
        }
      }

      // Look for inline math ($...$) - only if not currency
      const inlineMatch = remaining.match(/^\$([^$]+?)\$/);
      if (inlineMatch) {
        const content = inlineMatch[1];

        // SPECIAL CASE: If content starts with ^ or _ (superscript/subscript),
        // merge it with the previous plain text part to create proper LaTeX
        if (/^[\^_]/.test(content) && parts.length > 0) {
          const lastPart = parts[parts.length - 1];

          // Check if last part was plain text (a span element)
          if (React.isValidElement(lastPart) && lastPart.type === 'span') {
            const prevText = lastPart.props.children;

            // Extract the last word/number from previous text
            const match = typeof prevText === 'string' ? prevText.match(/([a-zA-Z0-9./]+)$/):null;

            if (match) {
              const baseText = match[1]; // e.g., "m" or "kg/m"
              const prefix = prevText.substring(0, prevText.length - baseText.length);

              // Remove the last part and add two new parts:
              // 1. The prefix as plain text
              // 2. The base + superscript as math
              parts.pop();
              if (prefix) {
                parts.push(<span key={key++}>{restoreEscapedDollars(prefix)}</span>);
              }
              parts.push(<InlineMath key={key++} math={baseText + content} />);
              remaining = remaining.slice(inlineMatch[0].length);
              continue;
            }
          }
        }

        // Check if this contains LaTeX/math operators
        // Include: backslash, ^, _, {, }, common math operators like =, !, <, >, +, -, *, /
        // Also include Unicode math symbols: ≥, ≤, ≠, ×, ÷, ±, etc.
        // Do NOT include letters here - they're checked separately in isLikelyMath
        const hasMathOperators = /[\\^_{}=!<>\+\-\*\/≥≤≠×÷±∞∑∏∫√π∈∉⊂⊃∪∩]/.test(content);

        // Reject long text or text with multiple spaces as not being math
        // UNLESS it contains math operators (then it's definitely math)
        const hasMultipleSpaces = (content.match(/ /g) || []).length >= 2;
        const isTooLong = content.length > 50;

        if ((hasMultipleSpaces || isTooLong) && !hasMathOperators) {
          // This is not math, it's long text accidentally between dollar signs
          // Render the first $ and continue parsing from there (this is a literal $, not escaped)
          parts.push(<span key={key++}>{restoreEscapedDollars('$')}</span>);
          remaining = remaining.slice(1);
          continue;
        }

        // Check if this looks like actual LaTeX math
        // Math contains: letters, backslashes, ^, _, {, }, comparison operators (<, >, =), coordinate notation, OR numbers (including decimals with .)
        // Anything wrapped in $...$ should be rendered as math
        const isLikelyMath = /[a-zA-Z\\^_{}<=>\+\-\*\/(),\d\.]/.test(content);

        if (isLikelyMath) {
          // This is LaTeX math - render it
          parts.push(<InlineMath key={key++} math={content} />);
          remaining = remaining.slice(inlineMatch[0].length);
          continue;
        } else {
          // Not LaTeX math, render as plain text with dollar signs
          parts.push(<span key={key++}>{restoreEscapedDollars(inlineMatch[0])}</span>);
          remaining = remaining.slice(inlineMatch[0].length);
          continue;
        }
      }

      // Find next delimiter ($ or \[)
      const nextDollar = remaining.indexOf('$');
      const nextBracket = remaining.indexOf('\\[');

      // Determine which delimiter comes first
      let nextDelimiter = -1;
      let delimiterType: 'dollar' | 'bracket' | null = null;

      if (nextDollar === -1 && nextBracket === -1) {
        // No more delimiters
        nextDelimiter = -1;
      } else if (nextDollar === -1) {
        nextDelimiter = nextBracket;
        delimiterType = 'bracket';
      } else if (nextBracket === -1) {
        nextDelimiter = nextDollar;
        delimiterType = 'dollar';
      } else {
        if (nextDollar < nextBracket) {
          nextDelimiter = nextDollar;
          delimiterType = 'dollar';
        } else {
          nextDelimiter = nextBracket;
          delimiterType = 'bracket';
        }
      }

      if (nextDelimiter === -1) {
        // No more LaTeX, add rest as plain text with line breaks
        const { nodes, nextKey } = renderTextWithLineBreaks(remaining, key);
        parts.push(...nodes);
        key = nextKey;
        break;
      } else if (nextDelimiter === 0 && delimiterType === 'dollar') {
        // Dollar at start but didn't match - skip it
        parts.push(<span key={key++}>$</span>);
        remaining = remaining.slice(1);
      } else if (nextDelimiter === 0 && delimiterType === 'bracket') {
        // \[ at start but didn't match - skip it
        parts.push(<span key={key++}>\\[</span>);
        remaining = remaining.slice(2);
      } else {
        // Add text before next delimiter as plain text
        const plainText = remaining.slice(0, nextDelimiter);
        if (plainText) {
          // Check if this plain text ends with a number and next char is $ (European currency)
          // AND the $ is followed by space/punctuation/end (not another $ for inline math)
          if (delimiterType === 'dollar' && /[\d,]+(?:\.\d+)?$/.test(plainText)) {
            const charAfterDollar = remaining[nextDelimiter + 1];
            const isEuropeanCurrency = !charAfterDollar || /[\s.,;:!?)]/.test(charAfterDollar);

            if (isEuropeanCurrency) {
              // Include the $ as part of the currency, preserving line breaks
              const { nodes, nextKey } = renderTextWithLineBreaks(plainText + '$', key);
              parts.push(...nodes);
              key = nextKey;
              remaining = remaining.slice(nextDelimiter + 1); // Skip past the $
              continue;
            }
          }

          // Add plain text with line breaks preserved
          const { nodes, nextKey } = renderTextWithLineBreaks(plainText, key);
          parts.push(...nodes);
          key = nextKey;
        }
        remaining = remaining.slice(nextDelimiter);
      }
    }

    if (iterations >= maxIterations) {
      console.error('LaTeX parsing exceeded max iterations, returning plain text');
      return [<span key={0}>{restoreEscapedDollars(text)}</span>];
    }

    return parts.length > 0 ? parts : [<span key={0}>{restoreEscapedDollars(text)}</span>];
  };

  return <span className={className}>{parseLatex(processedText)}</span>;
};

export default LaTeX;
