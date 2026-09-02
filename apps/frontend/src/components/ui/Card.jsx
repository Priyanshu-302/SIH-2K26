import React from 'react';
import clsx from 'clsx';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'light-card rounded-2xl p-5 border border-sage-100 transition-all duration-200',
        hover && 'hover:border-ayur-300 hover:shadow-elevated hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
