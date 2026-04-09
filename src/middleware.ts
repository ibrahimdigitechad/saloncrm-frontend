import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths — no check needed
  const publicPaths = ['/login', '/register', '/book'];
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (pathname === '/') return NextResponse.redirect(new URL('/dashboard', req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
