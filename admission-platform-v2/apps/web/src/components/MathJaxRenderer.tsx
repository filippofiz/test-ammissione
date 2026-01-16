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

export const MathJaxRenderer: React.FC<MathJaxRendererProps> = ({ children, className = '' }) => {
  // Handle both string content and React elements
  // For string content, preserve newlines and render markdown tables
  const renderContent = () => {
    if (typeof children !== 'string') {
      return children;
    }

    const lines = children.split('\n');
    if (lines.length === 1) {
      return <MathJax dynamic>{children}</MathJax>;
    }

    // Process lines, detecting and grouping table rows
    const elements: React.ReactNode[] = [];
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
        elements.push(
          <React.Fragment key={`table-${elements.length}`}>
            {parseMarkdownTable(tableLines)}
          </React.Fragment>
        );
      } else {
        // Regular line - render with MathJax
        elements.push(
          <React.Fragment key={elements.length}>
            {elements.length > 0 && <br />}
            <MathJax dynamic inline>{line}</MathJax>
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