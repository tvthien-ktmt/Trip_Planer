'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/users/UserEdit'));

export default function Page() {
  return (
    <PageComponent />
  );
}
