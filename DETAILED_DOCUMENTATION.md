# EverUptime Parking System - Detailed Documentation

## 1. Project Overview

This project is a **Car Parking Management System** built with:

- `TypeScript` (strict mode)
- `Vite + React`
- `Tailwind CSS`
- `Framer Motion`
- Layered architecture (`domain`, `services`, `repositories`, `controllers`, `ui`)

The application supports:

- vehicle entry and ticket generation
- vehicle exit with ticket validation
- floor and slot management (admin)
- floor/type/status filtering in live slot grid
- quick exit from occupied slot cards
- QR-based ticket actions (share/download/print)
- local persistence (survives browser refresh)

---

## 2. Folder Structure

```txt
src/
  domain/         // Entity classes only (no orchestration/business workflows)
  services/       // Business logic and workflow orchestration
  repositories/   // In-memory repositories + localStorage state repository
  controllers/    // UI-facing entry points
  utils/          // Errors and date helpers
  ui/             // React app, components, bootstrap wiring
```

---

## 3. Architecture

### 3.1 Domain Layer

Core entities:

- `Building`
- `Floor`
- `ParkingSlot`
- `Vehicle`
- `Ticket`

These classes model data and basic behavior (e.g., slot occupy/release) only.

### 3.2 Service Layer

- `ParkingService`
  - parks vehicle across selected/all floors
  - exits vehicle using ticket ID
  - computes dashboard status (overall + floor/type splits)
  - maps active tickets to occupied slots for quick-exit support
- `TicketService`
  - ticket ID generation
  - create/get/close ticket lifecycle
- `AdmitService`
  - add floor
  - update floor details (name, slot counts)
  - delete floor with guard rules

### 3.3 Repository Layer

- `InMemoryFloorRepository`
- `InMemorySlotRepository`
- `InMemoryTicketRepository`
- `LocalStorageParkingStateRepository` (state persistence)

### 3.4 Controller Layer

- `ParkingController`
- `TicketController`
- `AdmitController`

Controllers are used by the UI to keep components decoupled from service internals.

---

## 4. Key Features

## 4.1 Parking Flow

### Entry

1. User enters vehicle number/type.
2. Optional floor can be selected.
3. Service finds compatible free slot.
4. Slot marked occupied.
5. Ticket created (`ACTIVE`).
6. Status/UI updates and persisted.

### Exit

1. User enters/scans ticket.
2. Ticket validated.
3. Slot released.
4. Ticket closed (`CLOSED`, `exitTime` set).
5. Status/UI updates and persisted.

---

## 4.2 Live Slot Grid

Supports:

- multi-select filter capsules:
  - floors (multiple levels)
  - types (`TWO_WHEELER`, `FOUR_WHEELER`)
  - status (`AVAILABLE`, `OCCUPIED`)
- selected capsules move to the left in each group
- occupied cards show `Quick Exit` button

---

## 4.3 Ticket Actions

Ticket modal provides:

- `Share`
- `Download Ticket`
- `Print`

All actions are based on a **single combined ticket image** containing:

- title: `EverUptime Parking Ticket`
- ticket details
- generated QR code

History rows also provide a `Download` action (opens same modal for that ticket).

---

## 4.4 QR Scanner in Exit Card

`Vehicle Exit` includes camera scanner:

- starts camera
- reads ticket QR
- auto-fills ticket ID field

If browser lacks scanner support, user sees a clear message.

---

## 4.5 Admin Features

Admin login defaults:

- username: `admin`
- password: `0000`

Admin can:

- add floor
- modify floor
- delete floor (with confirmation popup)
- logout

Delete protections:

- cannot delete floor with occupied slots
- cannot delete last remaining floor

---

## 5. Validation and Edge Cases

Handled errors include:

- invalid/unallocated ticket:
  - `Ticket not allocated or slot is empty`
- already closed ticket:
  - `Ticket already claimed exit`
- parking full scenario
- wrong slot type allocation
- invalid admin login
- scanner unsupported / camera initialization errors

All surfaced via toast or inline messages.

---

## 6. Persistence Model

Stored in `localStorage`:

- building metadata
- floors and slot occupancy
- tickets
- ticket sequence counter
- selected theme

This ensures refresh does not reset operational data.

---

## 7. UI/UX Notes

- compact layout with reduced visual bulk
- theme switching with icon button (`light`, `dark`, `aurora`)
- dashboard/admin switch near title
- history pagination (5/10 rows, prev/next)
- floor-wise availability with totals and 2W/4W breakdown

---

## 8. Run and Build

Install:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Test:

```bash
npm run test
```

---

## 9. Important Files (Quick Reference)

- App shell/layout:
  - `src/ui/App.tsx`
- Slot grid & filters:
  - `src/ui/components/SlotGrid.tsx`
- Ticket modal + share/download/print:
  - `src/ui/components/TicketModal.tsx`
- Exit form + QR scanner:
  - `src/ui/components/ExitForm.tsx`
- Admin panel:
  - `src/ui/components/AdmitPanel.tsx`
- Parking workflow:
  - `src/services/ParkingService.ts`
- Admin workflow:
  - `src/services/AdmitService.ts`
- Ticket workflow:
  - `src/services/TicketService.ts`
- Persistence:
  - `src/repositories/ParkingStateRepository.ts`

