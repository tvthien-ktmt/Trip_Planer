import Link from 'next/link';

import { Plane, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useUIStore } from "../../stores";

const FacebookIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const TwitterIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const InstagramIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;

export const Footer = () => {
  const { language, setLanguage, currency, setCurrency } = useUIStore();

  const columns = [
    {
      title: "Về chúng tôi",
      links: [
        { label: "Giới thiệu", to: "/about" },
        { label: "Tuyển dụng", to: "/careers" },
        { label: "Blog du lịch", to: "/blog" },
        { label: "Tin tức", to: "/blog" },
      ],
    },
    {
      title: "Khám phá",
      links: [
        { label: "Tour nổi bật", to: "/tours" },
        { label: "Tìm chuyến bay", to: "/flights/search" },
        { label: "Cẩm nang du lịch", to: "/travel-guide" },
        { label: "Địa điểm hay", to: "/things-to-do" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Câu hỏi thường gặp", to: "/faq" },
        { label: "Liên hệ", to: "/contact" },
        { label: "Điều khoản sử dụng", to: "/terms" },
        { label: "Chính sách bảo mật", to: "/privacy" },
      ],
    },
  ];

  return (
    <footer style={{ background: "var(--color-ocean-900)", color: "var(--color-ink-50-dark)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-[var(--radius-radius-sm)] flex items-center justify-center"
                style={{ background: "var(--color-ocean-600)" }}>
                <Plane className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-display text-xl font-semibold text-white">
                Trip<span style={{ color: "var(--color-lantern-500)" }}>Planer</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed mb-6 opacity-75 max-w-sm">
              Cầu nối giữa vẻ đẹp bản địa Việt Nam và sự rộng lớn của thế giới.
              Mỗi hành trình là một câu chuyện đáng nhớ.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm opacity-75 mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>1800 6789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>support@tripplaner.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: FacebookIcon, label: "Facebook" },
                { icon: TwitterIcon, label: "Twitter" },
                { icon: InstagramIcon, label: "Instagram" },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 rounded-[var(--radius-radius-sm)] flex items-center justify-center transition-custom hover:opacity-100 opacity-60"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.to}
                      className="text-sm opacity-60 hover:opacity-100 hover:text-white transition-custom flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="rounded-[var(--radius-radius-md)] p-6 mb-10"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="font-semibold text-white mb-1">Nhận ưu đãi độc quyền</p>
              <p className="text-sm opacity-60">Đăng ký nhận tin để không bỏ lỡ các deal du lịch hấp dẫn.</p>
            </div>
            <form className="flex w-full sm:w-auto gap-2" onSubmit={(e) => { e.preventDefault(); import('sonner').then(m => m.toast.success("Cảm ơn bạn đã đăng ký!")); }}>
              <label htmlFor="footer-email" className="sr-only">Email của bạn</label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="email@example.com"
                className="px-4 py-2 rounded-[var(--radius-radius-sm)] text-sm font-body text-[var(--color-ink-900)] flex-1 sm:w-60 focus:outline-none focus:ring-2"
                style={{ background: "rgba(255,255,255,0.92)", outlineColor: "var(--color-lantern-500)" }}
              />
              <button type="submit"
                className="px-4 py-2 rounded-[var(--radius-radius-sm)] text-sm font-semibold text-white transition-custom hover:opacity-90 flex-shrink-0"
                style={{ background: "var(--color-coral-500)" }}>
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-sm opacity-50">© {new Date().getFullYear()} TripPlaner. Đã đăng ký bản quyền.</p>

          {/* Language + Currency switcher repeats at bottom per spec */}
          <div className="flex items-center gap-4 text-sm opacity-60">
            <button onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              className="hover:opacity-100 transition-custom font-medium">
              {language === "vi" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
            </button>
            <span>|</span>
            <button onClick={() => setCurrency(currency === "VND" ? "USD" : currency === "USD" ? "EUR" : "VND")}
              className="hover:opacity-100 transition-custom font-utility font-medium">
              {currency}
            </button>
            <span>|</span>
            <Link href="/privacy" className="hover:opacity-100 transition-custom">Bảo mật</Link>
            <Link href="/terms" className="hover:opacity-100 transition-custom">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
