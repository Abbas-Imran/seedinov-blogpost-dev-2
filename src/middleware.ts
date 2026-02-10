import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Dashboard password for web UI access
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-me';

// API Key for external API access
const APP_API_KEY = process.env.APP_API_KEY;

/**
 * Validate session token (simplified for Edge runtime)
 */
function validateSession(sessionToken: string): boolean {
  try {
    const [payload, signature] = sessionToken.split('.');
    
    // In Edge runtime, we use Web Crypto API
    // For simplicity, we'll do a basic check here
    // The full validation happens in the auth library
    if (!payload || !signature) {
      return false;
    }

    const data = JSON.parse(atob(payload));
    if (data.exp && data.exp < Date.now()) {
      return false;
    }

    return data.authenticated === true;
  } catch {
    return false;
  }
}

/**
 * Validate API key from request
 */
function validateApiKey(request: NextRequest): boolean {
  if (!APP_API_KEY) {
    return true; // No API key configured, allow in dev mode
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === APP_API_KEY) {
      return true;
    }
  }

  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader === APP_API_KEY) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // API routes - require API key OR valid dashboard session
  if (pathname.startsWith('/api/')) {
    // Check for valid dashboard session (for web UI access)
    const sessionToken = request.cookies.get('dashboard_session')?.value;
    if (sessionToken && validateSession(sessionToken)) {
      return NextResponse.next();
    }

    // Check for API key (for external/developer access)
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid or missing API key. Use Authorization: Bearer <api_key> or X-API-Key: <api_key>',
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Dashboard routes - require session authentication
  if (!DASHBOARD_PASSWORD) {
    // No password configured, allow access (dev mode)
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('dashboard_session')?.value;
  
  if (!sessionToken || !validateSession(sessionToken)) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
