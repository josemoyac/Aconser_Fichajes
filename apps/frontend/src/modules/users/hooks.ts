import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { UserInfo } from '../auth/store';

export function useUsers() {
  return useQuery<UserInfo[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });
}
