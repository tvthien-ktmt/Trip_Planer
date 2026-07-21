import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(5, 'Vui lòng nhập chủ đề'),
  message: z.string().min(10, 'Nội dung quá ngắn'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactUs() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      // R5-FE-005 fix: replace fake submit with real API call
      await api.post('/contact', data);
      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-gray-500 dark:text-gray-400">Chúng tôi luôn ở đây để lắng nghe và hỗ trợ bạn.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium dark:text-white mb-1">Địa chỉ</div>
                    <div className="text-gray-500 text-sm">123 Đường Láng, Đống Đa, Hà Nội, Việt Nam</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium dark:text-white mb-1">Điện thoại</div>
                    <div className="text-gray-500 text-sm">1900 1234</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium dark:text-white mb-1">Email</div>
                    <div className="text-gray-500 text-sm">support@tripplanner.com</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium dark:text-white mb-1">Giờ làm việc</div>
                    <div className="text-gray-500 text-sm">Thứ 2 - Thứ 7: 8:00 - 18:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-64 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <MapPin className="w-6 h-6" /> Bản đồ Google Maps
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Gửi tin nhắn</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                  <input {...register('name')} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Tên của bạn" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input {...register('email')} type="email" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Email của bạn" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chủ đề</label>
                <input {...register('subject')} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Bạn cần hỗ trợ về vấn đề gì?" />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung</label>
                <textarea {...register('message')} rows={5} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nhập nội dung tin nhắn..." />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Đang gửi...' : <><Send className="w-5 h-5" /> Gửi tin nhắn</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
