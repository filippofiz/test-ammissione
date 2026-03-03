import React, { useMemo, memo } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

// MathJax configuration with support for advanced LaTeX features including tables
const mathJaxConfig = {
  loader: {
    load: ['[tex]/html', '[tex]/ams', '[tex]/color', '[tex]/bbox', '[tex]/boldsymbol', '[tex]/colortbl']
  },
  tex: {
    packages: {
      '[+]': ['html', 'ams', 'color', 'bbox', 'boldsymbol', 'colortbl']
    },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true,
    processEnvironments: true,
    macros: {
      // Add support for TikZ-like commands (simplified)
      tikz: ['\\text{[Graph: #1]}', 1],
      tikzpicture: ['\\begin{array}{c}\\text{[Graph]}\\\\#1\\end{array}', 1],
      axis: ['\\text{[Axis: #1]}', 1],
      addplot: ['\\text{[Plot: #1]}', 1],
    },
    // Map tabular to array for MathJax compatibility
    environments: {
      tabular: ['array', '']
    }
  },
  svg: {
    fontCache: 'global',
    scale: 1,
    minScale: 0.5,
    displayAlign: 'center',
    displayIndent: '0'
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    ignoreHtmlClass: 'no-mathjax',
    processHtmlClass: 'mathjax',
    renderActions: {
      // Add custom render actions if needed
    }
  }
};

interface MathJaxRendererProps {
  children: React.ReactNode;
  className?: string;
}

export const MathJaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MathJaxContext config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  );
};

// Helper to check if a line is part of a markdown table
const isTableLine = (line: string): boolean => {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
};

// Markdown bold/italic segment types
type MarkdownSegment =
  | { type: 'bold'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'text'; content: string };

// Split text into segments based on **bold**, __bold__, and *italic* markers.
// Segments preserve their inner content (including any math) so MathJax can process them.
const splitMarkdownSegments = (text: string): MarkdownSegment[] => {
  const segments: MarkdownSegment[] = [];
  // Matches **bold**, __bold__, or *italic* (in that priority order)
  const pattern = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*))/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    if (match[0].startsWith('**') || match[0].startsWith('__')) {
      // Bold: inner content is capture group 2 or 3
      const inner = match[2] ?? match[3];
      segments.push({ type: 'bold', content: inner });
    } else {
      // Italic: inner content is capture group 4
      segments.push({ type: 'italic', content: match[4] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
};

// Render a line or cell with markdown bold/italic support.
// Bold/italic inner text is rendered as plain HTML (no MathJax wrapper) so it stays inline.
// Surrounding plain-text segments are passed to MathJax for math rendering.
export const InlineMarkdownRenderer: React.FC<{ content: string; inline?: boolean }> = memo(({ content, inline = true }) => {
  const segments = splitMarkdownSegments(content);
  if (segments.length === 1 && segments[0].type === 'text') {
    return <MathJax dynamic inline={inline}>{content}</MathJax>;
  }
  // When there are mixed segments (bold/italic + text/math), force inline=true on all
  // MathJax segments so they flow inline alongside the bold/italic HTML elements.
  return (
    <span style={{ display: 'inline' }}>
      {segments.map((seg, i) => {
        if (seg.type === 'bold') {
          return <strong key={i} style={{ display: 'inline', fontWeight: 'bold' }}><MathJax dynamic inline>{seg.content}</MathJax></strong>;
        } else if (seg.type === 'italic') {
          return <em key={i} style={{ display: 'inline', fontStyle: 'italic' }}><MathJax dynamic inline>{seg.content}</MathJax></em>;
        }
        return <MathJax key={i} dynamic inline>{seg.content}</MathJax>;
      })}
    </span>
  );
});
InlineMarkdownRenderer.displayName = 'InlineMarkdownRenderer';

// Split a markdown table line into raw cells (preserving empty cells)
const splitTableRow = (line: string): string[] =>
  line.split('|').slice(1, -1).map(cell => cell.trim());

// Helper to parse and render markdown-style tables.
// Supports colspan (consecutive empty header cells) and rowspan (leading empty body cells
// that repeat the structure from the previous non-empty row).
const parseMarkdownTable = (tableLines: string[]): React.ReactNode => {
  // Filter out separator lines (contain only |, -, :, and spaces)
  const dataLines = tableLines.filter(line => !line.match(/^\|[\s\-:|]+\|$/));

  if (dataLines.length < 1) return null;

  // --- Parse header with colspan detection ---
  // Empty cells immediately following a non-empty cell extend its colspan.
  const rawHeader = splitTableRow(dataLines[0]);
  interface HeaderCell { content: string; colspan: number }
  const headerCells: HeaderCell[] = [];
  for (const cell of rawHeader) {
    if (cell === '' && headerCells.length > 0) {
      headerCells[headerCells.length - 1].colspan++;
    } else {
      headerCells.push({ content: cell, colspan: 1 });
    }
  }

  // Total logical columns = sum of colspans (= rawHeader.length)
  const totalCols = rawHeader.length;

  // --- Parse body rows with rowspan detection ---
  // An empty leading cell that aligns with a column that had content in a previous row
  // is treated as a rowspan continuation.
  const rawBodyRows = dataLines.slice(1).map(splitTableRow);

  // rowspanTracker[colIndex] = { content, remaining } — tracks active rowspan cells
  const rowspanTracker: Array<{ content: string; remaining: number } | null> =
    Array(totalCols).fill(null);

  interface BodyCell { content: string; rowspan: number; colspan: number; isSpanned: boolean }
  const parsedBodyRows: BodyCell[][] = [];

  for (const rawRow of rawBodyRows) {
    // Pad row to totalCols if shorter
    const padded = [...rawRow];
    while (padded.length < totalCols) padded.push('');

    const cells: BodyCell[] = [];
    let colIdx = 0;

    while (colIdx < totalCols) {
      // Skip columns occupied by an active rowspan
      if (rowspanTracker[colIdx] && rowspanTracker[colIdx]!.remaining > 0) {
        rowspanTracker[colIdx]!.remaining--;
        cells.push({ content: rowspanTracker[colIdx]!.content, rowspan: 1, colspan: 1, isSpanned: true });
        colIdx++;
        continue;
      }

      const cellContent = padded[colIdx] ?? '';

      // Detect colspan: count consecutive empty cells after this one
      let colspan = 1;
      while (colIdx + colspan < totalCols && (padded[colIdx + colspan] ?? '') === '') {
        colspan++;
      }

      // Detect rowspan: if this cell is non-empty, scan ahead to count how many
      // subsequent rows have empty cells in the same column position.
      let rowspan = 1;
      if (cellContent !== '' && colspan === 1) {
        const rowPos = parsedBodyRows.length;
        for (let r = rowPos + 1; r < rawBodyRows.length; r++) {
          const futureRow = rawBodyRows[r];
          const futureCell = (futureRow[colIdx] ?? '').trim();
          if (futureCell === '') rowspan++;
          else break;
        }
        if (rowspan > 1) {
          rowspanTracker[colIdx] = { content: cellContent, remaining: rowspan - 1 };
        }
      }

      cells.push({ content: cellContent, rowspan, colspan, isSpanned: false });
      colIdx += colspan;
    }

    parsedBodyRows.push(cells);
  }

  // Filter out rows that are entirely spanned (all cells are isSpanned placeholders)
  // so we don't render duplicate rows — only render each logical row once.
  // We use a "rowgroup" approach: group consecutive raw rows that belong to the same
  // visual row (where the first non-spanned column repeats).
  // Instead, we simply skip rendering a cell when isSpanned=true (it was already rendered
  // via rowspan on a previous row).

  return (
    <table className="border-collapse border border-gray-300 my-3 mx-auto text-sm">
      <thead>
        <tr className="bg-gray-100">
          {headerCells.map((cell, i) => (
            <th
              key={i}
              colSpan={cell.colspan}
              className="border border-gray-300 px-4 py-2 text-center font-semibold"
            >
              <InlineMarkdownRenderer content={cell.content} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {parsedBodyRows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, cellIndex) =>
              cell.isSpanned ? null : (
                <td
                  key={cellIndex}
                  rowSpan={cell.rowspan > 1 ? cell.rowspan : undefined}
                  colSpan={cell.colspan > 1 ? cell.colspan : undefined}
                  className="border border-gray-300 px-4 py-2 text-center align-middle"
                >
                  <InlineMarkdownRenderer content={cell.content} />
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Placeholder for extracted display math blocks
const DISPLAY_MATH_PLACEHOLDER = '\uFFFD_DISPLAY_MATH_';

/**
 * Extract display math blocks ($$...$$ and \[...\]) from content
 * Replaces them with unique placeholders to prevent line-splitting from breaking them
 *
 * @param content - The text content containing math expressions
 * @returns Object with content (with placeholders) and extracted blocks array
 */
const extractDisplayMathBlocks = (content: string): { content: string; blocks: string[] } => {
  const blocks: string[] = [];

  // Extract $$...$$ blocks (non-greedy, multi-line)
  let processedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
    const index = blocks.length;
    blocks.push(match);
    return `${DISPLAY_MATH_PLACEHOLDER}${index}\uFFFD`;
  });

  // Extract \[...\] blocks (non-greedy, multi-line)
  processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (match) => {
    const index = blocks.length;
    blocks.push(match);
    return `${DISPLAY_MATH_PLACEHOLDER}${index}\uFFFD`;
  });

  return { content: processedContent, blocks };
};

/**
 * Check if a line contains only a display math placeholder
 *
 * @param line - The line to check
 * @returns The block index if line is a standalone placeholder, null otherwise
 */
const getStandaloneDisplayMathIndex = (line: string): number | null => {
  const match = line.match(new RegExp(`${DISPLAY_MATH_PLACEHOLDER}(\\d+)\uFFFD`));
  if (match && line.trim() === match[0]) {
    return parseInt(match[1], 10);
  }
  return null;
};

/**
 * Restore display math blocks in a line by replacing placeholders with actual math
 *
 * @param line - The line potentially containing placeholders
 * @param blocks - Array of extracted display math blocks
 * @returns Line with placeholders replaced by math blocks
 */
const restoreDisplayMathInLine = (line: string, blocks: string[]): string => {
  let restoredLine = line;
  const placeholderRegex = new RegExp(`${DISPLAY_MATH_PLACEHOLDER}(\\d+)\uFFFD`, 'g');
  const matches = line.matchAll(placeholderRegex);

  for (const match of matches) {
    const blockIndex = parseInt(match[1], 10);
    if (blockIndex < blocks.length) {
      const mathBlock = blocks[blockIndex];
      restoredLine = restoredLine.replace(match[0], mathBlock);
    }
  }

  return restoredLine;
};

// Memoized MathJax wrapper to prevent unnecessary re-renders
// The `dynamic` prop is essential - it tells MathJax to re-typeset when content changes
const MemoizedMathJax = memo(({ content, inline = false }: { content: string; inline?: boolean }) => (
  <MathJax dynamic inline={inline}>{content}</MathJax>
));
MemoizedMathJax.displayName = 'MemoizedMathJax';

export const MathJaxRenderer: React.FC<MathJaxRendererProps> = memo(({ children, className = '' }) => {
  // Memoize the rendered content to prevent re-processing on every render
  const renderedContent = useMemo(() => {
    if (typeof children !== 'string') {
      return children;
    }

    // Preprocess: Normalize escaped dollars for MathJax
    // When stored in DB as JSON, \$ becomes \\$ - normalize to \$ for MathJax's processEscapes
    // Also handle malformed \9.00 or \\9.00 patterns (should be \$9.00 for MathJax)
    // Also collapse newlines around markdown bold/italic markers so they render inline.
    // e.g. "In the\n**graduating**\nclass" → "In the **graduating** class"
    const processedContent = children
      .replace(/\\\\\$/g, '\\$')  // \\$ → \$ (normalize double backslash from JSON)
      .replace(/\\\\([\d,]+(?:\.\d+)?)/g, '\\$$$1') // \\9.00 → \$9.00
      // Collapse newlines that isolate a markdown marker onto its own line → render inline
      // e.g. "In the\n**graduating**\nclass" → "In the **graduating** class"
      .replace(/\n(\*\*[^*\n]+\*\*|\*[^*\n]+\*|__[^_\n]+__)\n/g, ' $1 ')
      .replace(/\n(\*\*[^*\n]+\*\*|\*[^*\n]+\*|__[^_\n]+__)$/gm, ' $1'); // handle end-of-string case

    const lines = processedContent.split('\n');
    if (lines.length === 1) {
      return <InlineMarkdownRenderer content={processedContent} inline={false} />;
    }

    // STEP 1: Extract display math blocks before line splitting
    // This prevents multi-line display math ($$...$$ and \[...\]) from being broken apart
    const { content: contentWithPlaceholders, blocks: displayMathBlocks } = extractDisplayMathBlocks(processedContent);

    // STEP 2: Split by lines (display math blocks are now safe as placeholders)
    const linesWithPlaceholders = contentWithPlaceholders.split('\n');

    // STEP 3: Process lines, handling tables and restoring display math
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < linesWithPlaceholders.length) {
      const line = linesWithPlaceholders[i];

      // Check if this line is a standalone display math placeholder
      const standaloneIndex = getStandaloneDisplayMathIndex(line);
      if (standaloneIndex !== null) {
        // Render display math block without inline prop
        const mathBlock = displayMathBlocks[standaloneIndex];
        elements.push(
          <React.Fragment key={elements.length}>
            {elements.length > 0 && <br />}
            <MemoizedMathJax content={mathBlock} />
          </React.Fragment>
        );
        i++;
      } else if (isTableLine(line)) {
        // Collect all consecutive table lines
        const tableLines: string[] = [];
        while (i < linesWithPlaceholders.length && isTableLine(linesWithPlaceholders[i])) {
          tableLines.push(linesWithPlaceholders[i]);
          i++;
        }
        // Render the table
        elements.push(
          <React.Fragment key={`table-${elements.length}`}>
            {parseMarkdownTable(tableLines)}
          </React.Fragment>
        );
      } else {
        // Regular line - restore any inline display math and render with inline prop
        const restoredLine = restoreDisplayMathInLine(line, displayMathBlocks);

        elements.push(
          <React.Fragment key={elements.length}>
            {elements.length > 0 && <br />}
            <InlineMarkdownRenderer content={restoredLine} />
          </React.Fragment>
        );
        i++;
      }
    }

    return elements;
  }, [children]);

  return (
    <div className={`mathjax-content ${className}`}>
      {renderedContent}
    </div>
  );
});
MathJaxRenderer.displayName = 'MathJaxRenderer';

// Component specifically for rendering TikZ graphs
export const TikZGraph: React.FC<{ latex: string; className?: string }> = memo(({ latex, className = '' }) => {
  // For now, we'll render a placeholder since full TikZ support requires additional libraries
  // In production, you'd want to either:
  // 1. Use a service to compile TikZ to SVG server-side
  // 2. Use tikzjax library (adds ~8MB to bundle)
  // 3. Pre-compile graphs to SVG during the conversion process

  return (
    <div className={`tikz-graph ${className} p-4 bg-gray-50 rounded-lg border-2 border-gray-300`}>
      <div className="text-center text-gray-600 mb-2">
        <strong>Graph (TikZ)</strong>
      </div>
      <MathJax>
        {/* Render the TikZ code as text for now, or a simplified version */}
        <pre className="text-xs overflow-x-auto bg-white p-2 rounded">
          {latex}
        </pre>
      </MathJax>
      <div className="text-xs text-gray-500 mt-2 text-center">
        Note: Full TikZ rendering requires additional configuration
      </div>
    </div>
  );
});
TikZGraph.displayName = 'TikZGraph';

// Legacy compatibility wrapper for react-katex style usage
export const LaTeXMathJax: React.FC<{ children: string; className?: string }> = memo(({ children, className }) => {
  return <MathJaxRenderer className={className}>{children}</MathJaxRenderer>;
});
LaTeXMathJax.displayName = 'LaTeXMathJax';

export default MathJaxRenderer;