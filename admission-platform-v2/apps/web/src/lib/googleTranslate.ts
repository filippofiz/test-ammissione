/**
 * Google Translate fallback for dynamic content from database
 * Uses Supabase Edge Function to securely call Google Cloud Translation API
 */

import { supabase } from './supabase';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

/**
 * Translate text using Supabase Edge Function (which calls Google Translate)
 * @param text - Text to translate
 * @param targetLang - Target language code (e.g., 'en', 'it')
 * @param sourceLang - Source language code (default: 'it')
 */
export async function googleTranslate(
  text: string,
  targetLang: string,
  sourceLang: string = 'it'
): Promise<string> {
  // Check cache first
  const cacheKey = `${text}:${sourceLang}:${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: {
        texts: [text],
        targetLang,
        sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
      },
    });

    if (error) {
      console.warn('Translation edge function error:', error);
      return text;
    }

    const translated = data?.translations?.[0] || text;

    // Cache the result
    translationCache.set(cacheKey, translated);

    return translated;
  } catch (error) {
    console.warn('Google Translate error:', error);
    return text;
  }
}

/**
 * Batch translate multiple texts (more efficient - single API call)
 */
export async function googleTranslateBatch(
  texts: string[],
  targetLang: string,
  sourceLang: string = 'it'
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Check which texts need translation
  const textsToTranslate: string[] = [];
  const textIndexMap: number[] = [];

  texts.forEach((text, index) => {
    const cacheKey = `${text}:${sourceLang}:${targetLang}`;
    if (translationCache.has(cacheKey)) {
      results.set(text, translationCache.get(cacheKey)!);
    } else {
      textsToTranslate.push(text);
      textIndexMap.push(index);
    }
  });

  // If all cached, return early
  if (textsToTranslate.length === 0) {
    return results;
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: {
        texts: textsToTranslate,
        targetLang,
        sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
      },
    });

    if (error) {
      console.warn('Batch translation error:', error);
      // Return original texts for failed translations
      textsToTranslate.forEach(text => results.set(text, text));
      return results;
    }

    const translations = data?.translations || [];

    textsToTranslate.forEach((text, index) => {
      const translated = translations[index] || text;
      const cacheKey = `${text}:${sourceLang}:${targetLang}`;
      translationCache.set(cacheKey, translated);
      results.set(text, translated);
    });
  } catch (error) {
    console.warn('Batch translation error:', error);
    textsToTranslate.forEach(text => results.set(text, text));
  }

  return results;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}
