'use client';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import Link from 'next/link';
import {
  Bell, Moon, Sun, Menu, X, User as UserIcon, Globe, LogOut,
  Heart, ShoppingCart, CheckSquare, ChevronDown, Plane,
  Search, Briefcase, CheckCircle, Clock, Map, BookOpen, Star, Info, Rss, Headphones, ChevronUp
} from "lucide-react";
import { Button } from "../ui/Button";
import { useUIStore, useAuthStore, useChecklistStore, useWishlistStore, useBookingCartStore } from "../../stores";
import { useTranslation } from "react-i18next";
import { useMounted } from "../../hooks/useMounted";
import { toast } from "sonner";

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

  const isDark = mounted && theme === "dark";

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
            <nav className="hidden md:flex items-center gap-1" aria-label="Menu chính">
              {navLinks.map((link) => (
                link.children ? (
                  <div key={link.path} className="relative group">
                    <Link
                      href={link.path}
                      className={`flex items-center gap-1 px-4 py-2 rounded-[var(--radius-radius-sm)] text-sm font-medium transition-custom ${
                        pathname?.startsWith(link.path) && link.path !== '/'
                          ? "text-[var(--color-ocean-900)] bg-[var(--color-mist-50)] font-semibold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                    </Link>
                    
                    {/* Mega Menu Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50">
                      <div className="rounded-[var(--radius-radius-lg)] border border-[var(--border-main)] shadow-[var(--shadow-shadow-lg)] overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                        <div className="p-3 grid grid-cols-1 gap-1">
                          {link.children.map((child) => (
                            <Link 
                              key={child.path} 
                              href={child.path}
                              className="flex items-start gap-3 p-3 rounded-[var(--radius-radius-sm)] hover:bg-[var(--bg-main)] transition-custom group/item"
                            >
                              <div className="mt-0.5 p-2 rounded-md bg-[var(--color-ocean-50)] text-[var(--color-ocean-600)] group-hover/item:bg-[var(--color-ocean-600)] group-hover/item:text-white transition-colors">
                                <child.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover/item:text-[var(--color-ocean-600)] transition-colors">
                                  {child.name}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                  {child.desc}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 py-2 rounded-[var(--radius-radius-sm)] text-sm font-medium transition-custom ${
                      (pathname || "") === link.path
                        ? "text-[var(--color-ocean-900)] bg-[var(--color-mist-50)] font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </nav>
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
                      {[
                        { icon: "🎉", title: "Ưu đãi 20% Tour Đà Lạt", desc: "Áp dụng cho booking nhóm 4 người trở lên." },
                        { icon: "✅", title: "Booking #TRIP123 thành công", desc: "Cảm ơn bạn đã đặt tour. Vui lòng kiểm tra email." },
                      ].map((n, i) => (
                        <div key={i} className="px-4 py-3 border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-main)] transition-custom cursor-pointer">
                          <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{n.icon} {n.title}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{n.desc}</p>
                        </div>
                      ))}
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
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-main)] overflow-y-auto max-h-[calc(100vh-72px)] shadow-[var(--shadow-shadow-lg)]" style={{ background: "var(--bg-surface)" }}>
          <nav className="px-4 py-4 space-y-2" aria-label="Mobile menu">
            {navLinks.map((link) => (
              <div key={link.path}>
                {link.children ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => setExpandedMobileNav(expandedMobileNav === link.path ? null : link.path)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-radius-sm)] text-base font-medium transition-custom ${
                        pathname?.startsWith(link.path)
                          ? "font-semibold bg-[var(--color-mist-50)] text-[var(--color-ocean-900)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                      }`}
                    >
                      {link.name}
                      {expandedMobileNav === link.path ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedMobileNav === link.path && (
                      <div className="px-2 py-2 space-y-1 bg-[var(--bg-main)] rounded-[var(--radius-radius-md)] mt-1 border border-[var(--border-main)]">
                        {link.children.map(child => (
                          <Link
                            key={child.path}
                            href={child.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-radius-sm)] text-sm text-[var(--text-primary)] hover:text-[var(--color-ocean-600)] hover:bg-[var(--color-ocean-50)] transition-custom"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <child.icon className="w-4 h-4 opacity-70" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.path}
                    className={`block px-4 py-3 rounded-[var(--radius-radius-sm)] text-base font-medium transition-custom ${
                      (pathname || "") === link.path
                        ? "font-semibold bg-[var(--color-mist-50)] text-[var(--color-ocean-900)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="px-4 pb-4 flex items-center gap-4 border-t border-[var(--border-main)] pt-4">
            <button onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
              <Globe className="w-4 h-4" /> {language.toUpperCase()}
            </button>
            <button onClick={cycleCurrency}
              className="text-sm font-medium font-utility text-[var(--text-secondary)]">{currency}</button>
          </div>

          <div className="px-4 pb-6 border-t border-[var(--border-main)] pt-4">
            {mounted ? (isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 mb-4">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full border-2 border-[var(--border-main)] object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{user?.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                  </div>
                </div>
                <Link href="/user/dashboard" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 px-2 text-[var(--text-primary)] font-medium hover:bg-[var(--bg-main)] rounded-[var(--radius-radius-sm)] transition-custom">
                  <UserIcon className="w-5 h-5 text-[var(--text-secondary)]" /> Tài khoản của tôi
                </Link>
                <Link href="/user/bookings" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 px-2 text-[var(--text-primary)] font-medium hover:bg-[var(--bg-main)] rounded-[var(--radius-radius-sm)] transition-custom">
                  <Briefcase className="w-5 h-5 text-[var(--text-secondary)]" /> Đặt chỗ của tôi
                </Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 py-2 px-2 w-full text-left font-medium hover:bg-[var(--bg-main)] rounded-[var(--radius-radius-sm)] transition-custom mt-2"
                  style={{ color: "var(--color-danger)" }}>
                  <LogOut className="w-5 h-5" /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button fullWidth variant="outline" onClick={() => { navigate.push('/login'); setIsMobileMenuOpen(false); }}>
                  Đăng nhập
                </Button>
                <Button fullWidth variant="primary" onClick={() => { navigate.push('/register'); setIsMobileMenuOpen(false); }}>
                  Đăng ký tài khoản
                </Button>
              </div>
            )) : <div className="h-32"></div>}
          </div>
        </div>
      )}
    </header>
  );
};
