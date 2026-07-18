'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/internal/StyleGuide'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
