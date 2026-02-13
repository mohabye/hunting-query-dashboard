import OpenAI from "openai";
import { ENV } from "./env";

const openai = new OpenAI({
  apiKey: ENV.openaiApiKey,
});

export async function invokeLLM(params: {
  messages: any[];
  model?: string;
}) {
  if (!ENV.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await openai.chat.completions.create({
    model: params.model || "gpt-4o",
    messages: params.messages,
  });

  return response;
}
