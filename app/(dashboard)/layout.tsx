import Link from "next/link";
import type { ReactNode } from "react";

import { logout } from "@/app/actions/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas-soft font-light text-ink">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-normal tracking-[-0.2px] text-ink">
            RAG Vector Engine
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-full border border-primary bg-canvas px-4 py-2 text-sm leading-none font-normal text-primary transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-12">{children}</main>
    </div>
  );
}
