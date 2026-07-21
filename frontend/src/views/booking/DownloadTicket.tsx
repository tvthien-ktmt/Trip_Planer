'use client';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Download, ArrowLeft, Plane, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function DownloadTicket() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadTicket = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/bookings/${id}/ticket`);
        setTicket(res.data?.data || res.data);
      } catch (e) {
        // If ticket fetch fails, show with booking code only
        setTicket({ bookingCode: id });
      } finally {
        setIsLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/bookings/${id}/ticket/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback: print page
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const bookingCode = ticket?.bookingCode || id || 'N/A';
  const passenger = ticket?.passengers?.[0]?.fullName || ticket?.passenger || 'N/A';
  const departure = ticket?.flight?.departure || ticket?.departure || 'N/A';
  const destination = ticket?.flight?.destination || ticket?.destination || 'N/A';
  const departureTime = ticket?.flight?.departureTime ? new Date(ticket.flight.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const arrivalTime = ticket?.flight?.arrivalTime ? new Date(ticket.flight.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const airline = ticket?.flight?.airline?.name || ticket?.airline || 'Trip Planner';

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button onClick={() => navigate.push('/')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Về trang chủ
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-blue-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 tracking-widest">E-TICKET</h1>
            <p className="text-blue-100 uppercase tracking-widest text-sm">{airline}</p>
          </div>
          <Plane className="w-48 h-48 absolute -right-8 -bottom-8 opacity-20 transform -rotate-45" />
        </div>
        
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
            <div>
              <p className="text-gray-500 text-sm mb-1">Mã đặt chỗ / PNR</p>
              <p className="text-2xl font-black text-blue-600 tracking-widest">{bookingCode}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Hành khách</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white uppercase">{passenger}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{departure}</p>
              <p className="font-bold text-gray-900 dark:text-white mt-1">{departureTime}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full h-px bg-gray-300 relative flex justify-center items-center">
                <Plane className="w-6 h-6 text-blue-600 bg-white dark:bg-gray-800 px-1" />
              </div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{destination}</p>
              <p className="font-bold text-gray-900 dark:text-white mt-1">{arrivalTime}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl flex justify-center border border-gray-200 dark:border-gray-700">
            {/* Visual barcode representation */}
            <div className="w-64 h-16 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900" style={{ backgroundSize: '10px 100%', backgroundImage: 'repeating-linear-gradient(90deg, #111827, #111827 3px, transparent 3px, transparent 6px, #111827 6px, #111827 12px, transparent 12px, transparent 14px)' }}></div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">
          <Download className="w-5 h-5" /> Tải về PDF
        </button>
      </div>
    </div>
  );
}
