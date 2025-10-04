import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { json, badRequest } from "../../../_lib/http";
import { idParamSchema } from "../../../_lib/schemas/common";
import { listAnswersByTopicId } from "@/db/queries/answers";

/**
 * List answers for a topic (across all its questions)
 * @response 200:answerListSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = idParamSchema.parse(await context.params);
    const answers = await listAnswersByTopicId(db, topicId);
    return json(answers);
  } catch (e) {
    return badRequest(e);
  }
}


