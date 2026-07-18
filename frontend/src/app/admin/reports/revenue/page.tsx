'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/reports/RevenueReport'));

export default function Page() {
  return (
    <PageComponent />
  );
}
