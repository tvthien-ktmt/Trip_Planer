'use client';
import dynamic from 'next/dynamic';
import { AdminLayout } from '@/components/layout/AdminLayout';

const PageComponent = dynamic(() => import('@/views/admin/flights/FlightCreate'), { ssr: false });

export default function Page() {
  return (
    <AdminLayout>
      <PageComponent />
    </AdminLayout>
  );
}
