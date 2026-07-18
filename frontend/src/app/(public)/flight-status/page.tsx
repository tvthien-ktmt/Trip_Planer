'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/FlightStatus'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
