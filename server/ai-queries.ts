import { invokeLLM } from "./_core/llm";
import * as queriesDb from "./queries";
import { huntingQueries } from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

/**
 * Generate hunting query using AI (ChatGPT)
 */
export async function generateQueryWithAI(
  userId: number,
  userMessage: string,
  techniqueId: string,
  techniqueName: string,
  category: string,
  threatLevel: "critical" | "high" | "medium" | "low"
) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert threat hunting query generator. Generate a comprehensive threat hunting query based on the user's request. Return a JSON object with the following structure:
{
  "queryName": "descriptive name for the query",
  "description": "what this query detects",
  "querySyntax": "the actual query code",
  "eventIds": ["comma", "separated", "event", "ids"],
  "dataSources": ["recommended", "data", "sources"],
  "procedure": "related MITRE procedure if any"
}`,
        },
        {
          role: "user",
          content: `Generate a threat hunting query for:
- Technique ID: ${techniqueId}
- Technique Name: ${techniqueName}
- Category: ${category}
- Threat Level: ${threatLevel}
- User Request: ${userMessage}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "hunting_query",
          strict: true,
          schema: {
            type: "object",
            properties: {
              queryName: { type: "string" },
              description: { type: "string" },
              querySyntax: { type: "string" },
              eventIds: { type: "array", items: { type: "string" } },
              dataSources: { type: "array", items: { type: "string" } },
              procedure: { type: "string" },
            },
            required: ["queryName", "description", "querySyntax"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("No response from AI");

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsedQuery = JSON.parse(contentStr);

    // Store the AI-generated query in database
    const result = await queriesDb.createQuery(userId, {
      name: parsedQuery.queryName,
      description: parsedQuery.description,
      category,
      techniqueId,
      techniqueName,
      procedure: parsedQuery.procedure || "",
      threatLevel,
      dataSources: parsedQuery.dataSources || [],
      querySyntax: parsedQuery.querySyntax,
      eventIds: parsedQuery.eventIds || [],
      enabled: true,
      detections: 0,
    });

    return {
      success: true,
      query: parsedQuery,
      message: "Query generated and stored successfully",
    };
  } catch (error) {
    console.error("AI query generation error:", error);
    throw error;
  }
}

/**
 * Convert query to different platform formats
 */
export async function convertQueryToPlatform(
  queryId: number,
  platform: "elk" | "crowdstrike" | "splunk" | "sentinel" | "sumologic"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the original query
  const query = await db
    .select()
    .from(huntingQueries)
    .where(eq(huntingQueries.id, queryId))
    .limit(1);

  if (!query[0]) throw new Error("Query not found");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert in converting threat hunting queries between different security platforms. Convert the provided query to the specified platform format, maintaining the same detection logic and intent.`,
        },
        {
          role: "user",
          content: `Convert this hunting query to ${platform.toUpperCase()} format:

Query Name: ${query[0].name}
Description: ${query[0].description}
Original Query: ${query[0].querySyntax}
Technique: ${query[0].techniqueId} - ${query[0].techniqueName}

Return ONLY the converted query code without explanations.`,
        },
      ],
    });

    const content = response.choices[0]?.message.content || "";
    const convertedQuery = typeof content === 'string' ? content : JSON.stringify(content);

    return {
      platform,
      convertedQuery,
      originalQuery: query[0].querySyntax,
    };
  } catch (error) {
    console.error("Query conversion error:", error);
    throw error;
  }
}

/**
 * Bulk convert queries to multiple platforms
 */
export async function bulkConvertQueries(
  queryIds: number[],
  platforms: string[]
) {
  const results = [];

  for (const queryId of queryIds) {
    for (const platform of platforms) {
      try {
        const converted = await convertQueryToPlatform(
          queryId,
          platform as any
        );
        results.push({
          queryId,
          ...converted,
          status: "success",
        });
      } catch (error) {
        results.push({
          queryId,
          platform,
          status: "error",
          error: (error as Error).message,
        });
      }
    }
  }

  return results;
}

/**
 * Enrich query with AI-generated insights
 */
export async function enrichQueryWithAI(queryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const query = await db
    .select()
    .from(huntingQueries)
    .where(eq(huntingQueries.id, queryId))
    .limit(1);

  if (!query[0]) throw new Error("Query not found");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a threat intelligence expert. Analyze the provided hunting query and provide enrichment insights in JSON format.`,
        },
        {
          role: "user",
          content: `Analyze and enrich this hunting query:

Name: ${query[0].name}
Description: ${query[0].description}
Technique: ${query[0].techniqueId} - ${query[0].techniqueName}
Query: ${query[0].querySyntax}

Provide insights on:
1. Related attack patterns
2. False positive indicators
3. Recommended alert thresholds
4. Detection gaps`,
        },
      ],
    });

    return {
      queryId,
      enrichment: typeof response.choices[0]?.message.content === 'string' 
        ? response.choices[0]?.message.content 
        : JSON.stringify(response.choices[0]?.message.content),
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Query enrichment error:", error);
    throw error;
  }
}
