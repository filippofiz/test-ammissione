import { TFunction } from 'i18next';
import { googleTranslate } from './googleTranslate';

// Cache for Google Translate results to avoid repeated API calls
const googleTranslateCache = new Map<string, string>();

/**
 * Translates test track name using i18n
 * Falls back to Google Translate if translation doesn't exist in locale files
 */
export function translateTestTrack(trackName: string, t: TFunction): string {
  const translationKey = `testTracks.${trackName}`;
  const translated = t(translationKey);

  // If translation key wasn't found, i18next returns the key itself
  // In that case, return the original track name
  return translated === translationKey ? trackName : translated;
}

/**
 * Async version that uses Google Translate as fallback
 * Use this when you need automatic translation of database values
 */
export async function translateTestTrackAsync(
  trackName: string,
  t: TFunction,
  targetLang: string = 'en'
): Promise<string> {
  // First try i18n
  const translationKey = `testTracks.${trackName}`;
  const translated = t(translationKey);

  // If found in locale files, use it
  if (translated !== translationKey) {
    return translated;
  }

  // Check Google Translate cache
  const cacheKey = `${trackName}:${targetLang}`;
  if (googleTranslateCache.has(cacheKey)) {
    return googleTranslateCache.get(cacheKey)!;
  }

  // Fall back to Google Translate
  try {
    const googleTranslated = await googleTranslate(trackName, targetLang, 'it');
    googleTranslateCache.set(cacheKey, googleTranslated);
    return googleTranslated;
  } catch (error) {
    console.warn('Google Translate fallback failed:', error);
    return trackName;
  }
}
