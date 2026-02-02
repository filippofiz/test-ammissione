/**
 * Universal Calculator Component
 * Supports three calculator types:
 * - 'regular': GMAT-style basic calculator
 * - 'graphing': Desmos graphing calculator
 * - 'scientific': Desmos scientific calculator (complete/SAT mode)
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { GMATCalculator } from './GMATCalculator';
import { DesmosCalculator, DesmosCalculatorType } from './DesmosCalculator';

export type CalculatorType = 'regular' | 'graphing' | 'scientific' | 'none';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType?: CalculatorType;
  draggable?: boolean;
}

/**
 * Main Calculator component that switches between different calculator types
 */
export function Calculator({
  isOpen,
  onClose,
  calculatorType = 'regular',
  draggable = true
}: CalculatorProps) {
  // If no calculator is allowed
  if (calculatorType === 'none' || !isOpen) {
    return null;
  }

  // Regular GMAT-style calculator
  if (calculatorType === 'regular') {
    return (
      <GMATCalculator
        isOpen={isOpen}
        onClose={onClose}
        draggable={draggable}
      />
    );
  }

  // Desmos calculators (graphing or scientific)
  const desmosType: DesmosCalculatorType = calculatorType === 'graphing' ? 'graphing' : 'scientific';

  return (
    <DesmosCalculator
      isOpen={isOpen}
      onClose={onClose}
      calculatorType={desmosType}
      draggable={draggable}
    />
  );
}

/**
 * Calculator button component for use in test interface
 * Displays appropriate icon/text based on calculator type
 */
export function CalculatorButton({
  onClick,
  calculatorType = 'regular'
}: {
  onClick: () => void;
  calculatorType?: CalculatorType;
}) {
  if (calculatorType === 'none') {
    return null;
  }

  const buttonText = {
    regular: 'Calculator',
    graphing: 'Graphing Calculator',
    scientific: 'Scientific Calculator'
  }[calculatorType] || 'Calculator';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      title={buttonText}
    >
      <FontAwesomeIcon icon={faCalculator} />
      <span className="hidden sm:inline">{buttonText}</span>
      <span className="sm:hidden">Calc</span>
    </button>
  );
}

export default Calculator;
