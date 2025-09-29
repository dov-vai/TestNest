import { DB } from "@/db/client";
import { Question, questions } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

export type Pagination = { limit: number; offset: number };

export async function listQuestions(db: DB, { limit, offset }: Pagination) {
  return db.select().from(questions).limit(limit).offset(offset).orderBy(asc(questions.id));
}

export async function createQuestion(db: DB, data: {
  text: string;
  type: "multi" | "single" | "true_false" | "fill_blank";
}) {
  const [created] = await db.insert(questions).values(data).returning();
  return created;
}

export async function getQuestionById(db: DB, id: number) {
  const [row] = await db.select().from(questions).where(eq(questions.id, id));
  return row ?? null;
}

export async function updateQuestion(db: DB, id: number, data: {
  text?: string;
  type?: "multi" | "single" | "true_false" | "fill_blank";
}) {
  const [updated] = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
  return updated ?? null;
}

export async function deleteQuestion(db: DB, id: number) {
  const [deleted] = await db.delete(questions).where(eq(questions.id, id)).returning();
  return deleted ?? null;
}

export async function getQuestionsByIds(db: DB, ids: number[]): Promise<Array<Question>> {
  if (ids.length === 0) return [];
  const rows = await db.select().from(questions).where(inArray(questions.id, ids));
  return rows;
}


