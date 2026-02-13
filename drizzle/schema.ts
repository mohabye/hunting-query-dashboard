import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Hunting Queries Table
 * Stores threat hunting queries with MITRE ATT&CK mapping
 */
export const huntingQueries = mysqlTable("hunting_queries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  techniqueId: varchar("techniqueId", { length: 50 }).notNull(),
  techniqueName: varchar("techniqueName", { length: 255 }).notNull(),
  procedure: text("procedure"),
  threatLevel: mysqlEnum("threatLevel", ["critical", "high", "medium", "low"]).notNull(),
  dataSources: json("dataSources").$type<string[]>().notNull(),
  querySyntax: text("querySyntax"),
  eventIds: json("eventIds").$type<string[]>().notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  detections: int("detections").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HuntingQuery = typeof huntingQueries.$inferSelect;
export type InsertHuntingQuery = typeof huntingQueries.$inferInsert;

/**
 * Hunt Engagements Table
 * Tracks threat hunting campaigns
 */
export const huntEngagements = mysqlTable("hunt_engagements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active").notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  proceduresCovered: json("proceduresCovered").$type<string[]>().notNull(),
  totalQueries: int("totalQueries").default(0).notNull(),
  detectionsFound: int("detectionsFound").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HuntEngagement = typeof huntEngagements.$inferSelect;
export type InsertHuntEngagement = typeof huntEngagements.$inferInsert;

/**
 * Data Sources Table
 * Tracks available data sources for queries
 */
export const dataSources = mysqlTable("data_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["ETW", "Sysmon", "Network", "Registry", "File"]).notNull(),
  description: text("description"),
  provider: varchar("provider", { length: 255 }),
  eventIds: json("eventIds").$type<string[]>().notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;

/**
 * User Roles Table
 * Defines available roles in the system
 */
export const userRoles = mysqlTable("user_roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

/**
 * Permissions Table
 * Defines granular permissions
 */
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

/**
 * Role Permissions Junction Table
 * Maps roles to permissions
 */
export const rolePermissions = mysqlTable("role_permissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").notNull(),
  permissionId: int("permissionId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

/**
 * Audit Log Table
 * Tracks all user actions for compliance and security
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  changes: json("changes").$type<Record<string, any>>().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Query Versions Table
 * Tracks versions and changes to queries
 */
export const queryVersions = mysqlTable("query_versions", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId").notNull(),
  version: int("version").notNull(),
  content: text("content").notNull(),
  changedBy: int("changedBy").notNull(),
  changeDescription: text("changeDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QueryVersion = typeof queryVersions.$inferSelect;
export type InsertQueryVersion = typeof queryVersions.$inferInsert;

/**
 * Query Conversions Table
 * Stores converted queries for different platforms
 */
export const queryConversions = mysqlTable("query_conversions", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  convertedQuery: text("convertedQuery").notNull(),
  convertedBy: varchar("convertedBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QueryConversion = typeof queryConversions.$inferSelect;
export type InsertQueryConversion = typeof queryConversions.$inferInsert;
