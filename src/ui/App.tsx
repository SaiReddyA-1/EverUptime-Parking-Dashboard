import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createParkingSystem } from './bootstrap';
import { EntryForm } from './components/EntryForm';
import { ExitForm } from './components/ExitForm';
import { SlotGrid } from './components/SlotGrid';
import { ThemeToggle } from './components/ThemeToggle';
import { TicketHistory } from './components/TicketHistory';
import { ToastStack } from './components/ToastStack';
import { AdmitPanel } from './components/AdmitPanel';
import { FloorwiseSummary } from './components/FloorwiseSummary';
import { TicketModal } from './components/TicketModal';
import type { ToastMessage } from './types';
import type { Ticket } from '../domain/Ticket';
import type { VehicleType } from '../domain/types';
import { formatDateTime, formatDuration } from '../utils/date';

const system = createParkingSystem();
const THEME_STORAGE_KEY = 'everuptime-theme-v1';

type AppTheme = 'light' | 'dark' | 'aurora';

const themeOrder: AppTheme[] = ['light', 'dark', 'aurora'];

const initialTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' || stored === 'aurora' ? stored : 'light';
};

const makeToast = (type: ToastMessage['type'], text: string): ToastMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  text
});

const App = () => {
  const [status, setStatus] = useState(system.parkingController.getParkingStatus());
  const [tickets, setTickets] = useState(system.ticketController.getAllTickets());
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<VehicleType[]>([]);
  const [selectedOccupancies, setSelectedOccupancies] = useState<Array<'AVAILABLE' | 'OCCUPIED'>>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [entryMessage, setEntryMessage] = useState<string>('');
  const [exitMessage, setExitMessage] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<AppTheme>(initialTheme);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');
  const [latestTicket, setLatestTicket] = useState<Ticket | null>(null);
  const [lastEntryTicket, setLastEntryTicket] = useState<Ticket | null>(null);
  const [latestOperationType, setLatestOperationType] = useState<'ENTRY' | 'EXIT' | null>(null);
  const [quickExitTicketId, setQuickExitTicketId] = useState<string | null>(null);

  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('0000');
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const next = themeOrder[(currentIndex + 1) % themeOrder.length] ?? 'light';
    setTheme(next);
  };

  const pushToast = (toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 2600);
  };

  const refresh = () => {
    setStatus(system.parkingController.getParkingStatus());
    setTickets(system.ticketController.getAllTickets());
  };

  const onVehicleEntry = (
    vehicleNumber: string,
    vehicleType: VehicleType,
    preferredFloorId: string | null
  ) => {
    try {
      if (!vehicleNumber.trim()) {
        throw new Error('Vehicle number is required');
      }
      const ticket = system.parkingController.entryVehicle(vehicleNumber, vehicleType, preferredFloorId);
      setLatestTicket(ticket);
      setLastEntryTicket(ticket);
      setLatestOperationType('ENTRY');
      setEntryMessage(
        `Ticket ${ticket.ticketId} | Floor ${ticket.floorId} | Slot ${ticket.slotId} | ${formatDateTime(ticket.entryTime)}`
      );
      setExitMessage('');
      pushToast(makeToast('success', `Entry successful: ${ticket.ticketId}`));
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Entry failed';
      pushToast(makeToast('error', message));
    }
  };

  const onVehicleExit = (ticketId: string) => {
    try {
      const response = system.parkingController.exitVehicle(ticketId.trim());
      setQuickExitTicketId(null);
      setLatestOperationType('EXIT');
      setLastEntryTicket(null);
      const duration = response.exitTime ? formatDuration(response.entryTime, response.exitTime) : '0h 0m 0s';
      setExitMessage(
        `Exit done for ${response.ticketId} | Floor ${response.floorId} | Slot ${response.slotId} | Duration ${duration}`
      );
      setEntryMessage('');
      pushToast(makeToast('success', `Exit successful: ${response.ticketId}`));
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Exit failed';
      pushToast(makeToast('error', message));
    }
  };

  const onQuickExit = (ticketId: string) => {
    setQuickExitTicketId(ticketId);
    pushToast(makeToast('success', `Ticket selected for quick exit: ${ticketId}`));
  };

  const toggleInList = <T,>(items: T[], value: T): T[] =>
    items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

  const onAdmitFloor = (floorName: string, twoWheelerSlots: number, fourWheelerSlots: number) => {
    try {
      const floor = system.admitController.admitFloor(floorName, twoWheelerSlots, fourWheelerSlots);
      pushToast(makeToast('success', `Floor added: ${floor.floorName} (${floor.floorId})`));
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Admin action failed';
      pushToast(makeToast('error', message));
    }
  };

  const onUpdateFloor = (
    floorId: string,
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number
  ) => {
    try {
      system.admitController.updateFloor(floorId, floorName, twoWheelerSlots, fourWheelerSlots);
      pushToast(makeToast('success', `Floor updated: ${floorName}`));
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      pushToast(makeToast('error', message));
    }
  };

  const onDeleteFloor = (floorId: string) => {
    try {
      system.admitController.deleteFloor(floorId);
      pushToast(makeToast('success', 'Floor deleted'));
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      pushToast(makeToast('error', message));
    }
  };

  const logoutAdmin = () => {
    setAdminUnlocked(false);
    setActiveTab('dashboard');
    pushToast(makeToast('success', 'Admin logged out'));
  };

  const sortedTickets = useMemo(
    () => [...tickets].sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime()),
    [tickets]
  );

  const loginAdmin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminUsername === 'admin' && adminPassword === '0000') {
      setAdminUnlocked(true);
      pushToast(makeToast('success', 'Admin access granted'));
      return;
    }

    pushToast(makeToast('error', 'Invalid admin credentials'));
  };

  return (
    <div className="app-shell min-h-screen bg-slate-100 font-body text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.15),_transparent_42%)]" />
      <ToastStack toasts={toasts} />
      <TicketModal ticket={latestTicket} onClose={() => setLatestTicket(null)} />

      <div className="relative mx-auto max-w-[1180px] px-4 py-5 sm:px-5 lg:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Parking Management System
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold md:text-3xl">EverUptime Parking Dashboard</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === 'dashboard'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/70 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === 'admin'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/70 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={cycleTheme} />
            {activeTab === 'admin' && adminUnlocked ? (
              <button
                onClick={logoutAdmin}
                className="rounded-lg border border-rose-300 bg-white/75 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-900/30"
              >
                Logout
              </button>
            ) : null}
          </div>
        </motion.header>

        {activeTab === 'dashboard' ? (
          <>
            <div className="mb-3 rounded-2xl border border-white/30 bg-white/25 p-3 text-sm shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  <strong>Total Slots:</strong> {status.totalSlots}
                </span>
                <span>
                  <strong>Available:</strong> {status.availableSlots}
                </span>
                <span>
                  <strong>Occupied:</strong> {status.occupiedSlots}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
              <EntryForm
                floors={status.floorSummaries.map((floor) => ({
                  floorId: floor.floorId,
                  floorName: floor.floorName,
                  twoWheelerAvailable: floor.twoWheelerAvailable,
                  fourWheelerAvailable: floor.fourWheelerAvailable
                }))}
                onSubmit={onVehicleEntry}
              />
              <ExitForm onSubmit={onVehicleExit} prefilledTicketId={quickExitTicketId} />
              <div className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
                <h2 className="mb-2 text-base font-semibold">Vehicle Type Summary</h2>
                <p className="text-sm">
                  <strong>Two Wheeler</strong>
                </p>
                <p className="text-sm">Available: {status.availableByType.TWO_WHEELER}</p>
                <p className="text-sm">Occupied: {status.occupiedByType.TWO_WHEELER}</p>
                <p className="mt-2 text-sm">
                  <strong>Four Wheeler</strong>
                </p>
                <p className="text-sm">Available: {status.availableByType.FOUR_WHEELER}</p>
                <p className="text-sm">Occupied: {status.occupiedByType.FOUR_WHEELER}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Latest Operation</h2>
                {latestOperationType === 'ENTRY' && lastEntryTicket ? (
                  <button
                    onClick={() => setLatestTicket(lastEntryTicket)}
                    className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Open Share Card
                  </button>
                ) : null}
              </div>
              <p className="mt-3 min-h-8 text-sm text-slate-700 dark:text-slate-200">
                {entryMessage || exitMessage || 'No operation yet'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.65fr_1fr]">
              <div className="space-y-3">
                <TicketHistory
                  tickets={sortedTickets}
                  search={ticketSearch}
                  onSearchChange={setTicketSearch}
                  onOpenTicket={setLatestTicket}
                />
                <SlotGrid
                  status={status}
                  selectedFloors={selectedFloors}
                  selectedTypes={selectedTypes}
                  selectedOccupancies={selectedOccupancies}
                  onFloorToggle={(floorId) => setSelectedFloors((prev) => toggleInList(prev, floorId))}
                  onTypeToggle={(type) => setSelectedTypes((prev) => toggleInList(prev, type))}
                  onOccupancyToggle={(value) =>
                    setSelectedOccupancies((prev) => toggleInList(prev, value))
                  }
                  onQuickExit={onQuickExit}
                />
              </div>

              <div>
                <FloorwiseSummary status={status} />
              </div>
            </div>
          </>
        ) : adminUnlocked ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdmitPanel
              status={status}
              onSubmit={onAdmitFloor}
              onUpdate={onUpdateFloor}
              onDelete={onDeleteFloor}
            />
            <FloorwiseSummary status={status} />
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-white/30 bg-white/35 p-6 shadow-glass backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/60">
            <h2 className="text-xl font-semibold">Admin Login</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Default credentials: `admin` / `0000`</p>
            <form className="mt-4 space-y-3" onSubmit={loginAdmin}>
              <input
                value={adminUsername}
                onChange={(event) => setAdminUsername(event.target.value)}
                className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">Login</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
