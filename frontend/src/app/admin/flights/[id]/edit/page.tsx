'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/flights/FlightEdit'));

export default function Page() {
  return (
    <PageComponent />
  );
}
