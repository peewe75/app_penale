import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const pathname = req.nextUrl.pathname;

  if (pathname === '/' && !userId) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  if (pathname === '/dashboard' && !userId) {
    return NextResponse.redirect(new URL('/landing', req.url));
  }

  if (pathname === '/landing' && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/landing', '/dashboard', '/sign-in(.*)', '/sign-up(.*)'],
};
