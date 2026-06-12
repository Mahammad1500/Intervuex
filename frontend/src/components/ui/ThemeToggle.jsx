import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import { cn } from '../../lib/utils';

export default function ThemeToggle({ className, size = 'md' }) {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const sizes = {
    sm: { track: 'h-8 w-[4.25rem]', knob: 'w-6 h-6', icon: 'w-3.5 h-3.5', pad: 'p-0.5' },
    md: { track: 'h-9 w-[4.75rem]', knob: 'w-7 h-7', icon: 'w-4 h-4', pad: 'p-1' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={cn('inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700', s.pad, className)}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={!isDark}
        title="Light mode"
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full transition-colors',
          s.knob,
          !isDark ? 'text-amber-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        )}
      >
        <Sun className={s.icon} strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={isDark}
        title="Dark mode"
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full transition-colors',
          s.knob,
          isDark ? 'text-brand-300 bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        )}
      >
        <Moon className={s.icon} strokeWidth={2.25} />
      </button>
    </div>
  );
}

/** Compact icon button — cycles theme (for tight headers) */
export function ThemeToggleIcon({ className }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors',
        className
      )}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </motion.button>
  );
}
