import { AdmitService } from '../services/AdmitService';

export class AdmitController {
  constructor(private readonly admitService: AdmitService) {}

  public admitFloor(floorName: string, twoWheelerSlots: number, fourWheelerSlots: number) {
    return this.admitService.admitFloor(floorName, twoWheelerSlots, fourWheelerSlots);
  }

  public updateFloor(floorId: string, floorName: string, twoWheelerSlots: number, fourWheelerSlots: number) {
    return this.admitService.updateFloor(floorId, floorName, twoWheelerSlots, fourWheelerSlots);
  }

  public deleteFloor(floorId: string) {
    this.admitService.deleteFloor(floorId);
  }
}
