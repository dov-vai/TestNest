import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../client';
import { users, refreshTokens } from '../schema';
import { hashPassword } from '@/lib/auth';

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result[0] || null;
}

export async function findUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result[0] || null;
}

export async function getAllUsers() {
  return db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users);
}

export async function createUser(data: { email: string; password: string; name?: string }) {
  const passwordHash = await hashPassword(data.password);

  const result = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      name: data.name,
    })
    .returning();

  return result[0];
}

type UpdateUserData = {
  name?: string;
  email?: string;
  passwordHash?: string;
  isActive?: boolean;
  role?: 'user' | 'admin';
};

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
    role?: 'user' | 'admin';
  }
) {
  const updateData: UpdateUserData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  if (data.role !== undefined) {
    updateData.role = data.role;
  }

  const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();

  return result[0] || null;
}

export async function deleteUser(id: number) {
  const result = await db.delete(users).where(eq(users.id, id)).returning();

  return result[0] || null;
}

export async function createRefreshToken(data: { userId: number; token: string; expiresAt: Date }) {
  const result = await db.insert(refreshTokens).values(data).returning();

  return result[0];
}

export async function findRefreshToken(token: string) {
  const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1);

  return result[0] || null;
}

export async function findUserRefreshTokens(userId: number) {
  return db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

export async function revokeRefreshToken(tokenId: number, replacedByToken?: string) {
  const result = await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
      replacedByToken,
    })
    .where(eq(refreshTokens.id, tokenId))
    .returning();

  return result[0] || null;
}

export async function revokeAllUserRefreshTokens(userId: number) {
  return db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
    })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

export async function cleanupExpiredTokens() {
  return db.delete(refreshTokens).where(eq(refreshTokens.expiresAt, new Date()));
}
