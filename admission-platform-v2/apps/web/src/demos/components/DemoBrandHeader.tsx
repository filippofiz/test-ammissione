/**
 * Shared brand header for all demo views
 * Shows logo + title + subtitle, compact for viewport-fit
 */

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'dark' | 'light';
}

export function DemoBrandHeader({ title, subtitle, variant = 'dark' }: BrandHeaderProps) {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-4 px-5 py-3 rounded-xl ${isDark ? 'bg-[rgb(28,37,69)]' : 'bg-white border border-gray-200'}`}>
      <img
        src="/logo_bianco_e_verde.png"
        alt="Up to Ten"
        className="h-8 w-auto"
      />
      <div className="border-l border-white/20 pl-4">
        <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h1>
        {subtitle && (
          <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-gray-500'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
