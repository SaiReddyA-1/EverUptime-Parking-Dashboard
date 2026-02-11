import { useMemo, useState } from 'react';
import type { ParkingStatus } from '../../services/ParkingService';

interface Props {
  status: ParkingStatus;
  onSubmit: (floorName: string, twoWheelerSlots: number, fourWheelerSlots: number) => void;
  onUpdate: (floorId: string, floorName: string, twoWheelerSlots: number, fourWheelerSlots: number) => void;
  onDelete: (floorId: string) => void;
}

export const AdmitPanel = ({ status, onSubmit, onUpdate, onDelete }: Props) => {
  const [floorName, setFloorName] = useState('');
  const [twoWheelerSlots, setTwoWheelerSlots] = useState<string>('0');
  const [fourWheelerSlots, setFourWheelerSlots] = useState<string>('0');

  const [editFloorId, setEditFloorId] = useState<string | null>(null);
  const [editFloorName, setEditFloorName] = useState('');
  const [editTwoSlots, setEditTwoSlots] = useState('0');
  const [editFourSlots, setEditFourSlots] = useState('0');
  const [deleteFloorId, setDeleteFloorId] = useState<string | null>(null);

  const deleteCandidate = useMemo(
    () => status.floorSummaries.find((floor) => floor.floorId === deleteFloorId) ?? null,
    [deleteFloorId, status.floorSummaries]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(floorName, Number.parseInt(twoWheelerSlots, 10), Number.parseInt(fourWheelerSlots, 10));
    setFloorName('');
    setTwoWheelerSlots('0');
    setFourWheelerSlots('0');
  };

  const startEdit = (floorId: string) => {
    const floor = status.floorSummaries.find((item) => item.floorId === floorId);
    if (!floor) return;
    setEditFloorId(floor.floorId);
    setEditFloorName(floor.floorName);
    setEditTwoSlots(String(floor.twoWheelerTotal));
    setEditFourSlots(String(floor.fourWheelerTotal));
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editFloorId) return;
    onUpdate(editFloorId, editFloorName, Number.parseInt(editTwoSlots, 10), Number.parseInt(editFourSlots, 10));
    setEditFloorId(null);
  };

  return (
    <section className="rounded-2xl border border-white/30 bg-white/25 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
      <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Admin Floor Setup</h2>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="floor-name" className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Floor Name
          </label>
          <input
            id="floor-name"
            type="text"
            required
            value={floorName}
            onChange={(event) => setFloorName(event.target.value)}
            placeholder="e.g. Premium Deck"
            className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="two-wheeler-slots" className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Two Wheeler Slots
            </label>
            <input
              id="two-wheeler-slots"
              type="number"
              min={0}
              step={1}
              required
              value={twoWheelerSlots}
              onChange={(event) => setTwoWheelerSlots(event.target.value)}
              className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="four-wheeler-slots" className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Four Wheeler Slots
            </label>
            <input
              id="four-wheeler-slots"
              type="number"
              min={0}
              step={1}
              required
              value={fourWheelerSlots}
              onChange={(event) => setFourWheelerSlots(event.target.value)}
              className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-2 font-semibold text-white shadow-soft transition hover:opacity-95"
        >
          Add Floor
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Manage Floors</h3>
        {status.floorSummaries.map((floor, index) => (
          <div key={floor.floorId} className="rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Level {index} - {floor.floorName}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">2W: {floor.twoWheelerTotal} | 4W: {floor.fourWheelerTotal}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => startEdit(floor.floorId)}
                className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white"
              >
                Modify
              </button>
              <button
                onClick={() => setDeleteFloorId(floor.floorId)}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editFloorId && (
        <form onSubmit={saveEdit} className="mt-6 space-y-3 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-sm font-semibold">Modify Floor</p>
          <input
            type="text"
            value={editFloorName}
            onChange={(event) => setEditFloorName(event.target.value)}
            className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={editTwoSlots}
              onChange={(event) => setEditTwoSlots(event.target.value)}
              className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <input
              type="number"
              min={0}
              step={1}
              value={editFourSlots}
              onChange={(event) => setEditFourSlots(event.target.value)}
              className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Save</button>
            <button type="button" onClick={() => setEditFloorId(null)} className="rounded-lg bg-slate-500 px-3 py-2 text-xs font-semibold text-white">Cancel</button>
          </div>
        </form>
      )}

      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h4 className="text-lg font-semibold">Delete Floor</h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete {deleteCandidate.floorName}? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg bg-slate-500 px-3 py-2 text-sm font-semibold text-white" onClick={() => setDeleteFloorId(null)}>
                Cancel
              </button>
              <button
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  onDelete(deleteCandidate.floorId);
                  setDeleteFloorId(null);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
