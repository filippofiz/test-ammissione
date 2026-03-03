import { DemoConfetti } from './DemoConfetti';

interface SubmitFlowProps {
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  phase: 'review' | 'confirm' | 'submitting' | 'success' | 'hidden';
  questionStatuses: { number: number; answered: boolean; flagged: boolean }[];
}

export function DemoSubmitFlow({ totalQuestions, answeredCount, flaggedCount, phase, questionStatuses }: SubmitFlowProps) {
  if (phase === 'hidden') return null;

  return (
    <div className="max-w-3xl mx-auto w-full">
      <DemoConfetti active={phase === 'success'} />

      {/* Review phase */}
      {phase === 'review' && (
        <div className="demo-animate-fadeInUp bg-white rounded-xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Review Your Answers</h2>
          <p className="text-gray-500 text-sm mb-4">Please review your answers before submitting.</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#00a666]/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[#00a666]">{answeredCount}</div>
              <div className="text-xs text-gray-500">Answered</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{flaggedCount}</div>
              <div className="text-xs text-gray-500">Flagged</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-600">{totalQuestions - answeredCount}</div>
              <div className="text-xs text-gray-500">Unanswered</div>
            </div>
          </div>

          {/* Question grid */}
          <div className="grid grid-cols-10 gap-1.5 mb-5">
            {questionStatuses.map((q) => (
              <div
                key={q.number}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold
                  ${q.answered && q.flagged ? 'bg-yellow-400 text-yellow-900' : ''}
                  ${q.answered && !q.flagged ? 'bg-[#00a666] text-white' : ''}
                  ${!q.answered ? 'bg-gray-200 text-gray-500' : ''}`}
              >
                {q.number}
              </div>
            ))}
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-[#00a666] to-emerald-500 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all demo-animate-pulseGlow">
            Submit Test
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {phase === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="demo-animate-scaleIn bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-auto text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Submit Test?</h3>
            <p className="text-gray-500 text-sm mb-4">You have answered {answeredCount} of {totalQuestions} questions. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Go Back
              </button>
              <button className="flex-1 py-2.5 bg-[#00a666] text-white font-bold rounded-xl hover:bg-[#008855] transition-colors text-sm">
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting spinner */}
      {phase === 'submitting' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 animate-spin" viewBox="0 0 50 50">
              <circle className="demo-spinner-circle" cx="25" cy="25" r="20" fill="none" stroke="#00a666" strokeWidth="4" />
            </svg>
            <div className="text-base font-semibold text-gray-800">Submitting your test...</div>
          </div>
        </div>
      )}

      {/* Success celebration */}
      {phase === 'success' && (
        <div className="demo-animate-bounceIn bg-white rounded-xl shadow-2xl p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#00a666] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Test Submitted!</h2>
          <p className="text-gray-500 text-sm mb-4">Great job! Your answers have been recorded.</p>
          <div className="bg-gray-50 rounded-lg p-3 text-left space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Questions Answered</span>
              <span className="font-bold text-gray-800">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Time Taken</span>
              <span className="font-bold text-gray-800">34:28</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Submitted At</span>
              <span className="font-bold text-gray-800">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
