import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ className, label, error, icon: Icon, hint, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'transition-all duration-150',
            'disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed',
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const Select = forwardRef(({ className, label, error, children, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'w-full h-10 rounded-xl border bg-white px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
        'transition-all duration-150 cursor-pointer',
        error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export const Textarea = forwardRef(({ className, label, error, hint, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
        'transition-all duration-150',
        error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
