import { ParkingSlot } from "./ParkingSlot";
import type { SlotType } from "./types";

export class Floor {
  public readonly floorId: string;
  public readonly floorName: string;
  private readonly slots: ParkingSlot[];

  constructor(floorId: string, floorName: string) {
    this.floorId = floorId;
    this.floorName = floorName;
    this.slots = [];
  }

  public addSlot(slot: ParkingSlot): void {
    this.slots.push(slot);
  }

  public getSlots(): ParkingSlot[] {
    return [...this.slots];
  }

  public getSlotById(slotId: string): ParkingSlot | undefined {
    return this.slots.find((slot) => slot.slotId === slotId);
  }

  public findAvailableSlot(slotType: SlotType): ParkingSlot | undefined {
    return this.slots.find(
      (slot) => slot.slotType === slotType && slot.isAvailable(),
    );
  }

  public getAvailableSlots(slotType?: SlotType): ParkingSlot[] {
    return this.slots.filter((slot) => {
      if (!slot.isAvailable()) return false;
      if (!slotType) return true;
      return slot.slotType === slotType;
    });
  }

  public parkVehicleInSlot(slotId: string): ParkingSlot | undefined {
    const slot = this.getSlotById(slotId);
    if (!slot) return undefined;
    slot.parkVehicle();
    return slot;
  }

  public unparkVehicleFromSlot(slotId: string): ParkingSlot | undefined {
    const slot = this.getSlotById(slotId);
    if (!slot) return undefined;
    slot.unparkVehicle();
    return slot;
  }
}
