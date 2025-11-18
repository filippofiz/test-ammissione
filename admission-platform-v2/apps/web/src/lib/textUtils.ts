/**
 * Text Utility Functions
 * Functions for normalizing and formatting text for display
 */

/**
 * Normalizes whitespace in text by:
 * - Trimming leading/trailing whitespace
 * - Removing all line breaks (text will flow naturally)
 * - Replacing multiple consecutive spaces with a single space
 * - Normalizing double line breaks to paragraph breaks only when needed
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';

  // First, check if there are intentional paragraph breaks (double newlines)
  const hasParagraphs = /\n\s*\n/.test(text);

  if (hasParagraphs) {
    // Preserve paragraph structure
    return text
      .trim()
      // Split by paragraph breaks
      .split(/\n\s*\n+/)
      // Clean each paragraph
      .map(para => para
        .replace(/\n/g, ' ') // Remove single line breaks within paragraph
        .replace(/\s+/g, ' ') // Collapse all whitespace to single space
        .trim()
      )
      // Rejoin with double newline for paragraphs
      .filter(para => para.length > 0)
      .join('\n\n');
  } else {
    // No paragraph breaks - treat as single flowing text
    return text
      .trim()
      // Replace all line breaks with spaces
      .replace(/\n/g, ' ')
      // Replace all tabs with spaces
      .replace(/\t/g, ' ')
      // Collapse multiple spaces to single space
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Normalizes text for option/answer display by:
 * - Removing all line breaks
 * - Collapsing multiple spaces into single space
 * - Trimming
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeOptionText(text: string): string {
  if (!text) return '';

  return text
    .trim()
    // Replace all newlines with spaces
    .replace(/\n+/g, ' ')
    // Replace multiple spaces with single space
    .replace(/ +/g, ' ')
    // Replace tabs with spaces
    .replace(/\t/g, ' ')
    .trim();
}
