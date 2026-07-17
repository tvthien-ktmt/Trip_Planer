import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const fetchTourDetail = async (id: string) => {
  const response = await api.get(`/tour/${id}`);
  return response.data;
};

export const useTourDetailQuery = (id: string) => {
  return useQuery({
    queryKey: ['tour', id],
    queryFn: () => fetchTourDetail(id),
    enabled: !!id,
  });
};
