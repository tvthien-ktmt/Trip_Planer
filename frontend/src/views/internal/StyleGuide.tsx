'use client';
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/common/Card';
import { RouteLine } from '../../components/ui/RouteLine';
import { Skeleton } from '../../components/common/Skeleton';
import { Modal } from '../../components/common/Modal';
import { Search, MapPin, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function StyleGuide() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div>
          <h1 className="font-display text-[var(--text-display-lg)] font-bold text-[var(--text-primary)]">Trip Planer Style Guide</h1>
          <p className="text-[var(--text-body-lg)] text-[var(--text-secondary)] mt-2">Hệ thống Design System & Components</p>
        </div>

        {/* Colors */}
        <section>
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">Màu sắc (Colors)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 rounded-lg bg-[var(--color-ocean-900)] flex items-end p-3 text-white font-utility text-xs">ocean-900</div>
            <div className="h-24 rounded-lg bg-[var(--color-ocean-600)] flex items-end p-3 text-white font-utility text-xs">ocean-600</div>
            <div className="h-24 rounded-lg bg-[var(--color-lantern-500)] flex items-end p-3 text-white font-utility text-xs">lantern-500</div>
            <div className="h-24 rounded-lg bg-[var(--color-coral-500)] flex items-end p-3 text-white font-utility text-xs">coral-500</div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" size="lg">Primary Lg</Button>
            <Button variant="cta" size="lg">CTA Lg</Button>
            <Button variant="secondary" size="md">Secondary Md</Button>
            <Button variant="ghost" size="sm">Ghost Sm</Button>
            <Button variant="primary" isLoading>Đang tải</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="max-w-md space-y-6">
          <h2 className="font-display text-[var(--text-heading)] font-semibold">Inputs</h2>
          <Input label="Email Address" placeholder="Nhập email..." leftIcon={<Search className="w-4 h-4" />} />
          <Input label="Mật khẩu" type="password" error="Mật khẩu không được để trống" />
        </section>

        {/* Cards & RouteLine */}
        <section>
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">Cards & RouteLine</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="base">
              <h3 className="font-display text-[var(--text-heading)] font-semibold mb-2">Card cơ bản</h3>
              <p className="text-[var(--text-secondary)] text-[var(--text-body)]">Nội dung text đơn giản, radius-md, shadow-sm tĩnh.</p>
            </Card>

            <Card 
              variant="destination" 
              image="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=600&auto=format&fit=crop"
              badge={<span className="bg-[var(--color-lantern-500)] text-[var(--color-ink-900)] text-xs font-bold px-2 py-1 rounded-full">Hot</span>}
            >
              <h3 className="font-display text-[var(--text-heading)] font-semibold mb-1">Đà Nẵng, Việt Nam</h3>
              <p className="text-[var(--text-secondary)] text-[var(--text-caption)] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Thành phố đáng sống
              </p>
            </Card>

            <Card variant="tour" image="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop">
              <h3 className="font-display text-[var(--text-heading)] font-semibold mb-3 hover:text-[var(--color-ocean-600)] transition-custom">Tour Vịnh Hạ Long 2N1Đ</h3>
              <div className="mt-auto flex justify-between items-end">
                <span className="font-display font-bold text-[var(--text-heading)] text-[var(--color-coral-500)]">2.500.000 ₫</span>
                <Button size="sm">Đặt ngay</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Progress Bar & RouteLine variants */}
        <section className="bg-[var(--bg-surface)] p-6 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-[var(--shadow-shadow-sm)]">
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">RouteLine Signatures</h2>
          <div className="space-y-8">
            <div>
              <p className="text-[var(--text-caption)] text-[var(--text-secondary)] mb-2">Variant: Progress</p>
              <RouteLine variant="progress" progress={65} color="var(--color-ocean-900)" label="Đang làm thủ tục (65%)" />
            </div>
            <div className="max-w-xs">
              <p className="text-[var(--text-caption)] text-[var(--text-secondary)] mb-2">Variant: Timeline</p>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-ocean-900)] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <RouteLine variant="timeline" className="h-16 mt-2" color="var(--color-ocean-600)" />
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ocean-600)] bg-[var(--bg-surface)] text-[var(--color-ocean-600)] flex items-center justify-center text-xs font-bold mt-2">2</div>
                </div>
                <div className="pt-1">
                  <p className="font-semibold">SGN - HAN</p>
                  <p className="text-[var(--text-caption)] text-[var(--text-secondary)] mt-12">HAN - DAD</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Toasts */}
        <section>
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">Toasts (Sonner)</h2>
          <div className="flex gap-4">
            <Button onClick={() => toast.success('Đặt vé thành công!')}>Success Toast</Button>
            <Button onClick={() => toast.error('Lỗi thanh toán!')} variant="secondary">Error Toast</Button>
            <Button onClick={() => toast.info('Chuyến bay dời giờ')} variant="ghost">Info Toast</Button>
          </div>
        </section>

        {/* Modal */}
        <section>
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">Modal & Overlay</h2>
          <Button onClick={() => setModalOpen(true)}>Mở Modal Đăng Nhập Mẫu</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Đăng nhập để tiếp tục">
            <div className="space-y-4">
              <Input label="Email" />
              <Input label="Mật khẩu" type="password" />
              <Button fullWidth variant="primary" className="mt-4" onClick={() => setModalOpen(false)}>Đăng nhập</Button>
            </div>
          </Modal>
        </section>

        {/* Skeleton */}
        <section>
          <h2 className="font-display text-[var(--text-heading)] font-semibold mb-6">Skeletons (Shimmer Gradient)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton variant="card" />
            <div>
              <div className="flex gap-4 items-center mb-4">
                <Skeleton variant="circular" width="48px" height="48px" />
                <Skeleton variant="text" lines={2} width="60%" />
              </div>
              <Skeleton variant="text" lines={4} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
