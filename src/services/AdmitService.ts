import { Building } from "../domain/Building";
import { Floor } from "../domain/Floor";
import type { IFloorRepository } from "../repositories/FloorRepository";
import type { ISlotRepository } from "../repositories/SlotRepository";

export class AdmitService {
  constructor(
    private readonly floorRepository: IFloorRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly buildingId: string,
    private readonly buildingName: string,
    private readonly onStateChange: () => void,
  ) {}

  public admitFloor(
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number,
  ): Floor {
    const building = this.createBuildingView();
    const floor = building.admitFloor(
      floorName,
      twoWheelerSlots,
      fourWheelerSlots,
    );
    this.persistFromBuilding(building);
    return floor;
  }

  public updateFloor(
    floorId: string,
    floorName: string,
    twoWheelerSlots: number,
    fourWheelerSlots: number,
  ): Floor {
    const building = this.createBuildingView();
    const floor = building.updateFloor(
      floorId,
      floorName,
      twoWheelerSlots,
      fourWheelerSlots,
    );
    this.persistFromBuilding(building);
    return floor;
  }

  public deleteFloor(floorId: string): void {
    const building = this.createBuildingView();
    building.deleteFloor(floorId);
    this.persistFromBuilding(building);
  }

  private createBuildingView(): Building {
    const building = new Building(this.buildingId, this.buildingName);
    this.floorRepository.getAll().forEach((floor) => building.addFloor(floor));
    return building;
  }

  private persistFromBuilding(building: Building): void {
    this.floorRepository.replaceAll(building.getFloors());
    this.slotRepository.seedFromFloors(building.getFloors());
    this.onStateChange();
  }
}
