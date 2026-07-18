'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/tours/TourCreate'));

export default function Page() {
  return (
    <PageComponent />
  );
}
