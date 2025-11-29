import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, notFound, handleError, forbidden } from '../../../_lib/http';
import { idParamSchema } from '../../../_lib/schemas/common';
import { listAnswersByQuestionId } from '@/db/queries/answers';
import { getQuestionById } from '@/db/queries/questions';
import { authenticate, isAdmin } from '../../../_lib/middleware';

/**
 * Get answers for a specific question
 * @response 200:answerListSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if question exists
    const question = await getQuestionById(db, id);
    if (!question) return notFound('Question not found');

    // Check if user has access to private question
    if (question.isPrivate && (!user || (user.userId !== question.userId && !isAdmin(user)))) {
      return forbidden('You do not have access to this private question');
    }

    const answers = await listAnswersByQuestionId(db, id);
    return json(answers);
  } catch (e) {
    return handleError(e);
  }
}
