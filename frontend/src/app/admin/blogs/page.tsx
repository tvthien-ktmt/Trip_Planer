'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/blogs/BlogList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
