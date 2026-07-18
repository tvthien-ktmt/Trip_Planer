'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/auth/ForgotPassword'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
