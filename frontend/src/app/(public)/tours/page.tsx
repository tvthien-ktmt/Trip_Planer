'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/Tours'));

import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageComponent />
      </Suspense>
    </>
  );
}
