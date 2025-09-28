import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, badRequest, notFound, serverError } from "../../_lib/http";
import { idParamSchema, topicUpdateSchema } from "../../_lib/validators";

/**
 * Get topic by id
 * @response 200:topicSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const [row] = await db.select().from(topics).where(eq(topics.id, id));
    if (!row) return notFound("Topic not found");
    return json(row);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Update topic
 * @body topicUpdateSchema
 * @response 200:topicSchema
 * @responseSet public
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const body = await req.json();
    const data = topicUpdateSchema.parse(body);
    const [updated] = await db.update(topics).set(data).where(eq(topics.id, id)).returning();
    if (!updated) return notFound("Topic not found");
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Delete topic
 * @response 200:deletedSchema
 * @responseSet public
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const [deleted] = await db.delete(topics).where(eq(topics.id, id)).returning();
    if (!deleted) return notFound("Topic not found");
    return json({ id: deleted.id });
  } catch (e) {
    return serverError(e);
  }
}

