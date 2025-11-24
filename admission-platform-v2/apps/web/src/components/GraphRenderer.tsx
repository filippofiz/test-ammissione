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

// Check if string is a geometry JSON object
const isGeometryJSON = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed.startsWith('{')) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed.type && (parsed.shapes || parsed.points || parsed.type === 'triangle' || parsed.type === 'geometry' || parsed.type === 'composite');
  } catch {
    return false;
  }
};

// Geometry renderer component using SVG
const GeometryRenderer: React.FC<{ geometryData: any; className?: string }> = ({ geometryData, className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !geometryData) return;

    // Clear previous content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    // Calculate bounds for viewBox
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const updateBounds = (x: number, y: number) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };

    // Process shapes to find bounds
    const shapes = geometryData.shapes || [geometryData];
    shapes.forEach((shape: any) => {
      if (shape.points) {
        if (Array.isArray(shape.points)) {
          shape.points.forEach((p: number[]) => updateBounds(p[0], p[1]));
        } else {
          Object.values(shape.points).forEach((p: any) => updateBounds(p[0], p[1]));
        }
      }
      if (shape.topLeft) {
        updateBounds(shape.topLeft[0], shape.topLeft[1]);
        if (shape.width && shape.height) {
          updateBounds(shape.topLeft[0] + shape.width, shape.topLeft[1] - shape.height);
        }
      }
    });

    // Add padding
    const padding = 3;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Set viewBox (flip Y for SVG coordinate system)
    const width = maxX - minX;
    const height = maxY - minY;
    svgRef.current.setAttribute('viewBox', `${minX} ${-maxY} ${width} ${height}`);

    // Helper to draw right angle marker
    const drawRightAngle = (svg: SVGSVGElement, position: number[], size: number = 0.8) => {
      const [x, y] = position;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x + size} ${-y} L ${x + size} ${-y - size} L ${x} ${-y - size}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#374151');
      path.setAttribute('stroke-width', '0.15');
      svg.appendChild(path);
    };

    // Create SVG elements for each shape
    shapes.forEach((shape: any) => {
      if (shape.type === 'triangle' || shape.type === 'polygon') {
        const points = Array.isArray(shape.points)
          ? shape.points
          : Object.values(shape.points);

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points.map((p: number[]) => `${p[0]},${-p[1]}`).join(' '));
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', '#374151');
        polygon.setAttribute('stroke-width', '0.2');
        svgRef.current?.appendChild(polygon);

        // Add point labels
        if (!Array.isArray(shape.points)) {
          Object.entries(shape.points).forEach(([label, point]: [string, any]) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', String(point[0]));
            text.setAttribute('y', String(-point[1] - 0.8));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '1.5');
            text.setAttribute('font-family', 'serif');
            text.setAttribute('font-style', 'italic');
            text.setAttribute('fill', '#1f2937');
            text.textContent = label;
            svgRef.current?.appendChild(text);
          });
        }

        // Add edge labels
        if (shape.labels) {
          Object.entries(shape.labels).forEach(([key, value]: [string, any]) => {
            // Handle right angle marker
            if (key === 'rightAngle' || key.includes('rightAngle')) {
              if (typeof value === 'object' && value.position) {
                drawRightAngle(svgRef.current!, value.position);
              }
              return;
            }

            if (typeof value === 'object' && value.position) {
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', String(value.position[0]));
              text.setAttribute('y', String(-value.position[1]));
              text.setAttribute('text-anchor', 'middle');
              text.setAttribute('font-size', '1.2');
              text.setAttribute('font-family', 'serif');
              text.setAttribute('font-style', 'italic');
              text.setAttribute('fill', '#374151');
              text.textContent = value.text || key;
              svgRef.current?.appendChild(text);
            } else if (typeof value === 'string') {
              // Simple label without position - skip for now
            }
          });
        }
      } else if (shape.type === 'rectangle') {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(shape.topLeft[0]));
        rect.setAttribute('y', String(-shape.topLeft[1]));
        rect.setAttribute('width', String(shape.width));
        rect.setAttribute('height', String(shape.height));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', '#374151');
        rect.setAttribute('stroke-width', '0.2');
        svgRef.current?.appendChild(rect);

        // Add label to the left of rectangle
        if (shape.label) {
          // Position label to the left of the rectangle, vertically centered
          const labelX = shape.labelPosition ? shape.labelPosition[0] : shape.topLeft[0] - 1.5;
          const labelY = shape.labelPosition ? shape.labelPosition[1] : shape.topLeft[1] - shape.height/2;

          // Check if label is a fraction (contains /)
          if (shape.label.includes('/')) {
            const [num, denom] = shape.label.split('/');
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // Numerator
            const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            numText.setAttribute('x', String(labelX));
            numText.setAttribute('y', String(-labelY - 0.8));
            numText.setAttribute('text-anchor', 'middle');
            numText.setAttribute('font-size', '1.2');
            numText.setAttribute('font-family', 'serif');
            numText.setAttribute('font-style', 'italic');
            numText.setAttribute('fill', '#374151');
            numText.textContent = num.trim();
            g.appendChild(numText);

            // Fraction line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(labelX - 0.8));
            line.setAttribute('y1', String(-labelY));
            line.setAttribute('x2', String(labelX + 0.8));
            line.setAttribute('y2', String(-labelY));
            line.setAttribute('stroke', '#374151');
            line.setAttribute('stroke-width', '0.1');
            g.appendChild(line);

            // Denominator
            const denomText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            denomText.setAttribute('x', String(labelX));
            denomText.setAttribute('y', String(-labelY + 1.2));
            denomText.setAttribute('text-anchor', 'middle');
            denomText.setAttribute('font-size', '1.2');
            denomText.setAttribute('font-family', 'serif');
            denomText.setAttribute('font-style', 'italic');
            denomText.setAttribute('fill', '#374151');
            denomText.textContent = denom.trim();
            g.appendChild(denomText);

            svgRef.current?.appendChild(g);
          } else {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', String(labelX));
            text.setAttribute('y', String(-labelY));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '1.2');
            text.setAttribute('font-family', 'serif');
            text.setAttribute('font-style', 'italic');
            text.setAttribute('fill', '#374151');
            text.textContent = shape.label;
            svgRef.current?.appendChild(text);
          }
        }
      } else if (shape.type === 'circle') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(shape.center[0]));
        circle.setAttribute('cy', String(-shape.center[1]));
        circle.setAttribute('r', String(shape.radius));
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', '#374151');
        circle.setAttribute('stroke-width', '0.2');
        svgRef.current?.appendChild(circle);
      }
    });
  }, [geometryData]);

  return (
    <div className={`geometry-renderer ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-48 bg-white rounded"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
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

  // Check if this is geometry JSON
  if (functionString && isGeometryJSON(functionString)) {
    try {
      const geometryData = JSON.parse(functionString);
      return <GeometryRenderer geometryData={geometryData} className={className} />;
    } catch (e) {
      console.error('[GraphRenderer] Failed to parse geometry JSON:', e);
    }
  }

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

  // Use graph_function if graph_latex is not available
  const effectiveFunctionString = question.graph_latex || question.graph_function;

  console.log('[AdvancedGraphRenderer]', {
    hasGraphLatex,
    hasGeneratedOptions,
    willPlotOptions: functionOptions.length,
    correctAnswer: question.correct_answer,
    graph_latex: question.graph_latex?.substring(0, 100),
    graph_function: question.graph_function,
    effectiveFunctionString: effectiveFunctionString?.substring?.(0, 100) || effectiveFunctionString
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
          functionString={effectiveFunctionString}
          tikzCode={hasGraphLatex ? question.graph_latex : undefined}
          className={className}
        />
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
          <pre className="text-xs overflow-x-auto">
            {effectiveFunctionString || 'No function/LaTeX code available'}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GraphRenderer;