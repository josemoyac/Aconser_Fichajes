import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../../components/Toast';

export interface TimeEntryDto {
  id: string;
  type: 'IN' | 'OUT';
  occurredAtUtc: string;
  occurredAtLocal: string;
  localDate: string;
}

export function useDailyEntries(range: { from: string; to: string }) {
  return useQuery<TimeEntryDto[]>({
    queryKey: ['time-entries', range],
    queryFn: async () => {
      const response = await api.get('/time-entries', { params: range });
      return response.data;
    }
  });
}

export function useCreateEntry() {
  const client = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: async (payload: { type: 'IN' | 'OUT' }) => {
      const idempotencyKey = crypto.randomUUID();
      const response = await api.post('/time-entries', payload, {
        headers: { 'Idempotency-Key': idempotencyKey }
      });
      return response.data;
    },
    onSuccess: () => {
      show('Fichaje registrado');
      client.invalidateQueries({ queryKey: ['time-entries'] });
      client.invalidateQueries({ queryKey: ['shifts'] });
    }
  });
}
