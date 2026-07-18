'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/flights/FlightResults'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
