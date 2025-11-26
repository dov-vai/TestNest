import { DB } from '@/db/client';
import { topics } from '@/db/schema';
import { eq, asc, or, and } from 'drizzle-orm';

export type Pagination = { limit: number; offset: number };

export async function listTopics(
  db: DB,
  { limit, offset }: Pagination,
  userId?: number,
  isAdmin?: boolean,
  creatorId?: number // Add this parameter
) {
  let whereClause;

  if (creatorId) {
    // Strictly filter by who created it (for "My Topics" dashboard)
    whereClause = eq(topics.userId, creatorId);
  } else if (isAdmin) {
    // Admins see everything
    whereClause = undefined;
  } else if (userId) {
    // Authenticated users: Public + Their Private
    whereClause = or(eq(topics.isPrivate, false), and(eq(topics.userId, userId), eq(topics.isPrivate, true)));
  } else {
    // Public only
    whereClause = eq(topics.isPrivate, false);
  }

  const query = db.select().from(topics);

  return whereClause
    ? query.where(whereClause).limit(limit).offset(offset).orderBy(asc(topics.id))
    : query.limit(limit).offset(offset).orderBy(asc(topics.id));
}

export async function createTopic(
  db: DB,
  data: {
    title: string;
    description?: string | null;
    userId: number;
    isPrivate?: boolean;
  }
) {
  const [created] = await db.insert(topics).values(data).returning();
  return created;
}

export async function getTopicById(db: DB, id: number) {
  const [row] = await db.select().from(topics).where(eq(topics.id, id));
  return row ?? null;
}

export async function updateTopic(
  db: DB,
  id: number,
  data: {
    title?: string;
    description?: string | null;
    isPrivate?: boolean;
  }
) {
  const [updated] = await db.update(topics).set(data).where(eq(topics.id, id)).returning();
  return updated ?? null;
}

export async function deleteTopic(db: DB, id: number) {
  const [deleted] = await db.delete(topics).where(eq(topics.id, id)).returning();
  return deleted ?? null;
}
