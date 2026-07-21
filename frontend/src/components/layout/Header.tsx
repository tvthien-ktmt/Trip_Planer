'use client';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from 'next/link';
import {
  Bell, Moon, Sun, Menu, X, User as UserIcon, Globe, LogOut,
  Heart, ShoppingCart, CheckSquare, ChevronDown, Plane,
  Search, Briefcase, CheckCircle, Clock, Map, BookOpen, Star, Info, Rss, Headphones, ChevronUp
} from "lucide-react";
import { Button } from "../ui/Button";
import { useUIStore, useAuthStore, useChecklistStore, useWishlistStore, useBookingCartStore, useNotificationStore } from "../../stores";
import { useTranslation } from "react-i18next";
import { useMounted } from "../../hooks/useMounted";
import { toast } from "sonner";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

export const Header = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedMobileNav, setExpandedMobileNav] = useState<string | null>(null);
  const pathname = usePathname();
  const navigate = useRouter();

  const mounted = useMounted();
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency } = useUIStore();
  const { isAuthenticated, user, setLoginModalOpen, logout } = useAuthStore();
  const setSidebarOpen = useChecklistStore((state) => state.setSidebarOpen);
  const wishlistCount = useWishlistStore((state) => state.tourIds.length + state.destinationIds.length);
  const cartCount = useBookingCartStore((state) => state.items.length);
  const notifications = useNotificationStore((state) => state.notifications);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  const isDark = mounted && theme === "dark";

  useEffect(() => {
    if (isAuthenticated && mounted) {
      fetchNotifications();
    }
  }, [isAuthenticated, mounted, fetchNotifications]);

  const navLinks = [
    { name: t("header.home", "Trang chủ"), path: "/" },
    { 
      name: t("header.flights", "Chuyến bay"), 
      path: "/flights/search",
      children: [
        { name: "Tìm chuyến bay", path: "/flights/search", icon: Search, desc: "Khám phá thế giới với giá tốt nhất" },
        { name: "Quản lý đặt chỗ", path: "/user/manage-booking", icon: Briefcase, desc: "Đổi ngày, nâng hạng ghế, mua hành lý" },
        { name: "Check-in Online", path: "/check-in", icon: CheckCircle, desc: "Tiết kiệm thời gian tại sân bay" },
        { name: "Trạng thái bay", path: "/flight-status", icon: Clock, desc: "Cập nhật giờ bay thực tế" },
      ]
    },
    { 
      name: t("header.tours", "Tours & Khám phá"), 
      path: "/tours",
      children: [
        { name: "Tìm Tour", path: "/tours", icon: Map, desc: "Hàng ngàn tour trọn gói ưu đãi" },
        { name: "Cẩm nang du lịch", path: "/travel-guide", icon: BookOpen, desc: "Kinh nghiệm du lịch từ A-Z" },
        { name: "Điểm đến hot", path: "/things-to-do", icon: Star, desc: "Những địa điểm không thể bỏ lỡ" },
      ]
    },
    { 
      name: t("header.more", "Khám phá thêm"), 
      path: "/about",
      children: [
        { name: "Về chúng tôi", path: "/about", icon: Info, desc: "Câu chuyện của TripPlaner" },
        { name: "Blog", path: "/blog", icon: Rss, desc: "Tin tức, ưu đãi mới nhất" },
        { name: "Hỗ trợ khách hàng", path: "/contact", icon: Headphones, desc: "Giải đáp thắc mắc 24/7" },
      ]
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất thành công");
    navigate.push("/");
  };

  const cycleCurrency = () => {
    const next = currency === "VND" ? "USD" : currency === "USD" ? "EUR" : "VND";
    setCurrency(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-main)] transition-custom"
      style={{ background: "var(--bg-surface)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">

          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-[var(--radius-radius-sm)] flex items-center justify-center"
                style={{ background: "var(--color-ocean-600)" }}>
                <Plane className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-display text-xl font-semibold text-[var(--text-primary)]">
                Trip<span style={{ color: "var(--color-coral-500)" }}>Planer</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <DesktopNav navLinks={navLinks} />
          </div>

          {/* Right: Utility Actions */}
          <div className="hidden md:flex items-center gap-1">

            {/* Utility group: Language + Currency + Dark Mode */}
            <div className="flex items-center gap-1 pr-3 mr-2 border-r border-[var(--border-main)]">
              <button
                onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
                className="flex items-center gap-1 px-2 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                aria-label="Đổi ngôn ngữ"
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>

              <button
                onClick={cycleCurrency}
                className="px-2 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium font-utility transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                aria-label="Đổi tiền tệ"
              >
                {currency}
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                aria-label={isDark ? "Chuyển chế độ sáng" : "Chuyển chế độ tối"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* User-action group */}
            {mounted ? (isAuthenticated ? (
              <div className="flex items-center gap-1">
                {/* Checklist */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                  aria-label="Checklist hành trang"
                >
                  <CheckSquare className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/user/wishlist"
                  className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                  aria-label={`Yêu thích (${wishlistCount})`}
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] text-white font-bold rounded-full"
                      style={{ background: "var(--color-coral-500)" }}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  href="/reservation"
                  className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                  aria-label={`Giỏ hàng (${cartCount})`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] text-white font-bold rounded-full"
                      style={{ background: "var(--color-coral-500)" }}>
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative group">
                  <button
                    onClick={() => setIsNotiOpen(!isNotiOpen)}
                    className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-custom rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)]"
                    aria-label="Thông báo"
                    aria-haspopup="true"
                    aria-expanded={isNotiOpen}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
                      style={{ background: "var(--color-coral-500)" }} />
                  </button>

                  {/* Desktop Dropdown via hover using group */}
                  <div className="absolute right-0 top-full mt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-[var(--shadow-shadow-lg)] z-50"
                    style={{ background: "var(--bg-surface)" }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-main)]">
                      <span className="font-semibold text-[var(--text-primary)]">Thông báo</span>
                      <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto" aria-live="polite">
                      {notifications.length > 0 ? notifications.map((n: any, i: number) => (
                        <div key={n.id || i} className={`px-4 py-3 border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-main)] transition-custom cursor-pointer ${n.readAt ? 'opacity-70' : 'bg-blue-50/10'}`}>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{n.type === 'PROMOTION' ? '🎉' : '✅'} {n.title}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{n.body}</p>
                        </div>
                      )) : (
                        <div className="px-4 py-6 text-center text-sm text-[var(--text-secondary)]">Không có thông báo nào</div>
                      )}
                    </div>
                    <div className="px-4 py-2 text-center border-t border-[var(--border-main)]">
                      <Link href="/user/notifications" className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: "var(--color-ocean-600)" }}>
                        Xem tất cả
                      </Link>
                    </div>
                  </div>
                </div>

                {/* User avatar + dropdown */}
                <div className="relative ml-2 group">
                  <button
                    className="flex items-center gap-2 pl-3 border-l border-[var(--border-main)] hover:opacity-80 transition-custom"
                    aria-haspopup="true"
                  >
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"}
                      alt={user?.name || "Avatar"}
                      className="w-8 h-8 rounded-full border-2 border-[var(--border-main)] object-cover"
                    />
                    <span className="hidden lg:block text-sm font-medium text-[var(--text-primary)]">{user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-[var(--text-secondary)] group-hover:rotate-180 transition-transform duration-200" />
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-[var(--shadow-shadow-lg)] z-50 py-1"
                    style={{ background: "var(--bg-surface)" }}>
                    <div className="px-4 py-3 border-b border-[var(--border-main)]">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                    </div>
                    <Link href="/user/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-custom">
                      <UserIcon className="w-4 h-4" /> Bảng điều khiển
                    </Link>
                    <Link href="/user/bookings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-custom">
                      <Briefcase className="w-4 h-4" /> Đặt chỗ của tôi
                    </Link>
                    <Link href="/user/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-custom">
                      <Info className="w-4 h-4" /> Cài đặt tài khoản
                    </Link>
                    <div className="my-1 border-t border-[var(--border-main)]" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--bg-main)] transition-custom"
                      style={{ color: "var(--color-danger)" }}
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 ml-2 border-l border-[var(--border-main)]">
                <Button onClick={() => navigate.push('/login')} variant="outline" size="sm" className="hidden lg:flex" style={{ color: "var(--color-ocean-600)", borderColor: "var(--color-ocean-600)" }}>
                  {t("header.login", "Đăng nhập")}
                </Button>
                <Button onClick={() => navigate.push('/register')} variant="primary" size="sm">
                  {t("header.register", "Đăng ký")}
                </Button>
              </div>
            )) : <div className="w-32"></div>} 
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)]" aria-label="Đổi giao diện">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[var(--text-primary)]"
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <MobileNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navLinks={navLinks}
        expandedMobileNav={expandedMobileNav}
        setExpandedMobileNav={setExpandedMobileNav}
        language={language}
        setLanguage={setLanguage as any}
        currency={currency}
        cycleCurrency={cycleCurrency}
        mounted={mounted}
        isAuthenticated={isAuthenticated}
        user={user}
        handleLogout={handleLogout}
      />
    </header>
  );
};
