import { api } from './client';
import { Ticket, PublicTicket } from '../types';

export const ticketsApi = {
  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>('/tickets/my-tickets');
    return response.data;
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  getPublicTicket: async (shareToken: string): Promise<PublicTicket> => {
    const response = await api.get<PublicTicket>(`/tickets/share/${shareToken}`);
    return response.data;
  },
};
