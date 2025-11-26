import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, serverError, unauthorized } from '../_lib/http';
import { paginationSchema } from '../_lib/schemas/common';
import { questionCreateSchema } from '../_lib/schemas/question';
import { listQuestions, createQuestion } from '@/db/queries/questions';
import { authenticate, requireAuth, isAdmin } from '../_lib/middleware';

/**
 * List questions
 * @response 200:questionListSchema
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

    const creatorIdParam = searchParams.get('creator_id');
    const creatorId = creatorIdParam ? parseInt(creatorIdParam) : undefined;

    // Strict creator filtering logic similar to topics
    const effectiveCreatorId = creatorId && (creatorId === user?.userId || isAdmin(user)) ? creatorId : undefined;

    const data = await listQuestions(db, { limit, offset }, user?.userId, isAdmin(user), effectiveCreatorId);
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Create question
 * @body questionCreateSchema
 * @response 201:questionSchema
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const parsed = questionCreateSchema.parse(body);
    const created = await createQuestion(db, { ...parsed, userId: user.userId });
    return json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
