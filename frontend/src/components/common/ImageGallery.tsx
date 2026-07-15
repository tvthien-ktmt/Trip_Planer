'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
        <div className="h-full cursor-pointer" onClick={() => handleOpen(0)}>
          <img src={images[0]} alt="Main" className="w-full h-full object-cover hover:opacity-90 transition" />
        </div>
        <div className="hidden md:grid grid-cols-2 gap-4 h-full">
          {images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="relative h-full cursor-pointer" onClick={() => handleOpen(idx + 1)}>
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover hover:opacity-90 transition" />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold hover:bg-black/40 transition">
                  +{images.length - 5}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button onClick={prev} className="absolute left-6 text-white p-3 hover:bg-white/10 rounded-full">
            <ChevronLeft className="w-10 h-10" />
          </button>

          <img 
            src={images[currentIndex]} 
            alt="Gallery" 
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          <button onClick={next} className="absolute right-6 text-white p-3 hover:bg-white/10 rounded-full">
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-6 text-white font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};
