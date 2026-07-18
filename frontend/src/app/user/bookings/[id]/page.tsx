'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/user/BookingDetail'));

export default function Page() {
  return (
    <PageComponent />
  );
}
