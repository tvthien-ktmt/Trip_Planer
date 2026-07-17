'use client';
import dynamic from 'next/dynamic';
import { PublicLayout } from '@/components/layout/PublicLayout';

const PageComponent = dynamic(() => import('@/views/public/auth/Login'));

import { Suspense } from 'react';

export default function Page() {
  return (
    <PublicLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <PageComponent />
      </Suspense>
    </PublicLayout>
  );
}
