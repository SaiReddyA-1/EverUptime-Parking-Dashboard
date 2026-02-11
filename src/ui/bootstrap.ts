import { Building } from '../domain/Building';
import { Floor } from '../domain/Floor';
import { ParkingSlot } from '../domain/ParkingSlot';
import { Ticket } from '../domain/Ticket';
import { AdmitController } from '../controllers/AdmitController';
import { ParkingController } from '../controllers/ParkingController';
import { TicketController } from '../controllers/TicketController';
import { InMemoryFloorRepository } from '../repositories/FloorRepository';
import {
  LocalStorageParkingStateRepository,
  type PersistedFloor,
  type PersistedParkingState
} from '../repositories/ParkingStateRepository';
import { InMemorySlotRepository } from '../repositories/SlotRepository';
import { InMemoryTicketRepository } from '../repositories/TicketRepository';
import { AdmitService } from '../services/AdmitService';
import { ParkingService } from '../services/ParkingService';
import { TicketService } from '../services/TicketService';

const STORAGE_KEY = 'everuptime-parking-state-v1';

const createFloor = (floorId: string, floorName: string, twoWheelers: number, fourWheelers: number): Floor => {
  const floor = new Floor(floorId, floorName);

  for (let i = 1; i <= twoWheelers; i += 1) {
    floor.addSlot(new ParkingSlot(`${floorId}-TW-${String(i).padStart(2, '0')}`, 'TWO_WHEELER'));
  }

  for (let i = 1; i <= fourWheelers; i += 1) {
    floor.addSlot(new ParkingSlot(`${floorId}-FW-${String(i).padStart(2, '0')}`, 'FOUR_WHEELER'));
  }

  return floor;
};

const hydrateFloor = (persistedFloor: PersistedFloor): Floor => {
  const floor = new Floor(persistedFloor.floorId, persistedFloor.floorName);
  persistedFloor.slots.forEach((slot) => {
    floor.addSlot(new ParkingSlot(slot.slotId, slot.slotType, slot.isOccupied));
  });
  return floor;
};

const defaultBuildingData = () => {
  const building = new Building('BLD-001', 'EverUptime Central Hub');
  const floors = [
    createFloor('F1', 'Ground Deck', 6, 10),
    createFloor('F2', 'Sky Deck', 5, 8),
    createFloor('F3', 'Executive Deck', 4, 6)
  ];

  floors.forEach((floor) => building.addFloor(floor));
  return building;
};

export const createParkingSystem = () => {
  const stateRepository = new LocalStorageParkingStateRepository(STORAGE_KEY);
  const persistedState = stateRepository.load();

  const building = persistedState
    ? new Building(persistedState.buildingId, persistedState.buildingName)
    : defaultBuildingData();

  const floorRepository = new InMemoryFloorRepository();
  const slotRepository = new InMemorySlotRepository();
  const ticketRepository = new InMemoryTicketRepository();

  const floors = persistedState
    ? persistedState.floors.map((floor) => hydrateFloor(floor))
    : building.getFloors();

  if (persistedState) {
    floors.forEach((floor) => building.addFloor(floor));
  }

  floorRepository.saveMany(floors);
  slotRepository.seedFromFloors(floors);

  const hydratedTickets = persistedState
    ? persistedState.tickets.map(
        (ticket) =>
          new Ticket({
            ticketId: ticket.ticketId,
            vehicleNumber: ticket.vehicleNumber,
            vehicleType: ticket.vehicleType,
            buildingId: ticket.buildingId,
            floorId: ticket.floorId,
            slotId: ticket.slotId,
            entryTime: new Date(ticket.entryTime),
            exitTime: ticket.exitTime ? new Date(ticket.exitTime) : null,
            status: ticket.status
          })
      )
    : [];

  ticketRepository.saveMany(hydratedTickets);

  const ticketService = new TicketService(ticketRepository, persistedState?.ticketSequence ?? 1);

  const saveState = () => {
    const floorsSnapshot = floorRepository.getAll().map((floor) => ({
      floorId: floor.floorId,
      floorName: floor.floorName,
      slots: floor.getSlots().map((slot) => ({
        slotId: slot.slotId,
        slotType: slot.slotType,
        isOccupied: slot.isOccupied
      }))
    }));

    const ticketSnapshot = ticketService.getAllTickets().map((ticket) => ({
      ticketId: ticket.ticketId,
      vehicleNumber: ticket.vehicleNumber,
      vehicleType: ticket.vehicleType,
      buildingId: ticket.buildingId,
      floorId: ticket.floorId,
      slotId: ticket.slotId,
      entryTime: ticket.entryTime.toISOString(),
      exitTime: ticket.exitTime ? ticket.exitTime.toISOString() : null,
      status: ticket.status
    }));

    const snapshot: PersistedParkingState = {
      buildingId: building.buildingId,
      buildingName: building.buildingName,
      floors: floorsSnapshot,
      tickets: ticketSnapshot,
      ticketSequence: ticketService.getSequence()
    };

    stateRepository.save(snapshot);
  };

  const parkingService = new ParkingService(
    floorRepository,
    slotRepository,
    ticketService,
    building.buildingId,
    saveState
  );

  const admitService = new AdmitService(floorRepository, slotRepository, saveState);

  if (!persistedState) {
    saveState();
  }

  return {
    building,
    parkingController: new ParkingController(parkingService),
    ticketController: new TicketController(ticketService),
    admitController: new AdmitController(admitService)
  };
};
