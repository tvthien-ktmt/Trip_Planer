'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/bookings/BookingList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
