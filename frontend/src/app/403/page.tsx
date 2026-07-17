'use client';
import dynamic from 'next/dynamic';
import { PublicLayout } from '@/components/layout/PublicLayout';

const PageComponent = dynamic(() => import('@/views/errors/Forbidden'));

export default function Page() {
  return (
    <PublicLayout>
      <PageComponent />
    </PublicLayout>
  );
}
