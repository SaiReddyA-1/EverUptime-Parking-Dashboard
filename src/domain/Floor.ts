import { ParkingSlot } from './ParkingSlot';

export class Floor {
  public readonly floorId: string;
  public readonly floorName: string;
  private readonly slots: ParkingSlot[];

  constructor(floorId: string, floorName: string, slots: ParkingSlot[] = []) {
    this.floorId = floorId;
    this.floorName = floorName;
    this.slots = [...slots];
  }

  public addSlot(slot: ParkingSlot): void {
    this.slots.push(slot);
  }

  public getSlots(): ParkingSlot[] {
    return [...this.slots];
  }
}
