import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  // Protect dashboard: redirect to Auth0 login if not authenticated
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const session = await auth0.getSession(request);
    if (!session) {
      const returnTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
      const loginUrl = new URL(`/auth/login?returnTo=${returnTo}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};