import type { Ticket } from '../../domain/Ticket';
import { formatDateTime } from '../../utils/date';

interface Props {
  ticket: Ticket | null;
  onClose: () => void;
}

const loadImage = async (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load image'));
    img.src = src;
  });

const createTicketImageBlob = async (ticket: Ticket): Promise<Blob> => {
  const qrText = `${ticket.ticketId}|${ticket.vehicleNumber}|${ticket.floorId}|${ticket.slotId}|${ticket.entryTime.toISOString()}|${ticket.exitTime ? ticket.exitTime.toISOString() : ''}|${ticket.status}`;
  const qrFetchUrl = `https://quickchart.io/qr?size=520&text=${encodeURIComponent(qrText)}`;
  const qrResponse = await fetch(qrFetchUrl);
  if (!qrResponse.ok) {
    throw new Error('Unable to generate QR image');
  }

  const qrBlob = await qrResponse.blob();
  const qrObjectUrl = URL.createObjectURL(qrBlob);
  const qrImage = await loadImage(qrObjectUrl);
  URL.revokeObjectURL(qrObjectUrl);

  const canvas = document.createElement('canvas');
  const width = 1400;
  const height = 1800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to render ticket image');
  }

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 72px Sora, sans-serif';
  ctx.fillText('EverUptime Parking Ticket', 80, 120);

  ctx.font = '500 42px Manrope, sans-serif';
  ctx.fillStyle = '#334155';
  const lines = [
    `ID: ${ticket.ticketId}`,
    `Vehicle: ${ticket.vehicleNumber} (${ticket.vehicleType})`,
    `Floor / Slot: ${ticket.floorId} / ${ticket.slotId}`,
    `Entry: ${formatDateTime(ticket.entryTime)}`,
    `Exit: ${ticket.exitTime ? formatDateTime(ticket.exitTime) : '-'}`,
    `Status: ${ticket.status}`
  ];

  lines.forEach((line, index) => {
    ctx.fillText(line, 80, 230 + index * 78);
  });

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(300, 730, 800, 800);
  ctx.drawImage(qrImage, 340, 770, 720, 720);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 32px Manrope, sans-serif';
  ctx.fillText('Scan QR for ticket verification', 450, 1600);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), 'image/png');
  });

  if (!blob) {
    throw new Error('Unable to export ticket image');
  }

  return blob;
};

export const TicketModal = ({ ticket, onClose }: Props) => {
  if (!ticket) return null;

  const qrText = `${ticket.ticketId}|${ticket.vehicleNumber}|${ticket.floorId}|${ticket.slotId}|${ticket.entryTime.toISOString()}|${ticket.exitTime ? ticket.exitTime.toISOString() : ''}|${ticket.status}`;
  const qrUrl = `https://quickchart.io/qr?size=240&text=${encodeURIComponent(qrText)}`;
  const detailText = `Ticket ${ticket.ticketId}\nVehicle ${ticket.vehicleNumber} (${ticket.vehicleType})\nFloor ${ticket.floorId}\nSlot ${ticket.slotId}\nEntry ${formatDateTime(ticket.entryTime)}\nExit ${ticket.exitTime ? formatDateTime(ticket.exitTime) : '-'}\nStatus ${ticket.status}`;

  const download = async () => {
    const blob = await createTicketImageBlob(ticket);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.ticketId}-ticket.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const blob = await createTicketImageBlob(ticket);
    const file = new File([blob], `${ticket.ticketId}-ticket.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `EverUptime Parking Ticket ${ticket.ticketId}`,
        text: `Ticket ${ticket.ticketId}`,
        files: [file]
      });
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: `EverUptime Parking Ticket ${ticket.ticketId}`,
        text: detailText,
        url: qrUrl
      });
      return;
    }

    await navigator.clipboard.writeText(`${detailText}\nQR: ${qrUrl}`);
    window.alert('Ticket details copied to clipboard');
  };

  const printTicket = async () => {
    const blob = await createTicketImageBlob(ticket);
    const imgUrl = URL.createObjectURL(blob);
    const win = window.open('', '_blank', 'width=640,height=720');
    if (!win) return;
    win.document.write(
      `<html>
        <head><title>EverUptime Parking Ticket ${ticket.ticketId}</title></head>
        <body style="margin:0;padding:20px;display:flex;justify-content:center;">
          <img id="ticket-image" src="${imgUrl}" style="max-width:100%;height:auto;" />
          <script>
            const img = document.getElementById('ticket-image');
            if (img) {
              img.onload = () => {
                setTimeout(() => {
                  window.focus();
                  window.print();
                }, 120);
              };
            }
          </script>
        </body>
      </html>`
    );
    win.document.close();
    setTimeout(() => URL.revokeObjectURL(imgUrl), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/30 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">EverUptime Parking Ticket</h3>
        <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
          <p><strong>ID:</strong> {ticket.ticketId}</p>
          <p><strong>Vehicle:</strong> {ticket.vehicleNumber} ({ticket.vehicleType})</p>
          <p><strong>Floor / Slot:</strong> {ticket.floorId} / {ticket.slotId}</p>
          <p><strong>Entry:</strong> {formatDateTime(ticket.entryTime)}</p>
          <p><strong>Exit:</strong> {ticket.exitTime ? formatDateTime(ticket.exitTime) : '-'}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
        </div>

        <div className="mt-4 flex justify-center">
          <img src={qrUrl} alt="Ticket QR" className="h-48 w-48 rounded-lg border border-slate-200 dark:border-slate-700" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => void share()} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">Share</button>
          <button onClick={() => void download()} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Download Ticket</button>
          <button onClick={() => void printTicket()} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Print</button>
          <button onClick={onClose} className="rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white">Close</button>
        </div>
      </div>
    </div>
  );
};
