import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Globe, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { User as UserIcon, Briefcase } from 'lucide-react';

export const MobileNav = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navLinks,
  expandedMobileNav,
  setExpandedMobileNav,
  language,
  setLanguage,
  currency,
  cycleCurrency,
  mounted,
  isAuthenticated,
  user,
  handleLogout,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  navLinks: { name: string; path: string; icon?: React.ElementType; children?: { name: string; path: string; icon: React.ElementType }[] }[];
  expandedMobileNav: string | null;
  setExpandedMobileNav: (v: string | null) => void;
  language: string;
  setLanguage: (v: string) => void;
  currency: string;
  cycleCurrency: () => void;
  mounted: boolean;
  isAuthenticated: boolean;
  user: { name: string; email: string; avatar?: string } | null;
  handleLogout: () => void;
}) => {
  const pathname = usePathname();
  const navigate = useRouter();

  if (!isMobileMenuOpen) return null;

  return (
    <div className="md:hidden border-t border-[var(--border-main)] overflow-y-auto max-h-[calc(100vh-72px)] shadow-[var(--shadow-shadow-lg)]" style={{ background: "var(--bg-surface)" }}>
      <nav className="px-4 py-4 space-y-2" aria-label="Mobile menu">
        {navLinks.map((link: { name: string; path: string; children?: { path: string; name: string; icon: React.ElementType }[] }) => (
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
                    {link.children.map((child: { path: string; name: string; icon: React.ElementType }) => (
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
  );
};
