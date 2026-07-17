import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require ADMIN or STAFF role
  const adminPaths = ['/admin'];
  
  // Paths that require any authenticated user
  const userPaths = ['/user'];

  const token = request.cookies.get('token')?.value;

  // We decode the payload manually because the JWT secret might not be available in the Edge runtime
  let user: any = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString('utf-8'));
        user = payload;
      }
    } catch (error) {
      console.error('Failed to parse token in middleware', error);
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
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
