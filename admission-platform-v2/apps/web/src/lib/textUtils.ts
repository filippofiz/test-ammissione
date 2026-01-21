/**
 * Text Utility Functions
 * Functions for normalizing and formatting text for display
 */

/**
 * Normalizes whitespace in text by:
 * - Trimming leading/trailing whitespace
 * - Preserving intentional line breaks (single \n)
 * - Replacing multiple consecutive spaces with a single space
 * - Normalizing multiple consecutive newlines to a single newline
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';

  return text
    .trim()
    // Replace tabs with spaces
    .replace(/\t/g, ' ')
    // Collapse multiple spaces (but not newlines) to single space
    .replace(/ +/g, ' ')
    // Normalize multiple newlines to single newline (preserving paragraph breaks as double)
    .replace(/\n{3,}/g, '\n\n')
    // Clean up spaces around newlines
    .replace(/ *\n */g, '\n')
    .trim();
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
