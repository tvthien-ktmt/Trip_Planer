import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const fetchBlogs = async () => {
  const response = await api.get('/blog');
  return response.data;
};

export const useBlogQuery = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
  });
};
