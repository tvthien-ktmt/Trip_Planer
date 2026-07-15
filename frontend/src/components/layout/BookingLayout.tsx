'use client';
import { useRouter, usePathname } from 'next/navigation';
import { BookingProgressBar } from '../booking/BookingProgressBar';
import { BookingSummarySidebar } from '../booking/BookingSummarySidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useBookingFlowStore } from '../../stores';
import { useEffect } from 'react';

const stepPaths = [
  '/booking/fare-class',
  '/booking/passenger-info',
  '/booking/seat-selection',
  '/booking/baggage',
  '/booking/meal',
  '/booking/add-ons',
  '/booking/payment',
  '/booking/success',
];

export const BookingLayout = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();
  const navigate = useRouter();
  const { currentStep, selectedOutboundFlightId } = useBookingFlowStore();

  useEffect(() => {
    // If no flight selected, redirect to search
    if (!selectedOutboundFlightId && (pathname || "") !== '/booking/success') {
      navigate.replace('/flights/search');
      return;
    }

    const currentPathIndex = stepPaths.findIndex(p => (pathname || "").includes(p));
    if (currentPathIndex !== -1 && currentPathIndex + 1 > currentStep) {
      navigate.replace(stepPaths[currentStep - 1] || '/booking/fare-class');
    }
  }, [pathname, currentStep, navigate, selectedOutboundFlightId]);

  const isSuccessPage = (pathname || "").includes('/booking/success');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      <Header />
      {!isSuccessPage && <BookingProgressBar />}
      
      <main className="flex-1 flex flex-col py-[var(--spacing-space-8)] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-[var(--spacing-space-8)] items-start">
          <div className="flex-1 w-full">
            {children}
          </div>
          {!isSuccessPage && <BookingSummarySidebar />}
        </div>
      </main>

      {/* Mobile sticky summary bar would go here, shown only on small screens */}
      {!isSuccessPage && (
        <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-main)] p-4 shadow-[var(--shadow-shadow-lg)] z-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[var(--text-secondary)] text-xs">Tổng cộng</p>
              <p className="font-display font-bold text-[var(--color-coral-500)]">
                3,600,000 ₫
              </p>
            </div>
            <button className="text-[var(--color-ocean-600)] text-sm font-semibold underline">
              Xem chi tiết
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
