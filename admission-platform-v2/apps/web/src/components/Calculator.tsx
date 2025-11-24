/**
 * GMAT-Style Calculator Component
 * On-screen calculator similar to the one used in GMAT Data Insights section
 */

import { useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  draggable?: boolean;
}

export function Calculator({ isOpen, onClose, draggable = true }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [isNegative, setIsNegative] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const MAX_VALUE = 99999999;
  const MIN_VALUE = -99999999;

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setIsNegative(false);
    setHasError(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    setWaitingForOperand(false);
  }, []);

  const backspace = useCallback(() => {
    if (hasError) return;
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0');
      setIsNegative(false);
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, hasError]);

  const inputDigit = useCallback((digit: string) => {
    if (hasError) {
      clearAll();
      setDisplay(digit);
      return;
    }

    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      // Limit display to 8 digits (excluding minus sign and decimal)
      const digitsOnly = display.replace(/[-.]/, '');
      if (digitsOnly.length >= 8 && digit !== '.') return;

      setDisplay(display === '0' ? digit : display + digit);
    }
    setIsNegative(parseFloat(display === '0' ? digit : display + digit) < 0);
  }, [display, waitingForOperand, hasError, clearAll]);

  const inputDecimal = useCallback(() => {
    if (hasError) {
      clearAll();
      setDisplay('0.');
      return;
    }

    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand, hasError, clearAll]);

  const toggleSign = useCallback(() => {
    if (hasError) return;
    const value = parseFloat(display);
    const newValue = -value;
    setDisplay(String(newValue));
    setIsNegative(newValue < 0);
  }, [display, hasError]);

  const performOperation = useCallback((nextOperation: string) => {
    if (hasError) {
      clearAll();
      return;
    }

    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            setHasError(true);
            setDisplay('Error');
            return;
          }
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      // Check for overflow
      if (result > MAX_VALUE || result < MIN_VALUE) {
        setHasError(true);
        setDisplay('Error');
        return;
      }

      // Format result
      const resultStr = formatNumber(result);
      setDisplay(resultStr);
      setPreviousValue(result);
      setIsNegative(result < 0);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, hasError, clearAll]);

  const calculateResult = useCallback(() => {
    if (hasError || !operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        if (inputValue === 0) {
          setHasError(true);
          setDisplay('Error');
          return;
        }
        result = previousValue / inputValue;
        break;
      default:
        return;
    }

    // Check for overflow
    if (result > MAX_VALUE || result < MIN_VALUE) {
      setHasError(true);
      setDisplay('Error');
      return;
    }

    const resultStr = formatNumber(result);
    setDisplay(resultStr);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
    setIsNegative(result < 0);
  }, [display, previousValue, operation, hasError]);

  const calculateSquareRoot = useCallback(() => {
    if (hasError) {
      clearAll();
      return;
    }

    const value = parseFloat(display);
    if (value < 0) {
      setHasError(true);
      setDisplay('Error');
      return;
    }

    const result = Math.sqrt(value);
    setDisplay(formatNumber(result));
    setWaitingForOperand(true);
    setIsNegative(false);
  }, [display, hasError, clearAll]);

  const calculateReciprocal = useCallback(() => {
    if (hasError) {
      clearAll();
      return;
    }

    const value = parseFloat(display);
    if (value === 0) {
      setHasError(true);
      setDisplay('Error');
      return;
    }

    const result = 1 / value;
    if (result > MAX_VALUE || result < MIN_VALUE) {
      setHasError(true);
      setDisplay('Error');
      return;
    }

    setDisplay(formatNumber(result));
    setWaitingForOperand(true);
    setIsNegative(result < 0);
  }, [display, hasError, clearAll]);

  const calculatePercent = useCallback(() => {
    if (hasError) {
      clearAll();
      return;
    }

    const value = parseFloat(display);
    const result = value / 100;
    setDisplay(formatNumber(result));
    setWaitingForOperand(true);
    setIsNegative(result < 0);
  }, [display, hasError, clearAll]);

  // Memory functions
  const memoryClear = useCallback(() => {
    setMemory(0);
    setHasMemory(false);
  }, []);

  const memoryRecall = useCallback(() => {
    if (hasError) {
      clearAll();
    }
    setDisplay(formatNumber(memory));
    setWaitingForOperand(true);
    setIsNegative(memory < 0);
  }, [memory, hasError, clearAll]);

  const memoryStore = useCallback(() => {
    if (hasError) return;
    const value = parseFloat(display);
    setMemory(value);
    setHasMemory(true);
    setWaitingForOperand(true);
  }, [display, hasError]);

  const memoryAdd = useCallback(() => {
    if (hasError) return;
    const value = parseFloat(display);
    setMemory(memory + value);
    setHasMemory(true);
    setWaitingForOperand(true);
  }, [display, memory, hasError]);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      return 'Error';
    }

    // Handle very small numbers
    if (Math.abs(num) < 0.00000001 && num !== 0) {
      return num.toExponential(2);
    }

    // Round to avoid floating point issues
    const rounded = Math.round(num * 100000000) / 100000000;

    // Convert to string and limit decimal places
    let str = String(rounded);

    // Limit total length
    if (str.replace(/[-.]/, '').length > 8) {
      str = rounded.toPrecision(8);
    }

    return str;
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable) return;
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  const buttonClass = "w-10 h-10 rounded text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400";
  const numberClass = `${buttonClass} bg-gray-100 hover:bg-gray-200 text-gray-800`;
  const operatorClass = `${buttonClass} bg-blue-100 hover:bg-blue-200 text-blue-800`;
  const functionClass = `${buttonClass} bg-gray-200 hover:bg-gray-300 text-gray-700`;
  const memoryClass = `${buttonClass} bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs`;
  const clearClass = `${buttonClass} bg-red-100 hover:bg-red-200 text-red-700`;

  return (
    <div
      className="fixed z-50 bg-gray-700 rounded-lg shadow-2xl p-3 select-none"
      style={{
        left: position.x,
        top: position.y,
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-600">
        <div className="flex items-center gap-2 text-white">
          <FontAwesomeIcon icon={faCalculator} className="text-sm" />
          <span className="text-sm font-medium">Calculator</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Display */}
      <div className="bg-gray-200 rounded p-2 mb-3">
        {/* Indicators */}
        <div className="flex gap-2 text-xs mb-1 h-4">
          <span className={`${hasMemory ? 'text-gray-800' : 'text-gray-400'}`}>M</span>
          <span className={`${isNegative ? 'text-gray-800' : 'text-gray-400'}`}>−</span>
          <span className={`${hasError ? 'text-red-600' : 'text-gray-400'}`}>E</span>
        </div>
        {/* Display value */}
        <div className="text-right text-2xl font-mono text-gray-900 overflow-hidden">
          {display}
        </div>
      </div>

      {/* Button grid */}
      <div className="grid grid-cols-5 gap-1">
        {/* Row 1: Memory functions */}
        <button onClick={memoryClear} className={memoryClass}>MC</button>
        <button onClick={memoryRecall} className={memoryClass}>MR</button>
        <button onClick={memoryStore} className={memoryClass}>MS</button>
        <button onClick={memoryAdd} className={memoryClass}>M+</button>
        <button onClick={backspace} className={clearClass}>←</button>

        {/* Row 2: Clear and special functions */}
        <button onClick={clearEntry} className={clearClass}>CE</button>
        <button onClick={clearAll} className={clearClass}>C</button>
        <button onClick={toggleSign} className={functionClass}>±</button>
        <button onClick={calculateSquareRoot} className={functionClass}>√</button>
        <button onClick={() => performOperation('÷')} className={operatorClass}>÷</button>

        {/* Row 3: 7, 8, 9, 1/x, × */}
        <button onClick={() => inputDigit('7')} className={numberClass}>7</button>
        <button onClick={() => inputDigit('8')} className={numberClass}>8</button>
        <button onClick={() => inputDigit('9')} className={numberClass}>9</button>
        <button onClick={calculateReciprocal} className={functionClass}>1/x</button>
        <button onClick={() => performOperation('×')} className={operatorClass}>×</button>

        {/* Row 4: 4, 5, 6, %, − */}
        <button onClick={() => inputDigit('4')} className={numberClass}>4</button>
        <button onClick={() => inputDigit('5')} className={numberClass}>5</button>
        <button onClick={() => inputDigit('6')} className={numberClass}>6</button>
        <button onClick={calculatePercent} className={functionClass}>%</button>
        <button onClick={() => performOperation('-')} className={operatorClass}>−</button>

        {/* Row 5: 1, 2, 3, =, + */}
        <button onClick={() => inputDigit('1')} className={numberClass}>1</button>
        <button onClick={() => inputDigit('2')} className={numberClass}>2</button>
        <button onClick={() => inputDigit('3')} className={numberClass}>3</button>
        <button
          onClick={calculateResult}
          className={`${operatorClass} row-span-2 h-[84px]`}
        >=</button>
        <button onClick={() => performOperation('+')} className={operatorClass}>+</button>

        {/* Row 6: 0, ., empty */}
        <button onClick={() => inputDigit('0')} className={`${numberClass} col-span-2`}>0</button>
        <button onClick={inputDecimal} className={numberClass}>.</button>
        {/* Empty space for = button spanning */}
        <div></div>
      </div>
    </div>
  );
}

// Calculator button component for use in test interface
export function CalculatorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      title="Calculator"
    >
      <FontAwesomeIcon icon={faCalculator} />
      <span>Calculator</span>
    </button>
  );
}

export default Calculator;
