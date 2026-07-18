import { useQuery } from '@tanstack/react-query';

const fetchFaqs = async () => {
  const res = await fetch('/api/faqs');
  if (!res.ok) throw new Error('Failed to fetch FAQs');
  return res.json();
};

export const useFaqQuery = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFaqs,
  });
};
