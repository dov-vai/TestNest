import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getQuestionById, updateQuestion, deleteQuestion } from '@/db/queries/questions';
import { json, badRequest, notFound, handleError } from '../../_lib/http';
import { idParamSchema } from '../../_lib/schemas/common';
import { questionUpdateSchema } from '../../_lib/schemas/question';

/**
 * Get question by id
 * @response 200:questionSchema
 * @responseSet public
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
 * @responseSet public
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const body = await req.json();
    const data = questionUpdateSchema.parse(body);
    const updated = await updateQuestion(db, id, data);
    if (!updated) return notFound('Question not found');
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Delete question
 * @response 204:Empty
 * @responseSet public
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const deleted = await deleteQuestion(db, id);
    if (!deleted) return notFound('Question not found');
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
