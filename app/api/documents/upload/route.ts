import { cookies } from "next/headers";

import { API_URL } from "@/lib/api";
import { parseSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ detail: "Cross-origin uploads are not allowed" }, { status: 403 });
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !parseSession(token)) {
    return Response.json({ detail: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type");
  const contentLength = request.headers.get("content-length");
  if (!contentType?.startsWith("multipart/form-data") || !contentLength || !request.body) {
    return Response.json({ detail: "Expected a multipart upload with a Content-Length" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/v1/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
        "Content-Length": contentLength,
      },
      body: request.body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
  } catch {
    return Response.json({ detail: "Can't reach the server. Please try again in a moment." }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
