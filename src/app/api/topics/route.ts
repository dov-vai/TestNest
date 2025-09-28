import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { topics } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { json, badRequest, serverError } from "../_lib/http";
import { paginationSchema, topicCreateSchema } from "../_lib/validators";

/**
 * List topics
 * @response 200:topicListSchema
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

    const data = await db.select().from(topics).limit(limit).offset(offset).orderBy(sql`id asc`);
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

/**
 * Create topic
 * @body topicCreateSchema
 * @response 201:topicSchema
 * @add 422:Validation error
 * @openapi
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = topicCreateSchema.parse(body);
    const [created] = await db.insert(topics).values(parsed).returning();
    return json(created, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}

