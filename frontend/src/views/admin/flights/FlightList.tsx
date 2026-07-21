import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../lib/api";

export default function FlightList() {
  const navigate = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // R5-FE-005 fix: Fetch real flights from BE
  const [flights, setFlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlights = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/flights');
      const data = res.data?.data || res.data || [];
      setFlights(data.map((f: any) => ({
        id: String(f.id),
        flightNumber: f.flightNumber || String(f.id),
        from: f.departure || 'N/A',
        to: f.destination || 'N/A',
        date: f.departureTime ? new Date(f.departureTime).toLocaleDateString('vi-VN') : '',
        time: f.departureTime ? new Date(f.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        price: f.basePrice || 0,
        status: f.status || 'ACTIVE'
      })));
    } catch (e) {
      toast.error('Không thể tải danh sách chuyến bay');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFlights(); }, []);

  const handleDelete = (id: string) => {
    toast.warning("CẢNH BÁO: Bạn có chắc chắn muốn xóa chuyến bay này? Hành động này không thể hoàn tác.", {
      action: {
        label: 'Đồng ý',
        onClick: async () => {
          try {
            await api.delete(`/admin/flights/${id}`);
            toast.success("Đã xóa chuyến bay thành công");
            fetchFlights();
          } catch (e) {
            toast.error("Xóa chuyến bay thất bại");
          }
        }
      },
      cancel: { label: 'Hủy', onClick: () => {} }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display font-semibold text-[var(--text-primary)]"
          style={{ fontSize: "var(--text-display-md)", lineHeight: "var(--text-display-md--line-height)" }}>
          Quản lý Chuyến bay
        </h1>
        <Button variant="primary" onClick={() => navigate.push("/admin/flights/create")}>
          <Plus className="w-4 h-4 mr-1.5" /> Thêm chuyến bay
        </Button>
      </div>

      <div className="rounded-[var(--radius-radius-md)] overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-shadow-sm)" }}>
        
        {/* Toolbar */}
        <div className="p-4 flex gap-4" style={{ borderBottom: "1px solid var(--border-main)" }}>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã chuyến bay..." 
              className="w-full pl-9 pr-4 py-2 rounded-[var(--radius-radius-sm)] focus:outline-none transition-custom"
              style={{ 
                background: "var(--bg-main)", 
                border: "1px solid var(--border-main)",
                color: "var(--text-primary)",
                fontSize: "var(--text-body)"
              }}
            />
          </div>
          <select className="rounded-[var(--radius-radius-sm)] px-4 py-2 focus:outline-none transition-custom"
            style={{ 
              background: "var(--bg-main)", 
              border: "1px solid var(--border-main)",
              color: "var(--text-primary)",
              fontSize: "var(--text-body)"
            }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: "var(--color-mist-50)" }}>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-caption)" }}>Mã chuyến</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-caption)" }}>Hành trình</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-caption)" }}>Thời gian</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-caption)" }}>Giá cơ bản</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)]" style={{ fontSize: "var(--text-caption)" }}>Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-primary)] text-right sticky right-0 z-10" style={{ fontSize: "var(--text-caption)", background: "var(--color-mist-50)" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f, i) => (
                <tr key={f.id} className="group transition-colors"
                  style={{ background: i % 2 === 0 ? "var(--bg-surface)" : "var(--color-mist-50)", opacity: 0.9 }}>
                  <td className="px-4 py-4 font-utility font-bold text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>{f.flightNumber}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>{f.from} ✈ {f.to}</td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]" style={{ fontSize: "var(--text-body)" }}>{f.time} • {f.date}</td>
                  <td className="px-4 py-4 font-utility text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>{f.price.toLocaleString()} ₫</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider"
                      style={{ 
                        background: f.status === "ACTIVE" ? "rgba(59,113,254,0.12)" : f.status === "DELAYED" ? "rgba(232,163,61,0.12)" : "rgba(216,72,58,0.12)",
                        color: f.status === "ACTIVE" ? "var(--color-ocean-600)" : f.status === "DELAYED" ? "var(--color-lantern-500-dark)" : "var(--color-danger)"
                      }}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 flex justify-end gap-2 sticky right-0 z-10 transition-colors"
                    style={{ background: i % 2 === 0 ? "var(--bg-surface)" : "var(--color-mist-50)" }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate.push(`/admin/flights/edit/${f.id}`)}
                      className="text-[var(--text-secondary)] hover:text-[var(--color-ocean-600)]">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}
                      className="text-[var(--text-secondary)] hover:text-[var(--color-danger)]">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
