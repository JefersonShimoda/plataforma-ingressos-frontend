import { api } from './client';
import { Reservation, CreateReservationDTO } from '../types';

export const reservationsApi = {
  createReservation: async (payload: CreateReservationDTO): Promise<Reservation> => {
    const response = await api.post<Reservation>('/reservations', payload);
    return response.data;
  },

  getReservationById: async (id: number): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>('/reservations/my-reservations');
    return response.data;
  },

  cancelReservation: async (id: number): Promise<void> => {
    await api.post(`/reservations/${id}/cancel`);
  },
};
