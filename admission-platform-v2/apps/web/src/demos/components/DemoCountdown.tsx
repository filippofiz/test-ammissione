import { useState, useEffect } from 'react';

export function DemoCountdown({ targetDate, label }: { targetDate: string; label?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="text-center">
      {label && <div className="text-sm text-gray-500 mb-2 font-medium">{label}</div>}
      <div className="flex items-center justify-center gap-2">
        {blocks.map((block, i) => (
          <div key={block.label} className="flex items-center gap-2">
            <div className="bg-gray-900 text-white rounded-lg px-3 py-2 min-w-[52px]">
              <div className="text-2xl font-bold demo-score-text">{String(block.value).padStart(2, '0')}</div>
              <div className="text-[10px] text-gray-400 uppercase">{block.label}</div>
            </div>
            {i < blocks.length - 1 && <span className="text-gray-400 text-xl font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
