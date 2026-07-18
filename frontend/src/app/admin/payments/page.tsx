'use client';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/admin/payments/PaymentList'));

export default function Page() {
  return (
    <PageComponent />
  );
}
