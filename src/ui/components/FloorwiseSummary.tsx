import type { ParkingStatus } from '../../services/ParkingService';

interface Props {
  status: ParkingStatus;
}

export const FloorwiseSummary = ({ status }: Props) => (
  <section className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Floor-wise Availability</h2>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {status.floorSummaries.map((floor, index) => (
        <div
          key={floor.floorId}
          className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Level {index}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{floor.floorName}</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Total Slots: {floor.totalSlots}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-300">Available: {floor.availableSlots}</p>
          <p className="text-xs text-rose-600 dark:text-rose-300">Occupied: {floor.occupiedSlots}</p>
          <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">
            2W: {floor.twoWheelerAvailable}/{floor.twoWheelerTotal}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-200">
            4W: {floor.fourWheelerAvailable}/{floor.fourWheelerTotal}
          </p>
        </div>
      ))}
    </div>
  </section>
);
