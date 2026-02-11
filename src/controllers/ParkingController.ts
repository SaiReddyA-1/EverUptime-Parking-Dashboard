import { ParkingService } from '../services/ParkingService';
import type { VehicleType } from '../domain/types';

export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  public entryVehicle(vehicleNumber: string, vehicleType: VehicleType, preferredFloorId?: string | null) {
    return this.parkingService.parkVehicle(vehicleNumber, vehicleType, preferredFloorId);
  }

  public exitVehicle(ticketId: string) {
    return this.parkingService.exitVehicle(ticketId);
  }

  public getParkingStatus() {
    return this.parkingService.getParkingStatus();
  }
}
