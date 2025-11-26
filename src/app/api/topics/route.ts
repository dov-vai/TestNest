import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, serverError, unauthorized } from '../_lib/http';
import { paginationSchema } from '../_lib/schemas/common';
import { topicCreateSchema } from '../_lib/schemas/topic';
import { listTopics, createTopic } from '@/db/queries/topics';
import { authenticate, requireAuth, isAdmin } from '../_lib/middleware';

/**
 * List topics
 * @response 200:topicListSchema
 * @openapi
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const { searchParams } = new URL(req.url);

    const parsed = paginationSchema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });
    if (!parsed.success) return badRequest(parsed.error);
    const { limit, offset } = parsed.data;

    // Check for creator_id filter
    const creatorIdParam = searchParams.get('creator_id');
    const creatorId = creatorIdParam ? parseInt(creatorIdParam) : undefined;

    // If filtering by creator, verify permissions (users can only filter their own, admins can filter any)
    if (creatorId && creatorId !== user?.userId && !isAdmin(user)) {
      // Fallback to standard logic if they try to snoop, or throw error.
      // For now, let's just ignore the param if they aren't authorized to filter by others
      // But usually for "My Topics", creatorId == user.userId
    }

    // Pass creatorId (if valid) to query
    const effectiveCreatorId = creatorId && (creatorId === user?.userId || isAdmin(user)) ? creatorId : undefined;

    const data = await listTopics(db, { limit, offset }, user?.userId, isAdmin(user), effectiveCreatorId);
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Create topic
 * @body topicCreateSchema
 * @response 201:topicSchema
 * @add 422:Validation error
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication for creating topics
    const user = await requireAuth(req);

    const body = await req.json();
    const parsed = topicCreateSchema.parse(body);
    const created = await createTopic(db, { ...parsed, userId: user.userId });
    return json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
