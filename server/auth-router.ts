import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Demo credentials: admin/admin123
      if ((input.username === "admin" || input.username === "admin@example.com") && input.password === "admin123") {
        // Get or create admin user
        let adminUser = await db
          .select()
          .from(users)
          .where(eq(users.email, "admin@example.com"))
          .limit(1);

        if (!adminUser[0]) {
          await db.insert(users).values({
            openId: "admin_local",
            name: "Admin User",
            email: "admin@example.com",
            loginMethod: "local",
            role: "admin",
          });
          adminUser = await db
            .select()
            .from(users)
            .where(eq(users.email, "admin@example.com"))
            .limit(1);
        }

        return {
          success: true,
          user: adminUser[0],
          message: "Login successful",
        };
      }

      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
    }),
});

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
