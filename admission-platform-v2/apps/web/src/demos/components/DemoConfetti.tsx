import { useEffect, useState } from 'react';

const COLORS = ['#00a666', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981'];

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
  shape: 'square' | 'circle' | 'triangle';
}

export function DemoConfetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 1.5,
        size: 6 + Math.random() * 10,
        shape: (['square', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
      }));
      setPieces(newPieces);
    } else {
      setPieces([]);
    }
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="demo-confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.shape !== 'triangle' ? piece.color : 'transparent',
            borderRadius: piece.shape === 'circle' ? '50%' : '0',
            borderLeft: piece.shape === 'triangle' ? `${piece.size / 2}px solid transparent` : undefined,
            borderRight: piece.shape === 'triangle' ? `${piece.size / 2}px solid transparent` : undefined,
            borderBottom: piece.shape === 'triangle' ? `${piece.size}px solid ${piece.color}` : undefined,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
