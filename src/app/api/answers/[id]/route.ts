import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { answers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, badRequest, notFound, serverError, handleError } from "../../_lib/http";
import { idParamSchema, answerUpdateSchema } from "../../_lib/validators";

/**
 * Get answer by id
 * @response 200:answerSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const [row] = await db.select().from(answers).where(eq(answers.id, id));
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
    const [updated] = await db.update(answers).set(data).where(eq(answers.id, id)).returning();
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
    const [deleted] = await db.delete(answers).where(eq(answers.id, id)).returning();
    if (!deleted) return notFound("Answer not found");
    return json({ id: deleted.id });
  } catch (e) {
    return handleError(e);
  }
}

