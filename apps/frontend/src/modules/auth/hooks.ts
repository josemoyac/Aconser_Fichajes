import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore, UserInfo } from './store';

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  return useQuery<UserInfo>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    }
  });
}
