import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { updateTopicQuestionLink, unlinkQuestionFromTopic } from '@/db/queries/topic-questions';
import { json, badRequest, notFound, handleError, unauthorized, forbidden } from '../../../../_lib/http';
import { idParamSchema } from '../../../../_lib/schemas/common';
import { topicQuestionUpdateSchema } from '../../../../_lib/schemas/topic-question';
import { getTopicById } from '@/db/queries/topics';
import { requireAuth, isAdmin } from '../../../../_lib/middleware';

/**
 * Update topic-question link
 * @body topicQuestionUpdateSchema
 * @response 200:topicQuestionSchema
 * @openapi
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string; linkId: string }> }) {
  try {
    const user = await requireAuth(req);
    const awaited = await context.params;
    const { id: topicId } = idParamSchema.parse({ id: awaited.id });
    const { id: linkId } = idParamSchema.parse({ id: awaited.linkId });

    const topic = await getTopicById(db, topicId);
    if (!topic) {
      return notFound(`Topic not found`);
    }

    // Check if user owns the topic or is admin
    if (topic.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to update links for this topic');
    }

    const body = await req.json();
    const data = topicQuestionUpdateSchema.parse(body);
    const updated = await updateTopicQuestionLink(db, topicId, linkId, data);
    if (!updated) return notFound('Link not found');
    return json(updated);
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * Unlink question from topic
 * @response 204:Empty
 * @openapi
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; linkId: string }> }) {
  try {
    const user = await requireAuth(req);
    const awaited = await context.params;
    const { id: topicId } = idParamSchema.parse({ id: awaited.id });
    const { id: linkId } = idParamSchema.parse({ id: awaited.linkId });

    const topic = await getTopicById(db, topicId);
    if (!topic) {
      return notFound(`Topic not found`);
    }

    // Check if user owns the topic or is admin
    if (topic.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to unlink questions from this topic');
    }

    const deleted = await unlinkQuestionFromTopic(db, topicId, linkId);
    if (!deleted) return notFound('Link not found');
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return handleError(e);
  }
}
