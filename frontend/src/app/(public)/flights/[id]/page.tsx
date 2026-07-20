'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PageComponent = dynamic(() => import('@/views/public/flights/FlightDetail'));

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageComponent />
      </Suspense>
    </>
  );
}
