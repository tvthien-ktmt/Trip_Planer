'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/user/Membership'));

export default function Page() {
  return (
    <PageComponent />
  );
}
