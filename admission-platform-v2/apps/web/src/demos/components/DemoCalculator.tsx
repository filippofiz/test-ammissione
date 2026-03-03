interface CalculatorProps {
  isOpen: boolean;
  displayValue: string;
}

export function DemoCalculator({ isOpen, displayValue }: CalculatorProps) {
  if (!isOpen) return null;

  const buttons = [
    ['C', '\u00B1', '%', '\u00F7'],
    ['7', '8', '9', '\u00D7'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', 'DEL', '='],
  ];

  return (
    <div className="demo-animate-scaleIn fixed bottom-20 right-8 z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-4 w-72">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm font-medium">Calculator</span>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Display */}
        <div className="bg-gray-800 rounded-xl px-4 py-3 mb-3 text-right">
          <div className="text-3xl font-bold text-white demo-score-text">{displayValue}</div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.flat().map((btn, i) => {
            const isOperator = ['\u00F7', '\u00D7', '-', '+', '='].includes(btn);
            const isSpecial = ['C', '\u00B1', '%', 'DEL'].includes(btn);
            return (
              <button
                key={i}
                className={`h-12 rounded-xl font-bold text-lg transition-colors
                  ${isOperator ? 'bg-[#00a666] text-white hover:bg-[#008855]' : ''}
                  ${isSpecial ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : ''}
                  ${!isOperator && !isSpecial ? 'bg-gray-800 text-white hover:bg-gray-700' : ''}
                  ${btn === '0' ? 'col-span-1' : ''}`}
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
