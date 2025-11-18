import { TFunction } from 'i18next';

/**
 * Translates test track name using i18n
 * Falls back to original name if translation doesn't exist
 */
export function translateTestTrack(trackName: string, t: TFunction): string {
  const translationKey = `testTracks.${trackName}`;
  const translated = t(translationKey);

  // If translation key wasn't found, i18next returns the key itself
  // In that case, return the original track name
  return translated === translationKey ? trackName : translated;
}
