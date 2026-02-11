export class ParkingFullError extends Error {
  constructor(message = 'Parking is full for the selected vehicle type') {
    super(message);
    this.name = 'ParkingFullError';
  }
}

export class InvalidTicketError extends Error {
  constructor(message = 'Ticket not allocated or slot is empty') {
    super(message);
    this.name = 'InvalidTicketError';
  }
}

export class TicketAlreadyClosedError extends Error {
  constructor(message = 'Ticket already claimed exit') {
    super(message);
    this.name = 'TicketAlreadyClosedError';
  }
}

export class SlotTypeMismatchError extends Error {
  constructor(message = 'Wrong slot type allocation') {
    super(message);
    this.name = 'SlotTypeMismatchError';
  }
}
