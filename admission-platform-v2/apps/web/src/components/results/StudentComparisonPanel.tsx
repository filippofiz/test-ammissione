/**
 * StudentComparisonPanel Component
 *
 * Tutor-only panel for group review sessions.
 * A persistent bar shows current comparison students.
 * Clicking "Add student" opens a slide-in side drawer that lists available peers.
 */

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faTimes,
  faPlus,
  faSpinner,
  faExclamationTriangle,
  faRedo,
  faChevronRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import type {
  UnifiedResultData,
  ComparisonStudentResult,
  AvailableComparisonStudent,
} from './types';

const MAX_COMPARISON_STUDENTS = 4;

interface StudentComparisonPanelProps {
  availableStudents: AvailableComparisonStudent[];
  availableLoading: boolean;
  comparisonResults: ComparisonStudentResult[];
  loadingIds: Set<string>;
  errorIds: Map<string, string>;
  onAdd: (sourceId: string) => void;
  onRemove: (sourceId: string) => void;
  primaryData: UnifiedResultData;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Avatar circle */
function Avatar({
  name,
  colorClass = 'bg-violet-200 text-violet-700',
  size = 'md',
}: {
  name: string | null;
  colorClass?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${sizeClass} ${colorClass}`}
    >
      {(name ?? '?')[0]?.toUpperCase()}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Side Drawer                                                         */
/* ------------------------------------------------------------------ */

function StudentPickerDrawer({
  open,
  onClose,
  availableStudents,
  availableLoading,
  comparisonResults,
  loadingIds,
  errorIds,
  onAdd,
  onRemove,
  primaryData,
}: {
  open: boolean;
  onClose: () => void;
  availableStudents: AvailableComparisonStudent[];
  availableLoading: boolean;
  comparisonResults: ComparisonStudentResult[];
  loadingIds: Set<string>;
  errorIds: Map<string, string>;
  onAdd: (sourceId: string) => void;
  onRemove: (sourceId: string) => void;
  primaryData: UnifiedResultData;
}) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const atCap = comparisonResults.length >= MAX_COMPARISON_STUDENTS;
  const addedIds = new Set(comparisonResults.map(r => r.sourceId));
  const loadingSet = loadingIds;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-violet-600">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Compare Students</h2>
              <p className="text-xs text-violet-200">Select students to compare</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-violet-500 transition-colors text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Primary student reference */}
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-2">Viewing results for</p>
          <div className="flex items-center gap-3">
            <Avatar name={primaryData.studentName ?? null} colorClass="bg-blue-200 text-blue-700" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {primaryData.studentName ?? 'Primary student'}
              </p>
              <p className="text-xs text-gray-500">
                {primaryData.scorePercentage}% · {primaryData.scoreRaw}/{primaryData.scoreTotal}
              </p>
            </div>
            <span className="ml-auto shrink-0 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              Primary
            </span>
          </div>
        </div>

        {/* Currently added students */}
        {(comparisonResults.length > 0 || loadingIds.size > 0) && (
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              In comparison ({comparisonResults.length}/{MAX_COMPARISON_STUDENTS})
            </p>
            <div className="space-y-2">
              {comparisonResults.map(result => {
                const correctCount = [...result.questionResults.values()].filter(q => q.isCorrect).length;
                const total = result.questionResults.size;
                return (
                  <div
                    key={result.sourceId}
                    className="flex items-center gap-3 p-2 rounded-lg bg-violet-50 border border-violet-100"
                  >
                    <Avatar name={result.studentName} colorClass="bg-violet-200 text-violet-700" size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {result.studentName ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.scorePercentage}% · {correctCount}/{total} correct
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(result.sourceId)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-violet-200 text-violet-400 hover:text-violet-600 transition-colors"
                      title="Remove"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                );
              })}

              {[...loadingIds].map(sourceId => (
                <div
                  key={sourceId}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400 text-xs" />
                  </div>
                  <p className="text-xs text-gray-400">Loading...</p>
                </div>
              ))}

              {[...errorIds.entries()].map(([sourceId]) => {
                const available = availableStudents.find(s => s.sourceId === sourceId);
                return (
                  <div
                    key={sourceId}
                    className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-red-600 truncate">
                        {available?.studentName ?? 'Student'}: failed
                      </p>
                    </div>
                    <button
                      onClick={() => onAdd(sourceId)}
                      className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faRedo} className="text-xs" />
                      Retry
                    </button>
                    <button
                      onClick={() => onRemove(sourceId)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 text-red-300 hover:text-red-500 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available students list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              {availableLoading ? 'Loading students...' : `Available students (${availableStudents.filter(s => !s.alreadyAdded).length})`}
            </p>

            {availableLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-violet-400 text-2xl mb-3" />
                  <p className="text-sm text-gray-400">Finding students who completed this test...</p>
                </div>
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faUsers} className="text-gray-300 text-2xl" />
                </div>
                <p className="text-sm font-medium text-gray-500">No other students yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  No other students have completed this test yet.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {availableStudents.map(student => {
                  const isAdded = addedIds.has(student.sourceId);
                  const isLoading = loadingSet.has(student.sourceId);
                  const isDisabled = atCap && !isAdded;

                  return (
                    <button
                      key={student.sourceId}
                      onClick={() => {
                        if (isAdded) {
                          onRemove(student.sourceId);
                        } else if (!isDisabled && !isLoading) {
                          onAdd(student.sourceId);
                        }
                      }}
                      disabled={isDisabled || isLoading}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                        isAdded
                          ? 'bg-violet-50 border border-violet-200'
                          : isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-gray-50'
                            : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <Avatar
                        name={student.studentName}
                        colorClass={isAdded ? 'bg-violet-200 text-violet-700' : 'bg-gray-100 text-gray-500'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {student.studentName ?? 'Unknown student'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Completed {formatDate(student.completedAt)}
                        </p>
                      </div>

                      {isLoading ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-violet-400 text-sm shrink-0" />
                      ) : isAdded ? (
                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                          <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                        </div>
                      ) : (
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-sm shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {atCap && (
              <p className="text-xs text-amber-600 text-center mt-3 bg-amber-50 rounded-lg py-2 px-3">
                Maximum {MAX_COMPARISON_STUDENTS} students reached. Remove one to add another.
              </p>
            )}
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Student cards on each answer option show how comparison students responded
          </p>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main panel component                                                */
/* ------------------------------------------------------------------ */

export function StudentComparisonPanel({
  availableStudents,
  availableLoading,
  comparisonResults,
  loadingIds,
  errorIds,
  onAdd,
  onRemove,
  primaryData,
}: StudentComparisonPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalActive = comparisonResults.length + loadingIds.size;
  const hasErrors = errorIds.size > 0;

  return (
    <>
      {/* Inline panel strip */}
      <div className="bg-white rounded-xl shadow-md border-2 border-violet-200 mb-6 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Icon + label */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="text-violet-600 text-base" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">Compare Students</p>
              <p className="text-xs text-gray-400">
                {totalActive === 0
                  ? 'Add students for group review'
                  : `${totalActive} student${totalActive !== 1 ? 's' : ''} added`}
              </p>
            </div>
          </div>

          {/* Active comparison avatars */}
          {totalActive > 0 && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex -space-x-2">
                {comparisonResults.slice(0, 4).map(r => (
                  <div
                    key={r.sourceId}
                    className="w-8 h-8 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-xs font-bold text-violet-700 shrink-0"
                    title={r.studentName ?? undefined}
                  >
                    {(r.studentName ?? '?')[0]?.toUpperCase()}
                  </div>
                ))}
                {[...loadingIds].map(id => (
                  <div
                    key={id}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400 text-xs" />
                  </div>
                ))}
              </div>

              {/* Score badges */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {comparisonResults.map(r => (
                  <span
                    key={r.sourceId}
                    className="shrink-0 text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    {r.studentName?.split(' ')[0] ?? '?'}: {r.scorePercentage}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error indicator */}
          {hasErrors && (
            <span className="shrink-0 flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
              {errorIds.size} error{errorIds.size !== 1 ? 's' : ''}
            </span>
          )}

          {/* Open drawer button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 ml-auto flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            {totalActive === 0 ? 'Add student' : 'Manage'}
          </button>
        </div>

      </div>

      {/* Side drawer (rendered via portal-like fixed positioning) */}
      <StudentPickerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        availableStudents={availableStudents}
        availableLoading={availableLoading}
        comparisonResults={comparisonResults}
        loadingIds={loadingIds}
        errorIds={errorIds}
        onAdd={onAdd}
        onRemove={onRemove}
        primaryData={primaryData}
      />
    </>
  );
}
