import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { answers } from "@/db/schema";
import { json, badRequest, serverError } from "../_lib/http";
import { paginationSchema, answerCreateSchema } from "../_lib/validators";
import { sql } from "drizzle-orm";

/**
 * List answers
 * @response 200:answerListSchema
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

    const data = await db.select().from(answers).limit(limit).offset(offset).orderBy(sql`id asc`);
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Create answer
 * @body answerCreateSchema
 * @response 201:answerSchema
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = answerCreateSchema.parse(body);
    const [created] = await db.insert(answers).values(parsed).returning();
    return json(created, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}

