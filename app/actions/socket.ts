"use server";

import { postJson } from "@/lib/api";
import type { IssuedSocketToken } from "@/lib/socket";
import { requireAccessToken } from "@/lib/session";

export type IssueResult = { ok: true; issued: IssuedSocketToken } | { ok: false; detail: string };

/** Creates the business's socket token, or rotates it (the previous token stops working immediately). */
export async function issueSocketToken(): Promise<IssueResult> {
  const token = await requireAccessToken();
  const result = await postJson<IssuedSocketToken>("/v1/socket/token", {}, token);
  return result.ok ? { ok: true, issued: result.data } : { ok: false, detail: result.detail };
}
