'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/promos/PromoList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
