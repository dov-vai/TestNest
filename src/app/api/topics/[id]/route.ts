import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getTopicById, updateTopic, deleteTopic } from '@/db/queries/topics';
import { json, badRequest, notFound, handleError, unauthorized, forbidden } from '../../_lib/http';
import { idParamSchema } from '../../_lib/schemas/common';
import { topicUpdateSchema } from '../../_lib/schemas/topic';
import { authenticate, requireAuth, isAdmin } from '../../_lib/middleware';

/**
 * Get topic by id
 * @response 200:topicSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    const { id } = idParamSchema.parse(await context.params);
    const row = await getTopicById(db, id);
    if (!row) return notFound('Topic not found');

    // Check if user has access to private topic
    // Admins can see all topics, users can see public topics or their own private topics
    if (row.isPrivate && (!user || (user.userId !== row.userId && !isAdmin(user)))) {
      return forbidden('You do not have access to this private topic');
    }

    return json(row);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Update topic
 * @body topicUpdateSchema
 * @response 200:topicSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if topic exists and user owns it or is admin
    const existing = await getTopicById(db, id);
    if (!existing) return notFound('Topic not found');

    if (existing.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to update this topic');
    }

    const body = await req.json();
    const data = topicUpdateSchema.parse(body);
    const updated = await updateTopic(db, id, data);
    if (!updated) return notFound('Topic not found');
    return json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Delete topic
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if topic exists and user owns it or is admin
    const existing = await getTopicById(db, id);
    if (!existing) return notFound('Topic not found');

    if (existing.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to delete this topic');
    }

    const deleted = await deleteTopic(db, id);
    if (!deleted) return notFound('Topic not found');
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return handleError(e);
  }
}
