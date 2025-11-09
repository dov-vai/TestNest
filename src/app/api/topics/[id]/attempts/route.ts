import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { listUserTopicAttempts } from '@/db/queries/attempts';
import { getTopicById } from '@/db/queries/topics';
import { json, badRequest, notFound, unauthorized, forbidden } from '@/app/api/_lib/http';
import { paginationSchema } from '@/app/api/_lib/schemas/common';
import { requireAuth, isAdmin } from '@/app/api/_lib/middleware';

/**
 * List user's attempts for a specific topic
 * @response 200:attemptListSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const topicId = Number((await context.params).id);
    const { searchParams } = new URL(req.url);
    const pagination = paginationSchema.parse(Object.fromEntries(searchParams));

    // Check if topic exists and user has access
    const topic = await getTopicById(db, topicId);
    if (!topic) return notFound('Topic not found');

    // Check if user can access this topic
    if (topic.isPrivate && topic.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have access to this private topic');
    }

    const attempts = await listUserTopicAttempts(db, user.userId, topicId, pagination);
    return json(attempts);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
