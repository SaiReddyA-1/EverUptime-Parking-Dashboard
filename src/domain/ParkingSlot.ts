import type { SlotType } from './types';

export class ParkingSlot {
  public readonly slotId: string;
  public readonly slotType: SlotType;
  private parked: boolean;

  constructor(slotId: string, slotType: SlotType, isParked = false) {
    this.slotId = slotId;
    this.slotType = slotType;
    this.parked = isParked;
  }

  public parkVehicle(): void {
    this.parked = true;
  }

  public unparkVehicle(): void {
    this.parked = false;
  }

  public isAvailable(): boolean {
    return !this.parked;
  }

  public get isParked(): boolean {
    return this.parked;
  }

  public get isOccupied(): boolean {
    // Backward-compatible alias for existing UI/status mappings.
    return this.parked;
  }
}
