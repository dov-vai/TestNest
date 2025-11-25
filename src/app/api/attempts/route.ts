import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { createAttempt, listUserAttempts } from '@/db/queries/attempts';
import { getTopicById } from '@/db/queries/topics';
import { json, badRequest, notFound, unauthorized, forbidden } from '@/app/api/_lib/http';
import { attemptCreateSchema } from '@/app/api/_lib/schemas/attempt';
import { paginationSchema } from '@/app/api/_lib/schemas/common';
import { isAdmin, requireAuth } from '@/app/api/_lib/middleware';
import { eq, sum } from 'drizzle-orm';
import { topicQuestions } from '@/db/schema';

/**
 * List user's attempts
 * @response 200:attemptListSchema
 * @openapi
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const pagination = paginationSchema.parse(Object.fromEntries(searchParams));

    const attempts = await listUserAttempts(db, user.userId, pagination);
    return json(attempts);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Start a new attempt (begin a test)
 * @body attemptCreateSchema
 * @response 201:attemptSchema
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { topicId } = attemptCreateSchema.parse(body);

    // Check if topic exists and user has access
    const topic = await getTopicById(db, topicId);
    if (!topic) return notFound('Topic not found');

    // Check if user can access this topic
    if (topic.isPrivate && topic.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have access to this private topic');
    }

    // Calculate total points for the topic
    const result = await db
      .select({ totalPoints: sum(topicQuestions.points) })
      .from(topicQuestions)
      .where(eq(topicQuestions.topicId, topicId));

    const totalPoints = Number(result[0]?.totalPoints) || 0;

    // Create the attempt
    const attempt = await createAttempt(db, {
      userId: user.userId,
      topicId,
      totalPoints,
    });

    return json(attempt, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
