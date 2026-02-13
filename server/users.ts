import { eq, and } from "drizzle-orm";
import { users, userRoles, permissions, rolePermissions, auditLogs, InsertAuditLog } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get user by ID with role information
 */
export async function getUserWithRole(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

/**
 * Get user permissions
 */
export async function getUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await getUserWithRole(userId);
  if (!user) return [];

  const perms = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, user.role as any));

  return perms.map(p => p.name);
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId: number, permissionName: string): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.includes(permissionName);
}

/**
 * Log user action for audit trail
 */
export async function logAuditAction(
  userId: number,
  action: string,
  entityType: string,
  entityId: number | null,
  changes: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(auditLogs).values({
    userId,
    action,
    entityType,
    entityId,
    changes,
    ipAddress,
    userAgent,
  });
}

/**
 * Get audit logs for specific entity
 */
export async function getAuditLogs(entityType: string, entityId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(auditLogs.entityType, entityType)];
  if (entityId) {
    conditions.push(eq(auditLogs.entityId, entityId));
  }

  return db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(auditLogs.createdAt);
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(auditLogs.createdAt);

  return {
    totalActions: logs.length,
    lastActivity: logs[logs.length - 1]?.createdAt,
    actionsByType: logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
