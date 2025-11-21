import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXProps {
  children: string;
  className?: string;
}

/**
 * LaTeX component that renders mathematical notation using KaTeX
 *
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * - Plain text (no LaTeX)
 *
 * Example usage:
 * <LaTeX>This is $x^2 + y^2 = z^2$ inline math</LaTeX>
 * <LaTeX>$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$</LaTeX>
 */
export const LaTeX: React.FC<LaTeXProps> = ({ children, className = '' }) => {
  // Handle null/undefined children
  if (!children) {
    return <span className={className}></span>;
  }

  // Preprocess: Convert escaped/malformed currency patterns to regular dollar signs
  // \$ → $ (escaped dollar)
  // \9.00 → $9.00 (malformed currency missing $)
  let processedText = children
    .replace(/\\\$/g, '$')           // \$ → $
    .replace(/\\([\d,]+(?:\.\d+)?)/g, '$$$$1'); // \9.00 → $9.00 (need $$ because it's a replacement string)

  // Quick optimization: if no LaTeX delimiters, just return plain text
  if (!processedText.includes('$') && !processedText.includes('\\[')) {
    return <span className={className}>{processedText}</span>;
  }

  // Parse the text to find LaTeX expressions
  const parseLatex = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;
    let iterations = 0;
    const maxIterations = 1000; // Safety limit

    while (remaining.length > 0 && iterations < maxIterations) {
      iterations++;

      // Look for display math ($$...$$ or \[...\])
      const displayMatch = remaining.match(/^\$\$([\s\S]+?)\$\$/) || remaining.match(/^\\\[([\s\S]*?)\\\]/);
      if (displayMatch) {
        parts.push(<BlockMath key={key++} math={displayMatch[1]} />);
        remaining = remaining.slice(displayMatch[0].length);
        continue;
      }

      // Check for standalone currency FIRST: $number with optional suffix (M, K, B, million, etc.)
      // Examples: $4.8M, $185,000, $9.00, $1.5K, $4.32
      // Only match if followed by whitespace, punctuation, or end of string (not LaTeX operators)
      // BUT: Skip currency check if there's a closing $ nearby with math operators (to handle $1.5 < x < 5.5$)
      const nextDollarPos = remaining.indexOf('$', 1);
      const possibleMathContent = nextDollarPos !== -1 && nextDollarPos < 100
        ? remaining.substring(1, nextDollarPos)
        : null;
      const looksLikeMath = possibleMathContent && /[<>=\\^_{}a-zA-Z]/.test(possibleMathContent);

      if (!looksLikeMath) {
        const currencyMatch = remaining.match(/^\$([\d,]+(?:\.\d+)?(?:[MKBmkb]|million|thousand|billion)?)(?=\s|[.,;:!?)]|$)/);
        if (currencyMatch) {
          // This is a standalone currency amount, render as plain text
          parts.push(<span key={key++}>{currencyMatch[0]}</span>);
          remaining = remaining.slice(currencyMatch[0].length);
          continue;
        }
      }

      // Look for inline math ($...$) - only if not currency
      const inlineMatch = remaining.match(/^\$([^$]+?)\$/);
      if (inlineMatch) {
        const content = inlineMatch[1];

        // Check if this contains LaTeX/math operators
        // Include: backslash, ^, _, {, }, common math operators like =, !, <, >
        // Also include Unicode math symbols: ≥, ≤, ≠, ×, ÷, ±, etc.
        const hasMathOperators = /[\\^_{}=!<>≥≤≠×÷±∞∑∏∫√π∈∉⊂⊃∪∩]/.test(content);

        // Reject long text or text with multiple spaces as not being math
        // UNLESS it contains math operators (then it's definitely math)
        const hasMultipleSpaces = (content.match(/ /g) || []).length >= 2;
        const isTooLong = content.length > 50;

        if ((hasMultipleSpaces || isTooLong) && !hasMathOperators) {
          // This is not math, it's long text accidentally between dollar signs
          // Render the first $ and continue parsing from there
          parts.push(<span key={key++}>$</span>);
          remaining = remaining.slice(1);
          continue;
        }

        // Check if this looks like actual LaTeX math
        // Math contains: letters, backslashes, ^, _, {, }, comparison operators (<, >, =), or coordinate notation (parentheses, commas)
        const isLikelyMath = /[a-zA-Z\\^_{}<=>\+\-\*\/(),]/.test(content);

        if (isLikelyMath) {
          // This is LaTeX math - render it
          parts.push(<InlineMath key={key++} math={content} />);
          remaining = remaining.slice(inlineMatch[0].length);
          continue;
        } else {
          // Not LaTeX math (just plain numbers), treat as currency
          parts.push(<span key={key++}>{inlineMatch[0]}</span>);
          remaining = remaining.slice(inlineMatch[0].length);
          continue;
        }
      }

      // Find next delimiter ($ or \[)
      const nextDollar = remaining.indexOf('$');
      const nextBracket = remaining.indexOf('\\[');

      // Determine which delimiter comes first
      let nextDelimiter = -1;
      let delimiterType: 'dollar' | 'bracket' | null = null;

      if (nextDollar === -1 && nextBracket === -1) {
        // No more delimiters
        nextDelimiter = -1;
      } else if (nextDollar === -1) {
        nextDelimiter = nextBracket;
        delimiterType = 'bracket';
      } else if (nextBracket === -1) {
        nextDelimiter = nextDollar;
        delimiterType = 'dollar';
      } else {
        if (nextDollar < nextBracket) {
          nextDelimiter = nextDollar;
          delimiterType = 'dollar';
        } else {
          nextDelimiter = nextBracket;
          delimiterType = 'bracket';
        }
      }

      if (nextDelimiter === -1) {
        // No more LaTeX, add rest as plain text
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      } else if (nextDelimiter === 0 && delimiterType === 'dollar') {
        // Dollar at start but didn't match - skip it
        parts.push(<span key={key++}>$</span>);
        remaining = remaining.slice(1);
      } else if (nextDelimiter === 0 && delimiterType === 'bracket') {
        // \[ at start but didn't match - skip it
        parts.push(<span key={key++}>\\[</span>);
        remaining = remaining.slice(2);
      } else {
        // Add text before next delimiter as plain text
        const plainText = remaining.slice(0, nextDelimiter);
        if (plainText) {
          parts.push(<span key={key++}>{plainText}</span>);
        }
        remaining = remaining.slice(nextDelimiter);
      }
    }

    if (iterations >= maxIterations) {
      console.error('LaTeX parsing exceeded max iterations, returning plain text');
      return [<span key={0}>{text}</span>];
    }

    return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
  };

  return <span className={className}>{parseLatex(processedText)}</span>;
};

export default LaTeX;
