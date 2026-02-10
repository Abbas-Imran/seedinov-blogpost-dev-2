import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// API Key for external API access (for developers/AI integrations)
const APP_API_KEY = process.env.APP_API_KEY;

// Dashboard password for web UI access
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

// Session secret for signing tokens
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-me';

/**
 * Validate API key from request headers
 * Expects: Authorization: Bearer <api_key> or X-API-Key: <api_key>
 */
export function validateApiKey(request: NextRequest): boolean {
  if (!APP_API_KEY) {
    console.warn('APP_API_KEY not configured - API authentication disabled');
    return true; // Allow access if no key is configured (dev mode)
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === APP_API_KEY) {
      return true;
    }
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader === APP_API_KEY) {
    return true;
  }

  return false;
}

/**
 * Create unauthorized response for API
 */
export function unauthorizedResponse(message = 'Unauthorized - Invalid or missing API key') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

/**
 * Validate dashboard session from cookies
 */
export function validateDashboardSession(request: NextRequest): boolean {
  if (!DASHBOARD_PASSWORD) {
    console.warn('DASHBOARD_PASSWORD not configured - Dashboard authentication disabled');
    return true; // Allow access if no password is configured (dev mode)
  }

  const sessionToken = request.cookies.get('dashboard_session')?.value;
  if (!sessionToken) {
    return false;
  }

  try {
    // Verify the session token
    const [payload, signature] = sessionToken.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return false;
    }

    // Decode and check expiration
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (data.exp && data.exp < Date.now()) {
      return false;
    }

    return data.authenticated === true;
  } catch {
    return false;
  }
}

/**
 * Create a dashboard session token
 */
export function createSessionToken(): string {
  const payload = {
    authenticated: true,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    iat: Date.now(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('hex');

  return `${payloadBase64}.${signature}`;
}

/**
 * Validate the dashboard password
 */
export function validatePassword(password: string): boolean {
  if (!DASHBOARD_PASSWORD) {
    return true;
  }
  return password === DASHBOARD_PASSWORD;
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Middleware helper for API routes
 */
export function withApiAuth(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    if (!validateApiKey(request)) {
      return unauthorizedResponse();
    }
    return handler(request, context);
  };
}
