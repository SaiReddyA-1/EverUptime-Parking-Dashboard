import { useMemo, useState } from 'react';
import type { VehicleType } from '../../domain/types';

interface FloorOption {
  floorId: string;
  floorName: string;
  twoWheelerAvailable: number;
  fourWheelerAvailable: number;
}

interface Props {
  floors: FloorOption[];
  onSubmit: (vehicleNumber: string, vehicleType: VehicleType, preferredFloorId: string | null) => void;
}

export const EntryForm = ({ floors, onSubmit }: Props) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('FOUR_WHEELER');
  const [preferredFloorId, setPreferredFloorId] = useState<string>('ANY');

  const availableFloors = useMemo(
    () =>
      floors.filter((floor) =>
        vehicleType === 'FOUR_WHEELER' ? floor.fourWheelerAvailable > 0 : floor.twoWheelerAvailable > 0
      ),
    [floors, vehicleType]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(vehicleNumber, vehicleType, preferredFloorId === 'ANY' ? null : preferredFloorId);
    setVehicleNumber('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45"
    >
      <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Vehicle Entry</h2>
      <div className="space-y-2.5">
        <input
          required
          value={vehicleNumber}
          onChange={(event) => setVehicleNumber(event.target.value)}
          placeholder="Vehicle Number"
          className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <select
          value={vehicleType}
          onChange={(event) => setVehicleType(event.target.value as VehicleType)}
          className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="FOUR_WHEELER">Four Wheeler</option>
          <option value="TWO_WHEELER">Two Wheeler</option>
        </select>
        <select
          value={preferredFloorId}
          onChange={(event) => setPreferredFloorId(event.target.value)}
          className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          <option value="ANY">Any Available Floor</option>
          {availableFloors.map((floor, index) => (
            <option key={floor.floorId} value={floor.floorId}>
              Level {index} - {floor.floorName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 font-semibold text-white shadow-soft transition hover:opacity-95"
        >
          Generate Ticket
        </button>
      </div>
    </form>
  );
};
