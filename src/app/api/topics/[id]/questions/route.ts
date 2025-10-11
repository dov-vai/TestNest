import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { getTopicQuestionLink, linkQuestionToTopic } from '@/db/queries/topic-questions';
import { json, badRequest, notFound } from '../../../_lib/http';
import { idParamSchema } from '../../../_lib/schemas/common';
import { topicQuestionLinkSchema } from '../../../_lib/schemas/topic-question';
import { getQuestionById, listQuestionsByTopicId } from '@/db/queries/questions';
import { getTopicById } from '@/db/queries/topics';

/**
 * Link question to topic
 * @body topicQuestionLinkSchema
 * @response 201:topicQuestionSchema
 * @openapi
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = idParamSchema.parse(await context.params);

    const topic = await getTopicById(db, topicId);
    if (!topic) {
      return notFound(`Topic not found`);
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
    return badRequest(e);
  }
}

/**
 * List questions for a topic with link metadata
 * @response 200:topicQuestionWithQuestionListSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = idParamSchema.parse(await context.params);

    const topic = await getTopicById(db, topicId);
    if (!topic) {
      return notFound(`Topic not found`);
    }

    const questions = await listQuestionsByTopicId(db, topicId);
    return json(questions);
  } catch (e) {
    return badRequest(e);
  }
}
