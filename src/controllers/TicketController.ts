import { TicketService } from '../services/TicketService';

export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  public getTicketById(ticketId: string) {
    return this.ticketService.getTicketById(ticketId);
  }

  public getAllTickets() {
    return this.ticketService.getAllTickets();
  }
}
