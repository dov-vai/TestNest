import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getAttemptById, submitAnswer, checkAnswer } from '@/db/queries/attempts';
import { json, badRequest, notFound, unauthorized, forbidden } from '@/app/api/_lib/http';
import { answerSubmitSchema } from '@/app/api/_lib/schemas/attempt';
import { isAdmin, requireAuth } from '@/app/api/_lib/middleware';
import { idParamSchema } from '@/app/api/_lib/schemas/common';

/**
 * Submit an answer for a question in an attempt
 * @body answerSubmitSchema
 * @response 201:userAnswerSchema
 * @openapi
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    const attempt = await getAttemptById(db, Number(id));
    if (!attempt) return notFound('Attempt not found');

    // Users can only submit answers to their own attempts
    if (attempt.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have access to this attempt');
    }

    // Can't submit answers to completed attempts
    if (attempt.isCompleted) {
      return badRequest('Cannot submit answers to a completed attempt');
    }

    const body = await req.json();
    const { topicQuestionId, answerIds, userAnswerText } = answerSubmitSchema.parse(body);

    // Check if answer is correct and calculate points
    const { isCorrect, pointsAwarded } = await checkAnswer(db, topicQuestionId, answerIds, userAnswerText);

    // Submit the answer
    const answer = await submitAnswer(db, {
      attemptId: Number(id),
      topicQuestionId,
      answerIds: answerIds || [],
      userAnswerText: userAnswerText || null,
      isCorrect,
      pointsAwarded,
    });

    return json(answer, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
