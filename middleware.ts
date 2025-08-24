import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';

import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/auth/logout") {
    // Custom logout logic runs BEFORE the actual logout
    console.log("User is logging out");

    // Let auth0 middleware handle the request and return a response
    const authRes = await auth0.middleware(request);

    // Try to set a logout timestamp cookie on the response
    try {
      authRes.cookies.set("logoutTime", new Date().toISOString());
    } catch {
      // If the response doesn't support cookies, ignore silently
    }

    return authRes;
  }

  if (pathname === "/auth/login") {
    // Custom login logic runs BEFORE the actual login
    console.log("User is attempting to login");
    return await auth0.middleware(request);
  }

  // Default: delegate to auth0 middleware
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};