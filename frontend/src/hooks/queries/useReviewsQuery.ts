import { useQuery } from '@tanstack/react-query';
import { mockReviews } from '../../mocks/data';

const fetchReviews = async (tourId: string) => {
  return new Promise<typeof mockReviews>((resolve) => {
    setTimeout(() => {
      resolve(mockReviews.filter((r) => r.tourId === tourId));
    }, 400);
  });
};

export const useReviewsQuery = (tourId: string) => {
  return useQuery({
    queryKey: ['reviews', tourId],
    queryFn: () => fetchReviews(tourId),
    enabled: !!tourId,
  });
};
