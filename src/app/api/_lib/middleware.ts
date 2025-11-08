import { NextRequest } from 'next/server';
import { verifyAccessToken, AccessTokenPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: AccessTokenPayload;
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate a request by verifying the JWT token
 * Returns the user payload if valid, null otherwise
 */
export async function authenticate(request: NextRequest): Promise<AccessTokenPayload | null> {
  const token = extractToken(request);

  if (!token) {
    return null;
  }

  const payload = await verifyAccessToken(token);

  return payload;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AccessTokenPayload> {
  const user = await authenticate(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<AccessTokenPayload> {
  const user = await requireAuth(request);

  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }

  return user;
}

export function isAdmin(user: AccessTokenPayload | null): boolean {
  return user?.role === 'admin';
}
