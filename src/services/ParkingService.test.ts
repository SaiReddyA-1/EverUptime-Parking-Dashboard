import { describe, expect, it } from 'vitest';
import { Building } from '../domain/Building';
import { Floor } from '../domain/Floor';
import { ParkingSlot } from '../domain/ParkingSlot';
import { InMemoryFloorRepository } from '../repositories/FloorRepository';
import { InMemorySlotRepository } from '../repositories/SlotRepository';
import { InMemoryTicketRepository } from '../repositories/TicketRepository';
import { ParkingService } from './ParkingService';
import { TicketService } from './TicketService';

const setup = () => {
  const building = new Building('BLD-TEST', 'Test Building');
  const floor = new Floor('F1', 'Floor 1');
  floor.addSlot(new ParkingSlot('F1-TW-01', 'TWO_WHEELER'));
  floor.addSlot(new ParkingSlot('F1-FW-01', 'FOUR_WHEELER'));
  building.addFloor(floor);

  const floorRepository = new InMemoryFloorRepository();
  const slotRepository = new InMemorySlotRepository();
  const ticketRepository = new InMemoryTicketRepository();

  floorRepository.saveMany(building.getFloors());
  slotRepository.seedFromFloors(building.getFloors());

  const ticketService = new TicketService(ticketRepository);
  const parkingService = new ParkingService(
    floorRepository,
    slotRepository,
    ticketService,
    building.id,
    building.name,
    () => undefined
  );

  return { parkingService, ticketService, slotRepository };
};

describe('ParkingService', () => {
  it('parks vehicle and creates active ticket', () => {
    const { parkingService } = setup();
    const ticket = parkingService.parkVehicle('MH12AB1234', 'FOUR_WHEELER');

    expect(ticket.ticketId).toMatch(/^TKT-/);
    expect(ticket.status).toBe('ACTIVE');
    expect(ticket.slotId).toBe('F1-FW-01');
  });

  it('exits vehicle and releases slot', () => {
    const { parkingService, slotRepository } = setup();
    const ticket = parkingService.parkVehicle('KA01XY0101', 'TWO_WHEELER');

    const slotBefore = slotRepository.getSlotById(ticket.slotId);
    expect(slotBefore?.slot.isOccupied).toBe(true);

    const exitResponse = parkingService.exitVehicle(ticket.ticketId);
    expect(exitResponse.status).toBe('CLOSED');

    const slotAfter = slotRepository.getSlotById(ticket.slotId);
    expect(slotAfter?.slot.isOccupied).toBe(false);
  });

  it('maintains ticket lifecycle', () => {
    const { parkingService, ticketService } = setup();
    const ticket = parkingService.parkVehicle('DL4CAA1221', 'FOUR_WHEELER');
    expect(ticketService.getTicketById(ticket.ticketId).status).toBe('ACTIVE');

    parkingService.exitVehicle(ticket.ticketId);
    expect(ticketService.getTicketById(ticket.ticketId).status).toBe('CLOSED');
  });
});
