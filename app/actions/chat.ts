"use server";

import { API_URL, postJson } from "@/lib/api";
import { requireAccessToken } from "@/lib/session";

type ChatTicket = { ticket: string; business_id: string; expires_in: number; ws_path: string };

export type ChatConnection = { ok: true; url: string } | { ok: false; detail: string };

const CHAT_WS_URL = process.env.CHAT_WS_URL ?? API_URL.replace(/^http/, "ws");

/**
 * A WebSocket URL for the signed-in business's chat, carrying a short-lived, chat-only ticket
 * (the access token itself stays in the httpOnly cookie).
 */
export async function createChatConnection(): Promise<ChatConnection> {
  const token = await requireAccessToken();
  const result = await postJson<ChatTicket>("/v1/chat/ticket", {}, token);
  if (!result.ok) {
    return { ok: false, detail: result.detail };
  }
  const { ws_path, ticket } = result.data;
  return { ok: true, url: `${CHAT_WS_URL}${ws_path}?token=${encodeURIComponent(ticket)}` };
}
