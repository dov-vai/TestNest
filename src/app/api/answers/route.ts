import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, serverError, notFound } from '../_lib/http';
import { paginationSchema } from '../_lib/schemas/common';
import { answerCreateSchema } from '../_lib/schemas/answer';
import { listAnswers, createAnswer } from '@/db/queries/answers';
import { getQuestionById } from '@/db/queries/questions';

/**
 * List answers
 * @response 200:answerListSchema
 * @responseSet public
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
    const body = await req.json();
    const parsed = answerCreateSchema.parse(body);

    const question = await getQuestionById(db, parsed.questionId);

    if (!question) {
      return notFound(`Question with id ${parsed.questionId} does not exist`);
    }

    const created = await createAnswer(db, parsed);
    return json(created, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}
