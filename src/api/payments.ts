import { api } from './client';
import { ProcessPaymentDTO, Ticket } from '../types';

export interface PaymentResponse {
  paymentId: number;
  reservationId: number;
  status: 'APPROVED' | 'DECLINED';
  paymentMethod: string;
  amount: number;
  transactionId: string;
  message?: string;
  createdAt: string;
  tickets?: Ticket[];
}

export const paymentsApi = {
  processPayment: async (payload: ProcessPaymentDTO): Promise<PaymentResponse> => {
    // Send payload matching both backend simulateStatus / simulationStatus / effectiveStatus
    const body = {
      reservationId: payload.reservationId,
      paymentMethod: payload.paymentMethod,
      simulateStatus: payload.simulateStatus || payload.simulationStatus || 'APPROVED',
      effectiveStatus: payload.effectiveStatus || payload.simulateStatus || payload.simulationStatus || 'APPROVED',
      simulationStatus: payload.simulationStatus || payload.simulateStatus || 'APPROVED',
    };
    const response = await api.post<PaymentResponse>('/payments/process', body);
    return response.data;
  },
};
