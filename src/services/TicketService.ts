import { Ticket } from '../domain/Ticket';
import type { VehicleType } from '../domain/types';
import type { ITicketRepository } from '../repositories/TicketRepository';
import { InvalidTicketError, TicketAlreadyClosedError } from '../utils/errors';

export class TicketService {
  private sequence: number;

  constructor(
    private readonly ticketRepository: ITicketRepository,
    initialSequence = 1
  ) {
    this.sequence = initialSequence;
  }

  public generateTicketId(): string {
    const id = `TKT-${String(this.sequence).padStart(5, '0')}`;
    this.sequence += 1;
    return id;
  }

  public getSequence(): number {
    return this.sequence;
  }

  public createTicket(params: {
    vehicleNumber: string;
    vehicleType: VehicleType;
    buildingId: string;
    floorId: string;
    slotId: string;
  }): Ticket {
    const ticket = new Ticket({
      ticketId: this.generateTicketId(),
      vehicleNumber: params.vehicleNumber,
      vehicleType: params.vehicleType,
      buildingId: params.buildingId,
      floorId: params.floorId,
      slotId: params.slotId,
      entryTime: new Date(),
      status: 'ACTIVE'
    });
    this.ticketRepository.save(ticket);
    return ticket;
  }

  public closeTicket(ticketId: string): Ticket {
    const ticket = this.getTicketById(ticketId);
    if (ticket.status === 'CLOSED') {
      throw new TicketAlreadyClosedError();
    }

    ticket.status = 'CLOSED';
    ticket.exitTime = new Date();
    this.ticketRepository.update(ticket);
    return ticket;
  }

  public getTicketById(ticketId: string): Ticket {
    const ticket = this.ticketRepository.getById(ticketId);
    if (!ticket) {
      throw new InvalidTicketError();
    }
    return ticket;
  }

  public getAllTickets(): Ticket[] {
    return this.ticketRepository.getAll();
  }
}
