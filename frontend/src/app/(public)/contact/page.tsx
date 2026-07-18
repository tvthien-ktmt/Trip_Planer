'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/ContactUs'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
