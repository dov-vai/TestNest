import { DB } from '@/db/client';
import { userTopicAttempts, userAnswers, topicQuestions, answers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export type Pagination = { limit: number; offset: number };

export async function createAttempt(
  db: DB,
  data: {
    userId: number;
    topicId: number;
    totalPoints: number;
  }
) {
  const [created] = await db.insert(userTopicAttempts).values(data).returning();
  return created;
}

export async function getAttemptById(db: DB, id: number) {
  const [row] = await db.select().from(userTopicAttempts).where(eq(userTopicAttempts.id, id));
  return row ?? null;
}

export async function listUserAttempts(db: DB, userId: number, { limit, offset }: Pagination) {
  return db
    .select()
    .from(userTopicAttempts)
    .where(eq(userTopicAttempts.userId, userId))
    .orderBy(desc(userTopicAttempts.startedAt))
    .limit(limit)
    .offset(offset);
}

export async function listUserTopicAttempts(db: DB, userId: number, topicId: number, { limit, offset }: Pagination) {
  return db
    .select()
    .from(userTopicAttempts)
    .where(and(eq(userTopicAttempts.userId, userId), eq(userTopicAttempts.topicId, topicId)))
    .orderBy(desc(userTopicAttempts.startedAt))
    .limit(limit)
    .offset(offset);
}

export async function updateAttempt(
  db: DB,
  id: number,
  data: {
    submittedAt?: Date;
    earnedPoints?: number;
    isCompleted?: boolean;
  }
) {
  const [updated] = await db.update(userTopicAttempts).set(data).where(eq(userTopicAttempts.id, id)).returning();
  return updated ?? null;
}

export async function submitAnswer(
  db: DB,
  data: {
    attemptId: number;
    topicQuestionId: number;
    answerId?: number | null;
    userAnswerText?: string | null;
    isCorrect: boolean;
    pointsAwarded: number;
  }
) {
  const [created] = await db
    .insert(userAnswers)
    .values(data)
    .onConflictDoUpdate({
      target: [userAnswers.attemptId, userAnswers.topicQuestionId],
      set: {
        answerId: data.answerId,
        userAnswerText: data.userAnswerText,
        isCorrect: data.isCorrect,
        pointsAwarded: data.pointsAwarded,
        answeredAt: new Date(),
      },
    })
    .returning();
  return created;
}

export async function getAttemptAnswers(db: DB, attemptId: number) {
  return db.select().from(userAnswers).where(eq(userAnswers.attemptId, attemptId));
}

export async function getUserAnswer(db: DB, attemptId: number, topicQuestionId: number) {
  const [row] = await db
    .select()
    .from(userAnswers)
    .where(and(eq(userAnswers.attemptId, attemptId), eq(userAnswers.topicQuestionId, topicQuestionId)));
  return row ?? null;
}

export async function deleteAttempt(db: DB, id: number) {
  const [deleted] = await db.delete(userTopicAttempts).where(eq(userTopicAttempts.id, id)).returning();
  return deleted ?? null;
}

export async function checkAnswer(
  db: DB,
  topicQuestionId: number,
  answerId?: number | null,
  userAnswerText?: string | null
): Promise<{ isCorrect: boolean; pointsAwarded: number }> {
  // Get the topic question to find max points and question ID
  const [tq] = await db.select().from(topicQuestions).where(eq(topicQuestions.id, topicQuestionId));
  
  if (!tq) {
    return { isCorrect: false, pointsAwarded: 0 };
  }

  // For multiple choice questions, check if the selected answer is correct
  if (answerId) {
    const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));
    if (answer?.isCorrect) {
      return { isCorrect: true, pointsAwarded: tq.points };
    }
  }

  return { isCorrect: false, pointsAwarded: 0 };
}
