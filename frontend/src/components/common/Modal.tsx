'use client';
﻿import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  // Focus trap + close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = [
      'button', '[href]', 'input', 'select', 'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors));
    firstFocusableRef.current = focusableElements[0] || null;
    firstFocusableRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      if (focusableElements.length === 0) { e.preventDefault(); return; }
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[var(--color-ink-900)]/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        ref={modalRef}
        className={`
          relative bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)]
          shadow-[var(--shadow-shadow-lg)] w-full ${sizes[size]}
          animate-in zoom-in-95 fade-in duration-200
          ${className}
        `}
      >
        {/* Route Line decoration at top */}
        <div className="absolute top-0 left-6 right-6 h-1 rounded-full overflow-hidden opacity-30">
          <div className="h-full w-full" style={{ background: 'linear-gradient(90deg, var(--color-ocean-900), var(--color-lantern-500), var(--color-coral-500))' }} />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border-main)]">
            <h2 className="font-display text-[var(--text-heading)] font-semibold text-[var(--text-primary)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-[var(--radius-radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-custom"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-[var(--radius-radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)] transition-custom z-10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
