'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/tours/TourList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
