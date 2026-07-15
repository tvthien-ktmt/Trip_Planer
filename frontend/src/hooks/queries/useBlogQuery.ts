import { useQuery } from '@tanstack/react-query';
import { mockBlogPosts } from '../../mocks/data';

const fetchBlogs = async () => {
  return new Promise<typeof mockBlogPosts>((resolve) => {
    setTimeout(() => resolve(mockBlogPosts), 500);
  });
};

export const useBlogQuery = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
  });
};
