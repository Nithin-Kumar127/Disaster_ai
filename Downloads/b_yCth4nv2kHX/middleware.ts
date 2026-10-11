import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if it's an admin route
  if (pathname.startsWith('/admin')) {
    // For API routes and client-side protected pages,
    // the actual auth check happens in the layout/components
    // This middleware just ensures proper routing
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/:path*'],
};
