import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface ShiftDto {
  id: string;
  status: 'OPEN' | 'CLOSED' | 'CORRECTED';
  startEntry: {
    occurredAtLocal: string;
    localDate: string;
  };
  endEntry?: {
    occurredAtLocal: string;
  };
  durationMinutes?: number;
}

export function useShifts(month: string) {
  return useQuery<ShiftDto[]>({
    queryKey: ['shifts', month],
    queryFn: async () => {
      const response = await api.get('/shifts', { params: { month } });
      return response.data;
    }
  });
}
