import { NextRequest } from "next/server";
import { db } from "@/db/client";
import { questions } from "@/db/schema";
import { json, badRequest, serverError } from "../_lib/http";
import { paginationSchema, questionCreateSchema } from "../_lib/validators";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = paginationSchema.safeParse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    });
    if (!parsed.success) return badRequest(parsed.error);
    const { limit, offset } = parsed.data;

    const data = await db.select().from(questions).limit(limit).offset(offset).orderBy(sql`id asc`);
    return json(data);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = questionCreateSchema.parse(body);
    const [created] = await db.insert(questions).values(parsed).returning();
    return json(created, { status: 201 });
  } catch (e) {
    return badRequest(e);
  }
}

