'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '../../stores';
import { Header } from './Header';
import { Footer } from './Footer';
import { UserSidebar } from './UserSidebar';

export function UserLayoutClient({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useUIStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return null; // or loading spinner
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex-1 flex py-8 max-w-7xl mx-auto w-full px-4 gap-8">
        <UserSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
