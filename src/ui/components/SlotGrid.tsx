import { motion } from 'framer-motion';
import type { ParkingStatus } from '../../services/ParkingService';
import type { VehicleType } from '../../domain/types';

interface Props {
  status: ParkingStatus;
  selectedFloors: string[];
  selectedTypes: VehicleType[];
  selectedOccupancies: Array<'AVAILABLE' | 'OCCUPIED'>;
  onFloorToggle: (floorId: string) => void;
  onTypeToggle: (type: VehicleType) => void;
  onOccupancyToggle: (value: 'AVAILABLE' | 'OCCUPIED') => void;
  onQuickExit: (ticketId: string) => void;
}

export const SlotGrid = ({
  status,
  selectedFloors,
  selectedTypes,
  selectedOccupancies,
  onFloorToggle,
  onTypeToggle,
  onOccupancyToggle,
  onQuickExit
}: Props) => {
  const floors = status.floors;
  const visibleFloors =
    selectedFloors.length === 0 ? floors : floors.filter((floor) => selectedFloors.includes(floor.floorId));
  const sortedFloors = [...floors].sort((a, b) => {
    const aSelected = selectedFloors.includes(a.floorId);
    const bSelected = selectedFloors.includes(b.floorId);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
  const typeOptions: VehicleType[] = ['TWO_WHEELER', 'FOUR_WHEELER'];
  const sortedTypes = [...typeOptions].sort((a, b) => {
    const aSelected = selectedTypes.includes(a);
    const bSelected = selectedTypes.includes(b);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });
  const occupancyOptions: Array<'AVAILABLE' | 'OCCUPIED'> = ['AVAILABLE', 'OCCUPIED'];
  const sortedOccupancies = [...occupancyOptions].sort((a, b) => {
    const aSelected = selectedOccupancies.includes(a);
    const bSelected = selectedOccupancies.includes(b);
    if (aSelected === bSelected) return 0;
    return aSelected ? -1 : 1;
  });

  const capsuleBase =
    'rounded-full border px-3 py-1.5 text-xs font-semibold transition';
  const activeCapsule = 'border-cyan-500 bg-cyan-600 text-white';
  const inactiveCapsule =
    'border-slate-300 bg-white/80 text-slate-700 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200';

  return (
    <section className="rounded-2xl border border-white/30 bg-white/25 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
      <div className="mb-4 flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Live Slot Grid</h2>
        <div className="w-full overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 pb-1">
            {sortedFloors.map((floor) => (
              <button
                key={floor.floorId}
                onClick={() => onFloorToggle(floor.floorId)}
                className={`${capsuleBase} ${
                  selectedFloors.includes(floor.floorId) ? activeCapsule : inactiveCapsule
                }`}
              >
                Level {floors.findIndex((value) => value.floorId === floor.floorId)}
              </button>
            ))}
            {sortedTypes.map((type) => (
              <button
                key={type}
                onClick={() => onTypeToggle(type)}
                className={`${capsuleBase} ${selectedTypes.includes(type) ? activeCapsule : inactiveCapsule}`}
              >
                {type === 'TWO_WHEELER' ? 'Two Wheeler' : 'Four Wheeler'}
              </button>
            ))}
            {sortedOccupancies.map((value) => (
              <button
                key={value}
                onClick={() => onOccupancyToggle(value)}
                className={`${capsuleBase} ${
                  selectedOccupancies.includes(value) ? activeCapsule : inactiveCapsule
                }`}
              >
                {value === 'AVAILABLE' ? 'Available' : 'Occupied'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {visibleFloors.map((floor) => (
          <div key={floor.floorId}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              {floor.floorName}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {floor.slots
                .filter((slot) => selectedTypes.length === 0 || selectedTypes.includes(slot.slotType))
                .filter((slot) => {
                  if (selectedOccupancies.length === 0) return true;
                  if (selectedOccupancies.includes('AVAILABLE') && !slot.isOccupied) return true;
                  if (selectedOccupancies.includes('OCCUPIED') && slot.isOccupied) return true;
                  return false;
                })
                .map((slot) => (
                  <motion.div
                    key={slot.slotId}
                    whileHover={{ scale: 1.04, y: -2 }}
                    className={`rounded-xl border p-3 transition-all ${
                      slot.isOccupied
                        ? 'border-red-300 bg-red-500/20 text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200'
                        : 'border-emerald-300 bg-emerald-500/20 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                    }`}
                  >
                    <p className="text-xs font-semibold tracking-wide">{slot.slotId}</p>
                    <p className="mt-1 text-xs opacity-90">{slot.slotType.replace('_', ' ')}</p>
                    <p className="mt-2 text-sm font-semibold">
                      {slot.isOccupied ? 'Occupied' : 'Available'}
                    </p>
                    {slot.isOccupied && slot.activeTicketId ? (
                      <button
                        onClick={() => onQuickExit(slot.activeTicketId as string)}
                        className="mt-2 rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white"
                      >
                        Quick Exit
                      </button>
                    ) : null}
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
