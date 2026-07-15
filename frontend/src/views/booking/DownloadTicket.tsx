'use client';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Download, ArrowLeft, Plane } from 'lucide-react';

export default function DownloadTicket() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button onClick={() => navigate.push('/')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Về trang chủ
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-blue-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 tracking-widest">E-TICKET</h1>
            <p className="text-blue-100 uppercase tracking-widest text-sm">Vietnam Airlines</p>
          </div>
          <Plane className="w-48 h-48 absolute -right-8 -bottom-8 opacity-20 transform -rotate-45" />
        </div>
        
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
            <div>
              <p className="text-gray-500 text-sm mb-1">Mã đặt chỗ / PNR</p>
              <p className="text-2xl font-black text-blue-600 tracking-widest">{id || 'VN8A2B'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Hành khách</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white uppercase">NGUYEN VAN A</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white">SGN</p>
              <p className="text-gray-500 mt-2">Hồ Chí Minh</p>
              <p className="font-bold text-gray-900 dark:text-white mt-1">10:00</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">2h 10m</p>
              <div className="w-full h-px bg-gray-300 relative flex justify-center items-center">
                <Plane className="w-6 h-6 text-blue-600 bg-white dark:bg-gray-800 px-1" />
              </div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white">HAN</p>
              <p className="text-gray-500 mt-2">Hà Nội</p>
              <p className="font-bold text-gray-900 dark:text-white mt-1">12:10</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl flex justify-center border border-gray-200 dark:border-gray-700">
            {/* Fake Barcode */}
            <div className="w-64 h-16 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900" style={{ backgroundSize: '10px 100%', backgroundImage: 'repeating-linear-gradient(90deg, #111827, #111827 3px, transparent 3px, transparent 6px, #111827 6px, #111827 12px, transparent 12px, transparent 14px)' }}></div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">
          <Download className="w-5 h-5" /> Tải về PDF
        </button>
      </div>
    </div>
  );
}
