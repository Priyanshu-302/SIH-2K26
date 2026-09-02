import React from 'react';
import clsx from 'clsx';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ayur-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer';

    const variants = {
      primary:
        'bg-ayur-700 hover:bg-ayur-800 text-white shadow-soft-card focus:ring-ayur-600 border border-ayur-800/20',
      secondary:
        'bg-sage-100 hover:bg-sage-200 text-slate-800 border border-sage-200 focus:ring-sage-400',
      outline:
        'bg-white hover:bg-sage-50 text-slate-700 border border-sage-200 shadow-sm focus:ring-sage-400',
      ghost:
        'bg-transparent hover:bg-sage-100/60 text-slate-600 hover:text-slate-900 focus:ring-sage-300',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 border border-rose-600/30',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
