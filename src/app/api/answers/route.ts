import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, serverError, notFound, unauthorized, forbidden } from '../_lib/http';
import { paginationSchema } from '../_lib/schemas/common';
import { answerCreateSchema } from '../_lib/schemas/answer';
import { listAnswers, createAnswer } from '@/db/queries/answers';
import { getQuestionById } from '@/db/queries/questions';
import { requireAuth, isAdmin } from '../_lib/middleware';

/**
 * List answers
 * @response 200:answerListSchema
 * @openapi
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = paginationSchema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });
    if (!parsed.success) return badRequest(parsed.error);
    const { limit, offset } = parsed.data;

    const data = await listAnswers(db, { limit, offset });
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Create answer
 * @body answerCreateSchema
 * @response 201:answerSchema
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const parsed = answerCreateSchema.parse(body);

    const question = await getQuestionById(db, parsed.questionId);

    if (!question) {
      return notFound(`Question not found`);
    }

    // Check if user owns the question or is admin
    if (question.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to add answers to this question');
    }

    const created = await createAnswer(db, parsed);
    return json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
