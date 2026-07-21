import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// R5-FE-006 fix: JWT_ACCESS_SECRET checking is moved inside the route handler
// so it doesn't break static generation during build.

export async function GET(request: Request) {
  const JWT_SECRET_RAW = process.env.JWT_ACCESS_SECRET;
  if (!JWT_SECRET_RAW) {
    return NextResponse.json({ error: 'JWT_ACCESS_SECRET environment variable is required' }, { status: 500 });
  }
  const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
  // V5-FE-002 fix (a): Use Authorization header from client instead of cookie named 'token'
  // because access_token lives in Zustand memory, not cookies
  const authHeader = request.headers.get('authorization');
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    // Fallback: try cookie for SSR requests
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  }

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

  // V5-FE-002 fix (b): Compose dashboard from real BE endpoints — NO mock fallback
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const headers = { Authorization: `Bearer ${token}` };

    const [kpiRes, revenueRes, bookingsRes] = await Promise.all([
      fetch(`${apiUrl}/admin/analytics/kpi`, { headers }),
      fetch(`${apiUrl}/admin/analytics/revenue?period=week`, { headers }),
      fetch(`${apiUrl}/admin/bookings?limit=5`, { headers }),
    ]);

    if (!kpiRes.ok || !revenueRes.ok || !bookingsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch dashboard data from backend' }, { status: 502 });
    }

    const [kpi, revenue, recentBookings] = await Promise.all([
      kpiRes.json(),
      revenueRes.json(),
      bookingsRes.json(),
    ]);

    return NextResponse.json({
      stats: kpi.data || kpi,
      revenueChart: revenue.data || revenue,
      recentBookings: recentBookings.data || recentBookings,
    });
  } catch (e) {
    // NO mock fallback — fail loudly so admin knows backend is down
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}
