import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings', '/certificates'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // Check if user is authenticated (you'll need to implement your own auth logic)
  const isAuthenticated = request.cookies.has('auth-token'); // Example check

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Continue with the request if everything is fine
  return NextResponse.next();
}
