import "server-only";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

export type TokenResponse = {
  business_id: string;
  user_id: string;
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; detail: string; fieldErrors: Record<string, string> };

type ValidationIssue = { loc?: (string | number)[]; msg?: string };

export async function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      detail: "Can't reach the server. Please try again in a moment.",
      fieldErrors: {},
    };
  }

  const payload: unknown = await response.json().catch(() => null);
  if (response.ok) {
    return { ok: true, data: payload as T };
  }
  return { ok: false, status: response.status, ...parseError(payload, response.status) };
}

function parseError(payload: unknown, status: number): { detail: string; fieldErrors: Record<string, string> } {
  const detail = (payload as { detail?: unknown } | null)?.detail;

  if (typeof detail === "string") {
    return { detail, fieldErrors: {} };
  }

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of detail as ValidationIssue[]) {
      const field = issue.loc?.at(-1);
      if (typeof field === "string" && issue.msg && !(field in fieldErrors)) {
        fieldErrors[field] = issue.msg;
      }
    }
    return { detail: "Please fix the highlighted fields.", fieldErrors };
  }

  return { detail: `Something went wrong (HTTP ${status}). Please try again.`, fieldErrors: {} };
}
