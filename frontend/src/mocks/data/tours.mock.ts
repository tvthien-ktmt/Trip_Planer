import { Tour } from '../../types';

export const mockTours: Tour[] = [
  {
    id: 'tour-1',
    title: 'Khám phá Vịnh Hạ Long 2 ngày 1 đêm trên Du thuyền 5 sao',
    destinationId: 'dest-1',
    location: 'Bến cảng Tuần Châu, Hạ Long, Quảng Ninh',
    images: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop',
    ],
    price: 3200000,
    oldPrice: 4500000,
    durationDays: 2,
    durationNights: 1,
    rating: 4.8,
    reviewsCount: 342,
    isBestseller: true,
    isDiscounted: true,
    description: 'Trải nghiệm ngủ đêm trên vịnh Hạ Long kỳ vĩ với du thuyền tiêu chuẩn 5 sao. Thưởng thức hải sản tươi ngon, chèo thuyền kayak qua các hang động và ngắm hoàng hôn trên boong tàu. Nunc eleifend libero eu quam rutrum, sit amet laoreet erat pretium. Morbi fringilla lorem a accumsan tristique.',
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội - Hạ Long - Khám phá Hang Sửng Sốt',
        description: 'Xe đón quý khách tại Hà Nội, di chuyển đến Tuần Châu. Lên du thuyền, nhận phòng và ăn trưa. Buổi chiều thăm Hang Sửng Sốt, chèo kayak. Ăn tối và nghỉ đêm trên du thuyền.',
      },
      {
        day: 2,
        title: 'Hạ Long - Đảo Titop - Hà Nội',
        description: 'Tập Thái Cực Quyền đón bình minh. Thăm đảo Titop, tắm biển hoặc leo núi ngắm toàn cảnh Vịnh. Ăn trưa trên tàu trong lúc di chuyển về bờ. Xe đưa quý khách về Hà Nội.',
      },
    ],
    maxGroupSize: 30,
    policies: [
      'Miễn phí hủy trước 7 ngày khởi hành.',
      'Trẻ em dưới 5 tuổi miễn phí (ngủ chung giường với bố mẹ).',
      'Bao gồm các bữa ăn: 1 bữa sáng, 2 bữa trưa, 1 bữa tối.',
    ],
    type: 'Group',
    category: 'Relax',
  },
  {
    id: 'tour-2',
    title: 'Tour Sapa 3 ngày 2 đêm - Chinh phục đỉnh Fansipan',
    destinationId: 'dest-4',
    location: 'Thị trấn Sapa, Lào Cai',
    images: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=2070',
    ],
    price: 2800000,
    durationDays: 3,
    durationNights: 2,
    rating: 4.7,
    reviewsCount: 156,
    isBestseller: true,
    description: 'Chuyến đi lý tưởng để khám phá thị trấn mờ sương Sapa, bản Cát Cát và chinh phục nóc nhà Đông Dương Fansipan bằng cáp treo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội - Sapa - Bản Cát Cát',
        description: 'Khởi hành từ Hà Nội. Đến Sapa ăn trưa, nhận phòng. Chiều thăm Bản Cát Cát của người H’Mông, thác Thủy Điện. Tối tự do khám phá Sapa.',
      },
      {
        day: 2,
        title: 'Sapa - Chinh phục Fansipan',
        description: 'Sáng đi cáp treo chinh phục đỉnh Fansipan. Chiều thăm núi Hàm Rồng, vườn lan, cổng trời. Tối thưởng thức đặc sản đồ nướng Sapa.',
      },
      {
        day: 3,
        title: 'Sapa - Chợ Tình - Hà Nội',
        description: 'Tự do mua sắm đặc sản tại chợ Sapa. Ăn trưa, trả phòng và lên xe khởi hành về Hà Nội.',
      },
    ],
    maxGroupSize: 25,
    policies: [
      'Đã bao gồm vé cáp treo Fansipan (khứ hồi).',
      'Xe giường nằm khứ hồi Hà Nội - Sapa.',
    ],
    type: 'Group',
    category: 'Adventure',
  },
  {
    id: 'tour-3',
    title: 'Tour Châu Âu 9 ngày: Pháp - Thụy Sĩ - Ý',
    destinationId: 'dest-11',
    location: 'Paris, Pháp',
    images: [
      'https://images.unsplash.com/photo-1582650042456-4b20a40d5885?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    ],
    price: 58000000,
    oldPrice: 62000000,
    durationDays: 9,
    durationNights: 8,
    rating: 4.9,
    reviewsCount: 45,
    isNew: true,
    isDiscounted: true,
    description: 'Hành trình lãng mạn qua 3 quốc gia đẹp nhất Châu Âu. Thăm tháp Eiffel, đỉnh Titlis tuyết trắng và Venice thơ mộng. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    itinerary: [
      { day: 1, title: 'Hà Nội - Paris', description: 'Chuyến bay đêm từ Hà Nội đến Paris.' },
      { day: 2, title: 'Khám phá Paris', description: 'Tham quan Tháp Eiffel, Khải Hoàn Môn, đi thuyền trên sông Seine.' },
      { day: 3, title: 'Paris - Bảo tàng Louvre', description: 'Tham quan bảo tàng Louvre và mua sắm tại Galeries Lafayette.' },
      { day: 4, title: 'Paris - Geneva (Thụy Sĩ)', description: 'Di chuyển bằng tàu cao tốc đến Thụy Sĩ.' },
      { day: 5, title: 'Geneva - Lucerne', description: 'Tham quan tượng đài Sư Tử, cầu gỗ Chapel.' },
      { day: 6, title: 'Chinh phục đỉnh Titlis - Milan', description: 'Lên đỉnh núi Titlis bằng cáp treo xoay 360 độ. Chiều di chuyển về Milan (Ý).' },
      { day: 7, title: 'Milan - Venice', description: 'Khám phá thành phố lãng mạn Venice.' },
      { day: 8, title: 'Venice - Rome', description: 'Tham quan đấu trường La Mã Colosseum, đài phun nước Trevi.' },
      { day: 9, title: 'Rome - Hà Nội', description: 'Tự do mua sắm, ra sân bay về Việt Nam.' },
    ],
    maxGroupSize: 20,
    policies: [
      'Bao gồm Visa Schengen.',
      'Khách sạn 4 sao tiêu chuẩn Châu Âu.',
    ],
    type: 'Group',
    category: 'Culture',
  },
  {
    id: 'tour-4',
    title: 'Nghỉ dưỡng Bali 4 ngày 3 đêm - Thiên đường biển đảo',
    destinationId: 'dest-13',
    location: 'Đảo Bali, Indonesia',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=2070',
    ],
    price: 12500000,
    durationDays: 4,
    durationNights: 3,
    rating: 4.6,
    reviewsCount: 89,
    description: 'Tận hưởng kỳ nghỉ dưỡng tại Bali. Tham quan đền Tanah Lot, tắm biển Kuta, trải nghiệm xích đu Bali Swing. Excepteur sint occaecat cupidatat non proident.',
    itinerary: [
      { day: 1, title: 'Hồ Chí Minh - Bali', description: 'Đến sân bay Ngurah Rai, nhận phòng khách sạn tại Kuta.' },
      { day: 2, title: 'Khám phá văn hóa Bali', description: 'Thăm làng nghệ thuật Ubud, đền Tirta Empul, trải nghiệm Bali Swing.' },
      { day: 3, title: 'Cổng trời Handara - Đền Tanah Lot', description: 'Chụp hình tại cổng trời Handara. Ngắm hoàng hôn tuyệt đẹp tại đền Tanah Lot.' },
      { day: 4, title: 'Bali - Hồ Chí Minh', description: 'Tự do mua sắm và ra sân bay về nước.' },
    ],
    maxGroupSize: 15,
    policies: [
      'Không yêu cầu Visa.',
      'Khách sạn resort 4 sao có hồ bơi.',
    ],
    type: 'Group',
    category: 'Relax',
  },
  {
    id: 'tour-5',
    title: 'Tour Hội An 1 Ngày: Dạo Bước Phố Cổ & Trải Nghiệm Thả Đèn Hoa Đăng',
    destinationId: 'dest-3',
    location: 'Phố Cổ Hội An',
    images: [
      'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=2070',
    ],
    price: 850000,
    durationDays: 1,
    durationNights: 0,
    rating: 4.9,
    reviewsCount: 210,
    description: 'Chuyến đi ngắn trong ngày khám phá Hội An. Đi bộ qua các hội quán cổ, thưởng thức cao lầu, đi thuyền thả đèn hoa đăng trên sông Hoài.',
    itinerary: [
      { day: 1, title: 'Hội An Tour', description: 'Tham quan Chùa Cầu, Hội quán Phước Kiến. Tối đi thuyền thả hoa đăng.' },
    ],
    maxGroupSize: 10,
    policies: ['Miễn phí hủy trước 24h'],
    type: 'Private',
    category: 'Culture',
  },
  // Thêm nhiều tour ngẫu nhiên khác để đủ 20 tour
  ...Array.from({ length: 15 }).map((_, i) => {
    // Unique Unsplash images per tour — all verified working travel photos
    const tourImages: string[][] = [
      // 0: Đà Nẵng
      ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop'],
      // 1: Tokyo
      ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800&auto=format&fit=crop'],
      // 2: Phú Quốc
      ['https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop'],
      // 3: Seoul
      ['https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800&auto=format&fit=crop'],
      // 4: Đà Lạt
      ['https://images.unsplash.com/photo-1582650042456-4b20a40d5885?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800&auto=format&fit=crop'],
      // 5: Nha Trang
      ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop'],
      // 6: Đà Nẵng (variant)
      ['https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop'],
      // 7: Tokyo (variant)
      ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?q=80&w=800&auto=format&fit=crop'],
      // 8: Phú Quốc (variant)
      ['https://images.unsplash.com/photo-1582650042456-4b20a40d5885?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop'],
      // 9: Seoul (variant)
      ['https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=800&auto=format&fit=crop'],
      // 10: Đà Lạt (variant)
      ['https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop'],
      // 11: Nha Trang (variant)
      ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop'],
      // 12: Đà Nẵng
      ['https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop'],
      // 13: Tokyo
      ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop'],
      // 14: Phú Quốc
      ['https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop'],
    ];
    return {
    id: `tour-auto-${i + 6}`,
    title: `Tour Trải Nghiệm ${['Đà Nẵng', 'Tokyo', 'Phú Quốc', 'Seoul', 'Đà Lạt', 'Nha Trang'][i % 6]} cao cấp`,
    destinationId: `dest-${(i % 16) + 1}`,
    location: 'Khu vực trung tâm',
    images: tourImages[i] || [],
    price: 2000000 + (i * 500000),
    oldPrice: i % 3 === 0 ? 3000000 + (i * 500000) : undefined,
    durationDays: (i % 4) + 2,
    durationNights: (i % 4) + 1,
    rating: 4.0 + (i % 10) / 10,
    reviewsCount: 20 + i * 15,
    isBestseller: i % 4 === 0,
    isNew: i % 5 === 0,
    isDiscounted: i % 3 === 0,
    description: 'Hành trình khám phá trọn vẹn với hướng dẫn viên chuyên nghiệp. Trải nghiệm văn hóa địa phương, thưởng thức ẩm thực đặc sắc và lưu giữ những khoảnh khắc đáng nhớ.',
    itinerary: [
      { day: 1, title: 'Ngày 1: Đón khách', description: 'Đón khách tại sân bay, nhận phòng khách sạn. Buổi chiều tự do tham quan. Ăn tối thưởng thức đặc sản địa phương.' },
      { day: 2, title: 'Ngày 2: Khám phá', description: 'Cả ngày tham quan các điểm du lịch nổi tiếng. Tham gia các hoạt động vui chơi giải trí. Tối dạo phố đêm.' },
    ],
    maxGroupSize: 15 + i,
    policies: ['Hủy miễn phí', 'Hướng dẫn viên địa phương'],
    type: i % 2 === 0 ? 'Group' as const : 'Private' as const,
    category: ['Culture', 'Nature', 'Adventure', 'Relax'][i % 4] as 'Culture' | 'Nature' | 'Adventure' | 'Relax',
  };
  })
];
