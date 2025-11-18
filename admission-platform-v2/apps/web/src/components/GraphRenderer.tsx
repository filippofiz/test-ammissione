import React, { useEffect, useRef, useState } from 'react';
import functionPlot from 'function-plot';
import { MathJaxRenderer } from './MathJaxRenderer';

interface GraphRendererProps {
  functionString?: string;
  tikzCode?: string;
  options?: any[];
  correctAnswer?: string;
  className?: string;
}

interface ParsedFunction {
  fn: string;
  color?: string;
  graphType?: 'line' | 'scatter' | 'interval';
  range?: [number, number];
}

// Parse mathematical functions from LaTeX
const parseLatexFunction = (latex: string): string => {
  // Remove LaTeX delimiters
  let func = latex.replace(/\$+/g, '').replace(/\\displaystyle/g, '');

  // Convert LaTeX to function-plot syntax
  func = func
    // Trig functions
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\arcsin/g, 'asin')
    .replace(/\\arccos/g, 'acos')
    .replace(/\\arctan/g, 'atan')
    // Absolute value
    .replace(/\|([^|]+)\|/g, 'abs($1)')
    .replace(/\\left\|/g, 'abs(')
    .replace(/\\right\|/g, ')')
    // Fractions
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Powers and exponents
    .replace(/\^/g, '^')
    .replace(/e\^/g, 'exp')
    .replace(/\\exp/g, 'exp')
    // Square root
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '($2)^(1/($1))')
    // Logarithms
    .replace(/\\ln/g, 'log')
    .replace(/\\log_\{([^}]+)\}/g, 'log($1,')
    .replace(/\\log/g, 'log')
    // Greek letters
    .replace(/\\pi/g, 'PI')
    .replace(/\\theta/g, 'x')
    // Clean up
    .replace(/\s+/g, '')
    .replace(/y\s*=\s*/, '');

  return func;
};

// Analyze function characteristics for smart plotting
const analyzeFunctionType = (func: string): { type: string; domain?: [number, number]; features?: string[] } => {
  const features: string[] = [];
  let domain: [number, number] = [-5, 5];

  // Trigonometric functions
  if (func.includes('sin') || func.includes('cos') || func.includes('tan')) {
    features.push('trigonometric');
    domain = [-2 * Math.PI, 2 * Math.PI];
  }

  // Absolute value
  if (func.includes('abs')) {
    features.push('absolute-value');
  }

  // Exponential/logarithmic
  if (func.includes('exp') || func.includes('log')) {
    features.push('exponential');
    if (func.includes('log')) {
      domain = [0.1, 10];
    }
  }

  // Rational functions
  if (func.match(/\([^)]+\)\/\([^)]+\)/)) {
    features.push('rational');
  }

  // Polynomial degree detection
  const maxPower = Math.max(...(func.match(/x\^(\d+)/g) || []).map(m => parseInt(m.split('^')[1])), 1);
  if (maxPower > 1) {
    features.push(`polynomial-degree-${maxPower}`);
    domain = [-10, 10];
  }

  return { type: features.join(','), domain, features };
};

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  functionString,
  tikzCode,
  options = [],
  correctAnswer,
  className = ''
}) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  useEffect(() => {
    if (!graphRef.current) return;

    try {
      setError(null);

      // Parse functions from options or direct function string
      const functions: ParsedFunction[] = [];

      if (options && options.length > 0) {
        // Parse from multiple choice options
        options.forEach((opt, idx) => {
          if (typeof opt === 'object' && opt.value) {
            const parsed = parseLatexFunction(opt.value);
            if (parsed) {
              functions.push({
                fn: parsed,
                color: opt.key === correctAnswer ? '#10b981' : '#6b7280',
                graphType: 'line'
              });
            }
          } else if (typeof opt === 'string') {
            const parsed = parseLatexFunction(opt);
            if (parsed) {
              functions.push({
                fn: parsed,
                color: '#3b82f6',
                graphType: 'line'
              });
            }
          }
        });
      } else if (functionString) {
        // Single function from direct string
        const parsed = parseLatexFunction(functionString);
        if (parsed) {
          const analysis = analyzeFunctionType(parsed);
          functions.push({
            fn: parsed,
            color: '#3b82f6',
            graphType: 'line',
            range: analysis.domain
          });
        }
      } else if (tikzCode) {
        // Try to extract function from TikZ code
        const funcMatch = tikzCode.match(/\{([^}]+)\}/);
        if (funcMatch) {
          const parsed = parseLatexFunction(funcMatch[1]);
          if (parsed) {
            functions.push({
              fn: parsed,
              color: '#3b82f6',
              graphType: 'line'
            });
          }
        }
      }

      if (functions.length === 0) {
        throw new Error('No valid functions to plot');
      }

      // Determine optimal domain
      const allDomains = functions.map(f => {
        const analysis = analyzeFunctionType(f.fn);
        return analysis.domain || [-5, 5];
      });

      const xMin = Math.min(...allDomains.map(d => d[0]));
      const xMax = Math.max(...allDomains.map(d => d[1]));

      // Create the plot
      const plotData = functions.map(f => ({
        fn: f.fn,
        color: f.color || '#3b82f6',
        graphType: f.graphType || 'line'
      }));

      // Clear previous plot
      graphRef.current.innerHTML = '';

      // Render with function-plot
      functionPlot({
        target: graphRef.current,
        width: 600,
        height: 400,
        xAxis: {
          label: 'x',
          domain: [xMin, xMax]
        },
        yAxis: {
          label: 'y',
          domain: [-2, 2]
        },
        grid: true,
        data: plotData,
        tip: {
          xLine: true,
          yLine: true,
          renderer: function(x: number, y: number) {
            return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
          }
        }
      });

    } catch (err) {
      console.error('Graph rendering error:', err);
      setError(err instanceof Error ? err.message : 'Failed to render graph');

      // Fallback to showing the raw function
      if (graphRef.current) {
        graphRef.current.innerHTML = `
          <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-800 mb-2">Unable to render graph. Showing function:</p>
            <code class="block p-2 bg-white rounded border">${functionString || tikzCode || 'No function data'}</code>
          </div>
        `;
      }
    }
  }, [functionString, tikzCode, options, correctAnswer]);

  return (
    <div className={`graph-renderer ${className}`}>
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div
          ref={graphRef}
          className="w-full flex justify-center items-center min-h-[400px]"
        />

        {options.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Functions:</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, idx) => {
                const isCorrect = typeof opt === 'object' && opt.key === correctAnswer;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedFunction(typeof opt === 'string' ? opt : opt.value)}
                    className={`p-2 rounded text-left text-sm transition-colors ${
                      isCorrect ? 'bg-green-50 border-green-300 hover:bg-green-100' :
                      'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    } border`}
                  >
                    <MathJaxRenderer>
                      {typeof opt === 'string' ? opt : opt.value}
                    </MathJaxRenderer>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Advanced component for complex graphs
export const AdvancedGraphRenderer: React.FC<{
  question: any;
  className?: string;
}> = ({ question, className = '' }) => {
  const [mode, setMode] = useState<'graph' | 'latex'>('graph');

  // Extract function options
  const functionOptions = question.options ?
    Object.entries(question.options).map(([key, value]) => ({
      key,
      value: value as string
    })) : [];

  return (
    <div className={`advanced-graph-renderer ${className}`}>
      <div className="mb-2 flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200">
          <button
            onClick={() => setMode('graph')}
            className={`px-3 py-1 text-sm ${
              mode === 'graph' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            } rounded-l-lg transition-colors`}
          >
            Graph View
          </button>
          <button
            onClick={() => setMode('latex')}
            className={`px-3 py-1 text-sm ${
              mode === 'latex' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            } rounded-r-lg transition-colors`}
          >
            LaTeX View
          </button>
        </div>
      </div>

      {mode === 'graph' ? (
        <GraphRenderer
          options={functionOptions}
          correctAnswer={question.correct_answer}
          functionString={question.graph_latex}
          className={className}
        />
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
          <pre className="text-xs overflow-x-auto">
            {question.graph_latex || 'No LaTeX code available'}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GraphRenderer;