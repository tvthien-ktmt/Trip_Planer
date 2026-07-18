import { useBlogQuery } from '../../hooks/queries';
import { Skeleton } from '../common/Skeleton';
import Link from 'next/link';

import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types';
import { format } from 'date-fns';

export const LatestBlogs = () => {
  const { data: blogs, isLoading } = useBlogQuery();

  if (isLoading) {
    return (
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 dark:text-white">Cẩm nang du lịch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      </section>
    );
  }

  const latest = blogs?.slice(0, 3) || [];

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold dark:text-white mb-2">Cẩm nang du lịch</h2>
          <p className="text-gray-500 dark:text-gray-400">Kinh nghiệm và mẹo du lịch hữu ích từ chuyên gia</p>
        </div>
        <Link href="/blog" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {latest.map((post: BlogPost) => (
          <article key={post.id} className="group cursor-pointer">
            <div className="relative h-56 rounded-2xl overflow-hidden mb-4 shadow-sm">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {post.category}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.date), 'dd/MM/yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} phút đọc
              </span>
            </div>
            
            <Link href={`/blog/${post.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
              {post.excerpt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};
