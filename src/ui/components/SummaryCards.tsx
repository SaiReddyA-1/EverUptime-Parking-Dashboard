import { motion } from 'framer-motion';
import type { ParkingStatus } from '../../services/ParkingService';

interface Props {
  status: ParkingStatus;
  loading: boolean;
}

const cards = [
  { key: 'totalSlots', label: 'Total Slots', accent: 'from-cyan-400 to-blue-500' },
  { key: 'availableSlots', label: 'Available', accent: 'from-emerald-400 to-teal-500' },
  { key: 'occupiedSlots', label: 'Occupied', accent: 'from-rose-400 to-red-500' }
] as const;

export const SummaryCards = ({ status, loading }: Props) => {
  const values = {
    totalSlots: status.totalSlots,
    availableSlots: status.availableSlots,
    occupiedSlots: status.occupiedSlots
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/50"
          >
            <div className={`mb-2 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
            <p className="text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            {loading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-300/60 dark:bg-slate-700/70" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{values[card.key]}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/50">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Two Wheeler
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Available: <span className="font-semibold">{status.availableByType.TWO_WHEELER}</span>
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Occupied: <span className="font-semibold">{status.occupiedByType.TWO_WHEELER}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/50">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Four Wheeler
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Available: <span className="font-semibold">{status.availableByType.FOUR_WHEELER}</span>
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Occupied: <span className="font-semibold">{status.occupiedByType.FOUR_WHEELER}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
