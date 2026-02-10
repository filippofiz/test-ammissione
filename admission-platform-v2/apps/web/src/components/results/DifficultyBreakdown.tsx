/**
 * DifficultyBreakdown Component
 *
 * Shows performance by difficulty level (easy/medium/hard) with colored progress bars.
 * For GMAT results, the breakdown comes precomputed from the assessment record.
 * For regular tests, the parent computes it from per-question difficulty fields.
 */

import type { DifficultyBreakdownData } from './types';

export interface DifficultyBreakdownProps {
  breakdown: DifficultyBreakdownData;
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'amber' },
  hard: { label: 'Hard', color: 'red' },
} as const;

export function DifficultyBreakdown({ breakdown }: DifficultyBreakdownProps) {
  const difficulties = (['easy', 'medium', 'hard'] as const).filter(
    d => breakdown[d] && breakdown[d]!.total > 0
  );

  if (difficulties.length === 0) return null;

  return (
    <div className="border-t-2 border-gray-100 pt-4">
      <h3 className="font-semibold text-gray-700 mb-3">Performance by Difficulty</h3>
      <div className="grid grid-cols-3 gap-4">
        {difficulties.map((difficulty) => {
          const data = breakdown[difficulty]!;
          const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
          const { label, color } = DIFFICULTY_CONFIG[difficulty];

          // Use inline styles for the dynamic colors since Tailwind can't
          // generate classes from dynamic template strings at build time
          const colorMap = {
            green: { bg: '#f0fdf4', text: '#15803d', barBg: '#bbf7d0', bar: '#22c55e' },
            amber: { bg: '#fffbeb', text: '#a16207', barBg: '#fde68a', bar: '#f59e0b' },
            red: { bg: '#fef2f2', text: '#b91c1c', barBg: '#fecaca', bar: '#ef4444' },
          }[color];

          return (
            <div
              key={difficulty}
              className="p-3 rounded-lg"
              style={{ backgroundColor: colorMap.bg }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium capitalize" style={{ color: colorMap.text }}>
                  {label}
                </span>
                <span className="text-sm font-bold" style={{ color: colorMap.text }}>
                  {data.correct}/{data.total}
                </span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: colorMap.barBg }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%`, backgroundColor: colorMap.bar }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
