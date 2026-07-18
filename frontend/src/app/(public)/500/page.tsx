'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/errors/ServerError'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
