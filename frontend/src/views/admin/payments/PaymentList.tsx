'use client';
import { useState } from 'react';
import { Search, Download, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function PaymentList() {
  const [searchTerm, setSearchTerm] = useState('');

  const payments = [
    { id: 'TXN-001', bookingRef: 'BKG-A7291', user: 'Nguyễn Văn A', amount: '3,200,000 ₫', method: 'VNPay', date: '2023-10-15 08:30', status: 'Success' },
    { id: 'TXN-002', bookingRef: 'BKG-B8312', user: 'Trần Thị B', amount: '1,500,000 ₫', method: 'Credit Card', date: '2023-10-14 14:15', status: 'Success' },
    { id: 'TXN-003', bookingRef: 'BKG-C1092', user: 'Lê Hoàng C', amount: '12,000,000 ₫', method: 'Momo', date: '2023-10-14 09:00', status: 'Failed' },
    { id: 'TXN-004', bookingRef: 'BKG-D4421', user: 'Phạm D', amount: '8,500,000 ₫', method: 'Bank Transfer', date: '2023-10-13 16:45', status: 'Pending' },
    { id: 'TXN-005', bookingRef: 'BKG-E9981', user: 'Hoàng E', amount: '2,800,000 ₫', method: 'ZaloPay', date: '2023-10-13 10:20', status: 'Success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-semibold text-[var(--text-display-md)] text-[var(--text-primary)] leading-[var(--text-display-md--line-height)]">
            Quản lý Thanh toán
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Theo dõi và đối soát các giao dịch thanh toán</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Xuất báo cáo Excel
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-4 rounded-[var(--radius-radius-md)] border border-[var(--border-main)] flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Tìm mã giao dịch, mã đặt chỗ..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none focus:border-[var(--color-ocean-600)] transition-custom text-[var(--text-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-[var(--radius-radius-sm)] focus:outline-none text-[var(--text-primary)]">
          <option value="all">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="pending">Đang xử lý</option>
          <option value="failed">Thất bại</option>
        </select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Lọc nâng cao
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-[var(--radius-radius-md)] border border-[var(--border-main)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-sm border-b border-[var(--border-main)]">
                <th className="p-4 font-medium">Mã GD</th>
                <th className="p-4 font-medium">Mã đặt chỗ</th>
                <th className="p-4 font-medium">Người dùng</th>
                <th className="p-4 font-medium">Số tiền</th>
                <th className="p-4 font-medium">Phương thức</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[var(--bg-main)] transition-colors">
                  <td className="p-4 font-medium text-[var(--color-ocean-600)]">{payment.id}</td>
                  <td className="p-4 text-[var(--text-primary)]">{payment.bookingRef}</td>
                  <td className="p-4 text-[var(--text-primary)]">{payment.user}</td>
                  <td className="p-4 font-semibold text-[var(--text-primary)]">{payment.amount}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{payment.method}</td>
                  <td className="p-4 text-[var(--text-secondary)] text-sm">{payment.date}</td>
                  <td className="p-4">
                    {payment.status === 'Success' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                      </span>
                    )}
                    {payment.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" /> Đang chờ
                      </span>
                    )}
                    {payment.status === 'Failed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Thất bại
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
