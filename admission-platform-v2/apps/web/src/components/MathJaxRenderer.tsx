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
// IMPORTANT: Protects $...$ and $$...$$ math blocks from markdown parsing so that
// asterisks inside math (e.g. $m^*$) are not treated as italic markers.
const MATH_PLACEHOLDER = '\uFFFE_MATH_';

const splitMarkdownSegments = (text: string): MarkdownSegment[] => {
  // Step 1: Extract inline/display math blocks to protect them from markdown parsing
  const mathBlocks: string[] = [];
  let protected_ = text;
  // Extract $$...$$ first (greedy match for display math)
  protected_ = protected_.replace(/\$\$([\s\S]*?)\$\$/g, (m) => {
    const idx = mathBlocks.length;
    mathBlocks.push(m);
    return `${MATH_PLACEHOLDER}${idx}\uFFFE`;
  });
  // Extract $...$ (inline math, non-greedy, single line)
  protected_ = protected_.replace(/\$([^$\n]+?)\$/g, (m) => {
    const idx = mathBlocks.length;
    mathBlocks.push(m);
    return `${MATH_PLACEHOLDER}${idx}\uFFFE`;
  });

  // Step 2: Apply markdown parsing on the protected text
  const segments: MarkdownSegment[] = [];
  // Matches **bold**, __bold__, or *italic* (in that priority order)
  const pattern = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*))/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(protected_)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: protected_.slice(lastIndex, match.index) });
    }
    if (match[0].startsWith('**') || match[0].startsWith('__')) {
      const inner = match[2] ?? match[3];
      segments.push({ type: 'bold', content: inner });
    } else {
      segments.push({ type: 'italic', content: match[4] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < protected_.length) {
    segments.push({ type: 'text', content: protected_.slice(lastIndex) });
  }

  const result = segments.length > 0 ? segments : [{ type: 'text', content: protected_ }];

  // Step 3: Restore math blocks in all segments
  if (mathBlocks.length > 0) {
    const restore = (s: string): string => {
      return s.replace(new RegExp(`${MATH_PLACEHOLDER}(\\d+)\uFFFE`, 'g'), (_, idx) => {
        return mathBlocks[parseInt(idx, 10)];
      });
    };
    for (const seg of result) {
      seg.content = restore(seg.content);
    }
  }

  return result;
};

// Render a line or cell with markdown bold/italic support.
// Bold/italic inner text is rendered as plain HTML (no MathJax wrapper) so it stays inline.
// Surrounding plain-text segments are passed to MathJax for math rendering.
const InlineMarkdownRenderer: React.FC<{ content: string; inline?: boolean }> = memo(({ content, inline = true }) => {
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

// Helper to parse and render markdown-style tables
const parseMarkdownTable = (tableLines: string[]): React.ReactNode => {
  // Filter out separator line (contains only |, -, and spaces)
  const dataLines = tableLines.filter(line => !line.match(/^\|[\s\-:|]+\|$/));

  if (dataLines.length < 1) return null;

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

  return (
    <table className="border-collapse border border-gray-300 my-3 mx-auto">
      <thead>
        <tr className="bg-gray-100">
          {headerCells.map((cell, i) => (
            <th key={i} className="border border-gray-300 px-4 py-2 text-left font-semibold">
              <InlineMarkdownRenderer content={cell} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                <InlineMarkdownRenderer content={cell} />
              </td>
            ))}
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