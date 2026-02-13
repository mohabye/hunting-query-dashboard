import { eq, and } from "drizzle-orm";
import { huntingQueries, InsertHuntingQuery } from "../drizzle/schema";
import { getDb } from "./db";

export async function createQuery(userId: number, data: Omit<InsertHuntingQuery, 'userId' | 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(huntingQueries).values({
    ...data,
    userId,
  });

  return result;
}

export async function listQueries(userId: number, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(huntingQueries.userId, userId)];
  if (category) {
    conditions.push(eq(huntingQueries.category, category));
  }

  const results = await db
    .select()
    .from(huntingQueries)
    .where(and(...conditions))
    .orderBy(huntingQueries.createdAt);

  return results;
}

export async function getQueryById(userId: number, queryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(huntingQueries)
    .where(and(
      eq(huntingQueries.id, queryId),
      eq(huntingQueries.userId, userId)
    ))
    .limit(1);

  return result[0];
}

export async function updateQuery(userId: number, queryId: number, data: Partial<InsertHuntingQuery>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(huntingQueries)
    .set(data)
    .where(and(
      eq(huntingQueries.id, queryId),
      eq(huntingQueries.userId, userId)
    ));

  return result;
}

export async function deleteQuery(userId: number, queryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .delete(huntingQueries)
    .where(and(
      eq(huntingQueries.id, queryId),
      eq(huntingQueries.userId, userId)
    ));

  return result;
}

export async function getQueriesByTechnique(techniqueId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(huntingQueries)
    .where(eq(huntingQueries.techniqueId, techniqueId));

  return results;
}
