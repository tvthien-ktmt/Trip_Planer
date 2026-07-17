'use client';
import dynamic from 'next/dynamic';
import { UserLayout } from '@/components/layout/UserLayout';

const PageComponent = dynamic(() => import('@/views/user/Profile'));

export default function Page() {
  return (
    <UserLayout>
      <PageComponent />
    </UserLayout>
  );
}
