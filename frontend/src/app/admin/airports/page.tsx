'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/airports/AirportList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
