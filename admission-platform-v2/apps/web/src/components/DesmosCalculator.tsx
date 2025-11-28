/**
 * Desmos Calculator Component
 * Supports graphing calculator and scientific calculator modes
 * Used for SAT and other tests requiring advanced calculators
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';

declare global {
  interface Window {
    Desmos: any;
  }
}

export type DesmosCalculatorType = 'graphing' | 'scientific';

interface DesmosCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType: DesmosCalculatorType;
  draggable?: boolean;
}

export function DesmosCalculator({
  isOpen,
  onClose,
  calculatorType,
  draggable = true
}: DesmosCalculatorProps) {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstance = useRef<any>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize Desmos calculator
  useEffect(() => {
    if (!isOpen || !calculatorRef.current) return;

    // Check if Desmos is loaded
    if (!window.Desmos) {
      console.error('Desmos API not loaded. Make sure the script is included in index.html');
      return;
    }

    // Clear any existing calculator
    if (calculatorInstance.current) {
      calculatorInstance.current.destroy();
    }

    // Create calculator based on type
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
      // Restrict features based on calculator type
      ...(calculatorType === 'scientific' && {
        graphpaper: false,
        expressions: true,
        zoomButtons: false,
        expressionsTopbar: false,
      })
    };

    try {
      if (calculatorType === 'graphing') {
        calculatorInstance.current = window.Desmos.GraphingCalculator(
          calculatorRef.current,
          options
        );
      } else {
        calculatorInstance.current = window.Desmos.ScientificCalculator(
          calculatorRef.current,
          options
        );
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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable) return;
    if ((e.target as HTMLElement).closest('.desmos-calculator')) return;

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

  const calculatorTitle = calculatorType === 'graphing'
    ? 'Graphing Calculator'
    : 'Scientific Calculator';

  const calculatorHeight = calculatorType === 'graphing' ? '600px' : '400px';

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-2xl select-none"
      style={{
        left: position.x,
        top: position.y,
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        width: '400px',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-gray-100 rounded-t-lg">
        <div className="flex items-center gap-2 text-gray-800">
          <FontAwesomeIcon icon={faCalculator} className="text-sm" />
          <span className="text-sm font-medium">{calculatorTitle}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Desmos Calculator Container */}
      <div
        ref={calculatorRef}
        className="desmos-calculator"
        style={{
          height: calculatorHeight,
          width: '100%',
        }}
      />
    </div>
  );
}

// Export for use in test interface
export default DesmosCalculator;
