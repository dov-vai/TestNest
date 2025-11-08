import { NextRequest } from 'next/server';
import { getAllUsers } from '@/db/queries/users';
import { json, handleError, unauthorized, forbidden } from '../_lib/http';
import { requireAdmin } from '../_lib/middleware';

/**
 * Get all users (admin only)
 * @response 200:userListSchema
 * @openapi
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const users = await getAllUsers();
    return json(users);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Unauthorized') {
        return unauthorized();
      }
      if (e.message === 'Forbidden') {
        return forbidden('Admin access required');
      }
    }
    return handleError(e);
  }
}
