import { Review } from '../../types';

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    tourId: 'tour-1',
    userId: 'user-1',
    userName: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    comment: 'Chuyến đi Hạ Long thật sự tuyệt vời! Du thuyền rất sang trọng, nhân viên cực kỳ nhiệt tình và thân thiện. Đồ ăn hải sản tươi ngon. Sẽ ủng hộ Trip Planner lần sau!',
    date: '2023-10-15T08:30:00Z',
    images: ['https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=400&auto=format&fit=crop'],
  },
  {
    id: 'rev-2',
    tourId: 'tour-1',
    userId: 'user-2',
    userName: 'Trần Thị B',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop',
    rating: 4,
    comment: 'Cảnh quan Vịnh Hạ Long rất đẹp. Phòng trên tàu sạch sẽ. Hơi tiếc là hôm đi trời hơi mưa nên không ngắm được hoàng hôn trọn vẹn.',
    date: '2023-09-22T14:15:00Z',
  },
  {
    id: 'rev-3',
    tourId: 'tour-1',
    userId: 'user-3',
    userName: 'Michael Smith',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    comment: 'Amazing experience in Halong Bay. The cruise was fantastic, itinerary was well planned. High recommended!',
    date: '2023-11-05T09:45:00Z',
  },
  {
    id: 'rev-4',
    tourId: 'tour-2',
    userId: 'user-4',
    userName: 'Lê Hoàng C',
    rating: 5,
    comment: 'Đỉnh Fansipan đẹp xuất sắc! HDV am hiểu địa hình và rất quan tâm đến các thành viên trong đoàn. Một trải nghiệm đáng nhớ.',
    date: '2023-12-10T10:00:00Z',
  },
  {
    id: 'rev-5',
    tourId: 'tour-3',
    userId: 'user-5',
    userName: 'Phạm D',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop',
    rating: 5,
    comment: 'Tour Châu Âu giá hợp lý, lịch trình đi qua Pháp, Ý, Thụy Sĩ quá đẹp. Khách sạn tốt. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: '2023-08-20T16:20:00Z',
  },
  ...Array.from({ length: 40 }).map((_, i) => ({
    id: `rev-auto-${i}`,
    tourId: `tour-auto-${(i % 15) + 6}`,
    userId: `user-auto-${i}`,
    userName: `Traveler ${i + 1}`,
    rating: 4 + Math.round(Math.random()), // 4 or 5
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae quam vulputate, tempor dui vel, dictum lacus. Vestibulum ante ipsum primis in faucibus orci luctus.',
    date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }))
];
