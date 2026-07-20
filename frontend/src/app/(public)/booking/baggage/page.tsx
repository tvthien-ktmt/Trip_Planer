'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/booking/Baggage'));

export default function Page() {
  return (
    <PageComponent />
  );
}
