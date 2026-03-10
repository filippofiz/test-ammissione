/**
 * DesmosGraph Component
 * Renders a read-only mathematical graph from a structured description
 * using the Desmos Calculator API (already loaded globally).
 * Supports both function plots and geometry elements.
 */

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Desmos: any;
  }
}

interface GraphElement {
  kind: "point" | "segment" | "polygon" | "circle" | "label";
  [key: string]: any;
}

interface GraphDescription {
  type: "function" | "geometry";
  functions?: string[];
  elements?: GraphElement[];
  x_range: [number, number];
  y_range: [number, number];
  show_grid?: boolean;
  show_axes?: boolean;
}

interface DesmosGraphProps {
  graphDescription: GraphDescription;
  width?: number;
  height?: number;
}

// Regex to match LaTeX piecewise: y=\left\{EXPR\mid CONDITION\right\}
const PIECEWISE_RE = /^(y\s*=\s*)\\left\\\{(.+?)\\mid(.+?)\\right\\\}$/;

// Convert LaTeX piecewise functions to Desmos format and merge pieces
// LaTeX:  y=\left\{expr\mid condition\right\}  (one per piece)
// Desmos: y=\{cond1: expr1, cond2: expr2, ...\}  (all in one)
function convertFunctionsForDesmos(fns: string[]): string[] {
  const pieces: { prefix: string; condition: string; expr: string }[] = [];
  const others: string[] = [];

  for (const fn of fns) {
    const match = fn.match(PIECEWISE_RE);
    if (match) {
      pieces.push({ prefix: match[1], condition: match[3].trim(), expr: match[2].trim() });
    } else {
      others.push(fn);
    }
  }

  if (pieces.length > 0) {
    const combined = pieces.map(p => `${p.condition}: ${p.expr}`).join(', ');
    // Use \{ \} (not \left\{ \right\}) — Desmos piecewise syntax
    return [`${pieces[0].prefix}\\{${combined}\\}`, ...others];
  }

  return others;
}

export function DesmosGraph({
  graphDescription,
  width = 400,
  height = 300,
}: DesmosGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !window.Desmos) return;

    const calculator = window.Desmos.GraphingCalculator(containerRef.current, {
      expressions: false,
      settingsMenu: false,
      zoomButtons: false,
      lockViewport: true,
      border: false,
      keypad: false,
      expressionsTopbar: false,
      showGrid: graphDescription.show_grid !== false,
    });

    calculatorRef.current = calculator;

    calculator.setMathBounds({
      left: graphDescription.x_range[0],
      right: graphDescription.x_range[1],
      bottom: graphDescription.y_range[0],
      top: graphDescription.y_range[1],
    });

    const colors = [
      window.Desmos.Colors.BLUE,
      window.Desmos.Colors.RED,
      window.Desmos.Colors.GREEN,
      window.Desmos.Colors.PURPLE,
      window.Desmos.Colors.ORANGE,
    ];

    // Render function expressions (type "function" or legacy format without type)
    if (graphDescription.functions) {
      const converted = convertFunctionsForDesmos(graphDescription.functions);
      console.log('[DesmosGraph] original:', graphDescription.functions, '→ converted:', converted);
      converted.forEach((fn, i) => {
        calculator.setExpression({
          id: `func_${i}`,
          latex: fn,
          color: colors[i % colors.length],
        });
      });
    }

    // Render geometry elements (type "geometry")
    if (graphDescription.elements) {
      graphDescription.elements.forEach((elem, i) => {
        const color = colors[i % colors.length];
        switch (elem.kind) {
          case 'point':
            calculator.setExpression({
              id: `elem_${i}`,
              latex: `(${elem.x},${elem.y})`,
              color,
              pointSize: 8,
              ...(elem.label && { label: elem.label, showLabel: true }),
            });
            break;
          case 'segment':
            calculator.setExpression({
              id: `elem_${i}`,
              latex: `\\operatorname{polygon}((${elem.from[0]},${elem.from[1]}),(${elem.to[0]},${elem.to[1]}))`,
              color,
              fillOpacity: 0,
            });
            break;
          case 'polygon': {
            const verts = elem.vertices
              .map((v: number[]) => `(${v[0]},${v[1]})`)
              .join(',');
            calculator.setExpression({
              id: `elem_${i}`,
              latex: `\\operatorname{polygon}(${verts})`,
              color,
              fillOpacity: 0.2,
            });
            break;
          }
          case 'circle': {
            const [h, k] = elem.center;
            const r = elem.radius;
            calculator.setExpression({
              id: `elem_${i}`,
              latex: `(x-(${h}))^2+(y-(${k}))^2=${r * r}`,
              color,
            });
            break;
          }
          case 'label':
            calculator.setExpression({
              id: `elem_${i}`,
              latex: `(${elem.x},${elem.y})`,
              color,
              label: elem.text,
              showLabel: true,
              pointSize: 1,
            });
            break;
        }
      });
    }

    return () => {
      calculator.destroy();
      calculatorRef.current = null;
    };
  }, [graphDescription]);

  if (!window.Desmos) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
        Graph could not be loaded (Desmos API unavailable)
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="rounded-lg border border-gray-200 mx-auto"
    />
  );
}
