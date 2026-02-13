import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import "dotenv/config";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      _db = drizzle(connection, { schema, mode: "default" });
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.openId, openId),
  });

  return result;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  return result;
}
