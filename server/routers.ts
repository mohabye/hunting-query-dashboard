import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as queriesDb from "./queries";
import { TRPCError } from "@trpc/server";
import { generateQueryWithAI, convertQueryWithAI } from "./ai-service";
import { createSessionToken } from "./_core/sdk";
import { getDb, getUserByEmail } from "./db";
import { users } from "../drizzle/schema";

// MITRE ATT&CK Tactics
export const MITRE_TACTICS = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

// Sample MITRE Techniques
export const MITRE_TECHNIQUES = [
  { id: "T1595", name: "Active Scanning", tactic: "Reconnaissance" },
  { id: "T1592", name: "Gather Victim Host Information", tactic: "Reconnaissance" },
  { id: "T1589", name: "Gather Victim Identity Information", tactic: "Reconnaissance" },
  { id: "T1059", name: "Command and Scripting Interpreter", tactic: "Execution" },
  { id: "T1086", name: "PowerShell", tactic: "Execution" },
  { id: "T1053", name: "Scheduled Task/Job", tactic: "Execution" },
  { id: "T1047", name: "Windows Management Instrumentation", tactic: "Execution" },
  { id: "T1055", name: "Process Injection", tactic: "Privilege Escalation" },
  { id: "T1548", name: "Abuse Elevation Control Mechanism", tactic: "Privilege Escalation" },
  { id: "T1134", name: "Access Token Manipulation", tactic: "Defense Evasion" },
  { id: "T1197", name: "BITS Jobs", tactic: "Defense Evasion" },
  { id: "T1110", name: "Brute Force", tactic: "Credential Access" },
  { id: "T1187", name: "Forced Authentication", tactic: "Credential Access" },
  { id: "T1040", name: "Network Sniffing", tactic: "Credential Access" },
  { id: "T1083", name: "File and Directory Discovery", tactic: "Discovery" },
  { id: "T1135", name: "Network Share Discovery", tactic: "Discovery" },
  { id: "T1570", name: "Lateral Tool Transfer", tactic: "Lateral Movement" },
  { id: "T1123", name: "Audio Capture", tactic: "Collection" },
  { id: "T1119", name: "Automated Exfiltration", tactic: "Exfiltration" },
];

export const appRouter = router({
  auth: router({
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        // Demo credentials: admin/admin123
        if ((input.username === "admin" || input.username === "admin@example.com") && input.password === "admin123") {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          let user = await getUserByEmail("admin@example.com");

          if (!user) {
            // Create admin user if it doesn't exist
            await db.insert(users).values({
              openId: "admin_local",
              name: "Admin User",
              email: "admin@example.com",
              loginMethod: "local",
              role: "admin",
            });
            user = await getUserByEmail("admin@example.com");
          }

          if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create/retrieve user" });

          const token = await createSessionToken(user.openId, user.name || "Admin");
          const cookieOptions = getSessionCookieOptions(ctx.req);
          
          ctx.res.cookie(COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          });

          return {
            success: true,
            message: "Login successful",
            user,
          };
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }),

    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  mitre: router({
    tactics: publicProcedure.query(() => MITRE_TACTICS),
    techniques: publicProcedure.query(() => MITRE_TECHNIQUES),
  }),

  queries: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return queriesDb.listQueries(ctx.user.id, input?.category);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        techniqueId: z.string(),
        techniqueName: z.string(),
        procedure: z.string().optional(),
        threatLevel: z.enum(["critical", "high", "medium", "low"]),
        dataSourcesCustom: z.string(),
        eventIdsCustom: z.string(),
        querySyntax: z.string().optional(),
        enabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return queriesDb.createQuery(ctx.user.id, {
          name: input.name,
          description: input.description,
          category: input.category,
          techniqueId: input.techniqueId,
          techniqueName: input.techniqueName,
          procedure: input.procedure,
          threatLevel: input.threatLevel,
          dataSources: input.dataSourcesCustom.split(",").map((s: string) => s.trim()),
          querySyntax: input.querySyntax,
          eventIds: input.eventIdsCustom.split(",").map((s: string) => s.trim()),
          enabled: input.enabled ?? true,
          detections: 0,
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return queriesDb.getQueryById(ctx.user.id, input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        threatLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
        enabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;
        return queriesDb.updateQuery(ctx.user.id, id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return queriesDb.deleteQuery(ctx.user.id, input.id);
      }),

    getTechniqueCoverage: publicProcedure
      .input(z.object({ techniqueId: z.string() }))
      .query(async ({ input }) => {
        return queriesDb.getQueriesByTechnique(input.techniqueId);
      }),
  }),

  ai: router({
    generateQuery: protectedProcedure
      .input(z.object({
        techniqueId: z.string(),
        techniqueName: z.string(),
        description: z.string(),
        category: z.string(),
        threatLevel: z.enum(["critical", "high", "medium", "low"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const generatedQuery = await generateQueryWithAI(input);
          return {
            success: true,
            query: generatedQuery,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `AI generation failed: ${(error as Error).message}`,
          });
        }
      }),

    convertQuery: protectedProcedure
      .input(z.object({
        queryText: z.string(),
        techniqueId: z.string(),
        techniqueName: z.string(),
        targetPlatform: z.enum(["ELK", "CrowdStrike", "Splunk"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const convertedQuery = await convertQueryWithAI(input);
          return {
            success: true,
            query: convertedQuery,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `AI conversion failed: ${(error as Error).message}`,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
