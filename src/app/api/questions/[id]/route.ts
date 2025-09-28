import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, badRequest, notFound, serverError, handleError } from "../../_lib/http";
import { idParamSchema, questionUpdateSchema } from "../../_lib/validators";

/**
 * Get question by id
 * @response 200:questionSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const [row] = await db.select().from(questions).where(eq(questions.id, id));
    if (!row) return notFound("Question not found");
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
    const [updated] = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
    if (!updated) return notFound("Question not found");
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Delete question
 * @response 200:deletedSchema
 * @responseSet public
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const [deleted] = await db.delete(questions).where(eq(questions.id, id)).returning();
    if (!deleted) return notFound("Question not found");
    return json({ id: deleted.id });
  } catch (e) {
    return handleError(e);
  }
}

