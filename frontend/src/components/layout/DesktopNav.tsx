import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export const DesktopNav = ({ navLinks }: { navLinks: { name: string; path: string; icon?: React.ElementType; children?: { name: string; path: string; icon: React.ElementType }[] }[] }) => {
  const pathname = usePathname();

  return (
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
                  {link.children.map((child: { path: string; name: string; icon: React.ElementType }) => (
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
                          {(child as any).desc}
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
  );
};
