import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface ProjectDto {
  id: string;
  code: string;
  name: string;
  active: boolean;
  source: 'BC' | 'LOCAL';
}

export function useProjects() {
  return useQuery<ProjectDto[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects');
      return response.data;
    }
  });
}

export function useUserProjects(userId: string) {
  return useQuery<{ project: ProjectDto }[]>({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      const response = await api.get(`/users/${userId}/projects`);
      return response.data;
    },
    enabled: Boolean(userId)
  });
}
