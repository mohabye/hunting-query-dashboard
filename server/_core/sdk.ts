import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";
import { getUserByOpenId } from "../db";

const SECRET = new TextEncoder().encode(ENV.cookieSecret);

export async function createSessionToken(openId: string, name: string) {
  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { openId: string; name: string };
  } catch (error) {
    return null;
  }
}

export async function authenticateRequest(req: any) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const token = cookies.split("; ").find((c: string) => c.startsWith("manus-session="))?.split("=")[1];
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await getUserByOpenId(payload.openId);
  return user || null;
}
