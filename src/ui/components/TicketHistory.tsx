import { useEffect, useMemo, useState } from 'react';
import type { Ticket } from '../../domain/Ticket';
import { formatDateTime } from '../../utils/date';

interface Props {
  tickets: Ticket[];
  search: string;
  onSearchChange: (value: string) => void;
  onOpenTicket: (ticket: Ticket) => void;
}

export const TicketHistory = ({ tickets, search, onSearchChange, onOpenTicket }: Props) => {
  const [pageSize, setPageSize] = useState<5 | 10>(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      tickets.filter((ticket) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          ticket.ticketId.toLowerCase().includes(q) ||
          ticket.vehicleNumber.toLowerCase().includes(q) ||
          ticket.slotId.toLowerCase().includes(q)
        );
      }),
    [tickets, search]
  );

  useEffect(() => {
    setPage(1);
  }, [search, tickets.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visible = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <section className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45">
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Ticket History</h2>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value) as 5 | 10)}
            className="rounded-lg border border-slate-200/80 bg-white/80 px-2 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search ticket / vehicle / slot"
            className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 md:w-80 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-300/60 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <th className="px-2 py-2 whitespace-nowrap">Ticket</th>
              <th className="px-2 py-2 whitespace-nowrap">Vehicle</th>
              <th className="px-2 py-2 whitespace-nowrap">Slot</th>
              <th className="px-2 py-2 whitespace-nowrap">Entry</th>
              <th className="px-2 py-2 whitespace-nowrap">Exit</th>
              <th className="px-2 py-2 whitespace-nowrap">Status</th>
              <th className="px-2 py-2 whitespace-nowrap">Ticket</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((ticket) => (
              <tr key={ticket.ticketId} className="border-b border-slate-200/50 dark:border-slate-800">
                <td className="px-2 py-2 font-medium whitespace-nowrap">{ticket.ticketId}</td>
                <td className="px-2 py-2 whitespace-nowrap">{ticket.vehicleNumber}</td>
                <td className="px-2 py-2 whitespace-nowrap">{ticket.floorId} / {ticket.slotId}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatDateTime(ticket.entryTime)}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {ticket.exitTime ? formatDateTime(ticket.exitTime) : '-'}
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      ticket.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => onOpenTicket(ticket)}
                    className="rounded-md bg-cyan-600 px-2 py-1 text-xs font-semibold text-white"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Showing {filtered.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
            className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Prev
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {safePage}/{totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
            className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};
