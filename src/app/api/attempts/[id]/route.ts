import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getAttemptById, updateAttempt, deleteAttempt, getAttemptAnswers } from '@/db/queries/attempts';
import { json, badRequest, notFound, unauthorized, forbidden } from '@/app/api/_lib/http';
import { idParamSchema } from '@/app/api/_lib/schemas/common';
import { attemptCompleteSchema } from '@/app/api/_lib/schemas/attempt';
import { requireAuth, isAdmin } from '@/app/api/_lib/middleware';

/**
 * Get attempt by ID with all answers
 * @response 200:attemptSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    const attempt = await getAttemptById(db, id);
    if (!attempt) return notFound('Attempt not found');

    // Users can only view their own attempts, admins can view all
    if (attempt.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have access to this attempt');
    }

    const answers = await getAttemptAnswers(db, id);

    return json({
      ...attempt,
      answers,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Complete/submit an attempt
 * @body attemptCompleteSchema
 * @response 200:attemptSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    const attempt = await getAttemptById(db, id);
    if (!attempt) return notFound('Attempt not found');

    // Users can only update their own attempts
    if (attempt.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have access to this attempt');
    }

    // Don't allow updating already completed attempts
    if (attempt.isCompleted) {
      return badRequest('Attempt is already completed');
    }

    const body = await req.json();
    const { isCompleted } = attemptCompleteSchema.parse(body);

    // When completing, calculate earned points from all answers
    const answers = await getAttemptAnswers(db, id);
    const earnedPoints = answers.reduce((sum, answer) => sum + answer.pointsAwarded, 0);

    const updated = await updateAttempt(db, id, {
      isCompleted,
      submittedAt: isCompleted ? new Date() : undefined,
      earnedPoints: isCompleted ? earnedPoints : attempt.earnedPoints,
    });

    return json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Delete an attempt
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    const attempt = await getAttemptById(db, id);
    if (!attempt) return notFound('Attempt not found');

    // Users can only delete their own attempts
    if (attempt.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have access to this attempt');
    }

    await deleteAttempt(db, id);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}
