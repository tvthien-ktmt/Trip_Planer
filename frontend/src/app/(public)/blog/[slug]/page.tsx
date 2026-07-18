'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/BlogDetail'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
