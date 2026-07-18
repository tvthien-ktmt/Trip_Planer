'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/promos/PromoCreate'));

export default function Page() {
  return (
    <PageComponent />
  );
}
