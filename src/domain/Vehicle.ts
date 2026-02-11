import type { VehicleType } from './types';

export class Vehicle {
  public readonly vehicleNumber: string;
  public readonly vehicleType: VehicleType;

  constructor(vehicleNumber: string, vehicleType: VehicleType) {
    this.vehicleNumber = vehicleNumber;
    this.vehicleType = vehicleType;
  }
}
