import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-2', { 'w-full': fullWidth })}>
        {label && (
          <label className="block font-semibold text-sm text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'px-4 py-3 rounded-lg border-2 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'min-h-[48px]', // Touch-friendly
            {
              'border-gray-300': !error,
              'border-red-500 focus:ring-red-500 focus:border-red-500': error,
              'w-full': fullWidth,
            },
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
