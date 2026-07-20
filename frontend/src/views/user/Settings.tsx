'use client';
import { useState } from 'react';
import { useAuthStore, useUIStore, useWishlistStore } from '../../stores';
import { useToursQuery } from '../../hooks/queries';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, History, Heart, Settings as SettingsIcon, LogOut, ChevronRight } from 'lucide-react';
import { PriceTag } from '../../components/common/PriceTag';
import { RatingStars } from '../../components/common/RatingStars';
import { routes } from '../../lib/routes';

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency } = useUIStore();
  const { tourIds: wishlist, toggleTour } = useWishlistStore();
  const { data: tours } = useToursQuery();
  const navigate = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist' | 'preferences'>('profile');

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem trang cá nhân và lịch sử đặt chỗ.</p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate.push('/');
  };

  const wishlistTours = tours?.filter(t => wishlist.includes(t.id)) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Tài khoản của tôi</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
            { id: 'bookings', label: 'Lịch sử đặt chỗ', icon: History },
            { id: 'wishlist', label: 'Danh sách yêu thích', icon: Heart },
            { id: 'preferences', label: 'Cài đặt giao diện', icon: SettingsIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'profile' | 'bookings' | 'wishlist' | 'preferences')}
              className={`w-full flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors mt-4"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Hồ sơ cá nhân</h2>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                <div className="w-24 h-24 bg-blue-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-blue-600 dark:text-gray-300 text-3xl font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <button className="mt-2 text-sm text-blue-600 font-medium hover:underline">Thay đổi ảnh đại diện</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                  <input type="text" defaultValue={user?.name} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                  <input type="text" defaultValue={user?.phone || '0987654321'} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" defaultValue={user?.email} disabled className="w-full p-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg dark:bg-gray-900 dark:border-gray-800" />
                </div>
              </div>
              <div className="mt-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử đặt chỗ</h2>
              <div className="space-y-4">
                {/* Mock Booking Item */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070" className="w-full h-full object-cover" alt="tour" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">Khám phá Vịnh Hạ Long 2 ngày 1 đêm</h4>
                      <span className="px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-600">Đã xác nhận</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Ngày đi: 20/08/2024</div>
                    <div className="text-sm text-gray-500 mb-2">Khách: 2 Người lớn</div>
                    <div className="flex justify-between items-end">
                      <PriceTag amount={6400000} className="font-bold" />
                      <button className="text-sm text-blue-600 font-medium hover:underline">Xem chi tiết</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Danh sách yêu thích</h2>
              {wishlistTours.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Danh sách trống.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {wishlistTours.map(tour => (
                    <div key={tour.id} className="flex gap-4 border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0">
                      <img src={tour.images[0]} alt={tour.title} className="w-32 h-32 rounded-xl object-cover" />
                      <div className="flex-1 flex flex-col">
                        <Link href={routes.tourDetail(tour.id)} className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 line-clamp-2 mb-1">{tour.title}</Link>
                        <RatingStars rating={tour.rating} className="mb-2" />
                        <div className="mt-auto flex justify-between items-end">
                          <PriceTag amount={tour.price} className="font-bold text-blue-600 text-lg" />
                          <button onClick={() => toggleTour(tour.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                            <Heart className="w-5 h-5 fill-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Cài đặt giao diện</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chế độ hiển thị (Theme)</label>
                  <div className="flex gap-4">
                    <button onClick={toggleTheme} className={`flex-1 py-2 rounded-lg border font-medium ${theme === 'light' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}>Sáng</button>
                    <button onClick={toggleTheme} className={`flex-1 py-2 rounded-lg border font-medium ${theme === 'dark' ? 'border-blue-600 text-blue-600 bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 text-gray-700'}`}>Tối</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngôn ngữ</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiền tệ</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as 'VND' | 'USD' | 'EUR')} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value="VND">VND (₫)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
