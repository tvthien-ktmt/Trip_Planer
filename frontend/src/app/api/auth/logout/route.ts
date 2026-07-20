import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // We can call the backend logout here if we want, but since it's just clearing cookies
  // on the frontend side, we mainly need to do that. The backend blacklist is already
  // being hit by some other mechanism? Actually we should hit the backend logout.
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || cookieStore.get('access_token')?.value;
  
  if (token) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.error('Failed to logout from backend', e);
    }
  }

  const response = NextResponse.json({ success: true });
  
  // Clear cookies
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });

  return response;
}
