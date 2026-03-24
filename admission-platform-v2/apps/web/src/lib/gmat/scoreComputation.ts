/**
 * Shared GMAT score computation utility.
 *
 * Provides a single IRT-based score computation function used across all pages
 * (prep page, sidebar, analytics modal, results page) so the same mock simulation
 * always shows the same score everywhere.
 */

import {
  thetaToSectionScore,
  computeTotalScore,
  getTotalPercentile,
  getScoreBand,
} from '../algorithms/gmatScoringAlgorithm';

export interface GmatScoreFromSections {
  /** Per-section IRT scores (60-90), keyed by full section name */
  sectionScores: Record<string, number>;
  /** Total GMAT score (205-805) */
  totalScore: number;
  /** Percentile rank (0-99) */
  percentile: number;
  /** Score band label (e.g. "Development") */
  scoreBand: string;
}

const SECTION_NAME_MAP: Record<string, string> = {
  QR: 'Quantitative Reasoning',
  VR: 'Verbal Reasoning',
  DI: 'Data Insights',
};

/**
 * Compute IRT-based GMAT scores from per-section raw/total counts.
 *
 * Accepts the `section_scores` stored in mock simulation metadata
 * (keyed by QR/DI/VR), computes per-section theta → section score (60-90),
 * then derives total score (205-805), percentile, and score band.
 *
 * Returns null if any of the three sections is missing.
 */
export function computeGmatScoreFromSections(
  sections: Record<string, { score_raw: number; score_total: number }> | null | undefined
): GmatScoreFromSections | null {
  if (!sections) return null;

  const sectionScores: Record<string, number> = {};
  for (const [key, stats] of Object.entries(sections)) {
    if (!stats.score_total) continue;
    const pct = stats.score_raw / stats.score_total;
    const p = Math.max(0.01, Math.min(0.99, pct));
    const theta = Math.log(p / (1 - p)) / 2;
    const fullName = SECTION_NAME_MAP[key] || key;
    sectionScores[fullName] = thetaToSectionScore(theta);
  }

  const qr = sectionScores['Quantitative Reasoning'];
  const vr = sectionScores['Verbal Reasoning'];
  const di = sectionScores['Data Insights'];
  if (qr == null || vr == null || di == null) return null;

  const totalScore = computeTotalScore(qr, vr, di);
  return {
    sectionScores,
    totalScore,
    percentile: getTotalPercentile(totalScore),
    scoreBand: getScoreBand(totalScore).label,
  };
}
