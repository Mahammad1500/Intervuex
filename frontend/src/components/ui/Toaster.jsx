import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const useToastStore = create((set, get) => ({
  toasts: [],
  add: (toast) => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
    setTimeout(() => get().remove(id), toast.duration || 4000);
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const BG = {
  success: 'border-emerald-100 bg-emerald-50/80',
  error: 'border-red-100 bg-red-50/80',
  warning: 'border-amber-100 bg-amber-50/80',
  info: 'border-blue-100 bg-blue-50/80',
};

export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-card backdrop-blur-sm',
              BG[t.type || 'info']
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{ICONS[t.type || 'info']}</div>
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold text-slate-800">{t.title}</p>}
              {t.message && <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200/60 transition-colors mt-0.5">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const toast = {
  success: (message, title) => useToastStore.getState().add({ type: 'success', message, title }),
  error: (message, title) => useToastStore.getState().add({ type: 'error', message, title }),
  warning: (message, title) => useToastStore.getState().add({ type: 'warning', message, title }),
  info: (message, title) => useToastStore.getState().add({ type: 'info', message, title }),
};

export default useToastStore;
