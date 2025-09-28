import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { topicQuestions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { json, badRequest } from "../../../_lib/http";
import { idParamSchema, topicQuestionLinkSchema } from "../../../_lib/validators";

/**
 * Link question to topic
 * @body topicQuestionLinkSchema
 * @response 201:topicQuestionSchema
 * @openapi
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = idParamSchema.parse(await context.params);
    const body = await req.json();
    const data = topicQuestionLinkSchema.parse({ ...body, topicId });
    const [created] = await db.insert(topicQuestions).values(data).returning();
    return json(created, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}

/**
 * List topic-question links
 * @response 200:topicQuestionListSchema
 * @responseSet public
 * @openapi
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: topicId } = idParamSchema.parse(await context.params);
    const rows = await db
      .select()
      .from(topicQuestions)
      .where(eq(topicQuestions.topicId, topicId))
      .orderBy(asc(topicQuestions.orderIdx));
    return json(rows);
  } catch (e) {
    return badRequest(e);
  }
}

