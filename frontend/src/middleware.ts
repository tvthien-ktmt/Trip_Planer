import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';

// R5-FE-006 fix: Throw on missing JWT_ACCESS_SECRET instead of using insecure fallback
export async function middleware(request: NextRequest) {
  const JWT_SECRET_RAW = process.env.JWT_ACCESS_SECRET;
  if (!JWT_SECRET_RAW) {
    throw new Error('JWT_ACCESS_SECRET environment variable is required');
  }
  const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

  const { pathname } = request.nextUrl;

  // Paths that require ADMIN or STAFF role
  const adminPaths = ['/admin'];
  
  // Paths that require any authenticated user
  const userPaths = ['/user'];

  const token = request.cookies.get('token')?.value;

  let user: { role: string; sub: string; email: string; iat: number; exp: number } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as any;
    } catch (error) {
      console.error('Failed to verify token in middleware', error);
    }
  }

  // Check admin paths
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path) && pathname !== '/admin/login');
  if (isAdminPath) {
    if (!token || !user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check user paths
  const isUserPath = userPaths.some(path => pathname.startsWith(path));
  if (isUserPath) {
    if (!token || !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
