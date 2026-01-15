/**
 * ExplanationDisplay Component
 * Shows question explanation in results view with toggle functionality
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { LaTeX } from '../LaTeX';
import { normalizeWhitespace } from '../../lib/textUtils';

interface ExplanationDisplayProps {
  explanation: string;
  defaultExpanded?: boolean;
}

export function ExplanationDisplay({ explanation, defaultExpanded = false }: ExplanationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!explanation) return null;

  return (
    <div className="mt-6 border-2 border-amber-200 rounded-xl overflow-hidden bg-amber-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faLightbulb} className="text-amber-600 text-lg" />
          <span className="font-semibold text-amber-800">Explanation</span>
        </div>
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="text-amber-600"
        />
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 text-gray-800 whitespace-pre-wrap">
          <LaTeX>{normalizeWhitespace(explanation)}</LaTeX>
        </div>
      )}
    </div>
  );
}
