'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/TravelGuide'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
