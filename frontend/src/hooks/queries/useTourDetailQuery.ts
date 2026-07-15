import { useQuery } from '@tanstack/react-query';
import { mockTours } from '../../mocks/data';

const fetchTourDetail = async (id: string) => {
  return new Promise<typeof mockTours[0] | undefined>((resolve) => {
    setTimeout(() => {
      resolve(mockTours.find((t) => t.id === id));
    }, 500);
  });
};

export const useTourDetailQuery = (id: string) => {
  return useQuery({
    queryKey: ['tour', id],
    queryFn: () => fetchTourDetail(id),
    enabled: !!id,
  });
};
