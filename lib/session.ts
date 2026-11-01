import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import type { TokenResponse } from "@/lib/api";

export const SESSION_COOKIE = "session";

export type Session = {
  userId: string;
  businessId: string;
  expiresAt: number;
};

export async function createSession(token: TokenResponse) {
  (await cookies()).set(SESSION_COOKIE, token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: token.expires_in,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // parseSession compares against the current time, which must not run during prerendering.
  await connection();
  return parseSession(token);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Reads the claims of the backend access token without verifying its signature
 * (the frontend does not hold the JWT secret). Use it for routing and display only;
 * the backend verifies the token on every API call.
 */
export function parseSession(token: string | undefined): Session | null {
  const payload = token?.split(".")[1];
  if (!payload) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const { sub, business_id: businessId, exp } = claims;
    if (typeof sub !== "string" || typeof businessId !== "string" || typeof exp !== "number") return null;

    const expiresAt = exp * 1000;
    if (expiresAt <= Date.now()) return null;
    return { userId: sub, businessId, expiresAt };
  } catch {
    return null;
  }
}
