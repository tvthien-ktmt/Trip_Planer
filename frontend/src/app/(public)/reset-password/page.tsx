'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/auth/ResetPassword'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
