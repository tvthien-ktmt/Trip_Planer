import { NextResponse } from 'next/server';

const mockDashboardData = {
  stats: [
    { title: "Doanh thu hôm nay", value: "124,500,000 ₫", trend: "+15%", isUp: true, icon: "DollarSign", iconBg: "rgba(20,20,22,0.10)", iconColor: "var(--color-ocean-900)" },
    { title: "Vé đã bán", value: "432", trend: "+5%", isUp: true, icon: "Ticket", iconBg: "rgba(59,113,254,0.12)", iconColor: "var(--color-ocean-600)" },
    { title: "Khách hàng mới", value: "128", trend: "-2%", isUp: false, icon: "Users", iconBg: "rgba(232,163,61,0.12)", iconColor: "var(--color-lantern-500)" },
    { title: "Chuyến bay hoạt động", value: "45", trend: "0%", isUp: true, icon: "Plane", iconBg: "rgba(240,101,74,0.10)", iconColor: "var(--color-coral-500)" },
  ],
  revenueChart: [40, 60, 45, 80, 50, 90, 75],
  recentBookings: [
    { id: 1, code: "VN8A21", desc: "Nguyễn Văn A – SGN ✈ HAN", status: "Thành công" },
    { id: 2, code: "VN8A22", desc: "Trần Thị B – DAD ✈ SGN", status: "Thành công" },
    { id: 3, code: "VN8A23", desc: "Lê Văn C – HAN ✈ PQC", status: "Thành công" },
    { id: 4, code: "VN8A24", desc: "Phạm Thị D – SGN ✈ CXR", status: "Thành công" },
    { id: 5, code: "VN8A25", desc: "Hoàng Văn E – HUI ✈ SGN", status: "Thành công" },
  ]
};

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || 'dev-secret');

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    // Fallback to mock data if backend fails
  }

  return NextResponse.json(mockDashboardData);
}
