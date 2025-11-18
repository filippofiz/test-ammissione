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
  range?: [number, number];
}

// Parse mathematical functions from LaTeX
const parseLatexFunction = (latex: string): string => {
  // Remove LaTeX delimiters
  let func = latex.replace(/\$+/g, '').replace(/\\displaystyle/g, '').trim();

  // Check if this is already a TikZ/JavaScript-style function (no backslashes)
  // TikZ uses functions like abs(cos(x)), which are already JS-compatible
  const hasLatexCommands = func.includes('\\');

  if (!hasLatexCommands && (func.includes('abs') || func.includes('sin') || func.includes('cos'))) {
    // Already in TikZ format, minimal processing needed
    console.log('[GraphRenderer] Function already in TikZ format:', func);
    return func
      .replace(/\s+/g, '')
      .replace(/y\s*=\s*/, '');
  }

  // Convert LaTeX to function-plot syntax
  func = func
    // Trig functions (BEFORE absolute value replacements to avoid concatenation)
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\arcsin/g, 'asin')
    .replace(/\\arccos/g, 'acos')
    .replace(/\\arctan/g, 'atan')
    // Logarithms
    .replace(/\\ln/g, 'log')
    .replace(/\\log_\{([^}]+)\}/g, 'log($1,')
    .replace(/\\log/g, 'log')
    // Exponentials
    .replace(/\\exp/g, 'exp')
    .replace(/e\^/g, 'exp')
    // Square root
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '($2)^(1/($1))')
    // Absolute value (AFTER function name replacements)
    // First, ensure all function calls have proper parentheses: sin x -> sin(x)
    .replace(/(sin|cos|tan|asin|acos|atan|log|exp|sqrt)\s+([a-zA-Z0-9]+)(?!\()/g, '$1($2)')
    // Handle functions followed by absolute value: sin|x| -> sin(abs(x))
    .replace(/(sin|cos|tan|asin|acos|atan|log|exp|sqrt)\s*\|([^|]+)\|/g, '$1(abs($2))')
    // Handle general absolute value: |expr| -> abs(expr)
    .replace(/\|([^|]+)\|/g, 'abs($1)')
    .replace(/\\left\|/g, 'abs(')
    .replace(/\\right\|/g, ')')
    // Fractions
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Powers and exponents - convert curly braces to parentheses
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/\^/g, '^')
    // Greek letters
    .replace(/\\pi/g, 'PI')
    .replace(/\\theta/g, 'x')
    // Clean up
    .replace(/\s+/g, '')
    .replace(/y\s*=\s*/, '');

  console.log('[GraphRenderer] Parsed LaTeX function:', latex, '->', func);
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

      // Detect if functionString is actually TikZ code
      const isTikZCode = functionString?.includes('\\begin{tikzpicture}') ||
                         functionString?.includes('\\addplot') ||
                         functionString?.includes('\\begin{axis}');

      // Route TikZ code to tikzCode processing
      const effectiveTikzCode = isTikZCode ? functionString : tikzCode;
      const effectiveFunctionString = isTikZCode ? undefined : functionString;

      console.log('[GraphRenderer] Input detection:', {
        hasOptions: options && options.length > 0,
        hasFunctionString: !!effectiveFunctionString,
        hasTikzCode: !!effectiveTikzCode,
        isTikZDetected: isTikZCode
      });

      if (options && options.length > 0) {
        // Parse from multiple choice options
        options.forEach((opt, idx) => {
          if (typeof opt === 'object' && opt.value) {
            const parsed = parseLatexFunction(opt.value);
            if (parsed) {
              functions.push({
                fn: parsed,
                color: opt.key === correctAnswer ? '#10b981' : '#6b7280'
              });
            }
          } else if (typeof opt === 'string') {
            const parsed = parseLatexFunction(opt);
            if (parsed) {
              functions.push({
                fn: parsed,
                color: '#3b82f6'
              });
            }
          }
        });
      } else if (effectiveFunctionString) {
        // Single function from direct string
        const parsed = parseLatexFunction(effectiveFunctionString);
        if (parsed) {
          const analysis = analyzeFunctionType(parsed);
          functions.push({
            fn: parsed,
            color: '#3b82f6',
            range: analysis.domain
          });
        }
      } else if (effectiveTikzCode) {
        // Try to extract function from TikZ code
        console.log('[GraphRenderer] Processing TikZ code:', effectiveTikzCode);

        // Look for \addplot commands with function definitions
        const addplotMatch = effectiveTikzCode.match(/\\addplot\[?[^\]]*\]?\s*\{([^}]+)\}/);
        if (addplotMatch) {
          let funcStr = addplotMatch[1].trim();
          console.log('[GraphRenderer] Extracted function from TikZ:', JSON.stringify(funcStr));

          // Handle deg(x) in TikZ
          // In TikZ, deg() converts radians to degrees, but JS trig functions expect radians
          // So we remove deg() since the domain is in radians and JS functions expect radians
          funcStr = funcStr.replace(/deg\(([^)]+)\)/g, '$1');
          console.log('[GraphRenderer] After deg() removal:', JSON.stringify(funcStr));

          // For TikZ functions that are already in JS format, don't call parseLatexFunction
          // Just ensure proper spacing
          let parsed = funcStr.replace(/\s+/g, '');
          console.log('[GraphRenderer] Final parsed function:', JSON.stringify(parsed));

          if (parsed) {
            // Try to extract domain from TikZ axis configuration
            const xminMatch = effectiveTikzCode.match(/xmin\s*=\s*(-?[\d.]+)/);
            const xmaxMatch = effectiveTikzCode.match(/xmax\s*=\s*(-?[\d.]+)/);

            const domain: [number, number] = xminMatch && xmaxMatch
              ? [parseFloat(xminMatch[1]), parseFloat(xmaxMatch[1])]
              : [-5, 5];

            console.log('[GraphRenderer] Domain extracted:', domain);

            functions.push({
              fn: parsed,
              color: '#3b82f6',
              range: domain
            });
          }
        } else {
          // Fallback: try to find any function in curly braces
          const funcMatch = effectiveTikzCode.match(/\{([^}]+)\}/);
          if (funcMatch) {
            console.log('[GraphRenderer] Fallback: extracted function:', funcMatch[1]);
            const parsed = parseLatexFunction(funcMatch[1]);
            if (parsed) {
              functions.push({
                fn: parsed,
                color: '#3b82f6'
              });
            }
          }
        }
      }

      if (functions.length === 0) {
        throw new Error('No valid functions to plot');
      }

      // Determine optimal domain
      const allDomains = functions.map(f => {
        if (f.range) return f.range;
        const analysis = analyzeFunctionType(f.fn);
        return analysis.domain || [-5, 5];
      });

      const xMin = Math.min(...allDomains.map(d => d[0]));
      const xMax = Math.max(...allDomains.map(d => d[1]));

      // Try to extract Y-axis domain from TikZ code if available
      let yMin = -2;
      let yMax = 2;
      if (effectiveTikzCode) {
        const yminMatch = effectiveTikzCode.match(/ymin\s*=\s*(-?[\d.]+)/);
        const ymaxMatch = effectiveTikzCode.match(/ymax\s*=\s*(-?[\d.]+)/);
        if (yminMatch && ymaxMatch) {
          yMin = parseFloat(yminMatch[1]);
          yMax = parseFloat(ymaxMatch[1]);
        }
      }

      // Create the plot
      const plotData = functions.map(f => ({
        fn: f.fn,
        color: f.color || '#3b82f6'
        // Note: graphType is not needed for function-plot, it defaults to line
      }));

      console.log('[GraphRenderer] Plot data being passed to function-plot:', plotData);

      // Clear previous plot
      graphRef.current.innerHTML = '';

      // Render with function-plot
      try {
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
            domain: [yMin, yMax]
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
        console.log('[GraphRenderer] ✓ Successfully rendered graph');
      } catch (plotError) {
        console.error('[GraphRenderer] Error from function-plot:', plotError);
        throw plotError;
      }

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

  // Check if this is a question with a graph in the question text (graph_latex exists)
  const hasGraphLatex = question.graph_latex && (
    question.graph_latex.includes('\\begin{tikzpicture}') ||
    question.graph_latex.includes('\\addplot') ||
    question.graph_latex.includes('\\begin{axis}')
  );

  // Check if Claude generated option equations for rendering
  const hasGeneratedOptions = question.generated_options || question.recreate_all_options;

  // Determine what to render:
  // 1. If generated_options: show ALL options as graphs (for "which graph is correct" questions)
  // 2. If graph_latex: show ONLY correct answer (for "what function is this" questions)
  // 3. Otherwise: show nothing (regular text question)
  const functionOptions = question.options ?
    (hasGeneratedOptions
      ? Object.entries(question.options).map(([key, value]) => ({ key, value: value as string }))
      : hasGraphLatex
        ? [{ key: question.correct_answer, value: question.options[question.correct_answer] }]
        : []
    ) : [];

  console.log('[AdvancedGraphRenderer]', {
    hasGraphLatex,
    hasGeneratedOptions,
    willPlotOptions: functionOptions.length,
    correctAnswer: question.correct_answer,
    graph_latex: question.graph_latex?.substring(0, 100)
  });

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
          tikzCode={hasGraphLatex ? question.graph_latex : undefined}
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