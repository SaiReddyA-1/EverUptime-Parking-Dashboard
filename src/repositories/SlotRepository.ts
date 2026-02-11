import { Floor } from '../domain/Floor';
import { ParkingSlot } from '../domain/ParkingSlot';
import type { SlotType } from '../domain/types';

export interface ISlotRepository {
  seedFromFloors(floors: Floor[]): void;
  findAvailableSlot(slotType: SlotType): { floor: Floor; slot: ParkingSlot } | null;
  findAvailableSlotInFloor(floorId: string, slotType: SlotType): { floor: Floor; slot: ParkingSlot } | null;
  getSlotById(slotId: string): { floor: Floor; slot: ParkingSlot } | null;
  getAllSlots(): Array<{ floor: Floor; slot: ParkingSlot }>;
}

export class InMemorySlotRepository implements ISlotRepository {
  private readonly floorSlotMap = new Map<string, Array<{ floor: Floor; slot: ParkingSlot }>>();
  private readonly slotIdMap = new Map<string, { floor: Floor; slot: ParkingSlot }>();

  public seedFromFloors(floors: Floor[]): void {
    this.floorSlotMap.clear();
    this.slotIdMap.clear();

    floors.forEach((floor) => {
      const pairs = floor.getSlots().map((slot) => ({ floor, slot }));
      this.floorSlotMap.set(floor.floorId, pairs);
      pairs.forEach((pair) => {
        this.slotIdMap.set(pair.slot.slotId, pair);
      });
    });
  }

  public findAvailableSlot(slotType: SlotType): { floor: Floor; slot: ParkingSlot } | null {
    for (const floorSlots of this.floorSlotMap.values()) {
      const found = floorSlots.find((pair) => pair.slot.slotType === slotType && pair.slot.isAvailable());
      if (found) {
        return found;
      }
    }
    return null;
  }

  public findAvailableSlotInFloor(
    floorId: string,
    slotType: SlotType
  ): { floor: Floor; slot: ParkingSlot } | null {
    const floorSlots = this.floorSlotMap.get(floorId) ?? [];
    const found = floorSlots.find((pair) => pair.slot.slotType === slotType && pair.slot.isAvailable());
    return found ?? null;
  }

  public getSlotById(slotId: string): { floor: Floor; slot: ParkingSlot } | null {
    return this.slotIdMap.get(slotId) ?? null;
  }

  public getAllSlots(): Array<{ floor: Floor; slot: ParkingSlot }> {
    return Array.from(this.slotIdMap.values());
  }
}
