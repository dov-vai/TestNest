import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { getTopicById, updateTopic, deleteTopic } from "@/db/queries/topics";
import { json, badRequest, notFound, serverError } from "../../_lib/http";
import { idParamSchema } from "../../_lib/schemas/common";
import { topicUpdateSchema } from "../../_lib/schemas/topic";

/**
 * Get topic by id
 * @response 200:topicSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const row = await getTopicById(db, id);
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
    const updated = await updateTopic(db, id, data);
    if (!updated) return notFound("Topic not found");
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Delete topic
 * @response 204:Empty
 * @responseSet public
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);
    const deleted = await deleteTopic(db, id);
    if (!deleted) return notFound("Topic not found");
    return new Response(null, { status: 204 });
  } catch (e) {
    return serverError(e);
  }
}

