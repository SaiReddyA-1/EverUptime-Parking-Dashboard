import { Floor } from './Floor';

export class Building {
  public readonly buildingId: string;
  public readonly buildingName: string;
  private readonly floors: Floor[];

  constructor(buildingId: string, buildingName: string, floors: Floor[] = []) {
    this.buildingId = buildingId;
    this.buildingName = buildingName;
    this.floors = [...floors];
  }

  public addFloor(floor: Floor): void {
    this.floors.push(floor);
  }

  public getFloors(): Floor[] {
    return [...this.floors];
  }
}
