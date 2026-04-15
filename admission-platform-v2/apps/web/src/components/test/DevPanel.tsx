/**
 * DevPanel — in-test developer panel for reproducing student-reported issues.
 *
 * Visible only when:
 *   - import.meta.env.DEV  (local dev server), OR
 *   - URL contains ?devPanel=true
 *
 * Completely tree-shaken in production builds via the early return below.
 * Mount it once inside TakeTestPageInner, after the test has started
 * (i.e. not on start screen / completion screen).
 */

import { useState, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DevPanelProps {
  // State snapshots (read-only display)
  currentQuestionIndex: number;
  totalQuestionsInSection: number;
  currentSectionIndex: number;
  totalSections: number;
  currentSection: string;
  globalQuestionOrder: number;
  timeRemaining: number | null;
  isTransitioning: boolean;
  submitting: boolean;
  answersCount: number;
  isSaving: boolean;

  // Actions exposed from TakeTestPage / hooks
  setCurrentQuestionIndex: (i: number) => void;
  setGlobalQuestionOrder: (n: number) => void;
  handleTimeUp: () => void;
  completeSection: (skipReview?: boolean) => void;
  submitTest: () => Promise<void>;
  goToNextQuestion: () => void;

  // Refs / setters needed for fault injection
  autoSaveTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  answersRef: React.MutableRefObject<Record<string, any>>;
}

// ─── Guard ───────────────────────────────────────────────────────────────────

function isDevPanelEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get('devPanel') === 'true';
  } catch {
    return false;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DevPanel(props: DevPanelProps) {
  if (!isDevPanelEnabled()) return null;

  return <DevPanelInner {...props} />;
}

function DevPanelInner({
  currentQuestionIndex,
  totalQuestionsInSection,
  currentSectionIndex,
  totalSections,
  currentSection,
  globalQuestionOrder,
  timeRemaining,
  isTransitioning,
  submitting,
  answersCount,
  isSaving,
  setCurrentQuestionIndex,
  setGlobalQuestionOrder,
  handleTimeUp,
  completeSection,
  goToNextQuestion,
  submitTest,
  autoSaveTimeoutRef,
  answersRef,
}: DevPanelProps) {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [networkKilled, setNetworkKilled] = useState(false);
  const [saveDelayMs, setSaveDelayMs] = useState(0);
  const origFetchRef = useRef<typeof window.fetch | null>(null);

  function addLog(msg: string) {
    const ts = new Date().toLocaleTimeString('it-IT', { hour12: false });
    setLog(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 50));
  }

  // ── Network kill ────────────────────────────────────────────────────────────

  function killNetwork() {
    if (networkKilled) return;
    origFetchRef.current = window.fetch;
    (window as any).fetch = () => Promise.reject(new TypeError('Network killed by DevPanel'));
    setNetworkKilled(true);
    addLog('🔴 Network killed — all fetch calls will fail');
  }

  function restoreNetwork() {
    if (!networkKilled || !origFetchRef.current) return;
    window.fetch = origFetchRef.current;
    origFetchRef.current = null;
    setNetworkKilled(false);
    addLog('🟢 Network restored');
  }

  // ── Save delay injection ─────────────────────────────────────────────────────

  function injectSaveDelay(ms: number) {
    origFetchRef.current = origFetchRef.current ?? window.fetch;
    const orig = origFetchRef.current;
    (window as any).fetch = async (...args: Parameters<typeof fetch>) => {
      const url = String(args[0]);
      if (url.includes('student_answers')) {
        addLog(`⏳ Delaying save by ${ms}ms…`);
        await new Promise(r => setTimeout(r, ms));
        addLog('✅ Delayed save proceeding');
      }
      return orig(...args);
    };
    setSaveDelayMs(ms);
    addLog(`⏳ Save delay injected: ${ms}ms on every student_answers request`);
  }

  function clearSaveDelay() {
    if (origFetchRef.current) {
      window.fetch = origFetchRef.current;
      origFetchRef.current = null;
    }
    setSaveDelayMs(0);
    addLog('✅ Save delay cleared');
  }

  // ── Jump to last question ────────────────────────────────────────────────────

  function jumpToLastQuestion() {
    const lastIdx = totalQuestionsInSection - 1;
    if (lastIdx < 0) { addLog('⚠️ No questions in section'); return; }
    setCurrentQuestionIndex(lastIdx);
    // globalQuestionOrder should reflect position 1-indexed
    setGlobalQuestionOrder(lastIdx);
    addLog(`⏩ Jumped to Q${lastIdx + 1}/${totalQuestionsInSection} (last)`);
  }

  function jumpToQuestion(n: number) {
    const idx = Math.max(0, Math.min(n - 1, totalQuestionsInSection - 1));
    setCurrentQuestionIndex(idx);
    setGlobalQuestionOrder(idx);
    addLog(`⏩ Jumped to Q${idx + 1}`);
  }

  // ── Timer ────────────────────────────────────────────────────────────────────

  function fireTimeUp() {
    addLog('⏰ Firing handleTimeUp()…');
    handleTimeUp();
  }

  // ── Complete section ─────────────────────────────────────────────────────────

  function fireCompleteSection(skipReview = false) {
    addLog(`🏁 Calling completeSection(${skipReview ? 'skipReview=true' : ''})…`);
    completeSection(skipReview);
  }

  function fireCompleteSectionTwice() {
    addLog('🏁🏁 Calling completeSection() twice in 50ms (double-trigger test)…');
    completeSection();
    setTimeout(() => completeSection(), 50);
  }

  // ── Corrupt last answer ───────────────────────────────────────────────────────

  function corruptLastAnswer() {
    const keys = Object.keys(answersRef.current);
    if (keys.length === 0) { addLog('⚠️ No answers in ref to corrupt'); return; }
    const lastKey = keys[keys.length - 1];
    answersRef.current[lastKey] = { ...answersRef.current[lastKey], answer: null };
    addLog(`💥 Corrupted answer for question ${lastKey.substring(0, 8)}… → answer=null`);
  }

  // ── Cancel pending auto-save ──────────────────────────────────────────────────

  function cancelAutoSave() {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
      addLog('🚫 Pending auto-save cancelled');
    } else {
      addLog('ℹ️ No pending auto-save to cancel');
    }
  }

  // ── Throw render error ────────────────────────────────────────────────────────

  function throwRenderError() {
    addLog('💣 Setting window.__devThrowError — refresh or navigate to trigger');
    (window as any).__devThrowError = true;
  }

  // ── Jump input ────────────────────────────────────────────────────────────────

  const [jumpInput, setJumpInput] = useState('');

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: 12,
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'block',
          marginLeft: 'auto',
          padding: '4px 10px',
          background: networkKilled ? '#ef4444' : '#1e293b',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 11,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '0.05em',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {networkKilled ? '🔴 DEV' : '🛠 DEV'}
      </button>

      {open && (
        <div
          style={{
            marginTop: 6,
            background: '#0f172a',
            color: '#e2e8f0',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            width: 320,
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '12px 14px',
          }}
        >
          {/* State snapshot */}
          <div style={{ marginBottom: 10, padding: '8px 10px', background: '#1e293b', borderRadius: 6 }}>
            <div style={{ color: '#94a3b8', marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>State</div>
            <div>Q: <b style={{ color: '#34d399' }}>{currentQuestionIndex + 1}</b>/{totalQuestionsInSection} &nbsp; §: <b style={{ color: '#34d399' }}>{currentSectionIndex + 1}</b>/{totalSections}</div>
            <div>Section: <b style={{ color: '#fbbf24' }}>{currentSection}</b></div>
            <div>GlobalOrder: <b style={{ color: '#a78bfa' }}>{globalQuestionOrder}</b> &nbsp; Answers: <b style={{ color: '#60a5fa' }}>{answersCount}</b></div>
            <div>
              Timer: <b style={{ color: timeRemaining !== null && timeRemaining < 60 ? '#f87171' : '#34d399' }}>{timeRemaining ?? '∞'}s</b>
              &nbsp;|&nbsp; Saving: <b style={{ color: isSaving ? '#fbbf24' : '#94a3b8' }}>{isSaving ? 'YES' : 'no'}</b>
              &nbsp;|&nbsp; Trans: <b style={{ color: isTransitioning ? '#fbbf24' : '#94a3b8' }}>{isTransitioning ? 'YES' : 'no'}</b>
              &nbsp;|&nbsp; Submit: <b style={{ color: submitting ? '#f87171' : '#94a3b8' }}>{submitting ? 'YES' : 'no'}</b>
            </div>
          </div>

          {/* Section: Navigation */}
          <Section label="Navigation">
            <Row>
              <Btn onClick={() => { addLog('➡️ Calling goToNextQuestion()…'); goToNextQuestion(); }} color="#3b82f6">➡️ Next Q</Btn>
              <Btn onClick={jumpToLastQuestion} color="#3b82f6">⏩ Last Q</Btn>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                <input
                  type="number"
                  min={1}
                  max={totalQuestionsInSection}
                  value={jumpInput}
                  onChange={e => setJumpInput(e.target.value)}
                  placeholder={`1–${totalQuestionsInSection}`}
                  style={{ width: '60px', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', padding: '2px 6px', fontSize: 12 }}
                />
                <Btn onClick={() => jumpToQuestion(Number(jumpInput))} color="#3b82f6">Go</Btn>
              </div>
            </Row>
          </Section>

          {/* Section: Network */}
          <Section label="Network">
            <Row>
              {networkKilled
                ? <Btn onClick={restoreNetwork} color="#22c55e">🟢 Restore network</Btn>
                : <Btn onClick={killNetwork} color="#ef4444">🔴 Kill network</Btn>
              }
            </Row>
            <Row>
              {saveDelayMs > 0
                ? <Btn onClick={clearSaveDelay} color="#22c55e">✅ Clear {saveDelayMs}ms delay</Btn>
                : <>
                    <Btn onClick={() => injectSaveDelay(3000)} color="#f59e0b">⏳ 3s save delay</Btn>
                    <Btn onClick={() => injectSaveDelay(6000)} color="#ef4444">⏳ 6s save delay</Btn>
                  </>
              }
            </Row>
            <Row>
              <Btn onClick={cancelAutoSave} color="#64748b">🚫 Cancel auto-save</Btn>
            </Row>
          </Section>

          {/* Section: Timer */}
          <Section label="Timer">
            <Row>
              <Btn onClick={fireTimeUp} color="#f59e0b">⏰ Fire handleTimeUp()</Btn>
            </Row>
          </Section>

          {/* Section: Section completion */}
          <Section label="Section completion">
            <Row>
              <Btn onClick={() => fireCompleteSection()} color="#8b5cf6">🏁 completeSection()</Btn>
              <Btn onClick={() => fireCompleteSection(true)} color="#8b5cf6">🏁 skipReview</Btn>
            </Row>
            <Row>
              <Btn onClick={fireCompleteSectionTwice} color="#ef4444">🏁🏁 Double trigger</Btn>
            </Row>
            <Row>
              <Btn onClick={() => { addLog('📤 Calling submitTest() directly…'); submitTest(); }} color="#ef4444">📤 Force submitTest()</Btn>
            </Row>
          </Section>

          {/* Section: Answer corruption */}
          <Section label="Answer fault injection">
            <Row>
              <Btn onClick={corruptLastAnswer} color="#ef4444">💥 Corrupt last answer</Btn>
            </Row>
          </Section>

          {/* Section: Error boundary */}
          <Section label="Error boundary">
            <Row>
              <Btn onClick={throwRenderError} color="#ef4444">💣 Schedule render crash</Btn>
            </Row>
            <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>
              Sets window.__devThrowError. Navigate to next question to trigger.
            </div>
          </Section>

          {/* Log */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Log</span>
              <button onClick={() => setLog([])} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 10 }}>clear</button>
            </div>
            <div style={{ background: '#0a0f1a', borderRadius: 4, padding: '6px 8px', maxHeight: 120, overflow: 'auto' }}>
              {log.length === 0
                ? <span style={{ color: '#334155' }}>No events yet</span>
                : log.map((l, i) => <div key={i} style={{ color: '#94a3b8', lineHeight: 1.5 }}>{l}</div>)
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 4 }}>{children}</div>;
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '4px 8px',
        background: color,
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: 600,
        textAlign: 'center',
      }}
    >
      {children}
    </button>
  );
}
