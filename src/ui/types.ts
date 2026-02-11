import type { Ticket } from '../domain/Ticket';
import type { VehicleType } from '../domain/types';
import type { ParkingStatus } from '../services/ParkingService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

export interface EntryResult {
  ticketId: string;
  slotId: string;
  floorId: string;
  entryTime: Date;
}

export interface ExitResult {
  ticketId: string;
  slotId: string;
  floorId: string;
  duration: string;
}

export interface AppViewModel {
  status: ParkingStatus;
  tickets: Ticket[];
  selectedFloor: string;
  selectedType: VehicleType | 'ALL';
  ticketSearch: string;
  loading: boolean;
  theme: 'light' | 'dark';
  entryResult: EntryResult | null;
  exitResult: ExitResult | null;
  toasts: ToastMessage[];
}
