import { DB } from '@/db/client';
import { Answer, answers, topicQuestions, questions } from '@/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';

export type Pagination = { limit: number; offset: number };

export async function listAnswers(db: DB, { limit, offset }: Pagination) {
  return db.select().from(answers).limit(limit).offset(offset).orderBy(asc(answers.id));
}

export async function createAnswer(
  db: DB,
  data: {
    questionId: number;
    text: string;
    isCorrect?: boolean;
    orderIdx?: number;
  }
) {
  const [created] = await db.insert(answers).values(data).returning();
  return created;
}

export async function getAnswerById(db: DB, id: number) {
  const [row] = await db.select().from(answers).where(eq(answers.id, id));
  return row ?? null;
}

export async function updateAnswer(
  db: DB,
  id: number,
  data: {
    text?: string;
    isCorrect?: boolean;
    orderIdx?: number;
  }
) {
  const [updated] = await db.update(answers).set(data).where(eq(answers.id, id)).returning();
  return updated ?? null;
}

export async function deleteAnswer(db: DB, id: number) {
  const [deleted] = await db.delete(answers).where(eq(answers.id, id)).returning();
  return deleted ?? null;
}

export async function listAnswersByQuestionIds(db: DB, questionIds: number[]): Promise<Array<Answer>> {
  if (questionIds.length === 0) return [];
  const rows = await db
    .select()
    .from(answers)
    .where(inArray(answers.questionId, questionIds))
    .orderBy(asc(answers.orderIdx));
  return rows;
}

export async function listAnswersByTopicId(db: DB, topicId: number): Promise<Array<Answer>> {
  const rows = await db
    .select({
      id: answers.id,
      questionId: answers.questionId,
      text: answers.text,
      isCorrect: answers.isCorrect,
      orderIdx: answers.orderIdx,
    })
    .from(topicQuestions)
    .innerJoin(questions, eq(topicQuestions.questionId, questions.id))
    .innerJoin(answers, eq(answers.questionId, questions.id))
    .where(eq(topicQuestions.topicId, topicId))
    .orderBy(asc(answers.orderIdx));
  return rows;
}
