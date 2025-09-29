import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { getAnswerById, updateAnswer, deleteAnswer } from "@/db/queries/answers";
import { json, badRequest, notFound, handleError } from "../../_lib/http";
import { idParamSchema } from "../../_lib/schemas/common";
import { answerUpdateSchema } from "../../_lib/schemas/answer";

/**
 * Get answer by id
 * @response 200:answerSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const row = await getAnswerById(db, id);
    if (!row) return notFound("Answer not found");
    return json(row);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Update answer
 * @body answerUpdateSchema
 * @response 200:answerSchema
 * @responseSet public
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const body = await req.json();
    const data = answerUpdateSchema.parse(body);
    const updated = await updateAnswer(db, id, data);
    if (!updated) return notFound("Answer not found");
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Delete answer
 * @response 200:deletedSchema
 * @responseSet public
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const deleted = await deleteAnswer(db, id);
    if (!deleted) return notFound("Answer not found");
    return json({ id: deleted.id });
  } catch (e) {
    return handleError(e);
  }
}

