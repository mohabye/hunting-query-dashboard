import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authenticateRequest } from "./sdk";

export async function createContext(opts: CreateExpressContextOptions) {
  const user = await authenticateRequest(opts.req);
  
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;
