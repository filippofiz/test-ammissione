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

export const MathJaxRenderer: React.FC<MathJaxRendererProps> = ({ children, className = '' }) => {
  // Handle both string content and React elements
  const content = typeof children === 'string' ? children : children;

  return (
    <div className={`mathjax-content ${className}`}>
      <MathJax dynamic>
        {content}
      </MathJax>
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