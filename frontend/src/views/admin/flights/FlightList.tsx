import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Button } from "../../../components/ui/Button";

export default function FlightList() {
  const navigate = useRouter();

  const flights = [
    { id: "VN210", from: "SGN", to: "HAN", date: "20/10/2026", time: "10:00", price: 1500000, status: "Active" },
    { id: "VN321", from: "HAN", to: "DAD", date: "21/10/2026", time: "14:30", price: 1200000, status: "Active" },
    { id: "VN456", from: "DAD", to: "SGN", date: "22/10/2026", time: "09:00", price: 1100000, status: "Delayed" },
    { id: "VN789", from: "SGN", to: "PQC", date: "23/10/2026", time: "07:15", price: 950000, status: "Cancelled" },
    { id: "VN012", from: "HAN", to: "CXR", date: "24/10/2026", time: "16:45", price: 1800000, status: "Active" },
  ];

  const handleDelete = () => {
    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa chuyến bay này? Hành động này không thể hoàn tác.")) {
      toast.success("Đã xóa chuyến bay thành công");
    }
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
                  <td className="px-4 py-4 font-utility font-bold text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>{f.id}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>{f.from} ✈ {f.to}</td>
                  <td className="px-4 py-4 text-[var(--text-secondary)]" style={{ fontSize: "var(--text-body)" }}>{f.time} • {f.date}</td>
                  <td className="px-4 py-4 font-utility text-[var(--text-primary)]" style={{ fontSize: "var(--text-body)" }}>{f.price.toLocaleString()} ₫</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider"
                      style={{ 
                        background: f.status === "Active" ? "rgba(59,113,254,0.12)" : f.status === "Delayed" ? "rgba(232,163,61,0.12)" : "rgba(216,72,58,0.12)",
                        color: f.status === "Active" ? "var(--color-ocean-600)" : f.status === "Delayed" ? "var(--color-lantern-500-dark)" : "var(--color-danger)"
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
                    <Button variant="ghost" size="sm" onClick={handleDelete}
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
