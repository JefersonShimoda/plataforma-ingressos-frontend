import { api } from './client';
import { Event, CreateEventDTO, PorterUser, DailySales } from '../types';

export interface EventFilterParams {
  query?: string;
  category?: string;
  type?: string;
}

export const eventsApi = {
  getEvents: async (params?: EventFilterParams): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  },

  getEventById: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  createEvent: async (payload: CreateEventDTO): Promise<Event> => {
    const response = await api.post<Event>('/events', payload);
    return response.data;
  },

  getMyEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events/my-events');
    return response.data;
  },

  getMySalesTrend: async (): Promise<DailySales[]> => {
    const response = await api.get<DailySales[]>('/events/my-sales-trend');
    return response.data;
  },

  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  getPortersForEvent: async (eventId: number): Promise<PorterUser[]> => {
    const response = await api.get<PorterUser[]>(`/events/${eventId}/porters`);
    return response.data;
  },

  assignPortersToEvent: async (eventId: number, porterIds: number[]): Promise<void> => {
    await api.post(`/events/${eventId}/porters`, { porterIds });
  },
};

