import { useEffect, useRef, useState } from 'react';

interface Props {
  onSubmit: (ticketId: string) => void;
  prefilledTicketId?: string | null;
}

export const ExitForm = ({ onSubmit, prefilledTicketId }: Props) => {
  const [ticketId, setTicketId] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<{ detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>> } | null>(null);

  useEffect(() => {
    if (prefilledTicketId) {
      setTicketId(prefilledTicketId);
    }
  }, [prefilledTicketId]);

  const stopScanner = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const parseTicketId = (raw: string): string => {
    const parts = raw.split('|');
    return parts[0]?.trim() || raw.trim();
  };

  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    let cancelled = false;

    const initScanner = async () => {
      try {
        setScannerError(null);
        const BarcodeDetectorClass = (
          window as unknown as {
            BarcodeDetector?: new (options?: { formats?: string[] }) => {
              detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
            };
          }
        ).BarcodeDetector;

        if (!BarcodeDetectorClass) {
          throw new Error('QR scanner is not supported in this browser');
        }

        const video = videoRef.current;
        if (!video) {
          throw new Error('Camera view is not ready. Please retry.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        detectorRef.current = new BarcodeDetectorClass({ formats: ['qr_code'] });

        const scan = async () => {
          if (cancelled) {
            return;
          }

          const detector = detectorRef.current;
          if (!detector || !videoRef.current) {
            return;
          }

          try {
            if (videoRef.current.readyState >= 2) {
              const results = await detector.detect(videoRef.current);
              const rawValue = results[0]?.rawValue;
              if (rawValue) {
                setTicketId(parseTicketId(rawValue));
                setScannerOpen(false);
                stopScanner();
                return;
              }
            }
          } catch {
            // Keep scanning frames; transient detector errors can occur while camera warms up.
          }

          rafRef.current = window.requestAnimationFrame(() => {
            void scan();
          });
        };

        void scan();
      } catch (error) {
        setScannerError(error instanceof Error ? error.message : 'Unable to start QR scanner');
        setScannerOpen(false);
        stopScanner();
      }
    };

    void initScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [scannerOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(ticketId);
    setTicketId('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/30 bg-white/20 p-4 shadow-glass backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/45"
    >
      <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">Vehicle Exit</h2>
      <div className="space-y-2.5">
        <input
          required
          value={ticketId}
          onChange={(event) => setTicketId(event.target.value)}
          placeholder="Ticket ID"
          className="w-full rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-cyan-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 font-semibold text-white shadow-soft transition hover:opacity-95"
        >
          Close Ticket
        </button>
        <button
          type="button"
          onClick={() => {
            if (scannerOpen) {
              setScannerOpen(false);
              stopScanner();
            } else {
              setScannerError(null);
              setScannerOpen(true);
            }
          }}
          className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
        >
          {scannerOpen ? 'Stop QR Scanner' : 'Scan QR for Ticket'}
        </button>
        {scannerError ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-300">{scannerError}</p>
        ) : null}
        {scannerOpen ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-black/80 dark:border-slate-700">
            <video ref={videoRef} muted playsInline className="h-40 w-full object-cover" />
          </div>
        ) : null}
      </div>
    </form>
  );
};
