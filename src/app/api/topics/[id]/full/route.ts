import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { json, badRequest, notFound } from "../../../_lib/http";
import { idParamSchema } from "../../../_lib/schemas/common";
import { getTopicById } from "@/db/queries/topics";
import { listTopicQuestionLinks } from "@/db/queries/topic-questions";
import { getQuestionsByIds } from "@/db/queries/questions";
import { listAnswersByQuestionIds } from "@/db/queries/answers";

/**
 * Get topic with questions and answers
 * @response 200:topicFullSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = idParamSchema.parse(await context.params);

    const topic = await getTopicById(db, id);
    if (!topic) return notFound("Topic not found");

    const tqRows = await listTopicQuestionLinks(db, id);

    const questionIds = tqRows.map((tq) => tq.questionId);
    const questionRows = await getQuestionsByIds(db, questionIds as number[]);

    const answersRows = await listAnswersByQuestionIds(db, questionIds as number[]);

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

