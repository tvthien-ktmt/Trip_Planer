import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const fetchReviews = async (tourId: string) => {
  const response = await api.get(`/review/tour/${tourId}`);
  return response.data;
};

export const useReviewsQuery = (tourId: string) => {
  return useQuery({
    queryKey: ['reviews', tourId],
    queryFn: () => fetchReviews(tourId),
    enabled: !!tourId,
  });
};
