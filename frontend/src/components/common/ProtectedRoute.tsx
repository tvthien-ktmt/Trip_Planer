import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
       router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
    }
    return null;
  }

  return <>{children}</>;
};
