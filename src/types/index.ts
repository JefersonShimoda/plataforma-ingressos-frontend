export type UserRole = 'CLIENT' | 'ORGANIZER' | 'PORTER';

export type EventType = 'MOVIE' | 'SHOW' | 'THEATER';

export type SeatingType = 'SEATED' | 'GENERAL_ADMISSION';

export type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'SOLD';

export type CheckinStatus = 'VALID' | 'ALREADY_USED' | 'WRONG_EVENT' | 'INVALID';

export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';

export type PaymentStatus = 'APPROVED' | 'DECLINED';

export type ReservationStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Seat {
  id?: number;
  seatNumber: string;
  status: SeatStatus;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  type: EventType;
  eventDate: string;
  location: string;
  price: number;
  seatingType: SeatingType;
  totalCapacity: number;
  availableCapacity: number;
  organizerId?: number;
  organizerName?: string;
  status: 'PUBLISHED' | 'CANCELLED';
  createdAt?: string;
  seats?: Seat[];
  seatRows?: number;
  seatColumns?: number;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  type: EventType;
  eventDate: string;
  location: string;
  price: number;
  seatingType: SeatingType;
  totalCapacity: number;
  seatRows?: number;
  seatColumns?: number;
}

export interface CreateReservationDTO {
  eventId: number;
  seatNumbers?: string[];
  quantity?: number;
}

export interface Reservation {
  id: number;
  eventId: number;
  eventTitle: string;
  clientId: number;
  clientName: string;
  status: ReservationStatus;
  totalAmount: number;
  quantity?: number;
  seatNumbers?: string[];
  expiresAt: string;
  createdAt: string;
  event?: Event;
}

export interface ProcessPaymentDTO {
  reservationId: number;
  paymentMethod: PaymentMethod;
  simulateStatus?: PaymentStatus;
  simulationStatus?: PaymentStatus;
  effectiveStatus?: PaymentStatus;
}

export interface Ticket {
  id: number;
  reservationId?: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  location: string;
  imageUrl?: string;
  clientName?: string;
  seatNumber?: string | null;
  qrCodeToken: string;
  shareToken: string;
  validated: boolean;
  validatedAt?: string | null;
  createdAt?: string;
}

export interface PublicTicket {
  eventTitle: string;
  eventDate: string;
  location: string;
  imageUrl?: string;
  category?: string;
  seatNumber?: string | null;
  qrCodeToken: string;
  validated: boolean;
  clientFirstName?: string;
}

export interface CheckinResponse {
  status: CheckinStatus;
  message: string;
  ticketId?: number | null;
  eventTitle: string;
  clientName?: string | null;
  seatNumber?: string | null;
  validatedAt?: string | null;
}

export interface CheckinStats {
  eventId: number;
  eventTitle: string;
  totalTicketsSold: number;
  checkedInCount: number;
  pendingCount: number;
}

export interface CatalogItem {
  externalId: string;
  source: string;
  type: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  originalDate?: string;
  venueSuggestion?: string;
}

export interface PorterUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface DailySales {
  date: string;
  dayOfWeek: string;
  ticketsSold: number;
  revenue: number;
}

