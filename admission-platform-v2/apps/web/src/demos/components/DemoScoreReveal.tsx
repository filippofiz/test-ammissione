import { useState, useEffect, useRef } from 'react';

interface ScoreRevealProps {
  targetScore: number;
  isAnimating: boolean;
  label?: string;
  size?: 'md' | 'lg' | 'xl';
}

export function DemoScoreReveal({ targetScore, isAnimating, label = 'Your Score', size = 'xl' }: ScoreRevealProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!isAnimating) {
      setDisplayScore(0);
      return;
    }

    const duration = 2000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * targetScore));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isAnimating, targetScore]);

  const sizeClasses = {
    md: 'text-5xl w-32 h-32',
    lg: 'text-7xl w-44 h-44',
    xl: 'text-8xl w-56 h-56',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-[#00a666] to-emerald-400';
    if (score >= 60) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</div>
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getScoreColor(targetScore)}
          flex items-center justify-center shadow-2xl ${isAnimating ? 'demo-animate-pulseGlow' : ''}`}
      >
        <span className="font-bold text-white demo-score-text">
          {displayScore}%
        </span>
      </div>
      {isAnimating && displayScore === targetScore && (
        <div className="demo-animate-fadeInUp text-lg font-semibold text-[#00a666]">
          Excellent Performance!
        </div>
      )}
    </div>
  );
}
