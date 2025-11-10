import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getAnswerWithQuestion, updateAnswer, deleteAnswer } from '@/db/queries/answers';
import { json, badRequest, notFound, handleError, unauthorized, forbidden } from '../../_lib/http';
import { idParamSchema } from '../../_lib/schemas/common';
import { answerUpdateSchema } from '../../_lib/schemas/answer';
import { authenticate, requireAuth, isAdmin } from '../../_lib/middleware';

/**
 * Get answer by id
 * @response 200:answerSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    const { id } = idParamSchema.parse(await context.params);

    // Need to get answer with its question to check privacy
    const result = await getAnswerWithQuestion(db, id);
    if (!result) return notFound('Answer not found');

    // Check if user has access to the question (and thus its answer)
    if (result.question.isPrivate && (!user || (user.userId !== result.question.userId && !isAdmin(user)))) {
      return forbidden('You do not have access to this answer');
    }

    return json(result.answer);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Update answer
 * @body answerUpdateSchema
 * @response 200:answerSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if answer exists and user owns the associated question or is admin
    const result = await getAnswerWithQuestion(db, id);
    if (!result) return notFound('Answer not found');

    if (result.question.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to update this answer');
    }

    const body = await req.json();
    const data = answerUpdateSchema.parse(body);
    const updated = await updateAnswer(db, id, data);
    if (!updated) return notFound('Answer not found');
    return json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Delete answer
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if answer exists and user owns the associated question or is admin
    const result = await getAnswerWithQuestion(db, id);
    if (!result) return notFound('Answer not found');

    if (result.question.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to delete this answer');
    }

    const deleted = await deleteAnswer(db, id);
    if (!deleted) return notFound('Answer not found');
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return handleError(e);
  }
}
