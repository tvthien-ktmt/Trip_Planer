'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Calendar, User, Clock, ArrowLeft, Share2, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function BlogDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  // Mock data for Blog Detail
  const post = {
    title: "10 Địa Điểm Không Thể Bỏ Qua Khi Đến Kyoto Mùa Thu",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    author: "Travel Expert",
    date: "2024-10-15T00:00:00Z",
    readTime: 5,
    category: "Destination",
    content: `
      <p>Mùa thu ở Kyoto là một trong những cảnh sắc tuyệt vời nhất mà bạn có thể trải nghiệm tại Nhật Bản. Khi những tán lá chuyển từ xanh sang đỏ, vàng và cam rực rỡ, toàn bộ thành phố như được khoác lên mình một tấm áo mới, lộng lẫy và cổ kính hơn bao giờ hết.</p>
      
      <h3>1. Chùa Thanh Thủy (Kiyomizu-dera)</h3>
      <p>Kiyomizu-dera không chỉ nổi tiếng với kiến trúc bằng gỗ độc đáo mà còn là địa điểm ngắm lá đỏ đẹp bậc nhất. Đứng trên ban công chính, bạn có thể phóng tầm mắt bao quát toàn cảnh rừng phong đang chuyển màu bên dưới.</p>
      
      <img src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=800&auto=format&fit=crop" alt="Kiyomizu-dera" />
      
      <h3>2. Đền Tofuku-ji</h3>
      <p>Chỉ cách ga Kyoto một trạm dừng, Tofuku-ji là một kho báu ẩn giấu với cây cầu Tsutenkyo nổi tiếng. Từ trên cầu nhìn xuống là một "biển lá đỏ" đẹp đến ngỡ ngàng.</p>
      
      <h3>Lời Khuyên Khi Du Lịch Kyoto Mùa Thu</h3>
      <ul>
        <li><strong>Nên đi sớm:</strong> Để tránh đám đông, hãy cố gắng đến các điểm tham quan nổi tiếng ngay khi chúng vừa mở cửa (thường là 6:00 hoặc 8:00 sáng).</li>
        <li><strong>Mang giày thoải mái:</strong> Bạn sẽ phải đi bộ rất nhiều trên những con đường lát đá dốc.</li>
        <li><strong>Kiểm tra lịch chiếu sáng:</strong> Nhiều ngôi chùa tổ chức sự kiện thắp sáng đèn (light-up) vào buổi tối, tạo nên khung cảnh lung linh huyền ảo.</li>
      </ul>
    `
  };

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
          dangerouslySetInnerHTML={{ __html: post.content }} 
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
