import { DB } from '@/db/client';
import { Question, questions, topicQuestions, answers, Answer } from '@/db/schema';
import { eq, asc, inArray, or, and } from 'drizzle-orm';

export type Pagination = { limit: number; offset: number };

export async function listQuestions(
  db: DB,
  { limit, offset }: Pagination,
  userId?: number,
  isAdmin?: boolean,
  creatorId?: number // Add this parameter
) {
  let whereClause;

  if (creatorId) {
    // Strictly filter by creator (for "My Questions")
    whereClause = eq(questions.userId, creatorId);
  } else if (isAdmin) {
    whereClause = undefined;
  } else if (userId) {
    whereClause = or(eq(questions.isPrivate, false), and(eq(questions.userId, userId), eq(questions.isPrivate, true)));
  } else {
    whereClause = eq(questions.isPrivate, false);
  }

  const query = db.select().from(questions);

  return whereClause
    ? query.where(whereClause).limit(limit).offset(offset).orderBy(asc(questions.id))
    : query.limit(limit).offset(offset).orderBy(asc(questions.id));
}

export type QuestionWithAnswers = Question & {
  answers: Answer[];
};

export async function listQuestionsWithAnswers(
  db: DB,
  { limit, offset }: Pagination,
  userId?: number,
  isAdmin?: boolean,
  creatorId?: number
): Promise<QuestionWithAnswers[]> {
  let whereClause;

  if (creatorId) {
    whereClause = eq(questions.userId, creatorId);
  } else if (isAdmin) {
    whereClause = undefined;
  } else if (userId) {
    whereClause = or(eq(questions.isPrivate, false), and(eq(questions.userId, userId), eq(questions.isPrivate, true)));
  } else {
    whereClause = eq(questions.isPrivate, false);
  }

  // Get questions with pagination
  const questionsQuery = db.select().from(questions);
  const questionsList = whereClause
    ? await questionsQuery.where(whereClause).limit(limit).offset(offset).orderBy(asc(questions.id))
    : await questionsQuery.limit(limit).offset(offset).orderBy(asc(questions.id));

  if (questionsList.length === 0) {
    return [];
  }

  // Get all answers for these questions
  const questionIds = questionsList.map((q) => q.id);
  const answersList = await db
    .select()
    .from(answers)
    .where(inArray(answers.questionId, questionIds))
    .orderBy(asc(answers.orderIdx));

  // Map answers to questions
  const answersMap = new Map<number, Answer[]>();
  for (const answer of answersList) {
    if (!answersMap.has(answer.questionId)) {
      answersMap.set(answer.questionId, []);
    }
    answersMap.get(answer.questionId)!.push(answer);
  }

  // Combine questions with their answers
  return questionsList.map((question) => ({
    ...question,
    answers: answersMap.get(question.id) || [],
  }));
}

export async function createQuestion(
  db: DB,
  data: {
    text: string;
    type: 'multi' | 'single' | 'true_false' | 'fill_blank';
    userId: number;
    isPrivate?: boolean;
  }
) {
  const [created] = await db.insert(questions).values(data).returning();
  return created;
}

export async function getQuestionById(db: DB, id: number) {
  const [row] = await db.select().from(questions).where(eq(questions.id, id));
  return row ?? null;
}

export async function updateQuestion(
  db: DB,
  id: number,
  data: {
    text?: string;
    type?: 'multi' | 'single' | 'true_false' | 'fill_blank';
    isPrivate?: boolean;
  }
) {
  const [updated] = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
  return updated ?? null;
}

export async function deleteQuestion(db: DB, id: number) {
  const [deleted] = await db.delete(questions).where(eq(questions.id, id)).returning();
  return deleted ?? null;
}

export async function getQuestionsByIds(db: DB, ids: number[]): Promise<Array<Question>> {
  if (ids.length === 0) return [];
  const rows = await db.select().from(questions).where(inArray(questions.id, ids));
  return rows;
}

export type TopicQuestionWithQuestion = {
  id: number;
  topicId: number;
  questionId: number;
  orderIdx: number;
  points: number;
  question: Pick<Question, 'id' | 'text' | 'type'>;
};

export async function listQuestionsByTopicId(db: DB, topicId: number): Promise<Array<TopicQuestionWithQuestion>> {
  const rows = await db
    .select({
      linkId: topicQuestions.id,
      linkTopicId: topicQuestions.topicId,
      linkQuestionId: topicQuestions.questionId,
      linkOrderIdx: topicQuestions.orderIdx,
      linkPoints: topicQuestions.points,
      qId: questions.id,
      qText: questions.text,
      qType: questions.type,
    })
    .from(topicQuestions)
    .innerJoin(questions, eq(topicQuestions.questionId, questions.id))
    .where(eq(topicQuestions.topicId, topicId))
    .orderBy(asc(topicQuestions.orderIdx));

  return rows.map((r) => ({
    id: r.linkId,
    topicId: r.linkTopicId,
    questionId: r.linkQuestionId,
    orderIdx: r.linkOrderIdx,
    points: r.linkPoints,
    question: { id: r.qId, text: r.qText, type: r.qType },
  }));
}
