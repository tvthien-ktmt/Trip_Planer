'use client';
import dynamic from 'next/dynamic';
import { PublicLayout } from '@/components/layout/PublicLayout';

const PageComponent = dynamic(() => import('@/views/admin/AdminLogin'), { ssr: false });

export default function Page() {
  return (
    <PublicLayout>
      <PageComponent />
    </PublicLayout>
  );
}
