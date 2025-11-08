import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getQuestionById, updateQuestion, deleteQuestion } from '@/db/queries/questions';
import { json, badRequest, notFound, handleError, unauthorized, forbidden } from '../../_lib/http';
import { idParamSchema } from '../../_lib/schemas/common';
import { questionUpdateSchema } from '../../_lib/schemas/question';
import { requireAuth, isAdmin } from '../../_lib/middleware';

/**
 * Get question by id
 * @response 200:questionSchema
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const row = await getQuestionById(db, id);
    if (!row) return notFound('Question not found');
    return json(row);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Update question
 * @body questionUpdateSchema
 * @response 200:questionSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if question exists and user owns it or is admin
    const existing = await getQuestionById(db, id);
    if (!existing) return notFound('Question not found');

    if (existing.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to update this question');
    }

    const body = await req.json();
    const data = questionUpdateSchema.parse(body);
    const updated = await updateQuestion(db, id, data);
    if (!updated) return notFound('Question not found');
    return json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Delete question
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = idParamSchema.parse(await context.params);

    // Check if question exists and user owns it or is admin
    const existing = await getQuestionById(db, id);
    if (!existing) return notFound('Question not found');

    if (existing.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to delete this question');
    }

    const deleted = await deleteQuestion(db, id);
    if (!deleted) return notFound('Question not found');
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return handleError(e);
  }
}
