import { BlogPost } from '../../types';

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Kinh nghiệm du lịch Đà Lạt tự túc 3 ngày 2 đêm',
    slug: 'kinh-nghiem-du-lich-da-lat-tu-tuc',
    coverImage: 'https://images.unsplash.com/photo-1582650042456-4b20a40d5885?q=80&w=800&auto=format&fit=crop',
    excerpt: 'Đà Lạt luôn là điểm đến hấp dẫn với khí hậu mát mẻ quanh năm. Bài viết này sẽ hướng dẫn chi tiết lịch trình du lịch Đà Lạt tự túc từ A-Z.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique... (Nội dung bài viết)',
    author: 'Trip Planner Editor',
    date: '2024-01-15T00:00:00Z',
    readTime: 5,
    category: 'Experience',
  },
  {
    id: 'blog-2',
    title: 'Top 10 món ăn đường phố không thể bỏ qua khi đến Thái Lan',
    slug: 'top-10-mon-an-duong-pho-thai-lan',
    coverImage: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=2070',
    excerpt: 'Khám phá thiên đường ẩm thực đường phố Bangkok với Pad Thai, Som Tum, Xôi xoài và vô vàn món ăn hấp dẫn khác.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique... (Nội dung bài viết)',
    author: 'Foodie Traveler',
    date: '2024-02-10T00:00:00Z',
    readTime: 7,
    category: 'Cuisine',
  },
  {
    id: 'blog-3',
    title: 'Cẩm nang xin Visa Schengen du lịch Châu Âu bao đậu',
    slug: 'cam-nang-xin-visa-schengen',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    excerpt: 'Hướng dẫn chi tiết chuẩn bị hồ sơ, các lưu ý quan trọng và mẹo phỏng vấn để tăng tỷ lệ đỗ Visa Châu Âu lên 99%.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tristique... (Nội dung bài viết)',
    author: 'Visa Expert',
    date: '2024-03-05T00:00:00Z',
    readTime: 10,
    category: 'Tips',
  },
  ...Array.from({ length: 12 }).map((_, i) => {
    const blogImages = [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop',
    ];
    return {
    id: `blog-auto-${i+4}`,
    title: `Khám phá bí ẩn của điểm đến ${i+4} mà bạn chưa từng biết`,
    slug: `kham-pha-bi-an-${i+4}`,
    coverImage: blogImages[i] || '',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat.',
    content: 'Phần nội dung chi tiết. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.',
    author: 'Guest Writer',
    date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    readTime: (i % 5) + 3,
    category: ['Cuisine', 'Experience', 'Destination', 'Tips'][i % 4] as 'Cuisine' | 'Experience' | 'Destination' | 'Tips',
  };
  })
];
