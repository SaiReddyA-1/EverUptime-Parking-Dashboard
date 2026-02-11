import type { TicketStatus, VehicleType } from './types';

export class Ticket {
  public readonly ticketId: string;
  public readonly vehicleNumber: string;
  public readonly vehicleType: VehicleType;
  public readonly buildingId: string;
  public readonly floorId: string;
  public readonly slotId: string;
  public readonly entryTime: Date;
  public exitTime: Date | null;
  public status: TicketStatus;

  constructor(params: {
    ticketId: string;
    vehicleNumber: string;
    vehicleType: VehicleType;
    buildingId: string;
    floorId: string;
    slotId: string;
    entryTime: Date;
    exitTime?: Date | null;
    status?: TicketStatus;
  }) {
    this.ticketId = params.ticketId;
    this.vehicleNumber = params.vehicleNumber;
    this.vehicleType = params.vehicleType;
    this.buildingId = params.buildingId;
    this.floorId = params.floorId;
    this.slotId = params.slotId;
    this.entryTime = params.entryTime;
    this.exitTime = params.exitTime ?? null;
    this.status = params.status ?? 'ACTIVE';
  }
}
