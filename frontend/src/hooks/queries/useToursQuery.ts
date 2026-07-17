import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const fetchTours = async () => {
  const { data } = await api.get('/tours');
  return data.data || data; // Assuming the API returns { data: [...] } or just the array
};

export const useToursQuery = (filters?: any) => {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async (): Promise<any[]> => {
      const { data } = await api.get('/tours', { params: filters });
      return data.data || data;
    },
  });
};
