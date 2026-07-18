'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/AdminLogin'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
