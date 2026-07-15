'use client';
import dynamic from 'next/dynamic';
import { BookingLayout } from '@/components/layout/BookingLayout';

const PageComponent = dynamic(() => import('@/views/booking/Meal'), { ssr: false });

export default function Page() {
  return (
    <BookingLayout>
      <PageComponent />
    </BookingLayout>
  );
}
