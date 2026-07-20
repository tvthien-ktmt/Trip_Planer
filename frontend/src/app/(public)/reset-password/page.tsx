'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PageComponent = dynamic(() => import('@/views/public/auth/ResetPassword'));

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PageComponent />
      </Suspense>
    </>
  );
}
