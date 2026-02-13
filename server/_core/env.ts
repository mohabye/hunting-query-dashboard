import "dotenv/config";

export const ENV = {
  cookieSecret: process.env.JWT_SECRET || "default-secret-key-change-me",
  databaseUrl: process.env.DATABASE_URL || "",
  isProduction: process.env.NODE_ENV === "production",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
};
