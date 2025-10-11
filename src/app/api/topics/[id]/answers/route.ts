import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, notFound } from '../../../_lib/http';
import { idParamSchema } from '../../../_lib/schemas/common';
import { listAnswersByTopicId } from '@/db/queries/answers';
import { getTopicById } from '@/db/queries/topics';

/**
 * List answers for a topic (across all its questions)
 * @response 200:answerListSchema
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

    const answers = await listAnswersByTopicId(db, topicId);
    return json(answers);
  } catch (e) {
    return badRequest(e);
  }
}
