'use client';
import dynamic from 'next/dynamic';
import { BookingLayout } from '@/components/layout/BookingLayout';

const PageComponent = dynamic(() => import('@/views/booking/FareClass'));

export default function Page() {
  return (
    <BookingLayout>
      <PageComponent />
    </BookingLayout>
  );
}
