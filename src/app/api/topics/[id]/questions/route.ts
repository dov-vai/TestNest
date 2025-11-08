import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getTopicQuestionLink, linkQuestionToTopic } from '@/db/queries/topic-questions';
import { json, badRequest, notFound, unauthorized, forbidden } from '../../../_lib/http';
import { idParamSchema } from '../../../_lib/schemas/common';
import { topicQuestionLinkSchema } from '../../../_lib/schemas/topic-question';
import { getQuestionById, listQuestionsByTopicId } from '@/db/queries/questions';
import { getTopicById } from '@/db/queries/topics';
import { authenticate, requireAuth, isAdmin } from '../../../_lib/middleware';

/**
 * Link question to topic
 * @body topicQuestionLinkSchema
 * @response 201:topicQuestionSchema
 * @openapi
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id: topicId } = idParamSchema.parse(await context.params);

    const topic = await getTopicById(db, topicId);
    if (!topic) {
      return notFound(`Topic not found`);
    }

    // Check if user owns the topic or is admin
    if (topic.userId !== user.userId && !isAdmin(user)) {
      return forbidden('You do not have permission to link questions to this topic');
    }

    const body = await req.json();
    const data = topicQuestionLinkSchema.parse({ ...body, topicId });

    const question = await getQuestionById(db, data.questionId);
    if (!question) {
      return notFound(`Question not found`);
    }

    const existing = await getTopicQuestionLink(db, topicId, data.questionId);
    if (existing) {
      return notFound(`Question is already linked to topic`);
    }

    const created = await linkQuestionToTopic(db, data);
    return json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return unauthorized();
    }
    return badRequest(e);
  }
}

/**
 * List questions for a topic with link metadata
 * @response 200:topicQuestionWithQuestionListSchema
 * @openapi
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(req);
    const { id: topicId } = idParamSchema.parse(await context.params);

    const topic = await getTopicById(db, topicId);
    if (!topic) {
      return notFound(`Topic not found`);
    }

    // Check if user has access to private topic
    if (topic.isPrivate && (!user || (user.userId !== topic.userId && !isAdmin(user)))) {
      return forbidden('You do not have access to this private topic');
    }

    const questions = await listQuestionsByTopicId(db, topicId);
    return json(questions);
  } catch (e) {
    return badRequest(e);
  }
}
