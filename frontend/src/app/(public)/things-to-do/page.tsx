'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/public/ThingsToDo'));

export default function Page() {
  return (
    <>
      <PageComponent />
    </>
  );
}
