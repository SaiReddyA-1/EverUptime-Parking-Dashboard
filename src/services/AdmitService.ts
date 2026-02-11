import { Floor } from '../domain/Floor';
import { ParkingSlot } from '../domain/ParkingSlot';
import type { IFloorRepository } from '../repositories/FloorRepository';
import type { ISlotRepository } from '../repositories/SlotRepository';

export class AdmitService {
  constructor(
    private readonly floorRepository: IFloorRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly onStateChange: () => void
  ) {}

  public admitFloor(floorName: string, twoWheelerSlots: number, fourWheelerSlots: number): Floor {
    this.validateInput(floorName, twoWheelerSlots, fourWheelerSlots);

    const floorId = this.generateNextFloorId();
    const floor = new Floor(floorId, floorName.trim());

    for (let index = 1; index <= twoWheelerSlots; index += 1) {
      floor.addSlot(new ParkingSlot(`${floorId}-TW-${String(index).padStart(2, '0')}`, 'TWO_WHEELER'));
    }

    for (let index = 1; index <= fourWheelerSlots; index += 1) {
      floor.addSlot(new ParkingSlot(`${floorId}-FW-${String(index).padStart(2, '0')}`, 'FOUR_WHEELER'));
    }

    this.floorRepository.save(floor);
    this.reseed();
    return floor;
  }

  public updateFloor(
    floorId: string,
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number
  ): Floor {
    this.validateInput(floorName, twoWheelerSlots, fourWheelerSlots);

    const currentFloor = this.floorRepository.getById(floorId);
    if (!currentFloor) {
      throw new Error('Floor not found');
    }

    const currentSlots = currentFloor.getSlots();
    const currentTw = currentSlots.filter((slot) => slot.slotType === 'TWO_WHEELER');
    const currentFw = currentSlots.filter((slot) => slot.slotType === 'FOUR_WHEELER');

    const occupiedTw = currentTw.filter((slot) => slot.isOccupied).length;
    const occupiedFw = currentFw.filter((slot) => slot.isOccupied).length;

    if (twoWheelerSlots < occupiedTw) {
      throw new Error('Two wheeler slots cannot be less than occupied two wheeler slots');
    }

    if (fourWheelerSlots < occupiedFw) {
      throw new Error('Four wheeler slots cannot be less than occupied four wheeler slots');
    }

    const nextFloor = new Floor(floorId, floorName.trim());

    this.buildUpdatedSlots(nextFloor, currentTw, twoWheelerSlots, 'TW');
    this.buildUpdatedSlots(nextFloor, currentFw, fourWheelerSlots, 'FW');

    this.floorRepository.save(nextFloor);
    this.reseed();
    return nextFloor;
  }

  public deleteFloor(floorId: string): void {
    const floor = this.floorRepository.getById(floorId);
    if (!floor) {
      throw new Error('Floor not found');
    }

    if (this.floorRepository.getAll().length <= 1) {
      throw new Error('At least one floor must exist');
    }

    const hasOccupiedSlots = floor.getSlots().some((slot) => slot.isOccupied);
    if (hasOccupiedSlots) {
      throw new Error('Cannot delete floor with occupied slots');
    }

    this.floorRepository.delete(floorId);
    this.reseed();
  }

  private reseed(): void {
    this.slotRepository.seedFromFloors(this.floorRepository.getAll());
    this.onStateChange();
  }

  private validateInput(floorName: string, twoWheelerSlots: number, fourWheelerSlots: number): void {
    if (!floorName.trim()) {
      throw new Error('Floor name is required');
    }

    if (twoWheelerSlots < 0 || fourWheelerSlots < 0) {
      throw new Error('Slot counts cannot be negative');
    }

    if (twoWheelerSlots + fourWheelerSlots === 0) {
      throw new Error('At least one slot is required');
    }
  }

  private buildUpdatedSlots(
    targetFloor: Floor,
    existingSlots: ParkingSlot[],
    requiredTotal: number,
    typeCode: 'TW' | 'FW'
  ): void {
    const occupied = existingSlots.filter((slot) => slot.isOccupied);
    const free = existingSlots.filter((slot) => !slot.isOccupied);
    const toKeep = [...occupied, ...free].slice(0, requiredTotal);

    toKeep.forEach((slot) => {
      targetFloor.addSlot(new ParkingSlot(slot.slotId, slot.slotType, slot.isOccupied));
    });

    const currentMaxIndex = existingSlots.reduce((max, slot) => {
      const match = slot.slotId.match(/-(\d+)$/);
      const indexPart = match?.[1];
      const index = indexPart ? Number.parseInt(indexPart, 10) : 0;
      return Math.max(max, index);
    }, 0);

    for (let idx = toKeep.length + 1; idx <= requiredTotal; idx += 1) {
      const newIndex = currentMaxIndex + (idx - toKeep.length);
      const slotType = typeCode === 'TW' ? 'TWO_WHEELER' : 'FOUR_WHEELER';
      targetFloor.addSlot(
        new ParkingSlot(`${targetFloor.floorId}-${typeCode}-${String(newIndex).padStart(2, '0')}`, slotType)
      );
    }
  }

  private generateNextFloorId(): string {
    const floorNumbers = this.floorRepository
      .getAll()
      .map((floor) => Number.parseInt(floor.floorId.replace(/^F/, ''), 10))
      .filter((value) => Number.isFinite(value));

    const next = floorNumbers.length > 0 ? Math.max(...floorNumbers) + 1 : 1;
    return `F${next}`;
  }
}
