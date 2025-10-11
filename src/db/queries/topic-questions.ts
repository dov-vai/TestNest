import { DB } from '@/db/client';
import { topicQuestions } from '@/db/schema';
import { and, asc, eq } from 'drizzle-orm';

export async function linkQuestionToTopic(
  db: DB,
  data: {
    topicId: number;
    questionId: number;
    orderIdx?: number;
    points?: number;
  }
) {
  const [created] = await db.insert(topicQuestions).values(data).returning();
  return created;
}

export async function listTopicQuestionLinks(db: DB, topicId: number) {
  return db
    .select()
    .from(topicQuestions)
    .where(eq(topicQuestions.topicId, topicId))
    .orderBy(asc(topicQuestions.orderIdx));
}

export async function updateTopicQuestionLink(
  db: DB,
  topicId: number,
  linkId: number,
  data: {
    orderIdx?: number;
    points?: number;
  }
) {
  const [updated] = await db
    .update(topicQuestions)
    .set(data)
    .where(and(eq(topicQuestions.id, linkId), eq(topicQuestions.topicId, topicId)))
    .returning();
  return updated ?? null;
}

export async function unlinkQuestionFromTopic(db: DB, topicId: number, linkId: number) {
  const [deleted] = await db
    .delete(topicQuestions)
    .where(and(eq(topicQuestions.id, linkId), eq(topicQuestions.topicId, topicId)))
    .returning();
  return deleted ?? null;
}

export async function getTopicQuestionLink(db: DB, topicId: number, questionId: number) {
  const [row] = await db
    .select()
    .from(topicQuestions)
    .where(and(eq(topicQuestions.topicId, topicId), eq(topicQuestions.questionId, questionId)));
  return row ?? null;
}
