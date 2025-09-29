import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { json, badRequest, serverError } from "../_lib/http";
import { paginationSchema } from "../_lib/schemas/common";
import { questionCreateSchema } from "../_lib/schemas/question";
import { listQuestions, createQuestion } from "@/db/queries/questions";

/**
 * List questions
 * @response 200:questionListSchema
 * @responseSet public
 * @openapi
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = paginationSchema.safeParse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    });
    if (!parsed.success) return badRequest(parsed.error);
    const { limit, offset } = parsed.data;

    const data = await listQuestions(db, { limit, offset });
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Create question
 * @body questionCreateSchema
 * @response 201:questionSchema
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = questionCreateSchema.parse(body);
    const created = await createQuestion(db, parsed);
    return json(created, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}

