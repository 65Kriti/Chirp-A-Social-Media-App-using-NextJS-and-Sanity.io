import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect paths: Home feed, profiles, settings, etc.
  const isProtectedPath = pathname === '/' || pathname.startsWith('/profile') || pathname.startsWith('/settings');
  const isAuthPath = pathname === '/login';

  if (isProtectedPath && !token) {
    // Redirect to login if trying to access a protected page without a token
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPath && token) {
    // Redirect to home if trying to access login page with a token
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config to specify which paths this proxy runs on
export const config = {
  matcher: ['/', '/login', '/profile/:path*', '/settings/:path*'],
};
