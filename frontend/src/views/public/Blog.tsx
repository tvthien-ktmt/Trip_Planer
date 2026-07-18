'use client';
import { useState } from 'react';
import { useBlogQuery } from '../../hooks/queries';
import { Skeleton } from '../../components/common/Skeleton';
import { Pagination } from '../../components/common/Pagination';
import Link from 'next/link';
import { BlogPost } from '../../types';

import { Calendar, Clock, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Blog() {
  const { data: blogs, isLoading } = useBlogQuery();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const categories = ['All', 'Cuisine', 'Experience', 'Destination', 'Tips'];

  const filteredBlogs = blogs?.filter((post: BlogPost) => {
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || post.category === category;
    return matchSearch && matchCat;
  }) || [];

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = filteredBlogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pb-12 pt-8 px-4 mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Blog Du Lịch</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Khám phá những câu chuyện truyền cảm hứng, kinh nghiệm quý báu và mẹo hay cho chuyến đi tiếp theo của bạn.
        </p>

        {/* Search & Filter */}
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-colors dark:text-white"
            />
          </div>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="py-3 px-4 bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-colors dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'Tất cả chủ đề' : cat === 'Cuisine' ? 'Ẩm thực' : cat === 'Experience' ? 'Trải nghiệm' : cat === 'Destination' ? 'Điểm đến' : 'Mẹo du lịch'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-96 rounded-2xl" />)}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-500">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedBlogs.map((post: BlogPost) => (
                <article key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group flex flex-col cursor-pointer transition-shadow hover:shadow-md">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {post.category === 'Cuisine' ? 'Ẩm thực' : post.category === 'Experience' ? 'Trải nghiệm' : post.category === 'Destination' ? 'Điểm đến' : 'Mẹo du lịch'}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(new Date(post.date), 'dd/MM/yyyy')}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime} phút đọc</span>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`} className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</div>
                      <Link href={`/blog/${post.slug}`} className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
                        Đọc tiếp <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
