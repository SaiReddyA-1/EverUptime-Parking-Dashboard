import { Ticket } from '../domain/Ticket';

export interface ITicketRepository {
  save(ticket: Ticket): void;
  saveMany(tickets: Ticket[]): void;
  getById(ticketId: string): Ticket | undefined;
  getAll(): Ticket[];
  update(ticket: Ticket): void;
}

export class InMemoryTicketRepository implements ITicketRepository {
  private readonly ticketMap = new Map<string, Ticket>();

  public save(ticket: Ticket): void {
    this.ticketMap.set(ticket.ticketId, ticket);
  }

  public saveMany(tickets: Ticket[]): void {
    tickets.forEach((ticket) => {
      this.ticketMap.set(ticket.ticketId, ticket);
    });
  }

  public getById(ticketId: string): Ticket | undefined {
    return this.ticketMap.get(ticketId);
  }

  public getAll(): Ticket[] {
    return Array.from(this.ticketMap.values());
  }

  public update(ticket: Ticket): void {
    this.ticketMap.set(ticket.ticketId, ticket);
  }
}
