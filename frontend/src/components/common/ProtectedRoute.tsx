import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/403');
    }
  }, [mounted, isAuthenticated, user, allowedRoles, pathname, router]);

  if (!mounted) return null; // Prevent hydration mismatch

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
