/**
 * Desmos Calculator Component
 * Supports graphing calculator and scientific calculator modes
 * Used for SAT and other tests requiring advanced calculators
 */

import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faTimes, faGripLines } from '@fortawesome/free-solid-svg-icons';

declare global {
  interface Window {
    Desmos: any;
  }
}

export type DesmosCalculatorType = 'graphing' | 'scientific';

const DEFAULT_WIDTH = Math.min(Math.max(window.innerWidth * 0.62, 720), 1100);
const DEFAULT_HEIGHT = 540;

export interface DesmosHandle {
  /** Send a LaTeX expression directly into the Desmos expression list */
  sendExpression: (latex: string) => void;
}

interface DesmosCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType: DesmosCalculatorType;
  draggable?: boolean;
  /** If provided, shows a "Send from question" button in the header */
  onSendFromQuestion?: () => void;
  /** Whether the current question contains math (controls button visibility) */
  questionHasMath?: boolean;
}

export const DesmosCalculator = forwardRef<DesmosHandle, DesmosCalculatorProps>(function DesmosCalculator({
  isOpen,
  onClose,
  calculatorType,
  draggable = true,
  onSendFromQuestion,
  questionHasMath = false,
}, ref) {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    sendExpression: (latex: string) => {
      if (!calculatorInstance.current) return;
      const id = `expr-${Date.now()}`;
      calculatorInstance.current.setExpression({ id, latex });
    },
  }), []);
  const [position, setPosition] = useState(() => ({
    x: Math.max((window.innerWidth - DEFAULT_WIDTH) / 2, 20),
    y: Math.max(window.innerHeight - DEFAULT_HEIGHT - 80, 20),
  }));
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT });

  // Initialize Desmos calculator
  useEffect(() => {
    if (!isOpen || !calculatorRef.current) return;

    if (!window.Desmos) {
      console.error('Desmos API not loaded. Make sure the script is included in index.html');
      return;
    }

    if (calculatorInstance.current) {
      calculatorInstance.current.destroy();
    }

    const options = {
      keypad: true,
      expressions: true,
      settingsMenu: false,
      zoomButtons: true,
      expressionsTopbar: true,
      pointsOfInterest: true,
      trace: true,
      border: false,
      lockViewport: false,
      ...(calculatorType === 'scientific' && {
        graphpaper: false,
        expressions: true,
        zoomButtons: false,
        expressionsTopbar: false,
      })
    };

    try {
      if (calculatorType === 'graphing') {
        calculatorInstance.current = window.Desmos.GraphingCalculator(calculatorRef.current, options);
      } else {
        calculatorInstance.current = window.Desmos.ScientificCalculator(calculatorRef.current, options);
      }
    } catch (error) {
      console.error('Error initializing Desmos calculator:', error);
    }

    return () => {
      if (calculatorInstance.current) {
        calculatorInstance.current.destroy();
        calculatorInstance.current = null;
      }
    };
  }, [isOpen, calculatorType]);

  // Notify Desmos of resize so it redraws correctly
  useEffect(() => {
    if (calculatorInstance.current?.resize) {
      calculatorInstance.current.resize();
    }
  }, [size]);

  // Drag handlers
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const totalHeight = size.height + 52;
      const clampedX = Math.min(Math.max(0, e.clientX - dragOffset.x), window.innerWidth - size.width);
      const clampedY = Math.min(Math.max(0, e.clientY - dragOffset.y), window.innerHeight - totalHeight);
      setPosition({ x: clampedX, y: clampedY });
    }
    if (isResizing) {
      const newWidth = Math.max(480, resizeStart.w + (e.clientX - resizeStart.x));
      const newHeight = Math.max(300, resizeStart.h + (e.clientY - resizeStart.y));
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, dragOffset, size, isResizing, resizeStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const [sent, setSent] = useState(false);
  const handleSend = () => {
    if (!onSendFromQuestion) return;
    onSendFromQuestion();
    setSent(true);
    setTimeout(() => setSent(false), 1500);
  };

  if (!isOpen) return null;

  const calculatorTitle = calculatorType === 'graphing' ? 'Graphing Calculator' : 'Scientific Calculator';

  return (
    <div
      className="fixed z-50 select-none flex flex-col rounded-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height + 52,
        boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 0 0 2px rgba(99,102,241,0.5)',
      }}
    >
      {/* Browser-tab style header — drag handle */}
      <div
        className="flex items-center justify-between px-4 shrink-0 bg-indigo-700"
        style={{ cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default', height: 52 }}
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalculator} className="text-indigo-200 text-sm" />
          <span className="text-sm font-semibold text-white tracking-wide">{calculatorTitle}</span>
        </div>
        <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
          {onSendFromQuestion && questionHasMath && (
            <button
              onClick={handleSend}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                sent
                  ? 'bg-green-400 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
              title="Send equations from question to Desmos"
            >
              {sent ? '✓ Sent!' : '⊕ Send from question'}
            </button>
          )}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-full text-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors"
          title="Close"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        </div>
      </div>

      {/* Desmos Calculator */}
      <div
        ref={calculatorRef}
        className="desmos-calculator flex-1 bg-white"
        style={{ width: '100%', minHeight: 0 }}
      />

      {/* Resize handle — bottom-right corner */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end pb-1 pr-1 text-indigo-300 hover:text-indigo-500"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
          setResizeStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height });
        }}
      >
        <FontAwesomeIcon icon={faGripLines} className="text-xs rotate-45" />
      </div>
    </div>
  );
});

export default DesmosCalculator;
