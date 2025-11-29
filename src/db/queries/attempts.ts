import { DB } from '@/db/client';
import { userTopicAttempts, userAnswers, topicQuestions, answers, questions } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

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
    answerIds?: number[];
    userAnswerText?: string | null;
    isCorrect: boolean;
    pointsAwarded: number;
  }
) {
  // First, delete existing answers for this question in this attempt
  await db
    .delete(userAnswers)
    .where(and(eq(userAnswers.attemptId, data.attemptId), eq(userAnswers.topicQuestionId, data.topicQuestionId)));

  // For multiple choice questions with answerIds
  if (data.answerIds && data.answerIds.length > 0) {
    // Insert one row per selected answer
    const insertedAnswers = await db
      .insert(userAnswers)
      .values(
        data.answerIds.map((answerId) => ({
          attemptId: data.attemptId,
          topicQuestionId: data.topicQuestionId,
          answerId,
          userAnswerText: null,
          isCorrect: data.isCorrect,
          pointsAwarded: data.pointsAwarded,
        }))
      )
      .returning();

    return insertedAnswers[0]; // Return first one for compatibility
  }

  // For fill_blank questions with text answer
  if (data.userAnswerText) {
    const [userAnswer] = await db
      .insert(userAnswers)
      .values({
        attemptId: data.attemptId,
        topicQuestionId: data.topicQuestionId,
        answerId: null,
        userAnswerText: data.userAnswerText,
        isCorrect: data.isCorrect,
        pointsAwarded: data.pointsAwarded,
      })
      .returning();

    return userAnswer;
  }

  // Should not reach here, but return a dummy object
  return {
    id: 0,
    attemptId: data.attemptId,
    topicQuestionId: data.topicQuestionId,
    answerId: null,
    userAnswerText: null,
    isCorrect: false,
    pointsAwarded: 0,
    answeredAt: new Date(),
  };
}

export async function getAttemptAnswers(db: DB, attemptId: number) {
  const userAnswersData = await db.select().from(userAnswers).where(eq(userAnswers.attemptId, attemptId));

  // Group answers by topicQuestionId
  const grouped = userAnswersData.reduce(
    (acc, ua) => {
      if (!acc[ua.topicQuestionId]) {
        acc[ua.topicQuestionId] = {
          id: ua.id,
          attemptId: ua.attemptId,
          topicQuestionId: ua.topicQuestionId,
          answerIds: [] as number[],
          userAnswerText: ua.userAnswerText,
          isCorrect: ua.isCorrect,
          pointsAwarded: ua.pointsAwarded,
          answeredAt: ua.answeredAt,
        };
      }
      if (ua.answerId) {
        acc[ua.topicQuestionId].answerIds.push(ua.answerId);
      }
      return acc;
    },
    {} as Record<number, any>
  );

  return Object.values(grouped);
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
  answerIds?: number[],
  userAnswerText?: string | null
): Promise<{ isCorrect: boolean; pointsAwarded: number }> {
  // Get the topic question to find max points and question ID
  const [tq] = await db.select().from(topicQuestions).where(eq(topicQuestions.id, topicQuestionId));

  if (!tq) {
    return { isCorrect: false, pointsAwarded: 0 };
  }

  // Get the question to determine its type
  const [question] = await db.select().from(questions).where(eq(questions.id, tq.questionId));

  if (!question) {
    return { isCorrect: false, pointsAwarded: 0 };
  }

  // For fill_blank questions
  if (question.type === 'fill_blank' && userAnswerText) {
    // Get the correct answer(s) for this question
    const correctAnswers = await db
      .select()
      .from(answers)
      .where(and(eq(answers.questionId, tq.questionId), eq(answers.isCorrect, true)));

    const isCorrect = correctAnswers.some(
      (ans) => ans.text.toLowerCase().trim() === userAnswerText.toLowerCase().trim()
    );

    return {
      isCorrect,
      pointsAwarded: isCorrect ? tq.points : 0,
    };
  }

  // For multiple choice questions (single, multi, true_false)
  if (answerIds && answerIds.length > 0) {
    // Get all answers for this question
    const allAnswers = await db.select().from(answers).where(eq(answers.questionId, tq.questionId));

    const correctAnswerIds = allAnswers.filter((a) => a.isCorrect).map((a) => a.id);

    // For multi-select, check if selected answers match exactly with correct answers
    if (question.type === 'multi') {
      const selectedSet = new Set(answerIds);
      const correctSet = new Set(correctAnswerIds);

      const isCorrect = selectedSet.size === correctSet.size && [...selectedSet].every((id) => correctSet.has(id));

      return {
        isCorrect,
        pointsAwarded: isCorrect ? tq.points : 0,
      };
    }

    // For single-select (single, true_false), check if the one selected answer is correct
    if (answerIds.length === 1) {
      const isCorrect = correctAnswerIds.includes(answerIds[0]);
      return {
        isCorrect,
        pointsAwarded: isCorrect ? tq.points : 0,
      };
    }
  }

  return { isCorrect: false, pointsAwarded: 0 };
}
