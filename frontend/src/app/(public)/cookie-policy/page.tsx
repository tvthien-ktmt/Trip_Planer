'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/CookiePolicy'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
