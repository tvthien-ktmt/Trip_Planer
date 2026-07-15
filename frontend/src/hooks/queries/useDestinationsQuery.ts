import { useQuery } from '@tanstack/react-query';
import { destinations } from '../../mocks/destinations';

// Hàm giả lập gọi API
const fetchDestinations = async () => {
  return new Promise<typeof destinations>((resolve) => {
    setTimeout(() => resolve(destinations), 500); // Fake delay 500ms
  });
};

export const useDestinationsQuery = () => {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: fetchDestinations,
  });
};
