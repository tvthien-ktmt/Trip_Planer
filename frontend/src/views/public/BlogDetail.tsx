'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, User, Clock, ArrowLeft, Share2, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DOMPurify from 'isomorphic-dompurify';

export default function BlogDetail() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { api } = await import('../../lib/api');
        const res = await api.get(`/blog/${slug}`);
        setPost(res.data?.data || res.data);
      } catch (e) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><div className="animate-pulse text-blue-500">Đang tải bài viết...</div></div>;
  }
  
  if (!post) {
    return <div className="min-h-screen flex justify-center items-center">Không tìm thấy bài viết</div>;
  }

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-24">
      {/* Hero Cover */}
      <div className="w-full h-[50vh] relative">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl mx-auto px-4 w-full">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
            </Link>
            <div className="inline-block px-3 py-1 bg-[var(--color-ocean-600)] text-white text-xs font-semibold rounded-full mb-4">
              {post.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-display mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" /> {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> {post.readTime} phút đọc
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-[var(--border-main)]">
          <p className="text-[var(--text-secondary)] italic">
            Chia sẻ kinh nghiệm du lịch thực tế để có một chuyến đi hoàn hảo.
          </p>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full border border-[var(--border-main)] hover:bg-[var(--bg-surface)] hover:text-[var(--color-coral-500)] transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full border border-[var(--border-main)] hover:bg-[var(--bg-surface)] hover:text-[var(--color-ocean-600)] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <article 
          className="prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-display prose-headings:font-semibold prose-headings:text-[var(--text-primary)]
            prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
            prose-a:text-[var(--color-ocean-600)] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-[var(--radius-radius-md)] prose-img:shadow-md
            prose-ul:text-[var(--text-secondary)] prose-li:marker:text-[var(--color-ocean-600)]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} 
        />
        
        <div className="mt-16 pt-8 border-t border-[var(--border-main)] text-center">
          <h4 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Bạn thích bài viết này?</h4>
          <Button variant="primary" className="mx-auto flex items-center gap-2">
            Khám phá các tour Kyoto <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
