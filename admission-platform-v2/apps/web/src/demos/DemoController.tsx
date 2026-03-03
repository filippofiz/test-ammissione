/**
 * DemoController — Reusable auto-pilot controller for demo views
 * Provides Play/Pause/Reset/Speed controls and executes a timeline of steps
 * Wraps content in a browser frame mockup for marketing recordings
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface DemoStep {
  delay: number;
  action: () => void;
  label?: string;
}

interface DemoControllerProps {
  steps: DemoStep[];
  onReset: () => void;
  children: React.ReactNode;
  title?: string;
}

export function DemoController({ steps, onReset, children, title }: DemoControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const executeStep = useCallback((index: number) => {
    if (index >= steps.length || !isPlayingRef.current) return;

    const step = steps[index];
    timeoutRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;
      step.action();
      stepIndexRef.current = index;
      setCurrentStep(index);
      executeStep(index + 1);
    }, step.delay / speed);
  }, [steps, speed]);

  const handlePlay = useCallback(() => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    const startFrom = stepIndexRef.current + 1;
    if (startFrom >= steps.length) {
      onReset();
      stepIndexRef.current = -1;
      setCurrentStep(-1);
      executeStep(0);
    } else {
      executeStep(startFrom);
    }
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 3000);
  }, [steps, executeStep, onReset]);

  const handlePause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    clearAllTimeouts();
    setIsVisible(true);
  }, [clearAllTimeouts]);

  const handleReset = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    clearAllTimeouts();
    stepIndexRef.current = -1;
    setCurrentStep(-1);
    onReset();
    setIsVisible(true);
  }, [clearAllTimeouts, onReset]);

  const handleMouseMove = useCallback(() => {
    setIsVisible(true);
    if (isPlaying) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [clearAllTimeouts]);

  return (
    <div className="relative h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex flex-col items-center justify-center overflow-hidden" onMouseMove={handleMouseMove}>

      {/* Browser frame mockup */}
      <div className="relative w-[78%] max-w-[1100px]" style={{ height: '82vh' }}>
        {/* Browser chrome / title bar */}
        <div className="bg-[rgb(28,37,69)] rounded-t-xl px-4 py-2 flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>

          {/* URL bar */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white/10 rounded-md px-4 py-1 flex items-center gap-2 max-w-md w-full">
              <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              <span className="text-white/60 text-xs truncate">app.uptotenprep.com{title ? ` — ${title}` : ''}</span>
            </div>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-14" />
        </div>

        {/* Browser content area */}
        <div className="bg-white rounded-b-xl overflow-hidden shadow-2xl border border-gray-200 border-t-0" style={{ height: 'calc(100% - 36px)' }}>
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
        </div>

        {/* Subtle shadow under the frame */}
        <div className="absolute -bottom-4 left-[5%] right-[5%] h-8 bg-black/10 rounded-[50%] blur-xl -z-10" />
      </div>

      {/* Floating control bar — below the frame */}
      <div
        className={`mt-4 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-full shadow-2xl border border-gray-700 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="w-7 h-7 flex items-center justify-center bg-[#00a666] hover:bg-[#008c55] text-white rounded-full transition-colors"
                title="Play"
              >
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-7 h-7 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors"
                title="Pause"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
              title="Reset"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-600" />

            {/* Speed control */}
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
                  speed === s
                    ? 'bg-[#00a666] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s}x
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-gray-600" />

            {/* Step counter */}
            <span className="text-gray-400 text-[10px] px-1">
              {Math.max(0, currentStep + 1)}/{steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
