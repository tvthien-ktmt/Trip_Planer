'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/Blog'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
