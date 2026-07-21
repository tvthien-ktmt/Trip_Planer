import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

export default function FlightEdit() {
  const navigate = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    flightNumber: '',
    airlineId: '1',
    departure: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: '',
    status: 'ACTIVE'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await api.get(`/admin/flights/${id}`);
        const data = res.data?.data || res.data;
        if (data) {
          setFormData({
            flightNumber: data.flightNumber || '',
            airlineId: String(data.airlineId || '1'),
            departure: data.departure || '',
            destination: data.destination || '',
            departureTime: data.departureTime ? new Date(data.departureTime).toISOString().slice(0, 16) : '',
            arrivalTime: data.arrivalTime ? new Date(data.arrivalTime).toISOString().slice(0, 16) : '',
            basePrice: String(data.basePrice || ''),
            status: data.status || 'ACTIVE'
          });
        }
      } catch (error) {
        toast.error('Không tìm thấy chuyến bay');
        navigate.push('/admin/flights');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchFlight();
  }, [id, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // R5-FE-005 fix: PATCH real data to BE instead of toast-only mock
      const payload = {
        ...formData,
        airlineId: BigInt(formData.airlineId),
        basePrice: Number(formData.basePrice),
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: formData.arrivalTime ? new Date(formData.arrivalTime).toISOString() : new Date(formData.departureTime).toISOString(),
      };
      await api.patch(`/admin/flights/${id}`, payload);
      toast.success('Đã cập nhật chuyến bay!');
      navigate.push('/admin/flights');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật chuyến bay');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate.back()} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cập nhật chuyến bay {formData.flightNumber || id}</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mã chuyến bay (Số hiệu)</label>
            <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hãng hàng không (ID)</label>
            <input type="number" name="airlineId" value={formData.airlineId} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Điểm đi</label>
            <input type="text" name="departure" value={formData.departure} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Điểm đến</label>
            <input type="text" name="destination" value={formData.destination} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white uppercase" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giờ cất cánh (ISO)</label>
            <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giờ hạ cánh (ISO)</label>
            <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá cơ bản (VND)</label>
            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white">
              <option value="ACTIVE">Hoạt động</option>
              <option value="DELAYED">Tạm ngưng</option>
              <option value="CANCELLED">Hủy</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" /> {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật chuyến bay'}
          </button>
        </div>
      </form>
    </div>
  );
}
