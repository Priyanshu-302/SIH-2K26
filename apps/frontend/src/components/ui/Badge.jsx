import React from 'react';
import clsx from 'clsx';

export function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    high: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-rose-100 text-rose-800 border-rose-300',
    info: 'bg-sky-100 text-sky-800 border-sky-300',
    success: 'bg-ayur-100 text-ayur-800 border-ayur-300',
    neutral: 'bg-sage-100 text-slate-700 border-sage-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider',
        variants[variant] || variants.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
