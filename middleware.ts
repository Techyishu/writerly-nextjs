import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Force dynamic rendering for admin pages
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
