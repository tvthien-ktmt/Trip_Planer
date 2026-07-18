'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/errors/Forbidden'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
