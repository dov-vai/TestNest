import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { updateTopicQuestionLink, unlinkQuestionFromTopic } from '@/db/queries/topic-questions';
import { json, badRequest, notFound, handleError } from '../../../../_lib/http';
import { idParamSchema } from '../../../../_lib/schemas/common';
import { topicQuestionUpdateSchema } from '../../../../_lib/schemas/topic-question';

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
    const updated = await updateTopicQuestionLink(db, topicId, linkId, data);
    if (!updated) return notFound('Link not found');
    return json(updated);
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * Unlink question from topic
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string; linkId: string }> }) {
  try {
    const awaited = await context.params;
    const { id: topicId } = idParamSchema.parse({ id: awaited.id });
    const { id: linkId } = idParamSchema.parse({ id: awaited.linkId });
    const deleted = await unlinkQuestionFromTopic(db, topicId, linkId);
    if (!deleted) return notFound('Link not found');
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
