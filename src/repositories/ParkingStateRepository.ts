import type { SlotType, TicketStatus, VehicleType } from '../domain/types';

export interface PersistedFloorSlot {
  slotId: string;
  slotType: SlotType;
  isOccupied: boolean;
}

export interface PersistedFloor {
  floorId: string;
  floorName: string;
  slots: PersistedFloorSlot[];
}

export interface PersistedTicket {
  ticketId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  buildingId: string;
  floorId: string;
  slotId: string;
  entryTime: string;
  exitTime: string | null;
  status: TicketStatus;
}

export interface PersistedParkingState {
  buildingId: string;
  buildingName: string;
  floors: PersistedFloor[];
  tickets: PersistedTicket[];
  ticketSequence: number;
}

export interface IParkingStateRepository {
  load(): PersistedParkingState | null;
  save(state: PersistedParkingState): void;
}

export class LocalStorageParkingStateRepository implements IParkingStateRepository {
  constructor(private readonly storageKey: string) {}

  public load(): PersistedParkingState | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as PersistedParkingState;
    } catch {
      return null;
    }
  }

  public save(state: PersistedParkingState): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
}
