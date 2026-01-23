import React from 'react';
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
              <MathJax dynamic inline>{cell}</MathJax>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, rowIndex) => (
          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                <MathJax dynamic inline>{cell}</MathJax>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Helper to check if a line is part of a markdown table
const isTableLine = (line: string): boolean => {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
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

export const MathJaxRenderer: React.FC<MathJaxRendererProps> = ({ children, className = '' }) => {
  // Handle both string content and React elements
  // For string content, preserve newlines and render markdown tables and display math
  const renderContent = () => {
    if (typeof children !== 'string') {
      return children;
    }

    // Preprocess: Normalize escaped dollars for MathJax
    // When stored in DB as JSON, \$ becomes \\$ - normalize to \$ for MathJax's processEscapes
    // Also handle malformed \9.00 or \\9.00 patterns (should be \$9.00 for MathJax)
    let processedContent = children
      .replace(/\\\\\$/g, '\\$')  // \\$ → \$ (normalize double backslash from JSON)
      .replace(/\\\\([\d,]+(?:\.\d+)?)/g, '\\$$$1'); // \\9.00 → \$9.00

    const lines = processedContent.split('\n');
    if (lines.length === 1) {
      return <MathJax dynamic>{processedContent}</MathJax>;
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
            <MathJax dynamic>{mathBlock}</MathJax>
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
            <MathJax dynamic inline>{restoredLine}</MathJax>
          </React.Fragment>
        );
        i++;
      }
    }

    return elements;
  };

  return (
    <div className={`mathjax-content ${className}`}>
      {renderContent()}
    </div>
  );
};

// Component specifically for rendering TikZ graphs
export const TikZGraph: React.FC<{ latex: string; className?: string }> = ({ latex, className = '' }) => {
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
      <MathJax dynamic>
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
};

// Legacy compatibility wrapper for react-katex style usage
export const LaTeXMathJax: React.FC<{ children: string; className?: string }> = ({ children, className }) => {
  return <MathJaxRenderer className={className}>{children}</MathJaxRenderer>;
};

export default MathJaxRenderer;