import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { json, badRequest, notFound, forbidden } from '../../../_lib/http';
import { idParamSchema } from '../../../_lib/schemas/common';
import { listAnswersByTopicId } from '@/db/queries/answers';
import { getTopicById } from '@/db/queries/topics';
import { authenticate, isAdmin } from '../../../_lib/middleware';

/**
 * List answers for a topic (across all its questions)
 * @response 200:answerListSchema
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

    if (topic.isPrivate && (!user || (user.userId !== topic.userId && !isAdmin(user)))) {
      return forbidden('You do not have access to this private topic');
    }

    const answers = await listAnswersByTopicId(db, topicId);
    return json(answers);
  } catch (e) {
    return badRequest(e);
  }
}
