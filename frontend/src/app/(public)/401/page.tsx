'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/errors/Unauthorized'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
