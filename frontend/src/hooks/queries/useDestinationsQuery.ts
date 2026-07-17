import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const fetchDestinations = async (): Promise<any[]> => {
  const { data } = await api.get('/destinations');
  return data.data || data;
};

export const useDestinationsQuery = () => {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: fetchDestinations,
  });
};
