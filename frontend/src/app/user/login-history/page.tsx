'use client';
import dynamic from 'next/dynamic';
import { UserLayout } from '@/components/layout/UserLayout';

const PageComponent = dynamic(() => import('@/views/user/LoginHistory'), { ssr: false });

export default function Page() {
  return (
    <UserLayout>
      <PageComponent />
    </UserLayout>
  );
}
