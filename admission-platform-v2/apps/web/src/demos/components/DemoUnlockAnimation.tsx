interface UnlockAnimationProps {
  testName: string;
  phase: 'locked' | 'shaking' | 'bursting' | 'unlocked' | 'hidden';
}

export function DemoUnlockAnimation({ testName, phase }: UnlockAnimationProps) {
  if (phase === 'hidden') return null;

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className={`relative text-center transition-all duration-500
        ${phase === 'unlocked' ? 'scale-105' : 'scale-100'}`}>

        {/* Card */}
        <div className={`w-80 rounded-2xl shadow-2xl border-2 p-8 transition-all duration-700
          ${phase === 'locked' || phase === 'shaking' ? 'bg-gray-100 border-gray-300' : ''}
          ${phase === 'bursting' ? 'bg-white border-[#00a666]' : ''}
          ${phase === 'unlocked' ? 'bg-gradient-to-br from-white to-green-50 border-[#00a666] shadow-green-200/50' : ''}`}>

          {/* Burst ring effect */}
          {phase === 'bursting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-[#00a666] demo-animate-unlockBurst" />
            </div>
          )}

          {/* Lock icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            {(phase === 'locked' || phase === 'shaking') && (
              <div className={`w-20 h-20 bg-gray-300 rounded-2xl flex items-center justify-center
                ${phase === 'shaking' ? 'demo-animate-unlockShake' : ''}`}>
                <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
            )}
            {(phase === 'bursting' || phase === 'unlocked') && (
              <div className="demo-animate-bounceIn w-20 h-20 bg-[#00a666] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5-2.28 0-4.27 1.54-4.84 3.75-.14.54.18 1.08.72 1.22.54.14 1.08-.18 1.22-.72C9.44 3.93 10.63 3 12 3c1.65 0 3 1.35 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Test info */}
          <h3 className={`text-xl font-bold mb-2 transition-colors duration-500
            ${phase === 'unlocked' ? 'text-[#00a666]' : 'text-gray-600'}`}>
            {testName}
          </h3>
          <p className={`text-sm mb-6 transition-colors duration-500
            ${phase === 'unlocked' ? 'text-gray-500' : 'text-gray-400'}`}>
            {phase === 'unlocked' ? 'Ready to start!' : 'This test is locked'}
          </p>

          {/* Action button */}
          {phase === 'unlocked' && (
            <button className="demo-animate-fadeInUp w-full py-3 bg-[#00a666] text-white font-bold rounded-xl shadow-lg hover:bg-[#008855] transition-colors">
              Start Test \u2192
            </button>
          )}
          {(phase === 'locked' || phase === 'shaking') && (
            <div className="w-full py-3 bg-gray-200 text-gray-400 font-medium rounded-xl text-center">
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
