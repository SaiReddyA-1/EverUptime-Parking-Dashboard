import type { SlotType } from './types';

export class ParkingSlot {
  public readonly slotId: string;
  public readonly slotType: SlotType;
  private occupied: boolean;

  constructor(slotId: string, slotType: SlotType, isOccupied = false) {
    this.slotId = slotId;
    this.slotType = slotType;
    this.occupied = isOccupied;
  }

  public occupy(): void {
    this.occupied = true;
  }

  public release(): void {
    this.occupied = false;
  }

  public isAvailable(): boolean {
    return !this.occupied;
  }

  public get isOccupied(): boolean {
    return this.occupied;
  }
}
