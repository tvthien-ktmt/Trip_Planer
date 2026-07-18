'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useSearchFlightsQuery } from '../../../hooks/queries/useFlightQueries';
import { Plane, Check, ArrowLeft, Briefcase, Utensils, RefreshCcw, Info } from 'lucide-react';
import { Flight, FlightLeg, FareClassPricing } from '../../../types';

export default function FlightDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState('details');
  
  // For demo, we just fetch all and find the one. In real app, we use a specific query useFlightDetailQuery
  const { data: flights = [] } = useSearchFlightsQuery({});
  const flight = flights.find((f: Flight) => String(f.id) === String(id));

  if (!flight) {
    return <div className="p-12 text-center text-[var(--text-primary)]">Đang tải hoặc không tìm thấy chuyến bay...</div>;
  }

  const tabs = [
    { id: 'details', label: 'Chi tiết hành trình' },
    { id: 'baggage', label: 'Hành lý & Suất ăn' },
    { id: 'policy', label: 'Chính sách hoàn/hủy' },
  ];

  return (
    <div className="bg-[var(--bg-main)] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        <Link href="/flights/results" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--color-ocean-600)] mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
        
        <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-main)] mb-8 overflow-hidden">
          <div className="bg-[var(--color-ocean-600)] p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                {flight.departureAirportCode} <Plane className="w-5 h-5" /> {flight.arrivalAirportCode}
              </h1>
              <p className="text-blue-100">{new Date(flight.departureTime).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">Tổng thời gian</div>
              <div className="font-bold text-xl">{Math.floor(flight.totalDurationMinutes/60)}h {flight.totalDurationMinutes%60}m</div>
            </div>
          </div>

          <div className="border-b border-[var(--border-main)] px-6 pt-4 flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--color-ocean-600)] text-[var(--color-ocean-600)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="animate-in fade-in">
                {flight.legs?.map((leg: FlightLeg, idx: number) => (
                  <div key={leg.id} className="flex gap-4 mb-6 relative">
                    {idx !== flight.legs.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-[-24px] w-px bg-dashed border-l-2 border-dashed border-[var(--border-main)]"></div>
                    )}
                    <div className="w-12 flex flex-col items-center justify-between py-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-ocean-600)]"></div>
                      <div className="flex-1 w-px bg-[var(--border-main)] my-1"></div>
                      <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-[var(--bg-surface)]"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-4">
                        <div>
                          <div className="font-bold text-lg text-[var(--text-primary)]">{new Date(leg.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          <div className="text-[var(--text-secondary)]">{leg.departureAirportCode}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-[var(--text-primary)]">{new Date(leg.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          <div className="text-[var(--text-secondary)]">{leg.arrivalAirportCode}</div>
                        </div>
                      </div>
                      <div className="bg-[var(--bg-main)] border border-[var(--border-main)] p-4 rounded-lg flex items-center gap-4">
                        <img src={leg.airlineLogo} alt="Logo" className="w-10 h-10 object-contain bg-white rounded-md p-1" />
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{leg.airline}</div>
                          <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                            <span>Chuyến: {leg.flightNumber}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]"></span>
                            <span>Máy bay: {leg.aircraftType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'baggage' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[var(--color-ocean-600)] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-lg">Thông tin hành lý</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Mức hành lý tiêu chuẩn áp dụng cho chuyến bay này.</p>
                    <ul className="mt-4 space-y-2 text-sm text-[var(--text-primary)]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Hành lý xách tay: 7kg / khách (Kích thước 56x36x23cm)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Hành lý ký gửi: Tùy thuộc vào hạng vé bạn chọn (Từ 20kg - 40kg)
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-[var(--border-main)] my-4"></div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-lg">Suất ăn trên máy bay</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Suất ăn miễn phí chỉ áp dụng cho một số hạng vé nhất định.</p>
                    <ul className="mt-4 space-y-2 text-sm text-[var(--text-primary)]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Có phục vụ nước uống miễn phí trên mọi hạng vé.
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Hạng Thương gia (Business): Bao gồm suất ăn nóng cao cấp.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center flex-shrink-0">
                    <RefreshCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] text-lg">Chính sách Hoàn / Hủy / Đổi vé</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Quy định áp dụng dựa trên hạng vé mà bạn sẽ mua.</p>
                    
                    <div className="mt-4 grid gap-3">
                      <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-main)]">
                        <h4 className="font-semibold text-[var(--text-primary)]">Hạng Phổ thông (Economy)</h4>
                        <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)] list-disc list-inside">
                          <li>Hoàn vé: Thu phí 500,000 VNĐ</li>
                          <li>Đổi vé: Thu phí 300,000 VNĐ + Chênh lệch giá vé</li>
                          <li>Không áp dụng đổi/hủy sau khi chuyến bay khởi hành.</li>
                        </ul>
                      </div>
                      
                      <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-main)]">
                        <h4 className="font-semibold text-[var(--text-primary)]">Hạng Thương gia (Business)</h4>
                        <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)] list-disc list-inside">
                          <li>Hoàn vé: Miễn phí trước 24h</li>
                          <li>Đổi vé: Miễn phí + Chênh lệch giá vé (nếu có)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <p>Hãng hàng không có quyền thay đổi lịch bay vì lý do thời tiết hoặc kỹ thuật. Bạn sẽ được thông báo qua Email hoặc SMS.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Chọn hạng vé</h2>
        <div className="space-y-4">
          {flight.pricing?.map((price: FareClassPricing) => (
            <div key={price.class} className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-main)] shadow-sm hover:border-[var(--color-ocean-600)] transition-colors flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 uppercase">{price.class}</h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Hành lý xách tay {price.cabinBaggage}kg</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Hành lý ký gửi {price.baggageAllowance}kg</li>
                  {price.hasMeal && <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Kèm suất ăn</li>}
                  {price.freeCancellation && <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Hủy miễn phí</li>}
                </ul>
              </div>
              <div className="md:border-l md:border-[var(--border-main)] md:pl-6 text-center w-full md:w-auto">
                <div className="text-2xl font-bold text-[var(--color-coral-500)] mb-1">{price.price.toLocaleString()} ₫</div>
                <div className="text-sm text-orange-500 mb-4 font-medium">Còn {price.availableSeats} chỗ</div>
                <Link href="/booking/fare-class" className="block w-full px-8 py-3 bg-[var(--color-ocean-600)] hover:bg-[var(--color-ocean-700)] text-white font-medium rounded-xl transition-colors">
                  Chọn hạng {price.class}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
