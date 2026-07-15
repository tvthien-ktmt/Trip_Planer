import { useQuery } from '@tanstack/react-query';
import { mockFaqs } from '../../mocks/data';

const fetchFaqs = async () => {
  return new Promise<typeof mockFaqs>((resolve) => {
    setTimeout(() => resolve(mockFaqs), 300);
  });
};

export const useFaqQuery = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqs,
  });
};
