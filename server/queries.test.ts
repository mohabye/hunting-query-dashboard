import { describe, it, expect, vi } from "vitest";
import * as queriesDb from "./queries";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => ({
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ id: 1 })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve({ affectedRows: 1 })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ affectedRows: 1 })),
    })),
  })),
}));

const mockUserId = 1;
const mockQueryData = {
  name: "Test Query",
  description: "Test hunting query",
  category: "PowerShell Analysis",
  techniqueId: "T1059",
  techniqueName: "Command Line Interface",
  procedure: "Execution",
  threatLevel: "high" as const,
  dataSources: ["ETW", "Sysmon"],
  querySyntax: "SELECT * FROM logs WHERE ...",
  eventIds: ["4688", "1"],
  enabled: true,
  detections: 0,
};

describe("Queries Database Functions", () => {
  describe("createQuery", () => {
    it("should create a new hunting query", async () => {
      const result = await queriesDb.createQuery(mockUserId, mockQueryData);
      expect(result).toBeDefined();
    });
  });

  describe("listQueries", () => {
    it("should return list of queries for user", async () => {
      const queries = await queriesDb.listQueries(mockUserId);
      expect(Array.isArray(queries)).toBe(true);
    });
  });

  describe("getQueryById", () => {
    it("should return undefined for non-existent query", async () => {
      const query = await queriesDb.getQueryById(mockUserId, 99999);
      expect(query).toBeUndefined();
    });
  });

  describe("updateQuery", () => {
    it("should update query", async () => {
      const result = await queriesDb.updateQuery(mockUserId, 1, {
        name: "Updated Name",
      });
      expect(result).toBeDefined();
    });
  });

  describe("deleteQuery", () => {
    it("should delete query", async () => {
      const result = await queriesDb.deleteQuery(mockUserId, 1);
      expect(result).toBeDefined();
    });
  });
});
