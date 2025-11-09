import { NextRequest } from 'next/server';
import { json, handleError } from '../../_lib/http';
import { verifyAccessToken } from '@/lib/auth';
import { findUserById } from '@/db/queries/users';

/**
 * Get current authenticated user
 * @response 200:meResponseSchema
 * @openapi
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      return json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return json({ error: 'Account is deactivated' }, { status: 403 });
    }

    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
