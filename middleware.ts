import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const role = token.role as string;

    // Admin routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Broker routes
    if (pathname.startsWith('/broker') && role !== 'BROKER') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Landlord routes
    if (pathname.startsWith('/landlord') && role !== 'LANDLORD') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/broker/:path*', '/landlord/:path*'],
};
