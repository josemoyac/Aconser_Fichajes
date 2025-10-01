import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../../components/Toast';

export interface AllocationSummary {
  baseHours: number;
  extraHours: number;
  days: { date: string; baseHours: number; extraHours: number; presenceHours: number }[];
}

export interface MonthlyAllocationResponse {
  allocation: {
    id: string;
    baseHours: number;
    extraHours: number;
    finalized: boolean;
    projects: { projectId: string; hours: number }[];
  };
  summary: AllocationSummary;
}

export function useAllocation(userId: string, month: string) {
  return useQuery<MonthlyAllocationResponse>({
    queryKey: ['allocation', userId, month],
    queryFn: async () => {
      const response = await api.get(`/allocations/${userId}/${month}`);
      return response.data;
    }
  });
}

export function useFinalizeAllocation(userId: string, month: string) {
  const client = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: async (payload: { projectId: string; hours: number }[]) => {
      const response = await api.post(`/allocations/${month}/finalize`, { allocations: payload });
      return response.data;
    },
    onSuccess: () => {
      show('Imputación finalizada');
      client.invalidateQueries({ queryKey: ['allocation', userId, month] });
    }
  });
}
