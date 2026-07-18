'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/flights/SearchFlight'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
