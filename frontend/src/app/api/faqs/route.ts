import { NextResponse } from 'next/server';

// V5-FE-001 fix: Proxy to real BE endpoint instead of returning inline mock data
export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const res = await fetch(`${apiUrl}/faqs`, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 502 });
    }
    
    return NextResponse.json(await res.json());
  } catch (e) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}
