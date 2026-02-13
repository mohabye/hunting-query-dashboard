import { invokeLLM } from "./_core/llm";

export interface QueryGenerationRequest {
  techniqueId: string;
  techniqueName: string;
  description: string;
  category: string;
  threatLevel: string;
}

export interface QueryConversionRequest {
  queryText: string;
  techniqueId: string;
  techniqueName: string;
  targetPlatform: "ELK" | "CrowdStrike" | "Splunk";
}

export async function generateQueryWithAI(request: QueryGenerationRequest): Promise<string> {
  const prompt = `You are a cybersecurity expert specializing in threat hunting. Generate a professional hunting query for the following:

Technique ID: ${request.techniqueId}
Technique Name: ${request.techniqueName}
MITRE Tactic: ${request.category}
Threat Level: ${request.threatLevel}
Hunting Objective: ${request.description}

Generate a comprehensive hunting query that includes:
1. Query syntax suitable for SIEM tools (Splunk/ELK format)
2. Relevant event IDs and data sources
3. Detection logic explanation
4. Potential false positives and tuning recommendations

Format the response as a structured query with clear sections.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert threat hunting query generator. Generate detailed, practical hunting queries for security teams.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    return content;
  } catch (error) {
    console.error("AI Query Generation Error:", error);
    throw new Error(`Failed to generate query: ${(error as Error).message}`);
  }
}

export async function convertQueryWithAI(request: QueryConversionRequest): Promise<string> {
  const platformGuides = {
    ELK: "Elasticsearch Query Language (EQL) or Kibana Query Language (KQL)",
    CrowdStrike: "CrowdStrike Falcon Query Language (FQL)",
    Splunk: "Splunk Query Language (SPL)",
  };

  const prompt = `You are a cybersecurity expert specializing in query translation. Convert the following hunting query to ${request.targetPlatform} format.

Original Query:
${request.queryText}

Technique: ${request.techniqueId} - ${request.techniqueName}

Target Platform: ${request.targetPlatform} (${platformGuides[request.targetPlatform]})

Provide:
1. Converted query in the target platform's syntax
2. Explanation of any syntax differences
3. Data source mappings
4. Recommended filters and aggregations
5. Performance considerations

Format the response clearly with sections.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert in security query languages. Convert hunting queries between different SIEM platforms accurately.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No response from AI");
    }

    return content;
  } catch (error) {
    console.error("AI Query Conversion Error:", error);
    throw new Error(`Failed to convert query: ${(error as Error).message}`);
  }
}
