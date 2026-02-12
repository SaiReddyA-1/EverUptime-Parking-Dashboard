import { Floor } from "./Floor";
import { ParkingSlot } from "./ParkingSlot";
import type { SlotType } from "./types";

export class Building {
  public readonly id: string;
  public readonly name: string;
  private readonly floors: Floor[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.floors = [];
  }

  public addFloor(floor: Floor): void {
    this.floors.push(floor);
  }

  public getFloors(): Floor[] {
    return [...this.floors];
  }

  public getFloorById(floorId: string): Floor | undefined {
    return this.floors.find((floor) => floor.floorId === floorId);
  }

  public findAvailableSlot(
    slotType: SlotType,
    preferredFloorId?: string | null,
  ): { floor: Floor; slot: ParkingSlot } | null {
    if (preferredFloorId) {
      const floor = this.getFloorById(preferredFloorId);
      if (!floor) return null;
      const slot = floor.findAvailableSlot(slotType);
      return slot ? { floor, slot } : null;
    }

    for (const floor of this.floors) {
      const slot = floor.findAvailableSlot(slotType);
      if (slot) {
        return { floor, slot };
      }
    }

    return null;
  }

  public parkVehicleInSlot(
    floorId: string,
    slotId: string,
  ): ParkingSlot | null {
    const floor = this.getFloorById(floorId);
    if (!floor) return null;
    return floor.parkVehicleInSlot(slotId) ?? null;
  }

  public unparkVehicleFromSlot(
    floorId: string,
    slotId: string,
  ): ParkingSlot | null {
    const floor = this.getFloorById(floorId);
    if (!floor) return null;
    return floor.unparkVehicleFromSlot(slotId) ?? null;
  }

  public getTotalSlots(): number {
    return this.floors.reduce(
      (total, floor) => total + floor.getSlots().length,
      0,
    );
  }

  public getAvailableSlotCount(slotType?: SlotType): number {
    return this.floors.reduce(
      (total, floor) => total + floor.getAvailableSlots(slotType).length,
      0,
    );
  }

  public getOccupiedSlotCount(slotType?: SlotType): number {
    const totalSlots = slotType
      ? this.floors.reduce(
          (total, floor) =>
            total +
            floor.getSlots().filter((slot) => slot.slotType === slotType)
              .length,
          0,
        )
      : this.getTotalSlots();

    return totalSlots - this.getAvailableSlotCount(slotType);
  }

  public admitFloor(
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number,
  ): Floor {
    this.validateFloorInput(floorName, twoWheelerSlots, fourWheelerSlots);
    const floorId = this.generateNextFloorId();
    const floor = new Floor(floorId, floorName.trim());

    for (let index = 1; index <= twoWheelerSlots; index += 1) {
      floor.addSlot(
        new ParkingSlot(
          `${floorId}-TW-${String(index).padStart(2, "0")}`,
          "TWO_WHEELER",
        ),
      );
    }

    for (let index = 1; index <= fourWheelerSlots; index += 1) {
      floor.addSlot(
        new ParkingSlot(
          `${floorId}-FW-${String(index).padStart(2, "0")}`,
          "FOUR_WHEELER",
        ),
      );
    }

    this.floors.push(floor);
    return floor;
  }

  public updateFloor(
    floorId: string,
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number,
  ): Floor {
    this.validateFloorInput(floorName, twoWheelerSlots, fourWheelerSlots);
    const currentFloor = this.getFloorById(floorId);
    if (!currentFloor) {
      throw new Error("Floor not found");
    }

    const currentSlots = currentFloor.getSlots();
    const currentTw = currentSlots.filter(
      (slot) => slot.slotType === "TWO_WHEELER",
    );
    const currentFw = currentSlots.filter(
      (slot) => slot.slotType === "FOUR_WHEELER",
    );
    const occupiedTw = currentTw.filter((slot) => slot.isOccupied).length;
    const occupiedFw = currentFw.filter((slot) => slot.isOccupied).length;

    if (twoWheelerSlots < occupiedTw) {
      throw new Error(
        "Two wheeler slots cannot be less than occupied two wheeler slots",
      );
    }
    if (fourWheelerSlots < occupiedFw) {
      throw new Error(
        "Four wheeler slots cannot be less than occupied four wheeler slots",
      );
    }

    const nextFloor = new Floor(floorId, floorName.trim());
    this.buildUpdatedSlots(nextFloor, currentTw, twoWheelerSlots, "TW");
    this.buildUpdatedSlots(nextFloor, currentFw, fourWheelerSlots, "FW");

    const idx = this.floors.findIndex((floor) => floor.floorId === floorId);
    if (idx >= 0) {
      this.floors[idx] = nextFloor;
    }
    return nextFloor;
  }

  public deleteFloor(floorId: string): void {
    const floor = this.getFloorById(floorId);
    if (!floor) {
      throw new Error("Floor not found");
    }
    if (this.floors.length <= 1) {
      throw new Error("At least one floor must exist");
    }
    if (floor.getSlots().some((slot) => slot.isOccupied)) {
      throw new Error("Cannot delete floor with occupied slots");
    }

    const idx = this.floors.findIndex((item) => item.floorId === floorId);
    if (idx >= 0) {
      this.floors.splice(idx, 1);
    }
  }

  private validateFloorInput(
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number,
  ): void {
    if (!floorName.trim()) {
      throw new Error("Floor name is required");
    }
    if (twoWheelerSlots < 0 || fourWheelerSlots < 0) {
      throw new Error("Slot counts cannot be negative");
    }
    if (twoWheelerSlots + fourWheelerSlots === 0) {
      throw new Error("At least one slot is required");
    }
  }

  private buildUpdatedSlots(
    targetFloor: Floor,
    existingSlots: ParkingSlot[],
    requiredTotal: number,
    typeCode: "TW" | "FW",
  ): void {
    const occupied = existingSlots.filter((slot) => slot.isOccupied);
    const free = existingSlots.filter((slot) => !slot.isOccupied);
    const toKeep = [...occupied, ...free].slice(0, requiredTotal);

    toKeep.forEach((slot) => {
      targetFloor.addSlot(
        new ParkingSlot(slot.slotId, slot.slotType, slot.isOccupied),
      );
    });

    const currentMaxIndex = existingSlots.reduce((max, slot) => {
      const match = slot.slotId.match(/-(\d+)$/);
      const indexPart = match?.[1];
      const index = indexPart ? Number.parseInt(indexPart, 10) : 0;
      return Math.max(max, index);
    }, 0);

    for (let idx = toKeep.length + 1; idx <= requiredTotal; idx += 1) {
      const newIndex = currentMaxIndex + (idx - toKeep.length);
      const slotType = typeCode === "TW" ? "TWO_WHEELER" : "FOUR_WHEELER";
      targetFloor.addSlot(
        new ParkingSlot(
          `${targetFloor.floorId}-${typeCode}-${String(newIndex).padStart(2, "0")}`,
          slotType,
        ),
      );
    }
  }

  private generateNextFloorId(): string {
    const floorNumbers = this.floors
      .map((floor) => Number.parseInt(floor.floorId.replace(/^F/, ""), 10))
      .filter((value) => Number.isFinite(value));

    const next = floorNumbers.length > 0 ? Math.max(...floorNumbers) + 1 : 1;
    return `F${next}`;
  }
}
