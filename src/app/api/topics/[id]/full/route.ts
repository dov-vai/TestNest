import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { topics, topicQuestions, questions, answers } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { json, badRequest, notFound } from "../../../_lib/http";
import { idParamSchema } from "../../../_lib/validators";

/**
 * Get topic with questions and answers
 * @response 200:topicFullSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);

    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    if (!topic) return notFound("Topic not found");

    const tqRows = await db
      .select()
      .from(topicQuestions)
      .where(eq(topicQuestions.topicId, id))
      .orderBy(asc(topicQuestions.orderIdx));

    const questionIds = tqRows.map((tq) => tq.questionId);
    const questionRows = questionIds.length
      ? await db.select().from(questions).where(inArray(questions.id, questionIds as number[]))
      : [];

    const answersRows = questionIds.length
      ? await db
          .select()
          .from(answers)
          .where(inArray(answers.questionId, questionIds as number[]))
          .orderBy(asc(answers.orderIdx))
      : [];

    const questionIdToAnswers = new Map<number, typeof answersRows>();
    for (const a of answersRows) {
      const list = questionIdToAnswers.get(a.questionId) || [];
      list.push(a);
      questionIdToAnswers.set(a.questionId, list);
    }

    const questionsFull = tqRows.map((tq) => {
      const q = questionRows.find((qr) => qr.id === tq.questionId);
      return {
        id: tq.id,
        topicId: tq.topicId,
        questionId: tq.questionId,
        orderIdx: tq.orderIdx,
        points: tq.points,
        question: q
          ? {
              id: q.id,
              text: q.text,
              type: q.type,
              answers: questionIdToAnswers.get(q.id) || [],
            }
          : null,
      };
    });

    return json({ ...topic, questions: questionsFull });
  } catch (e) {
    return badRequest(e);
  }
}

