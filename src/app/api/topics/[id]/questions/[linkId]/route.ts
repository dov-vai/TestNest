import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { topicQuestions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { json, badRequest, notFound, serverError, handleError } from "../../../../_lib/http";
import { idParamSchema, topicQuestionUpdateSchema } from "../../../../_lib/validators";

/**
 * Update topic-question link
 * @body topicQuestionUpdateSchema
 * @response 200:topicQuestionSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string; linkId: string }> }) {
  try {
    const awaited = await context.params;
    const { id: topicId } = idParamSchema.parse({ id: awaited.id });
    const { id: linkId } = idParamSchema.parse({ id: awaited.linkId });
    const body = await req.json();
    const data = topicQuestionUpdateSchema.parse(body);
    const [updated] = await db
      .update(topicQuestions)
      .set(data)
      .where(and(eq(topicQuestions.id, linkId), eq(topicQuestions.topicId, topicId)))
      .returning();
    if (!updated) return notFound("Link not found");
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Unlink question from topic
 * @response 200:deletedSchema
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string; linkId: string }> }) {
  try {
    const awaited = await context.params;
    const { id: topicId } = idParamSchema.parse({ id: awaited.id });
    const { id: linkId } = idParamSchema.parse({ id: awaited.linkId });
    const [deleted] = await db
      .delete(topicQuestions)
      .where(and(eq(topicQuestions.id, linkId), eq(topicQuestions.topicId, topicId)))
      .returning();
    if (!deleted) return notFound("Link not found");
    return json({ id: deleted.id });
  } catch (e) {
    return handleError(e);
  }
}

