'use client';
import dynamic from 'next/dynamic';
import { PublicLayout } from '@/components/layout/PublicLayout';

const PageComponent = dynamic(() => import('@/views/public/Home'));

export default function Page() {
  return (
    <PublicLayout>
      <PageComponent />
    </PublicLayout>
  );
}
