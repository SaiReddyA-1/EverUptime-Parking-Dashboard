import { Vehicle } from '../domain/Vehicle';
import type { IFloorRepository } from '../repositories/FloorRepository';
import type { ISlotRepository } from '../repositories/SlotRepository';
import { TicketService } from './TicketService';
import { ParkingFullError, SlotTypeMismatchError, TicketAlreadyClosedError } from '../utils/errors';
import type { VehicleType } from '../domain/types';

export interface ParkingStatus {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  availableByType: Record<VehicleType, number>;
  occupiedByType: Record<VehicleType, number>;
  floorSummaries: Array<{
    floorId: string;
    floorName: string;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    twoWheelerTotal: number;
    fourWheelerTotal: number;
    twoWheelerAvailable: number;
    fourWheelerAvailable: number;
  }>;
  floors: Array<{
    floorId: string;
    floorName: string;
    slots: Array<{
      slotId: string;
      slotType: VehicleType;
      isOccupied: boolean;
      vehicleTypeAllowed: VehicleType;
      activeTicketId: string | null;
    }>;
  }>;
}

export class ParkingService {
  constructor(
    private readonly floorRepository: IFloorRepository,
    private readonly slotRepository: ISlotRepository,
    private readonly ticketService: TicketService,
    private readonly buildingId: string,
    private readonly onStateChange: () => void
  ) {}

  public parkVehicle(vehicleNumber: string, vehicleType: VehicleType, preferredFloorId?: string | null) {
    const vehicle = new Vehicle(vehicleNumber.trim().toUpperCase(), vehicleType);

    const available = preferredFloorId
      ? this.slotRepository.findAvailableSlotInFloor(preferredFloorId, vehicle.vehicleType)
      : this.slotRepository.findAvailableSlot(vehicle.vehicleType);

    if (!available) {
      if (preferredFloorId) {
        throw new ParkingFullError('No available slots for selected type on the chosen floor');
      }
      throw new ParkingFullError();
    }

    if (available.slot.slotType !== vehicle.vehicleType) {
      throw new SlotTypeMismatchError();
    }

    available.slot.occupy();

    const ticket = this.ticketService.createTicket({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      buildingId: this.buildingId,
      floorId: available.floor.floorId,
      slotId: available.slot.slotId
    });

    this.onStateChange();
    return ticket;
  }

  public exitVehicle(ticketId: string) {
    const ticket = this.ticketService.getTicketById(ticketId);
    if (ticket.status === 'CLOSED') {
      throw new TicketAlreadyClosedError();
    }

    const slotRecord = this.slotRepository.getSlotById(ticket.slotId);
    if (!slotRecord) {
      throw new Error('Ticket not allocated or slot is empty');
    }

    slotRecord.slot.release();
    const closedTicket = this.ticketService.closeTicket(ticketId);
    this.onStateChange();

    return {
      ticketId: closedTicket.ticketId,
      vehicleNumber: closedTicket.vehicleNumber,
      floorId: closedTicket.floorId,
      slotId: closedTicket.slotId,
      entryTime: closedTicket.entryTime,
      exitTime: closedTicket.exitTime,
      status: closedTicket.status
    };
  }

  public getParkingStatus(): ParkingStatus {
    const floors = this.floorRepository.getAll();
    const allSlots = this.slotRepository.getAllSlots();
    const activeTicketBySlotId = new Map<string, string>();
    this.ticketService
      .getAllTickets()
      .filter((ticket) => ticket.status === 'ACTIVE')
      .forEach((ticket) => {
        activeTicketBySlotId.set(ticket.slotId, ticket.ticketId);
      });

    const totalSlots = allSlots.length;
    const occupiedSlots = allSlots.filter((record) => record.slot.isOccupied).length;

    const availableByType: Record<VehicleType, number> = {
      TWO_WHEELER: 0,
      FOUR_WHEELER: 0
    };

    const occupiedByType: Record<VehicleType, number> = {
      TWO_WHEELER: 0,
      FOUR_WHEELER: 0
    };

    allSlots.forEach((record) => {
      if (record.slot.isOccupied) {
        occupiedByType[record.slot.slotType] += 1;
      } else {
        availableByType[record.slot.slotType] += 1;
      }
    });

    return {
      totalSlots,
      occupiedSlots,
      availableSlots: totalSlots - occupiedSlots,
      availableByType,
      occupiedByType,
      floorSummaries: floors.map((floor) => {
        const floorSlots = floor.getSlots();
        const floorOccupied = floorSlots.filter((slot) => slot.isOccupied).length;
        const twoWheelerSlots = floorSlots.filter((slot) => slot.slotType === 'TWO_WHEELER');
        const fourWheelerSlots = floorSlots.filter((slot) => slot.slotType === 'FOUR_WHEELER');

        return {
          floorId: floor.floorId,
          floorName: floor.floorName,
          totalSlots: floorSlots.length,
          occupiedSlots: floorOccupied,
          availableSlots: floorSlots.length - floorOccupied,
          twoWheelerTotal: twoWheelerSlots.length,
          fourWheelerTotal: fourWheelerSlots.length,
          twoWheelerAvailable: twoWheelerSlots.filter((slot) => !slot.isOccupied).length,
          fourWheelerAvailable: fourWheelerSlots.filter((slot) => !slot.isOccupied).length
        };
      }),
      floors: floors.map((floor) => ({
        floorId: floor.floorId,
        floorName: floor.floorName,
        slots: floor.getSlots().map((slot) => ({
          slotId: slot.slotId,
          slotType: slot.slotType,
          isOccupied: slot.isOccupied,
          vehicleTypeAllowed: slot.slotType,
          activeTicketId: activeTicketBySlotId.get(slot.slotId) ?? null
        }))
      }))
    };
  }
}
