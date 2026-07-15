import { usePathname } from 'next/navigation';
﻿import Link from 'next/link';

import { LayoutDashboard, Plane, Ticket, Users, Map, BarChart3, Tag, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores";

const menu = [
  { name: "Tổng quan", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Chuyến bay", path: "/admin/flights", icon: Plane },
  { name: "Đặt chỗ", path: "/admin/bookings", icon: Ticket },
  { name: "Khách hàng", path: "/admin/users", icon: Users },
  { name: "Tours & Bài viết", path: "/admin/tours", icon: Map },
  { name: "Báo cáo", path: "/admin/reports/revenue", icon: BarChart3 },
  { name: "Khuyến mãi", path: "/admin/promos", icon: Tag },
  { name: "Hệ thống", path: "/admin/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  return (
    <div className="w-64 min-h-screen flex flex-col fixed left-0 top-0 z-50"
      style={{ background: "var(--color-ocean-900)" }}>

      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-7 h-7 rounded-[var(--radius-radius-sm)] flex items-center justify-center"
          style={{ background: "var(--color-lantern-500)" }}>
          <Plane className="w-4 h-4" style={{ color: "var(--color-ink-900)" }} strokeWidth={2} />
        </div>
        <div>
          <span className="font-display font-semibold text-white text-base">
            Trip<span style={{ color: "var(--color-lantern-500)" }}>Admin</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
        {menu.map(({ name, path, icon: Icon }) => {
          const isActive = (pathname || "") === path || (pathname || "").startsWith(path);
          return (
          <Link
            key={path}
            href={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-radius-sm)] text-sm font-medium transition-custom ${
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
            style={isActive ? { background: "rgba(255,255,255,0.10)" } : {}}
          >
            <>
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {name}
            </>
          </Link>
        )})}
      </nav>

      {/* User profile + logout */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img src={user.avatar || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop"} alt={user.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-radius-sm)] text-sm font-medium transition-custom hover:bg-white/5"
          style={{ color: "var(--color-coral-500-dark)" }}
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};
