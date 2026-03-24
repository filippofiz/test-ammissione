/**
 * TimeReport Component
 *
 * Horizontal bar chart of time spent per question, grouped by section.
 *
 * Question states:
 *  - answered correct / wrong   → green / red bar, pace-aware
 *  - seen but not answered      → gray bar (student skipped)
 *  - never reached              → hatched slot (time expired before this question)
 */

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStopwatch,
  faChevronDown,
  faChevronUp,
  faClock,
  faForward,
  faExclamationTriangle,
  faHourglass,
} from '@fortawesome/free-solid-svg-icons';

export interface TimeReportQuestion {
  id: string;
  order: number;
  section: string;
  isCorrect: boolean;
  hasAnswer: boolean;
  isBookmarked?: boolean;
  /** undefined = never reached; 0+ = seen (whether answered or not) */
  timeSpentSeconds?: number;
  category?: string | null;
}

export interface TimeReportProps {
  questions: TimeReportQuestion[];
  expectedTimePerSection: Record<string, number>;
  totalTimeSeconds?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

function getExpected(section: string, map: Record<string, number>): number {
  return map[section] ?? map['__global__'] ?? 90;
}

type Pace = 'fast' | 'ok' | 'slow';

function getPace(timeS: number, expectedS: number): Pace {
  const r = timeS / expectedS;
  if (r < 0.5) return 'fast';
  if (r > 1.5) return 'slow';
  return 'ok';
}

type QuestionState = 'correct' | 'wrong' | 'skipped' | 'unreached';

function getState(q: TimeReportQuestion): QuestionState {
  if (q.timeSpentSeconds === undefined) return 'unreached';
  if (!q.hasAnswer) return 'skipped';
  return q.isCorrect ? 'correct' : 'wrong';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TimeReport({ questions, expectedTimePerSection }: TimeReportProps) {
  const [open, setOpen] = useState(false);

  // Count how many questions have any timing data at all
  const seen = questions.filter(q => q.timeSpentSeconds !== undefined);
  const unreachedCount = questions.length - seen.length;

  // Don't render if literally nothing was tracked
  if (seen.length === 0) return null;

  // Group into sections preserving display order
  const sectionOrder: string[] = [];
  const bySection: Record<string, TimeReportQuestion[]> = {};
  for (const q of questions) {
    if (!bySection[q.section]) {
      bySection[q.section] = [];
      sectionOrder.push(q.section);
    }
    bySection[q.section].push(q);
  }

  // Chart scale: 95th-percentile of seen times so one outlier doesn't crush everything
  const seenTimes = seen
    .map(q => q.timeSpentSeconds!)
    .filter(t => t > 0)
    .sort((a, b) => a - b);
  const p95 = seenTimes[Math.min(Math.floor(seenTimes.length * 0.95), seenTimes.length - 1)] ?? 0;
  const chartMax = Math.max(p95, ...Object.values(expectedTimePerSection), 60);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">

      {/* ── Header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faStopwatch} className="text-indigo-500 text-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm leading-tight">Time per Question</span>
            <span className="text-xs text-gray-400 leading-tight mt-0.5">
              {seen.length} of {questions.length} question{questions.length !== 1 ? 's' : ''} reached
              {unreachedCount > 0 && (
                <span className="ml-1.5 text-amber-500 font-medium">
                  · {unreachedCount} not reached
                </span>
              )}
            </span>
          </div>
        </div>
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className="text-gray-300 text-xs"
        />
      </button>

      {/* ── Chart body ── */}
      {open && (
        <div className="px-6 pb-6">

          {sectionOrder.map((section, si) => {
            const sqs = bySection[section];
            const exp = getExpected(section, expectedTimePerSection);
            const expPct = Math.min((exp / chartMax) * 100, 100);

            const sectionHasSeen = sqs.some(q => q.timeSpentSeconds !== undefined);

            return (
              <div key={section} className={si > 0 ? 'mt-8' : ''}>

                {/* Section label + target pill */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {section}
                  </span>
                  {sectionHasSeen && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                      <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                      target {formatSeconds(exp)} / question
                    </span>
                  )}
                </div>

                {/* Target indicator row — mirrors the bar row layout exactly */}
                {sectionHasSeen && (
                  <div className="flex items-end gap-2 h-5 mb-0.5">
                    {/* Spacer matching question-number column */}
                    <span className="w-7 flex-shrink-0" />
                    {/* Spacer matching bar track, with target pin */}
                    <div className="relative flex-1">
                      <div
                        className="absolute bottom-0 flex flex-col items-center"
                        style={{ left: `${expPct}%`, transform: 'translateX(-50%)' }}
                      >
                        <span className="text-[9px] leading-none text-indigo-400 font-medium whitespace-nowrap">target</span>
                        <svg width="8" height="5" viewBox="0 0 8 5" className="mt-0.5">
                          <path d="M4 5L0 0h8z" fill="#a5b4fc" />
                        </svg>
                      </div>
                    </div>
                    {/* Spacer matching right-side columns (w-16 + w-4 + gap-2*2) */}
                    <span className="w-16 flex-shrink-0" />
                    <span className="w-4 flex-shrink-0" />
                  </div>
                )}

                {/* Bars */}
                <div className="space-y-2">
                  {sqs.map(q => {
                    const state = getState(q);
                    const t = q.timeSpentSeconds ?? 0;
                    const hasTime = t > 0;
                    const barPct = hasTime ? Math.min((t / chartMax) * 100, 100) : 0;
                    const p: Pace = (state === 'correct' || state === 'wrong') && hasTime
                      ? getPace(t, exp)
                      : 'ok';

                    return (
                      <div key={q.id} className="flex items-center gap-2">

                        {/* Question number */}
                        <span className="w-7 text-right text-xs font-medium text-gray-400 flex-shrink-0 tabular-nums">
                          {q.order}
                        </span>

                        {/* Bar track */}
                        <div className="relative flex-1">
                          {state === 'unreached' ? (
                            <UnreachedTrack />
                          ) : (
                            <>
                              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: hasTime ? `${barPct}%` : '100%',
                                    backgroundColor: barColor(state, p),
                                    opacity: hasTime ? 1 : 0.25,
                                  }}
                                />
                              </div>
                              {/* Target marker — sits on top of track, outside overflow:hidden */}
                              <div
                                className="absolute top-0 h-4 w-0.5 bg-indigo-300 rounded-full"
                                style={{ left: `${expPct}%`, transform: 'translateX(-50%)', opacity: 0.7 }}
                              />
                            </>
                          )}
                        </div>

                        {/* Right-side info */}
                        {state === 'unreached' ? (
                          <UnreachedLabel />
                        ) : (
                          <TimeLabelAndIcon t={t} p={p} state={state} />
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Pace summary ── */}
          <PaceSummary questions={seen} expectedTimePerSection={expectedTimePerSection} />

          {/* ── Legend ── */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-gray-100">
            <LegendSwatch color="#22c55e" label="Correct" />
            <LegendSwatch color="#ef4444" label="Wrong" />
            <LegendSwatch color="#9ca3af" label="Skipped" dimmed />
            <LegendSwatch hatched label="Not reached" />
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <FontAwesomeIcon icon={faForward} className="text-gray-300 text-[10px]" />
              Fast (&lt;50% target)
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-400 text-[10px]" />
              Slow (&gt;150% target)
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Bar color ────────────────────────────────────────────────────────────────

function barColor(state: QuestionState, p: Pace): string {
  if (state === 'correct') return p === 'fast' ? '#86efac' : '#22c55e'; // green-300 / green-500
  if (state === 'wrong')   return p === 'fast' ? '#fca5a5' : '#ef4444'; // red-300   / red-500
  return '#9ca3af'; // gray-400 for skipped
}

// ─── Unreached track ─────────────────────────────────────────────────────────

function UnreachedTrack() {
  return (
    <div
      className="h-4 rounded-full w-full"
      style={{
        background: 'repeating-linear-gradient(135deg, #f3f4f6 0px, #f3f4f6 4px, #e5e7eb 4px, #e5e7eb 8px)',
        border: '1px dashed #d1d5db',
      }}
    />
  );
}

// ─── Label for unreached questions ───────────────────────────────────────────

function UnreachedLabel() {
  return (
    <>
      <span className="w-16 text-right text-xs text-gray-300 flex-shrink-0 tabular-nums italic">
        not reached
      </span>
      <span className="w-4 flex items-center justify-center flex-shrink-0">
        <FontAwesomeIcon icon={faHourglass} className="text-gray-300 text-[9px]" />
      </span>
    </>
  );
}

// ─── Time label + pace icon ───────────────────────────────────────────────────

function TimeLabelAndIcon({ t, p, state }: { t: number; p: Pace; state: QuestionState }) {
  const timeClass =
    state === 'skipped'  ? 'text-gray-400 italic' :
    p === 'slow'         ? 'text-orange-500 font-semibold' :
    p === 'fast'         ? 'text-gray-300' :
                           'text-gray-500';

  const icon =
    p === 'slow' ? <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-400 text-[9px]" /> :
    p === 'fast' ? <FontAwesomeIcon icon={faForward}             className="text-gray-300 text-[9px]"  /> :
    null;

  return (
    <>
      <span className={`w-16 text-right text-xs flex-shrink-0 tabular-nums ${timeClass}`}>
        {t > 0 ? formatSeconds(t) : '–'}
      </span>
      <span className="w-4 flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
    </>
  );
}

// ─── Pace summary ────────────────────────────────────────────────────────────

function PaceSummary({
  questions,
  expectedTimePerSection,
}: {
  questions: TimeReportQuestion[];
  expectedTimePerSection: Record<string, number>;
}) {
  const answered = questions.filter(
    q => q.timeSpentSeconds !== undefined && q.timeSpentSeconds > 0 && q.hasAnswer,
  );
  if (answered.length === 0) return null;

  let fast = 0, ok = 0, slow = 0;
  for (const q of answered) {
    const exp = getExpected(q.section, expectedTimePerSection);
    const p = getPace(q.timeSpentSeconds!, exp);
    if (p === 'fast') fast++;
    else if (p === 'slow') slow++;
    else ok++;
  }

  const total = answered.length;
  const fastPct  = Math.round((fast / total) * 100);
  const okPct    = Math.round((ok   / total) * 100);
  const slowPct  = Math.round((slow / total) * 100);

  // bar widths — use raw counts to avoid rounding drift
  const fastW  = (fast / total) * 100;
  const okW    = (ok   / total) * 100;
  const slowW  = (slow / total) * 100;

  return (
    <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pacing summary</span>
        <span className="text-xs text-gray-400">{total} answered questions</span>
      </div>

      {/* Segmented bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3 gap-px bg-white">
        {fastW > 0 && (
          <div className="h-full rounded-l-full" style={{ width: `${fastW}%`, backgroundColor: '#38bdf8' }} />
        )}
        {okW > 0 && (
          <div className="h-full" style={{ width: `${okW}%`, backgroundColor: '#14b8a6' }} />
        )}
        {slowW > 0 && (
          <div className="h-full rounded-r-full" style={{ width: `${slowW}%`, backgroundColor: '#f59e0b' }} />
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-sky-400">{fastPct}%</div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FontAwesomeIcon icon={faForward} className="text-sky-300 text-[9px]" />
            Fast
          </div>
          <div className="text-xs text-gray-300">{fast} q</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-teal-500">{okPct}%</div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FontAwesomeIcon icon={faClock} className="text-teal-400 text-[9px]" />
            On pace
          </div>
          <div className="text-xs text-gray-300">{ok} q</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-400">{slowPct}%</div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400 text-[9px]" />
            Slow
          </div>
          <div className="text-xs text-gray-300">{slow} q</div>
        </div>
      </div>
    </div>
  );
}

// ─── Legend swatch ────────────────────────────────────────────────────────────

function LegendSwatch({
  color,
  label,
  dimmed = false,
  hatched = false,
}: {
  color?: string;
  label: string;
  dimmed?: boolean;
  hatched?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span
        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
        style={
          hatched
            ? {
                background: 'repeating-linear-gradient(135deg, #f3f4f6 0px, #f3f4f6 3px, #e5e7eb 3px, #e5e7eb 6px)',
                border: '1px dashed #d1d5db',
              }
            : { backgroundColor: color, opacity: dimmed ? 0.4 : 1 }
        }
      />
      {label}
    </span>
  );
}
