import { Floor } from '../domain/Floor';

export interface IFloorRepository {
  saveMany(floors: Floor[]): void;
  replaceAll(floors: Floor[]): void;
  save(floor: Floor): void;
  delete(floorId: string): void;
  getAll(): Floor[];
  getById(floorId: string): Floor | undefined;
}

export class InMemoryFloorRepository implements IFloorRepository {
  private readonly floorMap = new Map<string, Floor>();

  public saveMany(floors: Floor[]): void {
    floors.forEach((floor) => {
      this.floorMap.set(floor.floorId, floor);
    });
  }

  public replaceAll(floors: Floor[]): void {
    this.floorMap.clear();
    this.saveMany(floors);
  }

  public save(floor: Floor): void {
    this.floorMap.set(floor.floorId, floor);
  }

  public delete(floorId: string): void {
    this.floorMap.delete(floorId);
  }

  public getAll(): Floor[] {
    return Array.from(this.floorMap.values());
  }

  public getById(floorId: string): Floor | undefined {
    return this.floorMap.get(floorId);
  }
}
