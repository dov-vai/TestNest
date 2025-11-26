import { NextRequest } from 'next/server';
import { listUsers } from '@/db/queries/users';
import { json, handleError, unauthorized, forbidden, badRequest } from '../_lib/http';
import { requireAdmin } from '../_lib/middleware';
import { paginationSchema } from '../_lib/schemas/common';

/**
 * Get users (admin only) with pagination
 * @response 200:userListSchema
 * @openapi
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const parsed = paginationSchema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!parsed.success) return badRequest(parsed.error);
    const { limit, offset } = parsed.data;

    const users = await listUsers({ limit, offset });
    return json(users);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Unauthorized') return unauthorized();
      if (e.message === 'Forbidden') return forbidden('Admin access required');
    }
    return handleError(e);
  }
}
