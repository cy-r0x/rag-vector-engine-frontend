import { NextResponse, type NextRequest } from "next/server";

import { parseSession, SESSION_COOKIE } from "@/lib/session";

const GUEST_ONLY_PATHS = new Set(["/login", "/register"]);

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = parseSession(token);
  const isGuestOnly = GUEST_ONLY_PATHS.has(request.nextUrl.pathname);

  let response: NextResponse;
  if (session && isGuestOnly) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else if (!session && !isGuestOnly) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else {
    response = NextResponse.next();
  }

  if (token && !session) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
