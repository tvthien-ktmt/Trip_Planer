export * from './flight';

export type DestinationCategory = 'Việt Nam' | 'Quốc Tế';
export type DestinationTag = 'Biển' | 'Núi' | 'Thành phố' | 'Văn hóa' | 'Nghỉ dưỡng' | 'Lịch sử';

export interface Destination {
  id: string;
  name: string;           // Tên địa danh (e.g. Hạ Long, Paris)
  location: string;       // Vị trí chi tiết (e.g. "Miền Bắc, Việt Nam")
  country: string;        // Quốc gia
  category: DestinationCategory;
  tags: DestinationTag[];
  image: string;          // Ảnh thumbnail
  rating: number;         // Đánh giá trung bình
  reviewsCount: number;   // Tổng số lượt đánh giá
  description: string;    // Mô tả ngắn
  region: 'Vietnam' | 'Asia' | 'Europe' | 'Americas' | 'Other';
  priceFrom?: number;     // Giá khởi điểm (VND)
}

export interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  idNumber: string;
  idExpiry?: string;
  nationality: string;
}

export interface TourItinerary {
  day: number;
  title: string;
  description: string;
}

export interface Tour {
  id: string;
  title: string;
  destinationId: string;
  location: string; // Vị trí cụ thể
  images: string[]; // Mảng ảnh
  price: number; // Giá hiện tại
  oldPrice?: number; // Giá cũ (để gạch ngang)
  durationDays: number; // Số ngày
  durationNights: number; // Số đêm
  rating: number;
  reviewsCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  isDiscounted?: boolean;
  description: string;
  itinerary: TourItinerary[];
  maxGroupSize: number;
  policies: string[];
  type: 'Group' | 'Private'; // Loại tour
  category: 'Culture' | 'Nature' | 'Adventure' | 'Relax';
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  images: string[];
}

export interface Review {
  id: string;
  tourId: string;
  userId: string;
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface BookingPax {
  adults: number;
  children: number;
  infants: number;
}

export interface BookingContact {
  fullName: string;
  email: string;
  phone: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  tourId: string;
  userId?: string; // Tùy chọn nếu đặt không cần đăng nhập
  date: string; // Ngày khởi hành
  pax: BookingPax;
  totalAmount: number;
  status: BookingStatus;
  contactInfo: BookingContact;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  dob?: string;
  status?: string;
  createdAt?: string;
  membershipTier?: string;
  role: 'USER' | 'ADMIN' | 'STAFF';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number; // Phút
  category: 'Cuisine' | 'Experience' | 'Destination' | 'Tips';
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  category: 'Documents' | 'Luggage' | 'Health' | 'Finance' | 'Other';
}

export interface ChecklistTemplate {
  id: string;
  name: string; // e.g. "Beach Holiday", "Mountain Trekking"
  items: Omit<ChecklistItem, 'id' | 'isCompleted'>[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Booking' | 'Payment' | 'Cancellation' | 'Account';
}
