/**
 * StudentAnswerCards
 *
 * Renders student answer cards inside answer slots during multi-student
 * comparison mode. Cards use correctness-tinted borders/backgrounds and
 * pace icons (matching TimeReport) instead of colored dots.
 *
 * Layout: horizontal bento row — each card is a compact rectangle.
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward, faExclamationTriangle, faClock } from '@fortawesome/free-solid-svg-icons';

export interface ComparisonSlotEntry {
  studentName: string | null;
  colorIndex: number;
  /** Time this student spent on the question (seconds) */
  timeSpentSeconds?: number;
  /** Whether this student answered correctly */
  isCorrect?: boolean;
}

/**
 * A card shown for students who did NOT select any option on this question.
 */
export interface NoAnswerEntry {
  studentName: string | null;
  colorIndex: number;
  timeSpentSeconds?: number;
  /** 'skipped' = saw the question but didn't answer; 'unreached' = never got to this question */
  state: 'skipped' | 'unreached';
}

/** Map from slot key → list of students who chose that slot. */
export type ComparisonSlots = Record<string, ComparisonSlotEntry[]>;

/**
 * Per-student identity name colors. Index 4 = primary (blue); 0–3 = comparison students.
 * Exported so other components (e.g. QuestionResultCard header cards) stay in sync.
 */
export const STUDENT_NAME_COLORS = [
  'text-violet-700',
  'text-orange-700',
  'text-teal-700',
  'text-pink-700',
  'text-blue-700',
] as const;

const ID_COLORS = STUDENT_NAME_COLORS.map(name => ({ name }));


function formatTime(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

type Pace = 'fast' | 'ok' | 'slow';

function getPace(t: number, exp: number): Pace {
  const r = t / exp;
  if (r < 0.5) return 'fast';
  if (r > 1.5) return 'slow';
  return 'ok';
}


interface ComparisonChipsProps {
  slotKey: string;
  comparisonSlots?: ComparisonSlots;
  /** Expected seconds per question for pace icon computation */
  expectedTimeSeconds?: number;
  className?: string;
  /** When true, renders as flush bento tiles anchored to the right of the option row */
  bentoBasis?: boolean;
}

function StudentCard({ entry, expectedTimeSeconds, bento = false }: { entry: ComparisonSlotEntry; expectedTimeSeconds: number; bento?: boolean }) {
  const colorIdx = entry.colorIndex === 4 ? 4 : entry.colorIndex % 4;
  const id = ID_COLORS[colorIdx];
  const name = entry.studentName ?? 'Student';
  const hasTime = entry.timeSpentSeconds !== undefined && entry.timeSpentSeconds > 0;
  const pace: Pace | null = hasTime ? getPace(entry.timeSpentSeconds!, expectedTimeSeconds) : null;

  // Card bg/border based on correctness — used for both bento and inline
  const cardBg =
    entry.isCorrect === undefined ? 'bg-gray-50 border-gray-200' :
    entry.isCorrect ? 'bg-green-50 border-green-200' :
    'bg-red-50 border-red-200';

  // Pace icon matching TimeReport
  const paceIcon =
    pace === 'fast' ? <FontAwesomeIcon icon={faForward} className="text-sky-400 text-[10px]" title="Fast" /> :
    pace === 'slow' ? <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-[10px]" title="Slow" /> :
    pace === 'ok'   ? <FontAwesomeIcon icon={faClock} className="text-gray-400 text-[10px]" title="On pace" /> :
    null;

  const timeColor =
    pace === 'slow' ? 'text-amber-600 font-semibold' :
    pace === 'fast' ? 'text-sky-500' :
    'text-gray-500';

  if (bento) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 rounded-lg border select-none w-24 py-2 px-1 ${cardBg}`}>
        <span className={`text-[11px] font-bold text-center leading-tight ${id.name}`}>{name}</span>
        {hasTime && (
          <span className={`inline-flex items-center gap-1 text-[11px] leading-none ${timeColor}`}>
            {paceIcon}
            {formatTime(entry.timeSpentSeconds!)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-3 rounded-lg border select-none ${cardBg}`}>
      <span className={`text-xs font-bold whitespace-nowrap leading-none ${id.name}`}>{name}</span>
      {hasTime && <span className="w-px h-3 bg-gray-200 flex-shrink-0" />}
      {hasTime && (
        <span className={`inline-flex items-center gap-1 text-[11px] leading-none ${timeColor}`}>
          {paceIcon}
          {formatTime(entry.timeSpentSeconds!)}
        </span>
      )}
    </div>
  );
}

export function ComparisonChips({ slotKey, comparisonSlots, expectedTimeSeconds = 90, className = '', bentoBasis = false }: ComparisonChipsProps) {
  if (!comparisonSlots) return null;
  const entries = comparisonSlots[slotKey];
  if (!entries || entries.length === 0) {
    // In bento mode always render a spacer so the right side is reserved
    if (bentoBasis) return null;
    return null;
  }

  if (bentoBasis) {
    return (
      <div className={`flex flex-row-reverse gap-2 flex-shrink-0 ${className}`}>
        {entries.map((entry, i) => (
          <StudentCard key={i} entry={entry} expectedTimeSeconds={expectedTimeSeconds} bento />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-row flex-wrap gap-1.5 ${className}`}>
      {entries.map((entry, i) => (
        <StudentCard key={i} entry={entry} expectedTimeSeconds={expectedTimeSeconds} />
      ))}
    </div>
  );
}

/** Displayed below all options for students who skipped or never reached this question */
export function NoAnswerCards({ entries, expectedTimeSeconds = 90 }: { entries: NoAnswerEntry[]; expectedTimeSeconds?: number }) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-row flex-wrap gap-2 items-center">
      <span className="text-xs text-gray-400 font-medium flex-shrink-0">Didn't answer:</span>
      {entries.map((entry, i) => {
        const colorIdx = entry.colorIndex === 4 ? 4 : entry.colorIndex % 4;
        const id = ID_COLORS[colorIdx];
        const name = entry.studentName ?? 'Student';
        const isUnreached = entry.state === 'unreached';
        const hasTime = entry.timeSpentSeconds !== undefined && entry.timeSpentSeconds > 0;

        return (
          <div
            key={i}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed select-none bg-gray-50 border-gray-200 opacity-80`}
          >
            <span className={`text-xs font-bold whitespace-nowrap leading-none ${id.name}`}>{name}</span>
            <span className="w-px h-3 bg-gray-200 flex-shrink-0" />
            <span className="text-[11px] text-gray-400 leading-none italic">
              {isUnreached ? 'not reached' : hasTime ? formatTime(entry.timeSpentSeconds!) : 'skipped'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
