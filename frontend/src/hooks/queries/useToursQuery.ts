import { useQuery } from '@tanstack/react-query';
import { mockTours } from '../../mocks/data';

const fetchTours = async () => {
  return new Promise<typeof mockTours>((resolve) => {
    setTimeout(() => resolve(mockTours), 600);
  });
};

export const useToursQuery = () => {
  return useQuery({
    queryKey: ['tours'],
    queryFn: fetchTours,
  });
};
