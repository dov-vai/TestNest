import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { linkQuestionToTopic } from '@/db/queries/topic-questions';
import { json, badRequest } from '../../../_lib/http';
import { idParamSchema } from '../../../_lib/schemas/common';
import { topicQuestionLinkSchema } from '../../../_lib/schemas/topic-question';
import { listQuestionsByTopicId } from '@/db/queries/questions';

/**
 * Link question to topic
 * @body topicQuestionLinkSchema
 * @response 201:topicQuestionSchema
 * @openapi
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = idParamSchema.parse(await context.params);
    const body = await req.json();
    const data = topicQuestionLinkSchema.parse({ ...body, topicId });
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
    const questions = await listQuestionsByTopicId(db, topicId);
    return json(questions);
  } catch (e) {
    return badRequest(e);
  }
}
