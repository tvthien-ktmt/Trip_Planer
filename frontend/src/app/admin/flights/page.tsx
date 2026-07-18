'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/flights/FlightList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
