'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/analytics/Analytics'));

export default function Page() {
  return (
    <PageComponent />
  );
}
