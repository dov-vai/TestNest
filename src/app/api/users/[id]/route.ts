import { NextRequest } from 'next/server';
import { findUserById, updateUser, deleteUser } from '@/db/queries/users';
import { json, badRequest, notFound, handleError, unauthorized, forbidden } from '../../_lib/http';
import { idParamSchema } from '../../_lib/schemas/common';
import { adminUserUpdateSchema } from '../../_lib/schemas/user';
import { requireAdmin } from '../../_lib/middleware';

/**
 * Get user by id (admin only)
 * @response 200:userSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = idParamSchema.parse(await context.params);
    const user = await findUserById(id);

    if (!user) {
      return notFound('User not found');
    }

    // Exclude password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return json(userWithoutPassword);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Unauthorized') {
        return unauthorized();
      }
      if (e.message === 'Forbidden') {
        return forbidden('Admin access required');
      }
    }
    return badRequest(e);
  }
}

/**
 * Update user (admin only)
 * @body adminUserUpdateSchema
 * @response 200:userSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = idParamSchema.parse(await context.params);

    const body = await req.json();
    const data = adminUserUpdateSchema.parse(body);

    const user = await updateUser(id, data);

    if (!user) {
      return notFound('User not found');
    }

    // Exclude password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return json(userWithoutPassword);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Unauthorized') {
        return unauthorized();
      }
      if (e.message === 'Forbidden') {
        return forbidden('Admin access required');
      }
    }
    return badRequest(e);
  }
}

/**
 * Delete user (admin only)
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = idParamSchema.parse(await context.params);

    const deleted = await deleteUser(id);

    if (!deleted) {
      return notFound('User not found');
    }

    return new Response(null, { status: 204 });
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
