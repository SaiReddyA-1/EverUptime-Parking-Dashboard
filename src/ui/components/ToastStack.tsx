import { AnimatePresence, motion } from 'framer-motion';
import type { ToastMessage } from '../types';

interface Props {
  toasts: ToastMessage[];
}

export const ToastStack = ({ toasts }: Props) => (
  <div className="fixed right-4 top-4 z-50 space-y-2">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-soft backdrop-blur ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-100/85 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-100'
              : 'border-red-200 bg-red-100/85 text-red-900 dark:border-red-700 dark:bg-red-900/70 dark:text-red-100'
          }`}
        >
          {toast.text}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
