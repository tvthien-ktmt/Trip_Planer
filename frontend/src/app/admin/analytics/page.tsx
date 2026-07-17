'use client';
import dynamic from 'next/dynamic';
import { AdminLayout } from '@/components/layout/AdminLayout';

const PageComponent = dynamic(() => import('@/views/admin/analytics/Analytics'));

export default function Page() {
  return (
    <AdminLayout>
      <PageComponent />
    </AdminLayout>
  );
}
