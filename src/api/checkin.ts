import { api } from './client';
import { CheckinResponse, CheckinStats } from '../types';

export interface ValidateCheckinPayload {
  eventId: number;
  qrCodeToken: string;
}

export const checkinApi = {
  validateCheckin: async (payload: ValidateCheckinPayload): Promise<CheckinResponse> => {
    const response = await api.post<CheckinResponse>('/checkin/validate', payload);
    return response.data;
  },

  getCheckinStats: async (eventId: number): Promise<CheckinStats> => {
    const response = await api.get<CheckinStats>(`/checkin/events/${eventId}/stats`);
    return response.data;
  },
};
